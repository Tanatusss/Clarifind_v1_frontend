"use client";

import { useState } from "react";
import { Search, Building2, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { toast } from "react-toastify";
import { resolveCompany } from "@/lib/companyApi";

export function QuickSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"company-name" | "registration-number">(
    "registration-number" // ✅ ตั้งค่าเริ่มต้นเป็นเลขทะเบียน (ใช้งานได้จริงแล้ว)
  );
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, token } = useAuth() as { user: any; token?: string }; // ให้มี token ด้วย

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      router.push("/login");
      return;
    }
    if (!searchQuery.trim()) {
      toast.warning("กรุณากรอกคำค้นหา", { theme: "colored" });
      return;
    }

    // ⛳ ยังไม่เปิดค้นหาด้วยชื่อบริษัท
    if (searchType === "company-name") {
      toast.info("ค้นหาด้วยชื่อบริษัทยังไม่พร้อมใช้งาน (Coming soon...)", { theme: "colored" });
      return;
    }

    // ✅ ใช้เลขทะเบียน → ยิง /v1/company/resolve เพื่อตรวจว่ามีบริษัทจริง
    try {
      setIsLoading(true);

      const regId = searchQuery.trim();
      const res = await resolveCompany(regId); // ตรวจว่ามีบริษัทจริง

      // (ออปชัน) เก็บ company object ไว้ให้หน้า /results ใช้ทันที เพื่อลด 1 คิวรี
      if (res?.company) {
        sessionStorage.setItem("CF_LAST_COMPANY", JSON.stringify(res.company));
      }

      // ไปหน้า results โดยส่ง registration_id
      router.push(`/results?registration_id=${encodeURIComponent(regId)}`);
    } catch (err: any) {
      console.error(err);
      if (err?.status === 401) {
        toast.error("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่", { theme: "colored" });
        router.push("/login");
        return;
      }
      toast.error("ไม่พบข้อมูลบริษัทในระบบ", { theme: "colored" });
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
              <Icon
                className={`h-5 w-5 ${
                  isActive ? (type.color === "cyan" ? "text-cyan-400" : "text-primary") : "text-foreground/60"
                }`}
              />
              <span className={`text-sm font-medium ${isActive ? "text-foreground" : "text-foreground/60"}`}>
                {type.label}
              </span>
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
      </form>

      <p className="text-center text-sm text-foreground/50 mt-4">
        {!user
          ? "กรุณาเข้าสู่ระบบเพื่อค้นหาและวิเคราะห์ข้อมูล"
          : "ค้นหาและวิเคราะห์ข้อมูลการปฏิบัติตามกฎระเบียบด้วย 23 ตัวบ่งชี้"}
      </p>
    </div>
  );
}
