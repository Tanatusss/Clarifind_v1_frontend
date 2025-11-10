"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, User } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    console.log("[v0] Logout button clicked")
    logout()
    router.push("/")
  }

  return (
    <header className="border-b border-border/50 glass-card sticky top-0 z-[200 isolate">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-linear-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
              ClariFind
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            {!loading && (
              <>
                {user ? (
                  <DropdownMenu>
                    {/* ใช้ Trigger ตรง ๆ ไม่ใช้ asChild */}
                    <DropdownMenuTrigger
                      className="relative z-210 inline-flex items-center gap-2 rounded-md px-3 py-2 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      <User className="mr-1 h-4 w-4" />
                      {user.username}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="z-220 bg-background border"
                    >
                      <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>


                ) : (
                  <Button asChild className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    <Link href="/login">
                      <LogIn className="mr-2 h-4 w-4" />
                      Login
                    </Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
