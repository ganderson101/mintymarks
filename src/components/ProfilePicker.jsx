// Tap-a-profile screen shown to an authenticated parent.
// Each child button starts a ~4h child session (no credentials needed).
import { useState, useEffect } from "react";
import { listChildren, tapChildProfile } from "../api/auth.js";

const AVATAR_PALETTE = [
  { bg: "#d1fae5", fg: "#065f46" },
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { bg: "#fce7f3", fg: "#9d174d" },
  { bg: "#fef3c7", fg: "#92400e" },
  { bg: "#ede9fe", fg: "#5b21b6" },
];

function avatarColors(index) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length];
}

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

      {/* Parent self-practice shortcut */}
      {onSelfPractice && (
        <button
          className="btn-secondary"
          onClick={onSelfPractice}
          style={{ marginBottom: 4 }}
        >
          {user.username} (you) — have a go →
        </button>
      )}

      {loading ? (
        <p className="subtitle" style={{ marginTop: 16 }}>Loading profiles…</p>
      ) : fetchError ? (
        <p className="form-error" style={{ marginTop: 16 }}>{fetchError}</p>
      ) : children.length === 0 ? (
        <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
          <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>👋</p>
          <p className="subtitle" style={{ marginBottom: 4 }}>No child profiles yet.</p>
          <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>
            Add one in the parent area below.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
            margin: "20px 0 8px",
          }}
        >
          {children.map((child, index) => {
            const colors = avatarColors(index);
            const isLoading = tapping === child.id;
            return (
              <button
                key={child.id}
                onClick={() => handleTap(child.id)}
                disabled={tapping !== null}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                  padding: "20px 12px 16px",
                  border: "2px solid var(--line)",
                  borderRadius: 18,
                  background: "#fff",
                  cursor: tapping !== null ? "default" : "pointer",
                  transition: "border-color 0.15s ease, transform 0.08s ease, box-shadow 0.15s ease",
                  opacity: tapping !== null && !isLoading ? 0.55 : 1,
                }}
                onMouseEnter={(e) => {
                  if (tapping === null) {
                    e.currentTarget.style.borderColor = "var(--indigo)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 18px rgba(79, 70, 229, 0.18)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Avatar circle */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    background: isLoading ? "var(--soft)" : colors.bg,
                    color: isLoading ? "var(--muted)" : colors.fg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isLoading ? "1.4rem" : "1.7rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    userSelect: "none",
                    transition: "background 0.2s ease",
                  }}
                >
                  {isLoading ? "⏳" : child.username.charAt(0).toUpperCase()}
                </div>
                {/* Name */}
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: "var(--text)",
                    textAlign: "center",
                    lineHeight: 1.3,
                    wordBreak: "break-word",
                  }}
                >
                  {isLoading ? "Starting…" : child.username}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {tapError && (
        <p className="form-error" style={{ marginTop: 8 }}>{tapError}</p>
      )}

      <div
        style={{
          marginTop: 18,
          borderTop: "1px solid var(--line)",
          paddingTop: 14,
        }}
      >
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
