import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { apiBaseUrl } from "@/lib/api";
import { adminApi } from "@/app/lib/adminApi";

export type AdminProfile = {
  adminRole: string;
  username: string;
  adminNote: string;
};

type AdminState = {
  token: string | null;
  expiresAt: number | null;
  loading: boolean;
  profile: AdminProfile | null;
};

type AdminContextType = AdminState & {
  setToken: (token: string | null, expiresAt: number | null) => void;
  logout: () => void;
  login: (params: { username: string; password: string; userId: string }) => Promise<void>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const STORAGE_KEY = "commonones_admin_token_v1";

function nowMs() {
  return Date.now();
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminState>({
    token: null,
    expiresAt: null,
    loading: true,
    profile: null,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setState((prev) => ({ ...prev, loading: false, profile: null }));
        return;
      }
      const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
      const token = parsed?.token || null;
      const expiresAt = typeof parsed?.expiresAt === "number" ? parsed.expiresAt : null;
      if (!token || !expiresAt || nowMs() >= expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        setState((prev) => ({ ...prev, loading: false, profile: null }));
        return;
      }
      setState({ token, expiresAt, loading: false, profile: null });
    } catch {
      setState((prev) => ({ ...prev, loading: false, profile: null }));
    }
  }, []);

  const setToken = useCallback((token: string | null, expiresAt: number | null) => {
    setState((prev) => ({ ...prev, token, expiresAt, profile: token ? prev.profile : null }));
    try {
      if (!token || !expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, expiresAt }));
      }
    } catch {
      // ignore
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null, null);
  }, [setToken]);

  const login = useCallback(
    async (params: { username: string; password: string; userId: string }) => {
      const resp = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        throw new Error((payload as { error?: string })?.error || `登录失败（${resp.status}）`);
      }
      const token = String((payload as { token?: string })?.token || "");
      const expiresIn = Number((payload as { expiresIn?: number })?.expiresIn || 0);
      if (!token || !expiresIn) {
        throw new Error("登录失败：后端未返回 token");
      }
      setToken(token, nowMs() + expiresIn * 1000);
    },
    [setToken]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!state.token) {
        setState((prev) => ({ ...prev, profile: null }));
        return;
      }
      try {
        const payload = await adminApi.me(state.token);
        const a = (payload as { admin?: { adminRole?: string; username?: string; adminNote?: string } })?.admin;
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            profile: {
              adminRole: String(a?.adminRole || "super_admin"),
              username: String(a?.username || ""),
              adminNote: String(a?.adminNote || ""),
            },
          }));
        }
      } catch {
        if (!cancelled) {
          setState((prev) => ({ ...prev, profile: null }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state.token]);

  const value = useMemo(
    () => ({
      ...state,
      setToken,
      logout,
      login,
    }),
    [state, setToken, logout, login]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return ctx;
}

