"""Auth router — magic-link login, child profiles, session management.

Parent login: POST /auth/magic-link/request  →  POST /auth/magic-link/verify
Child create: POST /auth/children   (parent session required)
Child login:  POST /auth/children/{id}/magic-link  (sends link to child contact)
              POST /auth/children/{id}/session      (tap-a-profile, no contact needed)
Soft-delete:  DELETE /auth/children/{id}

Auth state is carried via an httpOnly cookie containing a signed JWT.
httpOnly prevents JavaScript from reading the token, mitigating XSS token theft.

Legacy password endpoints (register / login) are retained for backward compatibility
but new accounts should use magic-link.
"""
import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt_lib

from fastapi import APIRouter, HTTPException, Response, Request, Depends, status, Cookie
from jose import jwt, JWTError

from database import get_conn
from email_sender import send_magic_link, DEV_MODE
from schemas import (
    AuthRequest, UserOut,
    MagicLinkRequestIn, MagicLinkVerifyIn, UpdateEmailIn,
    ChildCreateIn, ChildProfileOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Crypto / JWT helpers ──────────────────────────────────────────────────────

def _hash_password(plain: str) -> str:
    return _bcrypt_lib.hashpw(plain.encode(), _bcrypt_lib.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    if not hashed or not hashed.startswith("$2"):
        return False  # sentinel / passwordless account — never matches
    try:
        return _bcrypt_lib.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


if os.environ.get("ENVIRONMENT", "").lower() == "production":
    _SECRET = os.environ.get("MINTYMARKS_SECRET", "")
    if not _SECRET or _SECRET.startswith("changeme"):
        raise RuntimeError("MINTYMARKS_SECRET must be a strong random value in production")
else:
    _SECRET = os.environ.get("MINTYMARKS_SECRET", "changeme-in-production-use-a-long-random-string")
_ALGORITHM = "HS256"
_EXPIRE_DAYS = 7
_CHILD_SESSION_HOURS = 4
COOKIE_NAME = "mintymarks_token"
# Rate-limit thresholds for /auth/login (failed attempts only)
_LOGIN_MAX_PER_USERNAME = 10   # per rolling hour per username
_LOGIN_MAX_PER_IP = 20         # per rolling hour per IP
_LOGIN_WINDOW_SECONDS = 3600   # 1 hour
_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"

_MAGIC_LINK_EXPIRY_MINUTES = 30
_MAGIC_LINK_RATE_LIMIT = 3      # max tokens per user per hour


def _make_token(user_id: int, hours: float | None = None, days: int | None = None) -> str:
    if hours is not None:
        exp = datetime.now(timezone.utc) + timedelta(hours=hours)
    else:
        exp = datetime.now(timezone.utc) + timedelta(days=days or _EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, _SECRET, algorithm=_ALGORITHM)


def _set_auth_cookie(response: Response, token: str, request: Request | None = None):
    secure = _COOKIE_SECURE
    if request:
        proto = request.headers.get("x-forwarded-proto", "").lower()
        if proto == "https":
            secure = True
        elif proto == "http":
            secure = False

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        secure=secure,
        max_age=60 * 60 * 24 * _EXPIRE_DAYS,
        path="/",
    )


def _sha256(value: str) -> str:
    return hashlib.sha256(value.encode()).hexdigest()


# ── Dependencies ──────────────────────────────────────────────────────────────

def get_current_user(mintymarks_token: str | None = Cookie(default=None)) -> dict:
    if not mintymarks_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(mintymarks_token, _SECRET, algorithms=[_ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, username, role, parent_id, deleted_at FROM users WHERE id = ?",
            (user_id,),
        ).fetchone()
    if not row or row["deleted_at"] is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"] or "parent",
        "parent_id": row["parent_id"],
    }


def get_current_parent(user: dict = Depends(get_current_user)) -> dict:
    if user.get("role") != "parent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parent access required")
    return user


# ── Magic-link helpers ────────────────────────────────────────────────────────

