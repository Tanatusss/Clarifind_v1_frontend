// src/components/indicators/renderers/U30000.tsx
"use client";

import { GitBranch, Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  shareholder_name_th?: string;
  shareholder_name_en?: string;
  nation_th?: string;
  nation_en?: string;
  percent_share?: string | number;   // ทางตรง
  percent_bo?: string | number | null; // รวม (BO) - ไม่ใช้แสดง
  diff_bo_direct?: string | number;  // ทางอ้อม
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function fmtPct(v?: number) {
  if (v === undefined) return "-";
  return v.toLocaleString(undefined, { maximumFractionDigits: 4 }) + "%";
}

export default function U30000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // กรองเฉพาะผู้ถือหุ้นที่ "ทางอ้อม > ทางตรง"
  const filtered = rows.filter((r) => {
    const direct = toNum(r.percent_share);
    const indirect = toNum(r.diff_bo_direct);
    return typeof direct === "number" && typeof indirect === "number" && indirect > direct;
  });

  // เตรียมรายการ (ชื่อผู้ถือหุ้น + %ทางตรง + %ทางอ้อม)
  const items = filtered.map((r, i) => {
    const name = (r.shareholder_name_th || r.shareholder_name_en || `#${i + 1}`).trim();
    const direct = toNum(r.percent_share);
    const indirect = toNum(r.diff_bo_direct);
    return { key: `${name}-${i}`, name, direct, indirect };
  });

  const title =
    resp?.indicator?.name_th ?? "ผู้ถือหุ้นต่างชาติถือหุ้นทางอ้อมมากกว่าทางตรง";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {items.length > 0 ? (
        <>
          <DetailSection
            icon={<Percent className="h-5 w-5 text-cyan-300" />}
            label="สัดส่วนหุ้นทางตรงและสัดส่วนหุ้นทางอ้อม (เฉพาะกรณีที่ทางอ้อม > ทางตรง)"
          >
            <ul className="list-disc list-inside space-y-1">
              {items.map((it) => (
                <li key={it.key}>
                  {/* ชื่อผู้ถือหุ้นไว้ช่วยอ้างอิง แต่เน้นแสดงแค่สัดส่วนตามที่ขอ */}
                  <span className="font-medium">{it.name}</span>:{" "}
                  {fmtPct(it.direct)} (ทางตรง) → {fmtPct(it.indirect)} (ทางอ้อม)
                </li>
              ))}
            </ul>
          </DetailSection>

          {/* สรุปรวม (ออปชันนัล): ถ้าอยากโชว์รวมหลายคน ลบส่วนนี้ออกได้ */}
          {/* <DetailSection
            icon={<GitBranch className="h-5 w-5 text-cyan-300" />}
            label="จำนวนผู้ถือหุ้นที่ทางอ้อม > ทางตรง"
          >
            {items.length.toLocaleString()} ราย
          </DetailSection> */}
        </>
      ) : (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
