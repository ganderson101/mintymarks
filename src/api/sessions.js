import { apiFetch } from "./client.js";

export const saveSession = (payload) =>
  apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getSessions = () => apiFetch("/sessions");

export const deleteSession = (id) =>
  apiFetch(`/sessions/${id}`, { method: "DELETE" });

// Returns the individual answer rows for a past session (for History drill-down)
export const getSessionAnswers = (id) => apiFetch(`/sessions/${id}/answers`);

// Pass subject to scope results. Optional level param filters to a specific level
// (used when seeding cross-session adaptive performance).
export const getTopicProgress = (subject = "maths", level = null) => {
  const params = new URLSearchParams({ subject });
  if (level) params.set("level", level);
  return apiFetch(`/progress/topics?${params}`);
};

// ── Spaced repetition ─────────────────────────────────────────────────────────

// Returns all SRS records for the user+subject (includes isDue flag).
export const getSRSTopics = (subject = "maths") =>
  apiFetch(`/progress/srs?subject=${subject}`);

// Update SRS state for one topic after completing a session.
// payload: { subject, category, accuracy (0-1), avgTimeSec (optional) }
export const updateSRS = (payload) =>
  apiFetch("/progress/srs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
