"""Backend tests for avatar + coin economy (MIN-77 / MIN-78 / MIN-100).

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


# ── catalog invariant tests (pure unit, no DB) ────────────────────────────────

def test_catalog_minimum_size():
    """Catalog must contain at least 150 items."""
    from avatar_catalog import CATALOG
    assert len(CATALOG) >= 150, f"Catalog has only {len(CATALOG)} items"


def test_catalog_exactly_8_categories():
    """Catalog must span exactly 8 categories."""
    from avatar_catalog import CATALOG
    cats = {item["category"] for item in CATALOG}
    assert cats == {"character", "colour", "background", "hat", "accessory", "held", "pet", "effect"}, \
        f"Unexpected categories: {cats}"


def test_catalog_no_duplicate_ids():
    """Every item ID must be unique."""
    from avatar_catalog import CATALOG
    ids = [item["id"] for item in CATALOG]
    dupes = [id_ for id_ in ids if ids.count(id_) > 1]
    assert not dupes, f"Duplicate IDs: {set(dupes)}"


def test_catalog_valid_prices():
    """All prices must be in the allowed tier set {0, 5, 15, 40, 100}."""
    from avatar_catalog import CATALOG, VALID_PRICES
    bad = [(item["id"], item["price"]) for item in CATALOG if item["price"] not in VALID_PRICES]
    assert not bad, f"Items with invalid prices: {bad}"


def test_catalog_one_free_default_per_category():
    """Each category must have exactly ONE item with price 0."""
    from avatar_catalog import CATALOG
    from collections import Counter
    free_counts = Counter(item["category"] for item in CATALOG if item["price"] == 0)
    for cat, count in free_counts.items():
        assert count == 1, f"Category '{cat}' has {count} free items (expected 1)"
    all_cats = {item["category"] for item in CATALOG}
    for cat in all_cats:
        assert cat in free_counts, f"Category '{cat}' has no free default"


def test_catalog_render_hints_present():
    """Every item must have a 'render' dict with a valid 'kind'."""
    from avatar_catalog import CATALOG
    valid_kinds = {"emoji", "color", "gradient", "frame", "effect"}
    missing = []
    bad_kind = []
    for item in CATALOG:
        r = item.get("render")
        if not isinstance(r, dict):
            missing.append(item["id"])
        elif r.get("kind") not in valid_kinds:
            bad_kind.append((item["id"], r.get("kind")))
    assert not missing, f"Items missing render hint: {missing}"
    assert not bad_kind, f"Items with invalid render kind: {bad_kind}"


def test_catalog_render_hints_have_value():
    """Every render hint must contain a 'value' key."""
    from avatar_catalog import CATALOG
    no_value = [item["id"] for item in CATALOG if "value" not in item.get("render", {})]
    assert not no_value, f"Items with render missing 'value': {no_value}"


def test_catalog_effect_hints_have_anim():
    """Items with render kind='effect' must include an 'anim' field."""
    from avatar_catalog import CATALOG
    valid_anims = {"sparkle", "float", "pulse"}
    bad = [
        (item["id"], item["render"].get("anim"))
        for item in CATALOG
        if item.get("render", {}).get("kind") == "effect"
        and item["render"].get("anim") not in valid_anims
    ]
    assert not bad, f"effect items with missing/invalid anim: {bad}"


def test_catalog_original_ids_preserved():
    """All 12 original item IDs must still exist in the catalog."""
    from avatar_catalog import _BY_ID
    original_ids = {
        "base_default", "base_star", "base_robot",
        "colour_blue", "colour_green", "colour_purple",
        "hat_none", "hat_cap", "hat_crown",
        "acc_none", "acc_glasses", "acc_bowtie",
    }
    missing = original_ids - set(_BY_ID.keys())
    assert not missing, f"Original IDs missing from catalog: {missing}"


def test_default_avatar_covers_all_8_categories():
    """default_avatar() must return a complete mapping for all 8 categories."""
    from avatar_catalog import default_avatar
    defaults = default_avatar()
    expected = {"character", "colour", "background", "hat", "accessory", "held", "pet", "effect"}
    assert set(defaults.keys()) == expected, f"default_avatar() missing categories: {expected - set(defaults.keys())}"


def test_default_avatar_items_are_free():
    """Every item returned by default_avatar() must have price 0."""
    from avatar_catalog import default_avatar, get_item
    for cat, item_id in default_avatar().items():
        item = get_item(item_id)
        assert item is not None, f"default_avatar item '{item_id}' not found in catalog"
        assert item["price"] == 0, f"default_avatar item '{item_id}' for '{cat}' has price {item['price']}"


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
    # All 8 categories must be present in equipped defaults
    for cat in ("character", "colour", "background", "hat", "accessory", "held", "pet", "effect"):
        assert cat in data["equipped"], f"missing default for category {cat}"
    # Free items must be in owned
    from avatar_catalog import FREE_IDS
    for fid in FREE_IDS:
        assert fid in data["owned"]


@pytest.mark.asyncio
async def test_catalog_render_field_in_api_response(transport):
    """GET /avatar/me catalog items must include the render field."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)
        r = await client.get("/avatar/me")

    catalog = r.json()["catalog"]
    no_render = [item["id"] for item in catalog if "render" not in item]
    assert not no_render, f"Items missing render in API response: {no_render}"


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


