"""Progress router — aggregate topic performance per subject across all sessions."""
from fastapi import APIRouter, Depends, Query

from database import get_conn
from schemas import TopicProgress
from auth import get_current_user

router = APIRouter(prefix="/progress", tags=["progress"])


@router.get("/topics", response_model=list[TopicProgress])
def topic_progress(
    subject: str = Query(default="maths", pattern="^(maths|physics|chemistry)$"),
    user=Depends(get_current_user),
):
    with get_conn() as conn:
        rows = conn.execute(
            """SELECT
                   a.category,
                   a.subject,
                   COUNT(*)                                            AS attempts,
                   SUM(a.is_correct)                                  AS correct,
                   AVG(CASE WHEN a.time_taken_ms > 0
                            THEN a.time_taken_ms END) / 1000.0        AS avg_time_sec
               FROM answers a
               JOIN sessions s ON s.id = a.session_id
               WHERE s.user_id = ? AND a.subject = ?
               GROUP BY a.category, a.subject
               ORDER BY a.category""",
            (user["id"], subject),
        ).fetchall()

    result = []
    for r in rows:
        attempts = r["attempts"]
        correct = r["correct"] or 0
        weakness = 1.0 - (correct / attempts) if attempts else 1.0
        result.append({
            "category": r["category"],
            "subject": r["subject"],
            "attempts": attempts,
            "correct": correct,
            "weakness": round(weakness, 4),
            "avgTimeSec": round(r["avg_time_sec"], 1) if r["avg_time_sec"] is not None else None,
        })
    return result
