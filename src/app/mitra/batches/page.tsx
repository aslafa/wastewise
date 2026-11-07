"use client"

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Lock, AlertTriangle } from 'lucide-react'

export default function MitraBatchesPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-5 shadow-xs flex items-start gap-4">
        <AlertTriangle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-amber-950">
          <span className="font-bold">Manajemen Batch Pengolahan (Tabel processing_batches)</span>
          <p className="leading-relaxed">
            Formulir pembuatan batch dan alokasi metode pengolahan saat ini berstatus terkunci. Fitur akan aktif secara otomatis setelah akreditasi fasilitas pengolahan disahkan oleh Dinas Lingkungan Hidup.
          </p>
        </div>
      </div>

      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Package className="h-4.5 w-4.5 text-amber-600" />
            Daftar Batch Pengolahan Sampah
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Arsip batch pengolahan bahan baku daur ulang (Organik & Anorganik).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-slate-400">
          <Package className="h-10 w-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-700">Belum Ada Batch Aktif</p>
          <p className="text-xs text-slate-400 mt-1">Batch pengolahan akan dibuat saat material dari armada telah diterima secara sah.</p>
        </CardContent>
      </Card>
    </div>
  )
}

