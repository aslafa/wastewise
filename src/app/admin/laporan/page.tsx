"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { OverviewCharts } from '@/components/dashboard/OverviewCharts'
import { ReportActionButtons } from '@/components/dashboard/ReportActionButtons'
import { Calendar, FileBarChart2, Loader2 } from 'lucide-react'
import { WasteCategoryMetric, MonthlyCollectionTrend, DashboardOverviewStats } from '@/types'

export default function LaporanPage() {
  const [categoryMetrics, setCategoryMetrics] = useState<WasteCategoryMetric[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyCollectionTrend[]>([])
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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadReportData() {
      try {
        const [metricsData, trendsData, statsData] = await Promise.all([
          wasteService.getCategoryMetrics(),
          wasteService.getMonthlyTrends(),
          wasteService.getOverviewStats(),
        ])

        if (isMounted) {
          setCategoryMetrics(metricsData)
          setMonthlyTrends(trendsData)
          setStats(statsData)
        }
      } catch (err) {
        console.error('Gagal memuat data laporan:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadReportData()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Memuat data laporan dan analitik...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Information Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-start gap-3 print:hidden">
        <FileBarChart2 className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-semibold text-emerald-900">Laporan Konsolidasi Operasional:</span> Data agregasi tonase dan valuasi ekonomi di bawah terakumulasi secara otomatis dari tiket penjemputan warga yang telah diselesaikan oleh armada petugas lapangan.
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Laporan & Analitik Pengelolaan Sampah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ekspor rekapitulasi data statistik berkala untuk dinas lingkungan hidup dan mitra Bank Sampah.
          </p>
        </div>
        <ReportActionButtons
          categoryMetrics={categoryMetrics}
          monthlyTrends={monthlyTrends}
        />
      </div>

      {/* Summary KPI Cards for Report */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Total Akumulasi Tonase</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            {stats.totalWasteKg.toLocaleString('id-ID')} Kg
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Periode semester berjalan</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Total Transaksi Penjemputan</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{stats.totalPickups} Jadwal</p>
          <span className="text-[11px] text-slate-500">Tercatat di log aplikasi</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Estimasi Reduksi Emisi</p>
          <p className="text-xl font-bold text-emerald-700 mt-1">
            {(stats.totalWasteKg * 0.85).toFixed(1)} Kg CO₂e
          </p>
          <span className="text-[11px] text-emerald-600">Potensi daur ulang & kompos</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4">
          <p className="text-xs font-medium text-slate-400">Estimasi Nilai Ekonomi</p>
          <p className="text-xl font-bold text-slate-900 mt-1">
            Rp {stats.economicValueTotalIdr.toLocaleString('id-ID')}
          </p>
          <span className="text-[11px] text-slate-500">Valuasi Bank Sampah</span>
        </div>
      </div>

      {/* Charts Section */}
      <OverviewCharts
        monthlyTrends={monthlyTrends}
        categoryMetrics={categoryMetrics}
      />

      {/* Detailed Category Table using shadcn/ui Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">
                Tabel Rekapitulasi Kategori Sampah Terpilah
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Rincian proporsi materi, penjemputan, dan valuasi ekonomi yang teregister di sistem.
              </CardDescription>
            </div>
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Tahun 2026
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori Sampah</TableHead>
                <TableHead>Frekuensi Penjemputan</TableHead>
                <TableHead>Total Bobot (Kg)</TableHead>
                <TableHead>Proporsi (%)</TableHead>
                <TableHead>Estimasi Nilai Ekonomi</TableHead>
                <TableHead>Tujuan Pengolahan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryMetrics.map((cat) => (
                <TableRow key={cat.category} className="hover:bg-slate-50/60">
                  <TableCell className="font-bold text-slate-900">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.category}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">
                    {cat.pickup_count} kali
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-slate-900">
                    {cat.total_weight_kg.toLocaleString('id-ID')} Kg
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-700">
                    {cat.percentage}%
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-700">
                    {cat.economic_value_idr > 0
                      ? `Rp ${cat.economic_value_idr.toLocaleString('id-ID')}`
                      : 'Biaya Pengolahan Khusus (B3)'}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {cat.category === 'Organik'
                      ? 'Pengomposan & Biogas'
                      : cat.category === 'Anorganik'
                      ? 'Daur Ulang Plastik/Kertas/Logam'
                      : 'Insinerator Berizin Limbah B3'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
