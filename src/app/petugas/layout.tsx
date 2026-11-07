"use client"

import React from 'react'
import { RoleDashboardLayout, RoleNavItem } from '@/components/layout/RoleDashboardLayout'
import {
  ClipboardList,
  Truck,
  Scale,
  History,
} from 'lucide-react'

const petugasNavItems: RoleNavItem[] = [
  { label: 'Ringkasan Tugas', href: '/petugas', icon: ClipboardList },
  { label: 'Tugas Penjemputan', href: '/petugas/tugas', icon: Truck, badge: '4' },
  { label: 'Verifikasi Timbangan', href: '/petugas/verifikasi', icon: Scale },
  { label: 'Riwayat Pekerjaan', href: '/petugas/riwayat', icon: History },
]

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleDashboardLayout
      requiredRole="petugas"
      allowedRoles={['petugas']}
      navItems={petugasNavItems}
      titlePrefix="Armada Petugas"
    >
      {children}
    </RoleDashboardLayout>
  )
}

