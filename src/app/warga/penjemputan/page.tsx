"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { wasteService } from '@/services/wasteService'
import { DbPickupRequest, DbPickupStatus } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Truck,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarPlus,
  MapPin,
  Coins,
  Scale,
  ArrowRight,
  Database,
  Loader2,
  AlertCircle,
  FileText,
} from 'lucide-react'

export default function WargaPenjemputanPage() {
  const { user, profile, isAuthenticated } = useAuth()
  const [pickups, setPickups] = useState<DbPickupRequest[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')

  useEffect(() => {
    let isMounted = true

    async function loadPickups() {
      setIsLoading(true)
      const activeUserId = user?.id || profile?.id || ''
      const res = await wasteService.getWargaPickups(activeUserId)
      if (isMounted) {
        setPickups(res.pickups)
        setIsLive(res.isLive)
        setIsLoading(false)
      }
    }

    loadPickups()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  const filtered = pickups.filter((p) => {
    if (filter === 'active') return !['completed', 'cancelled'].includes(p.status)
    if (filter === 'completed') return p.status === 'completed'
    return true
  })

  const getStatusBadge = (status: DbPickupStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">Pending (Menunggu Armada)</Badge>
      case 'assigned':
        return <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200">Armada Ditugaskan</Badge>
      case 'on_the_way':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">Dalam Perjalanan</Badge>
      case 'arrived':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-800 border-indigo-200">Petugas Tiba di Lokasi</Badge>
      case 'verified':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">Selesai Ditimbang</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">Selesai & Poin Cair</Badge>
      case 'cancelled':
        return <Badge variant="outline" className="bg-rose-50 text-rose-800 border-rose-200">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Monitoring Penjemputan Warga
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Status Permintaan Penjemputan Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau status armada WasteWise secara transparan dari jadwal penugasan hingga verifikasi timbangan fisik.
          </p>
        </div>
        <Link href="/warga/ajukan">
          <Button className="bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl h-10 gap-2 shadow-xs">
            <CalendarPlus className="h-4 w-4" />
            <span>Ajukan Penjemputan Baru</span>
          </Button>
        </Link>
      </div>

      {/* Database Status Indicator */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            {isLive
              ? 'Terhubung langsung ke sistem layanan operasional WasteWise untuk akun nasabah aktif Anda.'
              : 'Terhubung ke server WasteWise: Memuat daftar tiket penjemputan nasabah resmi.'}
          </span>
        </div>
        <Badge variant="outline" className={isLive ? 'border-emerald-300 text-emerald-800 font-bold text-[10px]' : 'border-amber-300 text-amber-800 font-bold text-[10px]'}>
          {isLive ? 'DATABASE LIVE' : 'TERKONEKSI'}
        </Badge>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Semua Tiket ({pickups.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sedang Diproses ({pickups.filter((p) => !['completed', 'cancelled'].includes(p.status)).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Selesai ({pickups.filter((p) => p.status === 'completed').length})
        </button>
      </div>

      {/* Cards List of Requests */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          <span className="text-xs">Memuat data penjemputan...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center border-dashed border-slate-200">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">Belum Ada Pengajuan Penjemputan</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Anda belum memiliki riwayat pengajuan pada kategori ini. Mulai pilah sampah dan buat jadwal penjemputan pertama Anda.
          </p>
          <div className="mt-4">
            <Link href="/warga/ajukan">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs rounded-xl">
                Ajukan Sekarang
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((req) => (
            <Card key={req.id} className="border-slate-200/80 shadow-xs overflow-hidden">
              <CardContent className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                        {req.request_number}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Jadwal: <strong>{req.scheduled_date}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Slot: <strong>{req.time_slot}</strong>
                      </span>
                      {req.assigned_officer_name && (
                        <span className="flex items-center gap-1 text-sky-700 font-semibold">
                          <Truck className="h-3.5 w-3.5" />
                          Petugas: {req.assigned_officer_name}
                        </span>
                      )}
                    </div>

                    {req.address && (
                      <p className="text-xs text-slate-500 flex items-start gap-1">
                        <MapPin className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                        <span>{req.address.full_address}</span>
                      </p>
                    )}

                    {/* Rincian Items */}
                    {req.items && req.items.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {req.items.map((it, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200/60"
                          >
                            <strong>{it.category?.name || 'Sampah'}</strong>: ~{it.estimated_kg} Kg
                          </span>
                        ))}
                      </div>
                    )}

                    {req.notes && (
                      <p className="text-[11px] text-slate-500 italic">
                        Catatan: &ldquo;{req.notes}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Bobot & Poin */}
                  <div className="lg:border-l lg:border-slate-100 lg:pl-6 flex items-center justify-between lg:flex-col lg:items-end gap-2 shrink-0">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block lg:text-right">
                        {req.status === 'completed' ? 'Bobot Terverifikasi' : 'Estimasi Bobot'}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 block lg:text-right">
                        {req.status === 'completed' && req.total_verified_kg > 0
                          ? `${req.total_verified_kg} Kg`
                          : `~${req.total_estimated_kg} Kg`}
                      </span>
                    </div>

                    {req.status === 'completed' && (
                      <div className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                        <Coins className="h-3.5 w-3.5" />
                        <span>Poin Telah Masuk</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
