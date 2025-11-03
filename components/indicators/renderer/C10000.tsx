// src/components/indicators/renderers/C10000.tsx
"use client";

import { GitBranch, Building2 } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  nof_path?: number;
  path_id?: number;
  company_id_detail?: number;
  registration_id?: string;
  name_th?: string;
  name_en?: string;
};

export default function C10000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const first = rows[0] ?? {};

  // --- นับจำนวนเส้นทาง ---
  // ถ้ามี nof_path จากหลังบ้าน ใช้เลย; ไม่งั้นนับ path_id แบบ distinct
  const distinctPathCount = new Set(
    rows.map((r) => (typeof r.path_id === "number" ? r.path_id : undefined)).filter(Boolean)
  ).size;
  const routeCount: number | undefined =
    typeof first.nof_path === "number" ? first.nof_path : distinctPathCount || undefined;

  // --- รายชื่อบริษัทในวงจร ---
  // รวมจากทุกแถว แล้ว dedupe ตาม company_id_detail
  const companies = Array.from(
    new Map(
      rows.map((r) => [
        r.company_id_detail ?? `${r.registration_id}-${r.name_th ?? r.name_en ?? ""}`,
        {
          company_id: r.company_id_detail,
          registration_id: r.registration_id,
          name_th: r.name_th,
          name_en: r.name_en,
        },
      ])
    ).values()
  );

  const title =
    resp?.indicator?.name_th ?? "มีรูปแบบการถือหุ้น Circular Ownership";

  return (
    <BaseDetailCard title={title} tone="amber">
      {/* จำนวนเส้นทางที่มีลักษณะ Circular Ownership */}
      {typeof routeCount === "number" && (
        <DetailSection
          icon={<GitBranch className="h-5 w-5 text-amber-300" />}
          label="จำนวนเส้นทางที่มีลักษณะ Circular Ownership"
        >
          {routeCount.toLocaleString()} เส้นทาง
        </DetailSection>
      )}

      {/* รายชื่อบริษัทที่อยู่ใน Circular Ownership */}
      {companies.length > 0 && (
        <DetailSection
          icon={<Building2 className="h-5 w-5 text-amber-300" />}
          label="รายชื่อบริษัทที่อยู่ใน Circular Ownership"
        >
          <ul className="list-disc list-inside space-y-1">
            {companies.map((c, i) => (
              <li key={`${c.company_id ?? i}`}>
                {c.name_th || c.name_en || c.registration_id}
                {c.registration_id ? (
                  <span className="text-xs text-slate-400"> — {c.registration_id}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {typeof routeCount !== "number" && companies.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
