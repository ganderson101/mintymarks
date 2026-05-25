// Shows per-session results + weak topic resource links. Saving to DB is done in App.
import { useEffect, useState } from "react";
import { getTopicProgress } from "../api/sessions.js";
import { getResources, TYPE_ICON } from "../data/resources.js";

function avgTimeSec(answers) {
  const timed = answers.filter((a) => a.timeTakenMs > 0);
  if (!timed.length) return null;
  return (
    timed.reduce((s, a) => s + a.timeTakenMs, 0) /
    timed.length /
    1000
  ).toFixed(1);
}

function weaknessColour(w) {
  if (w >= 0.6) return "#b91c1c";
  if (w >= 0.33) return "#d97706";
  return "#047857";
}

function weaknessBg(w) {
  if (w >= 0.6) return "#fef2f2";
  if (w >= 0.33) return "#fffbeb";
  return "#ecfdf5";
}

// Inline resource links shown under each weak topic.
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

export default function Results({ results, subject = "maths", level, onRestart, onDashboard }) {
  const { score, total, percent, weakCategories, answers = [] } = results;
  const [overallTopics, setOverallTopics] = useState([]);
  const avg = avgTimeSec(answers);

  useEffect(() => {
    getTopicProgress(subject)
      .then(setOverallTopics)
      .catch(() => {});
  }, [subject]);

  // Weak topics from overall history (amber or red)
  const overallWeak = overallTopics.filter((t) => t.weakness >= 0.33);

  return (
    <div>
      <h1 className="title">Results</h1>
      <p className="score">
        {score} / {total}
      </p>
      <p className="score-sub">
        {percent}% correct{avg != null ? ` · avg ${avg}s per question` : ""}
      </p>

      {/* ── This session ── */}
      <p className="section-label">This session</p>
      {weakCategories.length === 0 ? (
        <div className="all-clear">No weak areas this session — nice work.</div>
      ) : (
        <ul className="weak-list">
          {weakCategories.map((t) => (
            <li
              key={t.category}
              style={{
                background: weaknessBg(t.weakness),
                color: weaknessColour(t.weakness),
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 6,
              }}
            >
              <div className="topic-row">
                <span style={{ textTransform: "capitalize" }}>{t.category}</span>
                <span>{Math.round((1 - t.weakness) * 100)}% accuracy</span>
              </div>
              <ResourceLinks level={level} category={t.category} />
            </li>
          ))}
        </ul>
      )}

      {/* ── Overall progress ── */}
      {overallTopics.length > 0 && (
        <>
          <p className="section-label">Overall topic progress</p>
          <ul className="weak-list" style={{ marginBottom: 22 }}>
            {overallTopics.map((t) => (
              <li
                key={t.category}
                style={{
                  background: weaknessBg(t.weakness),
                  color: weaknessColour(t.weakness),
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 4,
                }}
              >
                <div className="topic-row">
                  <span style={{ textTransform: "capitalize" }}>
                    {t.category}
                  </span>
                  <span>{Math.round((1 - t.weakness) * 100)}% accuracy</span>
                </div>
                <div className="topic-meta">
                  {t.correct}/{t.attempts} correct
                  {t.avgTimeSec != null && ` · avg ${t.avgTimeSec}s`}
                </div>
                {t.weakness >= 0.33 && (
                  <ResourceLinks level={level} category={t.category} />
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {/* ── CTA ── */}
      {overallWeak.length > 0 && (
        <p className="resource-hint">
          📚 Study links shown above are tailored to your weak topics.
        </p>
      )}

      <button className="btn-primary" onClick={onRestart}>
        Start another session
      </button>
      {onDashboard && (
        <button
          className="btn-secondary"
          onClick={onDashboard}
          style={{ marginTop: 10 }}
        >
          View history
        </button>
      )}
    </div>
  );
}
