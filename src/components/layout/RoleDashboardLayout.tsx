"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { NotificationPopover } from '@/components/layout/NotificationPopover'
import { cn } from '@/lib/utils'
import {
  Leaf,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Building2,
  ChevronRight as ArrowRightIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export interface RoleNavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
}

interface RoleDashboardLayoutProps {
  children: React.ReactNode
  requiredRole: UserRole
  allowedRoles?: UserRole[]
  navItems: RoleNavItem[]
  titlePrefix: string
}

const ROLE_THEMES: Record<UserRole, { badgeText: string; badgeClass: string; icon: React.ElementType }> = {
  admin: {
    badgeText: 'Administrator',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: ShieldCheck,
  },
  super_admin: {
    badgeText: 'Super Admin',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    icon: Sparkles,
  },
  petugas: {
    badgeText: 'Petugas Lapangan',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    icon: Truck,
  },
  mitra: {
    badgeText: 'Mitra Pengolahan',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: Building2,
  },
  warga: {
    badgeText: 'Warga',
    badgeClass: 'bg-green-50 text-green-800 border-green-200',
    icon: Leaf,
  },
}

export function RoleDashboardLayout({
  children,
  requiredRole,
  allowedRoles,
  navItems,
  titlePrefix,
}: RoleDashboardLayoutProps) {
  const { profile, signOut, isDemoSession } = useAuth()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const rolesAllowed = allowedRoles || [requiredRole, ...(requiredRole === 'admin' ? (['super_admin'] as UserRole[]) : [])]
  const theme = ROLE_THEMES[profile?.role || requiredRole] || ROLE_THEMES.admin
  const RoleIcon = theme.icon

  // Temukan nama halaman saat ini dari navItems
  const currentItem = navItems.find((item) => item.href === pathname)
  const currentTitle = currentItem ? currentItem.label : titlePrefix

  return (
    <RoleGuard allowedRoles={rolesAllowed}>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        {/* DESKTOP SIDEBAR */}
        <aside
          className={cn(
            "hidden md:flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out select-none z-30 shrink-0 h-screen sticky top-0",
            collapsed ? "w-20" : "w-68"
          )}
        >
          {/* Brand & Logo */}
          <div className="flex h-17 items-center justify-between px-5 border-b border-slate-100">
            <Link href={navItems[0]?.href || '/'} className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md shadow-green-600/20">
                <Leaf className="h-5 w-5" />
              </div>
              {!collapsed && (
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-base tracking-tight text-slate-900 leading-none">
                    WasteWise
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 mt-0.5 tracking-wider uppercase">
                    {titlePrefix}
                  </span>
                </div>
              )}
            </Link>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
              aria-label={collapsed ? "Perluas menu" : "Ciutkan menu"}
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Role Status Tag */}
          {!collapsed && (
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Hak Akses Aktif
                </span>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", theme.badgeClass)}>
                  {theme.badgeText}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all relative",
                    isActive
                      ? "bg-green-600 text-white shadow-xs shadow-green-600/20"
                      : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900",
                    collapsed && "justify-center px-0"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon
                    className={cn(
                      "h-4.5 w-4.5 shrink-0 transition-transform duration-200",
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700",
                      !isActive && "group-hover:scale-110"
                    )}
                  />
                  {!collapsed && (
                    <span className="truncate flex-1">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Profile Card & Logout */}
          <div className="border-t border-slate-100 p-3 bg-slate-50/50">
            <div className={cn("flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs", collapsed && "justify-center p-1.5")}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-semibold text-xs">
                {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'WW'}
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {profile?.full_name || profile?.email}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                    <RoleIcon className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span>{theme.badgeText}</span>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className={cn("w-full mt-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl gap-2 h-8", collapsed && "px-0 justify-center")}
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {!collapsed && <span>Keluar (Logout)</span>}
            </Button>
          </div>
        </aside>

        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative flex flex-col bg-white shadow-2xl z-10 w-72 h-full">
              <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
                    <Leaf className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="font-bold text-sm tracking-tight text-slate-900">WasteWise</span>
                    <div className="text-[10px] text-emerald-700 font-semibold">{titlePrefix}</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold",
                        isActive ? "bg-green-600 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <span className="ml-auto bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="border-t border-slate-100 p-4">
                <Button
                  variant="outline"
                  onClick={signOut}
                  className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50 h-9 gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Keluar</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex flex-1 flex-col overflow-hidden min-w-0">
          {/* HEADER */}
          <header className="sticky top-0 z-20 flex h-17 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileOpen(true)}
                className="md:hidden text-slate-600"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm">
                <span className="text-slate-400 font-medium">WasteWise</span>
                <ArrowRightIcon className="h-3.5 w-3.5 text-slate-300" />
                <span className="text-slate-400 hidden sm:inline">{titlePrefix}</span>
                <ArrowRightIcon className="h-3.5 w-3.5 text-slate-300 hidden sm:inline" />
                <span className="font-semibold text-slate-900">{currentTitle}</span>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Role Indicator Badge */}
              <div className={cn("hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border", theme.badgeClass)}>
                <RoleIcon className="h-3.5 w-3.5" />
                <span>{theme.badgeText}</span>
              </div>

              {/* Demo Mode Badge */}
              {isDemoSession && (
                <Badge variant="outline" className="hidden lg:inline-flex text-[10px] border-amber-300 bg-amber-50 text-amber-800">
                  Mode Simulasi
                </Badge>
              )}

              {/* Notifications Popover */}
              <NotificationPopover />

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              {/* Profile Pill */}
              <div className="flex items-center gap-2 pl-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-xs">
                  {profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'WW'}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 truncate max-w-[140px]">
                    {profile?.full_name || 'Pengguna'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                    {profile?.email}
                  </span>
                </div>
              </div>

              {/* Header Logout Icon */}
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                title="Keluar (Logout)"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 h-9 w-9 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* MAIN PAGE CONTENT */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </RoleGuard>
  )
}

