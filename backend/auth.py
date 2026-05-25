"""Auth router — register, login, logout, me.

Passwords are hashed with bcrypt (never stored in plaintext).
Auth state is carried via an httpOnly cookie containing a signed JWT.
httpOnly prevents JavaScript from reading the token, mitigating XSS token theft.
"""
import os
from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt_lib

from fastapi import APIRouter, HTTPException, Response, Depends, status, Cookie
from jose import jwt, JWTError

from database import get_conn
from schemas import AuthRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Crypto helpers (bcrypt 4/5 native API) ────────────────────────────────────

def _hash_password(plain: str) -> str:
    return _bcrypt_lib.hashpw(plain.encode(), _bcrypt_lib.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return _bcrypt_lib.checkpw(plain.encode(), hashed.encode())

# In production, read from environment; here we use a hard default that the
# deploy step must override via the MINDARC_SECRET env var.
_SECRET = os.environ.get("MINDARC_SECRET", "changeme-in-production-use-a-long-random-string")
_ALGORITHM = "HS256"
_EXPIRE_DAYS = 7
COOKIE_NAME = "mindarc_token"

# True in production (HTTPS via Cloudflare Tunnel); False allows cookies over plain HTTP
# for local dev. Override by setting COOKIE_SECURE=false in your dev environment.
_COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "true").lower() != "false"


def _make_token(user_id: int) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, _SECRET, algorithm=_ALGORITHM)


def _set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,       # JS cannot read this cookie
        samesite="lax",      # CSRF protection for same-site requests
        secure=_COOKIE_SECURE,  # True in production (HTTPS); set COOKIE_SECURE=false for local dev
        max_age=60 * 60 * 24 * _EXPIRE_DAYS,
        path="/",
    )


# ── Dependency: current user from cookie ─────────────────────────────────────

def get_current_user(mindarc_token: str | None = Cookie(default=None)) -> dict:
    if not mindarc_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    try:
        payload = jwt.decode(mindarc_token, _SECRET, algorithms=[_ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    with get_conn() as conn:
        row = conn.execute("SELECT id, username FROM users WHERE id = ?", (user_id,)).fetchone()
    if not row:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return {"id": row["id"], "username": row["username"]}


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(body: AuthRequest, response: Response):
    hashed = _hash_password(body.password)
    try:
        with get_conn() as conn:
            cur = conn.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (body.username.strip(), hashed),
            )
            user_id = cur.lastrowid
    except Exception:
        raise HTTPException(status_code=409, detail="Username already taken")

    _set_auth_cookie(response, _make_token(user_id))
    return {"id": user_id, "username": body.username.strip()}


@router.post("/login", response_model=UserOut)
def login(body: AuthRequest, response: Response):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id, username, password_hash FROM users WHERE username = ?",
            (body.username.strip(),),
        ).fetchone()
    if not row or not _verify_password(body.password, row["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    _set_auth_cookie(response, _make_token(row["id"]))
    return {"id": row["id"], "username": row["username"]}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return user


@router.post("/dev-reset")
def dev_reset(body: AuthRequest):
    """Dev-only: reset a password without email verification."""
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
