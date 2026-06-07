# Pedagogy decisions — individual-child care (MIN-35)

Parent: MIN-33 ("improving the learning itself"), Pillar 2 — make the software
look after the **individual** child and encourage them honestly.

Author: pedagogy-engineer · Branch: `feat/min34-individual-child-care` · 2026-06-07

Source read first (as mandated):
`src/engines/adaptationEngine.js`, `src/engines/srsEngine.js`,
`src/engines/sessionEngine.js`, `src/components/QuestionCard.jsx`,
backend `backend/progress.py` (authoritative SRS + weakness).

---

## 1. Audit — how well does the engine serve ONE child today?

### 1a. The pieces and what each one decides

| Concern | Where | Current behaviour |
|---|---|---|
| Per-answer quality | `adaptationEngine.answerQuality` | fast+correct 1.2, medium 1.0, slow+correct 0.8, any wrong 0.0 |
| Weakness (point estimate) | `adaptationEngine.computeWeakness` | Laplace add-one on timing-weighted correct: `1 - (weightedCorrect+1)/(attempts+2)` |
| Topic selection | `adaptationEngine.selectTopic` | 70% weakness-biased, 30% uniform random |
| Dynamic difficulty | `sessionEngine.submit` | +1 tier after 3 consecutive correct; **-1 tier on every single wrong**; floor 1, ceil 4 |
| Weakness **declaration** to child | `sessionEngine.getResults` → `weakCategories` | flag every attempted category with weakness ≥ `WEAK_THRESHOLD` (0.33) |
| SRS schedule | `srsEngine.sm2Update` + backend `POST /progress/srs` | SM-2 at topic level; quality from session accuracy ± timing |

### 1b. Where a **struggling** child gets stuck or frustrated

1. **Relentless re-selection of the weakest topic.** `selectTopic` is 70%
   weakness-biased and untried/weak topics carry the highest weight. A child who
   is genuinely struggling on topic X keeps being served X, with no cooldown and
   no "consecutive-miss" easing of *which topic* comes next. Difficulty eases
   within the topic, but the child can still be cornered on their worst topic for
   long stretches. (Design fix proposed in §2; not the smallest-change pick.)
2. **No distinct handling of "slow-and-wrong".** A wrong answer always scores
   quality 0 regardless of effort/time. A child who thought hard for 30s and got
   it wrong is treated identically to a 1s random guess. The brief explicitly
   calls for easing the slow-and-wrong child, not punishing them. (Design, §2.)
3. **Single wrong answer drops difficulty a full tier** (`submit`,
   `topicDifficulty = currentDiff - 1`). This is "easing", which is good, but it
   is also jumpy: one unlucky slip undoes progress. A consecutive-miss counter
   (mirror of `STREAK_UP`) would ease only on a real struggle pattern. (Design, §2.)

### 1c. Where a **coasting** child is under-challenged

1. Difficulty only steps up after **3 consecutive correct** and is capped at tier
   4. A child answering fast+correct repeatedly climbs slowly and then plateaus.
   Timing is captured (`answerQuality` 1.2 for fast+correct) but is **not** fed
   into the difficulty step — fast mastery and laboured mastery escalate at the
   same rate. (Design, §2: let fast streaks escalate faster.)
2. Dynamic difficulty is active **only** when the child picks "All" difficulty
   (`difficulties === null`). A child pinned to a tier never gets stretched.

### 1d. Is weakness declared on too few samples? **Yes — and it is the bug we fix.**

The brief mandates *confidence-aware* weakness (Wilson interval / Bayesian
shrinkage), **not just Laplace add-one**. Laplace is a point estimate; it makes
**confident claims on tiny samples**:

- `1/1` correct → weakness **0.3333**. With `WEAK_THRESHOLD = 0.33`, this is
  flagged as a weak topic. **A child who scored 100% is told they are weak at it.**
- `0/1` wrong → weakness 0.6667 (correctly flagged).

This was not hypothetical: the existing test `sessionEngine "scores a perfect
run"` asserts `weakCategories === []` and **was failing on `main`** — a 6/6
perfect session reported all six topics as weak (reproduced empirically, n=1 per
topic). That is the precise "weakness declared on too few samples" failure, and
it is dishonest discouragement — the opposite of "encourage honestly".

Root cause: Laplace conflates **two different questions**:
- *"Should we keep practising this topic?"* — be **optimistic**; review uncertain
  topics. Laplace is fine here (and drives `selectTopic`).
- *"Should we tell the child this is a weakness?"* — be **conservative**; only
  declare a gap we are confident is real. Laplace is wrong here.

---

## 2. Prioritised design — "looked after + encouraged"

Ranked by care-per-risk. **P0 is implemented in this PR** (§3). The rest are
specified for follow-up child issues; none ships without its gate.

**P0 — Confidence-aware weakness *declaration* (DONE here).**
Split declaration from selection. Keep Laplace for review selection; gate what we
*show/act on as a declared weakness* behind a Wilson-score lower bound on the
error rate. Only declare weak when we are statistically confident (one-sided
~95%) the true error rate is above zero. Encourage honestly; never call a
clean record "weak".

**P1 — Slow-and-wrong easing + consecutive-miss easing (struggle detection).**
- Track a `topicMissStreak` mirror of `topicStreak`. Ease the *topic rotation*
  (cooldown / temporarily down-weight) after N consecutive misses on one topic so
  the child isn't cornered.
