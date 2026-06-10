// Login screen — username/password is the primary path (works without email).
// Email magic-link is a secondary, expandable option for parents who prefer it.
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
  const [pwMode, setPwMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState(null);
  const [busy, setBusy] = useState(false);

  const [emailExpanded, setEmailExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [magicMode, setMagicMode] = useState("form"); // "form" | "sent"
  const [emailError, setEmailError] = useState(null);
  const [devLoginLink, setDevLoginLink] = useState(null);
  const [emailBusy, setEmailBusy] = useState(false);

  function switchPwMode(m) {
    setPwMode(m);
    setPwError(null);
    setPassword("");
  }

  // ── Password submit ────────────────────────────────────────────────────────

  async function handlePassword(e) {
    e.preventDefault();
    setPwError(null);

    const err = validatePassword(password);
    if (err) { setPwError(err); return; }

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
        setPwError("Username already taken — try a different one.");
      } else if (status === 401) {
        setPwError("Incorrect username or password.");
      } else {
        setPwError(err.message || "Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  // ── Magic-link submit ──────────────────────────────────────────────────────

  async function handleMagicLink(e) {
    e.preventDefault();
    setEmailError(null);
    setEmailBusy(true);
    try {
      const result = await onSendMagicLink(email.trim().toLowerCase());
      setDevLoginLink(result && result.dev_login_link ? result.dev_login_link : null);
      setMagicMode("sent");
    } catch (err) {
      setEmailError(err.message || "Something went wrong.");
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <div>
      {/* ── Branding ────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: "2.4rem", lineHeight: 1, marginBottom: 6 }}>🌿</div>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            margin: "0 0 6px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          MintyMarks
        </h1>
        <p style={{ color: "var(--muted)", margin: 0, fontSize: "0.95rem" }}>
          {pwMode === "register"
            ? "Create your account to get started."
            : "Welcome back — let's practise!"}
        </p>
      </div>

      {sessionExpired && (
        <p
          style={{
            fontSize: "0.85rem",
            color: "#92400e",
            background: "#fef3c7",
            border: "1px solid #fde68a",
            padding: "8px 12px",
            borderRadius: 8,
            marginBottom: 16,
            textAlign: "center",
          }}
        >
          Your session has expired — please sign in again.
        </p>
      )}

      {/* ── Sign in / Create account toggle ─────────────────────────────────── */}
      <div className="level-picker" style={{ marginBottom: 20 }}>
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

      {/* ── Primary: Username + Password ────────────────────────────────────── */}
      <form onSubmit={handlePassword}>
        <label className="auth-field">
          <span className="field-label">Username</span>
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            minLength={2}
            maxLength={32}
            placeholder="e.g. george"
          />
        </label>

        <label className="auth-field">
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

        {pwError && <p className="form-error">{pwError}</p>}

        <button
          className="btn-primary"
          type="submit"
          disabled={busy || !username.trim() || !password}
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            boxShadow: "0 10px 22px rgba(16, 185, 129, 0.35)",
            marginTop: 4,
          }}
        >
          {busy
            ? pwMode === "register" ? "Creating…" : "Signing in…"
            : pwMode === "register" ? "Create account" : "Sign in"}
        </button>
      </form>

      {/* ── Secondary: Email sign-in link (collapsible) ─────────────────────── */}
      <div style={{ marginTop: 20, textAlign: "center" }}>
        <button
          type="button"
          onClick={() => {
            setEmailExpanded((v) => !v);
            setEmailError(null);
            if (!emailExpanded) setMagicMode("form");
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: "0.875rem",
            padding: 0,
            textDecoration: "underline",
            textDecorationStyle: "dotted",
          }}
        >
          {emailExpanded ? "Hide email sign-in ↑" : "Or, email me a sign-in link"}
        </button>
      </div>

      {emailExpanded && (
        <div
          style={{
            marginTop: 12,
            padding: "16px",
            background: "var(--soft)",
            border: "1px solid var(--line)",
            borderRadius: 14,
          }}
        >
          {magicMode === "form" ? (
            <>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: "0.875rem",
                  color: "var(--muted)",
                  lineHeight: 1.5,
                }}
              >
                If your account has an email address, we'll send you a sign-in
                link — no password needed.
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

                {emailError && <p className="form-error">{emailError}</p>}

                <button
                  className="btn-primary"
                  type="submit"
                  disabled={emailBusy || !email.trim()}
                  style={{ marginTop: 4 }}
                >
                  {emailBusy ? "Sending…" : "Send sign-in link"}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <p style={{ margin: "0 0 8px", fontSize: "0.9rem" }}>
                Check your email — a sign-in link is on its way.
              </p>
              {devLoginLink && (
                <div
                  style={{
                    margin: "10px 0",
                    padding: "10px 12px",
                    border: "1px dashed var(--line)",
                    borderRadius: 8,
                    background: "#fff",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: "var(--muted)",
                    }}
                  >
                    Dev mode — no email provider configured
                  </p>
                  <a
                    href={devLoginLink}
                    style={{ fontSize: "0.875rem", wordBreak: "break-all" }}
                  >
                    Click here to sign in →
                  </a>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setMagicMode("form");
                  setEmailError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  padding: 0,
                  fontSize: "0.875rem",
                }}
              >
                Didn't receive it? Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
