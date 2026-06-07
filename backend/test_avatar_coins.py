"""Backend tests for avatar + coin economy (MIN-77 / MIN-78).

Run:  cd backend && python -m pytest test_avatar_coins.py -v
"""
import os

os.environ["EMAIL_PROVIDER"] = "console"
os.environ["ENVIRONMENT"] = "test"
os.environ["COOKIE_SECURE"] = "false"
os.environ["MINTYMARKS_SECRET"] = "test-secret-value-that-is-at-least-32-chars-long"

import pytest
from httpx import AsyncClient, ASGITransport
from main import app
import database as _db


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

async def _register(client, username="alice", password="secret99"):
    r = await client.post("/auth/register", json={"username": username, "password": password})
    assert r.status_code == 201, r.text
    return r.json()["id"]


async def _save_session(client, answers, subject="maths", level="KS2"):
    """Save a session; answers is a list of dicts with keys {category, isCorrect}."""
    payload = {
        "subject": subject,
        "level": level,
        "score": sum(1 for a in answers if a["isCorrect"]),
        "total": len(answers),
        "startedAt": "2026-06-07T10:00:00Z",
        "answers": [
            {
                "questionId": f"q{i}",
                "category": a["category"],
                "subject": subject,
                "isCorrect": a["isCorrect"],
                "timeTakenMs": 3000,
            }
            for i, a in enumerate(answers)
        ],
    }
    r = await client.post("/sessions", json=payload)
    assert r.status_code == 201, r.text
    return r.json()


# ── coin award tests ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_coin_award_correct_answers(transport):
    """Saving a session awards 1 coin per correct answer."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        result = await _save_session(client, [
            {"category": "Maths", "isCorrect": True},
            {"category": "Maths", "isCorrect": True},
            {"category": "Maths", "isCorrect": False},
        ])

        assert result["coinsEarned"] == 2
        assert result["coins"] == 2


@pytest.mark.asyncio
async def test_coin_award_accumulates(transport):
    """Coins accumulate across multiple sessions."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        await _save_session(client, [
            {"category": "Maths", "isCorrect": True},
            {"category": "Maths", "isCorrect": True},
        ])
        result = await _save_session(client, [
            {"category": "Maths", "isCorrect": True},
            {"category": "Maths", "isCorrect": False},
        ])

        assert result["coinsEarned"] == 1
        assert result["coins"] == 3  # 2 + 1


@pytest.mark.asyncio
async def test_no_coins_for_wrong_answers(transport):
    """Sessions with no correct answers award 0 coins."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        result = await _save_session(client, [
            {"category": "Maths", "isCorrect": False},
            {"category": "Maths", "isCorrect": False},
        ])

        assert result["coinsEarned"] == 0
        assert result["coins"] == 0


# ── avatar/me ─────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_avatar_defaults(transport):
    """GET /avatar/me returns default equipped items and 0 coins for new user."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)
        r = await client.get("/avatar/me")

    assert r.status_code == 200
    data = r.json()
    assert data["coins"] == 0
    assert "equipped" in data
    assert "owned" in data
    assert "catalog" in data
    # Every category must be present in equipped defaults
    for cat in ("base", "colour", "hat", "accessory"):
        assert cat in data["equipped"], f"missing default for category {cat}"
    # Free items must be in owned
    from avatar_catalog import FREE_IDS
    for fid in FREE_IDS:
        assert fid in data["owned"]


# ── purchase happy path ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_purchase_happy_path(transport):
    """Buying an item deducts the correct number of coins and marks it owned."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # Earn enough coins (hat_cap costs 5)
        await _save_session(client, [
            {"category": "Maths", "isCorrect": True},
        ] * 10)

        r = await client.post("/avatar/purchase", json={"itemId": "hat_cap"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        assert data["coins"] == 5  # 10 - 5

        # Confirm it appears in owned
        me = await client.get("/avatar/me")
        assert "hat_cap" in me.json()["owned"]


# ── insufficient coins ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_purchase_insufficient_coins(transport):
    """Attempting to buy an item with too few coins returns 402."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)
        # hat_cap costs 5; user has 0
        r = await client.post("/avatar/purchase", json={"itemId": "hat_cap"})
        assert r.status_code == 402, r.text


# ── already owned ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_purchase_already_owned(transport):
    """Buying the same item twice returns 409."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # Earn coins for two purchases
        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 20)

        r1 = await client.post("/avatar/purchase", json={"itemId": "hat_cap"})
        assert r1.status_code == 200

        r2 = await client.post("/avatar/purchase", json={"itemId": "hat_cap"})
        assert r2.status_code == 409, r2.text


# ── equip unowned item ────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_equip_unowned_rejected(transport):
    """Equipping an item the user hasn't purchased returns 403."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        r = await client.post("/avatar/equip", json={"category": "hat", "itemId": "hat_cap"})
        assert r.status_code == 403, r.text


@pytest.mark.asyncio
async def test_equip_owned_item(transport):
    """After purchasing, equipping updates the equipped dict."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 10)
        await client.post("/avatar/purchase", json={"itemId": "hat_cap"})

        r = await client.post("/avatar/equip", json={"category": "hat", "itemId": "hat_cap"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["hat"] == "hat_cap"

        # Confirm persisted
        me = await client.get("/avatar/me")
        assert me.json()["equipped"]["hat"] == "hat_cap"


@pytest.mark.asyncio
async def test_equip_free_item(transport):
    """Free items (owned by default) can be equipped without purchase."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        r = await client.post("/avatar/equip", json={"category": "hat", "itemId": "hat_none"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["hat"] == "hat_none"


@pytest.mark.asyncio
async def test_coins_never_negative(transport):
    """Coins never go below zero even with concurrent-style rapid purchases."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)
        # hat_cap costs 5; user has 0 coins
        r = await client.post("/avatar/purchase", json={"itemId": "hat_cap"})
        assert r.status_code == 402

        me = await client.get("/avatar/me")
        assert me.json()["coins"] == 0
