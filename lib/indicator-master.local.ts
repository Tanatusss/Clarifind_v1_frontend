// src/lib/indicator-master.local.ts
export const INDICATOR_META: Record<
  string,
  { nameTh: string; nameEn: string; category: string }
> = {
  I001: {
    nameTh: "จำนวนที่อยู่จดทะเบียนซ้ำกับบริษัทอื่น 5 บริษัทขึ้นไป",
    nameEn: "Duplicate Address (5+ companies)",
    category: "shared-resources",
  },
  I002: {
    nameTh: "ผู้ตรวจสอบบัญชีเกี่ยวข้องกับบริษัทถือหุ้นไขว้",
    nameEn: "Auditor Independence",
    category: "governance",
  },
  I003: {
    nameTh: "Circular Ownership",
    nameEn: "Circular Ownership Detected",
    category: "shareholding-pattern",
  },
  // … เพิ่มครบ 23 ตัวได้ภายหลัง
}
