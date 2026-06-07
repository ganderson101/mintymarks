// Top-level screen router.
// Auth flow: LoginScreen → (magic-link email) → MagicLinkVerify → ProfilePicker or Dashboard.
// Parent (role=parent): ProfilePicker → tap child → Dashboard (child session), or ParentArea.
// Child (role=child): Dashboard → quiz → results.
import { useState, useEffect, useRef } from "react";
import { useAuth } from "./hooks/useAuth.js";
import { useSession } from "./hooks/useSession.js";
import { saveSession, updateSRS } from "./api/sessions.js";
import LoginScreen from "./components/LoginScreen.jsx";
import MagicLinkVerify from "./components/MagicLinkVerify.jsx";
import ProfilePicker from "./components/ProfilePicker.jsx";
import ParentArea from "./components/ParentArea.jsx";
import Dashboard from "./components/Dashboard.jsx";
import QuestionCard from "./components/QuestionCard.jsx";
import Results from "./components/Results.jsx";
import FeedbackButton from "./components/FeedbackButton.jsx";

export default function App() {
  const auth = useAuth();
  const s = useSession();
  const [subject, setSubject] = useState("maths");
  const [level, setLevel]     = useState("ks3");
  const [bank, setBank]       = useState([]);
  const savedRef = useRef(false);
  const lastConfigRef = useRef(null);
  const [exitPrompt, setExitPrompt] = useState(false);

  // Detect a magic-link token in the URL on mount (parent clicked their email link).
  const [urlToken] = useState(() =>
    new URLSearchParams(window.location.search).get("token")
  );

  // Track which parent sub-screen to show.
  const [parentScreen, setParentScreen] = useState("picker"); // "picker" | "parent-area"

  // Reset parent screen when user logs out.
  useEffect(() => {
    if (!auth.user) setParentScreen("picker");
  }, [auth.user]);

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
        const timingByTopic = {};
        answers.forEach((a) => {
          if (a.timeTakenMs > 0) {
            if (!timingByTopic[a.category]) timingByTopic[a.category] = [];
            timingByTopic[a.category].push(a.timeTakenMs);
          }
        });
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
      .catch(() => {});
  }, [s.isComplete, s.results, auth.user, subject, level, s.sessionStartedAt]); // eslint-disable-line react-hooks/exhaustive-deps

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
    savedRef.current = true;
    setExitPrompt(false);
    s.reset();
  };

  const handleExitDiscard = () => {
    savedRef.current = true;
    setExitPrompt(false);
    s.reset();
  };

  // ── Loading ─────────────────────────────────────────────────────────────────

  if (auth.loading) {
    return (
      <div className="app-shell">
        <div className="card" style={{ textAlign: "center", color: "var(--muted)" }}>
          Loading...
        </div>
      </div>
    );
  }

  // ── Not logged in ────────────────────────────────────────────────────────────

  if (!auth.user) {
    // Magic-link token in URL → verify and establish session.
    if (urlToken) {
      return (
        <MagicLinkVerify
          token={urlToken}
          onVerified={auth.verifyAndLogin}
          onError={() => {
            // Clear token from URL (already cleared in MagicLinkVerify on mount);
            // force a page reload so the token param is gone and LoginScreen shows.
            window.location.replace(window.location.pathname);
          }}
        />
      );
    }

    return (
      <div className="app-shell">
        <div className="card">
          <LoginScreen
            onSendMagicLink={auth.sendMagicLink}
            sessionExpired={auth.sessionExpired}
          />
        </div>
      </div>
    );
  }

  // ── Parent session ───────────────────────────────────────────────────────────

  if (auth.user.role === "parent") {
    if (parentScreen === "parent-area") {
      return (
        <div className="app-shell">
          <div className="card">
            <ParentArea
              user={auth.user}
              onBack={() => setParentScreen("picker")}
              onLogout={auth.logout}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="app-shell">
        <div className="card">
          <ProfilePicker
            user={auth.user}
            onChildSelected={(childUser) => auth.switchUser(childUser)}
            onParentArea={() => setParentScreen("parent-area")}
            onLogout={auth.logout}
          />
        </div>
      </div>
    );
  }

  // ── Child (or legacy parent) session — quiz dashboard ───────────────────────

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
