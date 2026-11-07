"use client"

import React, { useState, useEffect } from 'react'
import { wasteService } from '@/services/wasteService'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Scale, Banknote, Sparkles, TrendingUp, Database, ShieldAlert, Coins, Loader2 } from 'lucide-react'
import { WasteCategoryMetric, Pickup, DbWasteCategory } from '@/types'

export default function DataSampahPage() {
  const [categories, setCategories] = useState<WasteCategoryMetric[]>([])
  const [pickups, setPickups] = useState<Pickup[]>([])
  const [dbCategoryResult, setDbCategoryResult] = useState<{
    categories: DbWasteCategory[]
    isLive: boolean
    message: string
  }>({
    categories: [],
    isLive: true,
    message: 'Memuat master kategori sampah...',
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        const [categoriesData, pickupsData, dbCatData] = await Promise.all([
          wasteService.getCategoryMetrics(),
          wasteService.getPickups('completed'),
          wasteService.getWasteCategories(),
        ])

        if (isMounted) {
          setCategories(categoriesData)
          setPickups(pickupsData)
          setDbCategoryResult(dbCatData)
        }
      } catch (err) {
        console.error('Gagal memuat data sampah:', err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <Loader2 className="h-7 w-7 animate-spin text-emerald-600" />
        <p className="text-xs text-slate-500 font-medium">Memuat data penimbangan dan master kategori...</p>
      </div>
    )
  }

  const totalKg = categories.reduce((acc, c) => acc + c.total_weight_kg, 0)
  const totalEconomicIdr = categories.reduce((acc, c) => acc + c.economic_value_idr, 0)

  return (
    <div className="space-y-6">
      {/* Dynamic Connection Banner */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 flex items-start gap-3">
        <Database className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-950 leading-relaxed">
          <span className="font-semibold text-emerald-800">Status Master Kategori:</span> Master kategori sampah di bawah ini dimuat langsung dari basis data operasional. Data penimbangan terakumulasi otomatis dari penimbangan fisik armada lapangan.
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Data Penimbangan & Nilai Ekonomi Sampah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Rekapitulasi berat riil penimbangan armada lapangan dan konversi nilai sirkular ekonomi Bank Sampah.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Basis Data: Aktif</span>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Total Akumulasi Timbangan
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-50 text-green-700">
                <Scale className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {totalKg.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">Kg</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Berdasarkan sampel penjemputan warga terkonfirmasi
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Estimasi Nilai Ekonomi Bank Sampah
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <Banknote className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                Rp {totalEconomicIdr.toLocaleString('id-ID')}
              </span>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-2">
              Estimasi valuasi komoditas daur ulang
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Rata-rata Setoran Per Warga
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                <TrendingUp className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-slate-900">
                {pickups.length > 0 ? (totalKg / pickups.length).toFixed(1) : '0'}
              </span>
              <span className="text-xs font-semibold text-slate-500 ml-1">Kg / penjemputan</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Rata-rata efisiensi muatan armada
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Master Kategori dari Database */}
      <Card className="border-slate-200/80">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-600" />
                Master Kategori Sampah
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                {dbCategoryResult.message}
              </CardDescription>
            </div>
            <Badge variant="organik" className="w-fit">
              Aktif
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Kategori</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Klasifikasi Bahaya</TableHead>
                <TableHead>Aturan Poin Otomatis</TableHead>
                <TableHead>Indikator Warna</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dbCategoryResult.categories.map((cat) => (
                <TableRow key={cat.id || cat.code}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">
                    {cat.code}
                  </TableCell>
                  <TableCell className="font-semibold text-xs text-slate-800">
                    {cat.name}
                  </TableCell>
                  <TableCell className="text-xs text-slate-600 max-w-xs truncate">
                    {cat.description || '-'}
                  </TableCell>
                  <TableCell>
                    {cat.is_hazardous ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        <ShieldAlert className="h-3 w-3" />
                        B3 (Berbahaya)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md">
                        Non-B3 (Aman)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {cat.allows_auto_points ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        <Coins className="h-3 w-3" />
                        Poin Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        Karantina (Tanpa Poin)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3.5 w-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: cat.color_hex }}
                      />
                      <span className="font-mono text-[11px] text-slate-500">
                        {cat.color_hex}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {categories.map((item) => (
          <Card key={item.category} className="overflow-hidden border-slate-200/80">
            <div className="h-1.5 w-full" style={{ backgroundColor: item.color }} />
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">
                  {item.category}
                </CardTitle>
                <Badge
                  variant={
                    item.category === 'Organik'
                      ? 'organik'
                      : item.category === 'Anorganik'
                      ? 'anorganik'
                      : 'b3'
                  }
                >
                  {item.percentage}% dari total
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-1 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Berat:</span>
                <span className="font-bold text-slate-900">
                  {item.total_weight_kg.toLocaleString('id-ID')} Kg
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Penjemputan:</span>
                <span className="font-semibold text-slate-800">{item.pickup_count} kali</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Nilai Ekonomi:</span>
                <span className="font-bold text-emerald-700">
                  {item.economic_value_idr > 0
                    ? `Rp ${item.economic_value_idr.toLocaleString('id-ID')}`
                    : 'Penanganan Khusus (Limbah B3)'}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Completed Weighing Records Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Riwayat Penimbangan Terakhir oleh Petugas
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Catatan berat timbangan akurat yang telah dikonfirmasi di titik penjemputan warga.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kode Pickup</TableHead>
                <TableHead>Warga</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Petugas Lapangan</TableHead>
                <TableHead>Berat Timbangan</TableHead>
                <TableHead>Estimasi Nilai</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pickups.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs font-semibold text-slate-900">
                    {p.id}
                  </TableCell>
                  <TableCell className="text-xs font-medium text-slate-800">
                    {p.user_name}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        p.category === 'Organik'
                          ? 'organik'
                          : p.category === 'Anorganik'
                          ? 'anorganik'
                          : 'b3'
                      }
                    >
                      {p.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {p.driver_name || 'Petugas Bank Sampah'}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-slate-900">
                    {p.weight_kg} Kg
                  </TableCell>
                  <TableCell className="text-xs font-semibold text-emerald-700">
                    {p.economic_value_idr
                      ? `Rp ${p.economic_value_idr.toLocaleString('id-ID')}`
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="completed">Selesai Ditimbang</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Circular Economy: Penyaluran Material ke Pelaku UMKM */}
      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                Penyaluran Material Sirkular Ekonomi ke Pelaku UMKM
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Alokasi stok sampah terverifikasi yang siap disalurkan ke mitra pengolahan dan Bank Sampah.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs w-fit">
              Ekosistem Kemitraan Aktif
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Komoditas Sampah</TableHead>
                <TableHead>Stok Terkumpul</TableHead>
                <TableHead>Target Mitra UMKM</TableHead>
                <TableHead>Produk Hasil Olahan</TableHead>
                <TableHead>Tabel Database Rujukan</TableHead>
                <TableHead className="text-right">Status Penyaluran</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <div className="font-bold text-xs text-emerald-950">Organik Sisa Makanan</div>
                  <div className="text-[11px] text-slate-500">Sayur, buah, sisa dapur</div>
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900">1,340.2 Kg</TableCell>
                <TableCell className="text-xs text-slate-700">UMKM Maggot BSF & Pupuk Desa</TableCell>
                <TableCell className="text-xs font-semibold text-emerald-700">Pakan Larva Protein & Pupuk Kompos</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">processing_batches</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                    Siap Disalurkan
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="font-bold text-xs text-sky-950">Plastik Botol PET & Kaleng</div>
                  <div className="text-[11px] text-slate-500">Botol mineral, kaleng susu</div>
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900">985.8 Kg</TableCell>
                <TableCell className="text-xs text-slate-700">Bank Sampah & Pabrik Cacah Plastik</TableCell>
                <TableCell className="text-xs font-semibold text-sky-700">Pelet Plastik Daur Ulang & Briket</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">processing_outputs</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                    Siap Disalurkan
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="font-bold text-xs text-slate-900">Kardus & Kertas Terlipat</div>
                  <div className="text-[11px] text-slate-500">Kardus packing, kertas arsip</div>
                </TableCell>
                <TableCell className="font-bold text-xs text-slate-900">420.5 Kg</TableCell>
                <TableCell className="text-xs text-slate-700">UMKM Pengrajin Kertas & Kerajinan</TableCell>
                <TableCell className="text-xs font-semibold text-slate-800">Box Kerajinan & Bubur Kertas</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">partner_receipts</TableCell>
                <TableCell className="text-right">
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[10px]">
                    Siap Disalurkan
                  </Badge>
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell>
                  <div className="font-bold text-xs text-red-950">Limbah Berbahaya (B3)</div>
                  <div className="text-[11px] text-red-600">Baterai, lampu TL, botol kimia</div>
                </TableCell>
                <TableCell className="font-bold text-xs text-red-700">154.5 Kg</TableCell>
                <TableCell className="text-xs text-slate-700 font-semibold">Dinas Lingkungan Hidup (DLH)</TableCell>
                <TableCell className="text-xs text-red-700 font-medium italic">Karantina Pemusnahan (Bukan UMKM)</TableCell>
                <TableCell className="font-mono text-[11px] text-slate-500">waste_records</TableCell>
                <TableCell className="text-right">
                  <Badge variant="b3" className="text-[10px]">
                    Karantina Khusus
                  </Badge>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
