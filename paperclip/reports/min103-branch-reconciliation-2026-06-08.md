# MIN-103 — Branch / ticket reconciliation (2026-06-08)

**Ask (George):** "Have a look through outstanding tickets, merge them with main and update
GitHub so the local copy is up to date when it runs. Let me know if I need to do anything."

## TL;DR

**The heavy work is already on `origin/main` and on GitHub.** `origin/main` HEAD is
`a702c3b` (MIN-102) and carries the full question bank — **23,417 questions** with complete
chemistry / biology / physics coverage (MIN-97/98/99), dual-login (MIN-52), and the board-seed
login generator (MIN-102). The live app is only stale because the **NAS has not rebuilt** from
GitHub — not because GitHub is missing work.

Local `main` was 35 commits behind `origin/main`. **I synced it** (reset to `origin/main`,
now 0/0). The 3 local-only worked-solution commits are preserved on
`archive/main-worked-solutions-pre-min103` and on their feature branches — nothing lost.

## What `origin/main` already contains (verified from the committed bank)

| Subject | ks2 | ks3 | gcse | alevel |
|---|---|---|---|---|
| maths | 5280 | 2965 | 3231 | 3162 |
| physics | 240 | 1130 | 2306 | 1003 |
| chemistry | 160 | 560 | 800 | 800 |
| biology | 160 | 420 | 560 | 640 |

Total **23,417**. `solution` field present on: **0** questions (see gap #1 below).

## Branch triage

### SUPERSEDED — feature already on `origin/main`, safe to delete (no merge needed)
- `feat/min70-biology-gcse-alevel` — biology gcse/alevel already 560/640 (via MIN-98)
- `feat/min85-ks2-physics-questions` — KS2 physics already 240 (via MIN-99)
- `feat/min85-ks2-physics-content` — KS2 physics explanations/resources landed (MIN-85)
- `feat/min99-physics-topup` — physics top-up already on origin/main
- `feat/min7-ks2-maths-gap-fill` — old MIN-9 batch; maths ks2 now 5280
- `feat/min52-dual-login` — the dual-login commit is patch-present on origin/main already
- `feat/min36-digest-pedagogy-section`, `feat/min38-board-vibe-chooser`,
  `feat/min49-solution-display` — carry only the "big board update" / digest commits;
  board-portal work is tracked separately and these are stale
- Already-merged-and-stale: `feat/min57`, `feat/min59d`, `feat/min62`, `feat/min64`,
  `feat/min77`, `feat/min97`, `feat/min98`, `cleanup/*`, `fix/*`

### GENUINELY OUTSTANDING — not on `origin/main`
1. **Worked solutions (MIN-46 / MIN-48 / MIN-68)** — `solution` field is absent from the live
   bank (0/23,417). Built on `feat/min46-perq-solutions` (KS3 Forces pilot + review UI) and
   `feat/min46-rollout-physics` (Energy/Waves/Electricity/Matter gen). **Needs the gate chain
   (test-guardian green + answer-verifier on solution correctness) and a board GO before it
   touches the live bank** — it is the one change that alters shipped content.
2. **Avatar expansion backend (MIN-95 / MIN-100)** — 160 catalog items on
   `feat/min95-avatar-expansion-backend` vs 19 on origin/main. **Backend is ready but the
   frontend (MIN-101) is not done**, so shipping the backend alone would be dead data. Routed
   MIN-101 to frontend-engineer so the feature can ship as a pair.

## Ticket dispositions this heartbeat
- **MIN-94 (science content)** → DONE (full chem/bio/physics on origin/main).
- **MIN-98 (biology wave 2)** → DONE (on origin/main, answer-verifier defects fixed).
- **MIN-95 (avatars)** → stays open; backend ready, **MIN-101 routed to frontend-engineer**.
- **MIN-46 (worked solutions)** → the one genuine ship; awaiting George GO + gate chain.
- **MIN-47 (board emails)** → blocked on George ops (NAS / email), George is unblock owner.

## George — actions you may need to take
1. **Rebuild the NAS deployment from `origin/main`** (`a702c3b`). This is what makes the live
   app current — GitHub already has the work. (Agents can't reach the NAS.)
2. **Confirm deletion of the superseded branches** above (I left them in place; cleanup is
   reversible but I won't delete remote branches without your nod).
3. **Decide whether to ship worked solutions now (MIN-46).** If yes, I'll run the gate chain
   and prepare a review-ready merge for your final GO.

## Reversibility
- `archive/main-worked-solutions-pre-min103` pins the pre-sync main HEAD (`ab16308`).
- 5 leftover WIP stashes from other agents remain untouched.
