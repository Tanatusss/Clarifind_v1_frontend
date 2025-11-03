"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { StepLoadingAnimation } from "@/components/step-loading-animation";

export function LoadingOverlay({ open }: { open: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [targetHref, setTargetHref] = useState<string | null>(null);

  // 🔹 เปิด overlay + ล็อก body scroll
  useEffect(() => {
    if (open) {
      setActive(true);
      document.body.style.overflow = "hidden";
      setTimeout(() => setVisible(true), 20);
    } else {
      setVisible(false);
      const t = setTimeout(() => setActive(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // 🔹 ฟังก์ชันเมื่อจบ step animation
  const handleComplete = () => {
    const regId = (document.querySelector<HTMLInputElement>("#reg-id")?.value || "").trim();
    const href = regId ? `/results?registration_id=${regId}` : "/results";
    setTargetHref(href);

    // ❗ ปิด scroll ทั้งหมด (กันดีด)
    const sc = scrollRef.current;
    if (sc) {
      sc.style.overflow = "hidden";
      sc.style.pointerEvents = "none";
    }

    // 🔸 fade-out overlay ก่อน push (รอ 400ms)
    setVisible(false);
    setTimeout(() => {
      router.push(href);
    }, 400);
  };

  // 🔹 หลังเปลี่ยน route เสร็จ → ปลด scroll body
  useEffect(() => {
    if (!targetHref) return;
    if (pathname.startsWith("/results")) {
      document.body.style.overflow = "";
      setActive(false);
      setTargetHref(null);
    }
  }, [pathname, targetHref]);

  if (!active) return null;

  return (
    <div
      ref={scrollRef}
      className={`fixed inset-0 z-[9999] bg-slate-950 overflow-y-auto transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="min-h-[140vh] py-12">
        <StepLoadingAnimation
          scrollContainerRef={scrollRef}
          preventTopJump
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
