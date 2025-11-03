"use client";
import { Building2, MapPin } from "lucide-react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard"; 
import { DetailSection } from "../DetailSection"; 

export function AD10000({ resp }: { resp: IndicatorDetailResponse }) {
  const row = resp.details?.rows?.[0] ?? {};
  const companies: Array<{
    company_id: number;
    registration_id: string;
    name_th?: string;
    name_en?: string;
  }> = Array.isArray(row?.sample_companies) ? row.sample_companies : [];

  return (
    <BaseDetailCard title="รายละเอียดที่อยู่ซ้ำกัน:" tone="rose">
      {(row.address_th || row.address_en) && (
        <DetailSection icon={<MapPin className="h-5 w-5 text-rose-300" />} label="ที่อยู่:">
          {row.address_th || row.address_en}
        </DetailSection>
      )}

      {"dup_companies" in row && (
        <DetailSection label="จำนวนบริษัทที่ใช้ที่อยู่เดียวกัน:">
          {Number(row.dup_companies).toLocaleString()} บริษัท
        </DetailSection>
      )}

      {companies.length > 0 && (
        <div className="mt-4">
          <div className="font-semibold text-rose-200 mb-2">รายชื่อบริษัทที่มีที่อยู่ซ้ำกัน (ตัวอย่าง 5 บริษัท):</div>
          <div className="max-h-64 overflow-auto pr-1">
            <ol className="space-y-2 list-decimal list-inside">
              {companies.map((c) => (
                <li key={c.company_id} className="bg-rose-900/20 border border-rose-500/20 rounded-lg px-3 py-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="h-4 w-4 mt-0.5 text-rose-300" />
                    <div>
                      <div className="text-slate-100">{c.name_th || c.name_en || c.registration_id}</div>
                      <div className="text-xs text-slate-400">{c.registration_id}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </BaseDetailCard>
  );
}
