const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

export function getApiOrigin() {
  return API_BASE.replace(/\/api\/?$/, "");
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><rect fill="#e8f5e9" width="800" height="800"/><circle cx="400" cy="320" r="90" fill="#81c784"/><path d="M400 400c-90 40-140 120-140 200h280c0-80-50-160-140-200z" fill="#66bb6a"/><text x="400" y="740" text-anchor="middle" fill="#2e7d32" font-family="Georgia,serif" font-size="36">MittiLok</text></svg>`,
  );

export function mediaUrl(path?: string | null, fallback = PLACEHOLDER_IMAGE) {
  if (!path || !path.trim()) return fallback;
  const value = path.trim();
  if (/^(https?:|data:|blob:)/i.test(value)) return value;

  let normalized = value.startsWith("/") ? value : `/${value}`;
  if (
    !normalized.startsWith("/uploads/") &&
    (normalized.startsWith("/categories/") ||
      normalized.startsWith("/products/") ||
      normalized.startsWith("/banners/") ||
      normalized.startsWith("/images/") ||
      normalized.startsWith("/misc/"))
  ) {
    normalized = `/uploads${normalized}`;
  }

  return `${getApiOrigin()}${normalized}`;
}

const TOKEN_KEY = "mittilok-token";
const REFRESH_KEY = "mittilok-refresh-token";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(token: string, refreshToken: string) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  skipRefresh?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      clearTokens();
      return false;
    }
    const data = (await res.json()) as { token: string; refreshToken: string };
    setTokens(data.token, data.refreshToken);
    return true;
  } catch {
    clearTokens();
    return false;
  }
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const data = (await res.json()) as { message?: string; title?: string; detail?: string };
    return new ApiError(data.message ?? data.detail ?? data.title ?? (res.statusText || "Request failed"), res.status);
  } catch {
    return new ApiError(res.statusText || "Request failed", res.status);
  }
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth = true, skipRefresh = false, headers: customHeaders, ...rest } = options;
  const headers = new Headers(customHeaders);
  if (!headers.has("Accept")) headers.set("Accept", "application/json");
  if (body !== undefined && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    ...rest,
    headers,
    body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
  });

  if (res.status === 401 && auth && !skipRefresh) {
    if (!refreshPromise) refreshPromise = tryRefresh().finally(() => { refreshPromise = null; });
    const ok = await refreshPromise;
    if (ok) return api<T>(path, { ...options, skipRefresh: true });
  }

  if (!res.ok) throw await parseError(res);
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export function buildQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}
