// src/components/LoadingOverlay.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { StepLoadingAnimation } from "@/components/step-loading-animation";

export function LoadingOverlay({ open }: { open: boolean }) {
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => setMounted(true), []);

  // ✅ ล็อคสกรอลของ body ตอน overlay เปิด
  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return (
    <div
      ref={scrollRef}
      className="
        fixed inset-0 z-[9999]
        bg-slate-950   /* ✅ ทึบ ไม่เห็นหน้าแรกซ้อน */
        overflow-y-auto
      "
    >
      {/* ให้เนื้อหาสูงพอสำหรับ auto-scroll */}
      <div className="min-h-[140vh] py-12">
        <StepLoadingAnimation
          scrollContainerRef={scrollRef}  // ✅ ให้เลื่อนใน overlay เอง
          autoScrollOffset={140}          // เว้นระยะ top เผื่อ header
        />
      </div>
    </div>
  );
}
