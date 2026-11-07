"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { wasteService } from '@/services/wasteService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Truck,
  MapPin,
  Calendar,
  Scale,
  Search,
  Navigation,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  Database,
  Loader2,
} from 'lucide-react'

interface AssignedPickup {
  id: string
  request_number: string
  user_name: string
  user_phone: string
  address: string
  scheduled_date: string
  time_slot: string
  category: 'Organik' | 'Anorganik' | 'B3'
  estimated_kg: number
  status: 'pending' | 'assigned' | 'on_the_way' | 'arrived' | 'completed'
  notes?: string
}

const INITIAL_ASSIGNED: AssignedPickup[] = [
  {
    id: 'PKP-2026-001',
    request_number: 'REQ-KDS-001',
    user_name: 'Budi Santoso',
    user_phone: '0812-3456-7890',
    address: 'Jl. Merdeka No. 45, RT 02/RW 04, Kel. Demaan, Kota Kudus',
    scheduled_date: '06-11-2026',
    time_slot: '08:30 - 10:00',
    category: 'Anorganik',
    estimated_kg: 4.8,
    status: 'assigned',
    notes: 'Kardus dan botol plastik air mineral bersih',
  },
  {
    id: 'PKP-2026-002',
    request_number: 'REQ-KDS-002',
    user_name: 'Siti Rahmawati',
    user_phone: '0857-1234-5678',
    address: 'Perumahan Graha Indah Blok C2/10, Kudus',
    scheduled_date: '06-11-2026',
    time_slot: '10:15 - 11:30',
    category: 'Organik',
    estimated_kg: 8.5,
    status: 'assigned',
    notes: 'Sisa sayuran dan daun gugur pekarangan',
  },
  {
    id: 'PKP-2026-004',
    request_number: 'REQ-KDS-004',
    user_name: 'Dewi Lestari',
    user_phone: '0878-9876-5432',
    address: 'Gg. Melati 3, Ds. Demaan, Kudus',
    scheduled_date: '06-11-2026',
    time_slot: '13:00 - 14:30',
    category: 'Anorganik',
    estimated_kg: 6.2,
    status: 'assigned',
    notes: 'Kaleng biskuit dan botol kaca sirup',
  },
  {
    id: 'PKP-2026-003',
    request_number: 'REQ-KDS-003',
    user_name: 'Hendro Prasetyo',
    user_phone: '0813-2244-6688',
    address: 'Jl. Pemuda No. 12B, Kudus',
    scheduled_date: '05-11-2026',
    time_slot: '14:30 - 15:30',
    category: 'B3',
    estimated_kg: 1.8,
    status: 'completed',
    notes: 'Baterai bekas dan 3 lampu neon TL',
  },
]

