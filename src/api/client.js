// Base fetch wrapper. Sends cookies with every request (required for httpOnly auth cookie).
// Requests go to /api/* which Vite proxies to the FastAPI backend — no CORS needed.
const BASE = "/api";

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.detail || message;
    } catch (_) {
      // ignore parse errors
    }
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }

  // 204 No Content — no body to parse
  if (res.status === 204) return null;
  return res.json();
}
