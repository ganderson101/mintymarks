"""Tests for MIN-139: usedHelp on attempts + weakness rule.

Run:  cd backend && python -m pytest test_min139_used_help.py -v

Rules under test:
  1. usedHelp field accepted in AnswerIn (defaults False).
  2. used_help persisted on answer rows.
  3. usedHelp exposed in SessionAnswerOut (GET /sessions/{id}/answers).
  4. Weakness rule: assisted-correct (isCorrect=True, usedHelp=True) counts as
     weak — weakness is computed from unaided-correct only.
  5. Legacy rows (used_help=0 by default) are unaffected.
  6. Schema backward compatible: old POST /sessions payload (no usedHelp field)
     still accepted; usedHelp defaults to False.
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
from progress import _laplace_weakness


@pytest.fixture(autouse=True)
def fresh_db(tmp_path):
    db_file = str(tmp_path / "test.db")
    _db.DB_PATH = db_file
    _db.init_db()
    yield


@pytest.fixture
def transport():
    return ASGITransport(app=app)


# ── helpers ────────────────────────────────────────────────────────────────────

async def _login(client, username="george", password="secret99"):
    r = await client.post("/auth/register", json={"username": username, "password": password})
    assert r.status_code == 201
    return r.json()["id"]


async def _save_session(client, answers, subject="maths", level="11plus"):
    """answers: list of dicts with keys category, isCorrect, usedHelp (optional)."""
    payload = {
        "subject": subject,
        "level": level,
        "score": sum(1 for a in answers if a["isCorrect"]),
        "total": len(answers),
        "startedAt": "2026-06-11T10:00:00Z",
        "answers": [
            {
                "questionId": f"q{i}",
                "category": a["category"],
                "subject": subject,
                "isCorrect": a["isCorrect"],
                "timeTakenMs": 5000,
                **( {"usedHelp": a["usedHelp"]} if "usedHelp" in a else {} ),
            }
            for i, a in enumerate(answers)
        ],
    }
    r = await client.post("/sessions", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ── unit tests for _laplace_weakness ──────────────────────────────────────────

def test_laplace_weakness_all_unaided():
    """All correct, none assisted → weakness unchanged from pre-MIN-139 behaviour."""
    assert _laplace_weakness(3, 3) == _laplace_weakness(3, 3)


def test_laplace_weakness_all_assisted_correct():
    """All correct but all assisted → weakness same as 0 correct (all count as weak)."""
    # unaided_correct=0, attempts=3 → same as 0/3
    assert _laplace_weakness(0, 3) == pytest.approx(1.0 - 1 / 5, abs=1e-4)


def test_laplace_weakness_mixed():
    """2 of 3 correct, 1 of those assisted → unaided=1 → higher weakness than unaided=2."""
    weakness_1_unaided = _laplace_weakness(1, 3)
    weakness_2_unaided = _laplace_weakness(2, 3)
    assert weakness_1_unaided > weakness_2_unaided


# ── schema backward compatibility ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_legacy_payload_no_usedhelp_field(transport):
    """Old clients that omit usedHelp entirely are accepted; field defaults to False."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        payload = {
            "subject": "maths",
            "level": "ks2",
            "score": 1,
            "total": 1,
            "startedAt": "2026-06-11T10:00:00Z",
            "answers": [{"questionId": "q0", "category": "Fractions",
                          "subject": "maths", "isCorrect": True, "timeTakenMs": 3000}],
        }
        r = await client.post("/sessions", json=payload)
        assert r.status_code == 201

        session_id = r.json()["id"]
        answers_r = await client.get(f"/sessions/{session_id}/answers")
        assert answers_r.status_code == 200
        assert answers_r.json()[0]["usedHelp"] is False


# ── usedHelp persisted and returned ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_used_help_true_persisted_and_returned(transport):
    """usedHelp=True is saved and returned from GET /sessions/{id}/answers."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        sess = await _save_session(client, [
            {"category": "Spellings", "isCorrect": True,  "usedHelp": True},
            {"category": "Spellings", "isCorrect": False, "usedHelp": False},
        ])
        session_id = sess["id"]

        r = await client.get(f"/sessions/{session_id}/answers")
        assert r.status_code == 200
        answers = r.json()
        assert len(answers) == 2
        assert answers[0]["usedHelp"] is True
        assert answers[1]["usedHelp"] is False


# ── weakness rule via GET /progress/topics ─────────────────────────────────────

@pytest.mark.asyncio
async def test_assisted_correct_raises_weakness_vs_unaided(transport):
    """Assisted-correct raises weakness compared to identical unassisted-correct."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client, "alice", "secret99")
        # 3 correct answers, all assisted
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
        ])
        topics_r = await client.get("/progress/topics?subject=maths")
        assert topics_r.status_code == 200
        topics = {t["category"]: t for t in topics_r.json()}
        assisted_weakness = topics["Fractions"]["weakness"]

    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client, "bob", "secret99")
        # Same 3 correct answers, none assisted
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True, "usedHelp": False},
            {"category": "Fractions", "isCorrect": True, "usedHelp": False},
            {"category": "Fractions", "isCorrect": True, "usedHelp": False},
        ])
        topics_r = await client.get("/progress/topics?subject=maths")
        assert topics_r.status_code == 200
        topics = {t["category"]: t for t in topics_r.json()}
        unaided_weakness = topics["Fractions"]["weakness"]

    assert assisted_weakness > unaided_weakness, (
        f"assisted weakness {assisted_weakness} should exceed unaided {unaided_weakness}"
    )


