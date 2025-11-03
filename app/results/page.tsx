// app/results/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";

import { CosmicBackground } from "@/components/cosmic-background";
import { GradientOrbs } from "@/components/gradient-orbs";
import { GlobeNetwork } from "@/components/globe-network";
import { StepLoadingAnimation } from "@/components/step-loading-animation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  ArrowLeft,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Circle,
  Shield,
  AlertTriangle,
  DollarSign,
  Home,
  Scale,
  Globe,
  Crown,
  Users,
} from "lucide-react";

// ใช้ endpoint จริง
import { resolveCompany } from "@/lib/companyApi";
import {
  fetchIndicatorSummary,
  readPrefetchedSummary,
  clearPrefetchedSummary,
  IndicatorSummary,
} from "@/lib/indicator-api";
import { IndicatorDetail } from "@/components/indicators/IndicatorDetail";

// กล่องไอคอนมาตรฐาน: บังคับ svg ข้างในให้ h-5 w-5 เสมอ
const IconBox = ({
  children,
  colorClass = "text-slate-300", // ตั้งสีที่นี่ (ไอคอนใช้ currentColor)
  bgClass = "bg-white/5",
}: {
  children: React.ReactNode;
  colorClass?: string;
  bgClass?: string;
}) => (
  <div
    className={`w-6 h-6 grid place-items-center rounded-md ${bgClass} ${colorClass}
                [&>svg]:h-5 [&>svg]:w-5 [&>svg]:stroke-current`}
  >
    {children}
  </div>
);

/** 🔧 FIX ขนาดไอคอนให้เท่ากันเสมอ */
const UniformIcon = ({ Icon, className = "" }: { Icon: any; className?: string }) => (
  <div className="w-5 h-5 flex items-center justify-center">
    {/* กำหนด h-4 w-4 และ normalize stroke เพื่อให้ทุกอันเท่ากัน */}
    <Icon className={`h-4 w-4 stroke-[1.5] ${className}`} />
  </div>
);

/* ---------------- Types/Maps ---------------- */
type CategoryId =
  | "shared-resources"
  | "foreigner-control"
  | "directorship-pattern"
  | "shareholding-patterns"
  | "financial-indicators"
  | "high-risk-industry";

type NormalizedIndicator = {
  id: number;
  code: string;
  name: string;
  nameEn: string;
  status: "pass" | "fail";
  category: "Ownership" | "Governance" | "Compliance" | "Risk" | "Financial" | "Assets";
  description?: string;
  details?: any;
  _categoryKey: CategoryId;
};

const codeToCategoryKey: Record<string, CategoryId> = {
  // Shared resources
  ad10000: "shared-resources",
  ad20000: "shared-resources",
  au10000: "shared-resources",
  au20000: "shared-resources",

  // Shareholding patterns (เพิ่ม C10000)
  c10000: "shareholding-patterns",
  h20000: "shareholding-patterns",
  h30000: "shareholding-patterns",
  h40000: "shareholding-patterns",
  h70000: "shareholding-patterns",
  s20000: "shareholding-patterns",
  s30000: "shareholding-patterns",
  u30000: "shareholding-patterns",

  // Directorship pattern
  d10000: "directorship-pattern",
  d60000: "directorship-pattern",
  d70000: "directorship-pattern",
  d80000: "directorship-pattern",

  // Foreigner control
  d40000: "foreigner-control",
  s50000: "foreigner-control",
  u10000: "foreigner-control",

  // Financial
  f10000: "financial-indicators",

  // High risk industry
  i10000: "high-risk-industry",
  i20000: "high-risk-industry",
  i30000: "high-risk-industry",
};

const codesWithDetails = new Set<string>([
  "ad10000", "ad20000", "au10000", "au20000", "c10000", "d10000", "d40000", "d60000", "d70000",
  "d80000", "f10000", "h20000", "h30000", "h40000", "h70000", "i10000", "i20000", "i30000",
  "s20000", "s30000", "s50000", "u10000", "u30000",
]);

