"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  History,
  Scale,
  Calendar,
  CheckCircle2,
  Search,
  Image as ImageIcon,
  Coins,
} from 'lucide-react'

interface CompletedJob {
  id: string
  request_number: string
  user_name: string
  address: string
  verified_at: string
  category: 'Organik' | 'Anorganik' | 'B3'
  actual_weight_kg: number
  points_awarded: number
  scale_photo_url: string
  officer_notes: string
}

const SAMPLE_COMPLETED_JOBS: CompletedJob[] = [
  {
    id: 'VER-2026-001',
    request_number: 'REQ-KDS-003',
    user_name: 'Hendro Prasetyo',
    address: 'Jl. Pemuda No. 12B, Kudus',
    verified_at: '05-11-2026 14:45 WIB',
    category: 'B3',
    actual_weight_kg: 1.85,
    points_awarded: 0,
    scale_photo_url: '/assets/sample-scale-1.jpg',
    officer_notes: 'Baterai bekas dan 3 lampu neon TL dikarantina khusus.',
  },
  {
    id: 'VER-2026-002',
    request_number: 'REQ-KDS-088',
    user_name: 'Reza Pratama',
    address: 'Jl. Sunan Kudus No. 78, Kudus',
    verified_at: '04-11-2026 11:20 WIB',
    category: 'Organik',
    actual_weight_kg: 12.4,
    points_awarded: 620,
    scale_photo_url: '/assets/sample-scale-2.jpg',
    officer_notes: 'Sisa potongan rumput dan ranting pekarangan kering.',
  },
  {
    id: 'VER-2026-003',
    request_number: 'REQ-KDS-072',
    user_name: 'Dewi Lestari',
    address: 'Gg. Melati 3, Ds. Demaan, Kudus',
    verified_at: '03-11-2026 09:15 WIB',
    category: 'Anorganik',
    actual_weight_kg: 6.2,
    points_awarded: 620,
    scale_photo_url: '/assets/sample-scale-3.jpg',
    officer_notes: 'Kardus terlipat rapi dan kaleng biskuit bersih.',
  },
]

export default function PetugasRiwayatPage() {
  const [search, setSearch] = useState('')

  const filteredJobs = SAMPLE_COMPLETED_JOBS.filter(
    (j) =>
      j.request_number.toLowerCase().includes(search.toLowerCase()) ||
      j.user_name.toLowerCase().includes(search.toLowerCase()) ||
      j.address.toLowerCase().includes(search.toLowerCase())
  )

  const totalKg = SAMPLE_COMPLETED_JOBS.reduce((acc, curr) => acc + curr.actual_weight_kg, 0)
  const totalPoints = SAMPLE_COMPLETED_JOBS.reduce((acc, curr) => acc + curr.points_awarded, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Riwayat Pekerjaan & Timbangan Selesai
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Arsip riwayat penimbangan fisik yang telah Anda verifikasi di lokasi warga.
          </p>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium">Total Titik Selesai</span>
            <div className="text-2xl font-bold text-slate-900 mt-2">
              {SAMPLE_COMPLETED_JOBS.length}{' '}
              <span className="text-xs text-slate-400 font-normal">titik jemput</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium">Total Akumulasi Timbangan</span>
            <div className="text-2xl font-bold text-emerald-700 mt-2">
              {totalKg.toFixed(1)}{' '}
              <span className="text-xs text-slate-400 font-normal">Kg</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <span className="text-xs text-slate-500 font-medium">Poin Terdistribusi ke Warga</span>
            <div className="text-2xl font-bold text-amber-600 mt-2 flex items-center gap-1.5">
              <Coins className="h-5 w-5" />
              {totalPoints.toLocaleString('id-ID')} Poin
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Cari nomor tiket, nama warga, jalan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 text-xs h-9 bg-white border-slate-200 rounded-xl"
        />
      </div>

      {/* Table of Completed Jobs */}
      <Card className="border-slate-200/80 overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <History className="h-4.5 w-4.5 text-sky-600" />
            Catatan Verifikasi Timbangan Lapangan
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Seluruh data tersimpan permanen di database PostgreSQL dengan bukti foto timbangan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiket / Waktu</TableHead>
                <TableHead>Warga & Alamat</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Berat Aktual</TableHead>
                <TableHead>Poin Diterima</TableHead>
                <TableHead>Catatan Petugas</TableHead>
                <TableHead>Bukti Foto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredJobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-bold text-slate-900">
                      {job.request_number}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {job.verified_at}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-semibold text-slate-800">
                      {job.user_name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-xs">
                      {job.address}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        job.category === 'Organik'
                          ? 'organik'
                          : job.category === 'Anorganik'
                          ? 'anorganik'
                          : 'b3'
                      }
                    >
                      {job.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-xs text-slate-900">
                    {job.actual_weight_kg} Kg
                  </TableCell>
                  <TableCell>
                    {job.points_awarded > 0 ? (
                      <span className="font-semibold text-xs text-emerald-700">
                        +{job.points_awarded} Poin
                      </span>
                    ) : (
                      <span className="text-[11px] text-red-600 font-medium">
                        Karantina (0 Poin)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {job.officer_notes}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                      <ImageIcon className="h-3 w-3" />
                      Terverifikasi
                    </span>
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

