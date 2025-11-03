// src/components/indicators/renderers/S50000.tsx
"use client";

import { Globe2 } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

type Row = {
  nation_th?: string;
  nation_en?: string;
  nof_shareholder?: number | null; // จำนวนผู้ถือหุ้นของสัญชาตินี้ (ต่อแถว)
  sh_upd_date?: string | null;
  // meta อื่น ๆ ไม่ใช้ในหน้าตรงนี้
};

export default function S50000({ resp }: { resp: IndicatorDetailResponse }) {
  const rows: Row[] = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];

  // รวมจำนวนผู้ถือหุ้นต่อสัญชาติ
  const byNation = new Map<string, { label: string; count: number }>();
  for (const r of rows) {
    const label = (r.nation_th || r.nation_en || "").trim();
    if (!label) continue;

    const add = typeof r.nof_shareholder === "number" && Number.isFinite(r.nof_shareholder)
      ? r.nof_shareholder
      : 1; // fallback: ไม่ส่งจำนวนมาก็คิดเป็น 1

    if (!byNation.has(label)) {
      byNation.set(label, { label, count: add });
    } else {
      byNation.get(label)!.count += add;
    }
  }

  // แปลงเป็นอาเรย์ + เรียงตามชื่อสัญชาติ (TH/EN)
  const nations = Array.from(byNation.values()).sort((a, b) =>
    a.label.localeCompare(b.label, "th")
  );

  const title = resp?.indicator?.name_th ?? "จำนวนผู้ถือหุ้นต่างชาติแยกตามสัญชาติ (ล่าสุด)";

  return (
    <BaseDetailCard title={title} tone="cyan">
      {nations.length > 0 ? (
        <DetailSection
          icon={<Globe2 className="h-5 w-5 text-cyan-300" />}
          label="จำนวนของแต่ละสัญชาติของผู้ถือหุ้นล่าสุด"
        >
          <ul className="list-disc list-inside space-y-1">
            {nations.map((n) => (
              <li key={n.label}>
                {n.label} — {n.count.toLocaleString()} คน
              </li>
            ))}
          </ul>
        </DetailSection>
      ) : (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