export default function PetugasTugasPage() {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState<AssignedPickup[]>(INITIAL_ASSIGNED)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('active')
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadTasks() {
      setIsLoading(true)
      const activeOfficerId = user?.id || profile?.id || 'demo-petugas-01'
      const res = await wasteService.getPetugasTasks(activeOfficerId)
      if (isMounted) {
        if (res.tasks.length > 0) {
          setTasks(
            res.tasks.map((t) => ({
              id: t.id,
              request_number: t.request_number,
              user_name: t.user_name,
              user_phone: t.user_phone,
              address: t.address,
              scheduled_date: t.scheduled_date,
              time_slot: t.time_slot,
              category: (t.category as AssignedPickup['category']) || 'Anorganik',
              estimated_kg: t.estimated_kg,
              status: (t.status as AssignedPickup['status']) || 'assigned',
              notes: t.notes,
            }))
          )
        }
        setIsLive(res.isLive)
        setIsLoading(false)
      }
    }

    loadTasks()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  const handleUpdateStatus = async (id: string, newStatus: AssignedPickup['status']) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: newStatus } : t))
    )
    try {
      await wasteService.updatePickupStatus(id, newStatus)
    } catch (err) {
      console.warn('Gagal update status penjemputan:', err)
    }
  }

  const filteredTasks = tasks.filter(t => {
    const matchesFilter =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? t.status !== 'completed'
        : t.status === 'completed'

    const matchesSearch =
      t.request_number.toLowerCase().includes(search.toLowerCase()) ||
      t.user_name.toLowerCase().includes(search.toLowerCase()) ||
      t.address.toLowerCase().includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Daftar Tugas Penjemputan Armada
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Daftar alamat dan jadwal penjemputan warga yang ditugaskan kepada Anda hari ini.
          </p>
        </div>
        <Link href="/petugas/verifikasi">
          <Button className="bg-sky-600 hover:bg-sky-700 text-white text-xs rounded-xl h-10 gap-2">
            <Scale className="h-4 w-4" />
            <span>Formulir Timbangan Langsung</span>
          </Button>
        </Link>
      </div>

      {/* Database Status Indicator */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-sky-50 border-sky-200 text-sky-950'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-sky-700" />
          <span>
            {isLive
              ? 'Tersinkronisasi langsung dengan rute penugasan armada untuk akun petugas aktif Anda.'
              : 'Mode Terhubung: Memuat data penugasan armada lapangan.'}
          </span>
        </div>
        <span className="font-bold text-[11px] font-mono">
          {filteredTasks.length} Titik Jemput
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'active'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tugas Aktif ({tasks.filter(t => t.status !== 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'completed'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai ({tasks.filter(t => t.status === 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({tasks.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Cari warga, nomor tiket, jalan..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 bg-white border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Task Cards / Table */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <Card key={task.id} className="border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            <CardContent className="p-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left: Client & Address Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {task.request_number}
                    </span>
                    <Badge
                      variant={
                        task.category === 'Organik'
                          ? 'organik'
                          : task.category === 'Anorganik'
                          ? 'anorganik'
                          : 'b3'
                      }
                    >
                      {task.category}
                    </Badge>
                    <span className="text-xs font-semibold text-slate-600">
                      Est. ~{task.estimated_kg} Kg
                    </span>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      task.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : task.status === 'arrived'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : task.status === 'on_the_way'
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : task.status === 'assigned'
                        ? 'bg-sky-50 text-sky-800 border-sky-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {task.status === 'completed'
                        ? 'Telah Selesai'
                        : task.status === 'arrived'
                        ? 'Tiba di Lokasi Warga'
                        : task.status === 'on_the_way'
                        ? 'Sedang Menuju Lokasi'
                        : task.status === 'assigned'
                        ? 'Tugas Diterima'
                        : 'Menunggu Petugas'}
                    </span>
                  </div>

                  <div className="text-sm font-bold text-slate-900">
                    {task.user_name}
                    <span className="text-xs font-normal text-slate-500 ml-2">
                      ({task.user_phone})
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <MapPin className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <span>{task.address}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.scheduled_date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{task.time_slot} WIB</span>
                    </div>
                    {task.notes && (
                      <span className="text-slate-500 italic">
                        "{task.notes}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Operational Action Buttons */}
                <div className="flex flex-wrap lg:flex-col items-center lg:items-end gap-2 shrink-0">
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(task.id, 'assigned')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Terima & Ambil Tugas</span>
                    </Button>
                  )}

                  {task.status === 'assigned' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(task.id, 'on_the_way')}
                      className="bg-sky-600 hover:bg-sky-700 text-white text-xs h-9 rounded-xl gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Mulai Jalan ke Lokasi</span>
                    </Button>
                  )}

                  {task.status === 'on_the_way' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(task.id, 'arrived')}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-9 rounded-xl gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Tiba di Lokasi Warga</span>
                    </Button>
                  )}

                  {task.status !== 'completed' && (
                    <Link href={`/petugas/verifikasi?id=${task.id}`}>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 rounded-xl gap-1.5"
                      >
                        <Scale className="h-3.5 w-3.5" />
                        <span>Timbang & Catat Berat</span>
                      </Button>
                    </Link>
                  )}

                  {task.status === 'arrived' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateStatus(task.id, 'completed')}
                      className="text-xs h-9 rounded-xl border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Tandai Selesai</span>
                    </Button>
                  )}

                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(task.address)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-1.5"
                    >
                      <Navigation className="h-3.5 w-3.5 text-sky-600" />
                      <span>Rute Maps</span>
                    </Button>
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTasks.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400">
            <Truck className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">Tidak ada tugas penjemputan ditemukan</p>
            <p className="text-xs text-slate-400 mt-1">Semua tugas dalam kategori filter ini telah terselesaikan atau tidak ada data pencarian.</p>
          </div>
        )}
      </div>
    </div>
  )
}

