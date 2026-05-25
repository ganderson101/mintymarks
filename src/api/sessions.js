import { apiFetch } from "./client.js";

export const saveSession = (payload) =>
  apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getSessions = () => apiFetch("/sessions");

export const deleteSession = (id) =>
  apiFetch(`/sessions/${id}`, { method: "DELETE" });

// Pass subject to get per-subject topic progress (defaults to "maths")
export const getTopicProgress = (subject = "maths") =>
  apiFetch(`/progress/topics?subject=${subject}`);