# ── new category purchase + equip (MIN-100) ───────────────────────────────────

@pytest.mark.asyncio
async def test_purchase_and_equip_background(transport):
    """Purchase and equip a background item (new category)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # bg_sky costs 5
        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 5)

        r = await client.post("/avatar/purchase", json={"itemId": "bg_sky"})
        assert r.status_code == 200, r.text
        assert r.json()["coins"] == 0  # 5 - 5

        r = await client.post("/avatar/equip", json={"category": "background", "itemId": "bg_sky"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["background"] == "bg_sky"

        me = await client.get("/avatar/me")
        assert me.json()["equipped"]["background"] == "bg_sky"


@pytest.mark.asyncio
async def test_purchase_and_equip_held(transport):
    """Purchase and equip a held item (new category)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # held_ball costs 5
        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 5)

        r = await client.post("/avatar/purchase", json={"itemId": "held_ball"})
        assert r.status_code == 200, r.text

        r = await client.post("/avatar/equip", json={"category": "held", "itemId": "held_ball"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["held"] == "held_ball"


@pytest.mark.asyncio
async def test_equip_free_defaults_for_new_categories(transport):
    """Free defaults for all new categories can be equipped without purchase."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        for cat, item_id in [
            ("background", "bg_none"),
            ("held",       "held_none"),
            ("pet",        "pet_none"),
            ("effect",     "effect_none"),
        ]:
            r = await client.post("/avatar/equip", json={"category": cat, "itemId": item_id})
            assert r.status_code == 200, f"{cat}/{item_id}: {r.text}"
            assert r.json()["equipped"][cat] == item_id


@pytest.mark.asyncio
async def test_purchase_pet_and_equip(transport):
    """Purchase and equip a pet (new category)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # pet_rabbit costs 5
        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 5)

        r = await client.post("/avatar/purchase", json={"itemId": "pet_rabbit"})
        assert r.status_code == 200, r.text

        r = await client.post("/avatar/equip", json={"category": "pet", "itemId": "pet_rabbit"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["pet"] == "pet_rabbit"


@pytest.mark.asyncio
async def test_purchase_effect_and_equip(transport):
    """Purchase and equip an effect (new category)."""
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register(client)

        # effect_sparkles costs 5
        await _save_session(client, [{"category": "Maths", "isCorrect": True}] * 5)

        r = await client.post("/avatar/purchase", json={"itemId": "effect_sparkles"})
        assert r.status_code == 200, r.text

        r = await client.post("/avatar/equip", json={"category": "effect", "itemId": "effect_sparkles"})
        assert r.status_code == 200, r.text
        assert r.json()["equipped"]["effect"] == "effect_sparkles"
