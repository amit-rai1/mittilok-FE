import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<User>;
  signup: (fullName: string, phone: string, password: string, email?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("mittilok-user");
    return stored ? JSON.parse(stored) as User : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("mittilok-token")));

  useEffect(() => {
    if (!localStorage.getItem("mittilok-token")) {
      setLoading(false);
      return;
    }
    authService.me()
      .then(setUser)
      .catch(() => { localStorage.removeItem("mittilok-token"); localStorage.removeItem("mittilok-user"); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (nextUser: User) => {
    setUser(nextUser);
    localStorage.setItem("mittilok-user", JSON.stringify(nextUser));
    return nextUser;
  };

  return <AuthContext.Provider value={{
    user,
    loading,
    async login(phone, password) { return saveSession(await authService.login(phone, password)); },
    async signup(fullName, phone, password, email) { return saveSession(await authService.signup(fullName, phone, password, email)); },
    logout() { authService.logout(); setUser(null); },
  }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
