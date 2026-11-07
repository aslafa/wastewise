"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Recycle, Lock, AlertTriangle } from 'lucide-react'

export default function MitraOutputsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <span className="font-bold">Pencatatan Produk Hasil Daur Ulang (Tabel processing_outputs)</span>
          <p className="leading-relaxed">
            Pencatatan output produk bernilai ekonomi (kompos, pelet plastik, briket) siap digunakan setelah modul batch pengolahan aktif.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Recycle className="h-4.5 w-4.5 text-amber-600" />
            Produk Turunan Sirkular Ekonomi
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Katalog hasil konversi sampah menjadi komoditas siap jual.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-slate-400">
          <Recycle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Output Produk</p>
          <p className="text-xs text-slate-400 mt-1">Hasil produksi daur ulang akan tercatat setelah proses batching selesai.</p>
        </CardContent>
      </Card>
    </div>
  )
}

