// Pure UI. Two modes:
//   - answering (feedback == null): renders clickable options -> onAnswer(key)
//   - feedback  (feedback set):     shows correct/wrong badge + tap-to-continue -> onContinue()
import { useState, useEffect } from "react";
import { getResources, TYPE_ICON } from "../data/resources";
import { getExplanation } from "../data/explanations";

export default function QuestionCard({
  question,
  progress,
  feedback,
  isComplete,
  onAnswer,
  onContinue,
  onExit,
}) {
  const [showResources, setShowResources] = useState(false);
  const [openSections, setOpenSections] = useState(new Set());

  // Reset panel whenever the question changes
  useEffect(() => {
    setShowResources(false);
    setOpenSections(new Set());
  }, [question?.id]);

  const toggleSection = (key) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (!question) return null;

  // Current question's 1-based number stays stable across both modes.
  const number = feedback ? progress.answered : progress.answered + 1;
  const LEVEL_LABELS = {
    ks2: "KS2", ks3: "KS3", gcse: "GCSE", alevel: "A-Level",
  };
  const levelLabel = LEVEL_LABELS[question.level] ?? question.level;
  const subjectLabel = question.subject === "physics" ? "Physics" : "Maths";

  const resources = getResources(question.level, question.category);
  const explanation = getExplanation(question.level, question.category);

  const EXP_SECTIONS = explanation
    ? [
        {
          key: "body",
          label: "Full explanation",
          content: (
            <p className="exp-body">{explanation.body}</p>
          ),
        },
        {
          key: "example",
          label: "Worked example",
          content: (
            <div className="exp-example">
              <p><strong>Q:</strong> {explanation.workedExample.problem}</p>
              <p><strong>A:</strong> {explanation.workedExample.solution}</p>
            </div>
          ),
        },
        {
          key: "mistakes",
          label: "Common mistakes",
          content: (
            <ul className="exp-list">
              {explanation.commonMistakes.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ),
        },
        {
          key: "facts",
          label: "Key facts",
          content: (
            <ul className="exp-list">
              {explanation.keyFacts.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          ),
        },
      ]
    : [];

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

          {/* Inline resource + explanation panel */}
          {showResources && (
            <div className="idk-panel">
              {/* In-app explanation accordion */}
              {explanation && (
                <div className="idk-explanation">
                  <p className="idk-explanation-title">{explanation.title}</p>
                  <p className="idk-key-idea">{explanation.keyIdea}</p>

                  {EXP_SECTIONS.map(({ key, label, content }) => (
                    <div
                      key={key}
                      className={"exp-section" + (openSections.has(key) ? " open" : "")}
                    >
                      <button
                        className="exp-section-header"
                        onClick={() => toggleSection(key)}
                        aria-expanded={openSections.has(key)}
                      >
                        <span>{label}</span>
                        <span className="exp-chevron" aria-hidden="true">
                          {openSections.has(key) ? "▲" : "▼"}
                        </span>
                      </button>
                      {openSections.has(key) && (
                        <div className="exp-section-body">{content}</div>
                      )}
                    </div>
                  ))}

                  {resources.length > 0 && <div className="idk-divider" />}
                </div>
              )}

              {/* External resource links */}
              {resources.length > 0 && (
                <>
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
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <div
          className="feedback"
          onClick={onContinue}
          role="button"
          tabIndex={0}
        >
          <div
            className={
              "badge-circle " +
              (feedback.isCorrect ? "badge-correct" : "badge-wrong")
            }
          >
            {feedback.isCorrect ? (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          <p className="feedback-title">
            {feedback.isCorrect ? "Correct!" : "Not quite"}
          </p>

          {!feedback.isCorrect && (
            <p className="feedback-answer">
              Correct answer: {feedback.correct}.{" "}
              {question.options[feedback.correct]}
            </p>
          )}

          <p className="continue">
            {isComplete ? "Tap to see your results" : "Tap to continue"}
          </p>
        </div>
      )}

      {onExit && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button className="btn-exit" onClick={onExit}>
            Exit quiz
          </button>
        </div>
      )}
    </div>
  );
}