def _purge_expired_tokens(conn) -> None:
    now = datetime.now(timezone.utc).isoformat()
    conn.execute(
        "DELETE FROM magic_link_tokens WHERE used = 1 OR expires_at < ?",
        (now,),
    )


def _check_rate_limit(conn, user_id: int) -> None:
    if DEV_MODE:
        # In console/dev mode no email is sent, so the per-hour issuance limit
        # serves no anti-spam purpose and only blocks local testing.
        return
    cutoff = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
    row = conn.execute(
        "SELECT COUNT(*) AS cnt FROM magic_link_tokens WHERE user_id = ? AND created_at > ?",
        (user_id, cutoff),
    ).fetchone()
    if row["cnt"] >= _MAGIC_LINK_RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login requests — try again in an hour",
        )


def _issue_magic_link_token(conn, user_id: int) -> str:
    _check_rate_limit(conn, user_id)
    _purge_expired_tokens(conn)
    raw = secrets.token_urlsafe(32)
    hashed = _sha256(raw)
    expires_at = (
        datetime.now(timezone.utc) + timedelta(minutes=_MAGIC_LINK_EXPIRY_MINUTES)
    ).isoformat()
    conn.execute(
        "INSERT INTO magic_link_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
        (user_id, hashed, expires_at),
    )
    return raw


# ── Routes: magic-link login (parent) ────────────────────────────────────────

@router.post("/magic-link/request", status_code=status.HTTP_200_OK)
def request_magic_link(body: MagicLinkRequestIn):
    """Step 1: parent submits their email address to receive a magic link."""
    email = body.email.strip().lower()
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = ? AND role = 'parent' AND deleted_at IS NULL",
            (email,),
        ).fetchone()
        if not row:
            # Silent: do not reveal whether the email exists.
            return {"ok": True}
        raw_token = _issue_magic_link_token(conn, row["id"])

    link = send_magic_link(email, raw_token)
    resp = {"ok": True}
    # Local/dev only: no email provider configured, so hand the link back to the
    # UI so the user can sign in without a working mailbox. Never populated in
    # production (EMAIL_PROVIDER=smtp/sendgrid), and only for a real account.
    if DEV_MODE:
        resp["dev_login_link"] = link
    return resp


@router.post("/magic-link/verify", response_model=UserOut)
def verify_magic_link(body: MagicLinkVerifyIn, response: Response, request: Request):
    """Step 2: exchange the raw token for an httpOnly-cookie session."""
    token_hash = _sha256(body.token.strip())
    now = datetime.now(timezone.utc).isoformat()

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, user_id, expires_at, used FROM magic_link_tokens WHERE token_hash = ?",
            (token_hash,),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=400, detail="Invalid or expired link")
        if row["used"]:
            raise HTTPException(status_code=400, detail="This link has already been used")
        if row["expires_at"] < now:
            raise HTTPException(status_code=400, detail="This link has expired")

        conn.execute(
            "UPDATE magic_link_tokens SET used = 1 WHERE id = ?",
            (row["id"],),
        )
        user = conn.execute(
            "SELECT id, username, role, parent_id FROM users WHERE id = ? AND deleted_at IS NULL",
            (row["user_id"],),
        ).fetchone()

    if not user:
        raise HTTPException(status_code=400, detail="Account not found")

    _set_auth_cookie(response, _make_token(user["id"]), request)
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"] or "parent",
        "parent_id": user["parent_id"],
    }


# ── Route: update parent email ────────────────────────────────────────────────

@router.patch("/me/email", response_model=UserOut)
def update_email(body: UpdateEmailIn, user: dict = Depends(get_current_parent)):
    """Let an authenticated parent attach or update their email address."""
    email = body.email.strip().lower()
    with get_conn() as conn:
        # Check uniqueness
        existing = conn.execute(
            "SELECT id FROM users WHERE LOWER(email) = ? AND id != ?",
            (email, user["id"]),
        ).fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use")
        conn.execute("UPDATE users SET email = ? WHERE id = ?", (email, user["id"]))
    return {
        "id": user["id"],
        "username": user["username"],
        "role": user["role"],
        "parent_id": user["parent_id"],
    }


