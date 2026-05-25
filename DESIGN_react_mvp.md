# Mindarc — React MVP Design

A minimal, production-structured adaptive learning MVP. Client-only, no backend, three cleanly separated logic modules behind a thin React UI.

---

## 1. Stack choice

**Vite + React (plain JS, hooks only).**

- Vite over Next.js: no SSR, no routing, no API routes needed for a client-only MVP — Next would add weight that pays for nothing here.
- No Redux: a single `useReducer` (or `useState`) in one hook holds all UI state. The engines hold the real logic and are framework-free.

---

## 2. Folder structure

```
mindarc/
├─ index.html
├─ package.json
├─ vite.config.js
└─ src/
   ├─ main.jsx                  # React entry
   ├─ App.jsx                   # top-level screen switch (start | quiz | results)
   │
   ├─ engines/                  # ALL logic lives here — zero React imports
   │  ├─ questionEngine.js      # data-only: store + selectors
   │  ├─ adaptationEngine.js    # pure functions: weakness + topic selection
   │  └─ sessionEngine.js       # session flow controller (class, UI-free)
   │
   ├─ data/
   │  └─ questions.js           # the question bank (mock data)
   │
   ├─ hooks/
   │  └─ useSession.js          # the ONLY bridge between engines and React
   │
   ├─ components/               # dumb UI — render state, fire callbacks
   │  ├─ StartScreen.jsx
   │  ├─ QuestionCard.jsx
   │  └─ Results.jsx
   │
   └─ tests/
      ├─ adaptationEngine.test.js
      └─ sessionEngine.test.js  # both run with NO React / NO DOM
```

Rule enforced by structure: anything in `engines/` and `data/` must never `import React`. The only file allowed to touch both worlds is `hooks/useSession.js`.

---

## 3. Data model

### Question (Question Engine owns this)
```js
{
  id: "q_001",
  text: "What is 7 × 8?",
  options: { A: "54", B: "56", C: "58", D: "63" },
  correct: "B",
  topic: "arithmetic",
  difficulty: 1            // initial heuristic only (1=easy … 3=hard), unused by MVP logic
}
```

### SessionConfig (passed in — never hardcoded)
```js
{
  length: 10,              // number of questions this session
  topics: null             // null = all topics, or ["arithmetic","algebra"]
}
```

### SessionState (held inside the Session Engine instance)
```js
{
  config,                  // the SessionConfig above
  askedIds: ["q_001", …],  // prevents repeats within a session
  currentQuestion,         // the Question object now on screen (or null)
  answers: [               // one entry per submitted answer
    { questionId, topic, selected: "A", correct: "B", isCorrect: false }
  ],
  status: "active"         // "active" | "complete"
}
```

### UserPerformance (Adaptation Engine's currency — plain serializable object)
```js
{
  byTopic: {
    arithmetic: { attempts: 4, correct: 3 },
    algebra:    { attempts: 2, correct: 0 }
  }
}
```
Weakness is **derived**, never stored: `weakness(topic) = 1 - correct/attempts`.

---

## 4. Module design

### 4a. Question Engine — `engines/questionEngine.js` (data-only)
No flow, no scoring, no randomness policy — just storage and lookups.

```js
import { QUESTIONS } from "../data/questions.js";

export function createQuestionEngine(bank = QUESTIONS) {
  return {
    getAllTopics() {
      return [...new Set(bank.map(q => q.topic))];
    },
    getById(id) {
      return bank.find(q => q.id === id) || null;
    },
    // questions in a topic that haven't been asked yet this session
    getAvailableByTopic(topic, excludeIds = []) {
      return bank.filter(q => q.topic === topic && !excludeIds.includes(q.id));
    },
    getAvailable(excludeIds = []) {
      return bank.filter(q => !excludeIds.includes(q.id));
    }
  };
}
```

### 4b. Adaptation Engine — `engines/adaptationEngine.js` (pure logic)
Pure functions only. `rng` is injected so tests are deterministic.

