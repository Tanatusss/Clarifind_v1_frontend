// app/company-results/page.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import { Building2, ArrowLeft, ArrowRight, Search } from "lucide-react";
import { toast } from "react-toastify";

import { CosmicBackground as _CosmicBackground } from "@/components/cosmic-background";
import { GradientOrbs as _GradientOrbs } from "@/components/gradient-orbs";
import { GlobeNetwork as _GlobeNetwork } from "@/components/globe-network";

import { useCompanySearch } from "@/hooks/useCompanySearch";
import type { CompanyLite } from "@/lib/companyApi";

// ✅ ลด re-render ของ BG ให้อยู่ที่เดิม
const CosmicBackground = React.memo(_CosmicBackground);
const GradientOrbs = React.memo(_GradientOrbs);
const GlobeNetwork = React.memo(_GlobeNetwork);

/** -------- helpers -------- */
function highlightMatch(text: string | null | undefined, query: string) {
  const t = text ?? "";
  if (!query.trim()) return t;
  const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const m = t.match(new RegExp(safe, "i"));
  if (!m) return t;

  const start = m.index ?? 0;
  const end = start + m[0].length;

  return (
    <>
      {t.slice(0, start)}
      <mark className="bg-yellow-200/60 rounded px-0.5">{t.slice(start, end)}</mark>
      {t.slice(end)}
    </>
  );
}
/** ------------------------- */

const TAKE = 10;

