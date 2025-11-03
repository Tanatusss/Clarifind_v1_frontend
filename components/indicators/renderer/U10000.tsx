// src/components/indicators/renderers/U10000.tsx
"use client";

import { UserCircle2, Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  ubo_name_th?: string;
  ubo_name_en?: string;
  nation_th?: string;
  nation_en?: string;
  percent_ubo?: string | number;
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function fmtPct(v?: unknown) {
  const n = toNum(v);
  if (n === undefined) return undefined;
  // แสดงทศนิยมสูงสุด 4 ตำแหน่ง (พอสำหรับ 49.2577)
  return n.toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%";
}

export default function U10000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // รวมชื่อ UBO (ตัดซ้ำ)
  const names = Array.from(
    new Set(
      rows
        .map((r) => (r.ubo_name_th || r.ubo_name_en || "").trim())
        .filter((s) => s.length > 0)
    )
  );

  // รวมเปอร์เซ็นต์ UBO (ตัดซ้ำ + เรียง)
  const percents = Array.from(
    new Set(
      rows
        .map((r) => toNum(r.percent_ubo))
        .filter((n): n is number => typeof n === "number")
    )
  ).sort((a, b) => b - a);

  const title =
    resp?.indicator?.name_th ??
    "ผู้รับผลประโยชน์สูงสุดเป็นต่างชาติและมีหุ้นตั้งแต่ 49% ขึ้นไป";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* ชื่อบุคคลที่เป็นผู้รับผลประโยชน์สูงสุด */}
      {names.length > 0 && (
        <DetailSection
          icon={<UserCircle2 className="h-5 w-5 text-cyan-300" />}
          label="ชื่อบุคคลที่เป็นผู้รับผลประโยชน์สูงสุด"
        >
          <ul className="list-disc list-inside space-y-1">
            {names.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* เปอร์เซ็นต์ของผู้รับผลประโยชน์สูงสุด (%BO) */}
      {percents.length > 0 && (
        <DetailSection
          icon={<Percent className="h-5 w-5 text-cyan-300" />}
          label="เปอร์เซ็นต์ของผู้รับผลประโยชน์สูงสุด (%BO)"
        >
          {percents.map((p, i) => (
            <span key={p}>
              {i > 0 ? ", " : ""}
              {fmtPct(p)}
            </span>
          ))}
        </DetailSection>
      )}

      {names.length === 0 && percents.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
