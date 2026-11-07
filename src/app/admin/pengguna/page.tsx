"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { UserAccount, UserRole } from '@/types'
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
import { Users, UserCheck, Shield, Star, Plus, Search, Info } from 'lucide-react'

export default function PenggunaPage() {
  const [users, setUsers] = useState<UserAccount[]>([])
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddOfficerOpen, setIsAddOfficerOpen] = useState(false)

  // New Officer Form
  const [namaPetugas, setNamaPetugas] = useState('')
  const [emailPetugas, setEmailPetugas] = useState('')
  const [wilayahTugas, setWilayahTugas] = useState('')

  useEffect(() => {
    wasteService.getUsers().then(setUsers)
  }, [])

  const wargaCount = users.filter((u) => u.role === 'warga').length
  const petugasCount = users.filter((u) => u.role === 'petugas').length

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' ? true : u.role === roleFilter
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesRole && matchesSearch
  })

  const handleAddOfficer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaPetugas.trim() || !emailPetugas.trim()) return

    const newOfficer: UserAccount = {
      id: `DRV-${String(petugasCount + 1).padStart(3, '0')}`,
      name: namaPetugas.trim(),
      email: emailPetugas.trim(),
      role: 'petugas',
      status: 'active',
      total_points: 0,
      pickups_count: 0,
      joined_at: new Date().toISOString().slice(0, 10),
    }

    setUsers((prev) => [newOfficer, ...prev])
    setIsAddOfficerOpen(false)
    setNamaPetugas('')
    setEmailPetugas('')
    setWilayahTugas('')
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="destructive">Admin Sistem</Badge>
      case 'petugas':
        return <Badge variant="accepted">Petugas Armada</Badge>
      default:
        return <Badge variant="organik">Warga / Pengguna</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Simulation Banner */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 flex items-start gap-3">
        <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <span className="font-semibold">Mode Preview / Data Akun Simulasi:</span> Daftar warga dan petugas di bawah ini merupakan data contoh untuk verifikasi antarmuka manajemen pengguna.
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Pengguna & Petugas
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Data pengguna terdaftar dari aplikasi mobile Android WasteWise dan personel armada penjemputan.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOfficerOpen(true)}
          className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Tambah Petugas Baru
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Total Warga Terdaftar</p>
              <p className="text-xl font-bold text-slate-900">{wargaCount} Akun Warga</p>
              <p className="text-[11px] text-slate-500">Akun aplikasi WasteWise</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Petugas Penjemputan</p>
              <p className="text-xl font-bold text-slate-900">{petugasCount} Personel</p>
              <p className="text-[11px] text-emerald-600 font-medium">Siap ditugaskan ke lokasi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">Tingkat Partisipasi</p>
              <p className="text-xl font-bold text-slate-900">84.2%</p>
              <p className="text-[11px] text-slate-500">Estimasi keaktifan setor</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Filter & Search */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('all')}
                className="text-xs"
              >
                Semua ({users.length})
              </Button>
              <Button
                variant={roleFilter === 'warga' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('warga')}
                className="text-xs"
              >
                Warga ({wargaCount})
              </Button>
              <Button
                variant={roleFilter === 'petugas' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('petugas')}
                className="text-xs"
              >
                Petugas Lapangan ({petugasCount})
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('admin')}
                className="text-xs"
              >
                Administrator
              </Button>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Cari nama, email, ID akun..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Email Akun</TableHead>
                <TableHead>Peran (Role)</TableHead>
                <TableHead>Total Poin Reward</TableHead>
                <TableHead>Frekuensi Setor</TableHead>
                <TableHead>Status Akun</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-0">
                    <EmptyState
                      title="Pengguna Tidak Ditemukan"
                      description="Tidak ada akun yang cocok dengan kata kunci pencarian atau filter role."
                      actionLabel="Reset Pencarian"
                      onAction={() => {
                        setSearchQuery('')
                        setRoleFilter('all')
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-slate-50/60">
                    <TableCell className="font-mono text-xs font-semibold text-slate-900">
                      {user.id}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-900">
                      {user.name}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.role === 'warga' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                          <Star className="h-3 w-3 fill-emerald-600 text-emerald-600" />
                          {user.total_points} Poin
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {user.pickups_count} kali
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Aktif
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog Tambah Petugas Baru */}
      <Dialog open={isAddOfficerOpen} onOpenChange={setIsAddOfficerOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-slate-900">
              Registrasi Petugas Armada Baru
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Tambahkan personel penjemputan sampah ke sistem operasional WasteWise.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddOfficer} className="space-y-4 py-2 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Nama Lengkap Petugas:
              </label>
              <Input
                required
                value={namaPetugas}
                onChange={(e) => setNamaPetugas(e.target.value)}
                placeholder="Contoh: Joko Widodo"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Kedinasan / Akun:
              </label>
              <Input
                required
                type="email"
                value={emailPetugas}
                onChange={(e) => setEmailPetugas(e.target.value)}
                placeholder="contoh: joko.driver@wastewise.id"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Wilayah Operasional / Posko:
              </label>
              <Input
                value={wilayahTugas}
                onChange={(e) => setWilayahTugas(e.target.value)}
                placeholder="Contoh: Kudus Kota / Zona Timur"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsAddOfficerOpen(false)}
                className="text-xs text-slate-500"
              >
                Batal
              </Button>
              <Button
                type="submit"
                size="sm"
                className="text-xs bg-green-600 hover:bg-green-700 text-white"
              >
                Simpan Petugas
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
