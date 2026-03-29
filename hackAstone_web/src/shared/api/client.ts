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

export async function apiGet<T>(path: string): Promise<T> {
  const base = apiBaseUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  const url =
    path.startsWith("http") ? path : base ? `${base}${p}` : `/api${p}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const body = (await res.json()) as ApiResult<T>;
  if (!body.success) {
    throw new Error(body.message || "请求失败");
  }
  return body.data;
}
