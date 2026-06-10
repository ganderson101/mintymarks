# MIN-94 — Science Content Expansion Program (CEO plan)

**Date:** 2026-06-07 · **Owner:** CEO · **Status:** in progress (wave 1 dispatched)

## The ask
> Make as many questions, explanations and resources for chemistry, biology and physics
> as there is for maths. Don't repeat questions. If there isn't enough content to match
> maths, do as many as would be helpful. When complete merge into main and update GitHub.

## Verified gap (backend/questions.json — the bank the LIVE app serves, 2026-06-07)

| Subject   | Total  | KS2  | KS3  | GCSE | A-level |
|-----------|--------|------|------|------|---------|
| **Maths**     | 14,638 | 5280 | 2965 | 3231 | 3162 |
| **Physics**   |  4,435 |  180 | 1130 | 2270 |  855 |
| **Chemistry** |    735 |   80 |  165 |  240 |  250 |
| **Biology**   |    694 |   80 |  140 |  240 |  234 |

The science **topic coverage is already good** (full AQA/Edexcel category maps exist at every
level). The problem is **depth**: chemistry & biology categories hold only ~20–35 questions each,
versus physics categories at 84–740. A child revising GCSE Chemistry "Bonding & structure" gets 25
questions; in GCSE Physics "Forces & Motion" they get 740. Thin banks repeat fast under spaced
repetition.

## CEO scope decision
Matching maths exactly = ~14,638 × 3 ≈ **44,000 new hand-authored questions**. That is not
achievable at quality within our quota, and the brief explicitly allows "as many as would be
helpful." **Decision: deepen every science category toward physics-like depth rather than chase
maths' raw count.** Target ≈ **80 questions per category** (KS2 ≈ 40), which roughly 3–4× chemistry
and biology and tops up physics' thin categories. Net target ≈ **+3,000 chemistry, +3,000 biology,
+~1,500 physics** over sequential waves. Quality and "no repeats" outrank hitting any number.

## Hard constraints (carried from MIN-70 / memory)
1. **APPEND-ONLY.** Do NOT run `scripts/generateQuestions.mjs` — it overwrites `backend/questions.json`
   with maths+physics only and would destroy all chemistry & biology. Author/append by hand.
2. Preserve every existing question id; never modify maths/physics/existing-science entries.
3. No duplicate questions (text or near-text) — dedupe within and against the existing bank.
4. Even correct-answer distribution across A/B/C/D (MIN-39 found heavy 'B' clustering — do not repeat).
5. Keep frontend (`src/data/questions.js`) and backend (`backend/questions.json`) in sync.
6. Branch off **origin/main** (local main is stale), clean worktree, one branch per wave.

## Waves (sequential — one heavy author cycle at a time; quota discipline)
- **Wave 1 (dispatched):** Chemistry depth — GCSE + A-level to ~80/category first, then KS3/KS2.
  → `question-author`.
- **Wave 2 (queued, blocked on W1 gates):** Biology depth — same shape. → `question-author`.
- **Wave 3 (queued, blocked on W2 gates):** Physics top-up — thin categories only (KS2,
  A-level Quantum/Nuclear/Fields, GCSE Space). → `question-author`.
- **Explanations + resources (per wave):** most science categories already have explanation +
  resource entries; `content-factory` fills only genuine gaps and verifies links after each wave.

## Hard gate chain per wave (never waived)
`answer-verifier` (correctness PASS) → `test-guardian` (engine + bank-load green) →
`release-verifier` (build GO) → **CEO merges to main + pushes to GitHub**.
safety-privacy: N/A — no child-data path is touched by content authoring.

## Final disposition of MIN-94
Closes only when all dispatched waves are merged to `main`, pushed to `origin`, and GitHub is
up to date. Parent stays `in_progress` while waves run (live continuation = author → gates → next wave).
