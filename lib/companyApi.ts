// src/lib/companyApi.ts
import { apiFetch } from "./api";

export type CompanyLite = {
  company_id: number;
  registration_id: string | null;
  name_th: string | null;
  name_en: string | null;
  company_status_th: string | null;
  company_status_en: string | null;
  status_date: string | null; // ISO
};

export type ResolveResponse = {
  company: CompanyLite[];
  total?: number;
  totalPages?: number;
  page?: number;
  take?: number;
  skip?: number;
};

type ResolveOpts = {
  skip?: number;
  take?: number;
  count?: "auto" | "yes" | "no";
  deep?: boolean;
  minLen?: number;
};

export function buildResolveUrl(q: string, opts: ResolveOpts = {}) {
  const params = new URLSearchParams({ q });
  if (typeof opts.skip === "number") params.set("skip", String(opts.skip));
  if (typeof opts.take === "number") params.set("take", String(opts.take));
  if (opts.count) params.set("count", opts.count);
  if (opts.deep) params.set("deep", "1");
  if (typeof opts.minLen === "number") params.set("minLen", String(opts.minLen));
  return `/v1/company/resolve?${params.toString()}`;
}

export async function resolveCompany(q: string, opts: ResolveOpts = {}): Promise<ResolveResponse> {
  return apiFetch<ResolveResponse>(buildResolveUrl(q, opts));
}

export async function suggestCompaniesApi(
  q: string,
  opts?: { limit?: number; deep?: boolean; minLen?: number }
) {
  const params = new URLSearchParams({ q });
  if (opts?.limit) params.set("limit", String(opts.limit));
  if (opts?.deep) params.set("deep", "1");
  if (opts?.minLen) params.set("minLen", String(opts.minLen));
  return apiFetch<{ suggestions: CompanyLite[] }>(`/v1/company/suggest?${params.toString()}`);
}
