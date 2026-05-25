"""Feedback endpoints — temporary feature for content QA during testing."""
from fastapi import APIRouter, Request
from pydantic import BaseModel

from database import get_conn

router = APIRouter(prefix="/feedback", tags=["feedback"])


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
