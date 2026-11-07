"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users2,
  ShieldCheck,
  UserPlus,
  ShieldAlert,
  Search,
  Lock,
  Mail,
  Calendar,
  CheckCircle2,
} from 'lucide-react'

interface AdminUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'super_admin'
  assigned_hub: string
  status: 'active' | 'suspended'
  last_login: string
  created_at: string
}

const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'ADM-001',
    name: 'Dr. Ir. Hendrawan',
    email: 'superadmin@wastewise.id',
    role: 'super_admin',
    assigned_hub: 'Dinas LH & Pusat Kontrol',
    status: 'active',
    last_login: 'Hari ini, 14:10 WIB',
    created_at: '01-01-2026',
  },
  {
    id: 'ADM-002',
    name: 'Budi Hartono, S.Kom',
    email: 'admin.kuduskota@wastewise.id',
    role: 'admin',
    assigned_hub: 'Hub Operasional Kudus Kota',
    status: 'active',
    last_login: 'Hari ini, 09:30 WIB',
    created_at: '15-02-2026',
  },
  {
    id: 'ADM-003',
    name: 'Rina Kusuma, S.T.',
    email: 'rina.admin@wastewise.id',
    role: 'admin',
    assigned_hub: 'Hub Operasional Jati & Undaan',
    status: 'active',
    last_login: 'Kemarin, 16:45 WIB',
    created_at: '01-04-2026',
  },
]

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>(INITIAL_ADMINS)
  const [search, setSearch] = useState('')

  const handleToggleStatus = (id: string) => {
    setAdmins(prev =>
      prev.map(a =>
        a.id === id && a.role !== 'super_admin'
          ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' }
          : a
      )
    )
  }

  const filtered = admins.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.assigned_hub.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Manajemen Akun Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pengelolaan staf administrator operasional, pembagian zona hub, dan kontrol hak akses.
          </p>
        </div>
        <Button
          onClick={() => alert('Formulir penambahan admin baru terhubung ke Supabase Auth Invite.')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-10 rounded-xl gap-2 shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Akun Admin Baru</span>
        </Button>
      </div>

      {/* Security Rule Notice */}
      <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-start gap-3 text-xs text-indigo-950">
        <Lock className="h-4 w-4 text-indigo-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-indigo-900">Proteksi Keamanan Role:</span> Sesuai database trigger <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono text-[11px]">trg_prevent_profile_tampering</code>, hanya akun Super Admin yang diizinkan memodifikasi atribut role dan status akun administrator pada tabel <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono text-[11px]">public.profiles</code>.
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <Input
          placeholder="Cari nama admin, email, hub..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-8 text-xs h-9 bg-white border-slate-200 rounded-xl"
        />
      </div>

      {/* Admin Table */}
      <Card className="border-slate-200/80 overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users2 className="h-4.5 w-4.5 text-indigo-600" />
            Daftar Administrator Sistem
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Total {admins.length} akun administrator terdaftar dalam skema multi-role WasteWise.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Administrator</TableHead>
                <TableHead>Role / Kewenangan</TableHead>
                <TableHead>Zona / Hub Operasional</TableHead>
                <TableHead>Status Akun</TableHead>
                <TableHead>Aktivitas Terakhir</TableHead>
                <TableHead className="text-right">Aksi Kontrol</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(admin => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{admin.name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{admin.email}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                      admin.role === 'super_admin'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin Operasional'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 font-medium">
                    {admin.assigned_hub}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      admin.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-red-50 text-red-800 border-red-200'
                    }`}>
                      {admin.status === 'active' ? 'Aktif' : 'Ditangguhkan'}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {admin.last_login}
                  </TableCell>
                  <TableCell className="text-right">
                    {admin.role !== 'super_admin' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(admin.id)}
                        className={`text-xs h-8 rounded-xl ${
                          admin.status === 'active'
                            ? 'text-red-600 border-red-200 hover:bg-red-50'
                            : 'text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {admin.status === 'active' ? 'Tangguhkan Akun' : 'Aktifkan Kembali'}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Root Account</span>
                    )}
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

