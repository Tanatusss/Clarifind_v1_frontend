// src/components/indicators/renderers/F10000.tsx
"use client";

import { BriefcaseBusiness } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  registration_id?: string;
  name_th?: string;
  name_en?: string;
  updated_at?: string | null;
};

export default function F10000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  const companies = rows.map((r) => ({
    name_th: r.name_th,
    name_en: r.name_en,
    reg: r.registration_id,
  }));

  const title =
    resp?.indicator?.name_th ??
    "เป็นบริษัทที่ดำเนินกิจการตั้งแต่ 2 ปีขึ้นไป แต่ไม่เคยนำส่งงบการเงิน";

  return (
    <BaseDetailCard title={title} tone="rose">
      {companies.length > 0 ? (
        <DetailSection
          icon={<BriefcaseBusiness className="h-5 w-5 text-rose-300" />}
          label="ชื่อบริษัท"
        >
          <ul className="list-disc list-inside space-y-1">
            {companies.map((c, i) => (
              <li key={i}>
                {c.name_th || c.name_en || c.reg}
                {c.reg ? (
                  <span className="text-xs text-slate-400"> — {c.reg}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
