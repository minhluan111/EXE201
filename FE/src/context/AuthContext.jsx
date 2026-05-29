import {
  authLogin,
  authLogout,
  authRegister,
  authMe,
} from "../services/mockApi.js";

import { useContext, useEffect, useMemo, useState } from "react";

import { AuthContext } from "./contextObjects.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const session = JSON.parse(
        localStorage.getItem("vizza.session") || "null",
      );
      if (!session?.token) {
        if (!cancelled) setLoading(false);
        return;
      }

      setToken(session.token);
      const res = await authMe(session.token);
      if (cancelled) return;
      if (res.ok) setUser(res.user);
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const api = useMemo(
    () => ({
      user,
      token,
      loading,
      login: async ({ login, password }) => {
        setLoading(true);
        const res = await authLogin({ login, password });
        setLoading(false);
        if (!res.ok) return res;
        setToken(res.token);
        setUser(res.user);
        return res;
      },
      register: async ({ full_name, email, phone, password }) => {
        setLoading(true);
        const res = await authRegister({ full_name, email, phone, password });
        setLoading(false);
        if (!res.ok) return res;
        setToken(res.token);
        setUser(res.user);
        return res;
      },
      logout: async () => {
        setLoading(true);
        await authLogout();
        setLoading(false);
        setToken(null);
        setUser(null);
      },
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
