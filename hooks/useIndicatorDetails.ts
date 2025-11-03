// src/hooks/useIndicatorDetails.ts
"use client";
import { useEffect, useRef, useState } from "react";
import type { IndicatorDetailResponse } from "@/lib/indicator-details";
import { fetchIndicatorDetails } from "@/lib/indicator-details";

type State = {
  loading: boolean;
  error: string | null;
  data: IndicatorDetailResponse | null;
};

export function useIndicatorDetails(registration_id: string) {
  // แคชในหน้านี้ (ต่อ code)
  const cacheRef = useRef<Map<string, IndicatorDetailResponse>>(new Map());

  const load = async (code: string): Promise<State> => {
    const key = code.toUpperCase();
    if (cacheRef.current.has(key)) {
      return { loading: false, error: null, data: cacheRef.current.get(key)! };
    }
    try {
      const data = await fetchIndicatorDetails(registration_id, key);
      cacheRef.current.set(key, data);
      return { loading: false, error: null, data };
    } catch (e: any) {
      return { loading: false, error: e?.message || "load failed", data: null };
    }
  };

  // helper ให้ component ขอโหลดแบบ “lazy”
  const [states, setStates] = useState<Record<string, State>>({});
  const ensure = async (code: string) => {
    const k = code.toUpperCase();
    if (states[k]?.data || states[k]?.loading) return;
    setStates((s) => ({ ...s, [k]: { loading: true, error: null, data: null } }));
    const next = await load(k);
    setStates((s) => ({ ...s, [k]: next }));
  };

  return {
    getState: (code: string): State => states[code.toUpperCase()] ?? { loading: false, error: null, data: null },
    ensure, // เรียกตอน accordion เปิด
  };
}
