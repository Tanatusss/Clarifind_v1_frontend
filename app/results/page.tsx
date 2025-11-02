"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "react-toastify"

import { CosmicBackground } from "@/components/cosmic-background"
import { GradientOrbs } from "@/components/gradient-orbs"
import { GlobeNetwork } from "@/components/globe-network"
import { StepLoadingAnimation } from "@/components/step-loading-animation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
} from "lucide-react"

import { fetchIndicatorSummary, fetchIndicatorTrueOnly } from "@/lib/indicator-api"

// ---------- Types ----------
type CategoryId =
  | "shared-resources"
  | "foreigner-control"
  | "directorship-pattern"
  | "shareholding-patterns"
  | "financial-indicators"
  | "high-risk-industry"

type NormalizedIndicator = {
  id: number // display id (running no. within all categories)
  code: string
  name: string
  nameEn: string
  status: "pass" | "fail"
  category: "Ownership" | "Governance" | "Compliance" | "Risk" | "Financial" | "Assets"
  description?: string
  details?: any
  // for UI helpers
  _categoryKey: CategoryId
}

// ---------- Mapping zone (ปรับได้ตามจริงของ backend) ----------
// 1) จัดหมวดหมู่ตาม "code" ของ backend -> เข้ากลุ่ม category UI เดิม
const codeToCategoryKey: Record<string, CategoryId> = {
  // Shared resources
  ad10000: "shared-resources", // Registered address duplicated (5+)
  ad20000: "shared-resources", // Accounting office address duplicated (5+)
  au10000: "shared-resources",
  au20000: "shared-resources",

  // Shareholding patterns
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
  

  // High risk industry / assets
  i10000: "high-risk-industry",
  i20000: "high-risk-industry",
  i30000: "high-risk-industry",

}

// 2) code ที่อยากมี “รายละเอียดพิเศษ/แผงย่อย” (ถ้าข้อมูลจริงมี) จะเปิด/แสดงปุ่ม expand
const codesWithDetails = new Set<string>([
  "ad10000",
  "ad20000",
  "owc10000",
  "di10000",
  "di20000",
  "bo49000", // Beneficial Owner >= 49% (ตัวอย่าง)
])

// 3) จัดระเบียบ “ลำดับแสดง” ภายในแต่ละ category (อยากคุมเหมือน mock)
const categoryOrder: CategoryId[] = [
  "shared-resources",
  "foreigner-control",
  "directorship-pattern",
  "shareholding-patterns",
  "financial-indicators",
  "high-risk-industry",
]

