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

// Pass subject to get per-subject topic progress (defaults to "maths")
export const getTopicProgress = (subject = "maths") =>
  apiFetch(`/progress/topics?subject=${subject}`);
