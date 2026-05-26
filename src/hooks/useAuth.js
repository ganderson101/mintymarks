// Manages authentication state. Auto-restores from the httpOnly cookie on mount.
import { useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth.js";

// Lightweight flag: persisted in localStorage so that if the user reloads
// and their session is gone (expired cookie, DB reset, etc.) we can show
// "session expired" instead of a blank login screen.
const WAS_LOGGED_IN_KEY = "mindarc_was_logged_in";

export function useAuth() {
  const [user, setUser] = useState(null); // { id, username } | null
  const [loading, setLoading] = useState(true); // true while checking existing session
  const [error, setError] = useState(null);
  // true when a previous session existed but is now invalid (expired / DB reset)
  const [sessionExpired, setSessionExpired] = useState(false);

  // On mount: check if a valid cookie already exists.
  useEffect(() => {
    authApi
      .getMe()
      .then((u) => {
        localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
        setUser(u);
      })
      .catch(() => {
        // If a session flag was set from a previous login, the user's session
        // has silently expired (or the DB was reset). Show an explanatory banner.
        if (localStorage.getItem(WAS_LOGGED_IN_KEY)) {
          setSessionExpired(true);
          localStorage.removeItem(WAS_LOGGED_IN_KEY);
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const u = await authApi.login(username, password);
      localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
      setSessionExpired(false);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const register = useCallback(async (username, password) => {
    setError(null);
    try {
      const u = await authApi.register(username, password);
      localStorage.setItem(WAS_LOGGED_IN_KEY, "1");
      setSessionExpired(false);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    localStorage.removeItem(WAS_LOGGED_IN_KEY);
    setSessionExpired(false);
    setUser(null);
  }, []);

  return { user, loading, error, sessionExpired, login, register, logout };
}
