import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import Providers from "./providers"
import { ToastProvider } from "@/components/toast-provider"

export const metadata: Metadata = {
  title: "ClariFind - การวิเคราะห์การปฏิบัติตามกฎระเบียบทางธุรกิจระดับมืออาชีพ",
  description: "แพลตฟอร์มขั้นสูงเพื่อประเมินบริษัทตาม 23 ตัวชี้วัดการปฏิบัติตามกฎระเบียบ ด้วยการวิเคราะห์ระดับฟินเทคมืออาชีพ",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          <Suspense fallback={null}>{children}</Suspense>
        </Providers>
        <Analytics />
        <ToastProvider />
      </body>
    </html>
  )
}
