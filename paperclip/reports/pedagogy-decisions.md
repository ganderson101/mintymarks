# Pedagogy decisions — individual-child care (MIN-35)

Parent: MIN-33 ("improving the learning itself"), Pillar 2 — make the software
look after the **individual** child and encourage them honestly.

Author: pedagogy-engineer · Branch: `feat/min35-confident-weakness` · 2026-06-07

Source read first (as mandated): `src/engines/adaptationEngine.js`,
`src/engines/srsEngine.js`, `src/engines/sessionEngine.js`,
`src/components/QuestionCard.jsx`, backend `backend/progress.py`.

---

## 1. Audit — how well does the engine serve ONE child today?

### 1a. The pieces and what each one decides

| Concern | Where | Current behaviour |
|---|---|---|
| Per-answer quality | `adaptationEngine.answerQuality` | fast+correct 1.2, medium 1.0, slow+correct 0.8, any wrong 0.0 |
| Weakness (point estimate) | `adaptationEngine.computeWeakness` | Laplace add-one on timing-weighted correct: `1 - (weightedCorrect+1)/(attempts+2)` |
| Topic selection | `adaptationEngine.selectTopic` | 70% weakness-biased, 30% uniform random |
| SRS boost | `sessionEngine.next` | due-for-review topics get +0.2 weakness so SM-2 drives selection |
| Dynamic difficulty | `sessionEngine.submit` | +1 tier after 3 consecutive correct; **-1 tier on every single wrong**; floor 1, ceil 4 |
| Weakness **declaration** to child | `sessionEngine.getResults` → `weakCategories` | flag every attempted category with weakness ≥ `WEAK_THRESHOLD` (0.33) |
| SRS schedule | `srsEngine.sm2Update` + backend `POST /progress/srs` | SM-2 at topic level; quality from session accuracy ± timing |

### 1b. Where a **struggling** child gets stuck or frustrated

1. **Relentless re-selection of the weakest topic.** `selectTopic` is 70%
   weakness-biased; weak/untried topics carry the highest weight and the SRS boost
   stacks on top. A genuinely struggling child keeps being served their worst
   topic with no cooldown and no consecutive-miss easing of *which topic* comes
   next. Difficulty eases within a topic, but the child can still be cornered.
   (Design fix in §2 P1; not the smallest-change pick.)
2. **No distinct handling of "slow-and-wrong".** A wrong answer scores quality 0
   regardless of effort/time. A child who thought hard for 30s and got it wrong is
   treated identically to a 1s random guess. The brief explicitly calls for easing
   the slow-and-wrong child, not punishing them. (§2 P1.)
3. **A single wrong answer drops difficulty a full tier** (`submit`). This is
   "easing" (good), but it is jumpy — one unlucky slip undoes progress. A
   consecutive-miss counter (mirror of `STREAK_UP`) would ease only on a real
   struggle pattern. (§2 P1.)

### 1c. Where a **coasting** child is under-challenged

1. Difficulty only steps up after **3 consecutive correct** and caps at tier 4.
   Timing is captured (`answerQuality` 1.2 for fast+correct) but is **not** fed
   into the difficulty step — fast mastery and laboured mastery escalate at the
   same rate. (§2 P3.)
2. Dynamic difficulty is active **only** when the child picks "All" difficulty
   (`difficulties === null`); a child pinned to a tier never gets stretched.

### 1d. Is weakness declared on too few samples? **Yes — and it is the bug we fix.**

The brief mandates *confidence-aware* weakness (Wilson interval / Bayesian
shrinkage), **not just Laplace add-one**. Laplace is a point estimate that makes
**confident claims on tiny samples**:

- `1/1` correct → weakness **0.3333**. With `WEAK_THRESHOLD = 0.33`
  (`sessionEngine.js`), this is flagged as a weak topic. **A child who answers each
  topic once, correctly, is told they are weak at all of them.**
- `0/1` wrong → weakness 0.6667 (correctly flagged).

The existing `sessionEngine "scores a perfect run"` test did **not** catch this —
it was written to *tolerate* the bug (`weakCategories.every(w => w < 0.5)`), with a
comment acknowledging the 0.33 flag. So the suite was green while the behaviour was
wrong. This change tightens that test to assert the honest outcome (`[]`).

Root cause: Laplace conflates **two different questions**:
- *"Should we keep practising this topic?"* — be **optimistic**; review uncertain
  topics. Laplace is correct here (and drives `selectTopic`).
- *"Should we tell the child this is a weakness?"* — be **conservative**; only
  declare a gap we are confident is real. Laplace is wrong here.

---

## 2. Prioritised design — "looked after + encouraged"

Ranked by care-per-risk. **P0 is implemented in this PR** (§3). The rest are
specified for follow-up child issues; none ships without its gate.

**P0 — Confidence-aware weakness *declaration* (DONE here).**
Split declaration from selection. Keep Laplace for review selection; gate what we
*show/act on as a declared weakness* behind a Wilson-score lower bound on the error
rate. Only declare weak when we are statistically confident (one-sided ~95%) the
true error rate is above zero. Encourage honestly; never call a clean record "weak".

