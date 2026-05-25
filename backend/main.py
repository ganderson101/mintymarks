"""MindArc FastAPI application entry point."""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
import auth
import sessions
import progress

app = FastAPI(title="MindArc API", version="1.0.0")

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
app.include_router(sessions.router)
app.include_router(progress.router)


@app.on_event("startup")
def startup():
    init_db()


@app.get("/healthz")
def health():
    return {"ok": True}
