// src/components/indicators/renderers/H20000.tsx
"use client";

import { CalendarDays, Percent, Users } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";
import { useMemo } from "react";

type Row = {
  shareholder_name_th?: string | null;
  shareholder_name_en?: string | null;
  nation_th?: string | null;
  nation_en?: string | null;
  nationality_group?: "THAI" | "FOREIGN" | "UNKNOWN";
  percent_share?: number | null;
  sh_upd_date?: string | null;
};

export default function H20000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const title = resp?.indicator?.name_th ?? "ผู้ถือหุ้นต่างชาติถือหุ้นครั้งแรก";

  const {
    snapshotDateText,
    totalThaiPct,
    totalForeignPct,
    totalUnknownPct,
    countThai,
    countForeign,
    countUnknown,
  } = useMemo(() => {
    // หา snapshot แรกจากแถวแรก (สมมุติว่าหน่วยบริการฝั่งหลังบ้านส่งมาเรียงแล้ว)
    const firstDate = rows[0]?.sh_upd_date ? new Date(rows[0]!.sh_upd_date!) : null;
    const snapshotDateText = firstDate
      ? firstDate.toISOString().slice(0, 10) // YYYY-MM-DD
      : undefined;

    // ——— Dedupe ก่อนรวมเปอร์เซ็นต์ ———
    // ใช้ key = (ชื่อ EN หรือ TH ถ้า EN ว่าง) + percent_share (fix ทศนิยม)
    const seen = new Set<string>();
    const norm = (s?: string | null) => (s ?? "").trim().replace(/\s+/g, " ").toUpperCase();
    const keyOf = (r: Row) => {
      const name = norm(r.shareholder_name_en) || norm(r.shareholder_name_th);
      const pct = (r.percent_share ?? 0).toFixed(6);
      return `${name}|${pct}`;
    };

    let totalThaiPct = 0;
    let totalForeignPct = 0;
    let totalUnknownPct = 0;
    let countThai = 0;
    let countForeign = 0;
    let countUnknown = 0;

    for (const r of rows) {
      const k = keyOf(r);
      if (seen.has(k)) continue; // ตัดแถวซ้ำ
      seen.add(k);

      const pct = Number(r.percent_share ?? 0);
      const g = r.nationality_group ?? "UNKNOWN";
      if (g === "THAI") {
        totalThaiPct += pct;
        countThai += 1;
      } else if (g === "FOREIGN") {
        totalForeignPct += pct;
        countForeign += 1;
      } else {
        totalUnknownPct += pct;
        countUnknown += 1;
      }
    }

    // ปัดให้ดูง่าย (แต่ยังเก็บค่าจริงเผื่อใช้ต่อ)
    totalThaiPct = Number(totalThaiPct.toFixed(6));
    totalForeignPct = Number(totalForeignPct.toFixed(6));
    totalUnknownPct = Number(totalUnknownPct.toFixed(6));

    return {
      snapshotDateText,
      totalThaiPct,
      totalForeignPct,
      totalUnknownPct,
      countThai,
      countForeign,
      countUnknown,
    };
  }, [rows]);

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* วันที่ snapshot แรก */}
      {snapshotDateText && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-cyan-300" />}
          label="วันที่ใช้คำนวณ (Snapshot แรก)"
        >
          {snapshotDateText}
        </DetailSection>
      )}

      {/* % ต่างชาติรวมครั้งแรก (หลัง dedupe) */}
      <DetailSection
        icon={<Percent className="h-5 w-5 text-cyan-300" />}
        label="สัดส่วนผู้ถือหุ้นต่างชาติ (รวมครั้งแรก)"
      >
        {totalForeignPct}%{/* ตัวอย่างชุดข้อมูลนี้ควรได้ 49.0% หลังตัดซ้ำ */}
      </DetailSection>

      {/* Breakdown นับจำนวนผู้ถือหุ้นตามกลุ่ม + % รวม */}
      <DetailSection
        icon={<Users className="h-5 w-5 text-cyan-300" />}
        label="สรุปตามกลุ่มสัญชาติ"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <div className="rounded-md border border-slate-700/50 p-2">
            <div className="text-slate-400">THAI</div>
            <div className="font-semibold">{countThai} ราย</div>
            <div className="text-slate-400">{totalThaiPct}%</div>
          </div>
          <div className="rounded-md border border-slate-700/50 p-2">
            <div className="text-slate-400">FOREIGN</div>
            <div className="font-semibold">{countForeign} ราย</div>
            <div className="text-slate-400">{totalForeignPct}%</div>
          </div>
          <div className="rounded-md border border-slate-700/50 p-2">
            <div className="text-slate-400">UNKNOWN</div>
            <div className="font-semibold">{countUnknown} ราย</div>
            <div className="text-slate-400">{totalUnknownPct}%</div>
          </div>
        </div>
      </DetailSection>

      {/* ถ้าต้องการตารางรายละเอียดเดิม ให้ render ต่อด้านล่างนี้ได้ตามของคุณ */}
      {/* เช่น: <ShareholderTable rows={rows} /> */}
    </BaseDetailCard>
  );
}
