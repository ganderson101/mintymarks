"""Tests for GET /progress/overview — stats aggregation endpoint (MIN-127).

Run:  cd backend && python -m pytest test_stats_overview.py -v
"""
import os
import pytest

os.environ["EMAIL_PROVIDER"] = "console"
os.environ["ENVIRONMENT"] = "test"
os.environ["COOKIE_SECURE"] = "false"
os.environ["MINTYMARKS_SECRET"] = "test-secret-value-that-is-at-least-32-chars-long"

from httpx import AsyncClient, ASGITransport
from main import app
import database as _db
from progress import _compute_streaks, _ENOUGH_SESSIONS_TOTALS, _ENOUGH_ACTIVE_DAYS_TOTALS, _ENOUGH_TOPIC_ATTEMPTS


@pytest.fixture(autouse=True)
def fresh_db(tmp_path):
    db_file = str(tmp_path / "test.db")
    _db.DB_PATH = db_file
    _db.init_db()
    yield


@pytest.fixture
def transport():
    return ASGITransport(app=app)


# ── helpers ───────────────────────────────────────────────────────────────────

async def _login(client, username="george", password="secret99"):
    r = await client.post("/auth/register", json={"username": username, "password": password})
    assert r.status_code == 201
    return r.json()["id"]


async def _save_session(client, answers, subject="maths", level="ks2", started_at="2026-06-08T10:00:00Z"):
    payload = {
        "subject": subject,
        "level": level,
        "score": sum(1 for a in answers if a["isCorrect"]),
        "total": len(answers),
        "startedAt": started_at,
        "answers": [
            {
                "questionId": f"q{i}",
                "category": a["category"],
                "subject": subject,
                "isCorrect": a["isCorrect"],
                "timeTakenMs": a.get("timeTakenMs", 5000),
            }
            for i, a in enumerate(answers)
        ],
    }
    r = await client.post("/sessions", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


async def _overview(client, tz="UTC"):
    r = await client.get(f"/progress/overview?tz={tz}")
    assert r.status_code == 200, r.text
    return r.json()


def _db_insert_session(user_id, completed_at, answers, subject="maths", level="ks2"):
    """Insert a session with a specific completed_at directly, bypassing the API.

    answers is a list of (category, is_correct) tuples.
    """
    with _db.get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO sessions
                   (user_id, subject, level, score, total, started_at, completed_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (user_id, subject, level,
             sum(1 for _, cor in answers if cor),
             len(answers),
             completed_at, completed_at),
        )
        session_id = cur.lastrowid
        conn.executemany(
            """INSERT INTO answers
                   (session_id, question_id, category, subject, is_correct, time_taken_ms)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [(session_id, f"q{i}", cat, subject, int(cor), 5000)
             for i, (cat, cor) in enumerate(answers)],
        )
    return session_id


# ── unit tests for _compute_streaks ───────────────────────────────────────────

def test_streak_empty():
    assert _compute_streaks([]) == (0, 0)


def test_streak_single_day_today():
    from datetime import datetime, timezone
    today = datetime.now(timezone.utc).date()
    current, longest = _compute_streaks([today])
    assert current == 1
    assert longest == 1


def test_streak_single_day_yesterday():
    from datetime import datetime, timedelta, timezone
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).date()
    current, longest = _compute_streaks([yesterday])
    assert current == 1
    assert longest == 1


def test_streak_single_day_two_days_ago():
    from datetime import datetime, timedelta, timezone
    old = (datetime.now(timezone.utc) - timedelta(days=2)).date()
    current, longest = _compute_streaks([old])
    assert current == 0
    assert longest == 1


def test_streak_consecutive_3():
    from datetime import date
    # Today is 2026-06-08; Jun 7 is yesterday → current streak = 3
    days = [date(2026, 6, 5), date(2026, 6, 6), date(2026, 6, 7)]
    current, longest = _compute_streaks(days)
    assert longest == 3
    assert current == 3  # Jun 7 = yesterday → active streak includes today's window


def test_streak_gap_resets():
    from datetime import date
    # Gap between day 2 and day 3
    days = [date(2026, 6, 1), date(2026, 6, 2), date(2026, 6, 5), date(2026, 6, 6)]
    current, longest = _compute_streaks(days)
    assert longest == 2
    assert current == 0


def test_streak_longest_not_current():
    from datetime import date
    # 5-day streak in past, then 2-day streak more recently (still not today)
    days = [
        date(2026, 5, 1), date(2026, 5, 2), date(2026, 5, 3), date(2026, 5, 4), date(2026, 5, 5),
        date(2026, 6, 1), date(2026, 6, 2),
    ]
    current, longest = _compute_streaks(days)
    assert longest == 5
    assert current == 0  # not active today/yesterday


# ── integration tests via GET /progress/overview ──────────────────────────────

@pytest.mark.asyncio
async def test_empty_user_returns_zeros(transport):
    """User with no sessions gets zeroed-out stats, not an error."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        data = await _overview(client)

    assert data["perDay"] == []
    assert data["totals"]["questions"] == 0
    assert data["totals"]["correct"] == 0
    assert data["totals"]["sessions"] == 0
    assert data["totals"]["activeDays"] == 0
    assert data["totals"]["hasEnoughData"] is False
    assert data["streak"]["current"] == 0
    assert data["streak"]["longest"] == 0
    assert data["streak"]["hasEnoughData"] is False
    assert data["subjects"] == []
    assert data["srsTopicsDueCount"] == 0


@pytest.mark.asyncio
async def test_totals_aggregation(transport):
    """Two sessions with known answers produce correct totals."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        # Session 1: 3 correct out of 4, each 2000ms
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True,  "timeTakenMs": 2000},
            {"category": "Fractions", "isCorrect": True,  "timeTakenMs": 2000},
            {"category": "Fractions", "isCorrect": False, "timeTakenMs": 2000},
            {"category": "Algebra",   "isCorrect": True,  "timeTakenMs": 2000},
        ])
        # Session 2: 2 correct out of 2, each 3000ms
        await _save_session(client, [
            {"category": "Geometry",  "isCorrect": True,  "timeTakenMs": 3000},
            {"category": "Geometry",  "isCorrect": True,  "timeTakenMs": 3000},
        ])
        data = await _overview(client)

    t = data["totals"]
    assert t["questions"] == 6
    assert t["correct"] == 5
    assert t["sessions"] == 2
    # 4×2000 + 2×3000 = 14000ms = 14.0s
    assert t["totalTimeSec"] == 14.0
    assert t["activeDays"] == 1  # both sessions on same day


@pytest.mark.asyncio
async def test_per_day_grouping(transport):
    """Sessions on the same UTC day are grouped into one perDay entry.

    Uses direct DB inserts with explicit completed_at to control date grouping,
    since the HTTP API sets completed_at=now().
    """
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = await _login(client)
        # Two sessions on 2026-06-01
        _db_insert_session(uid, "2026-06-01T09:00:00Z",
                           [("Fractions", True)], subject="maths", level="ks2")
        _db_insert_session(uid, "2026-06-01T15:00:00Z",
                           [("Algebra", False)], subject="maths", level="ks2")
        # One session on 2026-06-03
        _db_insert_session(uid, "2026-06-03T10:00:00Z",
                           [("Geometry", True)], subject="maths", level="ks2")
        data = await _overview(client)

    assert len(data["perDay"]) == 2
    day1 = next(d for d in data["perDay"] if d["date"] == "2026-06-01")
    assert day1["questionsAnswered"] == 2
    assert day1["correct"] == 1
    assert day1["sessions"] == 2
    day3 = next(d for d in data["perDay"] if d["date"] == "2026-06-03")
    assert day3["questionsAnswered"] == 1
    assert day3["correct"] == 1
    assert day3["sessions"] == 1


@pytest.mark.asyncio
async def test_timezone_boundary(transport):
    """A session at 23:30 UTC on June 1 is June 2 in UTC+2 — tz param must shift it.

    Uses direct DB insert to set a specific completed_at timestamp.
    """
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = await _login(client)
        # 23:30 UTC = 01:30 next day in Europe/Paris (UTC+2 in June)
        _db_insert_session(uid, "2026-06-01T23:30:00Z",
                           [("Fractions", True)], subject="maths", level="ks2")

        data_utc   = await _overview(client, tz="UTC")
        data_paris = await _overview(client, tz="Europe/Paris")

    # In UTC: session is on 2026-06-01
    assert any(d["date"] == "2026-06-01" for d in data_utc["perDay"])
    assert not any(d["date"] == "2026-06-02" for d in data_utc["perDay"])

    # In Europe/Paris (UTC+2 in summer): same session is on 2026-06-02
    assert any(d["date"] == "2026-06-02" for d in data_paris["perDay"])
    assert not any(d["date"] == "2026-06-01" for d in data_paris["perDay"])


@pytest.mark.asyncio
async def test_subject_level_topic_rollup(transport):
    """Per-(subject, level, topic) rollup has correct attempts, accuracy, and mastery."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        # 6 attempts on Fractions / maths / ks2: 4 correct, 2 wrong
        for is_correct in [True, True, True, True, False, False]:
            await _save_session(client, [{"category": "Fractions", "isCorrect": is_correct}],
                                subject="maths", level="ks2")
        data = await _overview(client)

    assert len(data["subjects"]) == 1
    subj = data["subjects"][0]
    assert subj["subject"] == "maths"
    assert subj["touched"] is True
    assert len(subj["levels"]) == 1
    lvl = subj["levels"][0]
    assert lvl["level"] == "ks2"
    assert lvl["touched"] is True
    assert len(lvl["topics"]) == 1
    t = lvl["topics"][0]
    assert t["topic"] == "Fractions"
    assert t["attempts"] == 6
    assert t["accuracy"] == round(4 / 6, 4)
    assert t["hasEnoughData"] is True          # 6 >= _ENOUGH_TOPIC_ATTEMPTS (5)
    assert "masteryState" in t
    assert "weaknessScore" in t
    assert t["lastPracticed"] is not None


@pytest.mark.asyncio
async def test_has_enough_data_below_threshold(transport):
    """Stats with fewer sessions/attempts than thresholds report hasEnoughData=False."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        # 1 session, 1 active day, 3 questions — below totals and topic thresholds
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True},
            {"category": "Fractions", "isCorrect": True},
            {"category": "Fractions", "isCorrect": False},
        ])
        data = await _overview(client)

    # 1 session < _ENOUGH_SESSIONS_TOTALS (3), 1 active day < _ENOUGH_ACTIVE_DAYS_TOTALS (2)
    assert data["totals"]["hasEnoughData"] is False
    # spec §3: streak is always computable once any active day exists
    assert data["streak"]["hasEnoughData"] is True
    # 3 topic attempts < _ENOUGH_TOPIC_ATTEMPTS (5)
    topic = data["subjects"][0]["levels"][0]["topics"][0]
    assert topic["hasEnoughData"] is False


@pytest.mark.asyncio
async def test_has_enough_data_above_threshold(transport):
    """Once thresholds are crossed, hasEnoughData flips to True."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        uid = await _login(client)
        # 3 sessions across 2 different days satisfies both totals thresholds
        _db_insert_session(uid, "2026-06-01T10:00:00Z",
                           [("Algebra", True)] * 5, subject="maths", level="ks2")
        _db_insert_session(uid, "2026-06-01T15:00:00Z",
                           [("Algebra", True)], subject="maths", level="ks2")
        _db_insert_session(uid, "2026-06-02T10:00:00Z",
                           [("Algebra", True)], subject="maths", level="ks2")
        data = await _overview(client)

    # 3 sessions AND 2 active days → True
    assert data["totals"]["hasEnoughData"] is True
    topic = data["subjects"][0]["levels"][0]["topics"][0]
    assert topic["hasEnoughData"] is True  # 7 >= 5


@pytest.mark.asyncio
async def test_delete_session_changes_stats(transport):
    """Deleting a session removes its answers from every stat (no denormalisation)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        s1 = await _save_session(client, [
            {"category": "Fractions", "isCorrect": True},
            {"category": "Fractions", "isCorrect": True},
        ])
        s2 = await _save_session(client, [
            {"category": "Fractions", "isCorrect": False},
            {"category": "Fractions", "isCorrect": False},
            {"category": "Fractions", "isCorrect": False},
        ])

        before = await _overview(client)
        assert before["totals"]["questions"] == 5
        assert before["totals"]["correct"] == 2

        # Delete the second session
        r = await client.delete(f"/sessions/{s2['id']}")
        assert r.status_code == 204

        after = await _overview(client)

    assert after["totals"]["questions"] == 2
    assert after["totals"]["correct"] == 2
    assert after["totals"]["sessions"] == 1
    assert after["subjects"][0]["levels"][0]["topics"][0]["attempts"] == 2


@pytest.mark.asyncio
async def test_multi_subject_rollup(transport):
    """Sessions across subjects and levels produce correctly bucketed rollup."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [{"category": "Forces", "isCorrect": True}],
                            subject="physics", level="ks3")
        await _save_session(client, [{"category": "Fractions", "isCorrect": True}],
                            subject="maths", level="ks2")
        await _save_session(client, [{"category": "Fractions", "isCorrect": False}],
                            subject="maths", level="ks3")
        data = await _overview(client)

    subjects = {s["subject"]: s for s in data["subjects"]}
    assert "maths" in subjects
    assert "physics" in subjects

    maths_levels = {lvl["level"]: lvl for lvl in subjects["maths"]["levels"]}
    assert "ks2" in maths_levels
    assert "ks3" in maths_levels

    physics_levels = {lvl["level"]: lvl for lvl in subjects["physics"]["levels"]}
    assert "ks3" in physics_levels


@pytest.mark.asyncio
async def test_invalid_timezone_returns_422(transport):
    """An unrecognised timezone name returns HTTP 422."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        r = await client.get("/progress/overview?tz=Not/ATimezone")
        assert r.status_code == 422


@pytest.mark.asyncio
async def test_existing_endpoints_unchanged(transport):
    """GET /progress/topics and GET /progress/srs still return the same shape."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [{"category": "Fractions", "isCorrect": True}])

        topics_r = await client.get("/progress/topics?subject=maths")
        assert topics_r.status_code == 200
        topic = topics_r.json()[0]
        for field in ("category", "subject", "attempts", "correct", "weakness",
                      "recentMastery", "masteryState"):
            assert field in topic, f"Missing field from /progress/topics: {field}"

        srs_r = await client.get("/progress/srs?subject=maths")
        assert srs_r.status_code == 200
