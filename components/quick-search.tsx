"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Building2, Hash, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-toastify";
import { resolveCompany, suggestCompaniesApi, type CompanyLite } from "@/lib/companyApi";
import { sanitizeForDisplay } from "@/lib/text";

const DEBOUNCE_MS = 450;

export function QuickSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] =
    useState<"company-name" | "registration-number">("registration-number");
  const [isLoading, setIsLoading] = useState(false);

  // autosuggest state
  const [sugs, setSugs] = useState<CompanyLite[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<any>(null);

  const boxRef = useRef<HTMLDivElement>(null);      // wrapper (สร้าง stacking context)
  const inputRef = useRef<HTMLInputElement>(null);  // focus control

  const router = useRouter();
  const { user } = useAuth() as { user: any; token?: string };

  const placeholder = useMemo(() => {
    return `ค้นหา${searchType === "company-name" ? "ชื่อบริษัท" : "เลขทะเบียนนิติบุคคล"}...`;
  }, [searchType]);

  // ปิด suggest เมื่อคลิคนอก
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setShowSug(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Debounce เรียก suggest
  useEffect(() => {
    if (searchType !== "company-name") {
      setSugs([]);
      setShowSug(false);
      return;
    }
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSugs([]);
      setShowSug(false);
      return;
    }

    const qNow = q; // บันทึกคำค้นปัจจุบัน

    timerRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        abortRef.current = new AbortController();

        const res = await suggestCompaniesApi(qNow, { limit: 5, minLen: 2 });
        // ✅ ตรวจว่าผลลัพธ์นี้ยังตรงกับคำค้นปัจจุบัน
        if (qNow === searchQuery.trim()) {
          setSugs(res.suggestions ?? []);
          setShowSug(true);
          setActiveIdx(-1);
        }
      } catch {
        // ignore
      } finally {
        abortRef.current = null;
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [searchQuery, searchType]);

  async function handleSelectSuggestion(item: CompanyLite) {
    if (item.registration_id) {
      const reg = item.registration_id;
      const analyzingHref = `/analyzing?registration_id=${encodeURIComponent(reg)}`;
      const resultsHref = `/results?registration_id=${encodeURIComponent(reg)}`;
      router.prefetch(analyzingHref);
      router.prefetch(resultsHref);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("CF_LAST_COMPANY", JSON.stringify(item));
      }
      setShowSug(false);
      router.push(analyzingHref, { scroll: false });
    } else {
      router.push(`/company-results?q=${encodeURIComponent(item.name_th || item.name_en || "")}`);
    }
  }

  function handleEnterAllResults(q: string) {
    setShowSug(false);
    router.push(`/company-results?q=${encodeURIComponent(q)}`);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return router.push("/login");

    const raw = searchQuery.trim();
    if (!raw) {
      toast.warning("กรุณากรอกคำค้นหา", { theme: "colored" });
      return;
    }

    if (searchType === "company-name") {
      setShowSug(false);
      router.push(`/company-results?q=${encodeURIComponent(raw)}`);
      return;
    }

    // registration number
    const q = raw.replace(/[^\d]/g, "");
    if (!/^\d{8,13}$/.test(q)) {
      toast.warning("รูปแบบเลขทะเบียนไม่ถูกต้อง (ควรเป็นตัวเลข 13 หลัก)", { theme: "colored" });
      return;
    }

    try {
      setIsLoading(true);
      const res = await resolveCompany(q);
      const company = res?.company?.[0];
      if (!company?.registration_id) {
        toast.error("ไม่พบข้อมูลบริษัทนี้", { theme: "colored" });
        return;
      }
      if (typeof window !== "undefined") {
        sessionStorage.setItem("CF_LAST_COMPANY", JSON.stringify(company));
      }
      const analyzingHref = `/analyzing?registration_id=${encodeURIComponent(company.registration_id)}`;
      const resultsHref = `/results?registration_id=${encodeURIComponent(company.registration_id)}`;
      router.prefetch(analyzingHref);
      router.prefetch(resultsHref);
      router.push(analyzingHref, { scroll: false });
    } catch (err: any) {
      console.error(err);
      if (err?.status === 401) {
        toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", { theme: "colored" });
        router.push("/login");
      } else if (err?.status === 404) {
        toast.error("ไม่พบข้อมูลบริษัทนี้", { theme: "colored" });
      } else {
        toast.error("เกิดข้อผิดพลาด ไม่สามารถค้นหาได้", { theme: "colored" });
      }
    } finally {
      setIsLoading(false);
    }
  }

  // keyboard navigation สำหรับรายการ suggest
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSug || sugs.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % sugs.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + sugs.length) % sugs.length);
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && activeIdx < sugs.length) {
        e.preventDefault();
        handleSelectSuggestion(sugs[activeIdx]);
      }
    } else if (e.key === "Escape") {
      setShowSug(false);
    }
  }

  const searchTypes = [
    { id: "company-name" as const, label: "ชื่อบริษัท", icon: Building2, color: "primary" },
    { id: "registration-number" as const, label: "เลขทะเบียนนิติบุคคล", icon: Hash, color: "cyan" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto relative isolate z-[100] overflow-visible" ref={boxRef}>
      {/* ปุ่มเลือกประเภทการค้นหา */}
      <div className="flex justify-center gap-3 mb-6">
        {searchTypes.map((type) => {
          const Icon = type.icon;
          const isActive = searchType === type.id;
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => {
                setSearchType(type.id);
                setSugs([]);
                setShowSug(false);
                setActiveIdx(-1);
                inputRef.current?.focus();
              }}
              className={`glass-card px-6 py-3 rounded-full border transition-all duration-300 flex items-center gap-2 hover-lift ${isActive
                  ? type.color === "cyan"
                    ? "border-cyan-500/50 bg-cyan-500/20 shadow-lg shadow-cyan-500/20"
                    : "border-primary/50 bg-primary/20 shadow-lg shadow-primary/20"
                  : "border-border/30 hover:border-border/50"
                }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? (type.color === "cyan" ? "text-cyan-400" : "text-primary") : "text-foreground/60"}`} />
              <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-foreground/60"}`}>{type.label}</span>
            </button>
          );
        })}
      </div>

      {/* ช่องค้นหา + Suggest */}
      <form onSubmit={handleSearch} className="relative">
        <div className="glass-card rounded-2xl border-primary/30 p-2 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative overflow-visible">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40 pointer-events-none" />
              <Input
                ref={inputRef}
                id="reg-id"
                type="text"
                inputMode={searchType === "registration-number" ? "numeric" : "text"}
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => (searchType === "company-name" && sugs.length > 0) ? setShowSug(true) : null}
                onKeyDown={onKeyDown}
                className="pl-12 pr-4 py-6 text-lg bg-background/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
              />

              {/* Dropdown: จัดชิดซ้ายทั้งหมด */}
              {searchType === "company-name" && showSug && sugs.length > 0 && (
                <div
                  className="absolute left-0 right-0 top-[calc(100%+8px)] z-[9999]
                             rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-2xl
                             !text-left font-[var(--font-ui)] [font-kerning:none] [font-synthesis-weight:none] tracking-normal"
                >
                  <ul className="py-2 max-h-[320px] overflow-auto">
                    {sugs.map((s, idx) => {
                      const label = sanitizeForDisplay(s.name_th || s.name_en || "-");
                      const sub =
                        s.name_en && s.name_th
                          ? sanitizeForDisplay(label === s.name_th ? s.name_en : s.name_th)
                          : "";
                      const active = idx === activeIdx;

                      return (
                        <li
                          key={`${s.company_id}-${s.registration_id}-${idx}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectSuggestion(s)}
                          className={`${active ? "bg-white/10" : "hover:bg-white/5"}`}
                        >
                          {/* ⭐ Grid 3 คอลัมน์: 12px | 1fr | auto — จัดซ้ายด้วย items-start */}
                          <div className="grid grid-cols-[12px_1fr_auto] items-start gap-3 px-4 py-3">
                            <span aria-hidden className="w-[12px] h-[14px] rounded-sm bg-cyan-400/70 block justify-self-start" />
                            <div className="min-w-0 text-left">
                              <div
                                className="text-sm font-medium text-white truncate tracking-normal
                                           [font-kerning:none] [text-rendering:optimizeLegibility]"
                                title={label}
                              >
                                {label}
                              </div>
                              {sub ? (
                                <div
                                  className="text-xs text-white/70 truncate tracking-normal
                                             [font-kerning:none] [text-rendering:optimizeLegibility]"
                                  title={sub}
                                >
                                  {sub}
                                </div>
                              ) : null}
                            </div>
                            {s.registration_id ? (
                              <span className="text-[11px] text-white/60 font-mono tabular-nums justify-self-end">
                                {s.registration_id}
                              </span>
                            ) : (
                              <span />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleEnterAllResults(searchQuery.trim())}
                    className="flex items-center justify-between px-4 py-2 border-t border-white/10 text-xs text-white/80
                               hover:bg-white/5 cursor-pointer rounded-b-xl tracking-normal [font-kerning:none]"
                  >
                    <span>ดูผลลัพธ์ทั้งหมดสำหรับ “{searchQuery.trim()}”</span>
                    <span className="inline-flex items-center gap-1 opacity-80">
                      กด Enter <CornerDownLeft className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="px-8 py-6 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-xl"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  ค้นหา...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" /> ค้นหา
                </>
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-foreground/50 mt-4">
          {!user
            ? "กรุณาเข้าสู่ระบบเพื่อค้นหาและวิเคราะห์ข้อมูล"
            : "ค้นหาและวิเคราะห์ข้อมูลการปฏิบัติตามกฎระเบียบด้วย 23 ตัวบ่งชี้"}
        </p>
      </form>
    </div>
  );
}
