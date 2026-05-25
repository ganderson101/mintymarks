import { apiFetch } from "./client.js";

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

export const logout = () => apiFetch("/auth/logout", { method: "POST" });

export const getMe = () => apiFetch("/auth/me");
