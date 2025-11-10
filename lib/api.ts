// src/lib/api.ts
let _token: string | null = null;
const STORAGE_KEY = "cf_token";

export function setToken(t: string | null) {
  _token = t;
  if (typeof window !== "undefined") {
    if (t) localStorage.setItem(STORAGE_KEY, t);
    else localStorage.removeItem(STORAGE_KEY);
  }
}

export function getToken(): string | null {
  if (_token !== null) return _token;
  if (typeof window !== "undefined") _token = localStorage.getItem(STORAGE_KEY);
  return _token;
}

function apiBase() {
  return (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/+$/, "");
}

type ApiOpts = RequestInit & {
  skipAuth?: boolean;
  timeoutMs?: number;
};

export async function apiFetch<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const base = apiBase();
  const url = /^https?:\/\//i.test(path)
    ? path
    : (() => {
        if (!base) {
          throw new Error(
            '❌ API base URL is empty. Please set NEXT_PUBLIC_API_BASE (e.g. "http://localhost:4545") and restart dev server.'
          );
        }
        const p = path.startsWith("/") ? path : `/${path}`;
        return `${base}${p}`;
      })();

  // ✅ headers รวมทุกอย่าง + token
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers as any),
  };

  const token = getToken();
  if (!opts.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // ✅ เพิ่ม AbortController สำหรับ timeout
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 15000; // 15s
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      ...opts,
      headers,
      cache: "no-store",
      keepalive: true, // ✅ ช่วย reuse connection
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      throw new Error(`Request timeout after ${timeoutMs / 1000}s`);
    }
    throw err;
  }
  clearTimeout(timeout);

  // ✅ handle response
  const text = await res.text().catch(() => "");
  const contentType = res.headers.get("content-type") || "";

  if (!res.ok) {
    const error: any = new Error(text || res.statusText);
    error.status = res.status;
    try {
      error.data = JSON.parse(text);
      error.message = error.data?.error || error.data?.message || error.message;
    } catch {}
    throw error;
  }

  if (!contentType.toLowerCase().includes("application/json")) {
    // เช่น 204 No Content
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid JSON response from API");
  }
}
