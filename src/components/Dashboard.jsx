// Dashboard — tabbed navigation: Home | Topics | History | Avatar | Settings.
// Home: subject picker + level picker + difficulty picker + session length config.
// Topics: per-subject topic mastery with progress bars + study links.
// History: session list with subject badge.
// Avatar: customise avatar + spend coins.
// Settings: manage session history (delete individual sessions).
import { useState, useEffect, useMemo } from "react";
import { getSessions, getTopicProgress, deleteSession, getSessionAnswers, getSRSTopics } from "../api/sessions.js";
import { getGeneralFeedback, getExplanationMismatches } from "../api/feedback.js";
import { fetchQuestions } from "../api/questions.js";
import { getResources, TYPE_ICON } from "../data/resources.js";
import { getExplanation } from "../data/explanations.js";
import { createQuestionEngine, DIFFICULTY_TIERS } from "../engines/questionEngine.js";
import QuestionReview from "./QuestionReview.jsx";
import { getAvatarMe } from "../api/avatar.js";
import AvatarDisplay from "./AvatarDisplay.jsx";
import CustomiseScreen from "./CustomiseScreen.jsx";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: "maths",     label: "Maths" },
  { value: "physics",   label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology",   label: "Biology" },
];

const LEVELS = {
  maths: [
    { value: "ks2",    label: "KS2" },
    { value: "ks3",    label: "KS3" },
    { value: "gcse",   label: "GCSE" },
    { value: "alevel", label: "A-Level" },
  ],
  physics: [
    { value: "ks2",    label: "KS2" },
    { value: "ks3",    label: "KS3" },
    { value: "gcse",   label: "GCSE" },
    { value: "alevel", label: "A-Level" },
  ],
  chemistry: [
    { value: "ks2",    label: "KS2" },
    { value: "ks3",    label: "KS3" },
    { value: "gcse",   label: "GCSE" },
    { value: "alevel", label: "A-Level" },
  ],
  biology: [
    { value: "ks2",    label: "KS2" },
    { value: "ks3",    label: "KS3" },
    { value: "gcse",   label: "GCSE" },
    { value: "alevel", label: "A-Level" },
  ],
};

const LEVEL_LABELS = {
  ks2:    "Years 3-6 (KS2)",
  ks3:    "Years 7-9 (KS3)",
  gcse:   "GCSE",
  alevel: "A-Level",
};

const SUBJECT_LABELS = { maths: "Maths", physics: "Physics", chemistry: "Chemistry", biology: "Biology" };

const TIER_ORDER  = ["easy", "medium", "hard"];
const TIER_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };

// ── Helpers ───────────────────────────────────────────────────────────────────

// Returns sorted category names from a pre-fetched question bank slice.
function getCategoriesForLevel(bank, subject, level) {
  const cats = new Set();
  bank.forEach((q) => {
    if (q.subject === subject && q.level === level) cats.add(q.category);
  });
  return [...cats].sort();
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric", month: "short", year: "numeric",
  });
}

function topicVariant(attempts, accuracy) {
  if (!attempts) return "not-started";
  if (accuracy >= 67) return "good";
  if (accuracy >= 34) return "mid";
  return "weak";
}

// ── TopicExpandPanel — explanation + resources, used in Topics tab ────────────

