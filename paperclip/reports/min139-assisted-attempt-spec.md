# Assisted-attempt weighting spec (MIN-139 / MIN-140)

**Parent:** MIN-139 · **Scope:** spec only, no code · **Author:** pedagogy-engineer

A vocab "I don't know how to do this" click now shows `question.solution` (the dictionary
entry), which can reveal the right option. George's ruling: **correct-after-help still counts
as correct** for score/coins/streak; the attempt is flagged `usedHelp: true` and, for *adaptive
selection only*, **counts as weak** so the item recurs until answered unaided. This spec fixes the
exact semantics, smallest change inside the existing machinery.

## Data plumbing (prerequisite for all four rules)
Thread one boolean from the panel to storage — no new subsystem:
`QuestionCard` (panel opened before answering) → `onAnswer(key, usedHelp)` →
`SessionEngine.submit(selectedKey, timeTakenMs, usedHelp=false)` → store on the in-memory
`answers[]` row and in `AnswerIn` (add `usedHelp: bool = false`, `schemas.py` ~L52) →
new column `answers.used_help INTEGER NOT NULL DEFAULT 0` (ALTER-TABLE migration, same pattern as
`selected_answer`, `database.py` L137). Default-false means every legacy row is "unassisted" — no backfill.

## 1. In-session (sessionEngine + adaptationEngine)
An assisted-correct attempt contributes **0 to `weightedCorrect`** but still **+1 to `correct`
and +1 to `attempts`**. Exact rule: in `recordAnswer`, when `usedHelp` is true, force the timing
quality to `0` (same value a wrong answer yields) — `quality = usedHelp ? 0 : answerQuality(isCorrect, timeTakenMs)`.
Effect: `correct` (hence session score) is unchanged; `computeWeakness` —
`1 − (weightedCorrect+1)/(attempts+2)` — rises for that category, so `selectTopic`'s 70% weak
branch favours it for the rest of the session. **Declaration is untouched and honest:**
`isConfidentWeakness` uses *raw* `correct`/`attempts`, and an assisted attempt is still raw-correct,
so a child who only ever answered correctly (with help) is never *told* they are "weak" — only the
selector treats it as weak. That is exactly the boundary we want.

## 2. Cross-session (progress.py weakness seed)
Define `credited_correct = is_correct AND NOT used_help`. The Laplace **weakness** value returned by
`GET /progress/topics` (which seeds `initialPerformance`) uses `SUM(credited_correct)` in place of
`SUM(is_correct)` in `_laplace_weakness(correct, attempts)` **only**. So an assisted-correct row
counts as incorrect *for the selection seed* and the category stays weak across sessions until
answered unaided.
**Must NOT touch (all keep raw `is_correct`):** session `score`/`percent`/`total` (stored on the
session row), `coins`, `correct`, `accuracy`, `recentCorrect`, `recentMastery`, `masteryState`, and the
entire `GET /progress/overview` rollup. Justification: those are *honest performance display* —
the child did answer correctly and must see it that way; weakness is the *only* signal whose job is
"what to re-serve," so it is the only one that should discount help.

## 3. Recurrence granularity
Vocab selection is category-level; George wants *the word* back. Cheapest faithful mechanism, no SRS:
- **In-session:** an assisted attempt does **not** add its `questionId` to the dedupe exclusion
  (`askedIds`) — the word stays eligible and, combined with the §1 category weakness boost, can be
  re-served the same session. An unaided correct on the re-serve excludes it normally.
- **Cross-session:** rely on the §2 category weakness boost only — no per-word store. The word's
  category is favoured next session, and within it the word is re-selectable. Per-word cross-session
  precision is explicitly out of scope (would need a new per-question SRS subsystem George ruled out).

## 4. Scope — all subjects
`usedHelp` is recorded and weighted for **every subject**, not vocab-only. Justification (2 lines):
(a) the engines are deliberately subject-agnostic — `CLAUDE.md` forbids hardcoded subject rules, so
branching on "vocab" inside `recordAnswer`/`progress.py` would violate the architecture; (b) opening
help before answering is a genuine weakness signal everywhere, and the penalty is review-only —
it never reduces score, coins, or streak — so it cannot discourage children from using help.
