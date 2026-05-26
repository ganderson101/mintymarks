// Top-level screen router. Screens: login -> dashboard -> quiz -> results -> dashboard.
// Auth state from useAuth. Session state from useSession. No logic embedded here.
// Dashboard owns session config (subject + level + length).
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useSession } from "./hooks/useSession.js";
import { saveSession, updateSRS } from "./api/sessions.js";
import LoginScreen from "./components/LoginScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import Results from "./components/Results.jsx";
import FeedbackButton from "./components/FeedbackButton.jsx";

export default function App() {
  const auth = useAuth();
  const s = useSession();
  const [subject, setSubject] = useState("maths");
  const [level, setLevel]     = useState("ks3");
  const [bank, setBank]       = useState([]); // held so Restart can reuse the same fetched bank
  const savedRef = useRef(false); // guard against double-save
  const lastConfigRef = useRef(null); // full config of the in-progress session (for Restart)
  const [exitPrompt, setExitPrompt] = useState(false);

  // When a session completes, persist it once, then fire SRS updates per topic.
  useEffect(() => {
    if (!s.isComplete || !s.results || !auth.user || savedRef.current) return;
    savedRef.current = true;

    const { answers, performance } = s.results;

    saveSession({
      subject,
      level,
      score: s.results.score,
      total: s.results.total,
      startedAt: s.sessionStartedAt,
      answers: answers.map((a) => ({ ...a, subject, selectedAnswer: a.selected ?? "" })),
    })
      .then(() => {
        // Update SRS for every topic attempted this session.
        // avgTimeSec is computed per topic from timing data captured by the engine.
        const timingByTopic = {};
        answers.forEach((a) => {
          if (a.timeTakenMs > 0) {
            if (!timingByTopic[a.category]) timingByTopic[a.category] = [];
            timingByTopic[a.category].push(a.timeTakenMs);
          }
        });
        // Fire-and-forget -- SRS failures never block the results screen.
        Promise.allSettled(
          Object.entries(performance.byTopic).map(([category, stats]) => {
            const accuracy   = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
            const times      = timingByTopic[category] || [];
            const avgTimeSec = times.length > 0
              ? times.reduce((sum, t) => sum + t, 0) / times.length / 1000
              : null;
            return updateSRS({ subject, category, accuracy, avgTimeSec });
          })
        );
      })
      .catch(() => {
        /* non-fatal -- user still sees results */
      });
  }, [s.isComplete, s.results, auth.user, subject, level, s.sessionStartedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  // Exit mid-session: optionally save partial results then return to dashboard.
  const handleExitSave = async () => {
    const partial = s.getResults();
    if (partial && partial.total > 0) {
      await saveSession({
        subject,
        level,
        score: partial.score,
        total: partial.total,
        startedAt: s.sessionStartedAt,
        answers: partial.answers.map((a) => ({ ...a, subject, selectedAnswer: a.selected ?? "" })),
      }).catch(() => {});
    }
    savedRef.current = true; // prevent the completion useEffect from double-saving
    setExitPrompt(false);
    s.reset();
  };

  const handleExitDiscard = () => {
    savedRef.current = true;
    setExitPrompt(false);
    s.reset();
  };

  // Waiting for cookie check
  if (auth.loading) {
    return (
      <div className="app-shell">
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // Not logged in
  if (!auth.user) {
    return (
      <div className="app-shell">
        <div className="card">
          <LoginScreen
            onLogin={auth.login}
            onRegister={auth.register}
            sessionExpired={auth.sessionExpired}
          />
        </div>
      </div>
    );
  }

  // Determine which screen to render
  let content;

  if (s.isComplete && s.results) {
    content = (
      <Results
        results={s.results}
        subject={subject}
        level={level}
        bank={bank}
        onRestart={() => {
          savedRef.current = false;
          // Reuse the full original config (difficulty, topic focus, selected
          // topics) so Restart repeats the same kind of session, not a default one.
          s.start(lastConfigRef.current ?? { length: s.progress.total, level, subject, bank });
        }}
        onDashboard={() => {
          savedRef.current = false;
          s.reset();
        }}
      />
    );
  } else if (s.started && s.feedback) {
    content = (
      <QuestionCard
        question={s.currentQuestion}
        progress={s.progress}
        feedback={s.feedback}
        isComplete={s.isComplete}
        onContinue={s.proceed}
        onExit={() => setExitPrompt(true)}
      />
    );
  } else if (s.started) {
    content = (
      <QuestionCard
        question={s.currentQuestion}
        progress={s.progress}
        onAnswer={s.answer}
        onExit={() => setExitPrompt(true)}
      />
    );
  } else {
    content = (
      <Dashboard
        user={auth.user}
        onStart={(cfg) => {
          savedRef.current = false;
          lastConfigRef.current = cfg;
          setSubject(cfg.subject || "maths");
          setLevel(cfg.level);
          setBank(cfg.bank || []);
          s.start(cfg);
        }}
        onLogout={auth.logout}
      />
    );
  }

  return (
    <div className="app-shell">
      {/* Wrapper keeps card + feedback link aligned as a column, same width as card */}
      <div style={{ width: "100%", maxWidth: 460 }}>
        <div className="card">{content}</div>
        <FeedbackButton context={s.started ? s.currentQuestion : null} />
      </div>

      {exitPrompt && (
        <div className="exit-overlay" onClick={() => setExitPrompt(false)}>
          <div className="exit-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Exit this session?</h3>
            <p>
              You've answered {s.progress?.answered ?? 0} of{" "}
              {s.progress?.total ?? 0} questions.
            </p>
            <button className="btn-primary" onClick={handleExitSave}>
              Save &amp; exit
            </button>
            <button className="btn-danger" onClick={handleExitDiscard}>
              Discard &amp; exit
            </button>
            <div>
              <button
                className="btn-cancel-text"
                onClick={() => setExitPrompt(false)}
              >
                Keep going
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
