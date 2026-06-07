// Parent login via magic link. Two states: email entry → sent confirmation.
import { useState } from "react";

export default function LoginScreen({ onSendMagicLink, sessionExpired }) {
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState("email"); // "email" | "sent"
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await onSendMagicLink(email.trim().toLowerCase());
      setMode("sent");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

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

      {mode === "email" ? (
        <>
          <p className="subtitle">Enter your email to receive a sign-in link.</p>
          <form onSubmit={handleSubmit}>
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
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginTop: 12 }}>
            Didn't receive it?{" "}
            <button
              type="button"
              onClick={() => { setMode("email"); setError(null); }}
              style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
            >
              Try again
            </button>
          </p>
        </>
      )}
    </div>
  );
}
