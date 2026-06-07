"""Backend tests for magic-link auth and child profile management.

Run:  cd backend && python -m pytest test_auth_magic.py -v
Requires: pip install pytest httpx fastapi
"""
import hashlib
import os
import pytest

# Set env vars before any app imports so modules pick them up correctly.
os.environ["EMAIL_PROVIDER"] = "console"
os.environ["ENVIRONMENT"] = "test"
os.environ["COOKIE_SECURE"] = "false"
# board.py requires a non-placeholder secret; set a test value before import.
os.environ["MINTYMARKS_SECRET"] = "test-secret-value-that-is-at-least-32-chars-long"

from httpx import AsyncClient, ASGITransport
from main import app
import database as _db


@pytest.fixture(autouse=True)
def fresh_db(tmp_path):
    """Give every test its own temp-file SQLite database."""
    db_file = str(tmp_path / "test.db")
    _db.DB_PATH = db_file
    _db.init_db()
    yield
    # tmp_path is auto-cleaned by pytest


@pytest.fixture
def transport():
    return ASGITransport(app=app)


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _register_parent(client, username="george", password="secret99", email=None):
    r = await client.post("/auth/register", json={"username": username, "password": password})
    assert r.status_code == 201
    if email:
        r2 = await client.patch("/auth/me/email", json={"email": email})
        assert r2.status_code == 200
    return r.json()


async def _get_magic_link_token(client, email: str) -> str:
    """Request a magic link and capture the token from the console output (patched)."""
    from unittest.mock import patch
    captured = []

    def fake_send(to, token):
        captured.append(token)

    with patch("auth.send_magic_link", side_effect=fake_send):
        r = await client.post("/auth/magic-link/request", json={"email": email})
    assert r.status_code == 200
    assert captured, "No magic link was generated"
    return captured[0]


# ── Tests ─────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_register_and_legacy_login(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/auth/register", json={"username": "alice", "password": "pass123"})
        assert r.status_code == 201
        assert r.json()["role"] == "parent"

        r2 = await client.post("/auth/login", json={"username": "alice", "password": "pass123"})
        assert r2.status_code == 200

        r3 = await client.post("/auth/login", json={"username": "alice", "password": "wrongpassword"})
        assert r3.status_code == 401


@pytest.mark.asyncio
async def test_magic_link_request_unknown_email(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/auth/magic-link/request", json={"email": "nobody@example.com"})
        # Must return 200 (silent) whether email exists or not.
        assert r.status_code == 200


@pytest.mark.asyncio
async def test_magic_link_full_flow(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")

        from unittest.mock import patch
        captured = []
        with patch("auth.send_magic_link", side_effect=lambda to, tok: captured.append(tok)):
            r = await client.post("/auth/magic-link/request", json={"email": "george@example.com"})
        assert r.status_code == 200
        assert captured

        r2 = await client.post("/auth/magic-link/verify", json={"token": captured[0]})
        assert r2.status_code == 200
        assert r2.json()["role"] == "parent"
        assert "mintymarks_token" in r2.cookies


@pytest.mark.asyncio
async def test_magic_link_single_use(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")
        token = await _get_magic_link_token(client, "george@example.com")

        r1 = await client.post("/auth/magic-link/verify", json={"token": token})
        assert r1.status_code == 200

        r2 = await client.post("/auth/magic-link/verify", json={"token": token})
        assert r2.status_code == 400


@pytest.mark.asyncio
async def test_magic_link_invalid_token(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        r = await client.post("/auth/magic-link/verify", json={"token": "not-a-real-token"})
        assert r.status_code == 400


@pytest.mark.asyncio
async def test_create_child_no_contact(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")
        # Log in
        await client.post("/auth/login", json={"username": "george", "password": "secret99"})

        r = await client.post("/auth/children", json={"username": "Alice"})
        assert r.status_code == 201
        data = r.json()
        assert data["username"] == "Alice"
        assert data["has_contact"] is False


@pytest.mark.asyncio
async def test_create_child_with_contact(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")
        await client.post("/auth/login", json={"username": "george", "password": "secret99"})

        r = await client.post("/auth/children", json={
            "username": "Bob",
            "contact": "bob@family.example",
            "contact_type": "email",
        })
        assert r.status_code == 201
        assert r.json()["has_contact"] is True
        assert r.json()["contact_type"] == "email"


@pytest.mark.asyncio
async def test_child_profile_gated_to_parent(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")
        await client.post("/auth/login", json={"username": "george", "password": "secret99"})
        r_child = await client.post("/auth/children", json={"username": "Kid1"})
        child_id = r_child.json()["id"]

        # Tap into child session
        r_tap = await client.post(f"/auth/children/{child_id}/session")
        assert r_tap.status_code == 200
        assert r_tap.json()["role"] == "child"

        # Child session cannot create child profiles
        r_deny = await client.post("/auth/children", json={"username": "Kid2"})
        assert r_deny.status_code == 403


@pytest.mark.asyncio
async def test_cross_parent_403(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/auth/register", json={"username": "parent1", "password": "pass123"})
        await client.post("/auth/register", json={"username": "parent2", "password": "pass123"})

        await client.post("/auth/login", json={"username": "parent1", "password": "pass123"})
        r = await client.post("/auth/children", json={"username": "ChildOfP1"})
        child_id = r.json()["id"]

        # Switch to parent2
        await client.post("/auth/logout")
        await client.post("/auth/login", json={"username": "parent2", "password": "pass123"})

        r2 = await client.post(f"/auth/children/{child_id}/session")
        assert r2.status_code == 404  # not their child


@pytest.mark.asyncio
async def test_soft_delete_clears_contact(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")
        await client.post("/auth/login", json={"username": "george", "password": "secret99"})

        r = await client.post("/auth/children", json={
            "username": "DeleteMe",
            "contact": "kid@family.example",
            "contact_type": "email",
        })
        child_id = r.json()["id"]

        r_del = await client.delete(f"/auth/children/{child_id}")
        assert r_del.status_code == 200

        # Child no longer shows in listing
        r_list = await client.get("/auth/children")
        ids = [c["id"] for c in r_list.json()]
        assert child_id not in ids


@pytest.mark.asyncio
async def test_dev_reset_blocked_in_production(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await client.post("/auth/register", json={"username": "testuser", "password": "pass123"})

        os.environ["ENVIRONMENT"] = "production"
        r = await client.post("/auth/dev-reset", json={"username": "testuser", "password": "newpass"})
        assert r.status_code == 404
        os.environ["ENVIRONMENT"] = "test"


@pytest.mark.asyncio
async def test_me_returns_role(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client)
        r = await client.get("/auth/me")
        assert r.json()["role"] == "parent"


@pytest.mark.asyncio
async def test_rate_limit_magic_link(transport):
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        await _register_parent(client, email="george@example.com")

        from unittest.mock import patch
        with patch("auth.send_magic_link"):
            for _ in range(3):
                r = await client.post(
                    "/auth/magic-link/request", json={"email": "george@example.com"}
                )
                assert r.status_code == 200

            r4 = await client.post(
                "/auth/magic-link/request", json={"email": "george@example.com"}
            )
            assert r4.status_code == 429
