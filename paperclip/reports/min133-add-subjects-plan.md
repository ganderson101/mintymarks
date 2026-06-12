# MIN-133 — Add two GCSE subjects + targeted home-screen subject picker

CEO decomposition. Branch for all work: **`feat/min133-subjects-cs-geography`** (cut from `origin/main`).
George granted explicit autonomy: **no approval needed before a local demo**. So we build to a working
local demo on the branch without asking. Hard gates (answer-verifier, test-guardian) still hold before any
merge to `main` / deploy.

## Two deliverables

### A. Two new GCSE-only subjects
- **OCR GCSE Computer Science — J277**, canonical subject key `comp-sci`, label "Computer Science".
- **AQA GCSE Geography — 8035**, canonical subject key `geography`, label "Geography".
- GCSE level only (`LEVELS["comp-sci"] = [gcse]`, same for geography). Not all subjects at all levels — by design.
- **Question/answer STYLE is not one-size-fits-all** (George's explicit ask). The pedagogy-engineer produces a
  style spec FIRST; authoring follows it. Engine stays MCQ (4 options + `correct` + `difficulty` 1–3 + markdown
  `solution`); the *style* lives in how `text`/`options`/`solution` are written per subject:
  - **CS J277**: code-trace & pseudocode-completion (code in `text`, monospace), binary/hex/denary conversion,
    logic gates / truth tables, definitions & exam-keyword recall, algorithm behaviour. `solution` = worked
    reasoning (step-by-step trace / conversion working).
  - **Geography 8035**: case-study recall (named examples), data/graph interpretation described in `text`,
    command-word practice (describe/explain/evaluate framed as MCQ), locational & process knowledge.
    `solution` = model mark-scheme-style answer + why the right option is right.
- **Volume**: large range, whole-syllabus coverage. Target ≈ 60–80 questions per category across every J277
  topic (1.1–1.6, 2.1–2.5) and every AQA 8035 unit (Paper 1 physical, Paper 2 human, skills). Append-only to
  `backend/questions.json` (per generator-parity memory — never run the generator; author directly).

### B. Targeted home-screen subject picker (UX)
Current: `SubjectPicker` in `src/components/Dashboard.jsx` is a flat row of ALL subject buttons. George wants:
- Don't overwhelm: show a **curated default + the subjects the child has engaged with**; the rest hidden behind
  an obvious **"More subjects ＋"** expander (no search, discovery must be obvious).
- **Remember & display engaged subjects** (a session was started on them) — persist client-side in
  `localStorage` (NOT server-side; no child PII leaves the device → keeps safety-privacy light).
- **Per-subject minimise** (slightly hide) toggle the user can reverse intuitively.
- Apply the same pattern on the Topics tab picker if cheap; Home is the priority.
- Also: register the two subjects in `SUBJECTS`/`LEVELS`/`SUBJECT_LABELS`/`LEVEL_LABELS`; render code blocks
  in `QuestionCard` when `text`/`solution` contain fenced/monospace code (needed for CS).

## Latent issue to flag to FE/content
`getExplanation(level, category)` is NOT subject-scoped (only `getResources` takes optional `subject`).
New CS/Geography category names must be unique vs existing same-level categories, or collisions occur.
Use distinctive category names (e.g. "Systems architecture", "Coasts") — they won't collide with maths/science.

## Delegation tree (children of MIN-133, branch `feat/min133-subjects-cs-geography`)
- **W0 (active now)** pedagogy-engineer → style spec → writes `paperclip/reports/min133-subject-style-spec.md`
  (per-subject question formats, full category list, volume targets, `solution` conventions, flag if code
  rendering needed). Blocks W1 authoring + content.
- **W1 (blocked on W0)** question-author → author BOTH banks sequentially (CS then Geography) per the spec,
  append-only to `backend/questions.json`. One issue, one agent → no concurrent questions.json edits.
- **W1b (blocked on W0)** content-factory → concept explanations + specific, relevant resource links for every
  new category (subjects + categories from the spec).
- **W2 (active now, parallel)** frontend-engineer → targeted picker redesign (engaged-memory + expand +
  minimise) + register the two subjects (GCSE-only) + code-block rendering in QuestionCard.

## Gate chain (CEO routes on completion; hard gates never waived)
1. **answer-verifier** PASS on the new CS + Geography questions (HARD — no content ships without it).
2. **test-guardian** green on engine/FE logic changes (HARD).
3. **safety-privacy** review of engaged-subject persistence (light — localStorage only, no server data).
4. Assemble local demo on the branch → show George (no prior approval required).
5. **release-verifier** GO only when George wants it merged/deployed (NAS rebuild is George-ops).