export default function CompanyResultsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const q = (searchParams.get("q") ?? "").trim();
  const pageParam = Number(searchParams.get("page") ?? "1");
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;
  const skip = (page - 1) * TAKE;

  const [localQ, setLocalQ] = useState(q);

  // ✅ ดึงข้อมูลด้วย SWR (cache + keepPreviousData)
  const { data, error, isLoading } = useCompanySearch({ q, skip, take: TAKE });

  const companies: CompanyLite[] = data?.company ?? [];
  const total = data?.total;
  const totalPages = typeof total === "number" ? Math.max(1, Math.ceil(total / TAKE)) : undefined;

  // ✅ heading + total
  const heading = useMemo(() => {
    const base = q ? `ผลการค้นหา: "${q}"` : "ผลการค้นหา";
    if (typeof total === "number") return `${base} (ทั้งหมด ${total.toLocaleString()} รายการ)`;
    return base;
  }, [q, total]);

  // เปลี่ยนหน้าแบบไม่ remount (แค่เปลี่ยน query)
  function goToPage(nextPage: number) {
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set("page", String(nextPage));
    router.replace(`/company-results?${params.toString()}`, { scroll: false });
  }

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nq = localQ.trim();
    if (!nq) return;
    const params = new URLSearchParams();
    params.set("q", nq);
    params.set("page", "1");
    router.replace(`/company-results?${params.toString()}`, { scroll: false });
  }

  function onAnalyze(c: CompanyLite) {
    const reg = c.registration_id || "";
    const analyzingHref = `/analyzing?registration_id=${encodeURIComponent(reg)}`;
    const resultsHref = `/results?registration_id=${encodeURIComponent(reg)}`;
    router.prefetch(analyzingHref);
    router.prefetch(resultsHref);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("CF_LAST_COMPANY", JSON.stringify(c));
    }
    router.push(analyzingHref, { scroll: false });
  }

  const isBusy = isLoading;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background layers */}
      <CosmicBackground />
      <GradientOrbs />
      <GlobeNetwork />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <span className="text-2xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    ClariFind
                  </span>
                </Link>
                <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                  <Link href="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    ย้อนกลับ
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Top loading bar */}
          {isBusy && (
            <div className="h-0.5 w-full bg-white/10">
              <div className="h-0.5 w-1/3 animate-[loadingbar_1.2s_infinite] bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-300" />
              <style jsx>{`
                @keyframes loadingbar {
                  0% {
                    transform: translateX(-100%);
                  }
                  50% {
                    transform: translateX(50%);
                  }
                  100% {
                    transform: translateX(200%);
                  }
                }
              `}</style>
            </div>
          )}
        </header>

        {/* Content */}
        <section className="py-24 px-4 relative">
          {/* overlay ตอนโหลด */}
          {isBusy && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-start justify-center">
              <div className="mt-24 glass-card rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-sm text-white/80 backdrop-blur">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent" />
                  กำลังค้นหา...
                </div>
              </div>
            </div>
          )}

          <div className="container mx-auto max-w-6xl">
            {/* แถบค้นหา */}
            <form onSubmit={onSearchSubmit} className="mb-6" aria-busy={isBusy}>
              <div className="glass-card rounded-2xl border-primary/30 p-2 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
                    <Input
                      placeholder="ค้นหาชื่อบริษัท (TH/EN) หรือกรองคำค้นใหม่..."
                      value={localQ}
                      onChange={(e) => setLocalQ(e.target.value)}
                      disabled={isBusy}
                      className="pl-12 pr-4 py-6 text-lg bg-background/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
                    />
                  </div>
                  <Button size="lg" className="px-6 py-6 text-base" disabled={isBusy}>
                    {isBusy ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-transparent mr-2" />
                        กำลังค้นหา...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-5 w-5" />
                        ค้นหา
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>

            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-semibold">{heading}</h2>
              <Badge variant="secondary" className="glass-card border-primary/30">
                {typeof totalPages === "number" ? `หน้าที่ ${page} จาก ${totalPages}` : `หน้าที่ ${page}`}
              </Badge>
            </div>

            {/* สถานะโหลด / ผิดพลาด / ว่าง */}
            {isLoading && (
              <div className="grid gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="glass-card p-6 rounded-xl animate-pulse border border-border/50 h-24" />
                ))}
              </div>
            )}

            {!isLoading && error && (
              <Card className="glass-card border-red-400/30">
                <CardHeader>
                  <CardTitle className="text-red-400">เกิดข้อผิดพลาด</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    {((error as any)?.status === 404 && "ไม่พบผลลัพธ์") || "เกิดข้อผิดพลาดในการค้นหา"}
                  </CardDescription>
                </CardContent>
              </Card>
            )}

            {!isLoading && !error && companies.length === 0 && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>ไม่พบผลลัพธ์</CardTitle>
                  <CardDescription>ลองแก้คำค้นหรือกรองใหม่อีกครั้ง</CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* รายการบริษัท */}
            {!isLoading && !error && companies.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {companies.map((c) => {
                  const displayName = c.name_th || c.name_en || "-";
                  return (
                    <Card key={`${c.company_id}-${c.registration_id}`} className="glass-card border-primary/20 hover-lift">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <CardTitle className="text-xl flex items-center gap-2">
                              <Building2 className="h-5 w-5 text-primary shrink-0" />
                              <span className="block max-w-full break-words hyphens-auto line-clamp-2" title={displayName}>
                                {highlightMatch(displayName, q)}
                              </span>
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {c.name_en ? (
                                <span className="block text-foreground/70 break-words hyphens-auto line-clamp-1" title={c.name_en}>
                                  {highlightMatch(c.name_en, q)}
                                </span>
                              ) : null}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {c.company_status_th || c.company_status_en || "N/A"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="text-sm text-foreground/70 mb-3">
                          เลขทะเบียน: <span className="font-mono">{c.registration_id || "-"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button onClick={() => onAnalyze(c)} className="px-5" disabled={isBusy}>
                            วิเคราะห์
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && companies.length > 0 && (
              <div className="flex items-center justify-between mt-10">
                <Button variant="outline" disabled={page <= 1 || isBusy} onClick={() => goToPage(page - 1)}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  หน้าก่อนหน้า
                </Button>

                <Button
                  variant="outline"
                  disabled={isBusy ? true : typeof totalPages === "number" ? page >= totalPages : companies.length < TAKE}
                  onClick={() => goToPage(page + 1)}
                >
                  หน้าถัดไป
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
