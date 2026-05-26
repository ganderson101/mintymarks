"""Feedback endpoints — temporary feature for content QA during testing."""
import os
from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel

from auth import get_current_user
from database import get_conn

router = APIRouter(prefix="/feedback", tags=["feedback"])

# Comma-separated list of usernames that may access admin endpoints.
# Set ADMIN_USERNAMES in your docker-compose env or .env file.
# e.g.  ADMIN_USERNAMES=george,admin
_ADMIN_USERNAMES = {
    u.strip().lower()
    for u in os.environ.get("ADMIN_USERNAMES", "george").split(",")
    if u.strip()
}


def _require_admin(user=Depends(get_current_user)):
    if user["username"].lower() not in _ADMIN_USERNAMES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return user


class ExplanationMismatchReport(BaseModel):
    questionId: str
    questionText: str = ""
    category: str = ""
    level: str = ""
    subject: str = ""


@router.post("/explanation-mismatch", status_code=201)
def report_explanation_mismatch(body: ExplanationMismatchReport, request: Request):
    """
    Logged when a user flags that an explanation doesn't match its question.
    Stored in explanation_reports — query with:
        SELECT * FROM explanation_reports ORDER BY reported_at DESC;
    """
    # Pull user_id from session cookie if present (non-fatal if absent)
    user_id = getattr(request.state, "user_id", None)

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO explanation_reports
                (question_id, question_text, category, level, subject, user_id)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (body.questionId, body.questionText, body.category,
             body.level, body.subject, user_id),
        )

    return {"ok": True}


class GeneralFeedback(BaseModel):
    message: str
    questionId: str = ""
    questionText: str = ""
    category: str = ""
    level: str = ""
    subject: str = ""


@router.post("/general", status_code=201)
def submit_general_feedback(body: GeneralFeedback, request: Request):
    """
    Free-text bug reports and feature suggestions from test users.
    Stored in general_feedback — query with:
        SELECT * FROM general_feedback ORDER BY submitted_at DESC;
    """
    user_id = getattr(request.state, "user_id", None)

    with get_conn() as conn:
        conn.execute(
            """
            INSERT INTO general_feedback
                (message, question_id, question_text, category, level, subject, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (body.message, body.questionId, body.questionText,
             body.category, body.level, body.subject, user_id),
        )

    return {"ok": True}


# ── User read endpoints (any logged-in user) ──────────────────────────────────

@router.get("/general")
def get_general_feedback(user=Depends(get_current_user)):
    """Return all general feedback, newest first. Any logged-in user can read."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, submitted_at, user_id, message,
                   category, level, subject, question_id, question_text
            FROM   general_feedback
            ORDER  BY submitted_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/mismatches")
def get_explanation_mismatches(user=Depends(get_current_user)):
    """Return all explanation-mismatch reports, newest first. Any logged-in user can read."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, reported_at, user_id,
                   question_id, question_text, category, level, subject
            FROM   explanation_reports
            ORDER  BY reported_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]


# ── Admin read endpoints ───────────────────────────────────────────────────────

@router.get("/admin/general")
def admin_get_general_feedback(_admin=Depends(_require_admin)):
    """Return all general feedback, newest first. Requires admin login."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, submitted_at, user_id, message,
                   category, level, subject, question_id, question_text
            FROM   general_feedback
            ORDER  BY submitted_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/admin/mismatches")
def admin_get_explanation_mismatches(_admin=Depends(_require_admin)):
    """Return all explanation-mismatch reports, newest first. Requires admin login."""
    with get_conn() as conn:
        rows = conn.execute(
            """
            SELECT id, reported_at, user_id,
                   question_id, question_text, category, level, subject
            FROM   explanation_reports
            ORDER  BY reported_at DESC
            """
        ).fetchall()
    return [dict(r) for r in rows]


@router.get("/admin/summary")
def admin_feedback_summary(_admin=Depends(_require_admin)):
    """High-level counts — quick health check without reading every row."""
    with get_conn() as conn:
        general_count = conn.execute("SELECT COUNT(*) FROM general_feedback").fetchone()[0]
        mismatch_count = conn.execute("SELECT COUNT(*) FROM explanation_reports").fetchone()[0]
        recent_general = conn.execute(
            "SELECT submitted_at, message FROM general_feedback ORDER BY submitted_at DESC LIMIT 5"
        ).fetchall()
        recent_mismatches = conn.execute(
            "SELECT reported_at, question_text, category FROM explanation_reports ORDER BY reported_at DESC LIMIT 5"
        ).fetchall()
    return {
        "general_feedback_total": general_count,
        "explanation_mismatches_total": mismatch_count,
        "recent_general": [dict(r) for r in recent_general],
        "recent_mismatches": [dict(r) for r in recent_mismatches],
    }
