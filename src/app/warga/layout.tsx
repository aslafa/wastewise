"use client"

import React from 'react'
import { RoleDashboardLayout, RoleNavItem } from '@/components/layout/RoleDashboardLayout'
import {
  LayoutDashboard,
  CalendarPlus,
  Truck,
  History,
  Gift,
  Home,
} from 'lucide-react'

const wargaNavItems: RoleNavItem[] = [
  { label: 'Beranda Warga', href: '/warga', icon: LayoutDashboard },
  { label: 'Ajukan Penjemputan', href: '/warga/ajukan', icon: CalendarPlus },
  { label: 'Status Penjemputan', href: '/warga/penjemputan', icon: Truck, badge: '1' },
  { label: 'Riwayat & Poin', href: '/warga/riwayat', icon: History },
  { label: 'Tukar Reward', href: '/warga/reward', icon: Gift },
  { label: 'Halaman Utama Publik', href: '/', icon: Home },
]

export default function WargaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout
      requiredRole="warga"
      allowedRoles={['warga']}
      navItems={wargaNavItems}
      titlePrefix="Layanan Warga"
    >
      {children}
    </RoleDashboardLayout>
  )
}

