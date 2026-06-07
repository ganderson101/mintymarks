"""Seed board accounts and generate per-member login links.

Usage (from the repo root or backend/ dir):
    python backend/seed_board.py

Prerequisites:
    - backend/board_seed_config.json must exist (gitignored, see comment block below).
    - Set DB_PATH env var if your DB is not at backend/mintymarks.db.
    - Set FRONTEND_URL env var if your frontend is not at http://localhost:5173.

Output:
    - Provisions 2 parent accounts + 3 child profiles under George in the DB.
    - Writes 5 magic-link login URLs to backend/board_login_links.txt (gitignored).
    - Links expire in 30 minutes; use them promptly.

board_seed_config.json format (create this file — it is gitignored):
    {
      "children": [
        {"username": "Oscar",   "contact": "oscarmanderson2011@gmail.com"},
        {"username": "Dinski",  "contact": "Dinski2014@gmail.com"},
        {"username": "Amoolar", "contact": "amoolar2017@gmail.com"}
      ]
    }
"""
import hashlib
import json
import os
import secrets
import sqlite3
import sys
from contextlib import contextmanager
from datetime import datetime, timedelta, timezone
from pathlib import Path

# Ensure backend/ is on the path so we can import database for init_db.
_BACKEND = Path(__file__).parent
if str(_BACKEND) not in sys.path:
    sys.path.insert(0, str(_BACKEND))

# ── Paths ─────────────────────────────────────────────────────────────────────

_HERE = Path(__file__).parent
DB_PATH = os.environ.get("DB_PATH", str(_HERE / "mintymarks.db"))
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
CONFIG_PATH = _HERE / "board_seed_config.json"
OUTPUT_PATH = _HERE / "board_login_links.txt"

_MAGIC_LINK_EXPIRY_MINUTES = 30

# ── Parent accounts (adult emails are not PII under AADC) ─────────────────────

PARENTS = [
    {"username": "george",      "email": "ganderson101@gmail.com"},
    {"username": "asia",        "email": "hajdukasia@gmail.com"},
]


# ── DB helpers ────────────────────────────────────────────────────────────────

@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


# ── Seeding ───────────────────────────────────────────────────────────────────

def upsert_parent(conn, username: str, email: str) -> int:
    """Insert parent if email not present; update username if needed. Returns user id."""
    row = conn.execute(
        "SELECT id FROM users WHERE LOWER(email) = ? AND role = 'parent' AND deleted_at IS NULL",
        (email.lower(),),
    ).fetchone()
    if row:
        print(f"  [ok] parent {email!r} already exists (id={row['id']})")
        return row["id"]

    # Check by username in case account exists without email set
    row_by_name = conn.execute(
        "SELECT id, email FROM users WHERE username = ? COLLATE NOCASE AND role = 'parent' AND deleted_at IS NULL",
        (username,),
    ).fetchone()
    if row_by_name:
        conn.execute("UPDATE users SET email = ? WHERE id = ?", (email.lower(), row_by_name["id"]))
        print(f"  [ok] attached email {email!r} to existing user '{username}' (id={row_by_name['id']})")
        return row_by_name["id"]

    cur = conn.execute(
        "INSERT INTO users (username, role, email, password_hash) VALUES (?, 'parent', ?, '!')",
        (username, email.lower()),
    )
    uid = cur.lastrowid
    print(f"  [created] parent {email!r} as '{username}' (id={uid})")
    return uid


def upsert_child(conn, parent_id: int, username: str, contact: str) -> int:
    """Insert child under parent if not present; ensure contact is set. Returns user id."""
    row = conn.execute(
        "SELECT id, contact FROM users "
        "WHERE username = ? COLLATE NOCASE AND parent_id = ? AND role = 'child' AND deleted_at IS NULL",
        (username, parent_id),
    ).fetchone()
    if row:
        if not row["contact"]:
            conn.execute(
                "UPDATE users SET contact = ?, contact_type = 'email' WHERE id = ?",
                (contact, row["id"]),
            )
            conn.execute(
                "INSERT OR IGNORE INTO parental_consents (child_user_id, parent_user_id) VALUES (?, ?)",
                (row["id"], parent_id),
            )
            print(f"  [updated] child '{username}' — contact set (id={row['id']})")
        else:
            print(f"  [ok] child '{username}' already exists with contact (id={row['id']})")
        return row["id"]

    cur = conn.execute(
        "INSERT INTO users (username, role, parent_id, contact, contact_type, password_hash) "
        "VALUES (?, 'child', ?, ?, 'email', '!')",
        (username, parent_id, contact),
    )
    child_id = cur.lastrowid
    conn.execute(
        "INSERT INTO parental_consents (child_user_id, parent_user_id) VALUES (?, ?)",
        (child_id, parent_id),
    )
    print(f"  [created] child '{username}' under parent id={parent_id} (id={child_id})")
    return child_id


