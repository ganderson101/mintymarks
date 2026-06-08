// StatsPage — user statistics with tap-to-drill-down hierarchy.
// Data sources: GET /sessions (list), GET /progress/topics (weakness/mastery),
//               DELETE /sessions/{id} (with confirm), GET /sessions/{id}/answers (leaf).
// All stats derived live from session rows — deleting a session re-derives everything.
import { useState, useEffect, useMemo } from "react";
import { getTopicProgress, deleteSession, getSessionAnswers } from "../api/sessions.js";
import { fetchQuestions } from "../api/questions.js";
import QuestionReview from "./QuestionReview.jsx";

// ── Constants ─────────────────────────────────────────────────────────────────

const SUBJECTS = ["maths", "physics", "chemistry", "biology", "vocab"];
const SUBJECT_LABELS = {
  maths: "Maths", physics: "Physics", chemistry: "Chemistry",
  biology: "Biology", vocab: "Vocab",
};
const SUBJECT_EMOJI = {
  maths: "🔢", physics: "⚡", chemistry: "🧪", biology: "🌱", vocab: "📖",
};
const LEVEL_LABELS = {
  ks2: "KS2", ks3: "KS3", gcse: "GCSE", alevel: "A-Level", "11plus": "11+",
};

// Thresholds for "not enough data" states
const MIN_TOPIC_ATTEMPTS = 3;   // below this → no weakness verdict

// ── Stat computation helpers ──────────────────────────────────────────────────

function isoDateStr(iso) {
  return iso ? iso.slice(0, 10) : null;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatDateFull(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

// Compute current and longest day streaks from session list.
// "Current" = streak ending today or yesterday (so it doesn't drop to 0 if you haven't
// practised yet today).
function computeStreaks(sessions) {
  if (!sessions.length) return { current: 0, longest: 0 };

  const daySet = new Set(sessions.map((s) => isoDateStr(s.completedAt)));
  const days = [...daySet].sort();

  let streak = 1, longest = 1;
  for (let i = 1; i < days.length; i++) {
    const diffMs = new Date(days[i]) - new Date(days[i - 1]);
    if (diffMs === 86400000) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      streak = 1;
    }
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const todayStr = now.toISOString().slice(0, 10);
  const yest = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const lastDay = days[days.length - 1];
  const current = lastDay === todayStr || lastDay === yest ? streak : 0;

  return { current, longest };
}

function buildActivityMap(sessions) {
  const map = {};
  sessions.forEach((s) => {
    const d = isoDateStr(s.completedAt);
    if (!d) return;
    if (!map[d]) map[d] = { questions: 0, correct: 0, count: 0 };
    map[d].questions += s.total;
    map[d].correct += s.score;
    map[d].count++;
  });
  return map;
}

function buildHeatmapDays() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const days = [];
  for (let i = 83; i >= 0; i--) {
    days.push(new Date(now.getTime() - i * 86400000).toISOString().slice(0, 10));
  }
  return days;
}

function heatmapColor(questions) {
  if (!questions) return "#f3f4f6";
  if (questions < 5)  return "#bbf7d0";
  if (questions < 15) return "#4ade80";
  if (questions < 30) return "#16a34a";
  return "#15803d";
}

function weaknessColor(w) {
  if (w >= 0.6) return "#b91c1c";
  if (w >= 0.4) return "#d97706";
  return "#047857";
}
function weaknessBg(w) {
  if (w >= 0.6) return "#fef2f2";
  if (w >= 0.4) return "#fffbeb";
  return "#ecfdf5";
}

// ── Calendar heatmap ──────────────────────────────────────────────────────────

function ActivityHeatmap({ activityMap }) {
  const allDays = useMemo(() => buildHeatmapDays(), []);

  // Pad so columns start on Monday (0=Mon)
  const firstDow = (new Date(allDays[0]).getDay() + 6) % 7;
  const padded = [...Array(firstDow).fill(null), ...allDays];
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  // Month labels: emit a label whenever the month changes across columns
  const monthLabels = [];
  let lastMonth = null;
  weeks.forEach((week, wi) => {
    const firstReal = week.find(Boolean);
    if (firstReal) {
      const m = firstReal.slice(0, 7); // "2026-05"
      if (m !== lastMonth) {
        monthLabels.push({ wi, label: new Date(firstReal + "T00:00:00").toLocaleDateString(undefined, { month: "short" }) });
        lastMonth = m;
      } else {
        monthLabels.push(null);
      }
    } else {
      monthLabels.push(null);
    }
  });

  return (
    <div className="heatmap-wrap">
      <div className="heatmap-month-row">
        {monthLabels.map((m, i) => (
          <div key={i} className="heatmap-month-cell">
            {m ? m.label : ""}
          </div>
        ))}
      </div>
      <div className="heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="heatmap-col">
            {week.map((day, di) => (
              <div
                key={di}
                className="heatmap-cell"
                style={{ background: day ? heatmapColor(activityMap[day]?.questions) : "transparent" }}
                title={
                  day && activityMap[day]
                    ? `${day}: ${activityMap[day].questions} questions`
                    : day || ""
                }
              />
            ))}
          </div>
        ))}
      </div>
      <div className="heatmap-legend">
        <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>Less</span>
        {["#f3f4f6", "#bbf7d0", "#4ade80", "#16a34a", "#15803d"].map((c) => (
          <div key={c} className="heatmap-cell" style={{ background: c }} />
        ))}
        <span style={{ color: "var(--muted)", fontSize: "0.7rem" }}>More</span>
      </div>
    </div>
  );
}

