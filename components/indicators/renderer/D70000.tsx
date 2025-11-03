// src/components/indicators/renderers/D70000.tsx
"use client";

import { Library, CalendarDays, Building2 } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  year_focus?: number;
  nof_com?: number;
  company_id_detail?: number | string;
  registration_id?: string;
  name_th?: string;
  name_en?: string;
  status_date?: string | null; // วันที่เลิกกิจการ
  company_status_th?: string;
  company_status_en?: string;
};

function fmtDate(raw?: string | null) {
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function D70000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // --- 1) จำนวนบริษัทที่เลิกกิจการ "ในแต่ละปี" ---
  // รวมเป็น year -> Set(company_id_detail) เพื่อกันข้อมูลซ้ำ แล้วนับ
  const yearToCompanies = new Map<number, Set<string>>();
  for (const r of rows) {
    const y = typeof r.year_focus === "number" ? r.year_focus : undefined;
    if (!y) continue;
    const key =
      String(r.company_id_detail ?? "") ||
      `${r.registration_id}-${r.name_th ?? r.name_en ?? ""}`;
    if (!key) continue;
    if (!yearToCompanies.has(y)) yearToCompanies.set(y, new Set());
    yearToCompanies.get(y)!.add(key);
  }
  const countPerYear = Array.from(yearToCompanies.entries())
    .map(([y, set]) => ({ year: y, count: set.size }))
    .sort((a, b) => a.year - b.year);

  // --- 2) รายชื่อบริษัท (ตัดซ้ำตาม company_id_detail / fallback) ---
  const companyMap = new Map<
    string,
    { id?: number | string; reg?: string; th?: string; en?: string }
  >();
  for (const r of rows) {
    const key =
      String(r.company_id_detail ?? "") ||
      `${r.registration_id}-${r.name_th ?? r.name_en ?? ""}`;
    if (!key) continue;
    if (!companyMap.has(key)) {
      companyMap.set(key, {
        id: r.company_id_detail,
        reg: r.registration_id,
        th: r.name_th,
        en: r.name_en,
      });
    }
  }
  const companies = Array.from(companyMap.values());

  // --- 3) วันที่เลิกกิจการ (ตัดซ้ำ + เรียง) ---
  const dateSet = new Set<string>();
  for (const r of rows) {
    const d = fmtDate(r.status_date);
    if (d) dateSet.add(d);
  }
  const dissolutionDates = Array.from(dateSet).sort();

  const title =
    resp?.indicator?.name_th ??
    "กรรมการชุดปัจจุบันเคยเป็นกรรมการชุดแรกตั้งของบริษัทที่จดทะเบียนเลิกกิจการภายใน 1 ปี";

  return (
    <BaseDetailCard title={title} tone="rose">
      {/* จำนวนบริษัทที่เลิกกิจการในแต่ละปี */}
      {countPerYear.length > 0 && (
        <DetailSection
          icon={<Library className="h-5 w-5 text-lime-300" />}
          label="จำนวนบริษัทที่กรรมการชุดปัจจุบัน เคยจดทะเบียนเลิกกิจการในแต่ละปี"
        >
          <ul className="list-disc list-inside space-y-1">
            {countPerYear.map(({ year, count }) => (
              <li key={year}>
                {year}: {count.toLocaleString()} บริษัท
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* รายชื่อบริษัท */}
      {companies.length > 0 && (
        <DetailSection
          icon={<Building2 className="h-5 w-5 text-lime-300" />}
          label="รายชื่อบริษัท"
        >
          <ul className="list-disc list-inside space-y-1">
            {companies.map((c, i) => (
              <li key={`${c.id ?? i}`}>
                {c.th || c.en || c.reg}
                {c.reg ? (
                  <span className="text-xs text-slate-400"> — {c.reg}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* วันที่เลิกกิจการ */}
      {dissolutionDates.length > 0 && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-lime-300" />}
          label="วันที่กรรมการชุดปัจจุบัน เคยจดทะเบียนเลิกกิจการ"
        >
          <ul className="list-disc list-inside space-y-1">
            {dissolutionDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </DetailSection>
      )}

      {countPerYear.length === 0 &&
        companies.length === 0 &&
        dissolutionDates.length === 0 && (
          <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
        )}
    </BaseDetailCard>
  );
}
