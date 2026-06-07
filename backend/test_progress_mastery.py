"""Backend tests for recent-mastery fields in GET /progress/topics (MIN-62).

Run:  cd backend && python -m pytest test_progress_mastery.py -v
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
from progress import _mastery_state, MASTERY_WINDOW


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


async def _save_session(client, answers, subject="maths", level="KS2"):
    """Save a session with the given answers list of dicts {category, isCorrect}."""
    payload = {
        "subject": subject,
        "level": level,
        "score": sum(1 for a in answers if a["isCorrect"]),
        "total": len(answers),
        "startedAt": "2026-06-07T12:00:00Z",
        "answers": [
            {
                "questionId": f"q{i}",
                "category": a["category"],
                "subject": subject,
                "isCorrect": a["isCorrect"],
                "timeTakenMs": 5000,
            }
            for i, a in enumerate(answers)
        ],
    }
    r = await client.post("/sessions", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ── unit tests for _mastery_state ─────────────────────────────────────────────

def test_mastery_state_not_started():
    assert _mastery_state(0, 0) == "Not started"


def test_mastery_state_just_started_1():
    assert _mastery_state(1, 1) == "Just started"


def test_mastery_state_just_started_2():
    assert _mastery_state(2, 2) == "Just started"


def test_mastery_state_building_it():
    # 3 attempts, 1/3 = 33% < 67%
    assert _mastery_state(1, 3) == "Building it"


def test_mastery_state_strong():
    # 3 attempts, 3/3 = 100% but only 3 attempts → Strong (not Mastered — need ≥5)
    assert _mastery_state(3, 3) == "Strong"


def test_mastery_state_strong_boundary():
    # 4 attempts, 3/4 = 75% → Strong (≥67%, but < 5 attempts for Mastered)
    assert _mastery_state(3, 4) == "Strong"


def test_mastery_state_mastered():
    # 5 attempts, 5/5 = 100% → Mastered ⭐
    assert _mastery_state(5, 5) == "Mastered ⭐"


def test_mastery_state_mastered_requires_5():
    # 4 attempts, 4/4 = 100% → Strong (not Mastered — need ≥5)
    assert _mastery_state(4, 4) == "Strong"


def test_mastery_state_mastered_requires_90pct():
    # 5 attempts, 4/5 = 80% → Strong (not Mastered — need ≥90%)
    assert _mastery_state(4, 5) == "Strong"


def test_mastery_state_building_it_low_accuracy():
    # 6 attempts, 2/6 = 33% → Building it
    assert _mastery_state(2, 6) == "Building it"


# ── integration tests via /progress/topics ────────────────────────────────────

@pytest.mark.asyncio
async def test_1_of_1_correct_no_longer_misleading(transport):
    """George's reported case: 1/1 correct must NOT show 67% mastery."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [{"category": "Statistics", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        assert r.status_code == 200
        topics = {t["category"]: t for t in r.json()}
        stat = topics["Statistics"]

        # recentMastery must be exactly 1.0 (raw 1/1), NOT 0.6667 (Laplace)
        assert stat["recentMastery"] == 1.0
        assert stat["recentCorrect"] == 1
        assert stat["recentAttempts"] == 1
        assert stat["masteryState"] == "Just started"
        # Legacy weakness field must still be present (not broken)
        assert "weakness" in stat


@pytest.mark.asyncio
async def test_recoverability(transport):
    """Past wrongs roll out of the recent window → topic can recover to 100%."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)

        # First: 1 wrong answer
        await _save_session(client, [{"category": "Fractions", "isCorrect": False}])

        # Then: 10 correct answers (fills the MASTERY_WINDOW)
        for _ in range(MASTERY_WINDOW):
            await _save_session(client, [{"category": "Fractions", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        assert r.status_code == 200
        topics = {t["category"]: t for t in r.json()}
        frac = topics["Fractions"]

        # The old wrong answer has rolled out; recent window is all correct
        assert frac["recentMastery"] == 1.0
        assert frac["recentCorrect"] == MASTERY_WINDOW
        assert frac["recentAttempts"] == MASTERY_WINDOW
        assert frac["masteryState"] == "Mastered ⭐"


@pytest.mark.asyncio
async def test_partial_window_recovery(transport):
    """After some wrongs, partial correct answers show correct recent mastery."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)

        # 5 wrong, then 5 correct → recent window is 5 wrong + 5 correct = 50%
        for _ in range(5):
            await _save_session(client, [{"category": "Algebra", "isCorrect": False}])
        for _ in range(5):
            await _save_session(client, [{"category": "Algebra", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in r.json()}
        alg = topics["Algebra"]

        assert alg["recentAttempts"] == MASTERY_WINDOW
        assert alg["recentCorrect"] == 5
        assert alg["recentMastery"] == 0.5
        assert alg["masteryState"] == "Building it"


@pytest.mark.asyncio
async def test_ladder_strong(transport):
    """≥3 recent attempts with 67–89% accuracy → Strong."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)

        # 3 correct out of 4 recent = 75%
        for _ in range(3):
            await _save_session(client, [{"category": "Geometry", "isCorrect": True}])
        await _save_session(client, [{"category": "Geometry", "isCorrect": False}])

        r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in r.json()}
        geom = topics["Geometry"]

        assert geom["recentAttempts"] == 4
        assert geom["recentCorrect"] == 3
        assert geom["masteryState"] == "Strong"


@pytest.mark.asyncio
async def test_mastered_requires_5_attempts(transport):
    """4/4 = 100% but only 4 recent attempts → Strong (not Mastered)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)

        for _ in range(4):
            await _save_session(client, [{"category": "Division", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in r.json()}
        div = topics["Division"]

        assert div["recentAttempts"] == 4
        assert div["recentMastery"] == 1.0
        assert div["masteryState"] == "Strong"


@pytest.mark.asyncio
async def test_weakness_field_preserved(transport):
    """Existing `weakness` field must still be present — additive change only."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [{"category": "Statistics", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        assert r.status_code == 200
        topic = r.json()[0]
        # All existing fields must still be present
        for field in ("category", "subject", "attempts", "correct", "weakness", "avgTimeSec"):
            assert field in topic, f"missing field: {field}"
        # New fields must be present
        for field in ("recentMastery", "recentCorrect", "recentAttempts", "masteryState"):
            assert field in topic, f"missing new field: {field}"


@pytest.mark.asyncio
async def test_recent_window_caps_at_n(transport):
    """When a topic has more than N=10 answers, recentAttempts is capped at N."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)

        # Save 15 answers total
        for _ in range(15):
            await _save_session(client, [{"category": "Multiplication", "isCorrect": True}])

        r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in r.json()}
        mult = topics["Multiplication"]

        assert mult["attempts"] == 15          # lifetime total unchanged
        assert mult["recentAttempts"] == MASTERY_WINDOW  # recent capped at 10
        assert mult["recentMastery"] == 1.0
        assert mult["masteryState"] == "Mastered ⭐"