# ── Routes: child profiles ────────────────────────────────────────────────────

@router.get("/children", response_model=list[ChildProfileOut])
def list_children(user: dict = Depends(get_current_parent)):
    """List all active child profiles owned by the authenticated parent."""
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT id, username, contact_type, contact, created_at "
            "FROM users WHERE parent_id = ? AND role = 'child' AND deleted_at IS NULL "
            "ORDER BY id",
            (user["id"],),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "username": r["username"],
            "contact_type": r["contact_type"],
            "has_contact": r["contact"] is not None,
            "created_at": r["created_at"],
        }
        for r in rows
    ]


@router.post("/children", response_model=ChildProfileOut, status_code=status.HTTP_201_CREATED)
def create_child(body: ChildCreateIn, user: dict = Depends(get_current_parent)):
    """Create a child profile under the authenticated parent.

    App-layer invariants enforced here:
    - child rows never have email; contact only if parental_consents record written atomically.
    - contact_type must accompany a non-null contact.
    """
    contact = body.contact.strip() if body.contact else None
    ctype = body.contact_type

    if contact and not ctype:
        raise HTTPException(status_code=422, detail="contact_type required when contact is set")
    if ctype and ctype not in ("email", "phone"):
        raise HTTPException(status_code=422, detail="contact_type must be 'email' or 'phone'")
    if not contact:
        contact = None
        ctype = None

    with get_conn() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (username, role, parent_id, contact, contact_type, password_hash) "
                "VALUES (?, 'child', ?, ?, ?, '!')",
                (body.username.strip(), user["id"], contact, ctype),
            )
            child_id = cur.lastrowid
        except Exception:
            raise HTTPException(status_code=409, detail="Child username already taken")

        if contact:
            conn.execute(
                "INSERT INTO parental_consents (child_user_id, parent_user_id) VALUES (?, ?)",
                (child_id, user["id"]),
            )

        row = conn.execute(
            "SELECT id, username, contact_type, contact, created_at FROM users WHERE id = ?",
            (child_id,),
        ).fetchone()

    return {
        "id": row["id"],
        "username": row["username"],
        "contact_type": row["contact_type"],
        "has_contact": row["contact"] is not None,
        "created_at": row["created_at"],
    }


@router.post("/children/{child_id}/magic-link", status_code=status.HTTP_200_OK)
def request_child_magic_link(child_id: int, user: dict = Depends(get_current_parent)):
    """Send a magic link to the child's stored contact address (parent-initiated)."""
    with get_conn() as conn:
        child = conn.execute(
            "SELECT id, contact, contact_type FROM users "
            "WHERE id = ? AND parent_id = ? AND role = 'child' AND deleted_at IS NULL",
            (child_id, user["id"]),
        ).fetchone()
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        if not child["contact"]:
            raise HTTPException(status_code=422, detail="No contact set for this child — use tap-a-profile instead")

        raw_token = _issue_magic_link_token(conn, child["id"])

    send_magic_link(child["contact"], raw_token)
    return {"ok": True}


@router.post("/children/{child_id}/session", response_model=UserOut)
def tap_child_profile(child_id: int, response: Response, request: Request,
                      user: dict = Depends(get_current_parent)):
    """Tap-a-profile: create a ~4h child session scoped to child_id.

    No magic-link needed — the parent's authenticated session authorises this.
    """
    with get_conn() as conn:
        child = conn.execute(
            "SELECT id, username, role, parent_id FROM users "
            "WHERE id = ? AND parent_id = ? AND role = 'child' AND deleted_at IS NULL",
            (child_id, user["id"]),
        ).fetchone()
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    _set_auth_cookie(response, _make_token(child["id"], hours=_CHILD_SESSION_HOURS), request)
    return {
        "id": child["id"],
        "username": child["username"],
        "role": child["role"],
        "parent_id": child["parent_id"],
    }


