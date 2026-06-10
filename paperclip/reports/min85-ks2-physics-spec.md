# MIN-85 — KS2 Physics content spec (canonical)

_Owner: CEO. All three deliverables (questions, explanations, resources) MUST use the
EXACT category strings below as keys, so the engine joins them correctly._

## Why this exists
The live bank (`backend/questions.json`) has **0 KS2 physics** questions today (stocktake MIN-84:
physics is KS3/GCSE/A-level only). George asked for KS2 physics questions + explanations + resources.
This is **net-new, append-only** content — do NOT regenerate or touch existing entries (seeded-RNG
cascade + chemistry-drop risk; see memories `generator-seeded-rng-cascade`, `generator-not-at-parity`).

## Canonical categories (UK National Curriculum, KS2 science — physics strands)
Use these strings verbatim as `category` (questions), and as the keys in
`EXPLANATIONS.ks2[...]` and `RESOURCES.ks2[...]`.

| # | category (verbatim key) | id slug | NC year(s) | scope |
|---|---|---|---|---|
| 1 | `Forces & magnets` | `forces_magnets` | Y3 | pushes/pulls as forces, contact vs at-a-distance, magnetic materials, poles attract/repel |
| 2 | `Light & shadows` | `light` | Y3/Y6 | light sources, reflection, how we see, shadows, opaque/transparent/translucent |
| 3 | `Sound` | `sound` | Y4 | vibrations, travels through a medium, pitch, volume, fainter with distance |
| 4 | `Electricity` | `electricity` | Y4/Y6 | simple series circuits, cells/bulbs/switches/buzzers, conductors vs insulators, brightness |
| 5 | `Forces & motion` | `forces_motion` | Y5 | gravity, air resistance, water resistance, friction, levers/pulleys/gears |
| 6 | `Earth & space` | `earth_space` | Y5 | Sun/Earth/Moon are spherical, rotation→day/night, orbit→year, Moon orbits Earth, planets |

## Targets
- **~30 questions per category** (≥25), spread difficulty **1 (most) and 2 (some)**. Total ~150–200.
- Age 7–11 reading level. Short stems, no GCSE vocabulary, no calculations beyond simple counting.
- 4 options A–D, exactly one correct, plausible non-trick distractors (no "all of the above").

## File targets & schema
1. **Questions** → append to **both** banks (live divergence — memory `frontend-backend-bank-divergence`):
   - `backend/questions.json` (the served bank) AND `src/data/questions.js` (frontend) — keep in sync.
   - `scripts/generateQuestions.mjs`: add a KS2-physics module that EMITS these, append-only; do not
     re-roll other subjects. Diff the ID set before/after — only new `ks2_ph_*` ids may appear.
   - Schema (match existing): `{ id:"ks2_ph_<slug>_NNNN", level:"ks2", subject:"physics",
     category:"<verbatim>", text, options:{A,B,C,D}, correct:"A|B|C|D", difficulty:1|2 }`.
2. **Explanations** → `src/data/explanations.js`, one entry per category under `EXPLANATIONS.ks2`:
   `{ title, keyIdea, body (~200–300 words, KS2 reading age), workedExample:{problem,solution},
   commonMistakes:[2–3], keyFacts:[3–5] }`. Mirror the existing KS2 maths style.
3. **Resources** → `src/data/resources.js`, array per category under `RESOURCES.ks2`:
   `[{ title, url, type:"article|video|interactive|game" }]`. Trusted free UK-aligned sources only
   (BBC Bitesize KS2 Science, BBC Teach, Topmarks, DK Find Out!, STEM Learning, Explorify). Every URL
   must be live (manual check). 3–5 links per category.

## Gates (hard — none waived)
1. **answer-verifier** PASS on all new KS2 physics questions (correctness) — before anything ships.
2. **test-guardian** green (engine + bank-integrity tests) — after generator change.
3. **safety-privacy** PASS on the resource links (child-facing external links, AADC).
4. **release-verifier** GO (build) → merge to `main` → George NAS rebuild (ops).

Work on a branch `feat/min85-ks2-physics`. Append-only. CEO diffs ID sets before any merge.
