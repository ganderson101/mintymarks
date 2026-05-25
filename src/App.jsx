// Top-level screen router. Screens: login → dashboard → quiz → results → dashboard.
// Auth state from useAuth. Session state from useSession. No logic embedded here.
// Dashboard owns session config (subject + level + length).
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useSession } from "./hooks/useSession.js";
import { saveSession } from "./api/sessions.js";
import LoginScreen from "./components/LoginScreen.jsx";
import Dashboard from "./components/Dashboard.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import Results from "./components/Results.jsx";

export default function App() {
  const auth = useAuth();
  const s = useSession();
  const [subject, setSubject] = useState("maths");
  const [level, setLevel]     = useState("ks3");
  const savedRef = useRef(false); // guard against double-save

  // When a session completes, persist it once.
  useEffect(() => {
    if (!s.isComplete || !s.results || !auth.user || savedRef.current) return;
    savedRef.current = true;
    saveSession({
      subject,
      level,
      score: s.results.score,
      total: s.results.total,
      startedAt: s.sessionStartedAt,
      answers: s.results.answers.map((a) => ({ ...a, subject })),
    }).catch(() => {
      /* non-fatal — user still sees results */
    });
  }, [s.isComplete, s.results, auth.user, subject, level, s.sessionStartedAt]);

  // Waiting for cookie check
  if (auth.loading) {
    return (
      <div className="app-shell">
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          Loading…
        </div>
      </div>
    );
  }

  // Not logged in
  if (!auth.user) {
    return (
      <div className="app-shell">
        <div className="card">
          <LoginScreen onLogin={auth.login} onRegister={auth.register} />
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
        onRestart={() => {
          savedRef.current = false;
          s.start({ length: s.progress.total, level, subject, categories: null });
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
      />
    );
  } else if (s.started) {
    content = (
      <QuestionCard
        question={s.currentQuestion}
        progress={s.progress}
        onAnswer={s.answer}
      />
    );
  } else {
    content = (
      <Dashboard
        user={auth.user}
        onStart={(cfg) => {
          savedRef.current = false;
          setSubject(cfg.subject || "maths");
          setLevel(cfg.level);
          s.start({ ...cfg, categories: null });
        }}
        onLogout={auth.logout}
      />
    );
  }

  return (
    <div className="app-shell">
      <div className="card">{content}</div>
    </div>
  );
}
