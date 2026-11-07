"use client"

import React from 'react'
import { Button } from '@/components/ui/button'
import { Printer, Download } from 'lucide-react'
import { WasteCategoryMetric, MonthlyCollectionTrend } from '@/types'

interface ReportActionButtonsProps {
  categoryMetrics: WasteCategoryMetric[]
  monthlyTrends: MonthlyCollectionTrend[]
}

export function ReportActionButtons({
  categoryMetrics,
  monthlyTrends,
}: ReportActionButtonsProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    // Generate CSV content
    const headers = ['Kategori', 'Total Bobot (Kg)', 'Jumlah Penjemputan', 'Persentase (%)', 'Estimasi Nilai Ekonomi (Rp)']
    const rows = categoryMetrics.map((c) => [
      c.category,
      c.total_weight_kg,
      c.pickup_count,
      c.percentage,
      c.economic_value_idr,
    ])

    const csvContent = [
      'sep=,',
      'REKAPITULASI PENGELOLAAN SAMPAH - PLATFORM WASTEWISE',
      `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID')}`,
      '',
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan_WasteWise_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        className="gap-2 text-xs text-slate-700 hover:text-slate-900"
      >
        <Printer className="h-3.5 w-3.5" />
        Cetak PDF
      </Button>
      <Button
        size="sm"
        onClick={handleExportCSV}
        className="gap-2 text-xs bg-green-600 hover:bg-green-700 text-white"
      >
        <Download className="h-3.5 w-3.5" />
        Ekspor CSV
      </Button>
    </div>
  )
}

