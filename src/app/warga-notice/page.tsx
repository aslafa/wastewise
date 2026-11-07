"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Smartphone, Download, LogOut, Leaf, ShieldAlert, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WargaNoticePage() {
  const { profile, signOut } = useAuth()
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 text-center">
        {/* Brand */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4 ring-4 ring-emerald-50">
          <Smartphone className="h-7 w-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          Portal Khusus Petugas & Manajemen
        </h1>
        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          Halo, <span className="font-semibold text-slate-800">{profile?.full_name || 'Warga WasteWise'}</span>! Akun Anda terdaftar sebagai <span className="font-semibold text-emerald-700">Warga</span>.
        </p>

        {/* Notice Box */}
        <div className="my-5 p-4 rounded-xl border border-amber-200 bg-amber-50/70 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-900">
            <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
            <span>Akses Web Operasional Dibatasi</span>
          </div>
          <p className="text-amber-800 leading-relaxed text-[11px]">
            Dashboard web ini khusus digunakan oleh Petugas Lapangan, Admin Operasional, dan Bank Sampah. Seluruh layanan pemilahan AI, pemesanan penjemputan, poin, dan penukaran hadiah bagi warga diakses melalui <strong>Aplikasi Android WasteWise</strong>.
          </p>
        </div>

        {/* Android App Action */}
        <div className="space-y-3">
          <Button
            onClick={() => alert('File instalasi APK WasteWise berada di folder app/ project Android.')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-xs rounded-xl h-10 gap-2"
          >
            <Download className="h-4 w-4" />
            Unduh Aplikasi Android WasteWise
          </Button>

          <Button
            variant="outline"
            onClick={signOut}
            className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs rounded-xl h-10 gap-2"
          >
            <LogOut className="h-4 w-4" />
            Keluar dari Akun (Logout)
          </Button>
        </div>

        <p className="mt-6 text-[10px] text-slate-400">
          WasteWise Android Native • TensorFlow Lite On-Device
        </p>
      </div>
    </div>
  )
}

