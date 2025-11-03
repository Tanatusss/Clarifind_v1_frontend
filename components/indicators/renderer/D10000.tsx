// src/components/indicators/renderers/D10000.tsx
"use client";

import { Users, Building2 } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  director_name_th?: string;
  director_name_en?: string;
  nof_com_same_director?: number;
  company_id_detail?: number | string;
  registration_id?: string;
  name_th?: string;
  name_en?: string;
  is_parent?: number; // 1 = แถวของบริษัทหลักเอง
};

export default function D10000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // === 1) รายชื่อ "กรรมการชุดปัจจุบัน" (ตัดซ้ำตาม TH|EN) ===
  const directorMap = new Map<string, { th?: string; en?: string }>();
  for (const r of rows) {
    const key = (r.director_name_th || r.director_name_en || "").trim();
    if (!key) continue;
    if (!directorMap.has(key)) {
      directorMap.set(key, { th: r.director_name_th, en: r.director_name_en });
    }
  }
  const directors = Array.from(directorMap.values());

  // === 2) บริษัทที่มีกรรมการชุดปัจจุบันเดียวกัน (ข้ามบริษัท parent เอง) ===
  const companyMap = new Map<string, { id?: number | string; reg?: string; th?: string; en?: string }>();
  for (const r of rows) {
    if (r.is_parent === 1) continue; // ข้าม record ของบริษัทหลัก (ถ้ามี)
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
    "กรรมการชุดปัจจุบันเป็นชุดเดียวกับกรรมการบริษัทอื่น (ตั้งแต่ 2 บริษัทขึ้นไป)";

  return (
    <BaseDetailCard title={title} tone="emerald">
      {/* กรรมการชุดปัจจุบัน */}
      {directors.length > 0 && (
        <DetailSection
          icon={<Users className="h-5 w-5 text-lime-300" />}
          label="กรรมการชุดปัจจุบัน"
        >
          <ul className="list-disc list-inside space-y-1">
            {directors.map((d, i) => (
              <li key={i}>
                {d.th || d.en}
                {d.th && d.en && d.en !== d.th ? (
                  <span className="text-xs text-slate-400"> — {d.en}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* บริษัทที่มีกรรมการชุดปัจจุบันเดียวกัน */}
      {companies.length > 0 && (
        <DetailSection
          icon={<Building2 className="h-5 w-5 text-lime-300" />}
          label="บริษัทที่มีกรรมการชุดปัจจุบันเดียวกัน"
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

      {directors.length === 0 && companies.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
