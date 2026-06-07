// Landing screen for magic-link clicks. Reads ?token= from the URL, verifies it,
// then hands off to the normal app flow via onVerified (which sets auth.user).
import { useEffect, useState } from "react";

export default function MagicLinkVerify({ token, onVerified, onError }) {
  const [status, setStatus] = useState("loading"); // "loading" | "error"
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Strip the token from the URL immediately so it isn't bookmarked or replayed.
    if (window.history.replaceState) {
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState({}, "", url.toString());
    }

    onVerified(token).catch((err) => {
      setMessage(err.message || "Invalid or expired link.");
      setStatus("error");
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app-shell">
      <div className="card">
        <h1 className="title">MintyMarks</h1>
        {status === "loading" && (
          <p className="subtitle">Signing you in…</p>
        )}
        {status === "error" && (
          <>
            <p className="subtitle" style={{ color: "var(--danger, #e55)" }}>
              {message}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted, #888)", marginTop: 8 }}>
              The link may have expired or already been used.{" "}
              <button
                type="button"
                onClick={onError}
                style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline", padding: 0, fontSize: "inherit" }}
              >
                Request a new link
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
