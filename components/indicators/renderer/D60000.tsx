// src/components/indicators/renderers/D60000.tsx
"use client";

import { Hash, CalendarDays, Building2 } from "lucide-react";
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
  regist_date?: string | null;
  regists_date?: string | null;
};

function pickDate(r: Row): string | undefined {
  const raw = r.regists_date || r.regist_date || undefined;
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function D60000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const first = rows[0] ?? {};

  // 1) จำนวนบริษัทที่เคยจดทะเบียนภายใน 1 ปี (จากแถวแรก)
  const countIn1Year =
    typeof first.nof_com === "number" ? first.nof_com : undefined;

  // 2) วันที่ที่เคยจดทะเบียนบริษัท (รวมทุกแถว ตัดซ้ำ + เรียง)
  const dateSet = new Set<string>();
  for (const r of rows) {
    const d = pickDate(r);
    if (d) dateSet.add(d);
  }
  const dates = Array.from(dateSet).sort(); // asc

  // 3) รายชื่อบริษัทที่เคยจดทะเบียนในปีเดียวกัน (รวมทุกแถว ตัดซ้ำ)
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

  const title =
    resp?.indicator?.name_th ??
    "กรรมการชุดปัจจุบันเคยเป็นกรรมการชุดแรกตั้งของบริษัทที่จดทะเบียนภายใน 1 ปี";

  return (
    <BaseDetailCard title={title} tone="amber">
      {/* จำนวนบริษัทที่กรรมการชุดปัจจุบัน เคยจดทะเบียนภายใน 1 ปี */}
      {typeof countIn1Year === "number" && (
        <DetailSection
          icon={<Hash className="h-5 w-5 text-lime-300" />}
          label="จำนวนบริษัทที่กรรมการชุดปัจจุบัน เคยจดทะเบียนภายใน 1 ปี"
        >
          {countIn1Year.toLocaleString()} บริษัท
        </DetailSection>
      )}

      {/* วันที่กรรมการชุดปัจจุบัน เคยจดทะเบียนบริษัท */}
      {dates.length > 0 && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-lime-300" />}
          label="วันที่กรรมการชุดปัจจุบัน เคยจดทะเบียนบริษัท"
        >
          <ul className="list-disc list-inside space-y-1">
            {dates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* บริษัทที่เคยจดทะเบียนบริษัทในปีเดียวกัน */}
      {companies.length > 0 && (
        <DetailSection
          icon={<Building2 className="h-5 w-5 text-lime-300" />}
          label="บริษัทที่เคยจดทะเบียนบริษัทในปีเดียวกัน"
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

      {typeof countIn1Year !== "number" && dates.length === 0 && companies.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
