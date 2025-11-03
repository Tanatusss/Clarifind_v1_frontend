// src/components/indicators/renderers/H40000.tsx
"use client";

import { Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  // อาจมีฟิลด์พวกนี้จากบางหลังบ้าน
  first_pct_fr?: number | string;     // % ต่างชาติ "ครั้งแรก"
  initial_percent_share?: number | string;
  init_pct_fr?: number | string;

  // ล่าสุด (ตัวอย่างที่ให้มามี percent_share)
  percent_share?: number | string;    // % ล่าสุด
  last_pct_fr?: number | string;
  shareholder_upd_date?: string;
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export default function H40000({ resp }: { resp: IndicatorDetailResponse }) {
  const row: Row = (resp?.details?.rows?.[0] as Row) ?? {};

  // ครั้งแรก: รองรับชื่อฟิลด์หลายแบบ; ถ้าไม่มีและเป็น H40000 ให้ default = 0
  let initial = toNum(row.first_pct_fr ?? row.initial_percent_share ?? row.init_pct_fr);
  if (initial === undefined && (resp?.indicator?.code?.toUpperCase?.() === "H40000")) {
    initial = 0; // ตามความหมายอินดิเคเตอร์: ครั้งแรกไม่มีผู้ถือหุ้นต่างชาติ
  }

  // ล่าสุด
  const latest = toNum(row.percent_share ?? row.last_pct_fr);

  const title =
    resp?.indicator?.name_th ?? "ผู้ถือหุ้นแรกตั้งไม่มีต่างชาติ แต่ปัจจุบันมีต่างชาติ";

  return (
    <BaseDetailCard title={title} tone="cyan">
      <DetailSection
        icon={<Percent className="h-5 w-5 text-cyan-300" />}
        label="สัดส่วนการถือหุ้นครั้งแรก / สัดส่วนการถือหุ้นล่าสุด"
      >
        {initial !== undefined ? `${initial}%` : "-"} / {latest !== undefined ? `${latest}%` : "-"}
      </DetailSection>

      {initial === undefined && latest === undefined && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
