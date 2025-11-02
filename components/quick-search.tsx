"use client";

import { useState } from "react";
import { Search, Building2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-toastify";
import { resolveCompany } from "@/lib/companyApi";
import { prefetchSummary } from "@/lib/indicator-api"; 
import { LoadingOverlay } from "@/components/LoadingOverlay";
import { ANALYSIS_TOTAL_MS } from "@/components/step-loading-animation";

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export function QuickSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] =
    useState<"company-name" | "registration-number">("registration-number");
  const [isLoading, setIsLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const router = useRouter();
  const { user } = useAuth() as { user: any; token?: string };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return router.push("/login");

    const q = searchQuery.trim();
    if (!q) return toast.warning("กรุณากรอกคำค้นหา", { theme: "colored" });

    if (searchType === "company-name") {
      return toast.info("ค้นหาด้วยชื่อบริษัทยังไม่พร้อมใช้งาน (Coming soon...)", { theme: "colored" });
    }

    if (!/^\d{8,13}$/.test(q)) {
      return toast.warning("รูปแบบเลขทะเบียนไม่ถูกต้อง (ควรเป็นตัวเลข 8–13 หลัก)", { theme: "colored" });
    }

    try {
      setIsLoading(true);

      // 1) ตรวจว่ามีบริษัทจริงก่อน
      const res = await resolveCompany(q);
      const company = res?.company;
      if (!company?.registration_id) {
        return toast.error("ไม่พบข้อมูลบริษัทในระบบ", { theme: "colored" });
      }
      sessionStorage.setItem("CF_LAST_COMPANY", JSON.stringify(company));

      // 2) เปิด overlay แล้วรอ “พรีเฟตช์ summary + เวลาอนิเมชัน”
      setShowOverlay(true);
      await Promise.all([
        prefetchSummary(company.registration_id), // ✅ เฉพาะ summary
        sleep(ANALYSIS_TOTAL_MS),                // ให้ตรงกับ mock
      ]);

      // 3) ไปหน้า results
      router.push(`/results?registration_id=${encodeURIComponent(company.registration_id)}&prefetched=1`);
    } catch (err: any) {
      console.error(err);
      setShowOverlay(false);
      if (err?.status === 401) {
        toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", { theme: "colored" });
        router.push("/login");
      } else if (err?.status === 404) {
        toast.error("ไม่พบข้อมูลตัวชี้วัดของบริษัทนี้", { theme: "colored" });
      } else {
        toast.error("เกิดข้อผิดพลาด ไม่สามารถค้นหาได้", { theme: "colored" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const searchTypes = [
    { id: "company-name" as const, label: "ชื่อบริษัท", icon: Building2, color: "primary" },
    { id: "registration-number" as const, label: "เลขทะเบียนนิติบุคคล", icon: Hash, color: "cyan" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <LoadingOverlay open={showOverlay} />

      {/* ปุ่มเลือกประเภทการค้นหา */}
      <div className="flex justify-center gap-3 mb-6">
        {searchTypes.map((type) => {
          const Icon = type.icon;
          const isActive = searchType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => setSearchType(type.id)}
              className={`glass-card px-6 py-3 rounded-full border transition-all duration-300 flex items-center gap-2 hover-lift ${
                isActive
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

      {/* ช่องค้นหา */}
      <form onSubmit={handleSearch} className="relative">
        <div className="glass-card rounded-2xl border-primary/30 p-2 shadow-2xl shadow-primary/10 hover:shadow-primary/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-foreground/40" />
              <Input
                type="text"
                placeholder={`ค้นหา${searchTypes.find((t) => t.id === searchType)?.label}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg bg-background/50 border-0 focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
              />
            </div>
            <Button type="submit" size="lg" disabled={isLoading} className="px-8 py-6 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-xl">
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
          {!user ? "กรุณาเข้าสู่ระบบเพื่อค้นหาและวิเคราะห์ข้อมูล" : "ค้นหาและวิเคราะห์ข้อมูลการปฏิบัติตามกฎระเบียบด้วย 23 ตัวบ่งชี้"}
        </p>
      </form>
    </div>
  );
}