const categoryOrder: CategoryId[] = [
  "shared-resources",
  "foreigner-control",
  "directorship-pattern",
  "shareholding-patterns",
  "financial-indicators",
  "high-risk-industry",
];

const categories = [
  { id: "shared-resources" as const, name: "Shared Resources", nameTh: "ทรัพยากรที่ใช้ร่วมกัน", icon: Users, color: "text-blue-400", bgColor: "bg-blue-500/10", borderColor: "border-blue-500/30" },
  { id: "foreigner-control" as const, name: "Foreigner Control", nameTh: "การควบคุมโดยต่างชาติ", icon: Globe, color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/30" },
  { id: "directorship-pattern" as const, name: "Directorship Pattern", nameTh: "รูปแบบกรรมการ", icon: Crown, color: "text-purple-400", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
  { id: "shareholding-patterns" as const, name: "Shareholding Patterns", nameTh: "รูปแบบการถือหุ้น", icon: Building2, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/30" },
  { id: "financial-indicators" as const, name: "Financial Indicators", nameTh: "ตัวชี้วัดทางการเงิน", icon: DollarSign, color: "text-green-400", bgColor: "bg-green-500/10", borderColor: "border-green-500/30" },
  { id: "high-risk-industry" as const, name: "High Risk Industry", nameTh: "อุตสาหกรรมเสี่ยงสูง", icon: AlertTriangle, color: "text-red-400", bgColor: "bg-red-500/10", borderColor: "border-red-500/30" },
];

/** ใช้ UniformIcon เพื่อให้ทุกไอคอนขนาดเท่ากัน */
const getCategoryIcon = (category: NormalizedIndicator["category"]) => {
  switch (category) {
    case "Ownership":  return <UniformIcon Icon={Users} className="text-blue-600" />;
    case "Governance": return <UniformIcon Icon={Shield} className="text-purple-600" />;
    case "Compliance": return <UniformIcon Icon={Scale} className="text-orange-600" />;
    case "Risk":       return <UniformIcon Icon={AlertTriangle} className="text-yellow-600" />;
    case "Financial":  return <UniformIcon Icon={DollarSign} className="text-green-600" />;
    case "Assets":     return <UniformIcon Icon={Home} className="text-indigo-600" />;
    default:           return <UniformIcon Icon={Building2} className="text-gray-600" />;
  }
};

const getStatusIcon = (status: "pass" | "fail") =>
  status === "pass" ? <Circle className="h-5 w-5 text-green-600 fill-green-600" /> : <Circle className="h-5 w-5 text-red-600 fill-red-600" />;

/* ------- small util: แทน findLastIndex เพื่อกันแครชใน SSR ------- */
function lastIndexWhere<T>(arr: T[], pred: (t: T, idx: number, a: T[]) => boolean): number {
  for (let i = arr.length - 1; i >= 0; i--) {
    if (pred(arr[i], i, arr)) return i;
  }
  return -1;
}

/* ---------------- Shell ---------------- */
export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}

/* ---------------- Normalizers ---------------- */
function normalizeFromSummary(summary: IndicatorSummary) {
  const ALLOW = new Set(Object.keys(codeToCategoryKey));
  const catKeyToDisplayCategory: Record<CategoryId, NormalizedIndicator["category"]> = {
    "shared-resources": "Ownership",
    "foreigner-control": "Compliance",
    "directorship-pattern": "Governance",
    "shareholding-patterns": "Ownership",
    "financial-indicators": "Financial",
    "high-risk-industry": "Assets",
  };

  const grouped: Record<CategoryId, NormalizedIndicator[]> = {
    "shared-resources": [],
    "foreigner-control": [],
    "directorship-pattern": [],
    "shareholding-patterns": [],
    "financial-indicators": [],
    "high-risk-industry": [],
  };

  for (const it of summary.indicators ?? []) {
    const codeLower = String(it.code || "").toLowerCase();
    if (!ALLOW.has(codeLower)) continue;

    const catKey = codeToCategoryKey[codeLower];
    const status: "fail" | "pass" = it.value ? "fail" : "pass";

    grouped[catKey].push({
      id: 0,
      code: codeLower,
      name: it.name_th ?? it.code?.toUpperCase() ?? codeLower.toUpperCase(),
      nameEn: it.name_en ?? "",
      status,
      category: catKeyToDisplayCategory[catKey],
      description: it.description ?? undefined,
      _categoryKey: catKey,
    });
  }

  const merged: NormalizedIndicator[] = [];
  for (const cat of categoryOrder) {
    const arr = grouped[cat];
    arr.sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name, "th") : a.status === "fail" ? -1 : 1));
    merged.push(...arr);
  }
  merged.forEach((m, idx) => (m.id = idx + 1));
  return merged;
}

