// src/components/indicators/renderers/H20000.tsx
"use client";

import { Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  shareholder_name_th?: string;
  shareholder_name_en?: string;
  nation_th?: string;
  nation_en?: string;
  percent_share?: number;
  sh_upd_date?: string;
};

export default function H20000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const first = rows[0] ?? {};

  // สัดส่วนการถือหุ้นครั้งแรก (%)
  const percent =
    typeof first.percent_share === "number" ? first.percent_share : undefined;

  const title = resp?.indicator?.name_th ?? "ผู้ถือหุ้นต่างชาติถือหุ้นครั้งแรก";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {percent !== undefined ? (
        <DetailSection
          icon={<Percent className="h-5 w-5 text-cyan-300" />}
          label="สัดส่วนการถือหุ้นครั้งแรก"
        >
          {percent}%
        </DetailSection>
      ) : (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
