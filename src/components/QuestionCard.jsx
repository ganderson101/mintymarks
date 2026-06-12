// Pure UI. Two modes:
//   - answering (feedback == null): renders clickable options -> onAnswer(key)
//   - feedback  (feedback set):     shows correct/wrong badge + tap-to-continue -> onContinue()
import { useState, useEffect } from "react";
import { getResources, TYPE_ICON } from "../data/resources";
import { getExplanation } from "../data/explanations";
import { apiFetch } from "../api/client";

// Renders text that may contain fenced code blocks (``` ... ```) as a mix of
// plain text spans and <pre><code> blocks. Handles optional language tag after ```.
export function renderWithCode(text) {
  if (!text || !text.includes("```")) return text;
  const parts = text.split(/(```[^\n]*\n[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith("```")) {
      const inner = part.replace(/^```[^\n]*\n/, "").replace(/```$/, "");
      return (
        <pre key={i} className="code-block"><code>{inner}</code></pre>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export default function QuestionCard({
  question,
  progress,
  feedback,
  isComplete,
  onAnswer,
  onContinue,
  onExit,
  onHelpUsed,
}) {
  const [showResources, setShowResources] = useState(false);
  const [helpFired, setHelpFired] = useState(false); // true once onHelpUsed was called for this question
  const [openSections, setOpenSections] = useState(new Set());
  const [reportState, setReportState] = useState("idle"); // idle | sending | sent | error
  const [showFeedbackExplanation, setShowFeedbackExplanation] = useState(false);
  const [feedbackOpenSections, setFeedbackOpenSections] = useState(new Set());
  const [showFeedbackSolution, setShowFeedbackSolution] = useState(false);
  // Reset panel whenever the question changes
  useEffect(() => {
    setShowResources(false);
    setHelpFired(false);
    setOpenSections(new Set());
    setReportState("idle");
    setShowFeedbackExplanation(false);
    setFeedbackOpenSections(new Set());
    setShowFeedbackSolution(false);
  }, [question?.id]);
  // Auto-expand solution when answer is wrong; collapse when correct or cleared
  useEffect(() => {
    setShowFeedbackSolution(!!feedback && !feedback.isCorrect);
  }, [feedback]);

  const toggleFeedbackSection = (key) => {
    setFeedbackOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  async function handleReport(e) {
    e.stopPropagation();
    if (reportState !== "idle") return;
    setReportState("sending");
    try {
      await apiFetch("/feedback/explanation-mismatch", {
        method: "POST",
        body: JSON.stringify({
          questionId: question.id,
          questionText: question.text,
          category: question.category,
          level: question.level,
          subject: question.subject,
        }),
      });
      setReportState("sent");
    } catch (_) {
      setReportState("error");
    }
  }

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
  const SUBJECT_LABELS = {
    maths: "Maths", physics: "Physics", chemistry: "Chemistry", biology: "Biology",
    vocab: "Vocab", "comp-sci": "Computer Science", geography: "Geography",
  };
  const subjectLabel = SUBJECT_LABELS[question.subject] ?? question.subject;

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
      <div className="question">{renderWithCode(question.text)}</div>

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
            onClick={() => {
              const next = !showResources;
              setShowResources(next);
              if (next && !helpFired && onHelpUsed) {
                setHelpFired(true);
                onHelpUsed();
              }
            }}
            aria-expanded={showResources}
          >
            {showResources ? "Hide resources ↑" : "I don't know how to do this"}
          </button>

          {/* Inline resource + explanation panel */}
          {showResources && (
            <div className="idk-panel">
              {/* Vocab dictionary entry — shown when the question carries a solution
                  but has no topic explanation or external resources (vocab case). */}
              {!explanation && resources.length === 0 && question.solution && (
                <div className="qr-solution-block">
                  <p className="qr-solution-text">{question.solution}</p>
                </div>
              )}

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
                    <li>
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                          `${levelLabel} ${subjectLabel} explain ${question.category}`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="resource-type-badge" aria-hidden="true">▶️</span>
                        Search YouTube: &ldquo;{levelLabel} {subjectLabel} explain {question.category}&rdquo;
                      </a>
                    </li>
                  </ul>
                </>
              )}

              {/* Explanation-mismatch report */}
              <div className="qr-report-row">
                {reportState === "sent" ? (
                  <span className="qr-report-confirm">✓ Reported — thanks</span>
                ) : (
                  <button
                    className="qr-report-btn"
                    onClick={handleReport}
                    disabled={reportState === "sending"}
                  >
                    {reportState === "error" ? "⚠ Failed to report" : "🚩 Explanation doesn't match question"}
                  </button>
                )}
              </div>
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

          {/* Resources + explanation + solution + report (stop click propagating to onContinue) */}
          {(resources.length > 0 || explanation || question.solution) && (
            <div
              className="feedback-resources"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Per-question solution — auto-expanded on wrong, collapsible on correct */}
              {question.solution && (
                <div>
                  <button
                    className="btn-idk"
                    style={{ marginBottom: 8 }}
                    onClick={() => setShowFeedbackSolution((v) => !v)}
                    aria-expanded={showFeedbackSolution}
                  >
                    {showFeedbackSolution ? "Why this answer ↑" : "Why this answer ↓"}
                  </button>
                  {showFeedbackSolution && (
                    <div className="qr-solution-block">
                      <div className="qr-solution-text">{renderWithCode(question.solution)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Topic explanation accordion — always available after answering */}
              {explanation && (
                <div className="idk-explanation">
                  <button
                    className="btn-idk"
                    style={{ marginBottom: 8 }}
                    onClick={() => setShowFeedbackExplanation((v) => !v)}
                    aria-expanded={showFeedbackExplanation}
                  >
                    {showFeedbackExplanation ? "Hide explanation ↑" : "See explanation ↓"}
                  </button>

                  {showFeedbackExplanation && (
                    <>
                      <p className="idk-explanation-title">{explanation.title}</p>
                      <p className="idk-key-idea">{explanation.keyIdea}</p>

                      {EXP_SECTIONS.map(({ key, label, content }) => (
                        <div
                          key={key}
                          className={"exp-section" + (feedbackOpenSections.has(key) ? " open" : "")}
                        >
                          <button
                            className="exp-section-header"
                            onClick={() => toggleFeedbackSection(key)}
                            aria-expanded={feedbackOpenSections.has(key)}
                          >
                            <span>{label}</span>
                            <span className="exp-chevron" aria-hidden="true">
                              {feedbackOpenSections.has(key) ? "▲" : "▼"}
                            </span>
                          </button>
                          {feedbackOpenSections.has(key) && (
                            <div className="exp-section-body">{content}</div>
                          )}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {resources.length > 0 && (
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
                  <li>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                        `${levelLabel} ${subjectLabel} explain ${question.category}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="resource-type-badge" aria-hidden="true">▶️</span>
                      Search YouTube: &ldquo;{levelLabel} {subjectLabel} explain {question.category}&rdquo;
                    </a>
                  </li>
                </ul>
              )}

              <div className="qr-report-row">
                {reportState === "sent" ? (
                  <span className="qr-report-confirm">✓ Reported — thanks</span>
                ) : (
                  <button
                    className="qr-report-btn"
                    onClick={handleReport}
                    disabled={reportState === "sending"}
                  >
                    {reportState === "error" ? "⚠ Failed to report" : "🚩 Explanation doesn't match question"}
                  </button>
                )}
              </div>
            </div>
          )}
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
