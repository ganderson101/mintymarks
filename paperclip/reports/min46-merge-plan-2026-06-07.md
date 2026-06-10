# MIN-46 — board-approved merge plan (ready to run when the tree is clean)

**Date:** 2026-06-07 · **Author:** CEO · **Status:** approved by George (request_confirmation `b3b6367f` = accepted), execution DEFERRED — shared working tree is mid-merge by another agent.

## Why deferred (not failed)
The shared repo working tree is currently **mid-merge**: another agent is landing
`origin/feat/min57-login-rate-limiting` → `main` with unresolved conflicts in `backend/auth.py` and
`backend/database.py` (`.git/MERGE_HEAD` present, `UU` status). I must not commit on top of someone
else's unresolved conflict, so the MIN-46 merge waits for the tree to return to a clean `main`.

## CRITICAL — do NOT do a plain `git merge feat/min46-perq-solutions`
The branch diverged from an old main. Its `backend/questions.json` is the **old broken regeneration**:
- branch `backend/questions.json`: total 18,681 — maths 13,906, physics 4,255, biology 520, **chemistry 0**
- main `backend/questions.json`: total **19,848** — maths 14,638, physics 4,255, **chemistry 735**, biology 220

A full merge would **clobber main's chemistry (735) and MIN-7's +732 maths.** Do a **scoped file-level
integration** instead, and never touch `backend/questions.json`.

## What is safe to take from the branch (verified this run)
- `src/data/questions.js` — diff vs main is **only the 400 KS3 Forces `solution` fields** (base == main for
  this file; main's frontend bank has no MIN-7 maths, those live only in backend). bio 520, total 18,681.
- `scripts/generateQuestions.mjs` — solution emission + biology-preservation logic; main has **no**
  generator changes the branch lacks (`git log feat/min46..main -- scripts/generateQuestions.mjs` empty).
- `src/components/QuestionReview.jsx` (+7) and `src/index.css` (+25) — the "Why this answer" block; main
  has **no** changes to these since branch base.

## Ready-to-run steps (when `git status` on main is clean, no MERGE_HEAD)
```bash
git checkout main                       # ensure on main, clean
git checkout feat/min46-perq-solutions -- \
  src/data/questions.js \
  scripts/generateQuestions.mjs \
  src/components/QuestionReview.jsx \
  src/index.css
# DO NOT stage or touch backend/questions.json

# Verify frontend bank gained solutions, lost nothing:
node -e "const m=require('./src/data/questions.js');const Q=m.QUESTIONS;const s={};Q.forEach(q=>s[q.subject]=(s[q.subject]||0)+1);console.log('total',Q.length,'sol',Q.filter(q=>q.solution).length,'subj',JSON.stringify(s));"
#   expect: total 18681  sol 400  subj {maths:13906,physics:4255,biology:520}

# Verify backend bank UNCHANGED (chemistry + MIN-7 maths preserved):
git diff --stat backend/questions.json    # expect: no output

npx vitest run        # expect all green (29/29 on the MIN-46 base; main may have more)
npm run build         # expect clean

git add src/data/questions.js scripts/generateQuestions.mjs src/components/QuestionReview.jsx src/index.css
git commit -m "feat(MIN-46): KS3 Physics Forces per-question worked solutions + review display (board-approved pilot)"
```

## After the merge lands
1. Mark MIN-46 done (pilot shipped) OR keep open as the umbrella and spin the **rollout** child issues:
   - question-author: emit `solution` for the rest of physics (Energy, Waves, Electricity, Matter & Space)
     and biology — **append-only, biology-preserving generator path only** (the lesson from this pilot).
   - answer-verifier: QA each batch (hard gate #1).
   - GCSE/A-level science follows the **Edexcel** spec as the bank grows.
2. Each rollout batch uses the same scoped integration (never clobber `backend/questions.json`).

## Branch state (for reference)
`feat/min46-perq-solutions` tip commits: `166bcd0` (question-author's biology-preserving regen of the
solution fields), `00cdbfc` (CEO's targeted patch), `20377d6` (MIN-49 UI). All reach the same correct
end state for the 4 files above.
