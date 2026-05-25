"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional


# ── Auth ──────────────────────────────────────────────────────────────────────

class AuthRequest(BaseModel):
    username: str = Field(min_length=2, max_length=40)
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    username: str


# ── Session save ──────────────────────────────────────────────────────────────

class AnswerIn(BaseModel):
    questionId: str
    category: str
    subject: str = "maths"
    isCorrect: bool
    timeTakenMs: int = 0


class SessionIn(BaseModel):
    subject: str = "maths"
    level: str
    score: int
    total: int
    startedAt: str          # ISO string from the client
    answers: list[AnswerIn]


class SessionOut(BaseModel):
    id: int
    subject: str
    level: str
    score: int
    total: int
    percent: int
    completedAt: str


# ── Progress ──────────────────────────────────────────────────────────────────

class TopicProgress(BaseModel):
    category: str
    subject: str
    attempts: int
    correct: int
    weakness: float         # 1 - accuracy (0 = perfect, 1 = never correct)
    avgTimeSec: Optional[float] = None
