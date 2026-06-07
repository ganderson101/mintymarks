# MIN-46 — "updating individual question solution calc and displays" — CEO scope analysis

**Date:** 2026-06-07 · **Author:** CEO · **Status:** analysis (escalated to board for a sequencing decision)

George's ask (verbatim):
> When each one of the science questions have got as many questions as maths questions, I then want
> you to methodically look at each question and in the individual explanation include actual
> calculation of numbers or diagram, or whatever clearly show why it was the correct answer in every
> individual case. A QA should also make sure it is correct.

Two things have to be true for this to ship. Neither is true today. I verified both directly against
the repo this heartbeat.

---

## Finding 1 — the precondition (science = maths parity) is a very long way off

Live bank (`src/data/questions.js`, counted this run):

| Subject | Questions | vs maths (13,906) |
|---|---:|---:|
| **maths** | **13,906** | — |
| physics | 4,255 | 31% |
| biology | 520 | 4% |
| **chemistry** | **0** | 0% (subject absent entirely) |

To make *each* science subject match maths, the bank needs roughly:
- physics **+9,651**
- biology **+13,386**
- chemistry **+13,906** (from scratch — no chemistry families exist in the generator)
- **≈ +37,000 new science questions**, authored + answer-verified.

There is **no active workstream** growing the sciences to parity, and a board decision is still open
that gates the GCSE/A-level half of it: **which exam board** (AQA / Edexcel / OCR) — open since MIN-1.
Without that, "complete" science coverage is undefined.

So the literal trigger ("when sciences equal maths") will not fire for a long time, and starting it
is itself a major, board-level commitment of the single Max quota.

## Finding 2 — the deliverable doesn't fit the current data model

Even at parity, the thing George wants — *a per-question worked calculation/diagram showing why this
exact answer is right* — **does not exist as a capability today.**

- Questions carry only: `id, level, subject, category, text, options, correct, difficulty`.
  There is **no per-question explanation / working / solution field** (verified: 0 of 18,681 questions
  have one).
- Explanations live in `src/data/explanations.js`, keyed **per `level`+`category`**, with **one**
  `workedExample {problem, solution}` for the whole strand — not per question.
- The post-answer UI (`src/components/QuestionReview.jsx`) shows that category-level panel
  (keyIdea / body / one worked example / keyFacts / commonMistakes). It never shows a worked solution
  for the specific question the child just answered.

So MIN-46 is really **two** jobs, not one:

1. **Capability (NOT gated by parity):** add a per-question `solution`/`working` field (text + optional
   diagram/figure), teach the generator to emit it, and render it in `QuestionReview` /
   `QuestionCard`. Owners: question-author (generator + `questions.js`), test-guardian (schema/engine
   boundary), frontend-engineer (display), content-factory (any prose styling).
2. **Content fill (the part George gated on parity):** methodically author + QA a correct worked
   solution for every science question. Owner: content-factory to author, **answer-verifier QA = hard
   gate #1** before anything ships ("A QA should also make sure it is correct" — exactly gate #1).

## Why this needs a board decision (not autonomous execution)

The literal sequence — *wait for ~37k new science questions, then hand-author + QA worked solutions
for ~56k science questions in one late pass* — is the most expensive possible ordering on one Max
plan, and it leaves the per-question-solution capability dormant for months.

There is a cheaper ordering that serves the same goal: **build the capability now**, so that every
new science question the bank generates *arrives with its worked solution already attached and
QA'd*. Growing to parity and explaining every question then become **one pass instead of two** — and
existing physics/biology can be backfilled in parallel. This reinterprets George's *sequencing* (not
his goal), and it commits real quota, so it's his call.

## Recommended plan (pending board choice)

1. **Now (cheap, ungated):** question-author + test-guardian add a per-question `solution` field to the
   schema + generator (branch only); frontend-engineer renders it in the review panel; build a small
   **pilot** on one existing strand end-to-end (e.g. KS3 Physics → Forces) → answer-verifier QA →
   show George the real before/after.
2. **Ongoing:** every newly generated science question ships with its worked solution (gate #1 each batch).
3. **Backfill:** content-factory fills existing physics (4.3k) then biology (0.5k); answer-verifier gates each batch.
4. **Chemistry / GCSE+A-level science:** unblock by deciding the exam board first.

## Disposition

Escalated to George via an `ask_user_questions` interaction on MIN-46 (wake_assignee) with the
sequencing fork + this recommendation. MIN-46 held `in_review` on that interaction. No content or
schema changed this run (analysis only).
