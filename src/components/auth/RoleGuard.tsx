"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { UserRole } from '@/types'
import { ShieldAlert, ArrowLeft, Loader2, Leaf } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

const ROLE_DASHBOARD_PATHS: Record<UserRole, string> = {
  admin: '/admin',
  super_admin: '/super-admin',
  petugas: '/petugas',
  mitra: '/mitra',
  warga: '/warga',
}

const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  admin: 'Administrator',
  super_admin: 'Super Admin',
  petugas: 'Petugas Lapangan',
  mitra: 'Mitra Pengolahan',
  warga: 'Warga',
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { role, isAuthenticated, isLoading, profile } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-md shadow-green-500/20">
            <Leaf className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            WasteWise
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-green-600" />
          <span>Memverifikasi hak akses session...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (role && !allowedRoles.includes(role)) {
    const userRoleName = ROLE_DISPLAY_NAMES[role] || role
    const targetDashboard = ROLE_DASHBOARD_PATHS[role] || '/login'

    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-5">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Akses Terbatas (403 Forbidden)
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Halaman ini membutuhkan hak akses khusus <span className="font-semibold text-slate-800">{allowedRoles.map(r => ROLE_DISPLAY_NAMES[r]).join(' / ')}</span>.
          </p>
          <div className="my-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-left">
            <div className="text-slate-400">Akun Anda:</div>
            <div className="font-semibold text-slate-800">{profile?.full_name || profile?.email}</div>
            <div className="text-slate-500">Role Terdeteksi: <span className="font-semibold text-emerald-700 capitalize">{userRoleName}</span></div>
          </div>
          <p className="text-[11px] text-slate-400 mb-6">
            Sistem keamanan WasteWise mencegah akses lintas role via URL manual.
          </p>
          <Button
            onClick={() => router.push(targetDashboard)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl h-10 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Dashboard {userRoleName}
          </Button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

