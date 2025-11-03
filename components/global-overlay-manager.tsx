"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LoadingOverlay } from "@/components/LoadingOverlay";

/**
 * จัดการ Overlay ระดับ Global เพื่อให้ overlay ไม่ถูก unmount ตอน route เปลี่ยน
 * และรองรับ event clarifind:analyze-start
 */
export function GlobalOverlayManager() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // ปิด overlay อัตโนมัติเมื่อเข้า /results
  useEffect(() => {
    if (pathname.startsWith("/results")) {
      setOpen(false);
    }
  }, [pathname]);

  // ฟัง event จาก QuickSearch → เปิด overlay
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener("clarifind:analyze-start", show);
    return () => window.removeEventListener("clarifind:analyze-start", show);
  }, []);

  if (!open) return null;
  return <LoadingOverlay open={open} />;
}
