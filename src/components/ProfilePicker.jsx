// Tap-a-profile screen shown to an authenticated parent.
// Each child button starts a ~4h child session (no credentials needed).
import { useState, useEffect } from "react";
import { listChildren, tapChildProfile } from "../api/auth.js";

export default function ProfilePicker({ user, onChildSelected, onSelfPractice, onParentArea, onLogout }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [tapping, setTapping] = useState(null); // childId being tapped
  const [tapError, setTapError] = useState(null);

  useEffect(() => {
    listChildren()
      .then(setChildren)
      .catch(() => setFetchError("Failed to load profiles — check your connection."))
      .finally(() => setLoading(false));
  }, []);

  async function handleTap(childId) {
    setTapping(childId);
    setTapError(null);
    try {
      const childUser = await tapChildProfile(childId);
      onChildSelected(childUser);
    } catch (err) {
      setTapError(err.message || "Failed to start session — try again.");
      setTapping(null);
    }
  }

  return (
    <div>
      <div className="dash-header">
        <div>
          <h1 className="title" style={{ marginBottom: 2 }}>MintyMarks</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.875rem" }}>
            Who's learning today?
          </p>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Sign out</button>
      </div>

      {/* Parent can practise the questions themselves, not just the children. */}
      {onSelfPractice && (
        <button
          className="btn-primary"
          onClick={onSelfPractice}
          style={{ width: "100%", fontSize: "1.05rem", padding: "14px 20px", margin: "16px 0 4px" }}
        >
          {user.username} (you) — have a go →
        </button>
      )}

      {loading ? (
        <p className="subtitle">Loading profiles…</p>
      ) : fetchError ? (
        <p className="form-error">{fetchError}</p>
      ) : children.length === 0 ? (
        <div style={{ textAlign: "center", padding: "20px 0 8px" }}>
          <p className="subtitle">No child profiles yet.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            Go to the parent area to add one.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, margin: "16px 0 8px" }}>
          {children.map((child) => (
            <button
              key={child.id}
              className="btn-primary"
              onClick={() => handleTap(child.id)}
              disabled={tapping !== null}
              style={{
                fontSize: "1.05rem",
                padding: "14px 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  flexShrink: 0,
                  userSelect: "none",
                }}
              >
                {child.username.charAt(0).toUpperCase()}
              </span>
              {tapping === child.id ? "Starting…" : child.username}
            </button>
          ))}
        </div>
      )}

      {tapError && (
        <p className="form-error" style={{ marginTop: 8 }}>{tapError}</p>
      )}

      <div style={{ marginTop: 16, borderTop: "1px solid var(--border, #e5e7eb)", paddingTop: 14 }}>
        <button
          className="btn-ghost"
          onClick={onParentArea}
          style={{ width: "100%", textAlign: "left" }}
        >
          Parent area →
        </button>
      </div>
    </div>
  );
}
