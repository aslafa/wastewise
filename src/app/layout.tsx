import type { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@/context/AuthContext"
import { WawiMascot } from "@/components/mascot/WawiMascot"

export const metadata: Metadata = {
  title: "WasteWise - AI + Smart Waste Management Platform",
  description: "Platform pengelolaan sampah pintar berbasis Artificial Intelligence untuk pemilahan, penjemputan, dan analitik daur ulang.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full bg-[#F8FAFC] text-slate-900">
        <AuthProvider>
          {children}
          {/* WAWI — WasteWise Mascot Assistant */}
          <WawiMascot />
        </AuthProvider>
      </body>
    </html>
  )
}
