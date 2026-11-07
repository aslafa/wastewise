"use client"

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sliders,
  Save,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sparkles,
  Lock,
  Database,
} from 'lucide-react'

export default function SuperAdminSettingsPage() {
  const [platformName, setPlatformName] = useState('WasteWise')
  const [operationalStart, setOperationalStart] = useState('08:00')
  const [operationalEnd, setOperationalEnd] = useState('17:00')
  const [b3AutoPoints, setB3AutoPoints] = useState(false)
  const [aiThreshold, setAiThreshold] = useState('80')
  const [maxPickupKg, setMaxPickupKg] = useState('100')
  const [isSaved, setIsSaved] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pengaturan Sistem Global
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Konfigurasi parameter operasional platform pada tabel <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[11px]">public.system_settings</code>.
          </p>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 flex items-center gap-3 text-xs text-emerald-900 animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">
            Konfigurasi parameter berhasil diperbarui dan disinkronkan ke PostgreSQL!
          </span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Identitas & Jam Operasional */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-indigo-600" />
              Operasional & Identitas Platform
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Menentukan nama resmi ekosistem dan jam kerja penjemputan armada lapangan.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 block">
                Nama Resmi Platform
              </label>
              <Input
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="text-xs h-10 max-w-md rounded-xl bg-slate-50 border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md pt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Jam Mulai Penjemputan Armada
                </label>
                <Input
                  type="time"
                  value={operationalStart}
                  onChange={e => setOperationalStart(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Jam Selesai Penjemputan Armada
                </label>
                <Input
                  type="time"
                  value={operationalEnd}
                  onChange={e => setOperationalEnd(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Aturan Limbah B3 & AI */}
        <Card className="border-slate-200/80 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4.5 w-4.5 text-red-600" />
              Kebijakan Limbah B3 & Ambang Batas AI
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Pengaturan penanganan limbah berbahaya (B3) dan batas konfidensi model TensorFlow Lite.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-950 block">
                    Pemberian Poin Otomatis untuk Limbah B3
                  </span>
                  <span className="text-[11px] text-amber-800">
                    Sesuai aturan bisnis, limbah berbahaya harus dikarantina tanpa poin komersial langsung.
                  </span>
                </div>
                <Badge variant="b3">Aturan Standar: Non-Aktif</Badge>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="b3Toggle"
                  checked={b3AutoPoints}
                  onChange={e => setB3AutoPoints(e.target.checked)}
                  className="h-4 w-4 text-emerald-600 rounded border-slate-300"
                />
                <label htmlFor="b3Toggle" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Izinkan kalkulasi poin khusus limbah B3 (Tidak disarankan)
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Ambang Batas Minimum Confidence AI (%)
                </label>
                <Input
                  type="number"
                  min="50"
                  max="99"
                  value={aiThreshold}
                  onChange={e => setAiThreshold(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                />
                <span className="text-[10px] text-slate-400">Prediksi di bawah threshold ditandai perlu verifikasi manual.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 block">
                  Batas Maksimal Penjemputan / Order (Kg)
                </label>
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={maxPickupKg}
                  onChange={e => setMaxPickupKg(e.target.value)}
                  className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                />
                <span className="text-[10px] text-slate-400">Di atas batas memerlukan armada truk khusus.</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50/60 border-t border-slate-100 p-4 sm:p-6 flex justify-between items-center">
            <span className="text-xs text-slate-500">
              Perubahan berlaku seketika untuk seluruh pengguna dan armada.
            </span>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold h-10 px-5 rounded-xl gap-2 shadow-xs"
            >
              <Save className="h-4 w-4" />
              <span>Simpan Pengaturan</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

