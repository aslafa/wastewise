"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Truck,
  Sparkles,
  Scale,
  Users,
  FileBarChart2,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Database,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSupabaseConfigured } from '@/lib/supabase'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Overview', href: '/', icon: LayoutDashboard },
  { label: 'Manajemen Penjemputan', href: '/penjemputan', icon: Truck, badge: '12' },
  { label: 'Monitoring AI', href: '/ai-monitoring', icon: Sparkles },
  { label: 'Data Sampah', href: '/data-sampah', icon: Scale },
  { label: 'Manajemen Pengguna', href: '/pengguna', icon: Users },
  { label: 'Laporan & Statistik', href: '/laporan', icon: FileBarChart2 },
]

interface SidebarProps {
  onNavigate?: () => void
  isMobile?: boolean
}

export function Sidebar({ onNavigate, isMobile = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const isCollapsedEffective = !isMobile && collapsed

  const handleLinkClick = () => {
    if (onNavigate) {
      onNavigate()
    }
  }

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out select-none z-30 shrink-0 h-full",
        isMobile ? "w-72" : isCollapsedEffective ? "w-20" : "w-68"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-17 items-center justify-between px-5 border-b border-slate-100">
        <Link
          href="/"
          onClick={handleLinkClick}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 text-white shadow-sm shadow-green-600/20">
            <Leaf className="h-5 w-5" />
          </div>
          {(!isCollapsedEffective || isMobile) && (
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                Waste<span className="text-green-600">Wise</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 mt-1">
                AI Waste Platform
              </span>
            </div>
          )}
        </Link>

        {isMobile && onNavigate && (
          <button
            onClick={onNavigate}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Tutup menu navigasi"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2">
          {(!isCollapsedEffective || isMobile) && (
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Menu Utama
            </p>
          )}
        </div>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-green-50/80 text-green-700 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              title={isCollapsedEffective ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-green-600"
                    : "text-slate-500 group-hover:text-slate-700"
                )}
              />
              {(!isCollapsedEffective || isMobile) && (
                <span className="truncate flex-1">{item.label}</span>
              )}
              {(!isCollapsedEffective || isMobile) && item.badge && (
                <span
                  className={cn(
                    "ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full",
                    isActive
                      ? "bg-green-600 text-white"
                      : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-md bg-green-600" />
              )}
            </Link>
          )
        })}
      </div>

      {/* Supabase Status / System Badge */}
      <div className="p-3 border-t border-slate-100">
        {!isCollapsedEffective || isMobile ? (
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-slate-500" />
                Backend Status
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
                  isSupabaseConfigured
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", isSupabaseConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500")} />
                {isSupabaseConfigured ? 'Live' : 'Standby'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {isSupabaseConfigured
                ? 'Terhubung ke Supabase Cloud'
                : 'Mode Preview (Data Simulasi)'}
            </p>
          </div>
        ) : (
          <div className="flex justify-center" title="Supabase Engine Status">
            <div className={cn("h-2.5 w-2.5 rounded-full", isSupabaseConfigured ? "bg-emerald-500" : "bg-amber-500")} />
          </div>
        )}
      </div>

      {/* Desktop Collapse Toggle Button */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3.5 top-20 flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
          aria-label="Toggle sidebar collapse"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      )}
    </aside>
  )
}
