
"use client"; 

import { apiFetch } from "@/lib/api"; // ใช้ตัวนี้เพื่อใส่ Bearer ให้อัตโนมัติ

export type IndicatorDetailResponse = {
  company: {
    company_id: number;
    registration_id: string;
    name_th?: string | null;
    name_en?: string | null;
  };
  indicator: {
    code: string; // e.g. AD10000
    name_th?: string | null;
    name_en?: string | null;
  };
  details: {
    rows: any[];
    columns: { key: string; label: string }[];
    pagination?: { total: number; take: number; skip: number };
  };
  meta?: Record<string, any>;
};

export async function fetchIndicatorDetails(registration_id: string, code: string) {
  // ❗ใช้ path เปล่า แล้วให้ apiFetch เติม BASE + Authorization ให้เอง
  const path =
    `/v1/indicator/details?registration_id=${encodeURIComponent(registration_id)}` +
    `&code=${encodeURIComponent(code.toUpperCase())}`;

  // ✅ apiFetch จะอ่าน NEXT_PUBLIC_API_BASE และ cf_token ให้อัตโนมัติ
  return apiFetch<IndicatorDetailResponse>(path);
}
