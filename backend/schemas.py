"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional


# -- Auth ---------------------------------------------------------------------

class AuthRequest(BaseModel):
    username: str = Field(min_length=2, max_length=40)
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    username: str


# -- Session save -------------------------------------------------------------

class AnswerIn(BaseModel):
    questionId: str
    category: str
    subject: str = "maths"
    isCorrect: bool
    timeTakenMs: int = 0
    selectedAnswer: str = ""  # option key chosen (A/B/C/D); empty for legacy rows


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


# -- Session detail -----------------------------------------------------------

class SessionAnswerOut(BaseModel):
    questionId: str
    category: str
    isCorrect: bool
    timeTakenMs: int
    selectedAnswer: str     # empty string for sessions saved before this column existed


# -- Progress -----------------------------------------------------------------

class TopicProgress(BaseModel):
    category: str
    subject: str
    attempts: int
    correct: int
    weakness: float         # Laplace-smoothed weakness (0 = strong, 1 = never correct)
    avgTimeSec: Optional[float] = None


# -- Spaced repetition --------------------------------------------------------

class SRSTopicOut(BaseModel):
    category: str
    subject: str
    intervalDays: float
    easeFactor: float
    nextDue: str            # ISO datetime
    lastReviewed: str       # ISO datetime
    isDue: bool             # True if next_due <= now


class SRSUpdateIn(BaseModel):
    subject: str
    category: str
    accuracy: float = Field(ge=0.0, le=1.0)   # fraction correct this session for this topic
    avgTimeSec: Optional[float] = None          # average seconds per question (timing signal)
