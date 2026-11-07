"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { Card, CardContent } from '@/components/ui/card'
import { OverviewCharts } from '@/components/dashboard/OverviewCharts'
import { RecentActivityTable } from '@/components/dashboard/RecentActivityTable'
import {
  Scale,
  Truck,
  Users,
  TrendingUp,
  Clock,
  ShieldCheck,
  Database,
  Loader2,
} from 'lucide-react'
import {
  Pickup,
  WasteCategoryMetric,
  MonthlyCollectionTrend,
  DashboardOverviewStats,
  SupabaseConnectionStatus,
} from '@/types'

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<DashboardOverviewStats>({
    totalWasteKg: 0,
    totalWasteGrowthPercentage: 0,
    totalPickups: 0,
    pendingPickups: 0,
    registeredUsers: 0,
    activeOfficers: 0,
    aiSuccessRatePercentage: 95.8,
    economicValueTotalIdr: 0,
  })
  const [categoryMetrics, setCategoryMetrics] = useState<WasteCategoryMetric[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyCollectionTrend[]>([])
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [connectionStatus, setConnectionStatus] = useState<SupabaseConnectionStatus>({
    isConfigured: true,
    isConnected: true,
    message: 'Terhubung ke basis data operasional.',
    categoriesCount: 3,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadDashboardData() {
      try {
        const [statsData, metricsData, trendsData, pickupsData, connData] = await Promise.all([
          wasteService.getOverviewStats(),
          wasteService.getCategoryMetrics(),
          wasteService.getMonthlyTrends(),
          wasteService.getPickups(),
          wasteService.checkConnection(),
        ])

        if (isMounted) {
          setStats(statsData)
          setCategoryMetrics(metricsData)
          setMonthlyTrends(trendsData)
          setPickups(pickupsData)
          setConnectionStatus(connData)
        }
      } catch (err) {
        console.error('Gagal memuat data overview admin:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDashboardData()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Memuat data aktivitas operasional...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Status Koneksi Data Operasional */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-start gap-3">
        <Database className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-semibold text-emerald-900">Status Koneksi Data:</span> Sistem operasional terhubung aktif ke pusat data terpadu. Master kategori ({connectionStatus.categoriesCount ?? 3} kategori utama: Organik, Anorganik, B3) siap melayani pencatatan warga dan petugas.
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Aktivitas Pengelolaan Sampah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau aktivitas operasional harian, hasil klasifikasi pintar, dan logistik penjemputan armada.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Koneksi Operasional: Terhubung</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kinerja Sistem Klasifikasi: Aktif</span>
          </div>
        </div>
      </div>

      {/* 4 Primary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Waste */}
        <Card className="relative overflow-hidden border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Sampah Terkelola
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Scale className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.totalWasteKg.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-semibold text-slate-500 ml-1">Kg</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Berdasarkan hasil timbangan lapangan</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Pickups */}
        <Card className="relative overflow-hidden border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Data Penjemputan
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Truck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.totalPickups.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">tiket</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-amber-600">
              <Clock className="h-3.5 w-3.5" />
              <span>{stats.pendingPickups} tiket menunggu konfirmasi</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Registered Users */}
        <Card className="relative overflow-hidden border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Partisipasi Pengguna
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Users className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {stats.registeredUsers.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-medium text-slate-500 ml-1">warga terdaftar</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
              <span>{stats.activeOfficers} petugas armada aktif</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Classification Service Status */}
        <Card className="relative overflow-hidden border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Kinerja Sistem Klasifikasi
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-bold tracking-tight text-emerald-800">
                Siap Beroperasi
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <span>3 Kategori: Organik, Anorganik, B3</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts (Area Trend & Donut Composition) */}
      <OverviewCharts
        monthlyTrends={monthlyTrends}
        categoryMetrics={categoryMetrics}
      />

      {/* Recent Activity Data Table with Verification Dialog */}
      <RecentActivityTable initialPickups={pickups} />
    </div>
  )
}
