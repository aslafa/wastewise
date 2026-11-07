"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { wasteService } from '@/services/wasteService'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck,
  Scale,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowRight,
  Phone,
  Navigation,
  AlertCircle,
  Calendar,
  Database,
  Loader2,
} from 'lucide-react'

export default function PetugasDashboardPage() {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadOfficerData() {
      setIsLoading(true)
      try {
        const officerId = user?.id || profile?.id || 'demo-petugas-01'
        const res = await wasteService.getPetugasTasks(officerId)
        if (isMounted) {
          setTasks(res.tasks)
          setIsLive(res.isLive)
        }
      } catch (err) {
        console.warn('Gagal memuat tugas petugas:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadOfficerData()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  const activeTasks = tasks.filter((t) => t.status !== 'completed' && t.status !== 'cancelled')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const totalKg = tasks.reduce((sum, t) => sum + (Number(t.estimated_kg) || 0), 0)
  const nextPriorityTask = activeTasks[0] || null

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-sky-50/50 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500 animate-pulse" />
              <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
                Status Armada: Siap Beroperasi
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              Selamat Bertugas, {profile?.full_name || 'Petugas Lapangan'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Akun: <strong className="text-slate-800">{profile?.email || 'petugas@wastewise.id'}</strong> • Zona Layanan: <strong className="text-slate-800">Kudus Kota & Jati</strong>
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/petugas/verifikasi">
              <Button className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl h-10 px-4 gap-2 shadow-xs">
                <Scale className="h-4 w-4" />
                Input Timbangan Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Database Connection Status Indicator */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-sky-50 border-sky-200 text-sky-900'
          : 'bg-slate-50 border-slate-200 text-slate-700'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-sky-700" />
          <span>
            {isLive
              ? 'Terhubung langsung ke antrean penugasan penjemputan armada lapangan terkini.'
              : 'Mode Terhubung: Memuat jadwal penugasan rute armada petugas.'}
          </span>
        </div>
        <Badge variant="outline" className={isLive ? 'border-sky-300 text-sky-800 font-bold text-[10px]' : 'border-slate-300 text-slate-700 font-bold text-[10px]'}>
          {isLive ? 'DATABASE LIVE' : 'TERKONEKSI'}
        </Badge>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Tugas</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                <Truck className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? '...' : tasks.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">titik jemput</span>
            </div>
            <div className="mt-2 text-[11px] text-amber-600 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{activeTasks.length} titik belum diambil</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Selesai Diverifikasi</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? '...' : completedTasks.length}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">lokasi</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-600 font-medium">
              {tasks.length > 0 ? `${Math.round((completedTasks.length / tasks.length) * 100)}% selesai` : 'Belum ada tiket'}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Muatan Terkumpul</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Scale className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {isLoading ? '...' : totalKg.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-slate-500 ml-1">Kg</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              Kapasitas armada tersisa: {(200 - Math.min(200, totalKg)).toFixed(1)} Kg
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Efisiensi Rute</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Navigation className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">92%</span>
            </div>
            <div className="mt-2 text-[11px] text-indigo-600 font-medium">
              Optimalisasi urutan jalan
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Next Priority Stop Highlight */}
      {nextPriorityTask ? (
        <Card className="border-sky-200 bg-sky-50/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                <CardTitle className="text-base font-bold text-slate-900">
                  Titik Penjemputan Prioritas Berikutnya
                </CardTitle>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 font-semibold text-xs">
                Jadwal: {nextPriorityTask.time_slot || '08:30 - 10:00 WIB'}
              </Badge>
            </div>
            <CardDescription className="text-xs text-slate-500">
              Order {nextPriorityTask.request_number || nextPriorityTask.id} • Warga menunggu armada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Nama Warga / Pemesan:</span>
                <span className="font-bold text-slate-900 text-sm">{nextPriorityTask.user_name || 'Warga'}</span>
                {nextPriorityTask.user_phone && (
                  <div className="flex items-center gap-1.5 mt-1 text-slate-600">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{nextPriorityTask.user_phone}</span>
                  </div>
                )}
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Alamat Penjemputan:</span>
                <div className="flex items-start gap-1.5 font-medium text-slate-800">
                  <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{nextPriorityTask.address || 'Alamat terdaftar di penugasan'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block mb-1">Estimasi Muatan:</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-slate-300">
                    {nextPriorityTask.category || 'Anorganik'}
                  </Badge>
                  <span className="font-semibold text-slate-700">~{nextPriorityTask.estimated_kg || '0'} Kg</span>
                </div>
                {nextPriorityTask.notes && (
                  <span className="text-[11px] text-slate-400 block mt-1">
                    "{nextPriorityTask.notes}"
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(nextPriorityTask.address || 'Kudus')}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="text-xs h-9 rounded-xl border-slate-200 gap-1.5">
                  <Navigation className="h-3.5 w-3.5 text-sky-600" />
                  <span>Buka Rute Maps</span>
                </Button>
              </a>

              <Link href={`/petugas/verifikasi?id=${nextPriorityTask.id}`}>
                <Button size="sm" className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-9 rounded-xl gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  <span>Tiba & Timbang Fisik</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-slate-300 bg-white/70 shadow-xs">
          <CardContent className="p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700 mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900">Semua Titik Penjemputan Selesai</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tidak ada antrean penugasan armada aktif saat ini. Anda dapat melakukan verifikasi timbangan susulan atau memantau tiket baru dari Admin.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/petugas/riwayat">
                <Button variant="outline" className="text-xs h-9 px-4 rounded-xl gap-2 font-semibold border-slate-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Lihat Riwayat Pekerjaan</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/petugas/tugas" className="group">
          <Card className="h-full border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                  Daftar Seluruh Tugas Penjemputan
                </h3>
                <p className="text-xs text-slate-500">
                  Lihat rute armada, alamat penjemputan warga, dan status penugasan.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/petugas/riwayat" className="group">
          <Card className="h-full border-slate-200/80 hover:border-sky-300 transition-all hover:shadow-xs">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                  Riwayat Pekerjaan & Timbangan
                </h3>
                <p className="text-xs text-slate-500">
                  Periksa riwayat timbangan fisik yang telah diverifikasi dan foto manifest.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

