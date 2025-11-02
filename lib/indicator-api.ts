// src/lib/indicator-api.ts
import { apiFetch } from "./api";

export type IndicatorKV = {
  code: string;
  value: boolean;
  name_th?: string | null;
  name_en?: string | null;
  description?: string | null;
};

export type IndicatorSummary = {
  registration_id: string;
  company_id: number;
  company_name?: string | null;
  indicators: IndicatorKV[];   // UI ใช้รายการนี้
  found_count: number;
  total: number;
  coverage_pct: number;
};

/** ---------- เส้นจริง ---------- */
type BackendIndicator = {
  indicator: string;     // e.g. "AD10000"
  name_th: string | null;
  name_en: string | null;
  flag: number | null;   // 0/1/null
  updated_at: string | null;
};
type BackendResp = {
  company: {
    company_id: number;
    registration_id: string;
    name_th: string | null;
    name_en: string | null;
  };
  indicators: BackendIndicator[];
};

/** ตัวช่วย normalize code → ให้เป็นล่างทั้งหมด (UI ส่วนใหญ่สะดวกแบบนี้) */
const normalizeCode = (code: string) => code?.toLowerCase?.() ?? code;

/** นิยามว่า “ตัวที่นับเป็นดัชนี” คือ code ตัวอักษร + ตัวเลข 5 หลัก (เช่น AD10000) */
const isRealIndicator = (code: string) => /^[A-Z]+[0-9]{5}$/i.test(code);

/** แปลงทรงหลังบ้าน → IndicatorSummary */
function transformBackendToSummary(json: BackendResp): IndicatorSummary {
  const indicators: IndicatorKV[] = (json.indicators || []).map((it) => ({
    code: normalizeCode(it.indicator),
    value: it.flag === 1,
    name_th: it.name_th,
    name_en: it.name_en,
    description: null, // ถ้ามีคอลัมน์คำอธิบายค่อยมาเติมทีหลัง
  }));

  const real = (json.indicators || []).filter((it) => isRealIndicator(it.indicator));
  const total = real.length;
  const found_count = real.filter((it) => it.flag === 1).length;
  const coverage_pct = total > 0 ? Number(((found_count / total) * 100).toFixed(1)) : 0;

  return {
    registration_id: json.company?.registration_id,
    company_id: json.company?.company_id,
    company_name: json.company?.name_th || json.company?.name_en || null,
    indicators,
    found_count,
    total,
    coverage_pct,
  };
}

export async function fetchIndicatorSummary(registration_id: string) {
  const raw = await apiFetch<BackendResp>(
    `/v1/indicators/summary?registration_id=${encodeURIComponent(registration_id)}`
  );
  return transformBackendToSummary(raw);
}

/** ---------- Prefetch (ใช้กับหน้า Loading → Results) ---------- */
const SS_SUMMARY = "CF_PREFETCH_SUMMARY";

export function readPrefetchedSummary(): IndicatorSummary | null {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(sessionStorage.getItem(SS_SUMMARY) || "null");
  } catch {
    return null;
  }
}

export function writePrefetchedSummary(summary: IndicatorSummary) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SS_SUMMARY, JSON.stringify(summary));
}

export function clearPrefetchedSummary() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SS_SUMMARY);
}

export async function prefetchSummary(registration_id: string) {
  const summary = await fetchIndicatorSummary(registration_id);
  writePrefetchedSummary(summary);
  return summary;
}
