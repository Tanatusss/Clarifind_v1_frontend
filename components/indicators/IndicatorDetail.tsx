"use client";
import { useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useIndicatorDetails } from "@/hooks/useIndicatorDetails";
import { renderDetailByCode } from "./renderer/indexMerge"; 
import type { IndicatorDetailResponse } from "@/lib/indicator-details";

export function IndicatorDetail({
  registration_id,
  code,
}: {
  registration_id: string;
  code: string;
}) {
  const ucode = code.toUpperCase();
  const { getState, ensure } = useIndicatorDetails(registration_id);
  const state = getState(ucode);

  useEffect(() => {
    // โหลดเฉพาะตอนเปิด accordion
    ensure(ucode);
  }, [ucode]);

  if (state.loading) {
    return (
      <div className="mt-3 p-4 rounded-lg border border-white/10 bg-slate-900/40 flex items-center gap-2 text-slate-300">
        <Loader2 className="h-4 w-4 animate-spin" />
        กำลังดึงรายละเอียด…
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="mt-3 p-4 rounded-lg border border-rose-500/30 bg-rose-900/20 text-rose-300 flex gap-2 items-center">
        <AlertTriangle className="h-4 w-4" />
        ไม่สามารถดึงรายละเอียดได้: {state.error}
      </div>
    );
  }

  if (!state.data) return null;

  // ซ่อนถ้าไม่มีข้อมูลจริงๆ
  const hasRows = Array.isArray(state.data?.details?.rows) && state.data.details.rows.length > 0;
  if (!hasRows) return null;

  return renderDetailByCode(ucode, state.data as IndicatorDetailResponse);
}