function TopicExpandPanel({ level, category, subject }) {
  const links = getResources(level, category);
  const explanation = getExplanation(level, category);

  return (
    <div className="explanation-panel" onClick={(e) => e.stopPropagation()}>
      {explanation && (
        <>
          <p className="explanation-key-idea">💡 {explanation.keyIdea}</p>
          <p className="explanation-body">{explanation.body}</p>

          {explanation.workedExample && (
            <div className="explanation-example">
              <p className="explanation-example-label">Worked example</p>
              <p className="explanation-example-problem">{explanation.workedExample.problem}</p>
              <p className="explanation-example-solution">{explanation.workedExample.solution}</p>
            </div>
          )}

          {explanation.keyFacts?.length > 0 && (
            <div className="explanation-section">
              <p className="explanation-section-label">Key facts</p>
              <ul className="explanation-list">
                {explanation.keyFacts.map((f, i) => <li key={i}>{f}</li>)}
              </ul>
            </div>
          )}

          {explanation.commonMistakes?.length > 0 && (
            <div className="explanation-section">
              <p className="explanation-section-label">Common mistakes</p>
              <ul className="explanation-list explanation-list--mistakes">
                {explanation.commonMistakes.map((m, i) => <li key={i}>{m}</li>)}
              </ul>
            </div>
          )}
        </>
      )}

      {links.length > 0 && (
        <>
          <p className="explanation-section-label" style={{ marginTop: explanation ? 12 : 0, marginBottom: 6 }}>
            Study resources
          </p>
          <ul className="resource-list">
            {links.map((r) => (
              <li key={r.url}>
                <a href={r.url} target="_blank" rel="noopener noreferrer">
                  <span className="resource-type-badge">{TYPE_ICON[r.type]}</span>
                  {r.title}
                </a>
              </li>
            ))}
            <li>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${LEVEL_LABELS[level] ?? level} ${SUBJECT_LABELS[subject] ?? subject} explain ${category}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="resource-type-badge">▶️</span>
                Search YouTube: &ldquo;{LEVEL_LABELS[level] ?? level} {SUBJECT_LABELS[subject] ?? subject} explain {category}&rdquo;
              </a>
            </li>
          </ul>
        </>
      )}
    </div>
  );
}

// ── Subject switcher ──────────────────────────────────────────────────────────

