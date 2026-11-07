"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  ShieldCheck,
  Database,
  Lock,
  Activity,
  FileText,
  Users2,
  Sliders,
  ArrowRight,
  Server,
  Cpu,
  KeyRound,
} from 'lucide-react'

export default function SuperAdminOverviewPage() {
  return (
    <div className="space-y-6">
      {/* Super Admin Welcome Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50 via-white to-purple-50/50 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-900 uppercase tracking-wider">
                Hak Akses Tertinggi • Super Administrator
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              WasteWise System Control & Governance
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pengawasan keamanan sistem, audit trail, parameter PostgreSQL, dan hak akses multi-role.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/admin">
              <Button variant="outline" className="text-xs border-indigo-200 text-indigo-900 hover:bg-indigo-50 rounded-xl h-10 gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Buka Dashboard Operasional</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Health Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Tabel PostgreSQL Terproteksi</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Database className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">24 / 24</span>
              <span className="text-xs font-semibold text-slate-500 ml-1">tabel</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <Lock className="h-3 w-3" />
              <span>RLS 100% Aktif & Enforced</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Admin Terdaftar</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">3</span>
              <span className="text-xs font-semibold text-slate-500 ml-1">akun aktif</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              1 Super Admin • 2 Admin Wilayah
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Audit Logs Tercatat</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <FileText className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">142</span>
              <span className="text-xs font-semibold text-slate-500 ml-1">peristiwa</span>
            </div>
            <div className="mt-2 text-[11px] text-purple-700 font-medium">
              Jejak audit append-only
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Status Gateway Auth</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <KeyRound className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold tracking-tight text-slate-900">GoTrue JWT</span>
            </div>
            <div className="mt-2 text-[11px] text-sky-700 font-medium">
              Role escalation blocked by trigger
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Super Admin Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/super-admin/admins" className="group">
          <Card className="h-full border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                  <Users2 className="h-4 w-4 text-indigo-600" />
                  Manajemen Akun Admin
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Kelola daftar staf admin kota, tetapkan role, dan cabut wewenang operasional.
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/settings" className="group">
          <Card className="h-full border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-600" />
                  Pengaturan Sistem Global
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Konfigurasi jam operasional armada, kebijakan limbah B3, dan parameter sistem.
            </CardContent>
          </Card>
        </Link>

        <Link href="/super-admin/audit-logs" className="group">
          <Card className="h-full border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Audit Trail & Log Keamanan
                </CardTitle>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardHeader>
            <CardContent className="text-xs text-slate-500">
              Pantau seluruh riwayat mutasi status, verifikasi timbangan, dan pembatalan order.
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

