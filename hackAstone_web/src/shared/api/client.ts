import { ApiClientError } from "./apiError";
import {
  DEFAULT_USER_SETTINGS,
  normalizeUserSettings,
  type UserSettings,
} from "./userSettings";

export { ApiClientError, localizeApiError } from "./apiError";

export type { UserSettings } from "./userSettings";
export { DEFAULT_USER_SETTINGS, normalizeUserSettings } from "./userSettings";

const AUTH_KEY = "hackastone_auth";

export type AuthPayload = {
  token: string;
  userId: string;
  username: string;
  nickname: string;
  email?: string;
  avatarUrl?: string;
};

export type UserProfile = {
  userId: string;
  nickname: string;
  email?: string;
  avatarUrl?: string;
  settings?: UserSettings;
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
  window.dispatchEvent(new Event("hackastone-auth-changed"));
}

/** 登录后或拉取 /user/me 后，同步本地会话中的展示字段 */
export function patchAuthProfile(fields: {
  nickname?: string;
  email?: string;
  avatarUrl?: string | null;
}) {
  const auth = getAuth();
  if (!auth) return;
  setAuth({
    ...auth,
    nickname: fields.nickname ?? auth.nickname,
    email: fields.email ?? auth.email,
    avatarUrl:
      fields.avatarUrl === null
        ? undefined
        : fields.avatarUrl !== undefined
          ? fields.avatarUrl
          : auth.avatarUrl,
    username: (fields.email !== undefined ? fields.email : auth.email) ?? auth.username,
  });
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new Event("hackastone-auth-changed"));
}

export function isLoggedIn(): boolean {
  return !!getAuth();
}

export function authHeaders(): Record<string, string> {
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
    throw new ApiClientError(body.code ?? 0, body.message || "请求失败");
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
    throw new ApiClientError(body.code ?? 0, body.message || "请求失败");
  }
  return body.data;
}

export async function apiPut<T>(path: string, bodyPayload: unknown): Promise<T> {
  const base = apiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url = base ? `${base}${p}` : `/api${p}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(bodyPayload),
  });
  if (!res.ok) {
    throw new Error(await readHttpErrorBody(res));
  }
  const body = (await res.json()) as ApiResult<T>;
  if (!body.success) {
    throw new ApiClientError(body.code ?? 0, body.message || "请求失败");
  }
  return body.data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const raw = await apiGet<UserProfile>("/user/me");
  return {
    ...raw,
    settings: normalizeUserSettings(raw.settings),
  };
}

export async function updateUserProfile(nickname: string): Promise<UserProfile> {
  const raw = await apiPut<UserProfile>("/user/profile", { nickname });
  return {
    ...raw,
    settings: normalizeUserSettings(raw.settings),
  };
}

export async function updateUserSettings(
  patch: Partial<UserSettings>
): Promise<UserSettings> {
  const raw = await apiPut<{ settings?: UserSettings }>("/user/settings", patch);
  return normalizeUserSettings(raw.settings);
}

export async function uploadUserAvatar(file: File): Promise<UserProfile> {
  const base = apiBaseUrl();
  const url = base ? `${base}/user/avatar` : `/api/user/avatar`;
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) {
    throw new Error(await readHttpErrorBody(res));
  }
  const body = (await res.json()) as ApiResult<UserProfile>;
  if (!body.success) {
    throw new ApiClientError(body.code ?? 0, body.message || "上传失败");
  }
  return {
    ...body.data,
    settings: normalizeUserSettings(body.data.settings),
  };
}

/** 将后端返回的相对头像路径补全为可访问 URL */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();
  if (u.startsWith("http://") || u.startsWith("https://") || u.startsWith("data:")) {
    return u;
  }
  const base = apiBaseUrl();
  if (!base) return u.startsWith("/") ? `/api${u}` : u;
  return `${base}${u.startsWith("/") ? u : `/${u}`}`;
}
