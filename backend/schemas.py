"""Pydantic schemas for request/response validation."""
from pydantic import BaseModel, Field
from typing import Optional


# -- Auth (legacy password-based) --------------------------------------------

class AuthRequest(BaseModel):
    username: str = Field(min_length=2, max_length=40)
    password: str = Field(min_length=6, max_length=128)


class UserOut(BaseModel):
    id: int
    username: str
    role: str = "parent"
    parent_id: Optional[int] = None


# -- Magic-link auth ----------------------------------------------------------

class MagicLinkRequestIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)


class MagicLinkVerifyIn(BaseModel):
    token: str = Field(min_length=10, max_length=200)


class UpdateEmailIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)


# -- Child profiles -----------------------------------------------------------

class ChildCreateIn(BaseModel):
    username: str = Field(min_length=1, max_length=40)
    contact: Optional[str] = Field(default=None, max_length=254)
    contact_type: Optional[str] = None  # 'email' or 'phone'


class ChildProfileOut(BaseModel):
    id: int
    username: str
    contact_type: Optional[str]
    has_contact: bool
    created_at: str


# -- Session save -------------------------------------------------------------

class AnswerIn(BaseModel):
    questionId: str
    category: str
    subject: str = "maths"
    isCorrect: bool
    timeTakenMs: int = 0
    selectedAnswer: str = ""  # option key chosen (A/B/C/D); empty for legacy rows
    usedHelp: bool = False


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


class SessionSaveOut(SessionOut):
    """Extended response for POST /sessions — includes coin award."""
    coins: int = 0          # user's updated total coin balance
    coinsEarned: int = 0    # coins awarded for this session


# -- Session detail -----------------------------------------------------------

class SessionAnswerOut(BaseModel):
    questionId: str
    category: str
    isCorrect: bool
    timeTakenMs: int
    selectedAnswer: str     # empty string for sessions saved before this column existed
    usedHelp: bool = False  # False for legacy rows that pre-date this column


# -- Progress -----------------------------------------------------------------

class TopicProgress(BaseModel):
    category: str
    subject: str
    attempts: int
    correct: int
    weakness: float         # Laplace-smoothed weakness (0 = strong, 1 = never correct)
    avgTimeSec: Optional[float] = None
    # Recent-window mastery fields (MIN-62) — accuracy over the most recent N=10 attempts
    recentAttempts: int = 0
    recentCorrect: int = 0
    recentMastery: float = 0.0  # recent_correct / recent_attempts (0–1); 0.0 if no attempts
    masteryState: str = "Not started"  # ladder: Not started / Just started / Building it / Strong / Mastered ⭐


# -- Stats overview (MIN-127) -------------------------------------------------

class DayActivity(BaseModel):
    date: str               # "YYYY-MM-DD" in the requested timezone
    questionsAnswered: int
    correct: int
    sessions: int


class StreakStats(BaseModel):
    current: int
    longest: int
    hasEnoughData: bool


class TotalStats(BaseModel):
    questions: int
    correct: int
    totalTimeSec: float
    sessions: int
    activeDays: int
    hasEnoughData: bool


class TopicRollup(BaseModel):
    topic: str              # category name
    attempts: int
    accuracy: float         # correct / attempts; 0.0 if no attempts
    masteryState: str
    weaknessScore: float    # Laplace-smoothed weakness
    lastPracticed: Optional[str]  # ISO datetime of most recent session
    hasEnoughData: bool
    touched: bool


class LevelRollup(BaseModel):
    level: str
    touched: bool
    topics: list[TopicRollup]


class SubjectRollup(BaseModel):
    subject: str
    touched: bool
    levels: list[LevelRollup]


class StatsOverview(BaseModel):
    perDay: list[DayActivity]
    streak: StreakStats
    totals: TotalStats
    subjects: list[SubjectRollup]
    srsTopicsDueCount: int


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
