// app/analyzing/page.tsx
"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { StepLoadingAnimation } from "@/components/step-loading-animation";

export default function AnalyzingPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const regId = sp.get("registration_id")?.trim() ?? "";

  const resultsHref = useMemo(() => {
    return regId
      ? `/results?registration_id=${encodeURIComponent(regId)}`
      : `/results`;
  }, [regId]);

  useEffect(() => {
    // ถ้าไม่มี regId ให้เด้งกลับหน้าแรก
    if (!regId) {
      router.replace("/");
      return;
    }
    // อุ่นหน้า results ให้พร้อม
    router.prefetch(resultsHref);
    // ถ้ามี prefetch data function ก็เรียกได้ เช่น:
    // prefetchSummary(regId).catch(() => {});
  }, [regId, resultsHref, router]);

  const handleComplete = () => {
    // ไปผลลัพธ์ด้วย replace เพื่อไม่ย้อนมาหน้านี้
    router.replace(resultsHref, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <StepLoadingAnimation onComplete={handleComplete} />
    </div>
  );
}