// ── Streak card ───────────────────────────────────────────────────────────────

function StreakCard({ current, longest }) {
  return (
    <div className="streak-card">
      <div className="streak-main">
        <span className="streak-flame">{current > 0 ? "🔥" : "💤"}</span>
        <div>
          <div className="streak-number">{current}</div>
          <div className="streak-label">day streak</div>
        </div>
      </div>
      <div className="streak-divider" />
      <div className="streak-best">
        <div className="streak-number" style={{ fontSize: "1.5rem" }}>{longest}</div>
        <div className="streak-label">best ever</div>
      </div>
    </div>
  );
}

// ── Weak topics spotlight ─────────────────────────────────────────────────────

function WeakTopicsSpotlight({ allTopics }) {
  const weak = useMemo(
    () =>
      allTopics
        .filter((t) => t.attempts >= MIN_TOPIC_ATTEMPTS && t.weakness >= 0.4)
        .sort((a, b) => b.weakness - a.weakness)
        .slice(0, 4),
    [allTopics],
  );

  if (!weak.length) return null;

  return (
    <div className="weak-spotlight">
      <p className="section-label" style={{ marginBottom: 4 }}>Worth practising more</p>
      <p style={{ margin: "0 0 10px", color: "var(--muted)", fontSize: "0.8rem" }}>
        A bit more practice on these will help you the most right now.
      </p>
      {weak.map((t) => (
        <div key={`${t.subject}::${t.category}`} className="weak-topic-row">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="weak-topic-name">{t.category}</div>
            <div className="weak-topic-subject">{SUBJECT_LABELS[t.subject]}</div>
          </div>
          <div className="weak-topic-bar-wrap">
            <div
              className="weak-topic-bar"
              style={{
                width: Math.round(t.weakness * 100) + "%",
                background: weaknessColor(t.weakness),
              }}
            />
          </div>
          <div
            className="weak-topic-pct"
            style={{ color: weaknessColor(t.weakness) }}
          >
            {Math.round((1 - t.weakness) * 100)}%
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Subject overview row ──────────────────────────────────────────────────────

function SubjectSummaryRow({ subject, sessions, onDrillDown }) {
  const sub = sessions.filter((s) => s.subject === subject);
  if (!sub.length) return null;

  const totalQ = sub.reduce((s, x) => s + x.total, 0);
  const totalC = sub.reduce((s, x) => s + x.score, 0);
  const accuracy = totalQ ? Math.round((totalC / totalQ) * 100) : 0;

  return (
    <button className="subject-stat-row" onClick={() => onDrillDown(subject)}>
      <span className="subject-stat-emoji">{SUBJECT_EMOJI[subject]}</span>
      <div style={{ flex: 1, textAlign: "left" }}>
        <div className="subject-stat-name">{SUBJECT_LABELS[subject]}</div>
        <div className="subject-stat-meta">
          {sub.length} {sub.length === 1 ? "session" : "sessions"} · {totalQ}q · {accuracy}%
        </div>
      </div>
      <span style={{ color: "var(--muted)", fontSize: "1rem" }}>›</span>
    </button>
  );
}

// ── Session row with delete-with-confirm ──────────────────────────────────────

function SessionRow({ s, onDelete, onDrillDown }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function doDelete() {
    setDeleting(true);
    setConfirming(false);
    try {
      await deleteSession(s.id);
      onDelete(s.id);
    } catch {
      setDeleting(false); // leave row so user can retry
    }
  }

  const scoreColor =
    s.percent >= 70 ? "#16a34a" : s.percent >= 40 ? "#d97706" : "#dc2626";

  return (
    <li className="stats-session-row">
      <div
        className="stats-session-header"
        role="button"
        tabIndex={0}
        onClick={() => !confirming && !deleting && onDrillDown(s)}
        onKeyDown={(e) => e.key === "Enter" && !confirming && !deleting && onDrillDown(s)}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>
            {SUBJECT_LABELS[s.subject]} · {LEVEL_LABELS[s.level] || s.level}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: 1 }}>
            {formatDateFull(s.completedAt)}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: scoreColor }}>
            {s.score}/{s.total}
          </span>
          {deleting ? (
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Removing…</span>
          ) : confirming ? (
            <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>Remove?</span>
              <button
                className="btn-ghost"
                style={{ fontSize: "0.75rem", color: "#dc2626", padding: "2px 8px" }}
                onClick={(e) => { e.stopPropagation(); doDelete(); }}
              >
                Yes
              </button>
              <button
                className="btn-ghost"
                style={{ fontSize: "0.75rem", padding: "2px 8px" }}
                onClick={(e) => { e.stopPropagation(); setConfirming(false); }}
              >
                No
              </button>
            </span>
          ) : (
            <button
              className="btn-ghost"
              aria-label="Delete this session"
              style={{ fontSize: "0.8rem", color: "var(--muted)", padding: "2px 8px" }}
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

// ── Session detail (per-question leaf) ───────────────────────────────────────

function SessionDetailView({ session, onBack }) {
  const [answers, setAnswers] = useState(null);
  const [bank, setBank] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    Promise.all([
      getSessionAnswers(session.id),
      fetchQuestions(session.level, session.subject),
    ])
      .then(([a, b]) => { setAnswers(a); setBank(b); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [session.id, session.level, session.subject]);

  return (
    <div>
      <button
        className="btn-ghost"
        onClick={onBack}
        style={{ marginBottom: 14, fontSize: "0.85rem" }}
      >
        ← Back
      </button>
      <p className="section-label" style={{ marginBottom: 2 }}>
        {SUBJECT_LABELS[session.subject]} · {LEVEL_LABELS[session.level] || session.level}
      </p>
      <p style={{ margin: "0 0 14px", color: "var(--muted)", fontSize: "0.8rem" }}>
        {formatDateFull(session.completedAt)} · {session.score}/{session.total} · {session.percent}%
      </p>
      {loading && <p className="subtitle">Loading questions…</p>}
      {error && (
        <p className="subtitle" style={{ color: "#dc2626" }}>
          Failed to load — tap back and try again.
        </p>
      )}
      {!loading && !error && answers !== null && (
        answers.length === 0
          ? <p className="subtitle">No answer data saved for this session.</p>
          : (
            <QuestionReview
              answers={answers}
              bank={bank}
              level={session.level}
              subject={session.subject}
            />
          )
      )}
    </div>
  );
}

// ── Subject detail view ───────────────────────────────────────────────────────

function SubjectDetailView({ subject, sessions, topicsBySubject, onBack, onSessionDrillDown, onDeleteSession }) {
  const subSessions = sessions.filter((s) => s.subject === subject);
  const touchedLevels = [...new Set(subSessions.map((s) => s.level))].sort();
  const [activeLevel, setActiveLevel] = useState(touchedLevels[0] || "");

  const allTopics = topicsBySubject[subject] || [];
  // Only topics with enough attempts to give a verdict
  const verifiedTopics = allTopics.filter((t) => t.attempts >= MIN_TOPIC_ATTEMPTS);
  const pendingCount = allTopics.length - verifiedTopics.length;
  const sortedTopics = [...verifiedTopics].sort((a, b) => b.weakness - a.weakness);

  const levelSessions = subSessions.filter((s) => s.level === activeLevel);
  const totalQ = subSessions.reduce((s, x) => s + x.total, 0);
  const totalC = subSessions.reduce((s, x) => s + x.score, 0);

  return (
    <div>
      <button
        className="btn-ghost"
        onClick={onBack}
        style={{ marginBottom: 14, fontSize: "0.85rem" }}
      >
        ← Back
      </button>

      <p className="section-label">
        {SUBJECT_EMOJI[subject]} {SUBJECT_LABELS[subject]}
      </p>
      <p style={{ margin: "-8px 0 14px", color: "var(--muted)", fontSize: "0.8rem" }}>
        {subSessions.length} sessions · {totalQ} questions · {totalQ ? Math.round((totalC / totalQ) * 100) : 0}% accuracy
      </p>

      {/* Level filter (only if multiple levels touched) */}
      {touchedLevels.length > 1 && (
        <div className="level-picker" style={{ marginBottom: 16 }}>
          {touchedLevels.map((l) => (
            <button
              key={l}
              className={"level-btn" + (activeLevel === l ? " active" : "")}
              onClick={() => setActiveLevel(l)}
            >
              {LEVEL_LABELS[l] || l}
            </button>
          ))}
        </div>
      )}

      {/* Topics */}
      {sortedTopics.length > 0 && (
        <>
          <p className="section-label" style={{ fontSize: "0.82rem", marginBottom: 8 }}>
            Topics
          </p>
          <ul className="topic-grid" style={{ marginBottom: 14 }}>
            {sortedTopics.map((t) => {
              const accuracy = Math.round((1 - t.weakness) * 100);
              return (
                <li
                  key={t.category}
                  style={{
                    background: weaknessBg(t.weakness),
                    color: weaknessColor(t.weakness),
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                    cursor: "default",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "0.88rem" }}>{t.category}</div>
                  <div className="topic-accuracy-bar">
                    <div className="topic-accuracy-fill" style={{ width: accuracy + "%" }} />
                  </div>
                  <div style={{ fontSize: "0.75rem", marginTop: 1 }}>
                    {accuracy}% · {t.correct}/{t.attempts} correct
                    {t.masteryState && (
                      <span style={{ marginLeft: 6 }}>{t.masteryState}</span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {pendingCount > 0 && (
            <p style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: 14 }}>
              {pendingCount} topic{pendingCount > 1 ? "s" : ""} need {MIN_TOPIC_ATTEMPTS}+ attempts to show a verdict.
            </p>
          )}
        </>
      )}

      {sortedTopics.length === 0 && allTopics.length > 0 && (
        <p className="subtitle" style={{ fontSize: "0.82rem", marginBottom: 14 }}>
          Keep practising to unlock topic verdicts — need {MIN_TOPIC_ATTEMPTS}+ attempts per topic.
        </p>
      )}

      {/* Sessions for the selected level */}
      {levelSessions.length > 0 && (
        <>
          <p className="section-label" style={{ fontSize: "0.82rem", marginBottom: 6 }}>
            Sessions{activeLevel ? ` — ${LEVEL_LABELS[activeLevel] || activeLevel}` : ""}
          </p>
          <ul className="history-session-list">
            {levelSessions.map((s) => (
              <SessionRow
                key={s.id}
                s={s}
                onDelete={onDeleteSession}
                onDrillDown={onSessionDrillDown}
              />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ── StatsTab — top-level component, wired into Dashboard ──────────────────────

export default function StatsTab({ sessions, loading, onDeleteSession }) {
  const [topicsBySubject, setTopicsBySubject] = useState({});
  const [topicsLoading, setTopicsLoading] = useState(true);

  // Drill-down state
  const [view, setView] = useState("overview"); // "overview" | "subject" | "session"
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Fetch topic progress for all subjects in parallel; re-run if sessions change (post-delete).
  useEffect(() => {
    if (loading) return;
    setTopicsLoading(true);
    Promise.all(
      SUBJECTS.map((subj) =>
        getTopicProgress(subj)
          .then((data) => [subj, data])
          .catch(() => [subj, []]),
      ),
    ).then((pairs) => {
      setTopicsBySubject(Object.fromEntries(pairs));
      setTopicsLoading(false);
    });
  }, [loading, sessions]); // re-derive after any session deletion

  const allTopics = useMemo(
    () => Object.values(topicsBySubject).flat(),
    [topicsBySubject],
  );

  const activityMap = useMemo(() => buildActivityMap(sessions), [sessions]);
  const { current: currentStreak, longest: longestStreak } = useMemo(
    () => computeStreaks(sessions),
    [sessions],
  );

  const totalQuestions = sessions.reduce((s, x) => s + x.total, 0);
  const totalCorrect = sessions.reduce((s, x) => s + x.score, 0);
  const activeDays = new Set(sessions.map((s) => isoDateStr(s.completedAt))).size;
  const touchedSubjects = SUBJECTS.filter((subj) =>
    sessions.some((s) => s.subject === subj),
  );

  // ── Loading / empty states ──────────────────────────────────────────────────

  if (loading) return <p className="subtitle">Loading…</p>;

  if (!sessions.length) {
    return (
      <div style={{ textAlign: "center", padding: "28px 0" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>📊</div>
        <p className="section-label">No sessions yet</p>
        <p className="subtitle" style={{ fontSize: "0.88rem" }}>
          Start practising and your stats will appear here!
        </p>
      </div>
    );
  }

  // ── Session detail leaf ─────────────────────────────────────────────────────

  if (view === "session" && selectedSession) {
    return (
      <SessionDetailView
        session={selectedSession}
        onBack={() => {
          setView(selectedSubject ? "subject" : "overview");
          setSelectedSession(null);
        }}
      />
    );
  }

  // ── Subject detail ──────────────────────────────────────────────────────────

  if (view === "subject" && selectedSubject) {
    return (
      <SubjectDetailView
        subject={selectedSubject}
        sessions={sessions}
        topicsBySubject={topicsBySubject}
        onBack={() => { setView("overview"); setSelectedSubject(null); }}
        onSessionDrillDown={(s) => { setSelectedSession(s); setView("session"); }}
        onDeleteSession={(id) => {
          onDeleteSession(id);
          // If we deleted the last session for this subject, go back to overview
        }}
      />
    );
  }

  // ── Overview ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Streak */}
      <StreakCard current={currentStreak} longest={longestStreak} />

      {/* Totals row */}
      <div className="stats-row" style={{ marginTop: 14 }}>
        <div className="stat-card">
          <span className="stat-value">{totalQuestions}</span>
          <span className="stat-label">Questions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{sessions.length}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{activeDays}</span>
          <span className="stat-label">Active days</span>
        </div>
      </div>

      {/* Accuracy + per-day (only meaningful with enough data) */}
      {totalQuestions >= 10 && (
        <div className="stats-row" style={{ marginTop: 8 }}>
          <div className="stat-card">
            <span className="stat-value">
              {Math.round((totalCorrect / totalQuestions) * 100)}%
            </span>
            <span className="stat-label">Accuracy</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">
              {activeDays > 0 ? Math.round(totalQuestions / activeDays) : 0}
            </span>
            <span className="stat-label">Questions/day</span>
          </div>
        </div>
      )}
      {totalQuestions < 10 && totalQuestions > 0 && (
        <p style={{ margin: "6px 0 0", fontSize: "0.75rem", color: "var(--muted)" }}>
          Keep practising to unlock accuracy trends.
        </p>
      )}

      {/* Activity heatmap */}
      <p className="section-label" style={{ marginTop: 20, marginBottom: 6 }}>
        Activity — last 12 weeks
      </p>
      <ActivityHeatmap activityMap={activityMap} />

      {/* Weak topics spotlight */}
      {!topicsLoading && <WeakTopicsSpotlight allTopics={allTopics} />}

      {/* Subject breakdown — only touched subjects */}
      {touchedSubjects.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 20, marginBottom: 8 }}>
            By subject
            <span
              style={{
                fontWeight: 400,
                fontSize: "0.72rem",
                color: "var(--muted)",
                marginLeft: 6,
              }}
            >
              tap to explore
            </span>
          </p>
          <div className="subject-stat-list">
            {touchedSubjects.map((subj) => (
              <SubjectSummaryRow
                key={subj}
                subject={subj}
                sessions={sessions}
                onDrillDown={(s) => { setSelectedSubject(s); setView("subject"); }}
              />
            ))}
          </div>
        </>
      )}

      {/* Recent sessions */}
      <p className="section-label" style={{ marginTop: 20, marginBottom: 6 }}>
        Recent sessions
        <span
          style={{
            fontWeight: 400,
            fontSize: "0.72rem",
            color: "var(--muted)",
            marginLeft: 6,
          }}
        >
          tap to review · ✕ to remove
        </span>
      </p>
      <ul className="history-session-list">
        {sessions.slice(0, 10).map((s) => (
          <SessionRow
            key={s.id}
            s={s}
            onDelete={onDeleteSession}
            onDrillDown={(sess) => {
              setSelectedSubject(sess.subject);
              setSelectedSession(sess);
              setView("session");
            }}
          />
        ))}
      </ul>
    </div>
  );
}
