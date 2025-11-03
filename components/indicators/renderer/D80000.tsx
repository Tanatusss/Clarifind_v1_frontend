// src/components/indicators/renderers/D80000.tsx
"use client";

import { Timer, CalendarDays, Building2 } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  id?: number | string;
  company_id?: number | string;
  nof_com?: number; // อาจอยู่ในแถวแรกเป็นสรุปจำนวนทั้งหมด
  company_id_detail?: number | string;
  regist_date?: string | null; // วันที่จดทะเบียนบริษัท
  status_date?: string | null; // วันที่สถานะเลิกกิจการ
  company_status_th?: string | null;
  company_status_en?: string | null;
  diff_day?: number | null; // จำนวนวันระหว่างจดทะเบียน -> เลิกกิจการ
  rec_status?: number | null;
  rec_create_when?: string | null;
  rec_create_by?: string | null;
  rec_update_when?: string | null;
  rec_update_by?: string | null;
};

function toYMD(raw?: string | null) {
  if (!raw) return undefined;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? undefined : d.toISOString().slice(0, 10); // YYYY-MM-DD
}

export default function D80000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const first = rows[0] ?? {};

  // เงื่อนไขคุณสมบัติ: ดำเนินกิจการ < 1 ปี และเลิกกิจการแล้ว
  // ใช้ diff_day < 365 และมี status_date (ถือว่าเลิกแล้ว); ถ้าไม่มี diff_day จะไม่ถูกนับ
  const QUALIFIED = rows.filter((r) => {
    const days = typeof r.diff_day === "number" ? r.diff_day : undefined;
    const dissolved = !!toYMD(r.status_date);
    return dissolved && typeof days === "number" && days < 365;
  });

  // 1) จำนวนบริษัท: ใช้ค่า nof_com จากแถวแรกถ้ามี ไม่งั้นนับบริษัทที่เข้าเงื่อนไขแบบ unique
  const countFromFirst =
    typeof first.nof_com === "number" ? first.nof_com : undefined;

  const uniqueQualifiedCompanies = Array.from(
    new Set(
      QUALIFIED.map(
        (r) =>
          String(r.company_id_detail ?? "") ||
          `${toYMD(r.regist_date) ?? "NA"}-${toYMD(r.status_date) ?? "NA"}`
      )
    )
  );

  const countUnder1Year =
    typeof countFromFirst === "number" ? countFromFirst : uniqueQualifiedCompanies.length;

  // 2) วันที่จดทะเบียนบริษัท (จาก regist_date ของรายการที่เข้าเงื่อนไข) ตัดซ้ำ + เรียง
  const registrationDates = Array.from(
    new Set(QUALIFIED.map((r) => toYMD(r.regist_date)).filter(Boolean) as string[])
  ).sort();

  // 3) รายชื่อบริษัทที่เคยจดทะเบียน "ในปีเดียวกัน"
  // สรุปเป็น ปี -> รายการบริษัท (ใช้ company_id_detail เป็นกุญแจหลัก)
  const yearToCompanies = new Map<
    number,
    Array<{ id?: number | string; registeredAt?: string }>
  >();

  for (const r of QUALIFIED) {
    const d = toYMD(r.regist_date);
    if (!d) continue;
    const year = new Date(d).getUTCFullYear();
    if (!yearToCompanies.has(year)) yearToCompanies.set(year, []);
    // กันซ้ำภายในปีด้วย id
    const arr = yearToCompanies.get(year)!;
    const key = String(r.company_id_detail ?? "");
    if (!arr.some((x) => String(x.id ?? "") === key)) {
      arr.push({ id: r.company_id_detail, registeredAt: d });
    }
  }

  const yearBuckets = Array.from(yearToCompanies.entries()).sort(
    (a, b) => a[0] - b[0]
  );

  const title =
    resp?.indicator?.name_th ??
    "กรรมการชุดปัจจุบัน เคยดำเนินกิจการ < 1 ปี และปัจจุบันเลิกกิจการแล้ว";

  return (
    <BaseDetailCard title={title} tone="purple">
      {/* จำนวนบริษัทที่กรรมการชุดปัจจุบัน เคยดำเนินกิจการน้อยกว่า 1 ปี และปัจจุบันจดทะเบียนเลิกกิจการไปแล้ว */}
      {typeof countUnder1Year === "number" && (
        <DetailSection
          icon={<Timer className="h-5 w-5 text-lime-300" />}
          label="จำนวนบริษัทที่กรรมการชุดปัจจุบัน เคยดำเนินกิจการน้อยกว่า 1 ปี และปัจจุบันจดทะเบียนเลิกกิจการไปแล้ว"
        >
          {countUnder1Year.toLocaleString()} บริษัท
        </DetailSection>
      )}

      {/* วันที่กรรมการชุดปัจจุบัน เคยจดทะเบียนบริษัท */}
      {registrationDates.length > 0 && (
        <DetailSection
          icon={<CalendarDays className="h-5 w-5 text-lime-300" />}
          label="วันที่กรรมการชุดปัจจุบัน เคยจดทะเบียนบริษัท"
        >
          <ul className="list-disc list-inside space-y-1">
            {registrationDates.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </DetailSection>
      )}

      {/* บริษัทที่เคยจดทะเบียนบริษัทในปีเดียวกัน */}
      {yearBuckets.length > 0 && (
        <DetailSection
          icon={<Building2 className="h-5 w-5 text-lime-300" />}
          label="บริษัทที่เคยจดทะเบียนบริษัทในปีเดียวกัน"
        >
          <div className="space-y-2">
            {yearBuckets.map(([year, list]) => (
              <div key={year}>
                <div className="font-medium text-slate-200 mb-1">{year}</div>
                <ul className="list-disc list-inside space-y-1">
                  {list.map((c, i) => (
                    <li key={`${c.id ?? `${year}-${i}`}`}>
                      {/* ตอนนี้ไม่มีชื่อ/เลขทะเบียนจากสคีมาที่ให้มา จึงแสดงเป็น ID + วันที่ */}
                      {c.id ?? "Unknown Company"}{" "}
                      {c.registeredAt ? (
                        <span className="text-xs text-slate-400">— {c.registeredAt}</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DetailSection>
      )}

      {typeof countUnder1Year !== "number" &&
        registrationDates.length === 0 &&
        yearBuckets.length === 0 && (
          <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
        )}
    </BaseDetailCard>
  );
}
