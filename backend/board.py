"""Board portal router — token-based auth for family board members.

Board members log in with a per-member invite token stored in board_members.json
(gitignored — never committed).  After a successful /accept the server issues a
signed JWT in the mintymarks_board httpOnly cookie, exactly like the main auth
cookie but scoped to board endpoints.
"""
import json
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Cookie, HTTPException, Request, Response, status
from jose import JWTError, jwt
from pydantic import BaseModel

from board_config import (
    BOARD_COOKIE_MAX_AGE,
    BOARD_COOKIE_NAME,
    BOARD_INBOX_PATH,
    BOARD_MEMBERS_PATH,
    ROADMAP_PATH,
)
from database import get_conn

router = APIRouter(prefix="/api/board", tags=["board"])

_SECRET = os.environ.get("MINTYMARKS_SECRET", "changeme-in-production-use-a-long-random-string")
_ALGORITHM = "HS256"
_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"


# ── Board member helpers ──────────────────────────────────────────────────────

def _load_members() -> list:
    if not BOARD_MEMBERS_PATH.exists():
        return []
    with open(BOARD_MEMBERS_PATH) as f:
        data = json.load(f)
    return data.get("members", [])


def _find_by_token(token: str) -> Optional[dict]:
    for m in _load_members():
        if m.get("token") == token:
            return m
    return None


def _find_by_id(member_id: str) -> Optional[dict]:
    for m in _load_members():
        if m.get("id") == member_id:
            return m
    return None


# ── Cookie / JWT helpers ──────────────────────────────────────────────────────

def _make_board_jwt(member_id: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(seconds=BOARD_COOKIE_MAX_AGE)
    return jwt.encode({"sub": member_id, "exp": exp}, _SECRET, algorithm=_ALGORITHM)


def _decode_board_jwt(token: str) -> str:
    try:
        payload = jwt.decode(token, _SECRET, algorithms=[_ALGORITHM])
        return payload["sub"]
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid board session")


def _set_board_cookie(response: Response, member_id: str, request: Request):
    secure = _COOKIE_SECURE
    proto = request.headers.get("x-forwarded-proto", "").lower()
    if proto == "https":
        secure = True
    elif proto == "http":
        secure = False

    response.set_cookie(
        key=BOARD_COOKIE_NAME,
        value=_make_board_jwt(member_id),
        httponly=True,
        samesite="lax",
        secure=secure,
        max_age=BOARD_COOKIE_MAX_AGE,
        path="/",
    )


def _require_member(mintymarks_board: Optional[str]) -> dict:
    if not mintymarks_board:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Board login required")
    member_id = _decode_board_jwt(mintymarks_board)
    member = _find_by_id(member_id)
    if not member:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Board member not found")
    return member


# ── Timestamps ────────────────────────────────────────────────────────────────

def _now() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# ── Row mapper ────────────────────────────────────────────────────────────────

def _row_to_request(row) -> dict:
    return {
        "id": row["id"],
        "member_id": row["member_id"],
        "member_name": row["member_name"],
        "kind": row["kind"],
        "message": row["message"],
        "audio_path": row["audio_path"],
        "status": row["status"],
        "ceo_note": row["ceo_note"],
        "preview_url": row["preview_url"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


# ── Pydantic schemas ──────────────────────────────────────────────────────────

class AcceptBody(BaseModel):
    token: str


class BoardRequestBody(BaseModel):
    kind: str = "text"
    message: str
    audio_path: Optional[str] = None


class BoardRequestPatch(BaseModel):
    status: Optional[str] = None
    ceo_note: Optional[str] = None
    preview_url: Optional[str] = None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/accept")
def accept(body: AcceptBody, response: Response, request: Request):
    """Validate invite token and issue board session cookie."""
    member = _find_by_token(body.token)
    if not member:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid invite token")
    _set_board_cookie(response, member["id"], request)
    return {"id": member["id"], "name": member["name"], "role": member["role"]}


@router.get("/me")
def me(mintymarks_board: Optional[str] = Cookie(default=None)):
    """Return the currently logged-in board member."""
    member = _require_member(mintymarks_board)
    return {"id": member["id"], "name": member["name"], "role": member["role"]}


@router.post("/requests", status_code=status.HTTP_201_CREATED)
def create_request(
    body: BoardRequestBody,
    mintymarks_board: Optional[str] = Cookie(default=None),
):
    """Submit a board request and write a ticket .md to board-inbox."""
    member = _require_member(mintymarks_board)
    now = _now()

    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO board_requests
               (member_id, member_name, kind, message, audio_path,
                status, ceo_note, preview_url, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'received', NULL, NULL, ?, ?)""",
            (member["id"], member["name"], body.kind, body.message, body.audio_path, now, now),
        )
        request_id = cur.lastrowid

    BOARD_INBOX_PATH.mkdir(parents=True, exist_ok=True)
    ticket = BOARD_INBOX_PATH / f"request-{request_id:04d}-{member['id']}.md"
    ticket.write_text(
        f"# Board Request #{request_id}\n\n"
        f"**From:** {member['name']} (`{member['id']}`)\n"
        f"**Kind:** {body.kind}\n"
        f"**Status:** received\n"
        f"**Created:** {now}\n\n"
        f"## Message\n\n{body.message}\n",
        encoding="utf-8",
    )

    return {"id": request_id, "status": "received", "created_at": now}


@router.get("/requests")
def list_requests(mintymarks_board: Optional[str] = Cookie(default=None)):
    """List board requests. CEO role sees all; members see their own."""
    member = _require_member(mintymarks_board)

    with get_conn() as conn:
        if member.get("role") == "ceo":
            rows = conn.execute(
                "SELECT * FROM board_requests ORDER BY created_at DESC"
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM board_requests WHERE member_id = ? ORDER BY created_at DESC",
                (member["id"],),
            ).fetchall()

    return [_row_to_request(r) for r in rows]


@router.patch("/requests/{request_id}")
def patch_request(
    request_id: int,
    body: BoardRequestPatch,
    mintymarks_board: Optional[str] = Cookie(default=None),
):
    """CEO-only: update status, ceo_note, or preview_url on a request."""
    member = _require_member(mintymarks_board)
    if member.get("role") != "ceo":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CEO only")

    now = _now()
    updates: dict = {"updated_at": now}
    if body.status is not None:
        updates["status"] = body.status
    if body.ceo_note is not None:
        updates["ceo_note"] = body.ceo_note
    if body.preview_url is not None:
        updates["preview_url"] = body.preview_url

    set_clause = ", ".join(f"{k} = ?" for k in updates)
    with get_conn() as conn:
        conn.execute(
            f"UPDATE board_requests SET {set_clause} WHERE id = ?",
            [*updates.values(), request_id],
        )

    with get_conn() as conn:
        row = conn.execute("SELECT * FROM board_requests WHERE id = ?", (request_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Request not found")
    return _row_to_request(row)


@router.get("/releases")
def releases(mintymarks_board: Optional[str] = Cookie(default=None)):
    """Return Done-log items from the roadmap for board members to see."""
    _require_member(mintymarks_board)

    if not ROADMAP_PATH.exists():
        return {"releases": []}

    content = ROADMAP_PATH.read_text(encoding="utf-8")
    items = []
    in_done = False
    for line in content.splitlines():
        stripped = line.strip()
        lower = stripped.lower()
        if lower.startswith("#") and "done" in lower:
            in_done = True
            continue
        if in_done and stripped.startswith("#"):
            in_done = False
        if in_done and stripped.startswith("-"):
            items.append(stripped.lstrip("-").strip())

    return {"releases": items}
