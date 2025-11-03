// src/components/indicators/renderers/AU10000.tsx
"use client";

import { BadgeCheck, CalendarDays, Users } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

export default function AU10000({ resp }: { resp: IndicatorDetailResponse }) {
  const row = resp?.details?.rows?.[0] ?? {};

  // === map fields from backend ===
  const auditor: string | undefined = row.audit_name_th || row.audit_name_en;
  const fiscalYear: number | undefined =
    typeof row.year_fs === "number" ? row.year_fs : undefined;
  const sameAuditorCount: number | undefined =
    typeof row.audit_nof_com_51_49 === "number" ? row.audit_nof_com_51_49 : undefined;

  // ใช้ชื่ออินดิเคเตอร์จากหลังบ้าน ถ้ามีก็โชว์เลย
  const title =
    resp?.indicator?.name_th ??
    "บริษัทที่มีผู้ตรวจสอบบัญชีเดียวกันกับอีก 50 บริษัทขึ้นไป (สัดส่วนผู้ถือหุ้น 51:49)";

  return (
    <BaseDetailCard title={title} tone="rose">
      {/* ผู้ตรวจสอบบัญชี */}
      {auditor && (
        <DetailSection
          icon={<BadgeCheck className="h-5 w-5 text-violet-300" />}
          label="ผู้ตรวจสอบบัญชี"
        >
          {auditor}
        </DetailSection>
      )}

      {/* ปีงบการเงินล่าสุดที่ผู้ตรวจสอบบัญชีรับรอง */}
      {fiscalYear !== undefined && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-violet-300" />}
          label="ปีงบการเงินล่าสุดที่ผู้ตรวจสอบบัญชีรับรอง"
        >
          {fiscalYear}
        </DetailSection>
      )}

      {/* จำนวนบริษัท 51:49 ที่ใช้ผู้สอบคนเดียวกัน */}
      {sameAuditorCount !== undefined && (
        <DetailSection
          icon={<Users className="h-5 w-5 text-violet-300" />}
          label="จำนวนบริษัทที่มีผู้ถือหุ้นไทย:ต่างชาติ สัดส่วน 51:49 และใช้ผู้ตรวจสอบบัญชี/ปีงบเดียวกัน"
        >
          {sameAuditorCount.toLocaleString()} บริษัท
        </DetailSection>
      )}

      {!auditor && fiscalYear === undefined && sameAuditorCount === undefined && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