- Treat slow-and-wrong differently from fast-and-wrong: a thoughtful wrong answer
  triggers a gentler difficulty step and surfaces the explanation proactively,
  rather than the same flat penalty. Effort is acknowledged.
*Gate:* test-guardian green; backend unaffected (client-side selection only).

**P2 — Effort/progress-based encouragement model (NOT engagement-based).**
Encouragement tied strictly to **effort and genuine progress**:
- *Effort*: attempts made, sticking with a slow-and-wrong question, opening the
  explanation after a miss.
- *Genuine progress*: a topic's confident weakness (P0 signal) actually falling
  over time; a previously-missed topic now answered correctly.
- **Explicitly forbidden signals:** time-in-app, daily streaks for their own
  sake, session counts, "come back" nudges. Per the absolute rule, durable
  learning over engagement — reject anything whose main effect is stickiness.
*Gate:* **any encouragement UX needs a safety-privacy PASS before it ships**
(GATE #3). This is UX-bearing and must not ship from this engine-only PR.

**P3 — Timing-aware difficulty escalation for the coasting child.**
Feed `answerQuality`/avg-time into the difficulty step so fast+correct streaks
escalate faster (and raise/remove the tier-4 cap thoughtfully), stretching a
coasting child without punishing a careful one.

---

## 3. The ONE smallest safe change shipped in this PR

**Change:** confidence-aware weakness **declaration** using the Wilson score
interval. `computeWeakness` (Laplace) is **untouched**, so topic *selection* and
all its existing behaviour/tests are unchanged. Two small pure helpers were added
and the results-screen flag was gated.

Files:
- `src/engines/adaptationEngine.js` — new exported pure functions
  `wilsonLowerBound(successes, n, z=1.645)` and
  `isConfidentWeakness(correct, attempts)`.
- `src/engines/sessionEngine.js` — `getResults().weakCategories` now requires
  **both** `weakness ≥ WEAK_THRESHOLD` **and** `isConfidentWeakness(...)`.
- `src/tests/adaptationEngine.test.js` — 5 new tests for the helpers.

**The rule.** Declare a topic weak only when we are confident a real gap exists:
the Wilson lower bound on the *error* rate must be `> 0`. A topic with zero
observed errors (any sample size) has a Wilson error lower bound of exactly 0 →
never declared weak. One genuine miss already pushes the bound above 0 → a real
struggle is still caught immediately. Raw counts (not timing-weighted) are used
because confidence is about *how much evidence* we have, not how fast the child was.

`z = 1.645` (one-sided ~95%) is deliberately sensitive: it catches a struggling
child after a single real miss while refusing to label a clean record.

### Before / after behaviour

Reproduced with the seeded session harness (`seededRng(42)`, 6 questions, one
attempt per topic):

| Scenario | Per-topic record | BEFORE (`weakCategories`) | AFTER |
|---|---|---|---|
| **Perfect run** (6/6) | 1/1 correct each | all 6 topics flagged weak @ 0.333 ❌ | **[] — none flagged** ✅ |
| **All-wrong run** (0/6) | 0/1 each | all 6 flagged @ 0.667 | all 6 flagged @ 0.667 (unchanged) ✅ |
| 1 correct of 1 (single topic) | 1/1 | weak | not weak |
| 1 wrong of 1 | 0/1 | weak | weak |
| 1 correct of 3 | 1/3 | weak | weak |
| 3 correct of 3 | 3/3 | weak (0.333, tipping threshold) | **not weak** |

Net effect on individual care: a child is **never** told they are weak at a topic
they have only ever gotten right; a genuine gap is still flagged on the first real
miss. This directly serves "encourage honestly".

### Test status

`npx vitest run` → **27 passed (3 files)**. The previously-failing
`sessionEngine "scores a perfect run"` now passes; 5 new helper tests added; all
prior Laplace-value assertions in `adaptationEngine.test.js` still pass (selection
math untouched).

### Does the backend `POST /progress/srs` have to change? **No.**

This change is purely the **frontend presentation/honesty layer** — what the
results screen *declares* to the child. It does not touch:
- SRS scheduling (`srsEngine.sm2Update` / backend `POST /progress/srs`) — unchanged.
- The authoritative weakness the backend serves from `GET /progress/topics`
  (`backend/progress.py::_laplace_weakness`) — still Laplace, still correct for
  its job of **seeding review selection** (optimistic about practising uncertain
  topics).

The backend stays authoritative and unchanged. The Laplace/Wilson split is
intentional: **optimistic for review scheduling, conservative for declaring a
weakness to the child.**

> Future note (escalate before doing): if we later want confidence-aware weakness
> to also drive the backend-reported "weak topics" or the "Weak topics" *selection
> mode*, that **would** alter the `/progress/topics` contract and must be a
> coordinated backend change — escalate to CEO per the issue's SRS-contract rule.

---

## Gates / handoff

- **GATE #2 (test-guardian):** suite is green (27/27). The CEO brings
  test-guardian in on this diff before any merge. **I do not merge to `main`.**
- **GATE #3 (safety-privacy):** **not triggered by this PR** — engine/results
  logic only, no new encouragement UX, no new data captured or sent. The P2
  encouragement model in §2 *will* need a safety-privacy PASS when built.
- **Escalation:** P0–P3 design validation against real usage would benefit from
  George's 3 kids as ground-truth users (escalate to CEO). No backend SRS contract
  change is requested by this PR.