```js
// returns a NEW performance object (never mutates)
export function recordAnswer(perf, topic, isCorrect) {
  const prev = perf.byTopic[topic] || { attempts: 0, correct: 0 };
  return {
    byTopic: {
      ...perf.byTopic,
      [topic]: {
        attempts: prev.attempts + 1,
        correct: prev.correct + (isCorrect ? 1 : 0)
      }
    }
  };
}

// weakness map: { topic: 0..1 }. Untried topics default to weakness 1 (prioritise unknowns).
export function computeWeakness(perf, allTopics) {
  const map = {};
  for (const topic of allTopics) {
    const t = perf.byTopic[topic];
    map[topic] = !t || t.attempts === 0 ? 1 : 1 - t.correct / t.attempts;
  }
  return map;
}

// 70% weak-biased pick, 30% pure random. rng() -> [0,1)
export function selectTopic(weaknessMap, allTopics, rng = Math.random) {
  if (rng() < 0.7) {
    // weighted by weakness; falls back to uniform if all weakness = 0
    const total = allTopics.reduce((s, t) => s + weaknessMap[t], 0);
    if (total > 0) {
      let r = rng() * total;
      for (const t of allTopics) {
        r -= weaknessMap[t];
        if (r <= 0) return t;
      }
    }
  }
  return allTopics[Math.floor(rng() * allTopics.length)];
}
```

### 4c. Session Engine — `engines/sessionEngine.js` (flow controller, UI-free)
A small class. Owns SessionState, asks Question + Adaptation engines for decisions. Fully testable headless.

```js
import { computeWeakness, recordAnswer, selectTopic } from "./adaptationEngine.js";

export class SessionEngine {
  constructor({ config, questionEngine, rng = Math.random }) {
    this.config = config;                       // length NOT hardcoded — comes from caller
    this.qe = questionEngine;
    this.rng = rng;
    this.askedIds = [];
    this.answers = [];
    this.performance = { byTopic: {} };
    this.current = null;
    this.status = "active";
  }

  get topics() {
    return this.config.topics || this.qe.getAllTopics();
  }

  // pick + set the next question; returns it (or null if exhausted/complete)
  next() {
    if (this.answers.length >= this.config.length) {
      this.status = "complete";
      this.current = null;
      return null;
    }
    const weakness = computeWeakness(this.performance, this.topics);
    let pool = [];
    let guard = 0;
    // try weakness-biased topic; fall back to any available question
    while (pool.length === 0 && guard++ < 10) {
      const topic = selectTopic(weakness, this.topics, this.rng);
      pool = this.qe.getAvailableByTopic(topic, this.askedIds);
    }
    if (pool.length === 0) pool = this.qe.getAvailable(this.askedIds);
    if (pool.length === 0) { this.status = "complete"; this.current = null; return null; }

    this.current = pool[Math.floor(this.rng() * pool.length)];
    return this.current;
  }

  submit(selectedKey) {
    if (!this.current || this.status === "complete") return;
    const q = this.current;
    const isCorrect = selectedKey === q.correct;
    this.answers.push({
      questionId: q.id, topic: q.topic,
      selected: selectedKey, correct: q.correct, isCorrect
    });
    this.askedIds.push(q.id);
    this.performance = recordAnswer(this.performance, q.topic, isCorrect);
  }

  isComplete() {
    return this.status === "complete" || this.answers.length >= this.config.length;
  }

  getResults() {
    const correct = this.answers.filter(a => a.isCorrect).length;
    const weakness = computeWeakness(this.performance, this.topics);
    const weakTopics = Object.entries(weakness)
      .filter(([, w]) => w >= 0.5)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, w]) => ({ topic, weakness: w }));
    return {
      score: correct,
      total: this.answers.length,
      percent: this.answers.length ? Math.round((correct / this.answers.length) * 100) : 0,
      weakTopics,
      performance: this.performance
    };
  }
}
```

### 4d. React bridge — `hooks/useSession.js` (the ONLY glue)
Critical: the engine instance lives in a `ref` (stable across renders); a `version` counter forces re-render after each mutation. UI never touches the engine directly.

```js
import { useRef, useState, useCallback } from "react";
import { SessionEngine } from "../engines/sessionEngine.js";
import { createQuestionEngine } from "../engines/questionEngine.js";

export function useSession() {
  const engineRef = useRef(null);
  const [, bump] = useState(0);
  const rerender = () => bump(v => v + 1);

  const start = useCallback((config) => {
    engineRef.current = new SessionEngine({
      config,
      questionEngine: createQuestionEngine()
    });
    engineRef.current.next();
    rerender();
  }, []);

  const submit = useCallback((key) => {
    const e = engineRef.current;
    if (!e) return;
    e.submit(key);
    e.isComplete() ? (e.status = "complete") : e.next();
    rerender();
  }, []);

  const e = engineRef.current;
  return {
    started: !!e,
    currentQuestion: e?.current ?? null,
    isComplete: e?.isComplete() ?? false,
    progress: e ? { answered: e.answers.length, total: e.config.length } : null,
    results: e?.isComplete() ? e.getResults() : null,
    start, submit
  };
}
```