def issue_login_link(conn, user_id: int) -> str:
    """Purge stale tokens for user, issue a fresh 30-min magic link, return full URL."""
    now = datetime.now(timezone.utc)
    conn.execute(
        "DELETE FROM magic_link_tokens WHERE user_id = ? AND (used = 1 OR expires_at < ?)",
        (user_id, now.isoformat()),
    )
    raw = secrets.token_urlsafe(32)
    token_hash = _sha256(raw)
    expires_at = (now + timedelta(minutes=_MAGIC_LINK_EXPIRY_MINUTES)).isoformat()
    conn.execute(
        "INSERT INTO magic_link_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        (user_id, token_hash, expires_at),
    )
    return f"{FRONTEND_URL}/auth/verify?token={raw}"


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    if not CONFIG_PATH.exists():
        print(f"ERROR: {CONFIG_PATH} not found.")
        print(
            "Create it with child contact data (see the docstring at the top of this file).\n"
            "It is gitignored — do not commit it."
        )
        sys.exit(1)

    with CONFIG_PATH.open() as f:
        config = json.load(f)

    children_cfg = config.get("children", [])
    if len(children_cfg) != 3:
        print(f"ERROR: expected 3 children in config, got {len(children_cfg)}")
        sys.exit(1)

    # Apply any pending schema migrations before seeding.
    import database as _db
    _db.DB_PATH = DB_PATH
    _db.init_db()

    print(f"\nDB: {DB_PATH}")
    print(f"FRONTEND_URL: {FRONTEND_URL}\n")

    links = []

    with get_conn() as conn:
        print("--- Parents ---------------------------------------------------")
        parent_ids = {}
        for p in PARENTS:
            uid = upsert_parent(conn, p["username"], p["email"])
            parent_ids[p["email"]] = uid

        george_id = parent_ids["ganderson101@gmail.com"]

        print("\n--- Children (under George) -----------------------------------")
        child_ids = {}
        for child in children_cfg:
            cid = upsert_child(conn, george_id, child["username"], child["contact"])
            child_ids[child["username"]] = cid

        print("\n--- Generating login links (30 min expiry) --------------------")
        for p in PARENTS:
            uid = parent_ids[p["email"]]
            link = issue_login_link(conn, uid)
            label = f"{p['username']} ({p['email']})"
            links.append((label, link))
            print(f"  {label}")

        for child in children_cfg:
            cid = child_ids[child["username"]]
            link = issue_login_link(conn, cid)
            label = f"{child['username']} (child, contact: {child['contact']})"
            links.append((label, link))
            print(f"  {label}")

    # Write output file (UTF-8 so links are copy-paste safe on all platforms)
    with OUTPUT_PATH.open("w", encoding="utf-8") as f:
        f.write(f"MintyMarks board login links - generated {datetime.now().isoformat(timespec='seconds')}\n")
        f.write(f"IMPORTANT: each link expires in {_MAGIC_LINK_EXPIRY_MINUTES} minutes and is single-use.\n")
        f.write(f"Paste each link into a browser or forward via Gmail.\n\n")
        for label, link in links:
            f.write(f"{label}\n  {link}\n\n")

    print(f"\nLinks written to: {OUTPUT_PATH}")
    print("Open that file and paste each link into a browser (or Gmail for the recipient).")
    print(f"Links expire in {_MAGIC_LINK_EXPIRY_MINUTES} minutes from now.\n")


if __name__ == "__main__":
    main()
