// Login screen with two paths:
//   (A) Email magic-link — unlocks board/customisable features
//   (B) Username + password — simple no-email option
import { useState } from "react";

const MIN_PASSWORD_LENGTH = 8;

function validatePassword(pw) {
  if (!pw) return "Password is required.";
  if (pw.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
}

export default function LoginScreen({
  onSendMagicLink,
  onLogin,
  onRegister,
  sessionExpired,
}) {
  // Top-level tab: "magiclink" | "password"
  const [tab, setTab] = useState("magiclink");

  // Magic-link sub-state
  const [email, setEmail] = useState("");
  const [magicMode, setMagicMode] = useState("form"); // "form" | "sent"
  const [devLoginLink, setDevLoginLink] = useState(null); // local/dev only: link returned when no email provider

  // Password sub-state
  const [pwMode, setPwMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function switchTab(t) {
    setTab(t);
    setError(null);
  }

  function switchPwMode(m) {
    setPwMode(m);
    setError(null);
    setPassword("");
  }

  // ── Magic-link submit ──────────────────────────────────────────────────────

  async function handleMagicLink(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await onSendMagicLink(email.trim().toLowerCase());
      setDevLoginLink(result && result.dev_login_link ? result.dev_login_link : null);
      setMagicMode("sent");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  // ── Password submit (login or register) ────────────────────────────────────

  async function handlePassword(e) {
    e.preventDefault();
    setError(null);

    const pwError = validatePassword(password);
    if (pwError) { setError(pwError); return; }

    setBusy(true);
    try {
      if (pwMode === "register") {
        await onRegister(username.trim(), password);
      } else {
        await onLogin(username.trim(), password);
      }
    } catch (err) {
      const status = err.status;
      if (status === 409) {
        setError("Username already taken — try a different one.");
      } else if (status === 401) {
        setError("Incorrect username or password.");
      } else {
        setError(err.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  const tabStyle = (active) => ({
    flex: 1,
    padding: "8px 0",
    border: "none",
    borderBottom: active ? "2px solid var(--accent, #16a34a)" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: active ? 600 : 400,
    color: active ? "var(--accent, #16a34a)" : "var(--text-muted, #888)",
    fontSize: "0.875rem",
  });

  return (
    <div>
      <h1 className="title">MintyMarks</h1>

      {sessionExpired && (
        <p style={{
          fontSize: "0.85rem",
          color: "#92400e",
          background: "#fef3c7",
          border: "1px solid #fde68a",
          padding: "8px 12px",
          borderRadius: 6,
          marginBottom: 14,
          marginTop: 4,
        }}>
          Your session has expired — please sign in again.
        </p>
      )}

      {/* ── Tab switcher ───────────────────────────────────────────────────── */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border, #e5e7eb)", marginBottom: 20 }}>
        <button type="button" style={tabStyle(tab === "magiclink")} onClick={() => switchTab("magiclink")}>
          Email link
        </button>
        <button type="button" style={tabStyle(tab === "password")} onClick={() => switchTab("password")}>
          Username &amp; password
        </button>
      </div>

      {/* ── Email / magic-link path ────────────────────────────────────────── */}
      {tab === "magiclink" && (
        magicMode === "form" ? (
          <>
            <p className="subtitle">
              Enter your email to receive a sign-in link.{" "}
              <span style={{ color: "var(--text-muted, #888)" }}>
                Email accounts unlock customisable features.
              </span>
            </p>
            <form onSubmit={handleMagicLink}>
              <label className="auth-field">
                <span className="field-label">Email address</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              {error && <p className="form-error">{error}</p>}

              <button className="btn-primary" type="submit" disabled={busy || !email.trim()}>
                {busy ? "Sending…" : "Send sign-in link"}
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="subtitle">Check your email — a sign-in link is on its way.</p>
            {devLoginLink && (
              <div style={{ marginTop: 12, padding: "12px 14px", border: "1px dashed var(--border, #e5e7eb)", borderRadius: 8, background: "rgba(0,0,0,0.03)" }}>
                <p style={{ margin: "0 0 6px", fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted, #888)" }}>
                  Dev mode — no email provider configured
                </p>
                <a href={devLoginLink} style={{ fontSize: "0.9rem", wordBreak: "break-all" }}>
                  Click here to sign in →
                </a>
              </div>
            )}
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginTop: 12 }}>
              Didn't receive it?{" "}
              <button
                type="button"
                onClick={() => { setMagicMode("form"); setError(null); }}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
              >
                Try again
              </button>
            </p>
          </>
        )
      )}

      {/* ── Username + password path ───────────────────────────────────────── */}
      {tab === "password" && (
        <>
          <p className="subtitle">
            No email needed —{" "}
            {pwMode === "register" ? "create a free account." : "sign in to your account."}
          </p>

          {/* Sign in / Create account toggle */}
          <div className="level-picker" style={{ marginBottom: 16 }}>
            <button
              type="button"
              className={"level-btn" + (pwMode === "login" ? " active" : "")}
              onClick={() => switchPwMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={"level-btn" + (pwMode === "register" ? " active" : "")}
              onClick={() => switchPwMode("register")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={handlePassword}>
            <label className="auth-field">
              <span className="field-label">Username</span>
              <input
                type="text"
                autoComplete={pwMode === "register" ? "username" : "username"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={2}
                maxLength={32}
                placeholder="e.g. george"
              />
            </label>

            <label className="auth-field" style={{ marginTop: 12 }}>
              <span className="field-label">Password</span>
              <input
                type="password"
                autoComplete={pwMode === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={MIN_PASSWORD_LENGTH}
                placeholder={pwMode === "register" ? `At least ${MIN_PASSWORD_LENGTH} characters` : ""}
              />
            </label>

            {error && <p className="form-error">{error}</p>}

            <button
              className="btn-primary"
              type="submit"
              disabled={busy || !username.trim() || !password}
            >
              {busy
                ? (pwMode === "register" ? "Creating…" : "Signing in…")
                : (pwMode === "register" ? "Create account" : "Sign in")}
            </button>
          </form>

          {pwMode === "login" && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginTop: 14, textAlign: "center" }}>
              Forgot your password?{" "}
              <button
                type="button"
                onClick={() => switchTab("magiclink")}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
              >
                Sign in by email instead
              </button>
              {" "}— if your account has an email, we'll send you a link.
            </p>
          )}
        </>
      )}
    </div>
  );
}
