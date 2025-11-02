import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, BarChart3, Building2 } from "lucide-react"
import { CosmicBackground } from "@/components/cosmic-background"
import { GradientOrbs } from "@/components/gradient-orbs"
import { GlobeNetwork } from "@/components/globe-network"
import { QuickSearch } from "@/components/quick-search"
import { Header } from "@/components/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CosmicBackground />
      <GradientOrbs />
      <GlobeNetwork />

      {/* Content wrapper with higher z-index */}
      <div className="relative" style={{ zIndex: 10 }}>
        <Header />

        <section className="py-32 px-4 relative">
          <div className="container mx-auto text-center max-w-5xl">
            <Badge variant="secondary" className="mb-6 glass-card border-primary/30 text-base px-4 py-2">
              แพลตฟอร์มการปฏิบัติตามกฎระเบียบด้วยการวิเคราห์ข้อมูล
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-balance mb-8 bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent leading-tight">
              Discover Truth With ClariFind
            </h1>
            <p className="text-xl md:text-2xl text-foreground/80 text-balance mb-12 max-w-3xl mx-auto leading-relaxed">
              ประเมินความเสี่ยงหรือมีแนวโน้มที่จะเป็นนอมินีตาม <span className="text-primary font-semibold">23 ตัวบ่งชี้</span>{" "}
              ด้วยการวิเคราะห์ข้อมูลในหลากหลายมิติ
            </p>

            <div className="mb-12">
              <QuickSearch />
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 relative">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                ทำไมต้องเลือก ClariFind?
              </h3>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                แพลตฟอร์มของเราให้ข้อมูลเชิงลึกด้านการปฏิบัติตามกฎระเบียบอย่างครอบคลุม ด้วยความแม่นยำและความชัดเจนระดับมืออาชีพ
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center glass-card border-primary/20 hover-lift">
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-xl">การวิเคราะห์ครอบคลุม</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70">
                    ประเมินบริษัทตาม 23 ตัวชี้วัดการปฏิบัติตามกฎระเบียบที่สำคัญ ครอบคลุมการถือหุ้น และการเงิน
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center glass-card border-cyan-500/20 hover-lift">
                <CardHeader>
                  <BarChart3 className="h-12 w-12 text-cyan-400 mx-auto mb-4" />
                  <CardTitle className="text-xl">ข้อมูลเชิงลึกที่เห็นภาพ</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70">
                    แดชบอร์ดระดับมืออาชีพที่ชัดเจน นำเสนอข้อมูลการปฏิบัติตามกฎระเบียบที่ซับซ้อน ในรูปแบบที่เข้าใจง่ายเพื่อการตัดสินใจที่รวดเร็ว
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center glass-card border-blue-400/20 hover-lift">
                <CardHeader>
                  <Building2 className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                  <CardTitle className="text-xl">ระดับมืออาชีพ</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base text-foreground/70">
                    สร้างขึ้นสำหรับเจ้าหน้าที่กำกับดูแล นักธุรกิจมืออาชีพ และนักวิเคราะห์ ที่ต้องการข้อมูลทางธุรกิจที่เชื่อถือได้และแม่นยำ
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <footer className="py-12 px-4 border-t border-border/50 glass-card">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <span className="text-xl font-bold bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  ClariFind
                </span>
              </div>
              <p className="text-foreground/60 text-center">แพลตฟอร์มประเมินการปฏิบัติตามกฎระเบียบทางธุรกิจระดับมืออาชีพ</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
