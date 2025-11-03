"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"   // ✅ เพิ่ม
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { LogIn, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { CosmicBackground } from "@/components/cosmic-background"
import { GradientOrbs } from "@/components/gradient-orbs"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // ✅ ตรวจว่ากรอกครบหรือยัง
    if (!username.trim() || !password.trim()) {
      setError("กรุณากรอกชื่อผู้ใช้และรหัสผ่าน")
      setIsLoading(false)
      return
    }

    try {
      const success = await login(username, password)
      if (success) {
        toast.success("เข้าสู่ระบบสำเร็จ 🎉", { theme: "colored" })
        router.push("/")
      } else {
        // ✅ ถ้ารหัสผิด
        toast.error("รหัสผู้ใช้หรือรหัสผ่านไม่ถูกต้อง", { theme: "colored" })
      }
    } catch (err) {
      console.error("[Login error]", err)
      toast.error("เกิดข้อผิดพลาดจากเซิร์ฟเวอร์", { theme: "colored" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <CosmicBackground />
      <GradientOrbs />

      <div className="relative" style={{ zIndex: 10 }}>
        <header className="border-b border-border/50 glass-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold bg-linear-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                  ClariFind
                </span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับ
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <Badge variant="secondary" className="mb-4 glass-card border-primary/30 text-base px-4 py-2">
                เข้าสู่ระบบ
              </Badge>
              <h1 className="text-4xl font-bold mb-4 bg-linear-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                ยินดีต้อนรับกลับ
              </h1>
              <p className="text-foreground/70">เข้าสู่ระบบเพื่อใช้งาน ClariFind</p>
            </div>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LogIn className="h-5 w-5 mr-2 text-primary" />
                  เข้าสู่ระบบ
                </CardTitle>
                <CardDescription>กรอกข้อมูลเพื่อเข้าสู่ระบบ</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">ชื่อผู้ใช้</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="กรอกชื่อผู้ใช้"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value)
                        if (error) setError("") 
                      }}

                      className="bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">รหัสผ่าน</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="กรอกรหัสผ่าน"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        if (error) setError("")
                      }}
                      className="bg-background/50 border-primary/20 focus:border-primary"
                    />
                  </div>

                  {/* ✅ แสดง error ใต้ฟอร์ม */}
                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <Button type="submit" className="w-full shadow-lg shadow-primary/30" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        เข้าสู่ระบบ
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
