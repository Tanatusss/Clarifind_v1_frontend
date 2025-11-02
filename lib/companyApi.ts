// src/lib/company-api.ts
import { apiFetch } from "./api";

export function resolveCompany(registration_id: string) {
  // apiFetch จะแนบ Authorization: Bearer <token> ให้อัตโนมัติจาก localStorage
  return apiFetch(
    `/v1/company/resolve?registration_id=${encodeURIComponent(registration_id)}`
  );
}
