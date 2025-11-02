"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, setToken, getToken } from "./api";

type User = { username: string } & Record<string, any>;
type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (u: string, p: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
};

const AuthCtx = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  loading: true,
});

type LoginRes = { token: string; user?: User };
type MeRes = { user: User };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTok] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ ตรวจ token ที่เก็บไว้
  useEffect(() => {
    (async () => {
      const t = getToken();
      setTok(t);
      if (t) {
        try {
          const me = await apiFetch<MeRes>("/auth/me");
          setUser(me.user);
        } catch {
          setToken(null);
          setTok(null);
          setUser(null);
        }
      }
      setLoading(false);
    })();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const { token, user: u } = await apiFetch<LoginRes>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        skipAuth: true,
      });
      setToken(token);
      setTok(token);
      setUser(u ?? { username });
      return true;
    } catch (e: any) {
      setToken(null);
      setTok(null);
      setUser(null);
      if (e?.status === 401) return false;
      throw e;
    }
  };

  const logout = () => {
    setToken(null);
    setTok(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