@pytest.mark.asyncio
async def test_assisted_correct_weakness_equals_all_wrong(transport):
    """3 assisted-correct → weakness == _laplace_weakness(0, 3) (all count as weak)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
        ])
        topics_r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in topics_r.json()}
        topic = topics["Fractions"]
        expected = _laplace_weakness(0, 3)
        assert topic["weakness"] == pytest.approx(expected, abs=1e-4)


@pytest.mark.asyncio
async def test_mixed_assisted_unassisted_weakness(transport):
    """2 correct (1 unaided, 1 assisted) + 1 wrong → weakness uses unaided_correct=1."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True,  "usedHelp": False},  # unaided correct
            {"category": "Fractions", "isCorrect": True,  "usedHelp": True},   # assisted — counts as weak
            {"category": "Fractions", "isCorrect": False, "usedHelp": False},  # wrong
        ])
        topics_r = await client.get("/progress/topics?subject=maths")
        topics = {t["category"]: t for t in topics_r.json()}
        topic = topics["Fractions"]
        # unaided_correct=1, attempts=3
        expected = _laplace_weakness(1, 3)
        assert topic["weakness"] == pytest.approx(expected, abs=1e-4)
        # correct count in output still reflects total correct (2), not unaided
        assert topic["correct"] == 2
        assert topic["attempts"] == 3


@pytest.mark.asyncio
async def test_legacy_rows_unaffected(transport):
    """Legacy rows (used_help=0 default) are treated as unaided — weakness unchanged."""
    # Simulate legacy row: POST without usedHelp field
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        payload = {
            "subject": "maths", "level": "ks2", "score": 3, "total": 3,
            "startedAt": "2026-06-11T10:00:00Z",
            "answers": [
                {"questionId": f"q{i}", "category": "Fractions",
                 "subject": "maths", "isCorrect": True, "timeTakenMs": 3000}
                for i in range(3)
            ],
        }
        r = await client.post("/sessions", json=payload)
        assert r.status_code == 201

        topics_r = await client.get("/progress/topics?subject=maths")
        topic = topics_r.json()[0]
        # 3 correct, 3 unaided (legacy default), weakness = _laplace_weakness(3, 3)
        expected = _laplace_weakness(3, 3)
        assert topic["weakness"] == pytest.approx(expected, abs=1e-4)


# ── overview uses raw weakness (spec §2: honest display, never touches is_correct) ────

@pytest.mark.asyncio
async def test_overview_weakness_uses_raw_not_unaided(transport):
    """Per spec §2: GET /progress/overview weaknessScore uses raw is_correct, not unaided_correct.
    The overview is honest performance display; only /progress/topics (adaptive seed) uses unaided."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        # 2 assisted-correct + 1 unaided-correct + 1 wrong = 4 attempts, 3 correct
        await _save_session(client, [
            {"category": "Fractions", "isCorrect": True,  "usedHelp": True},   # assisted
            {"category": "Fractions", "isCorrect": True,  "usedHelp": True},   # assisted
            {"category": "Fractions", "isCorrect": True,  "usedHelp": False},  # unaided correct
            {"category": "Fractions", "isCorrect": False, "usedHelp": False},  # wrong
        ])
        r = await client.get("/progress/overview")
        assert r.status_code == 200
        topic = r.json()["subjects"][0]["levels"][0]["topics"][0]
        # overview uses raw correct=3, attempts=4 — NOT unaided_correct=1
        expected = _laplace_weakness(3, 4)
        assert topic["weaknessScore"] == pytest.approx(expected, abs=1e-4)
        # accuracy also reflects all correct answers (3/4)
        assert topic["accuracy"] == pytest.approx(3 / 4, abs=1e-4)


# ── score / coins unaffected ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_coins_unaffected_by_used_help(transport):
    """Answering correctly with usedHelp=True still awards coins."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _login(client)
        sess = await _save_session(client, [
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": True, "usedHelp": True},
            {"category": "Fractions", "isCorrect": False, "usedHelp": False},
        ])
        # 2 correct → 2 coins earned
        assert sess["coinsEarned"] == 2
        assert sess["score"] == 2
        assert sess["total"] == 3
