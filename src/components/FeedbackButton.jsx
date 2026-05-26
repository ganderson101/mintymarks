// TEMPORARY FEATURE — QA feedback collection.
// To remove: delete this file, remove the import + <FeedbackButton> line in App.jsx,
// and remove the <SubmissionsInbox /> block + import in Dashboard.jsx Settings tab.
import { useState } from "react";
import { apiFetch } from "../api/client";

const S = {
  trigger: {
    display: "block",
    width: "100%",
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.72)",
    fontSize: "0.78rem",
    fontWeight: 500,
    cursor: "pointer",
    padding: "12px 16px",
    textAlign: "center",
    fontFamily: "inherit",
    letterSpacing: "0.01em",
    lineHeight: 1,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    padding: 16,
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: 20,
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
    fontFamily: "inherit",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  title: {
    fontSize: "0.95rem",
    fontWeight: 600,
    color: "#1a1a2e",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    color: "#888",
    cursor: "pointer",
    padding: "2px 6px",
    lineHeight: 1,
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: "0.88rem",
    fontFamily: "inherit",
    resize: "vertical",
    background: "#fafafa",
    color: "#1a1a2e",
    lineHeight: 1.5,
    outline: "none",
  },
  hint: {
    margin: "6px 0 0",
    fontSize: "0.72rem",
    color: "#888",
  },
  error: {
    margin: "6px 0 0",
    fontSize: "0.78rem",
    color: "#c44",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 12,
  },
  cancelBtn: {
    background: "none",
    border: "none",
    fontSize: "0.85rem",
    color: "#888",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  submitBtn: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 18px",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  submitBtnDisabled: {
    background: "#6366f1",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "7px 18px",
    fontSize: "0.85rem",
    fontFamily: "inherit",
    cursor: "default",
    opacity: 0.45,
  },
  sent: {
    textAlign: "center",
    padding: "8px 0",
    fontSize: "0.9rem",
    color: "#1a1a2e",
  },
};

export default function FeedbackButton({ context }) {
  const [open,        setOpen]        = useState(false);
  const [text,        setText]        = useState("");
  const [submitState, setSubmitState] = useState("idle"); // idle | sending | sent | error

  function handleOpen() { setOpen(true); setSubmitState("idle"); setText(""); }
  function handleClose() { setOpen(false); setText(""); setSubmitState("idle"); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitState !== "idle" || !text.trim()) return;
    setSubmitState("sending");
    try {
      await apiFetch("/feedback/general", {
        method: "POST",
        body: JSON.stringify({
          message:      text.trim(),
          questionId:   context?.id       ?? "",
          questionText: context?.text      ?? "",
          category:     context?.category  ?? "",
          level:        context?.level     ?? "",
          subject:      context?.subject   ?? "",
        }),
      });
      setSubmitState("sent");
      setText("");
    } catch {
      setSubmitState("error");
    }
  }

  return (
    <>
      <button style={S.trigger} onClick={handleOpen}>
        💬 Report bug or suggest a feature
      </button>

      {open && (
        <div style={S.overlay} onClick={handleClose}>
          <div style={S.modal} onClick={(e) => e.stopPropagation()}>
            <div style={S.header}>
              <span style={S.title}>Report bug or suggest feature</span>
              <button style={S.closeBtn} onClick={handleClose}>✕</button>
            </div>

            {submitState === "sent" ? (
              <div style={S.sent}>
                <p style={{ margin: "0 0 12px" }}>✓ Thanks — we'll take a look.</p>
                <button style={S.submitBtn} onClick={handleClose}>Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <textarea
                  style={S.textarea}
                  placeholder="Describe the bug or feature you'd like to see…"
                  value={text}
                  onChange={(e) => { setText(e.target.value); if (submitState === "error") setSubmitState("idle"); }}
                  rows={4}
                  autoFocus
                />
                {context?.id && (
                  <p style={S.hint}>📌 {context.subject} · {context.level} · {context.category}</p>
                )}
                {submitState === "error" && (
                  <p style={S.error}>⚠ Failed to send — try again</p>
                )}
                <div style={S.actions}>
                  <button type="button" style={S.cancelBtn} onClick={handleClose}>Cancel</button>
                  <button
                    type="submit"
                    style={submitState === "sending" || !text.trim() ? S.submitBtnDisabled : S.submitBtn}
                    disabled={submitState === "sending" || !text.trim()}
                  >
                    {submitState === "sending" ? "Sending…" : "Submit"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
