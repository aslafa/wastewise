"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Search,
  Lock,
  ShieldAlert,
  ArrowRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'

interface AuditLogEntry {
  id: string
  created_at: string
  actor_name: string
  actor_role: string
  action: string
  target_table: string
  target_id: string
  details: string
  ip_address: string
}

const SAMPLE_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-AUDIT-901',
    created_at: '05-11-2026 14:45:12 WIB',
    actor_name: 'Ahmad Fauzi',
    actor_role: 'petugas',
    action: 'STATUS_CHANGE',
    target_table: 'pickup_requests',
    target_id: 'PKP-2026-003',
    details: 'Status diubah: arrived -> completed (Verifikasi timbangan fisik 1.85 Kg)',
    ip_address: '182.253.110.45',
  },
  {
    id: 'LOG-AUDIT-902',
    created_at: '05-11-2026 14:45:13 WIB',
    actor_name: 'system_trigger',
    actor_role: 'system',
    action: 'LEDGER_INSERT',
    target_table: 'reward_transactions',
    target_id: 'TXN-POINT-881',
    details: 'Kredit ledger poin warga: 0 poin (Kategori B3 dikarantina)',
    ip_address: '127.0.0.1 (PostgreSQL Trigger)',
  },
  {
    id: 'LOG-AUDIT-903',
    created_at: '05-11-2026 10:15:00 WIB',
    actor_name: 'Budi Hartono',
    actor_role: 'admin',
    action: 'ASSIGNMENT_CREATE',
    target_table: 'pickup_assignments',
    target_id: 'ASN-2026-042',
    details: 'Penugasan armada: Ahmad Fauzi ke tiket PKP-2026-001 (Budi Santoso)',
    ip_address: '114.122.34.89',
  },
  {
    id: 'LOG-AUDIT-904',
    created_at: '04-11-2026 16:45:10 WIB',
    actor_name: 'Reza Pratama',
    actor_role: 'warga',
    action: 'STATUS_CHANGE',
    target_table: 'pickup_requests',
    target_id: 'PKP-2026-005',
    details: 'Pembatalan mandiri oleh warga: pending -> cancelled (Keluar kota)',
    ip_address: '180.248.55.12',
  },
  {
    id: 'LOG-AUDIT-905',
    created_at: '03-11-2026 08:00:22 WIB',
    actor_name: 'Dr. Ir. Hendrawan',
    actor_role: 'super_admin',
    action: 'SYSTEM_SETTINGS_UPDATE',
    target_table: 'system_settings',
    target_id: 'operational_hours',
    details: 'Pembaruan jam operasional: 08:00 - 17:00 WIB',
    ip_address: '103.111.90.14',
  },
]

export default function SuperAdminAuditLogsPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  const filtered = SAMPLE_AUDIT_LOGS.filter((log) => {
    const matchesSearch =
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.target_table.toLowerCase().includes(search.toLowerCase()) ||
      log.target_id.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())

    const matchesRole = roleFilter === 'all' || log.actor_role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Audit Logs & Jejak Keamanan Sistem
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Arsip append-only pada tabel <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">public.audit_logs</code> yang mencatat seluruh mutasi data sensitif.
          </p>
        </div>
      </div>

      {/* Security Assurance Banner */}
      <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 flex items-start gap-3 text-xs text-purple-950">
        <Lock className="h-4 w-4 text-purple-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-purple-900">Kebijakan Immutability:</span> Sesuai aturan Row Level Security (RLS) PostgreSQL, tabel audit log ini kebal modifikasi: operasi <code className="bg-purple-100/80 px-1 py-0.5 rounded font-mono text-[11px]">UPDATE</code> dan <code className="bg-purple-100/80 px-1 py-0.5 rounded font-mono text-[11px]">DELETE</code> ditolak secara absolut untuk seluruh level pengguna termasuk Super Admin.
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl w-fit">
          {['all', 'admin', 'petugas', 'warga', 'system'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                roleFilter === r
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'all' ? 'Semua Aktor' : r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Cari aktor, tabel target, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-9 bg-white border-slate-200 rounded-xl"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <Card className="border-slate-200/80 overflow-hidden shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-4.5 w-4.5 text-purple-600" />
            Jejak Peristiwa Sistem Terkini
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Menampilkan {filtered.length} log aktivitas operasional dan keamanan.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Waktu Log</TableHead>
                <TableHead>Aktor / Role</TableHead>
                <TableHead>Tipe Aksi</TableHead>
                <TableHead>Tabel & ID Target</TableHead>
                <TableHead>Rincian Mutasi / Aktivitas</TableHead>
                <TableHead className="text-right">Alamat IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.created_at}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-xs text-slate-900">{log.actor_name}</div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400">
                      {log.actor_role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-slate-800">
                      {log.target_table}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {log.target_id}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700 max-w-sm">
                    {log.details}
                  </TableCell>
                  <TableCell className="text-right font-mono text-[11px] text-slate-400">
                    {log.ip_address}
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

