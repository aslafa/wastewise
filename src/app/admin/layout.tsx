"use client"

import React from 'react'
import { RoleDashboardLayout, RoleNavItem } from '@/components/layout/RoleDashboardLayout'
import {
  LayoutDashboard,
  Truck,
  Sparkles,
  Scale,
  Users,
  FileBarChart2,
} from 'lucide-react'

const adminNavItems: RoleNavItem[] = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Manajemen Penjemputan', href: '/admin/penjemputan', icon: Truck, badge: '12' },
  { label: 'Monitoring AI', href: '/admin/ai-monitoring', icon: Sparkles },
  { label: 'Data Sampah', href: '/admin/data-sampah', icon: Scale },
  { label: 'Manajemen Pengguna', href: '/admin/pengguna', icon: Users },
  { label: 'Laporan & Statistik', href: '/admin/laporan', icon: FileBarChart2 },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout
      requiredRole="admin"
      allowedRoles={['admin', 'super_admin']}
      navItems={adminNavItems}
      titlePrefix="Admin Operations"
    >
      {children}
    </RoleDashboardLayout>
  )
}

