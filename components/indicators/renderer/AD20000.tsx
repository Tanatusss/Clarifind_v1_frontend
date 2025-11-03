// src/components/indicators/renderers/AD20000.tsx
"use client";
import { BriefcaseBusiness, MapPin, Hash } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard";
import { DetailSection } from "../DetailSection";

export default function AD20000({ resp }: { resp: IndicatorDetailResponse }) {
  const row = resp.details?.rows?.[0] ?? {};

  const companies: Array<{
    company_id: number;
    registration_id: string;
    name_th?: string;
    name_en?: string;
  }> = Array.isArray(row.sample_companies) ? row.sample_companies : [];

  const address = row.address_th || row.address_en;
  const dupCount: number | undefined =
    typeof row.dup_companies === "number" ? row.dup_companies : undefined;

  return (
    <BaseDetailCard title="เป็นที่อยู่เดียวกับสำนักงานบัญชีหรือกฎหมาย" tone="cyan">
      {address && (
        <DetailSection icon={<MapPin className="h-5 w-5 text-cyan-300" />} label="ที่อยู่บริษัท">
          {address}
        </DetailSection>
      )}

      {dupCount !== undefined && (
        <DetailSection icon={<Hash className="h-5 w-5 text-cyan-300" />} label="จำนวนบริษัทที่ใช้ที่อยู่เดียวกัน (เฉพาะบัญชี/กฎหมาย)">
          {dupCount.toLocaleString()} บริษัท
        </DetailSection>
      )}

      {companies.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold text-cyan-200 mb-2">
            ตัวอย่างบริษัทที่ที่อยู่ซ้ำกัน (ไม่เกิน 5 บริษัท)
          </div>
          <ol className="space-y-2 list-decimal list-inside max-h-64 overflow-auto pr-1">
            {companies.map((c) => (
              <li
                key={c.company_id}
                className="bg-cyan-900/20 border border-cyan-500/20 rounded-lg px-3 py-2"
              >
                <div className="flex items-start gap-2">
                  <BriefcaseBusiness className="h-4 w-4 mt-0.5 text-cyan-300" />
                  <div>
                    <div className="text-slate-100">
                      {c.name_th || c.name_en || c.registration_id}
                    </div>
                    <div className="text-xs text-slate-400">{c.registration_id}</div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {!address && dupCount === undefined && companies.length === 0 && (
        <div className="text-slate-400">ไม่มีข้อมูลรายละเอียด</div>
      )}
    </BaseDetailCard>
  );
}
