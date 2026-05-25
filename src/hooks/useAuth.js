// Manages authentication state. Auto-restores from the httpOnly cookie on mount.
import { useState, useCallback, useEffect } from "react";
import * as authApi from "../api/auth.js";

export function useAuth() {
  const [user, setUser] = useState(null); // { id, username } | null
  const [loading, setLoading] = useState(true); // true while checking existing session
  const [error, setError] = useState(null);

  // On mount: check if a valid cookie already exists.
  useEffect(() => {
    authApi
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username, password) => {
    setError(null);
    try {
      const u = await authApi.login(username, password);
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
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout().catch(() => {});
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}
