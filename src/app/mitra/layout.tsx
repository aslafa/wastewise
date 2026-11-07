"use client"

import React from 'react'
import { RoleDashboardLayout, RoleNavItem } from '@/components/layout/RoleDashboardLayout'
import {
  Building2,
  Package,
  Recycle,
  ReceiptText,
} from 'lucide-react'

const mitraNavItems: RoleNavItem[] = [
  { label: 'Penerimaan Material', href: '/mitra', icon: Building2 },
  { label: 'Batch Pengolahan', href: '/mitra/batches', icon: Package },
  { label: 'Hasil Daur Ulang', href: '/mitra/outputs', icon: Recycle },
  { label: 'Manifest Serah Terima', href: '/mitra/receipts', icon: ReceiptText },
]

export default function MitraLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout
      requiredRole="mitra"
      allowedRoles={['mitra', 'super_admin']}
      navItems={mitraNavItems}
      titlePrefix="Mitra Pengolahan & Bank Sampah"
    >
      {children}
    </RoleDashboardLayout>
  )
}

