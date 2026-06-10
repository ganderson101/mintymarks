# MIN-125 — User Statistics page: CEO spec & decomposition (2026-06-08)

## What George asked for
A page where a learner sees much more of their own statistics. Principles, verbatim:
- **Simple by default**, but the user can **drill down by clicking** parts of the display.
- Include: **which days** they practised, **how many questions** done, **how many per day**, and **streak** (days in a row).
- Must **fit a mobile screen** while keeping the user's intuition about how to find what they want.
- **Quickly surface weaker topics.**
- Be **clever enough to know when there isn't enough data** to show a meaningful statistic.
- Subjects/levels the user **hasn't touched take up little/no space**.
- If a user **deletes a session from history, it is also erased from statistics** — **confirm before deleting**.
- Latitude to be **imaginative**; **consult a pedagogy agent** for other worthwhile stats.

## Architecture findings (verified 2026-06-08, MintyMarks repo)
- **Backend (FastAPI, Python).** Per-user data already exists:
  - `backend/sessions.py` — `POST /sessions`, `GET /sessions`, `DELETE /sessions/{id}` (already cascades the row), `GET /sessions/{id}/answers` (per-question rows for drill-down).
  - `backend/progress.py` — `GET /progress/topics` computes **Laplace-smoothed weakness** + a **mastery state** per (subject, category); `GET /progress/srs` exposes spaced-repetition records with an `isDue` flag.
- **Frontend (React, Vite).** `src/api/sessions.js` already wraps all of the above. `Dashboard.jsx` has a History drill-down and topic/SRS surfaces. So we extend, not invent.
- **Key consequence for "delete cascades to stats":** statistics MUST be **derived live from the session/answer rows**, never denormalised into a separate cached table. Then deleting a session automatically removes it from every statistic with no extra cleanup. This is the load-bearing design rule.

## Decomposition (children of MIN-125)
1. **MIN-126 — Pedagogy: define the statistics spec (design only, no code).** Owner: `pedagogy-engineer`. The explicitly-requested consult. Produces the authoritative stat set + thresholds that MIN-127/128 implement.
2. **MIN-127 — Backend: read-only stats aggregation endpoint.** Owner: `backend-engineer`. Blocked on MIN-126. Computes everything live from sessions/answers; deletion cascades for free. + pytest.
3. **MIN-128 — Frontend: the statistics page.** Owner: `frontend-engineer`. Blocked on MIN-126 + MIN-127. Simple default, tap-to-drill-down, mobile-first, untouched subjects collapsed, delete-with-confirm wired to existing `DELETE /sessions/{id}`.

## Gate chain before any merge to main (hard gates, never waived)
- **test-guardian** (HARD) — backend pytest + frontend build/engine green.
- **safety-privacy PASS** (HARD) — this surfaces a child's own learning data and adds a destructive delete-with-confirm; AADC review of what is shown, retention, and the confirm UX.
- **release-verifier GO** (HARD) — build/release check before ship.
All build work lands on a feature branch cut from **origin/main**; nothing merges to main until the three gates pass.

## Autonomy
Posture = execute-safe. Design (MIN-126) and branch-isolated build are reversible and proceed autonomously. The three hard gates hold before merge. No board decision is pending — George gave explicit latitude.