function normalizeFromCombined(res: any) {
  const ALLOW = new Set(Object.keys(codeToCategoryKey));
  const catKeyToDisplayCategory: Record<CategoryId, NormalizedIndicator["category"]> = {
    "shared-resources": "Ownership",
    "foreigner-control": "Compliance",
    "directorship-pattern": "Governance",
    "shareholding-patterns": "Ownership",
    "financial-indicators": "Financial",
    "high-risk-industry": "Assets",
  };

  const grouped: Record<CategoryId, NormalizedIndicator[]> = {
    "shared-resources": [],
    "foreigner-control": [],
    "directorship-pattern": [],
    "shareholding-patterns": [],
    "financial-indicators": [],
    "high-risk-industry": [],
  };

  const raw: any[] = Array.isArray(res?.indicators) ? res.indicators : [];
  for (const it of raw) {
    const codeLower = String(it.indicator || "").toLowerCase();
    if (!ALLOW.has(codeLower)) continue;

    const catKey = codeToCategoryKey[codeLower];
    const flag = Number(it.flag) === 1 ? 1 : 0;
    const status: "fail" | "pass" = flag === 1 ? "fail" : "pass";

    grouped[catKey].push({
      id: 0,
      code: codeLower,
      name: it.name_th ?? it.name ?? codeLower.toUpperCase(),
      nameEn: it.name_en ?? "",
      status,
      category: catKeyToDisplayCategory[catKey],
      description: it.updated_at ? `อัปเดตล่าสุด: ${new Date(it.updated_at).toLocaleString()}` : undefined,
      _categoryKey: catKey,
    });
  }

  const merged: NormalizedIndicator[] = [];
  for (const cat of categoryOrder) {
    const arr = grouped[cat];
    arr.sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name, "th") : a.status === "fail" ? -1 : 1));
    merged.push(...arr);
  }
  merged.forEach((m, idx) => (m.id = idx + 1));
  return merged;
}

