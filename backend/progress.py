"""Progress router — aggregate topic performance per subject across all sessions."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query, status

from database import get_conn
from schemas import TopicProgress, SRSTopicOut, SRSUpdateIn
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
        correct         = r["correct"] or 0
        recent_attempts = r["recent_attempts"] or 0
        recent_correct  = r["recent_correct"]  or 0
        recent_mastery  = round(recent_correct / recent_attempts, 4) if recent_attempts else 0.0
        result.append({
            "category":       r["category"],
            "subject":        r["subject"],
            "attempts":       attempts,
            "correct":        correct,
            "weakness":       _laplace_weakness(correct, attempts),
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
