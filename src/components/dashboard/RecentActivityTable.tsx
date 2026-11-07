"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Pickup, PickupStatus } from '@/types'
import { wasteService } from '@/services/wasteService'
import { ArrowUpRight, CheckCircle2, MapPin, Calendar, Check, X } from 'lucide-react'

interface RecentActivityTableProps {
  initialPickups: Pickup[]
}

export function RecentActivityTable({ initialPickups }: RecentActivityTableProps) {
  const [pickups, setPickups] = useState<Pickup[]>(initialPickups)
  const [selectedPickup, setSelectedPickup] = useState<Pickup | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [weightInput, setWeightInput] = useState<string>('')

  const handleOpenVerify = (pickup: Pickup) => {
    setSelectedPickup(pickup)
    setWeightInput(pickup.weight_kg ? String(pickup.weight_kg) : '')
    setIsVerifying(true)
  }

  const handleConfirmStatus = async (newStatus: PickupStatus) => {
    if (!selectedPickup) return

    const parsedWeight = parseFloat(weightInput) || selectedPickup.weight_kg || 0
    await wasteService.updatePickupStatus(selectedPickup.id, newStatus, parsedWeight)

    setPickups((prev) =>
      prev.map((p) =>
        p.id === selectedPickup.id
          ? { ...p, status: newStatus, weight_kg: parsedWeight }
          : p
      )
    )
    setIsVerifying(false)
    setSelectedPickup(null)
  }

  const getCategoryBadgeVariant = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'organik':
        return 'organik'
      case 'anorganik':
        return 'anorganik'
      case 'b3':
        return 'b3'
      default:
        return 'secondary'
    }
  }

  const getStatusBadge = (status: PickupStatus) => {
    switch (status) {
      case 'pending':
        return <Badge variant="pending">Menunggu</Badge>
      case 'accepted':
        return <Badge variant="accepted">Dijemput</Badge>
      case 'completed':
        return <Badge variant="completed">Selesai</Badge>
      case 'cancelled':
        return <Badge variant="cancelled">Dibatalkan</Badge>
    }
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-semibold text-slate-900">
              Permintaan & Aktivitas Penjemputan Terbaru
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              Data masuk dari warga via aplikasi Android WasteWise
            </CardDescription>
          </div>
          <Link href="/penjemputan">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
              Lihat Semua
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID & Waktu</TableHead>
                <TableHead>Pemohon / Warga</TableHead>
                <TableHead>Lokasi Alamat</TableHead>
                <TableHead>Hasil AI (Kategori)</TableHead>
                <TableHead>Skor AI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.slice(0, 5).map((pickup) => (
                <TableRow key={pickup.id} className="hover:bg-slate-50/60">
                  <TableCell className="font-mono text-xs">
                    <p className="font-semibold text-slate-900">{pickup.id}</p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {pickup.scheduled_date}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-slate-900 text-xs">{pickup.user_name}</p>
                    <p className="text-[11px] text-slate-400">{pickup.user_email}</p>
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <p className="text-xs text-slate-600 truncate flex items-center gap-1">
                      <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                      {pickup.address}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(pickup.category)}>
                      {pickup.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-semibold text-slate-700">
                      {(pickup.ai_confidence * 100).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(pickup.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-medium text-slate-700 hover:text-green-700 hover:border-green-300"
                      onClick={() => handleOpenVerify(pickup)}
                    >
                      Kelola
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Verification / Action Dialog */}
      <Dialog open={isVerifying} onOpenChange={setIsVerifying}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Verifikasi Penjemputan — {selectedPickup?.id}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tinjau data klasifikasi AI dan perbarui status operasional sampah.
            </DialogDescription>
          </DialogHeader>

          {selectedPickup && (
            <div className="space-y-3.5 py-2">
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Warga:</span>
                  <span className="font-semibold text-slate-800">{selectedPickup.user_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Kategori AI:</span>
                  <span className="font-semibold text-green-700">{selectedPickup.category}</span>
                </div>
                <div className="col-span-2 mt-1">
                  <span className="text-slate-400 block text-[11px]">Alamat:</span>
                  <span className="text-slate-700">{selectedPickup.address}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Bobot Sampah Fisik (Kg):
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="Masukkan hasil timbangan petugas"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Ubah Status Operasional:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'accepted' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleConfirmStatus('accepted')}
                  >
                    Tugaskan
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'completed' ? 'default' : 'outline'}
                    size="sm"
                    className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleConfirmStatus('completed')}
                  >
                    Selesai
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPickup.status === 'cancelled' ? 'destructive' : 'outline'}
                    size="sm"
                    className="text-xs"
                    onClick={() => handleConfirmStatus('cancelled')}
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
              onClick={() => setIsVerifying(false)}
              className="text-slate-500 text-xs"
            >
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