UI components (`StartScreen`, `QuestionCard`, `Results`) receive props + callbacks only. Example `App.jsx` switch:

```jsx
function App() {
  const s = useSession();
  if (!s.started)   return <StartScreen onStart={(len) => s.start({ length: len, topics: null })} />;
  if (s.isComplete) return <Results results={s.results} onRestart={() => s.start({ length: 10 })} />;
  return <QuestionCard q={s.currentQuestion} progress={s.progress} onAnswer={s.submit} />;
}
```

---

## 5. State flow

```
StartScreen
   │  onStart(length)          ← length chosen by user, passed as config
   ▼
useSession.start(config)
   │  new SessionEngine(config) → engine.next()
   ▼
QuestionCard  renders engine.current
   │  onAnswer(key)
   ▼
useSession.submit(key)
   │  engine.submit(key)               → adaptationEngine.recordAnswer (updates performance)
   │  engine.isComplete() ? mark done  : engine.next()
   │                                       └─ computeWeakness → selectTopic (70/30) → pick question
   ▼
 rerender
   │
   ├─ not complete → back to QuestionCard (new question)
   └─ complete     → Results renders engine.getResults() {score, weakTopics}
                        │ onRestart → start() again
                        ▼  (performance is fresh per session in MVP;
                            persisting it across sessions = one localStorage line later)
```

Future "next session influenced by past performance": persist `engine.performance` to `localStorage` on complete, and seed the new `SessionEngine` with it. The engine already takes performance as plain data, so this needs no rewrite.

---

## 6. Build plan (small, independent steps)

1. **Scaffold** — `npm create vite@latest mindarc -- --template react`; strip boilerplate; app renders "Mindarc".
2. **Question bank** — `data/questions.js`: ~15 questions across 3 topics (e.g. arithmetic, algebra, fractions). Pure data.
3. **Question Engine** — `questionEngine.js` with selectors. *Test in isolation:* topics list, exclude-ids filtering.
4. **Adaptation Engine** — `adaptationEngine.js` (`recordAnswer`, `computeWeakness`, `selectTopic`). *Write tests first with a seeded `rng`* — assert 70/30 bias and weakness math. No UI yet.
5. **Session Engine** — `sessionEngine.js` class. *Headless test:* run a full session in a loop answering all-correct then all-wrong; assert `getResults()` score + weakTopics. Still no UI.
6. **useSession hook** — wire engines to React via ref + version bump.
7. **StartScreen** — pick session length → `onStart(length)`.
8. **QuestionCard** — render question + 4 options + progress; fire `onAnswer`.
9. **Results** — score, %, weak-topic list, restart.
10. **Persist performance** (optional, last) — save/load `performance` via `localStorage` so the next session is biased by history.

Steps 2–5 deliver a fully working, testable engine before any UI exists — proving the "testable without UI" requirement.

---

## 7. Key risks & pitfalls

- **Mutating the engine won't re-render React.** The engine intentionally mutates its own state; React only updates because of the `version` bump in `useSession`. Never read engine state into `useState` and mutate that — keep the engine as the single source of truth, force renders explicitly.
- **Recreating the engine every render.** Must live in `useRef`, created only inside `start()`. A `new SessionEngine()` in the component body would reset the session on every keystroke/render.
- **Stale closures.** Wrap `start`/`submit` in `useCallback` and read `engineRef.current` *inside* the callback (not captured at definition) so they always see live state.
- **Non-deterministic tests.** `selectTopic` and question picking use injected `rng`. Tests must pass a seeded generator (e.g. a small LCG) — never test against `Math.random`.
- **Divide-by-zero / cold start.** Untried topics return weakness `1` so early questions spread across topics instead of crashing on `0/0`.
- **Running out of questions.** Bank can be smaller than `config.length`; the engine falls back to any-available, then completes early. UI must read `progress.total` from config, not assume a fixed count.
- **Hardcoding length in UI.** Length flows StartScreen → config → engine. Don't bake `10` into the engine or QuestionCard.

---

## Why this meets the success criteria
- **Incremental, no rewrites:** UI is added only at step 6+; engines are stable before that.
- **Independently testable:** steps 3–5 ship with headless tests, zero DOM.
- **Swappable UI:** all logic sits behind `useSession`; replacing components (or swapping in a backend later by feeding `performance` from an API) touches no engine code.
