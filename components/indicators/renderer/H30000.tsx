// src/components/indicators/renderers/H30000.tsx
"use client";

import { CalendarDays, Percent } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  sh_upd_date?: string | null;     // วันที่ก่อน
  next_sh_upd_date?: string | null;// วันที่หลัง (ถ้ามี)
  bf_pct_fr?: string | number;     // % ต่างชาติ ก่อน
  next_pct_fr?: string | number;   // % ต่างชาติ หลัง
  bf_pct_th?: string | number;     // (มีมาแต่เราไม่ใช้แสดง)
  next_pct_th?: string | number;   // (มีมาแต่เราไม่ใช้แสดง)
};

function yearFrom(dateStr?: string | null): number | undefined {
  if (!dateStr) return undefined;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d.getUTCFullYear();
}

function toNum(v: unknown): number | undefined {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }
  return undefined;
}

export default function H30000({ resp }: { resp: IndicatorDetailResponse }) {
  const row: Row = (resp?.details?.rows?.[0] as Row) ?? {};

  // 1) ปีที่มีการเปลี่ยนแปลงเพิ่มขึ้น (prefer sh_upd_date -> next_sh_upd_date)
  const changedYear = yearFrom(row.sh_upd_date) ?? yearFrom(row.next_sh_upd_date);

  // 2) สัดส่วนต่างชาติ ก่อน/หลัง
  const pctBefore = toNum(row.bf_pct_fr);
  const pctAfter = toNum(row.next_pct_fr);

  const title =
    resp?.indicator?.name_th ??
    "ผู้ถือหุ้นต่างชาติเคย ≤49% และเพิ่มขึ้น >49%";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* ปีที่เกิดการเปลี่ยนแปลง */}
      {changedYear !== undefined && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-cyan-300" />}
          label="ปีที่ผู้ถือหุ้นต่างชาติเพิ่มจาก ≤49% เป็น >49%"
        >
          {changedYear}
        </DetailSection>
      )}

      {/* สัดส่วนการถือหุ้นต่างชาติรวม ก่อน/หลัง */}
      {(pctBefore !== undefined || pctAfter !== undefined) ? (
        <DetailSection
          icon={<Percent className="h-5 w-5 text-cyan-300" />}
          label="สัดส่วนการถือหุ้นต่างชาติรวม (ก่อน / หลัง)"
        >
          {pctBefore !== undefined ? `${pctBefore}%` : "-"} / {pctAfter !== undefined ? `${pctAfter}%` : "-"}
        </DetailSection>
      ) : null}

      {changedYear === undefined && pctBefore === undefined && pctAfter === undefined && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