/* ---------------- Page Content ---------------- */
function ResultsContent() {
  const searchParams = useSearchParams();

  // รองรับทั้ง q และ registration_id
  const qParam = (searchParams.get("q") ?? "").trim();
  const registrationParam = (searchParams.get("registration_id") ?? "").trim();
  const registration_id = (qParam || registrationParam).replace(/\s+/g, "");

  const fallbackCompany = searchParams.get("company") || "บริษัท ซันนี่ วิวส์ จำกัด";

  const [isLoading, setIsLoading] = useState(true);
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "pass" | "fail">("all");
  const [displayedCategories, setDisplayedCategories] = useState<string[]>([]);
  const [displayedIndicatorsByCategory, setDisplayedIndicatorsByCategory] = useState<Record<string, string[]>>({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentIndicatorInCategory, setCurrentIndicatorInCategory] = useState(0);
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null);

  const indicatorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const [companyName, setCompanyName] = useState<string>(fallbackCompany);
  const [normalized, setNormalized] = useState<NormalizedIndicator[]>([]);

  // ดึงข้อมูล: ใช้ summary API ก่อน แล้วค่อย fallback
  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true);
        if (!registration_id) throw new Error("missing registration_id");

        let companyNameLocal: string | null = null;

        // เช็ค prefetch ให้เลขตรงกัน
        let summary: IndicatorSummary | null = readPrefetchedSummary();
        if (summary && (summary.registration_id || "").replace(/\s+/g, "") !== registration_id) {
          summary = null;
        }

        if (!summary) {
          try {
            summary = await fetchIndicatorSummary(registration_id);
          } catch {
            // fallback ด้านล่าง
          }
        }

        if (summary) {
          companyNameLocal = (summary as any).company_name ?? null;
          const merged = normalizeFromSummary(summary);
          setNormalized(merged);
        } else {
          const res: any = await resolveCompany(registration_id);
          companyNameLocal =
            res?.company?.name_th ||
            res?.company?.name_en ||
            `ทะเบียน ${registration_id}`;
          const merged = normalizeFromCombined(res);
          setNormalized(merged);
        }

        setCompanyName(companyNameLocal || `ทะเบียน ${registration_id}`);

        clearPrefetchedSummary();
      } catch (e) {
        console.error(e);
        toast.error("ไม่สามารถดึงข้อมูลบริษัทได้", { theme: "colored" });
      } finally {
        setIsLoading(false);
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration_id]);

  // จัดรายการตามหมวด
  const indicatorsByCategory = useMemo(() => {
    const acc: Record<CategoryId, NormalizedIndicator[]> = {
      "shared-resources": [],
      "foreigner-control": [],
      "directorship-pattern": [],
      "shareholding-patterns": [],
      "financial-indicators": [],
      "high-risk-industry": [],
    };
    for (const it of normalized) acc[it._categoryKey].push(it);
    return acc;
  }, [normalized]);

  // เลขลำดับโชว์
  const indicatorDisplayNumbers = useMemo(() => {
    const out: Record<string, number> = {};
    let run = 1;
    for (const cat of categoryOrder) {
      for (const it of indicatorsByCategory[cat]) {
        out[it.code] = run++;
      }
    }
    return out;
  }, [indicatorsByCategory]);

  const passCount = normalized.filter((i) => i.status === "pass").length;
  const failCount = normalized.filter((i) => i.status === "fail").length;

  // นับเฉพาะที่ reveal แล้ว
  const { displayedFailCount, displayedPassCount } = useMemo(() => {
    const shownCodes = Object.values(displayedIndicatorsByCategory).flat();
    let fail = 0, pass = 0;
    for (const code of shownCodes) {
      const it = normalized.find(n => n.code === code);
      if (!it) continue;
      if (it.status === "fail") fail++;
      else pass++;
    }
    return { displayedFailCount: fail, displayedPassCount: pass };
  }, [displayedIndicatorsByCategory, normalized]);

  // Reveal animation
  useEffect(() => {
    if (isLoading) return;
    if (currentCategoryIndex >= categories.length) return;

    const currentCategoryKey = categories[currentCategoryIndex].id as CategoryId;
    const list = indicatorsByCategory[currentCategoryKey] ?? [];

    if (!displayedCategories.includes(currentCategoryKey)) {
      setDisplayedCategories((prev) => [...prev, currentCategoryKey]);
      setTimeout(() => {
        const el = categoryRefs.current[currentCategoryKey];
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
      return;
    }

    if (currentIndicatorInCategory < list.length) {
      const cur = list[currentIndicatorInCategory];
      const t = setTimeout(() => {
        setDisplayedIndicatorsByCategory((prev) => {
          const arr = prev[currentCategoryKey] ?? [];
          if (cur.status === "fail") {
            // เดิมใช้ arr.findLastIndex(...) -> เปลี่ยนเป็น helper กันแครช SSR
            const lastFailIdx = lastIndexWhere(arr, (code) => {
              const it = normalized.find((n) => n.code === code);
              return it?.status === "fail";
            });
            const nx = [...arr];
            nx.splice(lastFailIdx + 1, 0, cur.code);
            return { ...prev, [currentCategoryKey]: nx };
          }
          return { ...prev, [currentCategoryKey]: [...arr, cur.code] };
        });

        setTimeout(() => {
          const el = indicatorRefs.current[cur.code];
          el?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);

        setTimeout(() => setCurrentIndicatorInCategory((v) => v + 1), cur.status === "fail" ? 1800 : 1200);
      }, 80);
      return () => clearTimeout(t);
    } else {
      setTimeout(() => {
        setCurrentCategoryIndex((v) => v + 1);
        setCurrentIndicatorInCategory(0);
      }, 400);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    currentCategoryIndex,
    currentIndicatorInCategory,
    displayedCategories,
    indicatorsByCategory,
    normalized,
  ]);

  useEffect(() => {
    if (!isLoading && currentCategoryIndex >= categories.length) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 800);
    }
  }, [isLoading, currentCategoryIndex]);

  const toggleIndicator = (code: string) => {
    const s = new Set(expandedIndicators);
    s.has(code) ? s.delete(code) : s.add(code);
    setExpandedIndicators(s);
  };

  const hasDetails = (indicator: NormalizedIndicator) =>
    codesWithDetails.has(indicator.code.toLowerCase());

  const getIndicatorIcon = (indicator: NormalizedIndicator) => {
    if (indicator._categoryKey === "directorship-pattern") return <UniformIcon Icon={Crown} className="text-purple-600" />;
    if (indicator._categoryKey === "foreigner-control") return <UniformIcon Icon={Globe} className="text-blue-600" />;
    return getCategoryIcon(indicator.category);
  };

  // ส่งออก JSON ที่กำลังแสดง
  function handleExport() {
    const payload = {
      registration_id,
      company_name: companyName,
      summary: {
        total: normalized.length,
        pass: passCount,
        fail: failCount,
        failure_rate: normalized.length > 0 ? Math.round((failCount / normalized.length) * 100) : 0,
      },
      categories: categoryOrder.map((cat) => ({
        id: cat,
        name: categories.find((c) => c.id === cat)?.name ?? cat,
        shown_codes: displayedIndicatorsByCategory[cat] ?? [],
        items: (indicatorsByCategory[cat] ?? []).map((i) => ({
          code: i.code.toUpperCase(),
          name_th: i.name,
          name_en: i.nameEn,
          status: i.status,
          description: i.description ?? null,
        })),
      })),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clarifind-report-${registration_id || "company"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (isLoading) return <StepLoadingAnimation />;

  const failureRate = normalized.length > 0 ? Math.round((failCount / normalized.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white relative overflow-hidden animate-fade-in">
      <CosmicBackground />
      <GradientOrbs />
      <GlobeNetwork />

      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity cursor-pointer">
                <span className="text-2xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  ClariFind
                </span>
              </Link>
              <Button variant="ghost" size="sm" asChild className="text-white hover:bg-white/10">
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  ค้นหาใหม่
                </Link>
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <FileText className="h-4 w-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>
      </header>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-900/30 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">

            {/* Company Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-8 w-8 text-cyan-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">{companyName}</h2>
                  <p className="text-slate-300">รายงานการวิเคราะห์การปฏิบัติตามกฎระเบียบ</p>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mx-auto w-full max-w-[1000px] px-4 mb-6">
              <Card className="bg-linear-to-br from-slate-800/95 to-slate-800/90 backdrop-blur-xl border-white/20 shadow-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold text-center text-white">สัดส่วนผลการวิเคราะห์ตัวชี้วัด</CardTitle>
                  <CardDescription className="text-center text-slate-300">
                    การแสดงสัดส่วนระหว่างตัวบ่งชี้ที่พบและไม่พบจากทั้งหมด {normalized.length} ตัวชี้วัด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative h-16 bg-slate-700/30 rounded-lg overflow-hidden border border-white/10">
                      <div
                        className="absolute left-0 top-0 h-full bg-linear-to-r from-rose-500 to-rose-400 flex items-center justify-center text-white font-semibold transition-all duration-500 shadow-lg shadow-rose-500/20"
                        style={{
                          width: `${displayedFailCount + displayedPassCount > 0
                            ? (displayedFailCount / (displayedFailCount + displayedPassCount)) * 100
                            : 0
                            }%`,
                        }}
                      >
                        {displayedFailCount > 0 && <span className="text-sm animate-pulse">พบตัวบ่งชี้ {displayedFailCount}</span>}
                      </div>
                      <div
                        className="absolute right-0 top-0 h-full bg-linear-to-l from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-semibold transition-all duration-500 shadow-lg shadow-emerald-500/20"
                        style={{
                          width: `${displayedFailCount + displayedPassCount > 0
                            ? (displayedPassCount / (displayedFailCount + displayedPassCount)) * 100
                            : 0
                            }%`,
                        }}
                      >
                        {displayedPassCount > 0 && <span className="text-sm animate-pulse">ไม่พบตัวบ่งชี้ {displayedPassCount}</span>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-slate-300 justify-center">
                      <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">พบ {failCount}</Badge>
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">ไม่พบ {passCount}</Badge>
                      <Badge variant="outline" className="border-white/20 text-slate-300">รวม {normalized.length}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter bar */}
            <Card className="mb-8 bg-linear-to-br from-slate-800/95 to-slate-800/90 backdrop-blur-xl border-white/20 shadow-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-white">ตัวกรองการแสดงผล</CardTitle>
                <CardDescription className="text-slate-300">เลือกดูเฉพาะหมวดที่สนใจหรือสถานะที่ต้องการ</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-3">
                  <div className="text-slate-300 text-sm">กรองการแสดงผล:</div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={filter === "all" ? "default" : "outline"}
                      className={filter === "all" ? "bg-white/10" : "border-white/20 text-slate-200 hover:bg-white/10"}
                      onClick={() => setFilter("all")}
                    >
                      ทั้งหมด
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "fail" ? "default" : "outline"}
                      className={filter === "fail" ? "bg-rose-600/40" : "border-white/20 text-slate-200 hover:bg-white/10"}
                      onClick={() => setFilter("fail")}
                    >
                      พบตัวบ่งชี้
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === "pass" ? "default" : "outline"}
                      className={filter === "pass" ? "bg-emerald-600/40" : "border-white/20 text-slate-200 hover:bg-white/10"}
                      onClick={() => setFilter("pass")}
                    >
                      ไม่พบตัวบ่งชี้
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Category sections */}
            <div className="space-y-8">
              {categories.map((category) => {
                if (!displayedCategories.includes(category.id)) return null;
                const IconComponent = category.icon;

                const fullList = indicatorsByCategory[category.id as CategoryId];
                const codesShown = displayedIndicatorsByCategory[category.id] ?? [];
                const failIndicators = codesShown
                  .map((code) => fullList.find((i) => i.code === code))
                  .filter((x): x is NormalizedIndicator => !!x && x.status === "fail");
                const passIndicators = codesShown
                  .map((code) => fullList.find((i) => i.code === code))
                  .filter((x): x is NormalizedIndicator => !!x && x.status === "pass");

                const showFailColumn = filter === "all" || filter === "fail";
                const showPassColumn = filter === "all" || filter === "pass";
                if ((filter === "fail" && failIndicators.length === 0) || (filter === "pass" && passIndicators.length === 0)) return null;

                return (
                  <div key={category.id} ref={(el) => { (categoryRefs.current[category.id] = el) }} className="animate-fade-in">
                    <Card className="bg-slate-800/50 backdrop-blur-sm border-white/10 shadow-xl">
                      <CardHeader>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-3 rounded-lg ${category.bgColor} border ${category.borderColor}`}>
                            <IconComponent className={`h-6 w-6 ${category.color}`} />
                          </div>
                          <div>
                            <CardTitle className="text-white text-xl">{category.name}</CardTitle>
                            <CardDescription className="text-slate-300">{category.nameTh}</CardDescription>
                          </div>
                          <Badge variant="outline" className={`ml-auto ${category.color} border-current`}>
                            {codesShown.length} ตัวชี้วัด
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left: Fail */}
                          {showFailColumn && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="h-8 w-1 bg-rose-500 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-rose-400">พบตัวบ่งชี้</h3>
                                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">{failIndicators.length}</Badge>
                              </div>

                              {failIndicators.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                  ไม่พบตัวบ่งชี้ในหมวดนี้
                                </div>
                              ) : (
                                failIndicators.map((indicator) => {
                                  const displayNo = indicatorDisplayNumbers[indicator.code];
                                  const isHighlighted = highlightedCode === indicator.code;
                                  return (
                                    <div
                                      key={indicator.code}
                                      ref={(el) => { (indicatorRefs.current[indicator.code] = el) }}
                                      className={`flex items-start space-x-4 p-4 border rounded-lg backdrop-blur-sm transition-all duration-700 ease-out bg-rose-900/20 border-rose-500/30 shadow-lg shadow-rose-500/10 ${isHighlighted ? "ring-4 ring-rose-400/50 shadow-2xl shadow-rose-500/30 scale-[1.02]" : ""}`}
                                      style={{ animation: "fade-slide-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                    >
                                      <div className="shrink-0 mt-0.5">
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="secondary" className="text-xs w-8 h-6 flex items-center justify-center bg-slate-700/50 text-white border border-white/10">
                                            {displayNo}
                                          </Badge>
                                          {getStatusIcon(indicator.status)}
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            {getIndicatorIcon(indicator)}
                                            <h4 className="font-medium text-white text-sm">
                                              {indicator.nameEn || indicator.code.toUpperCase()}
                                            </h4>
                                          </div>
                                          {hasDetails(indicator) && (
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => toggleIndicator(indicator.code)}
                                              className="h-6 w-6 p-0 text-white hover:bg-white/10"
                                            >
                                              {expandedIndicators.has(indicator.code) ? (
                                                <ChevronUp className="h-4 w-4" />
                                              ) : (
                                                <ChevronDown className="h-4 w-4" />
                                              )}
                                            </Button>
                                          )}
                                        </div>

                                        <p className="text-sm text-slate-300 mb-1">{indicator.name}</p>
                                        <p className="text-xs text-slate-400">{indicator.description || "—"}</p>
                                        
                                        {hasDetails(indicator) && expandedIndicators.has(indicator.code) && (
                                          <IndicatorDetail
                                            registration_id={registration_id}
                                            code={indicator.code}
                                          />
                                        )}

                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {/* Right: Pass */}
                          {showPassColumn && (
                            <div className="space-y-4">
                              <div className="flex items-center space-x-2 mb-4">
                                <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                                <h3 className="text-lg font-semibold text-emerald-400">ไม่พบตัวบ่งชี้</h3>
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">{passIndicators.length}</Badge>
                              </div>

                              {passIndicators.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                  ไม่มีตัวบ่งชี้ที่ผ่านในหมวดนี้
                                </div>
                              ) : (
                                passIndicators.map((indicator) => {
                                  const displayNo = indicatorDisplayNumbers[indicator.code];
                                  return (
                                    <div
                                      key={indicator.code}
                                      ref={(el) => { (indicatorRefs.current[indicator.code] = el) }}
                                      className="flex items-start space-x-4 p-4 border rounded-lg backdrop-blur-sm transition-all duration-700 ease-out bg-emerald-900/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                      style={{ animation: "fade-slide-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                    >
                                      <div className="shrink-0 mt-0.5">
                                        <div className="flex items-center space-x-2">
                                          <Badge variant="secondary" className="text-xs w-8 h-6 flex items-center justify-center bg-slate-700/50 text-white border border-white/10">
                                            {displayNo}
                                          </Badge>
                                          {getStatusIcon(indicator.status)}
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                          {getIndicatorIcon(indicator)}
                                          <h4 className="font-medium text-white text-sm">{indicator.nameEn || indicator.code.toUpperCase()}</h4>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-1">{indicator.name}</p>
                                        <p className="text-xs text-slate-400">{indicator.description || "—"}</p>
                                        {/* รายละเอียดของตัวชี้วัด (โหลดจาก API) */}
                                        {hasDetails(indicator) && expandedIndicators.has(indicator.code) && (
                                          <div className="mt-3">
                                            <IndicatorDetail
                                              registration_id={registration_id}
                                              code={indicator.code}
                                            />
                                          </div>
                                        )}

                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down { from { opacity: 0; max-height: 0; transform: translateY(-10px); } to { opacity: 1; max-height: 1000px; transform: translateY(0); } }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fade-slide-in { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-down { animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
      `}</style>
    </div>
  );
}
