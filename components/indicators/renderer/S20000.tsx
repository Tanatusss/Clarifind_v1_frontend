// src/components/indicators/renderers/S20000.tsx
"use client";

import { Users, Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  shareholder_name_th?: string;
  shareholder_name_en?: string;
  nation_th?: string;
  nation_en?: string;
  percent_share?: string | number;
  sh_upd_date?: string | null;
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export default function S20000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // กรองเฉพาะผู้ถือหุ้น % อยู่ในช่วง [48, 50)
  const matches = rows.filter((r) => {
    const pct = toNum(r.percent_share);
    return typeof pct === "number" && pct >= 48 && pct < 50;
  });

  // รายชื่อผู้ถือหุ้น (ตัดซ้ำตามชื่อ)
  const holderMap = new Map<string, { name: string; note?: string }>();
  for (const r of matches) {
    const name = (r.shareholder_name_th || r.shareholder_name_en || "").trim();
    if (!name) continue;
    if (!holderMap.has(name)) {
      holderMap.set(name, { name, note: r.nation_th || r.nation_en });
    }
  }
  const holders = Array.from(holderMap.values());

  // สัดส่วน (% ถือหุ้น) ที่เข้าเงื่อนไข (ตัดซ้ำ + เรียง)
  const percents = Array.from(
    new Set(
      matches
        .map((r) => toNum(r.percent_share))
        .filter((n): n is number => typeof n === "number")
    )
  ).sort((a, b) => a - b);

  const title =
    resp?.indicator?.name_th ?? "ผู้ถือหุ้นต่างชาติ 48% ถึงน้อยกว่า 50%";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* ผู้ถือหุ้นต่างชาติที่ถือหุ้นตั้งแต่ 48 แต่น้อยกว่า 50 */}
      {holders.length > 0 && (
        <DetailSection
          icon={<Users className="h-5 w-5 text-cyan-300" />}
          label="ผู้ถือหุ้นต่างชาติที่ถือหุ้นตั้งแต่ 48% แต่น้อยกว่า 50%"
        >
          <ul className="list-disc list-inside space-y-1">
            {holders.map((h) => (
              <li key={h.name}>
                {h.name}
                {h.note ? (
                  <span className="text-xs text-slate-400"> — {h.note}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* สัดส่วนของผู้ถือหุ้นต่างชาติ */}
      {percents.length > 0 && (
        <DetailSection
          icon={<Percent className="h-5 w-5 text-cyan-300" />}
          label="สัดส่วนของผู้ถือหุ้นต่างชาติ"
        >
          {percents.map((p, i) => (
            <span key={p}>
              {i > 0 ? ", " : ""}
              {p}%
            </span>
          ))}
        </DetailSection>
      )}

      {holders.length === 0 && percents.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
