# MIN-114 — New Subject: Vocab (11+ / GL exam board) — CEO Spec

Date: 2026-06-08 · Owner of spec: CEO · Autonomy: execute-safe (author on a branch; merge to `main` is gated)

## What the board asked
A new **Vocab** subject. First tranche = the vocabulary **included or expected for the 11+ exam (GL Assessment board)**.
Quiz = **multiple choice**, where the **options are candidate definitions** of the target word; a **fuller, detailed
dictionary entry lives in the explanation**. CEO to decide which features from existing subjects carry over.

## Architecture finding (verified 2026-06-08)
The stack already supports a new subject + new level with **no engine/backend contract change**:
- Backend `GET /api/questions?level=&subject=` (`backend/questions.py`) filters a flat list generically — it does not
  hard-code subjects or levels. New rows with `subject:"vocab"`, `level:"11plus"` are served automatically.
- Question schema is `{id, level, subject, category, text, options:{A,B,C,D}, correct, difficulty}` with an optional
  **per-question `solution`** string (already rendered in-app via MIN-48/49). The "fuller dictionary entry" is exactly
  this `solution` field — no schema change needed.
- Frontend exposes subjects/levels via small config maps in `src/components/Dashboard.jsx` (`SUBJECTS`, `LEVELS`,
  `LEVEL_LABELS`, `SUBJECT_LABELS`). Adding Vocab = a few lines there.

## CEO decision — features carried over from existing subjects
CARRY OVER (v1):
1. **MCQ A–D** — options are four definitions (1 correct + 3 distractor definitions of *other real words*). (board-specified)
2. **Per-question dictionary entry** via the existing `solution` field: definition · part of speech · example sentence ·
   synonyms (and brief etymology where it aids memory). This is the "fuller dictionary in the explanation". (board-specified)
3. **Difficulty tiers** easy/medium/hard — keyed to word commonness / frequency band.
4. **Topic/category mastery + progress bars** — categories = **thematic word groups** (e.g. Character & Emotion,
   Actions & Movement, Describing Things, Speech & Communication, Conflict & Difficulty, Quantity & Size, Time & Change,
   Thinking & Knowledge). Thematic beats alphabetical for mastery + recall.
5. **Spaced repetition (SRS)** — subject-agnostic, already in the engine; vocab is the canonical SRS use case, so it
   works for free.
6. **Gamification (coins / avatar)** — subject-agnostic, automatic.
7. **Gate chain** — answer-verifier (dictionary correctness is the critical gate), test-guardian, release-verifier.

ADAPT / DEFER (not blocking v1):
- Concept `explanations.js` per-category intro panels — optional light add later; not required for v1.
- External YouTube/resource links (resource-curator) — low value for vocab; defer or swap for a dictionary link later.
- Worked-solution UI already renders `solution`; reused as-is to show the dictionary entry — no new UI needed for v1.
- Reverse-direction items (definition → pick the word) — deferred to a later wave; v1 = word → pick definition only.

DROP: numeric worked solutions (N/A for vocab).

## v1 content scope
- One MCQ per distinct 11+ GL word, `subject:"vocab"`, `level:"11plus"`, thematic `category`.
- v1 target: **≥300 distinct words** with full `solution` dictionary entries, even correct-answer spread across A–D,
  distractors = plausible definitions of *other* words (near-misses, not absurd). Then expand in waves toward
  comprehensive GL coverage (mirror the science content program).
- IDs: `11plus_vocab_<themeslug>_NNNN`.
- Append-only to `backend/questions.json`; keep `src/data/questions.js` vocab in sync. **Never run generateQuestions.mjs.**

## Delegation
- **MIN-115 (question-author)** — compile the GL 11+ word list + generate the vocab MCQ bank with dictionary `solution`s.
- **MIN-116 (frontend-engineer)** — wire `vocab` subject + `11plus` level into Dashboard config; confirm `solution`
  renders as the dictionary entry for vocab. Parallel to MIN-115 (only needs the agreed keys, not the content).

## Gate chain before merge to `main` (HARD GATES — not waived)
1. **answer-verifier** — every word→correct-definition mapping is dictionary-accurate; distractors are wrong-but-plausible. (HARD)
2. **test-guardian** — engine + bank load green with the new subject/level. (HARD)
3. **safety-privacy** — sanity check: vocab adds **no new data collection** (PASS expected; only blocking if that changes).
4. **release-verifier** — build/deploy GO. (HARD)

CEO routes the gate chain after both build issues land on `feat/min114-vocab-11plus`; auto-route per CONTINUITY (MIN-6).
