"""Sessions router — save a completed session, list user history."""
from fastapi import APIRouter, Depends, HTTPException, status

from database import get_conn
from schemas import SessionIn, SessionOut, SessionSaveOut, SessionAnswerOut
from auth import get_current_user

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionSaveOut, status_code=status.HTTP_201_CREATED)
def save_session(body: SessionIn, user=Depends(get_current_user)):
    # Count correct answers server-side — never trust a client-supplied coin amount
    coins_earned = sum(1 for a in body.answers if a.isCorrect)

    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO sessions (user_id, subject, level, score, total, started_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (user["id"], body.subject, body.level, body.score, body.total, body.startedAt),
        )
        session_id = cur.lastrowid

        conn.executemany(
            """INSERT INTO answers (session_id, question_id, category, subject, is_correct, time_taken_ms, selected_answer, used_help)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            [
                (session_id, a.questionId, a.category, a.subject, int(a.isCorrect), a.timeTakenMs, a.selectedAnswer, int(a.usedHelp))
                for a in body.answers
            ],
        )

        if coins_earned > 0:
            conn.execute(
                "UPDATE users SET coins = coins + ? WHERE id = ?",
                (coins_earned, user["id"]),
            )

        row = conn.execute(
            "SELECT id, subject, level, score, total, completed_at FROM sessions WHERE id = ?",
            (session_id,),
        ).fetchone()
        user_row = conn.execute(
            "SELECT coins FROM users WHERE id = ?", (user["id"],)
        ).fetchone()

    percent = round(row["score"] / row["total"] * 100) if row["total"] else 0
    return {
        "id":           row["id"],
        "subject":      row["subject"],
        "level":        row["level"],
        "score":        row["score"],
        "total":        row["total"],
        "percent":      percent,
        "completedAt":  row["completed_at"],
        "coins":        user_row["coins"],
        "coinsEarned":  coins_earned,
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


@router.get("/{session_id}/answers", response_model=list[SessionAnswerOut])
def get_session_answers(session_id: int, user=Depends(get_current_user)):
    """Return the individual answer rows for a specific session (ownership-checked)."""
    with get_conn() as conn:
        sess = conn.execute(
            "SELECT id FROM sessions WHERE id = ? AND user_id = ?",
            (session_id, user["id"]),
        ).fetchone()
        if not sess:
            raise HTTPException(status_code=404, detail="Session not found")
        rows = conn.execute(
            """SELECT question_id, category, is_correct, time_taken_ms, selected_answer, used_help
               FROM answers WHERE session_id = ? ORDER BY id""",
            (session_id,),
        ).fetchall()
    return [
        {
            "questionId": r["question_id"],
            "category": r["category"],
            "isCorrect": bool(r["is_correct"]),
            "timeTakenMs": r["time_taken_ms"],
            "selectedAnswer": r["selected_answer"] or "",
            "usedHelp": bool(r["used_help"]),
        }
        for r in rows
    ]


@router.get("", response_model=list[SessionOut])
def list_sessions(user=Depends(get_current_user)):
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT id, subject, level, score, total, completed_at
               FROM sessions WHERE user_id = ?
               ORDER BY completed_at DESC LIMIT 50""",
            (user["id"],),
        ).fetchall()
    return [
        {
            "id": r["id"],
            "subject": r["subject"],
            "level": r["level"],
            "score": r["score"],
            "total": r["total"],
            "percent": round(r["score"] / r["total"] * 100) if r["total"] else 0,
            "completedAt": r["completed_at"],
        }
        for r in rows
    ]
