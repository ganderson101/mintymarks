"""Database init, schema, and connection helper."""
import sqlite3
import os
from contextlib import contextmanager

# In production, set DB_PATH env var to a persistent volume path (e.g. /data/mintymarks.db).
# Falls back to the local directory for development.
DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), "mintymarks.db"),
)

SCHEMA = """
CREATE TABLE IF NOT EXISTS explanation_reports (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id   TEXT    NOT NULL,
    question_text TEXT    NOT NULL DEFAULT '',
    category      TEXT    NOT NULL DEFAULT '',
    level         TEXT    NOT NULL DEFAULT '',
    subject       TEXT    NOT NULL DEFAULT '',
    user_id       INTEGER,
    reported_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS general_feedback (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    message       TEXT    NOT NULL,
    question_id   TEXT    NOT NULL DEFAULT '',
    question_text TEXT    NOT NULL DEFAULT '',
    category      TEXT    NOT NULL DEFAULT '',
    level         TEXT    NOT NULL DEFAULT '',
    subject       TEXT    NOT NULL DEFAULT '',
    user_id       INTEGER,
    submitted_at  TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    username        TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    role            TEXT    NOT NULL DEFAULT 'parent',
    parent_id       INTEGER REFERENCES users(id),
    email           TEXT,
    contact         TEXT,
    contact_type    TEXT CHECK (contact_type IN ('email','phone') OR contact_type IS NULL),
    password_hash   TEXT    NOT NULL DEFAULT '!',
    created_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    deleted_at      TEXT
);

CREATE TABLE IF NOT EXISTS parental_consents (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    child_user_id     INTEGER NOT NULL UNIQUE REFERENCES users(id),
    parent_user_id    INTEGER NOT NULL REFERENCES users(id),
    consented_at      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    consent_mechanism TEXT    NOT NULL DEFAULT 'parent_authenticated_profile_creation'
);

CREATE TABLE IF NOT EXISTS magic_link_tokens (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    token_hash  TEXT    NOT NULL UNIQUE,
    expires_at  TEXT    NOT NULL,
    used        INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    subject      TEXT    NOT NULL DEFAULT 'maths',
    level        TEXT    NOT NULL,
    score        INTEGER NOT NULL,
    total        INTEGER NOT NULL,
    started_at   TEXT    NOT NULL,
    completed_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS answers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id     INTEGER NOT NULL REFERENCES sessions(id),
    question_id    TEXT    NOT NULL,
    category       TEXT    NOT NULL,
    subject        TEXT    NOT NULL DEFAULT 'maths',
    is_correct     INTEGER NOT NULL,
    time_taken_ms  INTEGER NOT NULL DEFAULT 0,
    selected_answer TEXT   NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS board_requests (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id    TEXT    NOT NULL,
    member_name  TEXT    NOT NULL DEFAULT '',
    kind         TEXT    NOT NULL DEFAULT 'text',
    message      TEXT    NOT NULL DEFAULT '',
    audio_path   TEXT    NOT NULL DEFAULT '',
    status       TEXT    NOT NULL DEFAULT 'received',
    ceo_note     TEXT    NOT NULL DEFAULT '',
    preview_url  TEXT    NOT NULL DEFAULT '',
    created_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    updated_at   TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS login_attempts (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    username     TEXT    NOT NULL COLLATE NOCASE,
    ip_address   TEXT    NOT NULL,
    attempted_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS topic_srs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    subject       TEXT    NOT NULL,
    category      TEXT    NOT NULL,
    interval_days REAL    NOT NULL DEFAULT 1.0,
    ease_factor   REAL    NOT NULL DEFAULT 2.5,
    next_due      TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    last_reviewed TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now')),
    UNIQUE(user_id, subject, category)
);
"""



# Migration: add columns to existing databases (safe no-ops if already present)
MIGRATIONS = [
    "ALTER TABLE sessions ADD COLUMN subject TEXT NOT NULL DEFAULT 'maths'",
    "ALTER TABLE answers  ADD COLUMN subject TEXT NOT NULL DEFAULT 'maths'",
    "ALTER TABLE answers  ADD COLUMN selected_answer TEXT NOT NULL DEFAULT ''",
    # MIN-20: users table new columns; existing rows default role='parent'
    "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'parent'",
    "ALTER TABLE users ADD COLUMN parent_id INTEGER",
    "ALTER TABLE users ADD COLUMN email TEXT",
    "ALTER TABLE users ADD COLUMN contact TEXT",
    "ALTER TABLE users ADD COLUMN contact_type TEXT",
    "ALTER TABLE users ADD COLUMN deleted_at TEXT",
]


def init_db():
    """Create tables if they don't exist, then run safe migrations."""
    with get_conn() as conn:
        conn.executescript(SCHEMA)
        for sql in MIGRATIONS:
            try:
                conn.execute(sql)
            except Exception:
                pass  # column already exists -- fine


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
