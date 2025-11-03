// src/components/indicators/renderers/H70000.tsx
"use client";

import { Users, Percent, CalendarDays } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  shareholder_name_th?: string;
  shareholder_name_en?: string;
  nation_en?: string;
  sh_upd_date?: string | null;        // วันที่ก่อน
  percent_share?: string | number;    // % ก่อน
  next_sh_upd_date?: string | null;   // วันที่หลัง (วันที่เปลี่ยนแปลง)
  next_percent_share?: string | number; // % หลัง
};

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

function ymd(raw?: string | null): string | undefined {
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function H70000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // ผู้ถือหุ้นที่ "เพิ่มขึ้น": กรองเฉพาะกรณี next_percent_share > percent_share
  const increased = rows.filter((r) => {
    const before = toNum(r.percent_share);
    const after = toNum(r.next_percent_share);
    return typeof before === "number" && typeof after === "number" && after > before;
  });

  // 1) รายชื่อผู้ถือหุ้นต่างชาติที่ถือหุ้นเพิ่มขึ้น (ตัดซ้ำตามชื่อ)
  const holderMap = new Map<string, { name: string; note?: string }>();
  for (const r of increased) {
    const name = (r.shareholder_name_th || r.shareholder_name_en || "").trim();
    if (!name) continue;
    if (!holderMap.has(name)) {
      holderMap.set(name, {
        name,
        note: r.nation_en ? ` (${r.nation_en})` : undefined,
      });
    }
  }
  const holders = Array.from(holderMap.values());

  // 2) สัดส่วนก่อน/หลัง (แสดงเป็นลิสต์ต่อผู้ถือหุ้น)
  const pctList = increased.map((r, i) => {
    const name = r.shareholder_name_th || r.shareholder_name_en || `#${i + 1}`;
    const before = toNum(r.percent_share);
    const after = toNum(r.next_percent_share);
    return {
      key: `${name}-${i}`,
      name,
      text: `${before !== undefined ? before : "-"}% → ${after !== undefined ? after : "-" }%`,
    };
  });

  // 3) วันที่มีการเปลี่ยนแปลง: ใช้ next_sh_upd_date เป็นหลัก
  const changeDates = Array.from(
    new Set(increased.map((r) => ymd(r.next_sh_upd_date)).filter(Boolean) as string[])
  ).sort();

  const title = resp?.indicator?.name_th ?? "มีผู้ถือหุ้นต่างชาติรายใดรายหนึ่งถือหุ้นเพิ่มขึ้น";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* ผู้ถือหุ้นต่างชาติที่ถือหุ้นเพิ่มขึ้น */}
      {holders.length > 0 && (
        <DetailSection
          icon={<Users className="h-5 w-5 text-cyan-300" />}
          label="ผู้ถือหุ้นต่างชาติที่ถือหุ้นเพิ่มขึ้น"
        >
          <ul className="list-disc list-inside space-y-1">
            {holders.map((h) => (
              <li key={h.name}>
                {h.name}
                {h.note ? <span className="text-xs text-slate-400">{h.note}</span> : null}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* สัดส่วนการถือหุ้นก่อนและหลังการเปลี่ยนแปลงหุ้น */}
      {pctList.length > 0 && (
        <DetailSection
          icon={<Percent className="h-5 w-5 text-cyan-300" />}
          label="สัดส่วนการถือหุ้นก่อนและหลังการเปลี่ยนแปลงหุ้น"
        >
          <ul className="list-disc list-inside space-y-1">
            {pctList.map((p) => (
              <li key={p.key}>
                {p.name}: {p.text}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* วันที่มีการเปลี่ยนแปลง */}
      {changeDates.length > 0 && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-cyan-300" />}
          label="วันที่มีการเปลี่ยนแปลง"
        >
          <ul className="list-disc list-inside space-y-1">
            {changeDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </DetailSection>
      )}

      {holders.length === 0 && pctList.length === 0 && changeDates.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
