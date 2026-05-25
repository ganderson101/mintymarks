# Mindarc — Project Instructions (Claude)

## Goal
Build a minimal but scalable adaptive learning engine. The system should support quiz-based learning that adapts based on user performance.

The MVP should:
- Ask questions in a session
- Score responses
- Identify weak topics
- Adapt future question selection based on performance

---

## Core philosophy
Build the simplest working system first, but design internal architecture so that:

- session length is configurable (NOT hardcoded)
- adaptivity logic is isolated from UI and data layers
- question logic is fully separate from presentation
- system can scale without rewrites, only component upgrades

Avoid embedding assumptions into the core engine.

---

## Recommended tech stack
- Python (core logic)
- FastAPI (optional API layer, only if needed)
- JSON for MVP data storage (upgradeable to SQLite later)
- Simple frontend (Streamlit for speed OR React for production feel)

Do NOT introduce heavy frameworks or infrastructure early.

---

## System architecture

### 1. Question Engine
Responsible for:
- storing questions
- returning filtered question sets
- managing question metadata

### Question schema must include:
- id
- question text
- multiple choice options (A–D)
- correct answer
- topic tag
- difficulty (initial heuristic only)

This layer must remain purely data-driven.

---

### 2. Session Engine (critical abstraction)
Responsible for:
- controlling quiz flow
- determining number of questions per session (NOT hardcoded)
- requesting questions from Question Engine
- managing progression through a session

Session behaviour must be configurable.

No UI logic or adaptivity logic should exist here.

---

### 3. Adaptation Engine
Responsible for:
- tracking user performance per topic
- calculating weakness scores per topic
- influencing question selection probabilities

### MVP adaptive model:
- track accuracy per topic
- compute weakness score = 1 - accuracy
- selection bias:
  - 70% probability: weak topics
  - 30% probability: random topics

No machine learning in MVP.

---

## MVP requirements
- End-to-end working quiz session
- Dynamic question delivery via Session Engine
- Basic scoring system
- Weak topic detection
- Simple adaptive selection logic

Must work as a complete loop:
Start → Questions → Results → Weakness output

---

## Constraints
- Keep implementation minimal
- Avoid premature optimisation
- Avoid complex architecture (no microservices, no distributed systems)
- Do not hardcode session length or behaviour into UI
- Maintain strict separation of concerns
- Prefer simplicity over extensibility unless it blocks future growth

---

## Data principles
- All questions must be data-driven
- No logic embedded inside UI layer
- No hardcoded subject rules (GCSE is just data, not logic)

---

## Future directions (DO NOT IMPLEMENT YET)
- spaced repetition system
- AI-generated questions
- difficulty calibration models
- personalised learning paths
- analytics dashboards
- multi-device sync
- gamification layer

---

## Development rule
If a decision is unclear:
- choose the simplest working solution
- ensure it does not violate architecture boundaries
- keep moving forward

---

## Success definition
The MVP is successful when:
- a user can complete a session of questions
- results are shown clearly
- weak topics are identified
- next session is influenced by past performance

That is the full system loop.