# MIN-133 Subject Style Spec — CS J277 + Geography 8035

_Authored by question-author agent, inferred from MIN-134 detailed guidance. MIN-134 is still in-flight so this spec was derived from the guidance provided to MIN-134._

---

## 1. OCR GCSE Computer Science J277 — `comp-sci`

### Question-format palette

| Format | % of bank | Notes |
|---|---|---|
| Code-trace / pseudocode-completion | ~25% | Code in ` ``` ` fenced block in `text`; trace through and find output or spot error |
| Binary / hex / denary conversion | ~15% | Show working in `solution`; distract with common off-by-one / wrong-bit-weight errors |
| Logic gates / truth tables | ~10% | Boolean expression or circuit description in `text`; all 4-input combos as options |
| Definitions & exam-keyword recall | ~25% | "Which of the following BEST describes…"; distractors are related but imprecise terms |
| Algorithm behaviour (search/sort trace) | ~15% | "After two passes of bubble sort on [5,3,8,1,9], the list is…" |
| Systems/networks/ethics facts | ~10% | Straightforward recall at D1; scenario-application at D2/D3 |

**`solution` convention — CS**: step-by-step working:
- Code trace: show variable state at each line
- Conversion: show each bit-weight or place-value step
- Algorithm: show each pass/swap
- Definition: explain why correct option is precise and why each distractor is incomplete/wrong
- Length: 2–6 sentences / numbered steps; be terse but complete

**Flag to frontend**: CS `text` fields regularly contain ` ```pseudocode ``` ` and ` ```python ``` ` fenced blocks. `solution` also contains fenced code occasionally. `QuestionCard` must render these in monospace with block styling.

---

### Category list (11 categories) — whole J277 syllabus

| Category string | J277 unit | Slug |
|---|---|---|
| `Systems Architecture` | 1.1 | `sysarch` |
| `Memory and Storage` | 1.2 | `memstor` |
| `Computer Networks` | 1.3 | `networks` |
| `Network Security` | 1.4 | `netsec` |
| `Systems Software` | 1.5 | `syssw` |
| `Ethical and Legal Issues` | 1.6 | `ethics` |
| `Algorithms` | 2.1 | `algo` |
| `Programming Fundamentals` | 2.2 | `progfund` |
| `Producing Robust Programs` | 2.3 | `robust` |
| `Boolean Logic` | 2.4 | `bool` |
| `Programming Languages and IDEs` | 2.5 | `ides` |

### Volume and difficulty per category

Target: **60 questions per category** (660 CS total).

Difficulty distribution per category:
- Difficulty 1 (D1): 20 questions — recall, single-step
- Difficulty 2 (D2): 25 questions — application, 2–3 step reasoning, short code traces
- Difficulty 3 (D3): 15 questions — longer traces, evaluation, multi-concept

---

## 2. AQA GCSE Geography 8035 — `geography`

### Question-format palette

| Format | % of bank | Notes |
|---|---|---|
| Named case-study recall | ~25% | "Which city / event / place…"; named examples from the spec (Nepal, Rio, Holderness, etc.) |
| Data / graph / photo interpretation | ~20% | Numerical data or described figures in `text`; "What does the data show…" |
| Command-word practice | ~20% | "Which statement best describes / explains / assesses…"; framed as MCQ pick |
| Process knowledge | ~20% | "What causes X?", "Which process forms Y feature?", erosion/deposition/tectonic terms |
| Locational knowledge | ~15% | Plate boundaries, climate zones, UK locations, biome distribution |

**Case studies used** (must be named, real, factually correct):
- Tectonic: Nepal earthquake 2015; Japan 2011 earthquake + tsunami; Philippines Typhoon Haiyan 2013
- Rivers: Boscastle flood 2004; Somerset Levels flooding 2014
- Coasts: Holderness Coast erosion; Lyme Regis managed retreat
- Urban LIC/NEE: Rio de Janeiro, Brazil
- Urban HIC: Manchester, UK
- Economic — NEE: Nigeria; Economic — LIC: Zambia
- Resource: Almería, Spain (food); Three Gorges Dam, China (water/energy)

**`solution` convention — Geography**: concise mark-scheme style:
- State which option is correct and why (1 sentence)
- Explain why each distractor is wrong (1 sentence each, optional at D1)
- Reference the case study or data where relevant
- Length: 2–5 sentences

---

### Category list (8 categories) — whole 8035 syllabus

| Category string | 8035 unit | Slug |
|---|---|---|
| `Natural Hazards` | 1A | `hazards` |
| `Living World` | 1B | `living` |
| `River Landscapes in the UK` | 1C | `rivers` |
| `Coastal Landscapes in the UK` | 1C | `coasts` |
| `Urban Issues and Challenges` | 2A | `urban` |
| `Changing Economic World` | 2B | `economic` |
| `Resource Management` | 2C | `resource` |
| `Geographical Skills` | 3 | `skills` |

### Volume and difficulty per category

Target: **60 questions per category** (480 Geography total).

Difficulty distribution per category:
- Difficulty 1 (D1): 20 — definitions, simple recall, named-place identification
- Difficulty 2 (D2): 25 — process understanding, data interpretation, case-study application
- Difficulty 3 (D3): 15 — evaluate/compare/assess framing, multi-factor reasoning

---

## 3. Schema reminder

```json
{
  "id": "gcse_cs_sysarch_0001",
  "level": "gcse",
  "subject": "comp-sci",
  "category": "Systems Architecture",
  "text": "question text (fenced code block where needed)",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct": "B",
  "difficulty": 2,
  "solution": "Step-by-step working / mark-scheme answer."
}
```

IDs: `gcse_cs_<slug>_NNNN` and `gcse_geo_<slug>_NNNN`, zero-padded to 4 digits.
