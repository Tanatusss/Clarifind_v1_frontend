// src/components/indicators/renderers/D40000.tsx
"use client";

import { Globe, Landmark } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  nof_director?: number;                // จำนวนกรรมการทั้งหมด
  nof_fr_director_auth_power?: number;  // จำนวน "ต่างชาติที่มีอำนาจลงนาม"
  director_name_th?: string;
  director_name_en?: string;
  nation_th?: string;
  nation_en?: string;
};

export default function D40000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const first = rows[0] ?? {};

  const totalDirectors =
    typeof first.nof_director === "number" ? first.nof_director : undefined;

  const foreignWithPower =
    typeof first.nof_fr_director_auth_power === "number"
      ? first.nof_fr_director_auth_power
      : undefined;

  // รวมรายชื่อกรรมการ + สัญชาติ (ตัดซ้ำ)
  const dirMap = new Map<
    string,
    { th?: string; en?: string; nation_th?: string; nation_en?: string }
  >();
  for (const r of rows) {
    const key = (r.director_name_th || r.director_name_en || "").trim();
    if (!key) continue;
    if (!dirMap.has(key)) {
      dirMap.set(key, {
        th: r.director_name_th,
        en: r.director_name_en,
        nation_th: r.nation_th,
        nation_en: r.nation_en,
      });
    }
  }
  const directors = Array.from(dirMap.values());

  const title =
    resp?.indicator?.name_th ??
    "บุคคลต่างชาติเป็นกรรมการและมีอำนาจลงนาม ≥ กึ่งหนึ่งของกรรมการทั้งหมด";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {/* จำนวนกรรมการทั้งหมด */}
      {typeof totalDirectors === "number" && (
        <DetailSection
          icon={<Landmark className="h-5 w-5 text-lime-300" />}
          label="จำนวนกรรมการทั้งหมด"
        >
          {totalDirectors.toLocaleString()} คน
        </DetailSection>
      )}

      {/* จำนวน 'ต่างชาติที่มีอำนาจลงนาม' */}
      {typeof foreignWithPower === "number" && (
        <DetailSection
          icon={<Globe className="h-5 w-5 text-lime-300" />}
          label="ต่างชาติที่มีอำนาจลงนาม"
        >
          {foreignWithPower.toLocaleString()} คน
        </DetailSection>
      )}

      {/* รายชื่อกรรมการ + สัญชาติ */}
      {directors.length > 0 && (
        <DetailSection
          icon={<Globe className="h-5 w-5 text-lime-300" />}
          label="สัญชาติและการมีอำนาจลงนามของกรรมการชุดปัจจุบัน"
        >
          <ul className="list-disc list-inside space-y-1">
            {directors.map((d, i) => (
              <li key={i}>
                {d.th || d.en}
                {d.th && d.en && d.en !== d.th ? (
                  <span className="text-xs text-slate-400"> — {d.en}</span>
                ) : null}
                {(d.nation_th || d.nation_en) && (
                  <span className="text-xs text-slate-400">
                    {" "}
                    • {d.nation_th || d.nation_en}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </DetailSection>
      )}

      {typeof totalDirectors !== "number" &&
        typeof foreignWithPower !== "number" &&
        directors.length === 0 && (
          <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
        )}
    </BaseDetailCard>
  );
}
