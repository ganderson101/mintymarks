// Pure UI. Two modes:
//   - answering (feedback == null): renders clickable options -> onAnswer(key)
//   - feedback  (feedback set):     shows correct/wrong badge + tap-to-continue -> onContinue()
import { useState, useEffect } from "react";
import { getResources, TYPE_ICON } from "../data/resources";

export default function QuestionCard({
  question,
  progress,
  feedback,
  isComplete,
  onAnswer,
  onContinue,
}) {
  const [showResources, setShowResources] = useState(false);

  // Reset panel whenever the question changes
  useEffect(() => {
    setShowResources(false);
  }, [question?.id]);

  if (!question) return null;

  // Current question's 1-based number stays stable across both modes.
  const number = feedback ? progress.answered : progress.answered + 1;
  const LEVEL_LABELS = {
    ks2: "KS2", ks3: "KS3", gcse: "GCSE", alevel: "A-Level",
  };
  const levelLabel = LEVEL_LABELS[question.level] ?? question.level;
  const subjectLabel = question.subject === "physics" ? "Physics" : "Maths";

  const resources = getResources(question.level, question.category);

  return (
    <div>
      <p className="progress">
        {subjectLabel} · {levelLabel} &middot; Q{number}/{progress.total} &middot;{" "}
        {question.category}
      </p>
      <h2 className="question">{question.text}</h2>

      {!feedback ? (
        <div>
          {Object.entries(question.options).map(([key, label]) => (
            <button key={key} className="option" onClick={() => onAnswer(key)}>
              <span className="option-key">{key}</span>
              <span className="option-label">{label}</span>
            </button>
          ))}

          {/* "I don't know" help trigger */}
          <button
            className="btn-idk"
            onClick={() => setShowResources((v) => !v)}
            aria-expanded={showResources}
          >
            {showResources ? "Hide resources ↑" : "I don't know how to do this"}
          </button>

          {/* Inline resource panel */}
          {showResources && resources.length > 0 && (
            <div className="idk-panel">
              <p className="idk-panel-heading">
                Resources for <strong>{question.category}</strong>
              </p>
              <ul className="idk-resource-list">
                {resources.map((r) => (
                  <li key={r.url}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      <span className="resource-type-badge" aria-hidden="true">
                        {TYPE_ICON[r.type] ?? "🔗"}
                      </span>
                      {r.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div
          className="feedback"
          onClick=