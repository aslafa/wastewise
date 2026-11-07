"use client"

import React from 'react'
import { RoleDashboardLayout, RoleNavItem } from '@/components/layout/RoleDashboardLayout'
import {
  ShieldAlert,
  Users2,
  Sliders,
  FileText,
  LayoutDashboard,
  ShieldCheck,
} from 'lucide-react'

const superAdminNavItems: RoleNavItem[] = [
  { label: 'Platform Health & Overview', href: '/super-admin', icon: LayoutDashboard },
  { label: 'Manajemen Akun Admin', href: '/super-admin/admins', icon: Users2 },
  { label: 'Pengaturan Sistem', href: '/super-admin/settings', icon: Sliders },
  { label: 'Audit Logs & Keamanan', href: '/super-admin/audit-logs', icon: FileText },
  { label: 'Dashboard Operasional', href: '/admin', icon: ShieldCheck },
]

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout
      requiredRole="super_admin"
      allowedRoles={['super_admin']}
      navItems={superAdminNavItems}
      titlePrefix="Super Admin Portal"
    >
      {children}
    </RoleDashboardLayout>
  )
}