function SubjectPicker({ subject, onChange }) {
  return (
    <div className="level-picker" style={{ marginBottom: 4 }}>
      {SUBJECTS.map((s) => (
        <button
          key={s.value}
          className={"level-btn" + (subject === s.value ? " active" : "")}
          onClick={() => onChange(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}

// ── Home tab prefs persistence ────────────────────────────────────────────────

const PREFS_KEY = "mintymarks_home_prefs";

function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    // Basic sanity — discard if shape looks wrong
    if (typeof p.subject !== "string" || typeof p.level !== "string") return null;
    return p;
  } catch {
    return null;
  }
}

function savePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Storage unavailable — silently ignore
  }
}

// ── Home tab ──────────────────────────────────────────────────────────────────

function HomeTab({ sessions, topics, loading, onStart }) {
  const saved = loadPrefs();
  const [subject,            setSubject]            = useState(saved?.subject           ?? "maths");
  const [level,              setLevel]              = useState(saved?.level             ?? "ks3");
  const [difficulty,         setDifficulty]         = useState(saved?.difficulty        ?? "all"); // "all" | "easy" | "medium" | "hard"
  const [length,             setLength]             = useState(saved?.length            ?? 10);
  const [lengthStr,          setLengthStr]          = useState(String(saved?.length ?? 10));
  const [topicMode,          setTopicMode]          = useState(saved?.topicMode         ?? "random"); // "adaptive" | "random" | "specific"
  const [selectedCategories, setSelectedCategories] = useState(saved?.selectedCategories ?? []);
  const [topicProgress,      setTopicProgress]      = useState({}); // category -> weakness (0..1)
  const [tpLoading,          setTpLoading]          = useState(false);
  const [bank,               setBank]               = useState([]);
  const [bankLoading,        setBankLoading]        = useState(true);
  // Cross-session adaptive seeding: performance map fetched from API before start
  const [perfSeed,           setPerfSeed]           = useState(null);
  // SRS: number of topics due for review right now
  const [srsCount,           setSrsCount]           = useState(0);

  const availableLevels = LEVELS[subject];
  // If the saved level doesn't exist for this subject, fall back to first available.
  const validLevel = availableLevels.find((l) => l.value === level)
    ? level
    : availableLevels[0].value;
  if (validLevel !== level) setLevel(validLevel);

  // Fetch questions for the selected subject + level from the API.
  // The bank is used for tier availability and passed to the session engine on start.
  useEffect(() => {
    setBankLoading(true);
    fetchQuestions(validLevel, subject)
      .then(setBank)
      .catch(() => setBank([]))
      .finally(() => setBankLoading(false));
  }, [subject, validLevel]);

  // Which difficulty tiers have questions for this level (derived from fetched bank).
  const availableTiers = useMemo(() => {
    if (!bank.length) return [];
    return createQuestionEngine(subject, bank).getAvailableTiers(validLevel);
  }, [bank, subject, validLevel]);

  // Sorted category list for the current subject + level (for the specific-topic picker).
  const allCategories = useMemo(() => {
    if (!bank.length) return [];
    return createQuestionEngine(subject, bank).getCategories(validLevel).sort();
  }, [bank, subject, validLevel]);

  // Fetch topic progress (weakness scores) when specific mode is active (pill colours).
  useEffect(() => {
    if (topicMode !== "specific") return;
    setTpLoading(true);
    getTopicProgress(subject)
      .then((rows) => {
        const map = {};
        rows.forEach((r) => { map[r.category] = r.weakness; });
        setTopicProgress(map);
      })
      .catch(() => setTopicProgress({}))
      .finally(() => setTpLoading(false));
  }, [topicMode, subject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-session adaptive seeding: fetch historical performance AND SRS state when
  // adaptive mode is selected so the session engine starts with real weakness scores
  // and respects the spaced-repetition schedule from the first question.
  const [srsSeed, setSrsSeed] = useState({});
  useEffect(() => {
    if (topicMode !== "adaptive") { setPerfSeed(null); setSrsSeed({}); return; }
    Promise.all([
      getTopicProgress(subject, validLevel),
      getSRSTopics(subject),
    ])
      .then(([rows, srsRows]) => {
        const byTopic = {};
        rows.forEach((r) => { byTopic[r.category] = { attempts: r.attempts, correct: r.correct }; });
        setPerfSeed({ byTopic });
        const srsState = {};
        srsRows.forEach((r) => { srsState[r.category] = { isDue: r.isDue }; });
        setSrsSeed(srsState);
      })
      .catch(() => { setPerfSeed(null); setSrsSeed({}); });
  }, [topicMode, subject, validLevel]); // eslint-disable-line react-hooks/exhaustive-deps

  // SRS due count: refresh when subject changes so the banner stays accurate.
  useEffect(() => {
    getSRSTopics(subject)
      .then((rows) => setSrsCount(rows.filter((r) => r.isDue).length))
      .catch(() => setSrsCount(0));
  }, [subject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drop any selected categories that vanished after a level/subject change.
  useEffect(() => {
    if (!selectedCategories.length || !allCategories.length) return;
    const valid = new Set(allCategories);
    const filtered = selectedCategories.filter((c) => valid.has(c));
    if (filtered.length !== selectedCategories.length) setSelectedCategories(filtered);
  }, [allCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Reset difficulty if the selected tier no longer exists after a level change.
  useEffect(() => {
    if (difficulty !== "all" && availableTiers.length > 0 && !availableTiers.includes(difficulty)) {
      setDifficulty("all");
    }
  }, [availableTiers, difficulty]);

  // Persist prefs whenever any selection changes.
  useEffect(() => {
    savePrefs({ subject, level: validLevel, difficulty, length, topicMode, selectedCategories });
  }, [subject, validLevel, difficulty, length, topicMode, selectedCategories]); // eslint-disable-line react-hooks/exhaustive-deps

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, x) => s + x.percent, 0) / sessions.length)
      : null;

  const handleSubjectChange = (s) => {
    setSubject(s);
    setDifficulty("all");
    setSelectedCategories([]); // categories are subject-scoped
  };

  const handleLevelChange = (l) => {
    setLevel(l);
    setDifficulty("all"); // tier availability re-derived after bank fetch completes
  };

  const handleStart = () => {
    const difficulties       = difficulty === "all" ? null : DIFFICULTY_TIERS[difficulty];
    const categories         = topicMode === "specific" && selectedCategories.length > 0
      ? selectedCategories : null;
    // Seed adaptive performance from API data so weakness scores are real from question 1.
    const initialPerformance = topicMode === "adaptive" ? perfSeed : null;
    // Pass SRS state so the session engine boosts overdue topics in adaptive selection.
    const srsState           = topicMode === "adaptive" ? srsSeed : {};
    onStart({ subject, level: validLevel, length, difficulties, bank, topicMode, categories, initialPerformance, srsState });
  };

  return (
    <div>
      {!loading && sessions.length > 0 && (
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-value">{sessions.length}</span>
            <span className="stat-label">Sessions</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{avgScore}%</span>
            <span className="stat-label">Avg score</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{topics.length}</span>
            <span className="stat-label">Topics seen</span>
          </div>
        </div>
      )}

      <p className="field-label" style={{ marginTop: sessions.length ? 20 : 0 }}>
        Subject
      </p>
      <SubjectPicker subject={subject} onChange={handleSubjectChange} />

      <p className="field-label" style={{ marginTop: 16 }}>Level</p>
      <div className="level-picker">
        {availableLevels.map((l) => (
          <button
            key={l.value}
            className={"level-btn" + (validLevel === l.value ? " active" : "")}
            onClick={() => handleLevelChange(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="field-label" style={{ marginTop: 16 }}>Difficulty</p>
      <div className="level-picker">
        <button
          className={"level-btn" + (difficulty === "all" ? " active" : "")}
          onClick={() => setDifficulty("all")}
        >
          All
        </button>
        {TIER_ORDER.filter((t) => availableTiers.includes(t)).map((t) => (
          <button
            key={t}
            className={"level-btn" + (difficulty === t ? " active" : "")}
            onClick={() => setDifficulty(t)}
          >
            {TIER_LABELS[t]}
          </button>
        ))}
      </div>

      <p className="field-label" style={{ marginTop: 16 }}>Topic focus</p>
      <div className="level-picker">
        <button
          className={"level-btn" + (topicMode === "random" ? " active" : "")}
          onClick={() => setTopicMode("random")}
        >
          All
        </button>
        <button
          className={"level-btn" + (topicMode === "adaptive" ? " active" : "")}
          onClick={() => setTopicMode("adaptive")}
        >
          Weak topics
        </button>
        <button
          className={"level-btn" + (topicMode === "specific" ? " active" : "")}
          onClick={() => setTopicMode("specific")}
        >
          Pick topics
        </button>
      </div>

      {topicMode === "adaptive" && (
        <>
          <p className="topic-mode-hint">Focuses on your weakest topics based on past sessions.</p>
          {srsCount > 0 && (
            <p className="topic-mode-hint" style={{ marginTop: 4, fontWeight: 500 }}>
              📅 {srsCount} topic{srsCount > 1 ? "s" : ""} due for spaced review.
            </p>
          )}
        </>
      )}
      {topicMode === "random" && (
        <p className="topic-mode-hint">Questions chosen evenly across all topics.</p>
      )}
      {topicMode === "specific" && (
        <div>
          <div className="topic-pills-wrapper">
            {tpLoading || bankLoading ? (
              <p className="topic-mode-hint" style={{ margin: 0 }}>Loading topics…</p>
            ) : allCategories.length === 0 ? (
              <p className="topic-mode-hint" style={{ margin: 0 }}>No topics found for this level.</p>
            ) : (
              allCategories.map((cat) => {
                const w = topicProgress[cat];
                const pillVariant = w === undefined ? "new"
                  : w >= 0.67 ? "weak"
                  : w >= 0.34 ? "mid"
                  : "good";
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    className={`topic-pill topic-pill--${pillVariant}${isSelected ? " topic-pill--selected" : ""}`}
                    onClick={() => toggleCategory(cat)}
                  >
                    {cat}
                  </button>
                );
              })
            )}
          </div>
          {!tpLoading && allCategories.length > 0 && selectedCategories.length === 0 && (
            <p className="topic-mode-hint" style={{ marginTop: 8 }}>
              Tap topics to select them. Colours show your history: red = weak, amber = mid, green = strong.
            </p>
          )}
          {selectedCategories.length > 0 && (
            <p className="topic-mode-hint" style={{ marginTop: 8 }}>
              {selectedCategories.length} topic{selectedCategories.length > 1 ? "s" : ""} selected.{" "}
              <button
                className="btn-cancel-text"
                style={{ fontSize: "0.8rem", padding: 0 }}
                onClick={() => setSelectedCategories([])}
              >
                Clear
              </button>
            </p>
          )}
        </div>
      )}

      <label className="field">
        <span>Questions this session</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            className="stepper-btn"
            onClick={() => {
              const next = Math.max(1, length - 1);
              setLength(next);
              setLengthStr(String(next));
            }}
            aria-label="Decrease"
          >−</button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={lengthStr}
            style={{ width: 52, textAlign: "center" }}
            onChange={(e) => {
              const raw = e.target.value.replace(/[^0-9]/g, "");
              setLengthStr(raw);
              const v = parseInt(raw, 10);
              if (!isNaN(v)) setLength(Math.min(100, Math.max(1, v)));
            }}
            onBlur={() => {
              const v = parseInt(lengthStr, 10);
              const clamped = isNaN(v) || v < 1 ? 1 : Math.min(100, v);
              setLength(clamped);
              setLengthStr(String(clamped));
            }}
          />
          <button
            type="button"
            className="stepper-btn"
            onClick={() => {
              const next = Math.min(100, length + 1);
              setLength(next);
              setLengthStr(String(next));
            }}
            aria-label="Increase"
          >+</button>
        </div>
      </label>

      <button
        className="btn-primary"
        onClick={handleStart}
        disabled={
          bankLoading ||
          bank.length === 0 ||
          (topicMode === "specific" && selectedCategories.length === 0)
        }
      >
        {bankLoading ? "Loading…" : "Start session"}
      </button>
    </div>
  );
}

// ── Topics tab ────────────────────────────────────────────────────────────────

function TopicsTab({ loading, fetchTopics }) {
  const [subject,     setSubject]     = useState("maths");
  const [topicLevel,  setTopicLevel]  = useState("ks3");
  const [topics,      setTopics]      = useState([]);
  const [fetching,    setFetching]    = useState(false);
  const [catBank,     setCatBank]     = useState([]);
  const [catFetching, setCatFetching] = useState(true);

  useEffect(() => {
    setFetching(true);
    fetchTopics(subject)
      .then(setTopics)
      .catch(() => setTopics([]))
      .finally(() => setFetching(false));
  }, [subject]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableLevels = LEVELS[subject];
  const validLevel = availableLevels.find((l) => l.value === topicLevel)
    ? topicLevel
    : availableLevels[0].value;

  // Fetch question bank slice for category listing.
  useEffect(() => {
    setCatFetching(true);
    fetchQuestions(validLevel, subject)
      .then(setCatBank)
      .catch(() => setCatBank([]))
      .finally(() => setCatFetching(false));
  }, [subject, validLevel]);

  const progressMap = Object.fromEntries(topics.map((t) => [t.category, t]));

  const allCategories = getCategoriesForLevel(catBank, subject, validLevel).map((cat) => {
    const p = progressMap[cat];
    return p
      ? { category: cat, ...p, accuracy: Math.round((1 - p.weakness) * 100) }
      : { category: cat, attempts: 0, correct: 0, weakness: null, accuracy: null };
  });

  return (
    <div>
      <p className="field-label">Subject</p>
      <SubjectPicker subject={subject} onChange={setSubject} />

      <div className="level-picker" style={{ marginTop: 12, marginBottom: 18 }}>
        {availableLevels.map((l) => (
          <button
            key={l.value}
            className={"level-btn" + (validLevel === l.value ? " active" : "")}
            onClick={() => setTopicLevel(l.value)}
          >
            {l.label}
          </button>
        ))}
      </div>

      <p className="section-label">
        {SUBJECT_LABELS[subject]} — {LEVEL_LABELS[validLevel]}
      </p>

      {loading || fetching || catFetching ? (
        <p className="subtitle">Loading…</p>
      ) : (
        <>
          <TopicCardList categories={allCategories} level={validLevel} subject={subject} />
          {allCategories.length === 0 && (
            <p className="subtitle">No questions found for this subject/level combination.</p>
          )}
          {allCategories.length > 0 && (
            <p className="resource-hint">
              📚 Tap any topic to see an explanation and study resources.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── TopicCardList + TopicCard — collapsible cards for Topics tab ──────────────

function TopicCard({ t, level, subject }) {
  const hasContent =
    getResources(level, t.category).length > 0 ||
    getExplanation(level, t.category) != null;
  const [open, setOpen] = useState(false);
  const variant = topicVariant(t.attempts, t.accuracy);

  return (
    <li
      className={"topic-card topic-card--" + variant + (hasContent ? " topic-card--expandable" : "")}
      onClick={hasContent ? () => setOpen((v) => !v) : undefined}
      style={{ cursor: hasContent ? "pointer" : "default" }}
    >
      <div className="topic-card-header">
        <div className="topic-card-name">{t.category}</div>
        {hasContent && (
          <span className="topic-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", fontSize: "0.85rem" }}>
            ▾
          </span>
        )}
      </div>

      {variant === "not-started" ? (
        <div className="topic-card-status">Not started — tap to study</div>
      ) : (
        <>
          <div className="topic-accuracy-bar">
            <div
              className="topic-accuracy-fill"
              style={{ width: t.accuracy + "%" }}
            />
          </div>
          <div className="topic-card-meta">
            {t.accuracy}% &middot; {t.correct}/{t.attempts} correct
            {t.avgTimeSec != null && " · avg " + t.avgTimeSec + "s"}
          </div>
        </>
      )}

      {open && hasContent && (
        <TopicExpandPanel level={level} category={t.category} subject={subject} />
      )}
    </li>
  );
}

function TopicCardList({ categories, level, subject }) {
  return (
    <ul className="topic-grid">
      {categories.map((t) => (
        <TopicCard key={t.category} t={t} level={level} subject={subject} />
      ))}
    </ul>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

// Expandable row: fetches answers + question bank on first open.
function HistorySessionRow({ s }) {
  const [open,    setOpen]    = useState(false);
  const [answers, setAnswers] = useState(null);   // null = not yet fetched
  const [bank,    setBank]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(false);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (!next || answers !== null) return; // already fetched or closing
    setLoading(true);
    setError(false);
    try {
      const [answerRows, bankData] = await Promise.all([
        getSessionAnswers(s.id),
        fetchQuestions(s.level, s.subject),
      ]);
      setAnswers(answerRows);
      setBank(bankData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="history-session-row">
      {/* ── Summary header (always visible, clickable) ── */}
      <div
        className="history-session-header"
        onClick={handleOpen}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleOpen()}
      >
        <div className="history-session-meta">
          <span className="session-level">
            {SUBJECT_LABELS[s.subject] || s.subject} · {LEVEL_LABELS[s.level] || s.level}
          </span>
          <span className="session-date">{formatDate(s.completedAt)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className={`session-score history-score--${s.percent >= 70 ? "good" : s.percent >= 40 ? "mid" : "weak"}`}>
            {s.score}/{s.total} · {s.percent}%
          </span>
          <span className="topic-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", fontSize: "0.85rem" }}>
            ▾
          </span>
        </div>
      </div>

      {/* ── Expanded review ── */}
      {open && (
        <div className="history-session-body">
          {loading && <p className="subtitle" style={{ margin: "12px 0" }}>Loading questions…</p>}
          {error   && <p className="subtitle" style={{ margin: "12px 0", color: "var(--danger, #e55)" }}>Failed to load — tap to retry.</p>}
          {!loading && !error && answers !== null && (
            answers.length === 0
              ? <p className="subtitle" style={{ margin: "12px 0" }}>No answer data saved for this session.</p>
              : <QuestionReview answers={answers} bank={bank} level={s.level} subject={s.subject} />
          )}
        </div>
      )}
    </li>
  );
}

function HistoryTab({ sessions, loading }) {
  if (loading) return <p className="subtitle">Loading…</p>;
  if (!sessions.length)
    return <p className="subtitle">No sessions yet. Start one from Home.</p>;

  return (
    <>
      <p className="section-label">Session history</p>
      <p className="subtitle" style={{ marginBottom: 14 }}>
        Tap a session to review its questions.
      </p>
      <ul className="history-session-list">
        {sessions.map((s) => (
          <HistorySessionRow key={s.id} s={s} />
        ))}
      </ul>
    </>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────

// ── SubmissionsInbox — admin-only view of all feedback ────────────────────────

function SubmissionsInbox() {
  const [general,    setGeneral]    = useState(null);
  const [mismatches, setMismatches] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(false);
  const [authError,  setAuthError]  = useState(false);
  const [filter,     setFilter]     = useState("all"); // "all" | "feedback" | "mismatches"

  async function load() {
    setLoading(true);
    setError(false);
    setAuthError(false);
    try {
      const [g, m] = await Promise.all([
        getGeneralFeedback(),
        getExplanationMismatches(),
      ]);
      setGeneral(g);
      setMismatches(m);
    } catch (err) {
      // 401/403 means the session has expired — guide the user to sign in again
      // rather than showing a generic "check connection" message.
      if (err.status === 401 || err.status === 403) {
        setAuthError(true);
      } else {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }

  // Auto-load when this component mounts (i.e. when the section is expanded).
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <p className="subtitle" style={{ marginTop: 8 }}>Loading…</p>;

  if (authError) {
    return (
      <div style={{ marginTop: 8 }}>
        <p className="subtitle" style={{ color: "var(--danger, #e55)" }}>
          Session expired — please sign out and sign in again.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginTop: 8 }}>
        <p className="subtitle" style={{ color: "var(--danger, #e55)" }}>Failed to load — check connection.</p>
        <button className="btn-ghost" style={{ fontSize: "0.8rem" }} onClick={load}>Retry</button>
      </div>
    );
  }

  // Build unified list for display
  const feedbackItems = (general || []).map((r) => ({
    type: "feedback",
    id: "g-" + r.id,
    date: r.submitted_at,
    primary: r.message,
    meta: [r.subject, r.level, r.category].filter(Boolean).join(" · "),
    questionText: r.question_text || "",
  }));

  const mismatchItems = (mismatches || []).map((r) => ({
    type: "mismatch",
    id: "m-" + r.id,
    date: r.reported_at,
    primary: r.question_text || "(no question text saved)",
    meta: [r.subject, r.level, r.category].filter(Boolean).join(" · "),
    questionText: "",
  }));

  const allItems = [...feedbackItems, ...mismatchItems].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const shown = filter === "all"
    ? allItems
    : filter === "feedback"
    ? feedbackItems
    : mismatchItems;

  const totalFeedback   = feedbackItems.length;
  const totalMismatches = mismatchItems.length;

  return (
    <div style={{ marginTop: 4 }}>
      {/* Filter bar */}
      <div className="level-picker" style={{ marginBottom: 12 }}>
        <button
          className={"level-btn" + (filter === "all" ? " active" : "")}
          onClick={() => setFilter("all")}
        >
          All ({allItems.length})
        </button>
        <button
          className={"level-btn" + (filter === "feedback" ? " active" : "")}
          onClick={() => setFilter("feedback")}
        >
          Feedback ({totalFeedback})
        </button>
        <button
          className={"level-btn" + (filter === "mismatches" ? " active" : "")}
          onClick={() => setFilter("mismatches")}
        >
          Mismatches ({totalMismatches})
        </button>
        <button className="btn-ghost" style={{ fontSize: "0.8rem", marginLeft: "auto" }} onClick={load}>
          ↺ Refresh
        </button>
      </div>

      {shown.length === 0 ? (
        <p className="subtitle">No submissions yet.</p>
      ) : (
        <ul className="session-list" style={{ gap: 8 }}>
          {shown.map((item) => (
            <li key={item.id} className="session-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                <span
                  className="session-level"
                  style={{
                    fontSize: "0.7rem",
                    padding: "2px 6px",
                    borderRadius: 4,
                    background: item.type === "mismatch" ? "var(--danger-bg, #ffeaea)" : "var(--accent-bg, #eaf0ff)",
                    color: item.type === "mismatch" ? "var(--danger, #c44)" : "var(--accent, #446)",
                  }}
                >
                  {item.type === "mismatch" ? "🚩 Mismatch" : "💬 Feedback"}
                </span>
                <span className="session-date" style={{ fontSize: "0.72rem" }}>
                  {formatDate(item.date)}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: 1.4 }}>{item.primary}</p>
              {item.meta && (
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{item.meta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SettingsTab({ sessions, loading, onDeleteSession }) {
  const [pendingId,    setPendingId]    = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  async function handleDelete(id) {
    setDeletingId(id);
    setPendingId(null);
    try {
      await deleteSession(id);
      onDeleteSession(id);
    } catch {
      // Non-fatal: leave row so the user can retry
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <p className="section-label">Manage session history</p>
      <p className="subtitle" style={{ marginBottom: 16 }}>
        Remove individual sessions from your history. Deleted sessions are also removed
        from topic progress calculations.
      </p>

      {loading ? (
        <p className="subtitle">Loading…</p>
      ) : sessions.length === 0 ? (
        <p className="subtitle">No sessions yet.</p>
      ) : (
        <ul className="session-list">
          {sessions.map((s) => {
            const isConfirming = pendingId  === s.id;
            const isDeleting   = deletingId === s.id;

            return (
              <li key={s.id} className="session-item" style={{ alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <span className="session-level">
                    {SUBJECT_LABELS[s.subject] || s.subject} · {LEVEL_LABELS[s.level] || s.level}
                  </span>
                  <span className="session-date">{formatDate(s.completedAt)}</span>
                  <span
                    className="session-score"
                    style={{ display: "block", fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}
                  >
                    {s.score}/{s.total} · {s.percent}%
                  </span>
                </div>

                {isDeleting ? (
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Deleting…</span>
                ) : isConfirming ? (
                  <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)", marginRight: 4 }}>
                      Remove?
                    </span>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.8rem", color: "var(--danger, #e55)" }}
                      onClick={() => handleDelete(s.id)}
                    >
                      Yes
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.8rem" }}
                      onClick={() => setPendingId(null)}
                    >
                      Cancel
                    </button>
                  </span>
                ) : (
                  <button
                    className="btn-ghost"
                    style={{ fontSize: "0.8rem", color: "var(--muted)" }}
                    onClick={() => setPendingId(s.id)}
                    aria-label="Delete session"
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* ── Submissions inbox (expandable) ── */}
      <button
        onClick={() => setFeedbackOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          marginTop: 28,
          background: "none",
          border: "none",
          padding: "4px 0",
          cursor: "pointer",
          fontFamily: "inherit",
          textAlign: "left",
        }}
      >
        <span className="section-label" style={{ margin: 0 }}>See feedback</span>
        <span style={{ fontSize: "0.85rem", color: "var(--muted)", transform: feedbackOpen ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block", transition: "transform 0.15s" }}>▾</span>
      </button>
      {feedbackOpen && <SubmissionsInbox />}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onStart, onLogout, onBack }) {
  const [tab, setTab]             = useState("home");
  const [sessions, setSessions]   = useState([]);
  const [topics, setTopics]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [avatarData, setAvatarData] = useState(null); // { coins, equipped, owned, catalog }

  useEffect(() => {
    Promise.all([getSessions(), getTopicProgress("maths")])
      .then(([s, t]) => {
        setSessions(s);
        setTopics(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Fetch avatar on mount; silently ignore failures (coins/avatar are non-blocking UI).
  useEffect(() => {
    getAvatarMe().then(setAvatarData).catch(() => {});
  }, []);

  // When leaving the Avatar tab, refresh header coin + avatar display.
  function handleTabChange(key) {
    if (tab === "customise" && key !== "customise") {
      getAvatarMe().then(setAvatarData).catch(() => {});
    }
    setTab(key);
  }

  function handleDeleteSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const TABS = [
    { key: "home",      label: "Home" },
    { key: "topics",    label: "Topics" },
    { key: "history",   label: "History" },
    { key: "customise", label: "Avatar" },
    { key: "settings",  label: "Settings" },
  ];

  return (
    <div>
      <div className="dash-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AvatarDisplay equipped={avatarData?.equipped ?? {}} size={40} />
          <div>
            <h1 className="title" style={{ marginBottom: 2 }}>MintyMarks</h1>
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.875rem" }}>
              {user.username}
              {avatarData != null && (
                <span style={{ marginLeft: 8 }}>🪙 {avatarData.coins ?? 0}</span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {onBack && (
            <button className="btn-ghost" onClick={onBack}>← Profiles</button>
          )}
          <button className="btn-ghost" onClick={onLogout}>Sign out</button>
        </div>
      </div>

      <div className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={"tab-btn" + (tab === t.key ? " active" : "")}
            onClick={() => handleTabChange(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "home" && (
        <HomeTab sessions={sessions} topics={topics} loading={loading} onStart={onStart} />
      )}
      {tab === "topics" && (
        <TopicsTab
          loading={loading}
          fetchTopics={(subj) => getTopicProgress(subj).catch(() => [])}
        />
      )}
      {tab === "history" && (
        <HistoryTab sessions={sessions} loading={loading} />
      )}
      {tab === "customise" && (
        <CustomiseScreen />
      )}
      {tab === "settings" && (
        <SettingsTab
          sessions={sessions}
          loading={loading}
          onDeleteSession={handleDeleteSession}
        />
      )}
    </div>
  );
}
