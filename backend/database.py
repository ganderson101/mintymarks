"""Database init, schema, and connection helper."""
import sqlite3
import os
from contextlib import contextmanager

# In production, set DB_PATH env var to a persistent volume path (e.g. /data/mindarc.db).
# Falls back to the local directory for development.
DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(__file__), "mindarc.db"),
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
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT    NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
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
