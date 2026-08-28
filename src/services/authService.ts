import type { User } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Request failed");
  if (body.token) localStorage.setItem("mittilok-token", body.token);
  return body;
}

export const authService = {
  async login(phone: string, password: string): Promise<User> {
    return (await request<{ user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ phone, password }) })).user;
  },
  async signup(fullName: string, phone: string, password: string, email?: string): Promise<User> {
    return (await request<{ user: User }>("/auth/register", { method: "POST", body: JSON.stringify({ fullName, phone, password, email }) })).user;
  },
  async me(): Promise<User> {
    return (await request<{ user: User }>("/auth/me", { headers: { Authorization: `Bearer ${localStorage.getItem("mittilok-token")}` } })).user;
  },
  logout() {
    localStorage.removeItem("mittilok-token");
    localStorage.removeItem("mittilok-user");
  },
};
