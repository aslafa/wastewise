"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { AIClassificationLog, WasteCategory, AIModelEvaluationMetrics, DbWasteSubcategory } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Cpu,
  ShieldAlert,
  Search,
  Info,
  CheckCheck,
  RotateCcw,
  Recycle,
  BarChart3,
  Scale,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react'

export default function AIMonitoringPage() {
  const [logs, setLogs] = useState<AIClassificationLog[]>([])
  const [subcategories, setSubcategories] = useState<DbWasteSubcategory[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState<'all' | WasteCategory>('all')
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'verified' | 'corrected' | 'unverified'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    let isMounted = true
    setIsLoading(true)

    Promise.all([
      wasteService.getAILogs(),
      wasteService.getWasteSubcategories(),
    ]).then(([aiRes, subcatRes]) => {
      if (isMounted) {
        setLogs(aiRes.logs)
        setSubcategories(subcatRes.subcategories)
        setIsLive(aiRes.isLive)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  // Hitung metrik evaluasi ilmiah (Confusion Matrix, Precision, Recall, F1)
  const evalMetrics: AIModelEvaluationMetrics = wasteService.evaluateModelMetrics(logs)

  const filteredLogs = logs.filter((log) => {
    const matchesCategory = categoryFilter === 'all' ? true : log.predicted_category === categoryFilter

    let matchesVerification = true
    if (verificationFilter === 'verified') matchesVerification = log.is_verified_by_officer && !log.is_corrected
    else if (verificationFilter === 'corrected') matchesVerification = Boolean(log.is_corrected)
    else if (verificationFilter === 'unverified') matchesVerification = !log.is_verified_by_officer

    const matchesSearch =
      log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.predicted_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.selected_subcategory && log.selected_subcategory.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesCategory && matchesVerification && matchesSearch
  })

  // Hitung sebaran material bahan baku pengolahan
  const subcategoryCounts = logs.reduce((acc, l) => {
    const subcat = l.selected_subcategory || (l.predicted_category === 'Organik' ? 'Organik Umum' : l.predicted_category === 'Anorganik' ? 'Anorganik Umum' : 'Limbah B3')
    acc[subcat] = (acc[subcat] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Status Koneksi Data Indikator */}
      <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            {isLive
              ? 'Tersinkronisasi langsung dengan pusat data klasifikasi. Hasil pemindaian sampah dari aplikasi terhubung secara real-time.'
              : 'Status Koneksi: Memuat riwayat pemilahan sampah dan hasil verifikasi lapangan.'}
          </span>
        </div>
        <Badge variant="outline" className={isLive ? 'border-emerald-300 text-emerald-800 font-bold' : 'border-slate-300 text-slate-700 font-bold'}>
          {isLive ? 'DATA AKTIF' : 'TERKONEKSI'}
        </Badge>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Evaluasi Kinerja Sistem & Verifikasi Lapangan
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Evaluasi Kinerja Pemilahan Sampah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pelacakan hasil pemilahan cerdas, distribusi 3 kategori utama (Organik, Anorganik, B3), dan perbandingan dengan verifikasi fisik petugas.
          </p>
        </div>
      </div>

      {/* Ringkasan Operasional Klasifikasi */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Total Klasifikasi</span>
            <div className="mt-2 text-2xl font-extrabold text-slate-900">
              {logs.length} <span className="text-xs font-normal text-slate-400">pemindaian</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Dari seluruh warga dan pengguna aplikasi</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Distribusi Kategori Utama</span>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="organik" className="text-xs">
                Org: {logs.filter((l) => l.predicted_category === 'Organik').length}
              </Badge>
              <Badge variant="anorganik" className="text-xs">
                Anorg: {logs.filter((l) => l.predicted_category === 'Anorganik').length}
              </Badge>
              <Badge variant="b3" className="text-xs">
                B3: {logs.filter((l) => l.predicted_category === 'B3').length}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">3 kelas klasifikasi utama sistem</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-white shadow-xs">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500">Verifikasi Petugas Lapangan</span>
            <div className="mt-2 text-2xl font-extrabold text-emerald-700">
              {logs.filter((l) => l.is_verified_by_officer).length}{' '}
              <span className="text-xs font-normal text-slate-400">
                / {logs.length} terverifikasi
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {logs.filter((l) => !l.is_verified_by_officer).length} menunggu pemeriksaan fisik saat penjemputan
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Metrik Evaluasi Ilmiah & Confusion Matrix */}
      {evalMetrics.hasEnoughData ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-200/80 bg-gradient-to-br from-emerald-50/50 to-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Akurasi Validasi</span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold">
                    Accuracy
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{evalMetrics.accuracyPct}%</span>
                  <span className="text-xs text-slate-500">({evalMetrics.totalEvaluated} sampel)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Kesesuaian prediksi vs label riil</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-gradient-to-br from-sky-50/50 to-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Presisi Rata-Rata</span>
                  <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-800 border-sky-200 font-bold">
                    Precision
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{evalMetrics.precisionPct}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Ketepatan deteksi per kategori</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-gradient-to-br from-indigo-50/50 to-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Recall</span>
                  <Badge variant="outline" className="text-[10px] bg-indigo-50 text-indigo-800 border-indigo-200 font-bold">
                    Recall
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{evalMetrics.recallPct}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Cakupan tangkapan sampah riil</p>
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 bg-gradient-to-br from-purple-50/50 to-white shadow-xs">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">F1-Score</span>
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-800 border-purple-200 font-bold">
                    F1
                  </Badge>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{evalMetrics.f1ScorePct}%</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Keseimbangan presisi & recall</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                Confusion Matrix Hasil Verifikasi Fisik
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Tabel silang antara label fisik petugas (Baris) dan prediksi sistem (Kolom).
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-center border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-slate-400 font-semibold text-[11px]">Hasil Fisik \ Prediksi</th>
                      <th className="p-2 font-bold text-emerald-700 bg-emerald-50/50 rounded-t-md">Pred: Organik</th>
                      <th className="p-2 font-bold text-sky-700 bg-sky-50/50 rounded-t-md">Pred: Anorganik</th>
                      <th className="p-2 font-bold text-red-700 bg-red-50/50 rounded-t-md">Pred: B3</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    <tr>
                      <td className="p-2.5 text-left font-bold text-slate-700 bg-slate-50">Fisik: Organik</td>
                      <td className="p-2.5 font-bold text-emerald-800 bg-emerald-100/60 rounded">
                        {evalMetrics.confusionMatrix.matrix['Organik']['Organik']}
                      </td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['Organik']['Anorganik']}
                      </td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['Organik']['B3']}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-left font-bold text-slate-700 bg-slate-50">Fisik: Anorganik</td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['Anorganik']['Organik']}
                      </td>
                      <td className="p-2.5 font-bold text-sky-800 bg-sky-100/60 rounded">
                        {evalMetrics.confusionMatrix.matrix['Anorganik']['Anorganik']}
                      </td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['Anorganik']['B3']}
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2.5 text-left font-bold text-slate-700 bg-slate-50">Fisik: B3</td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['B3']['Organik']}
                      </td>
                      <td className="p-2.5 text-slate-600 bg-slate-50/40">
                        {evalMetrics.confusionMatrix.matrix['B3']['Anorganik']}
                      </td>
                      <td className="p-2.5 font-bold text-red-800 bg-red-100/60 rounded">
                        {evalMetrics.confusionMatrix.matrix['B3']['B3']}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-slate-200/80 bg-slate-50/50 shadow-xs">
          <CardContent className="p-6 text-center space-y-2.5">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Belum Cukup Data untuk Evaluasi Ilmiah
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Penghitungan metrik Akurasi, Presisi, Recall, dan Confusion Matrix yang valid memerlukan minimal 10 sampel sampah yang telah diverifikasi fisik oleh petugas lapangan. Saat ini baru tersedia {evalMetrics.totalEvaluated} data berlabel terverifikasi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Informasi Pemilahan Subkategori Manual Petugas */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Recycle className="h-4 w-4 text-emerald-600" />
            Pemilahan Subkategori Material oleh Petugas Lapangan
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Sistem klasifikasi otomatis mengelompokkan sampah ke dalam 3 kategori utama (Organik, Anorganik, B3). Subkategori bernilai ekonomi di bawah ini ditentukan secara manual oleh petugas saat penimbangan fisik.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Daur Ulang Plastik</span>
              <span className="font-bold text-slate-800 block">Botol PET</span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Verifikasi Fisik</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Plastik Keras</span>
              <span className="font-bold text-slate-800 block">Jeriken / HDPE</span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Verifikasi Fisik</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Kertas Industri</span>
              <span className="font-bold text-slate-800 block">Kardus & Karton</span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Verifikasi Fisik</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Biokonversi</span>
              <span className="font-bold text-slate-800 block">Sisa Makanan</span>
              <span className="text-[11px] text-emerald-700 font-semibold block">Verifikasi Fisik</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 mr-1">Prediksi AI:</span>
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('all')}
                className="text-xs h-8 rounded-lg"
              >
                Semua Kategori
              </Button>
              <Button
                variant={categoryFilter === 'Organik' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Organik')}
                className="text-xs h-8 rounded-lg"
              >
                Organik
              </Button>
              <Button
                variant={categoryFilter === 'Anorganik' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('Anorganik')}
                className="text-xs h-8 rounded-lg"
              >
                Anorganik
              </Button>
              <Button
                variant={categoryFilter === 'B3' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter('B3')}
                className="text-xs h-8 rounded-lg"
              >
                B3
              </Button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-68">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Cari log atau nama nasabah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8.5 h-8.5 text-xs rounded-xl"
              />
            </div>
          </div>

          {/* Verification Status Filter */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1">Status Lapangan:</span>
            <Button
              variant={verificationFilter === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVerificationFilter('all')}
              className="text-xs h-7 rounded-lg"
            >
              Semua Log
            </Button>
            <Button
              variant={verificationFilter === 'verified' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVerificationFilter('verified')}
              className="text-xs h-7 rounded-lg text-emerald-700"
            >
              Sesuai Prediksi AI
            </Button>
            <Button
              variant={verificationFilter === 'corrected' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVerificationFilter('corrected')}
              className="text-xs h-7 rounded-lg text-amber-700"
            >
              Dikoreksi Petugas
            </Button>
            <Button
              variant={verificationFilter === 'unverified' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setVerificationFilter('unverified')}
              className="text-xs h-7 rounded-lg text-slate-500"
            >
              Belum Cek Fisik
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
            Riwayat Klasifikasi Sampah & Verifikasi Lapangan
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Perbandingan transparan antara prediksi awal sistem klasifikasi dan hasil pemeriksaan fisik resmi petugas saat penjemputan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode & Waktu</TableHead>
                <TableHead>Pengguna / Nasabah</TableHead>
                <TableHead>Kategori Prediksi</TableHead>
                <TableHead>Tingkat Keyakinan (Confidence)</TableHead>
                <TableHead>Status Verifikasi Petugas</TableHead>
                <TableHead>Kategori Material Akhir</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="p-8 text-center">
                    <EmptyState
                      title="Riwayat Pemilahan Kosong"
                      description="Belum ada data pemindaian sampah yang cocok dengan filter yang dipilih."
                      actionLabel="Reset Filter"
                      onAction={() => {
                        setCategoryFilter('all')
                        setVerificationFilter('all')
                        setSearchQuery('')
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-mono text-xs">
                      <p className="font-semibold text-slate-900">{log.id.slice(0, 8)}...</p>
                      <p className="text-[11px] text-slate-400">
                        {log.created_at ? log.created_at.slice(0, 16).replace('T', ' ') : '-'} WIB
                      </p>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-900">
                      {log.user_name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          log.predicted_category === 'Organik'
                            ? 'organik'
                            : log.predicted_category === 'Anorganik'
                            ? 'anorganik'
                            : 'b3'
                        }
                      >
                        {log.predicted_category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 rounded-full"
                            style={{ width: `${Math.min(100, log.confidence_score)}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">
                          {log.confidence_score}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.is_corrected && log.corrected_category ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                            <RotateCcw className="h-3 w-3" />
                            Koreksi Fisik: {log.corrected_category}
                          </span>
                          {log.officer_notes && (
                            <p className="text-[10px] text-slate-500 italic">
                              &ldquo;{log.officer_notes}&rdquo;
                            </p>
                          )}
                        </div>
                      ) : log.is_verified_by_officer ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCheck className="h-3 w-3" />
                          Sesuai Prediksi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          <Clock className="h-3 w-3" />
                          Menunggu Cek Lapangan
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.selected_subcategory ? (
                        <Badge variant="outline" className="text-[11px] font-medium border-sky-200 bg-sky-50 text-sky-800">
                          {log.selected_subcategory}
                        </Badge>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Belum diklasifikasi</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
