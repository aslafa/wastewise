"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { wasteService, PointLedgerRecord } from '@/services/wasteService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Coins,
  History,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Database,
  Loader2,
  FileText,
  CalendarPlus,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function WargaRiwayatPage() {
  const { user, profile } = useAuth()
  const [transactions, setTransactions] = useState<PointLedgerRecord[]>([])
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadLedger() {
      setIsLoading(true)
      const activeUserId = user?.id || profile?.id || ''
      const res = await wasteService.getWargaLedger(activeUserId)
      if (isMounted) {
        setTransactions(res.transactions)
        setIsLive(res.isLive)
        setIsLoading(false)
      }
    }

    loadLedger()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Buku Besar Poin Digital
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Riwayat Pengumpulan & Buku Besar Poin
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Catatan mutasi saldo poin reward warga yang tercatat secara transparan dan aman.
        </p>
      </div>

      {/* Assurance Card */}
      <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-start gap-3 text-xs text-emerald-950">
        <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold text-emerald-900">Transparansi Poin Berbasis Bobot Riil:</span> Seluruh poin yang Anda peroleh dikalkulasi murni dari berat timbangan fisik resmi yang dicatat oleh petugas armada di rumah Anda.
        </div>
      </div>

      {/* Status Bar */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            {isLive
              ? 'Tersinkronisasi langsung dengan buku besar poin resmi akun Anda.'
              : 'Mode Terhubung: Menampilkan riwayat transaksi perolehan poin warga.'}
          </span>
        </div>
        <Badge variant="outline" className={isLive ? 'border-emerald-300 text-emerald-800' : 'border-amber-300 text-amber-800'}>
          {isLive ? 'LIVE' : 'SIMULASI'}
        </Badge>
      </div>

      {/* Ledger Table */}
      <Card className="border-slate-200/80 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Coins className="h-4.5 w-4.5 text-amber-600" />
            Mutasi Buku Besar Poin (Ledger)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Setiap transaksi memiliki referensi tiket atau kode verifikasi unik.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              <span className="text-xs">Memuat mutasi buku besar poin...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 mx-auto">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Buku Kas Saldo Poin Masih Bersih</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Belum ada catatan mutasi transaksi. Poin akan otomatis tercatat ke buku besar ini setelah penjemputan sampah Anda selesai ditimbang oleh petugas.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/warga/ajukan">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 rounded-xl gap-2 font-semibold shadow-xs">
                    <CalendarPlus className="h-4 w-4" />
                    <span>Ajukan Penjemputan Sampah Sekarang</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Waktu Transaksi</TableHead>
                  <TableHead>Jenis Mutasi</TableHead>
                  <TableHead>Rincian Deskripsi</TableHead>
                  <TableHead>Kode Referensi</TableHead>
                  <TableHead className="text-right">Perubahan Poin</TableHead>
                  <TableHead className="text-right">Saldo Akhir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell className="font-mono text-xs text-slate-500 whitespace-nowrap">
                      {txn.created_at ? txn.created_at.replace('T', ' ').slice(0, 16) : '-'}
                    </TableCell>
                    <TableCell>
                      {txn.points_amount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <ArrowUpRight className="h-3 w-3" />
                          Poin Masuk (Penjemputan)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <ArrowDownRight className="h-3 w-3" />
                          Penukaran Voucher
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-700 font-medium">
                      {txn.description}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {txn.reference_id ? txn.reference_id.slice(0, 8) + '...' : '-'}
                    </TableCell>
                    <TableCell className="text-right font-bold text-xs whitespace-nowrap">
                      {txn.points_amount > 0 ? (
                        <span className="text-emerald-700">+{txn.points_amount} Poin</span>
                      ) : (
                        <span className="text-amber-700">{txn.points_amount} Poin</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold text-xs text-slate-900">
                      {txn.balance_after}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
