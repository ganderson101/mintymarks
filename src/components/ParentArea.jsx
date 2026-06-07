// Parent area: create child profiles and optionally attach a contact for one-touch login.
// The parental-consent record is written atomically on the backend when a contact is set.
import { useState, useEffect } from "react";
import { listChildren, createChildProfile, requestChildMagicLink, tapChildProfile } from "../api/auth.js";

export default function ParentArea({ user, onBack, onLogout, onChildSelected }) {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create-profile form
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactType, setContactType] = useState("email");
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

  // Per-child link-send status: { [childId]: "idle" | "sending" | "sent" | "error" }
  const [linkStatus, setLinkStatus] = useState({});

  // Tap-a-profile (start a child session straight from here)
  const [starting, setStarting] = useState(null); // childId being started
  const [startError, setStartError] = useState(null);

  useEffect(() => { loadChildren(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadChildren() {
    setLoading(true);
    try {
      setChildren(await listChildren());
    } catch {
      // non-fatal — list is informational; errors shown inline
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setBusy(true);
    try {
      const trimmedContact = contact.trim();
      const created = await createChildProfile({
        username: name.trim(),
        contact: trimmedContact || undefined,
        contact_type: trimmedContact ? contactType : undefined,
      });
      setChildren((prev) => [...prev, created]);
      setName("");
      setContact("");
      setContactType("email");
      setFormSuccess(`Profile "${created.username}" created.`);
    } catch (err) {
      setFormError(err.message || "Failed to create profile.");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendLink(childId) {
    setLinkStatus((prev) => ({ ...prev, [childId]: "sending" }));
    try {
      await requestChildMagicLink(childId);
      setLinkStatus((prev) => ({ ...prev, [childId]: "sent" }));
    } catch {
      setLinkStatus((prev) => ({ ...prev, [childId]: "error" }));
    }
  }

  async function handleStart(childId) {
    setStarting(childId);
    setStartError(null);
    try {
      const childUser = await tapChildProfile(childId);
      onChildSelected?.(childUser);
    } catch (err) {
      setStartError(err.message || "Couldn't start the session — try again.");
      setStarting(null);
    }
  }

  const hasContact = contact.trim().length > 0;

  return (
    <div>
      <div className="dash-header">
        <div>
          <h1 className="title" style={{ marginBottom: 2 }}>Parent area</h1>
          <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.875rem" }}>
            {user.username}
          </p>
        </div>
        <button className="btn-ghost" onClick={onLogout}>Sign out</button>
      </div>

      <button
        className="btn-ghost"
        onClick={onBack}
        style={{ marginBottom: 18, paddingLeft: 0 }}
      >
        ← Profiles
      </button>

      {/* ── Create child profile ────────────────────────────────────────────── */}
      <p className="section-label">Add a child profile</p>

      <form onSubmit={handleCreate}>
        <label className="auth-field">
          <span className="field-label">Child's name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            maxLength={32}
            placeholder="e.g. Alex"
          />
        </label>

        <label className="auth-field" style={{ marginTop: 12 }}>
          <span className="field-label">
            Contact for one-touch login{" "}
            <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span>
          </span>
          <input
            type={contactType === "email" ? "email" : "tel"}
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactType === "email" ? "e.g. child@example.com" : "e.g. +441234567890"}
            autoComplete="off"
          />
        </label>

        <div className="level-picker" style={{ marginTop: 6, marginBottom: 8 }}>
          <button
            type="button"
            className={"level-btn" + (contactType === "email" ? " active" : "")}
            onClick={() => setContactType("email")}
          >
            Email
          </button>
          <button
            type="button"
            className={"level-btn" + (contactType === "phone" ? " active" : "")}
            onClick={() => setContactType("phone")}
          >
            Phone
          </button>
        </div>

        {hasContact && (
          <p style={{ fontSize: "0.8rem", color: "var(--muted)", margin: "0 0 10px" }}>
            By adding a contact you consent to MintyMarks sending a magic-link sign-in
            to this address on your child's behalf.
          </p>
        )}

        {formError && <p className="form-error">{formError}</p>}
        {formSuccess && <p className="form-success">{formSuccess}</p>}

        <button
          className="btn-primary"
          type="submit"
          disabled={busy || !name.trim()}
        >
          {busy ? "Creating…" : "Add profile"}
        </button>
      </form>

      {/* ── Existing profiles ───────────────────────────────────────────────── */}
      {!loading && children.length > 0 && (
        <>
          <p className="section-label" style={{ marginTop: 28 }}>Child profiles</p>
          <ul className="session-list" style={{ gap: 8 }}>
            {children.map((child) => {
              const ls = linkStatus[child.id] || "idle";
              return (
                <li
                  key={child.id}
                  className="session-item"
                  style={{ alignItems: "center" }}
                >
                  <div style={{ flex: 1 }}>
                    <span className="session-level">{child.username}</span>
                    <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)", marginTop: 2 }}>
                      {child.has_contact
                        ? `One-touch login enabled (${child.contact_type})`
                        : "Tap-a-profile only"}
                    </span>
                  </div>

                  {child.has_contact && (
                    <button
                      className="btn-ghost"
                      style={{ fontSize: "0.8rem", flexShrink: 0 }}
                      onClick={() => handleSendLink(child.id)}
                      disabled={ls === "sending" || ls === "sent"}
                    >
                      {ls === "sent"
                        ? "Sent!"
                        : ls === "error"
                        ? "Retry"
                        : ls === "sending"
                        ? "Sending…"
                        : "Send login link"}
                    </button>
                  )}

                  <button
                    className="btn-primary"
                    style={{ fontSize: "0.8rem", flexShrink: 0, padding: "8px 14px" }}
                    onClick={() => handleStart(child.id)}
                    disabled={starting !== null}
                  >
                    {starting === child.id ? "Starting…" : "Start session →"}
                  </button>
                </li>
              );
            })}
          </ul>
          {startError && (
            <p className="form-error" style={{ marginTop: 8 }}>{startError}</p>
          )}
        </>
      )}
    </div>
  );
}
