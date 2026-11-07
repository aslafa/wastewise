"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import {
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Menu,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { NotificationPopover } from '@/components/layout/NotificationPopover'

const pathTitles: Record<string, string> = {
  '/': 'Overview',
  '/penjemputan': 'Manajemen Penjemputan',
  '/ai-monitoring': 'Monitoring AI',
  '/data-sampah': 'Data & Timbangan Sampah',
  '/pengguna': 'Manajemen Pengguna',
  '/laporan': 'Laporan & Statistik',
}

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const currentTitle = pathTitles[pathname] || 'Dashboard'

  return (
    <header className="sticky top-0 z-20 flex h-17 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        {onMobileMenuToggle && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="md:hidden text-slate-600"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm">
          <span className="text-slate-400 font-medium">WasteWise</span>
          <ChevronRight className="h-4 w-4 text-slate-300" />
          <span className="font-semibold text-slate-900">{currentTitle}</span>
        </nav>
      </div>

      {/* Right: Search, Notifications & Admin Info */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div className="relative hidden sm:block w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari data, ID jadwal, warga..."
            className="pl-9 h-9 text-xs bg-slate-50/70 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Notifications Popover */}
        <NotificationPopover />

        <div className="h-5 w-px bg-slate-200 hidden sm:block" />

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs">
            AD
          </div>
          <div className="hidden lg:flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-900">
                Administrator
              </span>
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            </div>
            <span className="text-[10px] text-slate-400">
              admin@wastewise.id
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

