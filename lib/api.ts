// src/lib/api.ts
let _token: string | null = null;
const STORAGE_KEY = "cf_token";

export function setToken(t: string | null) {
  _token = t;
  if (t) localStorage.setItem(STORAGE_KEY, t);
  else localStorage.removeItem(STORAGE_KEY);
}

export function getToken(): string | null {
  if (_token !== null) return _token;
  if (typeof window !== "undefined") _token = localStorage.getItem(STORAGE_KEY);
  return _token;
}

// ✅ อ่านจาก .env โดยตรง
function apiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || "";
}

type ApiOpts = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const base = apiBase();
  const url = `${base}${path}`.replace(/([^:]\/)\/+/g, "$1");

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(opts.body ? { "Content-Type": "application/json" } : {}),
    ...(opts.headers as any),
  };

  const token = getToken();
  if (!opts.skipAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    try {
      err.data = JSON.parse(text);
    } catch {}
    throw err;
  }

  return (await res.json()) as T;
}
