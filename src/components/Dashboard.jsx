// Dashboard — tabbed navigation: Home | Topics | History | Settings.
// Home: subject picker + level picker + difficulty picker + session length config.
// Topics: per-subject topic mastery with progress bars + study links.
// History: session list with subject badge.
// Settings: manage session history (delete individual sessions).
import { useState, useEffect, useMemo } from "react";
import { getSessions, getTopicProgress, deleteSession } from "../api/sessions.js";
import { getResources, TYPE_ICON } from "../data/resources.js";
import { QUESTIONS } from "../data/questions.js";
import { createQuestionEngine, DIFFICULTY_TIERS } from "../engines/questionEngine.js";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = [
  { value: "maths",   label: "Maths" },
  { value: "physics", label: "Physics" },
];

const LEVELS = {
  maths: [
    { value: "ks2",    label: "KS2" },
    { value: "ks3",    label: "KS3" },
    { value: "gcse",   label: "GCSE" },
    { value: "alevel", label: "A-Level" },
  ],
  physics: [
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

const SUBJECT_LABELS = { maths: "Maths", physics: "Physics" };

const TIER_ORDER  = ["easy", "medium", "hard"];
const TIER_LABELS = { easy: "Easy", medium: "Medium", hard: "Hard" };

// Subject-agnostic engine used only for tier availability lookups.
const lookupEngine = createQuestionEngine(null);

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCategoriesForLevel(subject, level) {
  const cats = new Set();
  QUESTIONS.filter((q) => q.subject === subject && q.level === level).forEach((q) =>
    cats.add(q.category)
  );
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

// ── ResourceLinks ─────────────────────────────────────────────────────────────

function ResourceLinks({ level, category }) {
  const links = getResources(level, category);
  if (!links.length) return null;
  return (
    <ul className="resource-list">
      {links.map((r) => (
        <li key={r.url}>
          <a href={r.url} target="_blank" rel="noopener noreferrer">
            <span className="resource-type-badge">{TYPE_ICON[r.type]}</span>
            {r.title}
          </a>
        </li>
      ))}
    </ul>
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

// ── Home tab ──────────────────────────────────────────────────────────────────

function HomeTab({ sessions, topics, loading, onStart }) {
  const [subject,    setSubject]    = useState("maths");
  const [level,      setLevel]      = useState("ks3");
  const [difficulty, setDifficulty] = useState("all"); // "all" | "easy" | "medium" | "hard"
  const [length,     setLength]     = useState(10);

  const availableLevels = LEVELS[subject];
  const validLevel = availableLevels.find((l) => l.value === level)
    ? level
    : availableLevels[0].value;
  if (validLevel !== level) setLevel(validLevel);

  // Which difficulty tiers have questions for this level.
  const availableTiers = useMemo(
    () => lookupEngine.getAvailableTiers(validLevel),
    [validLevel]
  );

  const avgScore =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, x) => s + x.percent, 0) / sessions.length)
      : null;

  const handleSubjectChange = (s) => {
    setSubject(s);
    setDifficulty("all");
  };

  const handleLevelChange = (l) => {
    setLevel(l);
    // Reset difficulty if it won't exist at the new level.
    const tiers = lookupEngine.getAvailableTiers(l);
    if (difficulty !== "all" && !tiers.includes(difficulty)) {
      setDifficulty("all");
    }
  };

  const handleStart = () => {
    const difficulties = difficulty === "all" ? null : DIFFICULTY_TIERS[difficulty];
    onStart({ subject, level: validLevel, length, difficulties });
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

      <label className="field">
        <span>Questions this session</span>
        <input
          type="number"
          min={1}
          max={100}
          value={length}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (!isNaN(v)) setLength(Math.min(100, Math.max(1, v)));
          }}
          onBlur={(e) => {
            const v = Number(e.target.value);
            setLength(isNaN(v) || v < 1 ? 1 : Math.min(100, v));
          }}
        />
      </label>

      <button className="btn-primary" onClick={handleStart}>
        Start session
      </button>
    </div>
  );
}

// ── Topics tab ────────────────────────────────────────────────────────────────

function TopicsTab({ loading, fetchTopics }) {
  const [subject,    setSubject]    = useState("maths");
  const [topicLevel, setTopicLevel] = useState("ks3");
  const [topics,     setTopics]     = useState([]);
  const [fetching,   setFetching]   = useState(false);

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

  const progressMap = Object.fromEntries(topics.map((t) => [t.category, t]));

  const allCategories = getCategoriesForLevel(subject, validLevel).map((cat) => {
    const p = progressMap[cat];
    return p
      ? { category: cat, ...p, accuracy: Math.round((1 - p.weakness) * 100) }
      : { category: cat, attempts: 0, correct: 0, weakness: null, accuracy: null };
  });

  const hasAnyWeak = allCategories.some((t) => t.attempts > 0 && t.accuracy < 67);

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

      {loading || fetching ? (
        <p className="subtitle">Loading…</p>
      ) : (
        <>
          <ul className="topic-grid">
            {allCategories.map((t) => {
              const variant = topicVariant(t.attempts, t.accuracy);
              return (
                <li key={t.category} className={"topic-card topic-card--" + variant}>
                  <div className="topic-card-name">{t.category}</div>
                  {variant === "not-started" ? (
                    <div className="topic-card-status">Not started</div>
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
                      {t.weakness >= 0.33 && (
                        <ResourceLinks level={validLevel} category={t.category} />
                      )}
                    </>
                  )}
                </li>
              );
            })}
          </ul>
          {allCategories.length === 0 && (
            <p className="subtitle">No questions found for this subject/level combination.</p>
          )}
          {hasAnyWeak && (
            <p className="resource-hint">
              Study links shown above are tailored to your weak topics.
            </p>
          )}
        </>
      )}
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab({ sessions, loading }) {
  if (loading) return <p className="subtitle">Loading…</p>;
  if (!sessions.length)
    return <p className="subtitle">No sessions yet. Start one from Home.</p>;

  return (
    <>
      <p className="section-label">Session history</p>
      <ul className="session-list">
        {sessions.map((s) => (
          <li key={s.id} className="session-item">
            <div>
              <span className="session-level">
                {SUBJECT_LABELS[s.subject] || s.subject} · {LEVEL_LABELS[s.level] || s.level}
              </span>
              <span className="session-date">{formatDate(s.completedAt)}</span>
            </div>
            <span className="session-score">
              {s.score}/{s.total} &middot; {s.percent}%
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

// ── Settings tab ──────────────────────────────────────────────────────────────

function SettingsTab({ sessions, loading, onDeleteSession }) {
  const [pendingId,  setPendingId]  = useState(null);
  const [deletingId, setDeletingId] = useState(null);

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
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export default function Dashboard({ user, onStart, onLogout }) {
  const [tab, setTab]           = useState("home");
  const [sessions, setSessions] = useState([]);
  const [topics, setTopics]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([getSessions(), getTopicProgress("maths")])
      .then(([s, t]) => {
        setSessions(s);
        setTopics(t);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDeleteSession(id) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const TABS = [
    { key: "home",     label: "Home" },
    { key: "topics",   label: "Topics" },
    { key: "history",  label: "History" },
    { key: "settings", label: "Settings" },
  ];

  return (
    <div>
      <div className="dash-header">
        <div>
          <h1 className="title" style={{ marginBottom: 2 }}>Mindarc</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.875rem" }}>
            {user.username}
          </p>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Sign out</button>
      </div>

      <div className="tab-nav">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={"tab-btn" + (tab === t.key ? " active" : "")}
            onClick={() => setTab(t.key)}
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
