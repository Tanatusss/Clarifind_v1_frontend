import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, DollarSign, FileCheck, Globe, AlertTriangle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const indicatorCategories = [
  {
    title: "Ownership Structure",
    titleTh: "โครงสร้างการถือหุ้น",
    icon: Building2,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    indicators: [
      {
        en: "Duplicate Address Registration (5+ companies)",
        th: "จำนวนที่อยู่ที่ซ้ำกัน 5 บริษัทขึ้นไป ที่อยู่จดทะเบียน",
      },
      {
        en: "Circular Ownership",
        th: "Circular Ownership ล่าสุด",
      },
      {
        en: "Ownership Changes (2+ times within 1 year)",
        th: "เคยมีการเปลี่ยนผู้ถือหุ้นมากกว่า 2 ครั้งภายใน 1 ปี (ประวัติ)",
      },
    ],
  },
  {
    title: "Governance & Directors",
    titleTh: "การกำกับดูแลและกรรมการ",
    icon: Globe,
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    indicators: [
      {
        en: "Auditor Independence Issues",
        th: "ผู้ตรวจสอบบัญชีของบริษัทมีความเกี่ยวข้องกับบริษัทที่มีแพลตเทิร์นการถือหุ้นไขว้",
      },
      {
        en: "Foreign Directors with Signing Authority",
        th: "กรรมการต่างชาติที่มีอำนาจลงนาม",
      },
      {
        en: "Current Director Overlap (2+ companies)",
        th: "เซ็ตกรรมการปัจจุบันซ้ำกับบริษัทอื่น อย่างน้อย 2 บริษัท",
      },
      {
        en: "Initial Director Set Overlap (2+ companies)",
        th: "เซ็ตกรรมการชุดแรกซ้ำกับเซ็ตกรรมการชุดแรกของบริษัทอื่น อย่างน้อย 2 บริษัท",
      },
      {
        en: "Directors in Simultaneous Openings",
        th: "มีกรรมการที่เป็นเซ็ต(ปัจจุบัน)เดียวกันกับ เซ็ตกรรมการ (ชุดแรก) ที่เปิดพร้อมกันภายใน1 ปี ไม่น้อยกว่า 2 บริษัท",
      },
      {
        en: "Directors in Simultaneous Closures",
        th: "มีกรรมการที่เป็นเซ็ต(ปัจจุบัน)เดียวกันกับ เซ็ตกรรมการ (ชุดแรก) ที่ปิดพร้อมกันภายใน1 ปี ไม่น้อยกว่า 2 บริษัท",
      },
      {
        en: "Directors in Short-lived Companies",
        th: "มีกรรมการที่เป็นเซ็ต(ปัจจุบัน)เดียวกันกับ เซ็ตกรรมการ (ชุดแรก) ที่มีอายุบริษัท ณ วันปิดตัวไม่เกิน 1 ปี ไม่น้อยกว่า 2 บริษัท",
      },
    ],
  },
  {
    title: "Financial Health",
    titleTh: "สุขภาพทางการเงิน",
    icon: DollarSign,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    indicators: [
      {
        en: "Missing Financial Statements (2+ year old company)",
        th: "ไม่มีงบการเงินเลย (อายุบริษัท2 ปี-ขึ้นไป)",
      },
      {
        en: "Property, Plant & Equipment > 0",
        th: "PPE (ปัจจุบัน) > 0 (อายุบริษัท2 ปี-ขึ้นไป)",
      },
      {
        en: "Missing or Zero Income Tax",
        th: "Income tax ไม่มีข้อมูลภาษีหรือภาษีเป็น 0 (อายุบริษัท2 ปี-ขึ้นไป)",
      },
      {
        en: "Total Asset Turnover < 0.5",
        th: "Total asset turn over < 0.5 (อายุบริษัท2 ปี-ขึ้นไป)",
      },
      {
        en: "Cross-Border Transaction Patterns",
        th: "รูปแบบการทำธุรกรรมข้ามพรมแดน",
      },
    ],
  },
  {
    title: "Foreign Business Compliance",
    titleTh: "การปฏิบัติตามกฎหมายธุรกิจต่างด้าว",
    icon: FileCheck,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    indicators: [
      {
        en: "Foreign Director Authority > 50%",
        th: "มีกรรมการต่างชาติที่มีอำนาจลงนาม (เปอร์เซ็นต์บริษัทที่กรรมการต่างชาติมีอำนาจลงนามมากกว่า 50%)",
      },
      {
        en: "First Time Foreign Ownership 49%",
        th: "ครั้งแรกต่างชาติถือหุ้น 49%",
      },
      {
        en: "Foreign Ownership Percentage Increase",
        th: "เปอร์เซ็นต์หุ้นต่างชาติโดยรวมเพิ่มขึ้น ไม่สนจำนวนเปอร์เซ็นต์",
      },
      {
        en: "Foreign Business Act List 1 Industry",
        th: "เป็นอุตสาหกรรมตามบัญชีท้ายพระราชบัญญัติประกอบธุรกิจต่างด้าว บัญชีที่ 1",
      },
      {
        en: "Foreign Business Act List 3 Industry",
        th: "เป็นอุตสาหกรรมตามบัญชีท้ายพระราชบัญญัติประกอบธุรกิจต่างด้าว บัญชีที่ 3",
      },
      {
        en: "Current Foreign Ownership 48-50%",
        th: "ปัจจุบันต่างชาติถือหุ้น ระหว่าง 48 ถึง น้อยกว่า 50",
      },
      {
        en: "Beneficial Owner Foreign 49%+",
        th: "%BO เป็นต่างชาติและถือหุ้น 49% ขึ้นไป",
      },
    ],
  },
  {
    title: "Asset Management",
    titleTh: "การจัดการสินทรัพย์",
    icon: AlertTriangle,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
    indicators: [
      {
        en: "Land Acquisition",
        th: "มีการซื้อที่ดิน",
      },
      {
        en: "Land Value vs PPE Discrepancy",
        th: "มูลค่าทุนทรัพย์ที่ดินจากกรมมากกว่าค่า PPE",
      },
    ],
  },
]

