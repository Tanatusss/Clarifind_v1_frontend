"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, BarChart3, Building2 } from "lucide-react";
import { CosmicBackground } from "@/components/cosmic-background";
import { GradientOrbs } from "@/components/gradient-orbs";
import { GlobeNetwork } from "@/components/globe-network";
import { QuickSearch } from "@/components/quick-search";
import { Header } from "@/components/header";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function HomePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false); // ✅ คุม overlay

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background layers */}
      <CosmicBackground />
      <GradientOrbs />
      <GlobeNetwork />

      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="py-32 px-4 relative">
          <div className="container mx-auto text-center max-w-5xl">
            <Badge
              variant="secondary"
              className="mb-6 glass-card border-primary/30 text-base px-4 py-2"
            >
              แพลตฟอร์มการปฏิบัติตามกฎระเบียบด้วยการวิเคราะห์ข้อมูล
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-linear-to-r from-blue-200 via-cyan-200 to-blue-300 bg-clip-text text-transparent leading-tight">
              Discover Truth With ClariFind
            </h1>

            <p className="text-xl md:text-2xl text-foreground/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              ประเมินความเสี่ยงหรือแนวโน้มการเป็นนอมินีตาม{" "}
              <span className="text-primary font-semibold">23 ตัวบ่งชี้</span>{" "}
              ด้วยการวิเคราะห์ข้อมูลในหลากหลายมิติ
            </p>

            {/* ✅ ปุ่มค้นหา */}
            <QuickSearch onStartAnalyze={() => setIsAnalyzing(true)} />
          </div>
        </section>

        {/* Feature Section */}
        <section id="features" className="py-20 px-4 relative">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h3 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                ทำไมต้องเลือก ClariFind?
              </h3>
              <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
                แพลตฟอร์มของเราให้ข้อมูลเชิงลึกด้านการปฏิบัติตามกฎระเบียบอย่างครอบคลุม
                ด้วยความแม่นยำและความชัดเจนระดับมืออาชีพ
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
                    ประเมินบริษัทตาม 23 ตัวชี้วัดการปฏิบัติตามกฎระเบียบที่สำคัญ
                    ครอบคลุมการถือหุ้น และการเงิน
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
                    แดชบอร์ดระดับมืออาชีพที่ชัดเจน นำเสนอข้อมูลเชิงลึกในรูปแบบเข้าใจง่าย
                    เพื่อการตัดสินใจที่รวดเร็ว
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
                    สร้างขึ้นสำหรับเจ้าหน้าที่กำกับดูแล นักธุรกิจมืออาชีพ และนักวิเคราะห์
                    ที่ต้องการข้อมูลที่เชื่อถือได้และแม่นยำ
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border/50 glass-card">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <span className="text-xl font-bold bg-linear-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                ClariFind
              </span>
              <p className="text-foreground/60 text-center">
                แพลตฟอร์มประเมินการปฏิบัติตามกฎระเบียบทางธุรกิจระดับมืออาชีพ
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* ✅ แสดง Overlay ตอนกำลังวิเคราะห์ */}
      {isAnalyzing && <LoadingOverlay open={isAnalyzing} />}
    </div>
  );
}