@router.delete("/children/{child_id}", status_code=status.HTTP_200_OK)
def delete_child(child_id: int, user: dict = Depends(get_current_parent)):
    """Soft-delete a child profile and immediately erase contact PII."""
    now = datetime.now(timezone.utc).isoformat()
    with get_conn() as conn:
        result = conn.execute(
            "UPDATE users SET deleted_at = ?, contact = NULL, contact_type = NULL "
            "WHERE id = ? AND parent_id = ? AND role = 'child' AND deleted_at IS NULL",
            (now, child_id, user["id"]),
        )
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Child not found")
    return {"ok": True}

def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def _check_login_rate_limit(username: str, ip: str) -> None:
    window_start = (datetime.now(timezone.utc) - timedelta(seconds=_LOGIN_WINDOW_SECONDS)).isoformat()
    with get_conn() as conn:
        conn.execute("DELETE FROM login_attempts WHERE attempted_at <= ?", (window_start,))
        username_count = conn.execute(
            "SELECT COUNT(*) FROM login_attempts WHERE username = ? AND attempted_at > ?",
            (username.strip().lower(), window_start),
        ).fetchone()[0]
        if username_count >= _LOGIN_MAX_PER_USERNAME:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Try again in an hour.",
                headers={"Retry-After": str(_LOGIN_WINDOW_SECONDS)},
            )
        ip_count = conn.execute(
            "SELECT COUNT(*) FROM login_attempts WHERE ip_address = ? AND attempted_at > ?",
            (ip, window_start),
        ).fetchone()[0]
        if ip_count >= _LOGIN_MAX_PER_IP:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Try again in an hour.",
                headers={"Retry-After": str(_LOGIN_WINDOW_SECONDS)},
            )


def _record_failed_attempt(username: str, ip: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "INSERT INTO login_attempts (username, ip_address) VALUES (?, ?)",
            (username.strip().lower(), ip),
        )


def _clear_login_attempts(username: str) -> None:
    with get_conn() as conn:
        conn.execute(
            "DELETE FROM login_attempts WHERE username = ?",
            (username.strip().lower(),),
        )
# ── Routes: legacy password auth (backward compatibility) ─────────────────────

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: AuthRequest, response: Response, request: Request):
    hashed = _hash_password(body.password)
    try:
        with get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'parent')",
                (body.username.strip(), hashed),
            )
            user_id = cur.lastrowid
    except Exception:
        raise HTTPException(status_code=409, detail="Username already taken")

    _set_auth_cookie(response, _make_token(user_id), request)
    return {"id": user_id, "username": body.username.strip(), "role": "parent", "parent_id": None}


@router.post("/login", response_model=UserOut)
def login(body: AuthRequest, response: Response, request: Request):
    ip = _get_client_ip(request)
    _check_login_rate_limit(body.username, ip)
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, username, password_hash, role, parent_id FROM users "
            "WHERE username = ? AND deleted_at IS NULL",
            (body.username.strip(),),
        ).fetchone()
    if not row or not _verify_password(body.password, row["password_hash"]):
        _record_failed_attempt(body.username, ip)
        raise HTTPException(status_code=401, detail="Invalid username or password")
    _clear_login_attempts(body.username)
    _set_auth_cookie(response, _make_token(row["id"]), request)
    return {
        "id": row["id"],
        "username": row["username"],
        "role": row["role"] or "parent",
        "parent_id": row["parent_id"],
    }


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: dict = Depends(get_current_user)):
    return user


# ── Dev-only endpoint: guarded at code level ──────────────────────────────────

@router.post("/dev-reset")
def dev_reset(body: AuthRequest):
    """Dev-only: reset a password. Returns 404 in production (code-level guard)."""
    if os.environ.get("ENVIRONMENT", "").lower() == "production":
        raise HTTPException(status_code=404, detail="Not Found")

    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM users WHERE username = ?",
            (body.username.strip(),),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    hashed = _hash_password(body.password)
    with get_conn() as conn:
        conn.execute(
            "UPDATE users SET password_hash = ? WHERE id = ?",
            (hashed, row["id"]),
        )
    return {"ok": True}
