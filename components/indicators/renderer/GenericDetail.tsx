"use client";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { BaseDetailCard } from "../BaseDetailCard"; 

export function GenericDetail({ resp }: { resp: IndicatorDetailResponse }) {
  const rows = Array.isArray(resp?.details?.rows) ? resp.details.rows : [];
  const cols = Array.isArray(resp?.details?.columns) ? resp.details.columns : [];

  if (rows.length === 0 || cols.length === 0) {
    return (
      <BaseDetailCard title="รายละเอียดเพิ่มเติม" tone="amber">
        <div className="text-slate-300">ไม่มีข้อมูลรายละเอียด</div>
      </BaseDetailCard>
    );
  }

  return (
    <BaseDetailCard title="รายละเอียดเพิ่มเติม" tone="amber">
      <div className="overflow-auto rounded-lg border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-white/5 text-slate-300">
            <tr>
              {cols.map(c => (
                <th key={c.key} className="px-3 py-2 text-left font-medium">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((r, idx) => (
              <tr key={idx} className="hover:bg-white/5">
                {cols.map(c => (
                  <td key={c.key} className="px-3 py-2 text-slate-200">
                    {renderCell(r[c.key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </BaseDetailCard>
  );
}

function renderCell(v: any) {
  if (v == null) return "—";
  if (Array.isArray(v)) return JSON.stringify(v, null, 0);
  if (typeof v === "object") return JSON.stringify(v, null, 0);
  return String(v);
}