// ---------- Static UI categories (เหมือนเดิม) ----------
const categories = [
  {
    id: "shared-resources" as const,
    name: "Shared Resources",
    nameTh: "ทรัพยากรที่ใช้ร่วมกัน",
    icon: Users,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
  },
  {
    id: "foreigner-control" as const,
    name: "Foreigner Control",
    nameTh: "การควบคุมโดยต่างชาติ",
    icon: Globe,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30",
  },
  {
    id: "directorship-pattern" as const,
    name: "Directorship Pattern",
    nameTh: "รูปแบบกรรมการ",
    icon: Crown,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
  {
    id: "shareholding-patterns" as const,
    name: "Shareholding Patterns",
    nameTh: "รูปแบบการถือหุ้น",
    icon: Building2,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
  },
  {
    id: "financial-indicators" as const,
    name: "Financial Indicators",
    nameTh: "ตัวชี้วัดทางการเงิน",
    icon: DollarSign,
    color: "text-green-400",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
  },
  {
    id: "high-risk-industry" as const,
    name: "High Risk Industry",
    nameTh: "อุตสาหกรรมเสี่ยงสูง",
    icon: AlertTriangle,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30",
  },
]

// ---------- Small icon helpers (เหมือนเดิม) ----------
const getCategoryIcon = (category: NormalizedIndicator["category"]) => {
  switch (category) {
    case "Ownership":
      return <Users className="h-4 w-4 text-blue-600" />
    case "Governance":
      return <Shield className="h-4 w-4 text-purple-600" />
    case "Compliance":
      return <Scale className="h-4 w-4 text-orange-600" />
    case "Risk":
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    case "Financial":
      return <DollarSign className="h-4 w-4 text-green-600" />
    case "Assets":
      return <Home className="h-4 w-4 text-indigo-600" />
    default:
      return <Building2 className="h-4 w-4 text-gray-600" />
  }
}

const getStatusIcon = (status: "pass" | "fail") => {
  if (status === "pass") return <Circle className="h-5 w-5 text-green-600 fill-green-600" />
  return <Circle className="h-5 w-5 text-red-600 fill-red-600" />
}

// ---------- Page ----------
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
  )
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const registration_id = searchParams.get("registration_id")
  const fallbackCompany = searchParams.get("company") || "บริษัท ซันนี่ วิวส์ จำกัด"

  const [isLoading, setIsLoading] = useState(true)
  const [expandedIndicators, setExpandedIndicators] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState<"all" | "pass" | "fail">("all")
  const [displayedCategories, setDisplayedCategories] = useState<string[]>([])
  const [displayedIndicatorsByCategory, setDisplayedIndicatorsByCategory] = useState<Record<string, string[]>>({})
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [currentIndicatorInCategory, setCurrentIndicatorInCategory] = useState(0)
  const [highlightedCode, setHighlightedCode] = useState<string | null>(null)
  const [displayedFailCount, setDisplayedFailCount] = useState(0)
  const [displayedPassCount, setDisplayedPassCount] = useState(0)

  const indicatorRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const categoryRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const [companyName, setCompanyName] = useState<string>(fallbackCompany)
  const [normalized, setNormalized] = useState<NormalizedIndicator[]>([])

  // ---- Fetch real data & normalize to UI model of mock ----
  useEffect(() => {
    const run = async () => {
      try {
        setIsLoading(true)
        if (!registration_id) throw new Error("missing registration_id")

        const [summaryRes, trueOnlyRes] = await Promise.all([
          fetchIndicatorSummary(registration_id),
          fetchIndicatorTrueOnly(registration_id),
        ])

        setCompanyName(summaryRes?.company_name ?? `ทะเบียน ${registration_id}`)

        // trueOnly: รายการที่เป็น true เท่านั้น (found)
        const trueSet = new Set((trueOnlyRes?.indicators ?? []).map((x: any) => x.code))

        // สร้าง normalized indicators จาก summary.indicators
        // summary.indicators ควรมี: code, name_th, name_en (หรือชื่อใกล้เคียง)
        const sourceList: any[] = summaryRes?.indicators ?? []

        // helper map (code -> extra details) ถ้ามีฝั่ง backend ส่งรายละเอียดมาอีก route ก็ยัดได้
        const detailsMap: Record<string, any> = {} // ปัจจุบันว่างไว้ก่อน

        // แปลง code -> category display (6 กลุ่มเดิม) + Governance/Compliance/ฯลฯ ของแถว
        const catKeyToDisplayCategory: Record<CategoryId, NormalizedIndicator["category"]> = {
          "shared-resources": "Ownership",
          "foreigner-control": "Compliance",
          "directorship-pattern": "Governance",
          "shareholding-patterns": "Ownership",
          "financial-indicators": "Financial",
          "high-risk-industry": "Assets",
        }

        // จัดเรียงภายใน category ตามลำดับชื่อ code (หรือจะกำหนด “order list” เองก็ได้)
        const grouped: Record<CategoryId, NormalizedIndicator[]> = {
          "shared-resources": [],
          "foreigner-control": [],
          "directorship-pattern": [],
          "shareholding-patterns": [],
          "financial-indicators": [],
          "high-risk-industry": [],
        }

        for (const it of sourceList) {
          const code: string = it.code
          const catKey = codeToCategoryKey[code] ?? "shared-resources" // ถ้าไม่รู้หมวด จัดเข้าชั่วคราว
          const status: "pass" | "fail" = trueSet.has(code) ? "fail" : "pass"

          grouped[catKey].push({
            id: 0, // จะใส่ทีหลัง
            code,
            name: it.name_th ?? it.name ?? code,
            nameEn: it.name_en ?? "",
            status,
            category: catKeyToDisplayCategory[catKey],
            description: it.description ?? undefined,
            details: detailsMap[code],
            _categoryKey: catKey,
          })
        }

        // ถ้าบาง code ที่ mock เคยมี แต่ summary ไม่มี → แจ้งว่าไม่มีข้อมูล (ยังคงหน้าตาการ์ดเดิม)
        // ตัวอย่าง: อยากบังคับให้มี ad10000, owc10000 เป็นต้น
        const expectedCodes = Object.keys(codeToCategoryKey)
        for (const code of expectedCodes) {
          const has = sourceList.some((x) => x.code === code)
          if (!has) {
            const catKey = codeToCategoryKey[code]
            grouped[catKey].push({
              id: 0,
              code,
              name: `(ไม่มีข้อมูล) ${code}`,
              nameEn: "",
              status: "pass", // ให้ผ่านไว้ (จะมีบรรทัดบอกว่าไม่มีข้อมูล)
              category: catKeyToDisplayCategory[catKey],
              description: "ไม่มีข้อมูลจาก backend สำหรับตัวชี้วัดนี้",
              _categoryKey: catKey,
            })
          }
        }

        // ให้เป็นลำดับตาม categoryOrder → แล้วรันเลขลำดับแสดงผล
        const merged: NormalizedIndicator[] = []
        for (const cat of categoryOrder) {
          const arr = grouped[cat]
          // เรียง fail ก่อน pass เพื่อให้ animation ใส่ในคอลัมน์ซ้ายก่อน (ตาม mock เดิม)
          arr.sort((a, b) => (a.status === b.status ? a.name.localeCompare(b.name, "th") : a.status === "fail" ? -1 : 1))
          merged.push(...arr)
        }
        // set running display id
        merged.forEach((m, idx) => (m.id = idx + 1))

        setNormalized(merged)
      } catch (e: any) {
        console.error(e)
        toast.error("ไม่สามารถดึงข้อมูลบริษัทได้", { theme: "colored" })
      } finally {
        // ปล่อยให้ animation “loading 13s” เดิมทำงาน? → คง UX เดิม: ให้โชว์ StepLoadingAnimation พอสั้นลง
        setIsLoading(false)
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration_id])

  // ----- Build structures exactly like mock -----
  const indicatorsByCategory = useMemo(() => {
    const acc: Record<CategoryId, NormalizedIndicator[]> = {
      "shared-resources": [],
      "foreigner-control": [],
      "directorship-pattern": [],
      "shareholding-patterns": [],
      "financial-indicators": [],
      "high-risk-industry": [],
    }
    for (const it of normalized) acc[it._categoryKey].push(it)
    return acc
  }, [normalized])

  // running numbers by id for display bubble (เหมือน mock)
  const indicatorDisplayNumbers = useMemo(() => {
    const out: Record<string, number> = {}
    let run = 1
    for (const cat of categoryOrder) {
      for (const it of indicatorsByCategory[cat]) {
        out[it.code] = run++
      }
    }
    return out
  }, [indicatorsByCategory])

  const passCount = normalized.filter((i) => i.status === "pass").length
  const failCount = normalized.filter((i) => i.status === "fail").length

  // ----- “ทีละขั้น” reveal animation logic (คง flow เดิม) -----
  useEffect(() => {
    if (isLoading) return
    if (currentCategoryIndex >= categories.length) return

    const currentCategoryKey = categories[currentCategoryIndex].id as CategoryId
    const list = indicatorsByCategory[currentCategoryKey]

    // ใส่ category ลง displayedCategories ถ้ายังไม่เคย
    if (!displayedCategories.includes(currentCategoryKey)) {
      setDisplayedCategories((prev) => [...prev, currentCategoryKey])
      setTimeout(() => {
        const el = categoryRefs.current[currentCategoryKey]
        el?.scrollIntoView({ behavior: "smooth", block: "start" })
      }, 100)
      return // รอรอบถัดไป add indicator
    }

    if (currentIndicatorInCategory < list.length) {
      const cur = list[currentIndicatorInCategory]
      const t = setTimeout(() => {
        setDisplayedIndicatorsByCategory((prev) => {
          const arr = prev[currentCategoryKey] ?? []
          // fail แทรกก่อน pass
          if (cur.status === "fail") {
            const lastFailIdx = arr.findLastIndex((code) => {
              const it = normalized.find((n) => n.code === code)
              return it?.status === "fail"
            })
            const nx = [...arr]
            nx.splice(lastFailIdx + 1, 0, cur.code)
            return { ...prev, [currentCategoryKey]: nx }
          }
          return { ...prev, [currentCategoryKey]: [...arr, cur.code] }
        })

        if (cur.status === "fail") setDisplayedFailCount((v) => v + 1)
        else setDisplayedPassCount((v) => v + 1)

        setTimeout(() => {
          const el = indicatorRefs.current[cur.code]
          el?.scrollIntoView({ behavior: "smooth", block: "center" })
        }, 100)

        if (cur.status === "fail") {
          setTimeout(() => {
            setHighlightedCode(cur.code)
            setTimeout(() => setHighlightedCode(null), 800)
          }, 500)
        }

        setTimeout(
          () => setCurrentIndicatorInCategory((v) => v + 1),
          cur.status === "fail" ? 1800 : 1200
        )
      }, 100)
      return () => clearTimeout(t)
    } else {
      setTimeout(() => {
        setCurrentCategoryIndex((v) => v + 1)
        setCurrentIndicatorInCategory(0)
      }, 500)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLoading,
    currentCategoryIndex,
    currentIndicatorInCategory,
    displayedCategories,
    indicatorsByCategory,
    normalized,
  ])

  // เมื่อโหลดครบทุก category แล้ว → เลื่อนกลับขึ้นบน (เหมือนเดิม)
  useEffect(() => {
    if (!isLoading && currentCategoryIndex >= categories.length) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }, 1000)
    }
  }, [isLoading, currentCategoryIndex])

  const toggleIndicator = (code: string) => {
    const s = new Set(expandedIndicators)
    s.has(code) ? s.delete(code) : s.add(code)
    setExpandedIndicators(s)
  }

  const hasDetails = (ind: NormalizedIndicator) => codesWithDetails.has(ind.code)

  const getIndicatorIcon = (indicator: NormalizedIndicator) => {
    // กลุ่มกรรมการ
    if (indicator._categoryKey === "directorship-pattern") return <Crown className="h-4 w-4 text-purple-600" />
    // ต่างชาติ
    if (indicator._categoryKey === "foreigner-control") return <Globe className="h-4 w-4 text-blue-600" />
    // ค่า default ตาม category ของแถว
    return getCategoryIcon(indicator.category)
  }

  if (isLoading) return <StepLoadingAnimation />

  const failureRate =
    normalized.length > 0 ? Math.round((failCount / normalized.length) * 100) : 0

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
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
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
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <FileText className="h-4 w-4 mr-2" />
              ส่งออกรายงาน
            </Button>
          </div>
        </div>
      </header>

      {/* Fixed summary bar (เหมือนเดิม) */}
      <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-[calc(100%-2rem)] md:max-w-[calc(1000px-4rem)] px-4">
        <Card className="bg-gradient-to-br from-slate-800/95 to-slate-800/90 backdrop-blur-xl border-white/20 shadow-2xl">
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
                  className="absolute left-0 top-0 h-full bg-gradient-to-r from-rose-500 to-rose-400 flex items-center justify-center text-white font-semibold transition-all duration-500 shadow-lg shadow-rose-500/20"
                  style={{
                    width: `${
                      displayedFailCount + displayedPassCount > 0
                        ? (displayedFailCount / (displayedFailCount + displayedPassCount)) * 100
                        : 0
                    }%`,
                  }}
                >
                  {displayedFailCount > 0 && <span className="text-sm animate-pulse">พบตัวบ่งชี้ {displayedFailCount}</span>}
                </div>
                <div
                  className="absolute right-0 top-0 h-full bg-gradient-to-l from-emerald-500 to-emerald-400 flex items-center justify-center text-white font-semibold transition-all duration-500 shadow-lg shadow-emerald-500/20"
                  style={{
                    width: `${
                      displayedFailCount + displayedPassCount > 0
                        ? (displayedPassCount / (displayedFailCount + displayedPassCount)) * 100
                        : 0
                    }%`,
                  }}
                >
                  {displayedPassCount > 0 && <span className="text-sm animate-pulse">ไม่พบตัวบ่งชี้ {displayedPassCount}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-slate-900/30 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
            {/* Company Header (เหมือนเดิม) */}
            <div className="mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <Building2 className="h-8 w-8 text-cyan-400" />
                <div>
                  <h2 className="text-3xl font-bold text-white">{companyName}</h2>
                  <p className="text-slate-300">รายงานการวิเคราะห์การปฏิบัติตามกฎระเบียบ</p>
                </div>
              </div>
            </div>

            <div className="mb-[280px]"></div>

            {/* Category sections */}
            <div className="space-y-8">
              {categories.map((category) => {
                const isDisplayed = displayedCategories.includes(category.id)
                const categoryCodes = displayedIndicatorsByCategory[category.id] ?? []
                const IconComponent = category.icon

                if (!isDisplayed) return null

                // split into fail & pass within this category
                const fullList = indicatorsByCategory[category.id as CategoryId]
                const failIndicators = categoryCodes
                  .map((code) => fullList.find((i) => i.code === code))
                  .filter((x): x is NormalizedIndicator => !!x && x.status === "fail")

                const passIndicators = categoryCodes
                  .map((code) => fullList.find((i) => i.code === code))
                  .filter((x): x is NormalizedIndicator => !!x && x.status === "pass")

                const showFailColumn = filter === "all" || filter === "fail"
                const showPassColumn = filter === "all" || filter === "pass"

                if ((filter === "fail" && failIndicators.length === 0) || (filter === "pass" && passIndicators.length === 0)) {
                  return null
                }

                return (
                  <div
                    key={category.id}
                    ref={(el) => (categoryRefs.current[category.id] = el)}
                    className="animate-fade-in"
                  >
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
                            {categoryCodes.length} ตัวชี้วัด
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
                                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                                  {failIndicators.length}
                                </Badge>
                              </div>

                              {failIndicators.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                  ไม่พบตัวบ่งชี้ในหมวดนี้
                                </div>
                              ) : (
                                failIndicators.map((indicator) => {
                                  const isHighlighted = highlightedCode === indicator.code
                                  const displayNo = indicatorDisplayNumbers[indicator.code]

                                  return (
                                    <div
                                      key={indicator.code}
                                      ref={(el) => (indicatorRefs.current[indicator.code] = el)}
                                      className={`flex items-start space-x-4 p-4 border rounded-lg backdrop-blur-sm transition-all duration-700 ease-out bg-rose-900/20 border-rose-500/30 shadow-lg shadow-rose-500/10 ${
                                        isHighlighted ? "ring-4 ring-rose-400/50 shadow-2xl shadow-rose-500/30 scale-[1.02]" : ""
                                      }`}
                                      style={{ animation: "fade-slide-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs w-8 h-6 flex items-center justify-center bg-slate-700/50 text-white border border-white/10"
                                          >
                                            {displayNo}
                                          </Badge>
                                          {getStatusIcon(indicator.status)}
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            {getIndicatorIcon(indicator)}
                                            <h4 className="font-medium text-white text-sm">{indicator.nameEn || indicator.code}</h4>
                                          </div>
                                          <div className="flex items-center space-x-2">
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
                                        </div>

                                        <p className="text-sm text-slate-300 mb-1">{indicator.name}</p>
                                        <p className="text-xs text-slate-400">
                                          {indicator.description || "—"}
                                          {/* แจ้งถ้าไม่มีข้อมูลจาก backend */}
                                          {indicator.name.startsWith("(ไม่มีข้อมูล)") && (
                                            <span className="ml-1 text-rose-300">• ไม่มีข้อมูลจาก backend</span>
                                          )}
                                        </p>

                                        {/* ตัวอย่าง expand (กรณีมีรายละเอียดจริง) */}
                                        {expandedIndicators.has(indicator.code) && indicator.details && (
                                          <div className="mt-3 p-3 bg-rose-900/30 border border-rose-500/30 rounded-md backdrop-blur-sm animate-slide-down">
                                            <h5 className="font-medium text-rose-300 mb-2">รายละเอียดเพิ่มเติม:</h5>
                                            <pre className="text-xs text-rose-100 whitespace-pre-wrap">
                                              {JSON.stringify(indicator.details, null, 2)}
                                            </pre>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
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
                                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                  {passIndicators.length}
                                </Badge>
                              </div>

                              {passIndicators.length === 0 ? (
                                <div className="p-6 text-center text-slate-400 bg-slate-800/30 rounded-lg border border-slate-700/50">
                                  ไม่มีตัวบ่งชี้ที่ผ่านในหมวดนี้
                                </div>
                              ) : (
                                passIndicators.map((indicator) => {
                                  const displayNo = indicatorDisplayNumbers[indicator.code]
                                  return (
                                    <div
                                      key={indicator.code}
                                      ref={(el) => (indicatorRefs.current[indicator.code] = el)}
                                      className="flex items-start space-x-4 p-4 border rounded-lg backdrop-blur-sm transition-all duration-700 ease-out bg-emerald-900/20 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                                      style={{ animation: "fade-slide-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                                    >
                                      <div className="flex-shrink-0 mt-0.5">
                                        <div className="flex items-center space-x-2">
                                          <Badge
                                            variant="secondary"
                                            className="text-xs w-8 h-6 flex items-center justify-center bg-slate-700/50 text-white border border-white/10"
                                          >
                                            {displayNo}
                                          </Badge>
                                          {getStatusIcon(indicator.status)}
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center space-x-2">
                                            {getIndicatorIcon(indicator)}
                                            <h4 className="font-medium text-white text-sm">{indicator.nameEn || indicator.code}</h4>
                                          </div>
                                        </div>
                                        <p className="text-sm text-slate-300 mb-1">{indicator.name}</p>
                                        <p className="text-xs text-slate-400">
                                          {indicator.description || "—"}
                                          {indicator.name.startsWith("(ไม่มีข้อมูล)") && (
                                            <span className="ml-1 text-rose-300">• ไม่มีข้อมูลจาก backend</span>
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  )
                                })
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            max-height: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            max-height: 1000px;
            transform: translateY(0);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fade-slide-in {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  )
}
