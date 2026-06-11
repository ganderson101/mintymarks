"""Progress router — aggregate topic performance per subject across all sessions."""
from collections import defaultdict
from datetime import date as _date, datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from fastapi import APIRouter, Depends, HTTPException, Query, status

from database import get_conn
from schemas import (
    DayActivity, LevelRollup, StatsOverview, StreakStats,
    SubjectRollup, TotalStats, TopicProgress, TopicRollup,
    SRSTopicOut, SRSUpdateIn,
)
from auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])

# Recent-mastery constants (MIN-62 / spec paperclip/specs/min59-stats-model.md)
MASTERY_WINDOW          = 10    # recent attempts per topic for the mastery %
MASTERY_BADGE_WINDOW    = 5     # min recent attempts to earn "Mastered ⭐"
MASTERY_BADGE_THRESHOLD = 0.90  # recent accuracy threshold for "Mastered ⭐"
MIN_ATTEMPTS_TO_JUDGE   = 3     # below this → "Just started"
STRONG_THRESHOLD        = 0.67  # "Building it" ↔ "Strong" boundary


def _laplace_weakness(correct: int, attempts: int) -> float:
    """Laplace (add-one) smoothed weakness score.

    smoothed_accuracy = (correct + 1) / (attempts + 2)
    weakness          = 1 - smoothed_accuracy

    Prevents single attempts from registering as 0% or 100%.
    """
    if not attempts:
        return 1.0
    return round(1.0 - (correct + 1) / (attempts + 2), 4)


def _mastery_state(recent_correct: int, recent_attempts: int) -> str:
    """Return the mastery-ladder label for a topic's recent window."""
    if recent_attempts == 0:
        return "Not started"
    if recent_attempts < MIN_ATTEMPTS_TO_JUDGE:
        return "Just started"
    mastery = recent_correct / recent_attempts
    if recent_attempts >= MASTERY_BADGE_WINDOW and mastery >= MASTERY_BADGE_THRESHOLD:
        return "Mastered ⭐"
    if mastery >= STRONG_THRESHOLD:
        return "Strong"
    return "Building it"


def _utcnow_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# -- Topic progress ------------------------------------------------------------

@router.get("/topics", response_model=list[TopicProgress])
def topic_progress(
    subject: str = Query(default="maths", pattern="^(maths|physics|chemistry|biology)$"),
    level: str | None = Query(default=None),
    user=Depends(get_current_user),
):
    """Aggregate per-category performance for the user.

    Returns Laplace-smoothed weakness so the frontend engine and display use
    consistent values. Optional `level` filter scopes results to a single level
    (used for seeding cross-session performance in adaptive mode).
    """
    params = [user["id"], subject]
    level_clause = ""
    if level:
        level_clause = "AND s.level = ?"
        params.append(level)

    with get_conn() as conn:
        rows = conn.execute(
            f"""WITH ranked AS (
                    SELECT
                        a.category,
                        a.subject,
                        a.is_correct,
                        a.used_help,
                        a.time_taken_ms,
                        ROW_NUMBER() OVER (
                            PARTITION BY a.category, a.subject
                            ORDER BY a.id DESC
                        ) AS rn
                    FROM answers a
                    JOIN sessions s ON s.id = a.session_id
                    WHERE s.user_id = ? AND a.subject = ? {level_clause}
                )
                SELECT
                    category,
                    subject,
                    COUNT(*)                                                    AS attempts,
                    SUM(is_correct)                                             AS correct,
                    SUM(CASE WHEN is_correct = 1 AND used_help = 0
                             THEN 1 ELSE 0 END)                                AS correct_unaided,
                    AVG(CASE WHEN time_taken_ms > 0 THEN time_taken_ms END)
                        / 1000.0                                                AS avg_time_sec,
                    SUM(CASE WHEN rn <= {MASTERY_WINDOW} THEN 1    ELSE 0 END) AS recent_attempts,
                    SUM(CASE WHEN rn <= {MASTERY_WINDOW} THEN is_correct
                                                         ELSE 0 END)           AS recent_correct
                FROM ranked
                GROUP BY category, subject
                ORDER BY category""",
            params,
        ).fetchall()

    result = []
    for r in rows:
        attempts        = r["attempts"]
        correct         = r["correct"]         or 0
        correct_unaided = r["correct_unaided"] or 0
        recent_attempts = r["recent_attempts"] or 0
        recent_correct  = r["recent_correct"]  or 0
        recent_mastery  = round(recent_correct / recent_attempts, 4) if recent_attempts else 0.0
        result.append({
            "category":       r["category"],
            "subject":        r["subject"],
            "attempts":       attempts,
            "correct":        correct,
            # Assisted-correct counts as weak: use unaided-correct for weakness score.
            "weakness":       _laplace_weakness(correct_unaided, attempts),
            "avgTimeSec":     round(r["avg_time_sec"], 1) if r["avg_time_sec"] is not None else None,
            "recentAttempts": recent_attempts,
            "recentCorrect":  recent_correct,
            "recentMastery":  recent_mastery,
            "masteryState":   _mastery_state(recent_correct, recent_attempts),
        })
    return result


