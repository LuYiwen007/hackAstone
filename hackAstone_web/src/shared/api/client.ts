const AUTH_KEY = "hackastone_auth";

export type AuthPayload = {
  token: string;
  userId: string;
  username: string;
  nickname: string;
};

export function getAuth(): AuthPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthPayload;
  } catch {
    return null;
  }
}

export function setAuth(payload: AuthPayload) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return !!getAuth();
}

function authHeaders(): Record<string, string> {
  const auth = getAuth();
  if (auth?.token) {
    return { Authorization: `Bearer ${auth.token}` };
  }
  return {};
}

/** 与 Spring Boot `application.yml` 中 `server.servlet.context-path: /api` 一致 */
export function apiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "";
}

export type ApiResult<T> = {
  success: boolean;
  code: number;
  message: string;
  data: T;
};

async function readHttpErrorBody(res: Response): Promise<string> {
  const raw = await res.text();
  const trimmed = raw.replace(/\s+/g, " ").trim();
  try {
    const body = JSON.parse(raw) as { message?: string; error?: string };
    if (body.message) return body.message;
    if (body.error) return body.error;
  } catch {
    /* ignore */
  }
  if (trimmed.length > 0 && trimmed.length < 2000) {
    return `HTTP ${res.status}：${trimmed.slice(0, 800)}`;
  }
  return `HTTP ${res.status}`;
}

export async function apiGet<T>(path: string): Promise<T> {
  const base = apiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url =
    path.startsWith("http") ? path : base ? `${base}${p}` : `/api${p}`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    throw new Error(await readHttpErrorBody(res));
  }
  const body = (await res.json()) as ApiResult<T>;
  if (!body.success) {
    throw new Error(body.message || "请求失败");
  }
  return body.data;
}

export async function apiPost<T>(path: string, bodyPayload: unknown): Promise<T> {
  const base = apiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}${p}` : `/api${p}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) {
    throw new Error(await readHttpErrorBody(res));
  }
  const body = (await res.json()) as ApiResult<T>;
  if (!body.success) {
    throw new Error(body.message || "请求失败");
  }
  return body.data;
}
