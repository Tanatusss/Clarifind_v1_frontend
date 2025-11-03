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

type ApiOpts = RequestInit & { skipAuth?: boolean };

export async function apiFetch<T = any>(path: string, opts: ApiOpts = {}): Promise<T> {
  const base = apiBase();

  // 1) รองรับ absolute URL (http/https) → ไม่ต่อ BASE
  const url = /^https?:\/\//i.test(path)
    ? path
    : (() => {
        if (!base) {
          // กันเคสลืมตั้ง env หรือยังไม่ restart dev server
          throw new Error(
            'API base URL is empty. Please set NEXT_PUBLIC_API_BASE (e.g. "http://localhost:4545") and restart the dev server.'
          );
        }
        const p = path.startsWith("/") ? path : `/${path}`;
        return `${base}${p}`;
      })();

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
    // mode: "cors",         // ใช้เมื่อ backend เปิด CORS และอยากบังคับโหมด
    // credentials: "omit",  // ใช้ cookie ก็เปลี่ยนเป็น "include"
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err: any = new Error(text || res.statusText);
    err.status = res.status;
    try { err.data = JSON.parse(text); } catch {}
    throw err;
  }

  // 2) กัน response ไม่ใช่ JSON (เช่น 204)
  const ct = res.headers.get("content-type") || "";
  if (!ct.toLowerCase().includes("application/json")) return undefined as T;

  return (await res.json()) as T;
}
