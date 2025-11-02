// src/lib/indicator-api.ts
import { apiFetch } from "./api"

/** ค่ารายตัวของแต่ละตัวชี้วัด (เหมือนที่ใช้ตอน mock) */
export type IndicatorKV = {
  code: string
  value: boolean
}

/** สรุปทั้งหมดสำหรับบริษัทหนึ่ง (เหมือน mock) */
export type IndicatorSummary = {
  registration_id: string
  company_id: number
  indicators: IndicatorKV[]        // ทุกตัว 1..23 พร้อม value true/false
  found_count: number              // นับที่ value=true
  total: number                    // 23
  coverage_pct: number             // 0..100
}

/** สำหรับ true-only (เหมือน mock: คืนมาเฉพาะตัวที่ value=true) */
export type IndicatorTrueOnly = {
  registration_id: string
  company_id: number
  indicators: { code: string }[]   // รายการ code ที่ผ่านเงื่อนไข (true)
}

/** ดึงสรุปทั้งหมดของบริษัท */
export async function fetchIndicatorSummary(registration_id: string) {
  // backend: GET /v1/indicator/summary?registration_id=XXXX
  return apiFetch<IndicatorSummary>(`/v1/indicator/summary?registration_id=${encodeURIComponent(registration_id)}`)
}

/** ดึงเฉพาะตัวที่ value=true (true-only) */
export async function fetchIndicatorTrueOnly(registration_id: string) {
  // backend: GET /v1/indicator/true-only?registration_id=XXXX
  return apiFetch<IndicatorTrueOnly>(`/v1/indicator/true-only?registration_id=${encodeURIComponent(registration_id)}`)
}

/* -----------------------------------------------------------
   (ออปชัน) Helper: รวมผล summary + true-only
   - คืน allIndicators = [{code, value}] ครบทุกตัว (จาก summary)
   - คืน failIndicators = เฉพาะที่ value=true (จาก true-only)
   - คืน passIndicators = value=false (จาก summary \ true-only)
   ใช้สะดวกเวลา map แสดงผลหน้ารายงาน
------------------------------------------------------------ */
export async function getIndicatorsMerged(registration_id: string) {
  const [summary, trueOnly] = await Promise.all([
    fetchIndicatorSummary(registration_id),
    fetchIndicatorTrueOnly(registration_id),
  ])

  const trueSet = new Set((trueOnly?.indicators ?? []).map(i => i.code))

  const allIndicators = summary.indicators
  const failIndicators = allIndicators.filter(i => trueSet.has(i.code))
  const passIndicators = allIndicators.filter(i => !trueSet.has(i.code))

  return {
    summary,          // มี found_count, total, coverage_pct ครบ
    allIndicators,    // [{code, value}] ครบ 23
    failIndicators,   // value=true
    passIndicators,   // value=false
  }
}
