"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { Pickup, PickupStatus, DbPickupStatus } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Info,
  UserCheck,
  Database,
  Loader2,
} from 'lucide-react'

export default function PenjemputanPage() {
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [activeTab, setActiveTab] = useState<'all' | PickupStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)
  const [weightInput, setWeightInput] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [officers, setOfficers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    wasteService.getPickups().then(setPickups)
    wasteService.getAvailableOfficers().then((list) => {
      setOfficers(list)
      if (list.length > 0) setSelectedOfficerId(list[0].id)
    })
  }, [])

  const filteredPickups = pickups.filter((p) => {
    const matchesTab = activeTab === 'all' ? true : p.status === activeTab
    const matchesSearch =
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })

  const handleOpenVerify = (p: Pickup) => {
    setSelectedPickup(p)
    setWeightInput(p.weight_kg ? String(p.weight_kg) : '')
    setIsDialogOpen(true)
  }

  const handleOpenAssign = (p: Pickup) => {
    setSelectedPickup(p)
    setIsAssignDialogOpen(true)
  }

  const handleConfirmAssign = async () => {
    if (!selectedPickup || !selectedOfficerId) return
    setIsSubmitting(true)
    const res = await wasteService.assignPickupOfficer(selectedPickup.id, selectedOfficerId)
    setIsSubmitting(false)

    if (res.success) {
      setPickups((prev) =>
        prev.map((item) =>
          item.id === selectedPickup.id
            ? { ...item, status: 'assigned' as PickupStatus }
            : item
        )
      )
      setIsAssignDialogOpen(false)
      setSelectedPickup(null)
    } else {
      alert(`Gagal menugaskan petugas: ${res.error}`)
    }
  }

  const handleUpdateStatus = async (newStatus: PickupStatus) => {
    if (!selectedPickup) return
    const parsedWeight = parseFloat(weightInput) || selectedPickup.weight_kg || 0
    await wasteService.updatePickupStatus(selectedPickup.id, newStatus, parsedWeight)

    setPickups((prev) =>
      prev.map((item) =>
        item.id === selectedPickup.id
          ? { ...item, status: newStatus, weight_kg: parsedWeight }
          : item
      )
    )
    setIsDialogOpen(false)
    setSelectedPickup(null)
  }

  const getStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="pending">Menunggu Penugasan</Badge>
      case 'assigned':
      case 'accepted':
        return <Badge variant="accepted">Petugas Ditugaskan</Badge>
      case 'on_the_way':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dalam Perjalanan</Badge>
      case 'arrived':
      case 'verified':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Menunggu Verifikasi</Badge>
      case 'completed':
        return <Badge variant="completed">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="cancelled">Dibatalkan</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Penjemputan Lapangan
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed max-w-3xl">
            Kelola seluruh proses penjemputan sampah secara terstruktur, mulai dari pengajuan warga, penugasan petugas, hingga verifikasi hasil penimbangan. Pantau perkembangan setiap penjemputan agar pelayanan berjalan lebih cepat, tertib, dan transparan.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Cari ID tiket, warga, atau alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        {/* Tab Filter Operasional */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua ({pickups.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menunggu Penugasan
          </button>
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'assigned'
                ? 'bg-white text-sky-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Petugas Ditugaskan
          </button>
          <button
            onClick={() => setActiveTab('on_the_way')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'on_the_way'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dalam Perjalanan
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'verified'
                ? 'bg-white text-purple-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Menunggu Verifikasi
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Selesai
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'cancelled'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dibatalkan
          </button>
        </div>
      </div>

      {/* Main Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiket / ID</TableHead>
                <TableHead>Nama Warga</TableHead>
                <TableHead>Alamat Penjemputan</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Jadwal</TableHead>
                <TableHead>Berat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Tindakan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPickups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="p-0">
                    <EmptyState
                      title="Tidak Ada Data Penjemputan"
                      description="Tidak ditemukan tiket penjemputan yang sesuai dengan filter atau kata kunci pencarian Anda."
                      actionLabel="Reset Pencarian"
                      onAction={() => {
                        setSearchQuery('')
                        setActiveTab('all')
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredPickups.map((pickup) => (
                  <TableRow key={pickup.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-mono text-xs font-bold text-slate-900">
                      {pickup.id}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-xs text-slate-800">
                        {pickup.user_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {pickup.user_email}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600 max-w-[200px] truncate">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-red-400 shrink-0" />
                        <span className="truncate">{pickup.address}</span>
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          pickup.category === 'Organik'
                            ? 'organik'
                            : pickup.category === 'Anorganik'
                            ? 'anorganik'
                            : 'b3'
                        }
                      >
                        {pickup.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        {pickup.scheduled_date}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-slate-800">
                      {pickup.weight_kg ? `${pickup.weight_kg} Kg` : '—'}
                    </TableCell>
                    <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {pickup.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenAssign(pickup)}
                            className="h-8 text-xs font-semibold border-sky-300 text-sky-800 hover:bg-sky-50 gap-1"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                            <span>Tugaskan</span>
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenVerify(pickup)}
                          className="h-8 text-xs font-medium"
                        >
                          Kelola
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Tugaskan Petugas Armada */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <Truck className="h-4.5 w-4.5 text-sky-600" />
              Alokasikan Petugas Armada
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Pilih petugas armada lapangan untuk menangani penjemputan ini. Notifikasi tugas dan rute penjemputan akan langsung diteruskan ke aplikasi petugas.
            </DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-4 py-2 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tiket:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPickup.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warga:</span>
                  <span className="font-semibold text-slate-800">{selectedPickup.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat:</span>
                  <span className="text-slate-700 text-right max-w-[220px] truncate">{selectedPickup.address}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 block">
                  Pilih Petugas Lapangan Aktif
                </label>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full h-10 px-3 text-xs bg-white border border-slate-200 rounded-xl focus:border-sky-600 focus:outline-hidden"
                >
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignDialogOpen(false)}
              className="text-xs"
            >
              Batal
            </Button>
            <Button
              size="sm"
              disabled={isSubmitting}
              onClick={handleConfirmAssign}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                'Tugaskan Petugas'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog Status & Timbangan */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Verifikasi & Validasi Penjemputan
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ubah status operasional armada dan input hasil timbangan sampah di lapangan.
            </DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-4 py-2 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Penjemputan:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedPickup.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Warga:</span>
                  <span className="font-medium text-slate-900">{selectedPickup.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kategori AI:</span>
                  <span className="font-semibold text-green-700">{selectedPickup.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Alamat:</span>
                  <span className="text-slate-700 text-right max-w-[240px] truncate">{selectedPickup.address}</span>
                </div>
              </div>

              {selectedPickup.image_url && (
                <div className="space-y-1">
                  <span className="text-slate-500 font-semibold text-[11px] block">Foto Sampah dari Warga:</span>
                  <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center">
                    <img
                      src={selectedPickup.image_url}
                      alt="Foto Sampah"
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Hasil Timbangan Petugas (Kg):
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Contoh: 4.5"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Update Status Operasional:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'assigned' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUpdateStatus('assigned')}
                  >
                    Ditugaskan
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'on_the_way' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUpdateStatus('on_the_way')}
                  >
                    Dalam Perjalanan
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleUpdateStatus('completed')}
                  >
                    Selesai
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'cancelled' ? 'destructive' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleUpdateStatus('cancelled')}
                  >
                    Batalkan
                  </Button>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDialogOpen(false)}
              className="text-xs text-slate-500"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
