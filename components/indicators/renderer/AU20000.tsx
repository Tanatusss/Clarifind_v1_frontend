// src/components/indicators/renderers/AU20000.tsx
"use client";

import { BadgeCheck, CalendarDays, Users } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

export default function AU20000({ resp }: { resp: IndicatorDetailResponse }) {
  const row = resp?.details?.rows?.[0] ?? {};

  // === map fields from backend ===
  const auditor: string | undefined = row.audit_name_th || row.audit_name_en;
  const fiscalYear: number | undefined =
    typeof row.year_fs === "number" ? row.year_fs : undefined;
  const circularCount: number | undefined =
    typeof row.audit_nof_com_circular === "number" ? row.audit_nof_com_circular : undefined;

  // ใช้ชื่ออินดิเคเตอร์จากหลังบ้าน ถ้ามีก็ใช้เลย
  const title =
    resp?.indicator?.name_th ??
    "บริษัทที่มีผู้ตรวจสอบบัญชีเดียวกันกับบริษัทที่มีรูปแบบการถือหุ้น Circular Ownership";

  return (
    <BaseDetailCard title={title} tone="rose">
      {/* ผู้ตรวจสอบบัญชี */}
      {auditor && (
        <DetailSection
          icon={<BadgeCheck className="h-5 w-5 text-rose-300" />}
          label="ผู้ตรวจสอบบัญชี"
        >
          {auditor}
        </DetailSection>
      )}

      {/* ปีงบการเงินล่าสุดที่ผู้ตรวจสอบบัญชีรับรอง */}
      {fiscalYear !== undefined && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-rose-300" />}
          label="ปีงบการเงินล่าสุดที่ผู้ตรวจสอบบัญชีรับรอง"
        >
          {fiscalYear}
        </DetailSection>
      )}

      {/* จำนวนบริษัท Circular Ownership ที่ใช้ผู้สอบ/ปีงบเดียวกัน */}
      {circularCount !== undefined && (
        <DetailSection
          icon={<Users className="h-5 w-5 text-rose-300" />}
          label="จำนวนบริษัทที่มีการถือหุ้นรูปแบบ Circular Ownership และใช้ผู้ตรวจสอบบัญชี/ปีงบเดียวกัน"
        >
          {circularCount.toLocaleString()} บริษัท
        </DetailSection>
      )}

      {!auditor && fiscalYear === undefined && circularCount === undefined && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
