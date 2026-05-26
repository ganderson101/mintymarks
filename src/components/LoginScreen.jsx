// Login / register form. Toggles between two modes with inline error display.
import { useState } from "react";
import { apiFetch } from "../api/client.js";

export default function LoginScreen({ onLogin, onRegister, sessionExpired }) {
  const [mode, setMode] = useState("login"); // "login" | "register" | "reset"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [busy, setBusy] = useState(false);

  function switchMode(next) {
    setMode(next);
    setError(null);
    setSuccess(null);
    setPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode !== "reset" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "reset" && password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "login") {
        await onLogin(username.trim(), password);
      } else if (mode === "register") {
        await onRegister(username.trim(), password);
      } else {
        // DEV reset
        await apiFetch("/auth/dev-reset", {
          method: "POST",
          body: JSON.stringify({ username: username.trim(), password }),
        });
        setSuccess("Password updated! You can now sign in.");
        switchMode("login");
        setUsername(username.trim());
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="title">Mindarc</h1>

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

      <p className="subtitle">
        Adaptive quiz — sign in to track your progress.
      </p>

      <div className="level-picker" style={{ marginBottom: 22 }}>
        <button
          className={"level-btn" + (mode === "login" ? " active" : "")}
          onClick={() => switchMode("login")}
          type="button"
        >
          Sign in
        </button>
        <button
          className={"level-btn" + (mode === "register" ? " active" : "")}
          onClick={() => switchMode("register")}
          type="button"
        >
          Create account
        </button>
      </div>

      {mode === "login" && (
        <p style={{ fontSize: "0.8rem", textAlign: "right", marginTop: -12, marginBottom: 12 }}>
          <button
            type="button"
            onClick={() => switchMode("reset")}
            style={{ background: "none", border: "none", color: "var(--text-muted, #888)", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
          >
            Forgot password?
          </button>
        </p>
      )}

      {mode === "reset" && (
        <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginBottom: 16 }}>
          Dev mode — no verification required. Enter your username and choose a new password.
        </p>
      )}

      <form onSubmit={handleSubmit}>
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
          />
        </label>
        <label className="auth-field">
          <span className="field-label">
            {mode === "reset" ? "New password" : "Password"}
          </span>
          <input
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

        <button className="btn-primary" type="submit" disabled={busy}>
          {busy
            ? "Please wait…"
            : mode === "login"
            ? "Sign in"
            : mode === "register"
            ? "Create account"
            : "Reset password"}
        </button>
      </form>
    </div>
  );
}