# -- Spaced repetition ---------------------------------------------------------

@router.get("/srs", response_model=list[SRSTopicOut])
def get_srs(
    subject: str = Query(default="maths", pattern="^(maths|physics|chemistry|biology)$"),
    user=Depends(get_current_user),
):
    """Return all SRS records for the user+subject, with an isDue flag.

    Topics not yet in the table are absent -- the frontend treats absence as
    'due immediately' (new topic = always worth seeing).
    """
    now = _utcnow_iso()
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT category, subject, interval_days, ease_factor, next_due, last_reviewed
               FROM topic_srs
               WHERE user_id = ? AND subject = ?
               ORDER BY next_due""",
            (user["id"], subject),
        ).fetchall()
    return [
        {
            "category":     r["category"],
            "subject":      r["subject"],
            "intervalDays": r["interval_days"],
            "easeFactor":   r["ease_factor"],
            "nextDue":      r["next_due"],
            "lastReviewed": r["last_reviewed"],
            "isDue":        r["next_due"] <= now,
        }
        for r in rows
    ]


@router.post("/srs", status_code=status.HTTP_200_OK)
def update_srs(body: SRSUpdateIn, user=Depends(get_current_user)):
    """Update SRS state for a single topic after a session.

    SM-2 simplified for topic-level scheduling:
    - Maps accuracy (0-1) to SM-2 quality scale (0-5).
    - Timing signal: fast answers (<8 s avg) boost quality; slow (>20 s) reduce it.
    - Quality < 3 -> reset interval to 1 day, reduce ease factor.
    - Quality >= 3 -> grow interval by ease factor, adjust ease factor.
    """
    with get_conn() as conn:
        row = conn.execute(
            """SELECT interval_days, ease_factor
               FROM topic_srs
               WHERE user_id = ? AND subject = ? AND category = ?""",
            (user["id"], body.subject, body.category),
        ).fetchone()

    interval    = row["interval_days"] if row else 1.0
    ease_factor = row["ease_factor"]   if row else 2.5

    quality = body.accuracy * 5.0

    if body.avgTimeSec is not None:
        if body.avgTimeSec < 8:
            quality = min(5.0, quality + 0.3)
        elif body.avgTimeSec > 20:
            quality = max(0.0, quality - 0.5)

    if quality < 3.0:
        new_interval    = 1.0
        new_ease_factor = max(1.3, ease_factor - 0.2)
    else:
        new_interval    = max(1.0, round(interval * ease_factor))
        new_ease_factor = max(1.3, ease_factor + 0.1 - (5.0 - quality) * 0.08)

    now      = _utcnow_iso()
    next_due = (datetime.now(timezone.utc) + timedelta(days=new_interval)).strftime("%Y-%m-%dT%H:%M:%SZ")

    with get_conn() as conn:
        conn.execute(
            """INSERT INTO topic_srs
                   (user_id, subject, category, interval_days, ease_factor, next_due, last_reviewed)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(user_id, subject, category) DO UPDATE SET
                   interval_days = excluded.interval_days,
                   ease_factor   = excluded.ease_factor,
                   next_due      = excluded.next_due,
                   last_reviewed = excluded.last_reviewed""",
            (user["id"], body.subject, body.category,
             new_interval, round(new_ease_factor, 2), next_due, now),
        )
    return {"ok": True}


# -- Stats overview (MIN-127) --------------------------------------------------

# hasEnoughData thresholds per MIN-126 spec §3
_ENOUGH_SESSIONS_TOTALS    = 3  # totals.hasEnoughData: ≥3 sessions (for per-day average)
_ENOUGH_ACTIVE_DAYS_TOTALS = 2  # totals.hasEnoughData: AND ≥2 active days (§3)
_ENOUGH_TOPIC_ATTEMPTS     = 5  # per-topic hasEnoughData: ≥5 attempts (§3)


def _parse_utc(iso: str) -> datetime:
    """Parse an ISO-8601 UTC string (with or without trailing Z) to a datetime."""
    return datetime.fromisoformat(iso.replace("Z", "+00:00"))


def _compute_streaks(sorted_days: list) -> tuple:
    """Return (current_streak, longest_streak) from a sorted list of unique date objects.

    current_streak is 0 if the most recent active day is more than 1 day before today.
    """
    today = datetime.now(timezone.utc).date()
    if not sorted_days:
        return 0, 0

    longest = 1
    run = 1
    for i in range(1, len(sorted_days)):
        if (sorted_days[i] - sorted_days[i - 1]).days == 1:
            run += 1
            if run > longest:
                longest = run
        else:
            run = 1

    # Current streak counts backward from today (allow today or yesterday as latest)
    current = 0
    if sorted_days[-1] >= today - timedelta(days=1):
        current = 1
        for i in range(len(sorted_days) - 2, -1, -1):
            if (sorted_days[i + 1] - sorted_days[i]).days == 1:
                current += 1
            else:
                break

    return current, longest


@router.get("/overview", response_model=StatsOverview)
def stats_overview(
    tz: str = Query(default="UTC", description="IANA timezone name for day-boundary calculations"),
    user=Depends(get_current_user),
):
    """Read-only stats aggregation for the User Statistics page (MIN-125).

    Everything is computed live from session + answer rows so that deleting a
    session (DELETE /sessions/{id}) automatically changes every stat here with
    zero extra code.
    """
    try:
        user_tz = ZoneInfo(tz)
    except (ZoneInfoNotFoundError, KeyError):
        raise HTTPException(status_code=422, detail=f"Unknown timezone: {tz!r}")

    uid = user["id"]
    now_iso = _utcnow_iso()

    with get_conn() as conn:
        # -- Per-session rows for perDay + totals + streak -----------------------
        session_rows = conn.execute(
            """SELECT s.id, s.completed_at,
                      COUNT(a.id)       AS q_count,
                      SUM(a.is_correct) AS q_correct,
                      SUM(a.time_taken_ms) AS time_ms
               FROM sessions s
               JOIN answers a ON a.session_id = s.id
               WHERE s.user_id = ?
               GROUP BY s.id
               ORDER BY s.completed_at""",
            (uid,),
        ).fetchall()

        # -- Per-(subject, level, topic) rollup with recent-window mastery -------
        topic_rows = conn.execute(
            f"""WITH ranked AS (
                    SELECT
                        a.subject,
                        s.level,
                        a.category,
                        a.is_correct,
                        s.completed_at,
                        ROW_NUMBER() OVER (
                            PARTITION BY a.subject, s.level, a.category
                            ORDER BY a.id DESC
                        ) AS rn
                    FROM answers a
                    JOIN sessions s ON s.id = a.session_id
                    WHERE s.user_id = ?
                )
                SELECT
                    subject, level, category,
                    COUNT(*)                                                      AS attempts,
                    SUM(is_correct)                                               AS correct,
                    MAX(completed_at)                                             AS last_practiced,
                    SUM(CASE WHEN rn <= {MASTERY_WINDOW} THEN 1    ELSE 0 END)  AS recent_attempts,
                    SUM(CASE WHEN rn <= {MASTERY_WINDOW} THEN is_correct
                                                         ELSE 0 END)             AS recent_correct
                FROM ranked
                GROUP BY subject, level, category
                ORDER BY subject, level, category""",
            (uid,),
        ).fetchall()

        # -- SRS topics currently due --------------------------------------------
        srs_due = conn.execute(
            "SELECT COUNT(*) AS cnt FROM topic_srs WHERE user_id = ? AND next_due <= ?",
            (uid, now_iso),
        ).fetchone()["cnt"]

    # -- Build perDay + streak + totals ----------------------------------------
    day_map: dict = defaultdict(lambda: {"questionsAnswered": 0, "correct": 0, "sessions": 0})
    total_q = total_correct = total_time_ms = total_sessions = 0

    for row in session_rows:
        local_date = _parse_utc(row["completed_at"]).astimezone(user_tz).date().isoformat()
        q   = row["q_count"]    or 0
        cor = row["q_correct"]  or 0
        tm  = row["time_ms"]    or 0
        day_map[local_date]["questionsAnswered"] += q
        day_map[local_date]["correct"]           += cor
        day_map[local_date]["sessions"]          += 1
        total_q          += q
        total_correct    += cor
        total_time_ms    += tm
        total_sessions   += 1

    per_day = [
        DayActivity(
            date=d,
            questionsAnswered=v["questionsAnswered"],
            correct=v["correct"],
            sessions=v["sessions"],
        )
        for d, v in sorted(day_map.items())
    ]

    active_dates = sorted(
        _parse_utc(row["completed_at"]).astimezone(user_tz).date()
        for row in session_rows
    )
    unique_active_dates = sorted(set(active_dates))
    current_streak, longest_streak = _compute_streaks(unique_active_dates)
    active_days = len(unique_active_dates)

    totals = TotalStats(
        questions=total_q,
        correct=total_correct,
        totalTimeSec=round(total_time_ms / 1000.0, 1),
        sessions=total_sessions,
        activeDays=active_days,
        hasEnoughData=total_sessions >= _ENOUGH_SESSIONS_TOTALS and active_days >= _ENOUGH_ACTIVE_DAYS_TOTALS,
    )
    streak = StreakStats(
        current=current_streak,
        longest=longest_streak,
        hasEnoughData=active_days >= 1,  # spec §3: streak always computable once any active day exists
    )

    # -- Build per-(subject, level, topic) rollup --------------------------------
    subject_map: dict = {}
    for row in topic_rows:
        subj    = row["subject"]
        lvl     = row["level"]
        cat     = row["category"]
        att     = row["attempts"]     or 0
        cor     = row["correct"]      or 0
        r_att   = row["recent_attempts"] or 0
        r_cor   = row["recent_correct"]  or 0

        accuracy = round(cor / att, 4) if att else 0.0
        topic = TopicRollup(
            topic=cat,
            attempts=att,
            accuracy=accuracy,
            masteryState=_mastery_state(r_cor, r_att),
            weaknessScore=_laplace_weakness(cor, att),
            lastPracticed=row["last_practiced"],
            hasEnoughData=att >= _ENOUGH_TOPIC_ATTEMPTS,
            touched=True,
        )

        if subj not in subject_map:
            subject_map[subj] = {}
        if lvl not in subject_map[subj]:
            subject_map[subj][lvl] = []
        subject_map[subj][lvl].append(topic)

    subjects = [
        SubjectRollup(
            subject=subj,
            touched=True,
            levels=[
                LevelRollup(level=lvl, touched=True, topics=topics)
                for lvl, topics in sorted(lvls.items())
            ],
        )
        for subj, lvls in sorted(subject_map.items())
    ]

    return StatsOverview(
        perDay=per_day,
        streak=streak,
        totals=totals,
        subjects=subjects,
        srsTopicsDueCount=srs_due,
    )
