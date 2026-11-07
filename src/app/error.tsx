"use client"

import React, { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error caught:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 mb-4">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 tracking-tight">
        Gagal Memuat Data Dashboard
      </h2>
      <p className="text-xs sm:text-sm text-slate-500 max-w-md mt-1.5 mb-6 leading-relaxed">
        Terjadi kendala saat menghubungkan antarmuka dengan service data. Silakan coba muat ulang komponen ini.
      </p>
      <div className="flex items-center gap-3">
        <Button
          onClick={() => reset()}
          className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Coba Lagi
        </Button>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="text-xs text-slate-700"
        >
          Muat Ulang Halaman
        </Button>
      </div>
    </div>
  )
}