export default function IndicatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div className="flex items-center space-x-2">
                <Image src="/clarifind-logo.png" alt="ClariFind Logo" width={160} height={53} className="h-12 w-auto" />
              </div>
            </div>
            <Button asChild>
              <Link href="/search">Start Analysis</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Compliance Framework
          </Badge>
          <h2 className="text-4xl font-bold mb-4">24 Compliance Indicators</h2>
          <h3 className="text-2xl text-muted-foreground mb-4">ตัวชี้วัดการปฏิบัติตามกฎระเบียบ 24 ตัวชี้วัด</h3>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Our comprehensive evaluation framework covers critical areas of business compliance, regulatory adherence,
            and risk assessment to provide thorough company analysis based on Thai regulatory requirements.
          </p>
        </div>

        {/* Indicators by Category */}
        <div className="space-y-12">
          {indicatorCategories.map((category, index) => {
            const IconComponent = category.icon
            return (
              <div key={index}>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-3 rounded-lg ${category.bgColor}`}>
                    <IconComponent className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{category.title}</h3>
                    <p className="text-lg text-muted-foreground">{category.titleTh}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.indicators.length} indicators in this category
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-1 gap-4">
                  {category.indicators.map((indicator, indicatorIndex) => (
                    <Card key={indicatorIndex} className="relative">
                      <div className={`absolute top-0 left-0 w-1 h-full ${category.color.replace("text-", "bg-")}`} />
                      <CardHeader className="pl-6 pb-3">
                        <CardTitle className="text-base font-medium mb-2">{indicator.en}</CardTitle>
                        <p className="text-sm text-muted-foreground">{indicator.th}</p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-16 p-8 bg-muted/30 rounded-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Comprehensive Coverage</h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="text-3xl font-bold text-primary">24</div>
                <p className="text-muted-foreground">Total Indicators</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">5</div>
                <p className="text-muted-foreground">Key Categories</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <p className="text-muted-foreground">Compliance Coverage</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">Thai</div>
                <p className="text-muted-foreground">Regulatory Focus</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <h3 className="text-2xl font-bold mb-4">Ready to Analyze a Company?</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Use our comprehensive 24-indicator framework to evaluate any company's compliance status and risk profile.
          </p>
          <Button size="lg" asChild>
            <Link href="/search">Start Company Analysis</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
