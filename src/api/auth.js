import { apiFetch } from "./client.js";

// ── Magic-link login (parent) ─────────────────────────────────────────────────

/** Step 1: submit parent email; backend sends (or logs in dev) the magic link. */
export const requestMagicLink = (email) =>
  apiFetch("/auth/magic-link/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

/** Step 2: exchange the raw token (from ?token= URL param) for a cookie session. */
export const verifyMagicLink = (token) =>
  apiFetch("/auth/magic-link/verify", {
    method: "POST",
    body: JSON.stringify({ token }),
  });

/** Let an authenticated parent attach or update their email address. */
export const updateEmail = (email) =>
  apiFetch("/auth/me/email", {
    method: "PATCH",
    body: JSON.stringify({ email }),
  });

// ── Child profiles ────────────────────────────────────────────────────────────

/** List child profiles belonging to the authenticated parent. */
export const listChildren = () => apiFetch("/auth/children");

/**
 * Create a child profile.
 * @param {Object} opts
 * @param {string} opts.username  - display name
 * @param {string} [opts.contact] - parent-provided email or phone for child login
 * @param {string} [opts.contact_type] - 'email' | 'phone' (required if contact set)
 */
export const createChildProfile = ({ username, contact, contact_type }) =>
  apiFetch("/auth/children", {
    method: "POST",
    body: JSON.stringify({ username, contact, contact_type }),
  });

/** Send a magic link to the child's stored contact (parent must be authenticated). */
export const requestChildMagicLink = (childId) =>
  apiFetch(`/auth/children/${childId}/magic-link`, { method: "POST" });

/**
 * Tap-a-profile: establish a ~4h child session from the parent's session.
 * No magic link needed.
 */
export const tapChildProfile = (childId) =>
  apiFetch(`/auth/children/${childId}/session`, { method: "POST" });

/** Soft-delete a child profile and erase their contact PII. */
export const deleteChildProfile = (childId) =>
  apiFetch(`/auth/children/${childId}`, { method: "DELETE" });

// ── Session ───────────────────────────────────────────────────────────────────

export const logout = () => apiFetch("/auth/logout", { method: "POST" });

export const getMe = () => apiFetch("/auth/me");

// ── Legacy password auth (backward compatibility) ─────────────────────────────

export const register = (username, password) =>
  apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const login = (username, password) =>
  apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
