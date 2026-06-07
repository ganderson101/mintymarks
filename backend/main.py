"""MintyMarks FastAPI application entry point."""
import os
from fastapi import FastAPI, Request
from fastapi.exceptions import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from database import init_db
from auth import COOKIE_NAME
import auth
import avatar
import board
import sessions
import progress
import questions
import feedback

app = FastAPI(title="MintyMarks API", version="1.0.0")

# ALLOWED_ORIGINS env var: comma-separated list of permitted origins.
# Dev default allows the Vite dev server; production sets this to the NAS origin.
_raw_origins = os.environ.get(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,   # required for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(avatar.router)
app.include_router(board.router)
app.include_router(sessions.router)
app.include_router(progress.router)
app.include_router(questions.router)
app.include_router(feedback.router)


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """On 401, clear any stale auth cookie so the browser doesn't keep sending it.
    This handles the case where a JWT is present but the user row is gone (e.g.
    after a DB reset), which would otherwise trap the user in a silent auth loop."""
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
    if exc.status_code == 401 and COOKIE_NAME in request.cookies:
        response.delete_cookie(key=COOKIE_NAME, path="/")
    return response


@app.on_event("startup")
def startup():
    init_db()


@app.get("/healthz")
def health():
    return {"ok": True}