**P1 — Slow-and-wrong + consecutive-miss easing (struggle detection).**
Track a `topicMissStreak` mirror of `topicStreak`; ease the *topic rotation*
(cooldown / temporary down-weight) after N consecutive misses so the child is not
cornered. Treat slow-and-wrong more gently than fast-and-wrong (gentler difficulty
step + proactive explanation) so effort is acknowledged.
*Gate:* test-guardian green; backend unaffected (client-side selection only).

**P2 — Effort/progress-based encouragement model (NOT engagement-based).**
Encouragement tied strictly to **effort** (attempts, sticking with a slow-and-wrong
question, opening the explanation after a miss) and **genuine progress** (a topic's
confident weakness actually falling over time; a previously-missed topic now
correct). **Forbidden signals:** time-in-app, daily streaks for their own sake,
session counts, "come back" nudges. Durable learning over engagement.
*Gate:* **any encouragement UX needs a safety-privacy PASS before it ships** (GATE
#3). UX-bearing — does not ship from this engine-only PR.

**P3 — Timing-aware difficulty escalation for the coasting child.**
Feed `answerQuality`/avg-time into the difficulty step so fast+correct streaks
escalate faster, stretching a coasting child without punishing a careful one.

---

## 3. The ONE smallest safe change shipped in this PR

**Change:** confidence-aware weakness **declaration** using the Wilson score
interval. `computeWeakness` (Laplace) is **untouched**, so topic *selection* and
all its existing behaviour/tests are unchanged.

Files (ownership called out for the CEO/test-guardian boundary review):
- `src/engines/adaptationEngine.js` *(pedagogy-engineer's file)* — new exported
  pure functions `wilsonLowerBound(successes, n, z=1.645)` and
  `isConfidentWeakness(correct, attempts)`.
- `src/engines/sessionEngine.js` *(**test-guardian's file** — flagged for boundary
  review)* — `getResults().weakCategories` now requires **both**
  `weakness ≥ WEAK_THRESHOLD` **and** `isConfidentWeakness(...)`. One filter change;
  no other logic touched.
- `src/tests/sessionEngine.test.js` — tightened "scores a perfect run" to assert
  `weakCategories === []` (was: tolerate `< 0.5`).
- `src/tests/adaptationEngine.test.js` — 5 new unit tests for the helpers.

**The rule.** Declare a topic weak only when we are confident a real gap exists:
the Wilson lower bound on the *error* rate must be `> 0`. A topic with zero observed
errors (any sample size) has a Wilson error lower bound of exactly 0 → never
declared weak. One genuine miss already pushes the bound above 0 → a real struggle
is still caught immediately. Raw counts (not timing-weighted) are used because
confidence is about *how much evidence* we have, not how fast the child was.
`z = 1.645` (one-sided ~95%) is deliberately sensitive: it catches a struggling
child after a single real miss while refusing to label a clean record.

### Before / after behaviour

| Scenario | Per-topic record | BEFORE (`weakCategories`) | AFTER |
|---|---|---|---|
| **Perfect run** (6/6) | 1/1 correct each | all topics flagged weak @ 0.333 ❌ | **[] — none flagged** ✅ |
| **All-wrong run** (0/6) | 0/1 each | all flagged @ 0.667 | all flagged @ 0.667 (unchanged) ✅ |
| 1 correct of 1 (single topic) | 1/1 | weak | not weak |
| 3 correct of 3 | 3/3 | weak (0.333) | not weak |
| 1 wrong of 1 | 0/1 | weak | weak |
| 1 correct of 3 | 1/3 | weak | weak |

Net effect on individual care: a child is **never** told they are weak at a topic
they have only ever gotten right; a genuine gap is still flagged on the first real
miss. This directly serves "encourage honestly".

### Does the backend `POST /progress/srs` have to change? **No.**

This change is purely the **frontend presentation/honesty layer** — what the
results screen *declares* to the child. It does not touch:
- SRS scheduling (`srsEngine.sm2Update` / backend `POST /progress/srs`) — unchanged.
- The authoritative weakness the backend serves from `GET /progress/topics`
  (`backend/progress.py::_laplace_weakness`) — still Laplace, still correct for its
  job of **seeding review selection** (optimistic about practising uncertain topics).

The backend stays authoritative and unchanged. The Laplace/Wilson split is
intentional: **optimistic for review scheduling, conservative for declaring a
weakness to the child.**

> Future note (escalate before doing): if we later want confidence-aware weakness
> to also drive the backend-reported "weak topics" or the "Weak topics" *selection
> mode*, that **would** alter the `/progress/topics` contract and must be a
> coordinated backend change — escalate to CEO per the issue's SRS-contract rule.

---

## Gates / handoff

- **GATE #2 (test-guardian):** suite green (29/29 — was 24). The filter change lives
  in test-guardian's `sessionEngine.js`; flagged explicitly for boundary review.
  **I do not merge to `main`.**
- **GATE #3 (safety-privacy):** **not triggered** by this PR — engine/results logic
  only, no new encouragement UX, no new data captured or sent. The P2 encouragement
  model in §2 *will* need a safety-privacy PASS when built.
- **Escalation:** P0–P3 design validation against real usage would benefit from
  George's 3 kids as ground-truth users (escalate to CEO). No backend SRS contract
  change is requested by this PR.
