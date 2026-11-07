"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ReceiptText, Lock, AlertTriangle } from 'lucide-react'

export default function MitraReceiptsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <span className="font-bold">Berita Acara Serah Terima (Tabel partner_receipts)</span>
          <p className="leading-relaxed">
            Manifest serah terima material fisik dan dokumen bukti pembayaran resmi akan diterbitkan bersama armada petugas setelah MoU aktif.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="h-4.5 w-4.5 text-amber-600" />
            Daftar Berita Acara & Tanda Terima
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Riwayat penerimaan material dari armada WasteWise.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-slate-400">
          <ReceiptText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Tanda Terima</p>
          <p className="text-xs text-slate-400 mt-1">Dokumen serah terima akan muncul di sini setelah verifikasi kemitraan resmi.</p>
        </CardContent>
      </Card>
    </div>
  )
}

