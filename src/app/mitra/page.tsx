"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Building2,
  AlertTriangle,
  Lock,
  Package,
  Recycle,
  ReceiptText,
  FileCheck2,
  ArrowRight,
  Clock,
  Info,
} from 'lucide-react'

export default function MitraDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Kemitraan Inactive Notice Banner - Strictly Non-Active as per Rule */}
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 ring-4 ring-amber-100/60">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-amber-950">
                Akses Operasional Kemitraan Belum Diaktifkan
              </span>
              <Badge variant="outline" className="border-amber-400 bg-amber-100/70 text-amber-900 font-bold text-[10px]">
                is_active: false
              </Badge>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed">
              Sesuai aturan operasional WasteWise, integrasi kemitraan pengolahan hilir telah disiapkan, namun fungsi serah terima material dan pencatatan produk olahan saat ini berstatus <strong>Pending MoU Verification</strong>.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-amber-950 font-medium">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                Menunggu Perjanjian Kerjasama (MoU) Bank Sampah
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-amber-700" />
                Formulir Transaksi Masih Terkunci
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pusat Penerimaan & Daur Ulang Material
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pratinjau antarmuka penerimaan sampah terpilah dari armada WasteWise dan pencatatan produk sirkular ekonomi.
          </p>
        </div>
      </div>

      {/* 3 Metric Cards (Pratinjau Arsitektur) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Material Diterima (Siap Masuk)</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <Building2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-400">0.00</span>
              <span className="text-xs font-semibold text-slate-400 ml-1">Kg</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Menunggu aktivasi manifest serah terima
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Batch Pengolahan Aktif</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <Package className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-400">0</span>
              <span className="text-xs font-semibold text-slate-400 ml-1">batch</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Tabel processing_batches siap menampung
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 bg-slate-50/50">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Output Produk Daur Ulang</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                <Recycle className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-400">0.00</span>
              <span className="text-xs font-semibold text-slate-400 ml-1">Kg hasil</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Kompos, briket, & pelet cacahan plastik
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rencana Alur Serah Terima (Read-Only Preview) */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ReceiptText className="h-4.5 w-4.5 text-amber-600" />
                Pratinjau Alokasi Serah Terima dari Petugas Armada
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Daftar muatan sampah terverifikasi yang siap diarahkan ke fasilitas pengolahan.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-slate-300 text-slate-500 text-xs">
              Mode Pratinjau
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Manifest</TableHead>
                <TableHead>Petugas Pengantar</TableHead>
                <TableHead>Kategori Sampah</TableHead>
                <TableHead>Bobot Aktual</TableHead>
                <TableHead>Metode Olahan Rencana</TableHead>
                <TableHead className="text-right">Status Konfirmasi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs font-semibold text-slate-500">
                  MAN-KDS-2026-01
                </TableCell>
                <TableCell className="text-xs font-medium text-slate-700">
                  Ahmad Fauzi (Armada Tossa 03)
                </TableCell>
                <TableCell>
                  <Badge variant="anorganik">Anorganik</Badge>
                </TableCell>
                <TableCell className="font-semibold text-xs text-slate-800">
                  18.40 Kg
                </TableCell>
                <TableCell className="text-xs text-slate-600">
                  Pencacahan Pelet Daur Ulang
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                    <Lock className="h-3 w-3" />
                    Menunggu Aktivasi
                  </span>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

