// QuestionReview — renders a post-session question breakdown.
// Used in both Results (live) and History (fetched).
//
// Props:
//   answers  — [{questionId, isCorrect, selected, correct, timeTakenMs, category}]
//              "selected" / "correct" may be absent for legacy history rows
//   bank     — full question array for the session's subject+level (or [])
//   level    — string e.g. "ks3"
//   subject  — string e.g. "maths"
//
// Incorrect questions are always expanded; correct are collapsed by default.

import { useState } from "react";
import { getExplanation } from "../data/explanations.js";
import { getResources, TYPE_ICON } from "../data/resources.js";
import { apiFetch } from "../api/client.js";

const OPTION_KEYS   = ["A", "B", "C", "D"];
const LEVEL_LABELS  = { ks2: "KS2", ks3: "KS3", gcse: "GCSE", alevel: "A-Level" };
const SUBJECT_LABELS = { maths: "Maths", physics: "Physics", chemistry: "Chemistry" };

// ── Explanation + resource panel (same content as TopicExpandPanel in Dashboard) ─

function ExplainPanel({ level, subject, category, questionId, questionText }) {
  const explanation = getExplanation(level, category);
  const links       = getResources(level, category);
  if (!explanation && !links.length) return null;

  // "Explanation doesn't match" report button state
  const [reportState, setReportState] = useState("idle"); // idle | sent | error

  async function handleReport(e) {
    e.stopPropagation();
    if (reportState !== "idle") return;
    setReportState("sending");
    try {
      await apiFetch("/feedback/explanation-mismatch", {
        method: "POST",
        body: JSON.stringify({ questionId, questionText, category, level, subject }),
      });
      setReportState("sent");
    } catch (_) {
      setReportState("error");
    }
  }

  return (
    <div className="explanation-panel">
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
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `${LEVEL_LABELS[level] ?? level} ${SUBJECT_LABELS[subject] ?? subject} explain ${category}`
                )}`}
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
  );
}

// ── Single question card ──────────────────────────────────────────────────────

function QuestionCard({ answer, question, level, subject }) {
  // answer.selected  = letter the user chose (may be absent for legacy DB rows)
  // answer.correct   = correct letter (may be absent; fall back to question.correct)
  const correctKey  = answer.correct || question?.correct || "";
  const selectedKey = answer.selected || answer.selectedAnswer || "";
  const hasOptions  = question?.options && Object.keys(question.options).length > 0;

  const hasExplain =
    getResources(level, answer.category).length > 0 ||
    getExplanation(level, answer.category) != null;

  // Incorrect questions start open; correct start closed
  const [open,       setOpen]       = useState(!answer.isCorrect);
  const [explainOpen, setExplainOpen] = useState(false);

  function optionState(key) {
    if (key === correctKey)  return "correct";
    if (key === selectedKey && !answer.isCorrect) return "wrong";
    return "neutral";
  }

  return (
    <div className={`qr-card${answer.isCorrect ? " qr-card--correct" : " qr-card--incorrect"}`}>
      {/* ── Header row ── */}
      <div
        className="qr-header"
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setOpen((v) => !v)}
      >
        <span className={`qr-badge${answer.isCorrect ? " qr-badge--correct" : " qr-badge--incorrect"}`}>
          {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
        </span>
        <span className="qr-category">{answer.category}</span>
        <span className="topic-chevron" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", marginLeft: "auto" }}>
          ▾
        </span>
      </div>

      {/* ── Question text (always visible) ── */}
      <p className={`qr-question-text${answer.isCorrect && !open ? " qr-question-text--muted" : ""}`}>
        {question?.text ?? `Question ID: ${answer.questionId}`}
      </p>

      {/* ── Options + explain (collapsed for correct, always open for incorrect) ── */}
      {open && (
        <div className="qr-body">
          {hasOptions && (
            <div className="qr-options">
              {OPTION_KEYS.filter((k) => question.options[k] != null).map((k) => {
                const state = optionState(k);
                return (
                  <div key={k} className={`qr-option qr-option--${state}`}>
                    <span className="qr-option-letter">{k}</span>
                    <span className="qr-option-text">{question.options[k]}</span>
                    {state === "correct" && <span className="qr-option-icon">✓</span>}
                    {state === "wrong"   && <span className="qr-option-icon">✗</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* No question data in bank (shouldn't happen but degrade gracefully) */}
          {!hasOptions && correctKey && (
            <p className="qr-fallback">
              Correct answer: <strong>{correctKey}</strong>
              {selectedKey && selectedKey !== correctKey && (
                <> · You chose: <strong>{selectedKey}</strong></>
              )}
            </p>
          )}

          {question?.solution && (
            <div className="qr-solution-block">
              <p className="qr-solution-label">Why this answer</p>
              <p className="qr-solution-text">{question.solution}</p>
            </div>
          )}

          {hasExplain && (
            <button
              className="qr-explain-toggle"
              onClick={(e) => { e.stopPropagation(); setExplainOpen((v) => !v); }}
            >
              {explainOpen ? "Hide" : "📚 See"} explanation &amp; resources
              <span style={{ marginLeft: 4, display: "inline-block", transition: "transform 0.2s", transform: explainOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
            </button>
          )}

          {explainOpen && (
            <ExplainPanel
              level={level}
              subject={subject}
              category={answer.category}
              questionId={answer.questionId}
              questionText={question?.text ?? ""}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function QuestionReview({ answers, bank, level, subject }) {
  if (!answers?.length) return null;

  // Build a lookup map from the bank
  const qMap = Object.fromEntries((bank ?? []).map((q) => [q.id, q]));

  // Sort: incorrect first, then correct — preserve order within each group
  const sorted = [
    ...answers.filter((a) => !a.isCorrect),
    ...answers.filter((a) =>  a.isCorrect),
  ];

  const incorrectCount = answers.filter((a) => !a.isCorrect).length;

  return (
    <div className="qr-section">
      <p className="section-label" style={{ marginBottom: 4 }}>
        Review questions
      </p>
      {incorrectCount > 0 && (
        <p className="qr-summary">
          {incorrectCount} incorrect question{incorrectCount !== 1 ? "s" : ""} shown first — tap to expand.
        </p>
      )}
      <div className="qr-list">
        {sorted.map((a, i) => (
          <QuestionCard
            key={a.questionId + i}
            answer={a}
            question={qMap[a.questionId] ?? null}
            level={level}
            subject={subject}
          />
        ))}
      </div>
    </div>
  );
}
