# MIN-126 — Statistics spec for the User Statistics page (MIN-125)

Authored by CEO (pedagogy consult folded in — George flagged it as optional "maybe probably").
Grounded in the *actual* data model verified in `backend/sessions.py` + `backend/progress.py`.

## Data available (ground truth)
- `sessions(id, user_id, subject, level, score, total, started_at, completed_at)`.
- `answers(id, session_id, question_id, category, subject, is_correct, time_taken_ms, selected_answer)`.
- Existing helpers in `progress.py`: `_laplace_weakness(correct, attempts) = 1 - (correct+1)/(attempts+2)`; mastery ladder via recent window (last 10 attempts/topic): **Not started → Just started (<3 recent) → Building it → Strong (≥0.67) → Mastered ⭐ (≥5 recent & ≥0.90)**.
- **Reuse these exact formulas** so the stats page and the in-quiz adaptive engine never disagree.

> ⚠️ Pre-existing gap to honour: `progress.py` hardcodes `subject` regex to `maths|physics|chemistry|biology` and `list_sessions` is `LIMIT 50`. The new stats endpoint must be **subject-agnostic** (derive the subject/level list from the user's own rows — vocab/11+ now exists) and must read **all** sessions, not the 50-row history cap.

---

## 1. The stat set

### Tier 0 — Hero summary (always visible, the "simple" default view)
| Stat | Definition | Source | Why it matters |
|---|---|---|---|
| Questions answered | `COUNT(answers)` all-time | answers | The headline number a child feels proud of. |
| Days practised | distinct `date(completed_at)` in user TZ | sessions | Effort/consistency, not just score. |
| Current streak | consecutive active days ending today/yesterday | sessions | The motivator George named. |
| Overall accuracy | `SUM(is_correct)/COUNT(*)` — **only if ≥ 20 answers**, else hidden | answers | Honest signal; suppressed when noisy. |

### Tier 1 — Activity (tap the hero to expand)
- **Per-day activity**: `[{date, questions, correct, sessions}]` for active days → drives a compact calendar/heatmap + "questions per day" bar.
- **Longest streak** ever (alongside current).
- **This-week vs last-week** question count (simple momentum arrow ↑/↓/→), shown only with ≥ 2 active weeks.
- **Best day** (most questions in one day) — a light gamified highlight.

### Tier 2 — By subject → level → topic (the drill-down spine)
For each `(subject, level, category)` the user has touched:
- attempts, accuracy, `masteryState`, `weakness` (Laplace), `avgTimeSec`, `lastPracticed`.
- `touched` flag at every level of the tree so the frontend can collapse/hide untouched branches.

### Tier 3 — Weak topics (surfaced, see §2) and Review-due (SRS)
- **Topics due for review**: count + list from `GET /progress/srs` `isDue`. Framed "X topics ready to review" (positive, not "overdue").

### Recommended extra stats (pedagogically valuable, all derivable, opt-in to implement)
- **Mastery distribution**: how many topics at each ladder rung — a one-line stacked bar; tangible sense of progress.
- **Accuracy trend**: rolling accuracy over the last N sessions (sparkline) — *only* with ≥ 5 sessions (see thresholds). Shows improvement, the single most motivating signal for a learner.
- **Speed trend** (avg `time_taken_ms`): only as "getting quicker on topics you've mastered" — never frame raw speed as good/bad for unmastered topics (rushing ≠ learning).

Do **not** invent stats requiring data we don't store (e.g. no per-question difficulty trend unless `difficulty` is in `answers` — it is not; skip it).

---

## 2. Weak-topic surfacing
- **Ranking key**: descending `weakness` (Laplace), **but only among topics with `attempts ≥ MIN_ATTEMPTS_TO_JUDGE` (3)** — never call a topic "weak" off 1–2 questions (Laplace already damps this, the floor makes it explicit).
- Show the **top 3** weak topics by default; "see all" expands.
- **Constructive framing (load-bearing for safety-privacy)**: label the section **"Topics to practise next"**, not "Your weaknesses". Each row: topic name + a "Practise" button that deep-links into a quiz scoped to that subject/level/topic. Pair each with its `masteryState` so it reads as a ladder ("Building it → Strong"), not a verdict.
- If every touched topic is "Strong"/"Mastered", show a celebratory empty state ("No weak spots right now — try a harder level!") instead of forcing 3 rows.

---

## 3. "Not enough data" thresholds (George's "clever enough to know")
Each stat carries a `hasEnoughData` boolean from the backend; the UI shows the friendly fallback when false.

| Stat | Minimum to show | Fallback copy |
|---|---|---|
| Topic weakness / "weak" label | ≥ 3 attempts on that topic | (topic shown as "Just started — keep going") |
| Per-topic accuracy % | ≥ 5 attempts | "Not enough yet" |
| Overall accuracy | ≥ 20 answers total | hide the % entirely |
| Accuracy/speed trend | ≥ 5 completed sessions across ≥ 3 distinct days | "Practise a few more days to see your trend" |
| Per-day average | ≥ 3 active days | hide the average |
| Streak | always (0 is valid and shown as "Start a streak today!") | n/a |
| Mastery distribution | ≥ 1 topic with ≥ 3 attempts | "Answer a few questions to unlock" |

Global rule: a **brand-new user** (0 sessions) sees only a warm onboarding card ("Do a quiz and your stats will appear here"), no empty scaffolding.

---

## 4. Streak definition
- **Day boundary**: the **user's local timezone**. The client knows its TZ; pass an IANA tz (or UTC offset) to the endpoint as a query param (e.g. `?tz=Europe/London`), default UTC. Bucket `completed_at` by local calendar date.
- **Active day** = ≥ 1 session completed that day (≥ 1 answered question).
- **Current streak** = count of consecutive active days ending **today or yesterday** (yesterday-grace so a streak isn't shown broken before the child has practised today). If the last active day is older than yesterday, current streak = 0.
- **Longest streak** = max run of consecutive active days ever.
- No "freeze"/skip tokens in v1 (keep it honest and simple).

---

## 5. Untouched subjects/levels
- The tree is built **only from rows the user has** — untouched `(subject, level)` combos simply don't appear in Tier 2.
- A single collapsed footer line lists what's available but unstarted: "Not started yet: Chemistry (GCSE), Vocab (11+) — tap to begin." One row, minimal space, doubles as discovery. Never render an expanded empty branch.

---

## 6. Drill-down hierarchy (mobile-first, progressive disclosure)
```
Overview (hero: questions, days, streak, accuracy)
  └─ tap "Activity"  → calendar/heatmap + per-day bars + streak detail
  └─ tap a subject   → that subject's levels (accuracy + mastery mini-bar each)
        └─ tap a level → topics list (sorted weakest-actionable first)
              └─ tap a topic → attempts, accuracy, mastery, avg time, [Practise]
  └─ "Topics to practise next" (top 3 weak) — always one tap from overview
  └─ History (existing list) → tap a session → per-question answers (existing /answers)
        └─ each session row has a … → Delete (with confirm, §7)
```
Each screen shows **one level of depth**; back-navigation returns up the tree. No screen should require horizontal scroll at 360 px width.

---

## 7. Delete-with-confirm (also a safety requirement)
- Delete lives on the **session row in History** (where the user already sees individual sessions), via a confirm dialog: "Delete this session? Its questions will be removed from your statistics. This can't be undone." → Cancel / Delete.
- On confirm: `DELETE /sessions/{id}` (already implemented; cascades the answer rows). Because all stats are **derived live**, every figure updates on the next fetch — no extra wiring.

---

## 8. Safety-privacy notes (for the gate)
- All data shown is the **child's own** — no new collection, no new transmission, deletion is privacy-positive. Additive read-only endpoint.
- **Tone**: weak topics framed as "practise next" with a mastery ladder, never as failure. Celebratory empty states. This is the main AADC consideration — the page must not be capable of making a struggling child feel judged.
- No comparison to other children, no leaderboards, no streak-loss guilt mechanics.

---

## Handoff
- **MIN-127 (backend)** implements the endpoint to these definitions (live-derived, subject-agnostic, all sessions, `tz` param, `hasEnoughData` + `touched` flags, reuse `_laplace_weakness`/`_mastery_state`).
- **MIN-128 (frontend)** implements §6 hierarchy + §1 stats + §2 framing + §3 fallbacks + §5 collapse + §7 delete.
