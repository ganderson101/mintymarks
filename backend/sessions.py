"""Sessions router — save a completed session, list user history."""
from fastapi import APIRouter, Depends, HTTPException, status

from database import get_conn
from schemas import SessionIn, SessionOut
from auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def save_session(body: SessionIn, user=Depends(get_current_user)):
    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO sessions (user_id, subject, level, score, total, started_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user["id"], body.subject, body.level, body.score, body.total, body.startedAt),
        )
        session_id = cur.lastrowid

        conn.executemany(
            """INSERT INTO answers (session_id, question_id, category, subject, is_correct, time_taken_ms)
               VALUES (?, ?, ?, ?, ?, ?)""",
            [
                (session_id, a.questionId, a.category, a.subject, int(a.isCorrect), a.timeTakenMs)
                for a in body.answers
            ],
        )

        row = conn.execute(
            "SELECT id, subject, level, score, total, completed_at FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()

    percent = round(row["score"] / row["total"] * 100) if row["total"] else 0
    return {
        "id": row["id"],
        "subject": row["subject"],
        "level": row["level"],
        "score": row["score"],
        "total": row["total"],
        "percent": percent,
        "completedAt": row["completed_at"],
    }


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, user=Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM sessions WHERE id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Session not found")
        conn.execute("DELETE FROM answers WHERE session_id = ?", (session_id,))
        conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))


@router.get("", response_model=list[SessionOut])
def list_sessions(user=Depends(get_current_user)):
    with get_conn() as conn:
        