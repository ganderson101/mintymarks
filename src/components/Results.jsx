// Shows per-session results + weak topic resource links + explanations. Saving to DB is done in App.
import { useEffect, useState } from "react";
import { getTopicProgress } from "../api/sessions.js";
import { getResources, TYPE_ICON } from "../data/resources.js";
import { getExplanation } from "../data/explanations.js";
import QuestionReview from "./QuestionReview.jsx";

const LEVEL_LABELS   = { ks2: "KS2", ks3: "KS3", gcse: "GCSE", alevel: "A-Level" };
const SUBJECT_LABELS = { maths: "Maths", physics: "Physics", chemistry: "Chemistry", biology: "Biology" };

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

// Colour helpers for mastery-state ladder (spec §4, state → colour band).
function masteryStateColour(state) {
  if (state === "Mastered ⭐") return "#047857";
  if (state === "Strong")      return "#059669";
  if (state === "Building it") return "#d97706";
  return "#6b7280"; // Just started — neutral, no judgement
}

function masteryStateBg(state) {
  if (state === "Mastered ⭐") return "#ecfdf5";
  if (state === "Strong")      return "#f0fdf4";
  if (state === "Building it") return "#fffbeb";
  return "#f9fafb"; // Just started
}

// Collapsible topic row — explanation + resources hidden until clicked.
// Supports two rendering modes:
//   Session mode  (masteryState absent): shows Laplace weakness % — used for "This session" items.
//   Mastery mode  (masteryState present): shows spec state ladder + recent-window count.
function TopicItem({ category, weakness, meta, level, subject, masteryState, recentMastery, recentAttempts }) {
  const links = getResources(level, category);
  const explanation = getExplanation(level, category);
  const hasContent = links.length > 0 || explanation != null;
  const [open, setOpen] = useState(false);

  const hasMastery = masteryState != null;
  const bg     = hasMastery ? masteryStateBg(masteryState)     : weaknessBg(weakness);
  const colour = hasMastery ? masteryStateColour(masteryState) : weaknessColour(weakness);

  // Spec §4: show "State · pct%" when ≥3 recent attempts; otherwise just state label.
  const masteryLabel = hasMastery
    ? (recentAttempts != null && recentAttempts >= 3
        ? `${masteryState} · ${Math.round(recentMastery * 100)}%`
        : masteryState)
    : null;

  return (
    <li
      style={{
        background: bg,
        color: colour,
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 4,
        cursor: hasContent ? "pointer" : "default",
      }}
      onClick={hasContent ? () => setOpen((v) => !v) : undefined}
    >
      <div className="topic-row">
        <span style={{ textTransform: "capitalize" }}>{category}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {hasMastery ? masteryLabel : `${Math.round((1 - weakness) * 100)}% accuracy`}
          {hasContent && (
            <span className="topic-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▾
            </span>
          )}
        </span>
      </div>
      {meta && (
        <div className="topic-meta">{meta}</div>
      )}
      {open && hasContent && (
        <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", marginTop: 8 }}>
          {/* ── Explanation ── */}
          {explanation && (
            <div className="explanation-panel">
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
            </div>
          )}

          {/* ── Resources ── */}
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
      )}
    </li>
  );
}

export default function Results({ results, subject = "maths", level, bank = [], onRestart, onDashboard, coinsEarned }) {
  const { score, total, percent, weakCategories, answers = [] } = results;
  const [overallTopics, setOverallTopics] = useState([]);
  const avg = avgTimeSec(answers);

  useEffect(() => {
    getTopicProgress(subject)
      .then(setOverallTopics)
      .catch(() => {});
  }, [subject]);

  // "Overall topic progress" only renders once the backend has shipped the mastery query (MIN-59c).
  // Gate: any topic must have recentAttempts > 0. Schema defaults are 0, so old/partial backends
  // won't open the gate even when the new schema fields are present in the response.
  const hasMasteryData = overallTopics.some((t) => t.recentAttempts > 0);

  const hasExpandable =
    weakCategories.some((t) => getResources(level, t.category).length > 0 || getExplanation(level, t.category)) ||
    (hasMasteryData && overallTopics.some((t) => getResources(level, t.category).length > 0 || getExplanation(level, t.category)));

  return (
    <div>
      <h1 className="title">Results</h1>

      {coinsEarned > 0 && (
        <div
          style={{
            background: "#fefce8",
            color: "#92400e",
            border: "1px solid #fde68a",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
            textAlign: "center",
            fontWeight: 600,
            fontSize: "1rem",
          }}
        >
          🪙 +{coinsEarned} {coinsEarned === 1 ? "coin" : "coins"} earned!
        </div>
      )}

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
            <TopicItem
              key={t.category}
              category={t.category}
              weakness={t.weakness}
              level={level}
              subject={subject}
            />
          ))}
        </ul>
      )}

      {/* ── Overall progress — renders only once backend ships mastery fields (MIN-59c) ── */}
      {hasMasteryData && (
        <>
          <p className="section-label">Overall topic progress</p>
          <ul className="weak-list" style={{ marginBottom: 22 }}>
            {overallTopics.map((t) => (
              <TopicItem
                key={t.category}
                category={t.category}
                weakness={t.weakness}
                level={level}
                subject={subject}
                masteryState={t.masteryState}
                recentMastery={t.recentMastery}
                recentCorrect={t.recentCorrect}
                recentAttempts={t.recentAttempts}
                meta={`last ${t.recentAttempts}: ${t.recentCorrect}/${t.recentAttempts} correct`}
              />
            ))}
          </ul>
        </>
      )}

      {/* ── CTA ── */}
      {hasExpandable && (
        <p className="resource-hint">
          📚 Tap any topic to see an explanation and study resources.
        </p>
      )}

      {/* ── Question review ── */}
      {answers.length > 0 && (
        <QuestionReview
          answers={answers}
          bank={bank}
          level={level}
          subject={subject}
        />
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
          Home
        </button>
      )}
    </div>
  );
}
