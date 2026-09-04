import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, clearTokens, getAccessToken, setTokens } from "../lib/api";
import type { AuthResponse, LoginRequest, RegisterRequest, UserDto } from "../types";

interface AuthContextValue {
  user: UserDto | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<UserDto>;
  register: (payload: RegisterRequest) => Promise<UserDto>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function persistAuth(res: AuthResponse) {
  setTokens(res.token, res.refreshToken);
  return res.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    try {
      const profile = await api<UserDto>("/auth/me");
      setUser(profile);
    } catch {
      clearTokens();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!getAccessToken()) {
          if (!cancelled) setUser(null);
          return;
        }
        const profile = await api<UserDto>("/auth/me");
        if (!cancelled) setUser(profile);
      } catch {
        clearTokens();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    async login(payload) {
      const res = await api<AuthResponse>("/auth/login", { method: "POST", body: payload, auth: false });
      const next = persistAuth(res);
      setUser(next);
      return next;
    },
    async register(payload) {
      const res = await api<AuthResponse>("/auth/register", { method: "POST", body: payload, auth: false });
      const next = persistAuth(res);
      setUser(next);
      return next;
    },
    logout() {
      clearTokens();
      setUser(null);
    },
    refreshProfile,
  }), [user, loading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
