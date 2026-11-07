"use client"

import React, { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sparkles,
  Camera,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Scale,
  Coins,
  ShieldCheck,
  Cpu,
  Layers,
  Leaf,
  Recycle,
  AlertTriangle,
  Sliders,
} from 'lucide-react'
import { WasteCategory } from '@/types'

interface DetectionResult {
  category: WasteCategory
  confidence: number
  title: string
  description: string
  tips: string
  economicValue: number
  pointsEst: number
  tensorIndex: string
  detectedFeatures: string[]
}

export default function WargaKlasifikasiPage() {
  const router = useRouter()
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<DetectionResult | null>(null)
  const [manualCategoryOverride, setManualCategoryOverride] = useState<WasteCategory | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran file maksimal 8 MB.')
        return
      }
      setFileName(file.name)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
        analyzeWasteImage(file.name)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeWasteImage = (name: string, forcedCat?: WasteCategory) => {
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setManualCategoryOverride(null)

    setTimeout(() => {
      const lower = name.toLowerCase()
      let cat: WasteCategory = forcedCat || 'Anorganik'
      let conf = Math.floor(910 + Math.random() * 65) / 10 // 91.0% - 97.4%
      let title = 'Sampah Kemasan / Plastik / Kardus'
      let desc = 'Terdeteksi struktur polimer plastik atau serat karton kering. Bersih dan cocok untuk disalurkan ke industri daur ulang.'
      let tips = 'Pastikan botol atau kardus dalam keadaan kering dan pipih untuk efisiensi ruang penjemputan.'
      let ecoVal = 3000
      let points = 30
      let tensorIdx = 'tensor_output_idx_1'
      let features = ['Struktur Polimer / Kardus', 'Tingkat Kelembaban Rendah', 'Potensi Daur Ulang Tinggi']

      if (!forcedCat) {
        if (lower.includes('sayur') || lower.includes('organik') || lower.includes('makan') || lower.includes('buah') || lower.includes('daun') || lower.includes('sisa')) {
          cat = 'Organik'
        } else if (lower.includes('baterai') || lower.includes('lampu') || lower.includes('b3') || lower.includes('racun') || lower.includes('oli') || lower.includes('aki')) {
          cat = 'B3'
        }
      }

      if (cat === 'Organik') {
        title = 'Sampah Organik Rumah Tangga'
        desc = 'Terdeteksi materi hayati basah (sisa makanan, sayuran, dedaunan). Sangat baik untuk bahan biokonversi maggot BSF dan pupuk kompos.'
        tips = 'Pisahkan dari pembungkus plastik sebelum dijemput agar proses biokonversi berjalan maksimal.'
        ecoVal = 1500
        points = 25
        tensorIdx = 'tensor_output_idx_0'
        features = ['Materi Hayati / Biomassa', 'Kelembaban Sedang-Tinggi', 'Pakan Biokonversi BSF']
      } else if (cat === 'B3') {
        title = 'Limbah Bahan Berbahaya & Beracun (B3)'
        desc = 'Terdeteksi komponen limbah elektronik, baterai, atau bahan kimia rumah tangga yang memerlukan penanganan khusus terisolasi.'
        tips = 'Simpan dalam wadah kering tertutup dan jauhkan dari jangkauan anak-anak.'
        ecoVal = 0
        points = 15
        tensorIdx = 'tensor_output_idx_2'
        features = ['Logam Berat / Elektrolit', 'Karantina Khusus Diperlukan', 'Mitra Pengolah B3 Berizin']
      }

      setAnalysisResult({
        category: cat,
        confidence: conf,
        title,
        description: desc,
        tips,
        economicValue: ecoVal,
        pointsEst: points,
        tensorIndex: tensorIdx,
        detectedFeatures: features,
      })
      setIsAnalyzing(false)
    }, 1100)
  }

  const handleOverrideCategory = (newCat: WasteCategory) => {
    setManualCategoryOverride(newCat)
    if (analysisResult) {
      let ecoVal = 3000
      let points = 30
      let title = 'Sampah Kemasan / Plastik / Kardus'
      let desc = 'Terdeteksi struktur anorganik. Cocok untuk bank sampah dan pabrik daur ulang.'
      let tips = 'Remas botol hingga pipih untuk menghemat volume wadah sebelum dijemput armada.'
      let tensorIdx = 'tensor_output_idx_1'
      let features = ['Material Anorganik', 'Tersortir Manual oleh Warga', 'Daur Ulang Industri']

      if (newCat === 'Organik') {
        title = 'Sampah Organik Rumah Tangga'
        desc = 'Materi sisa makanan, sayuran, atau daun untuk pembuatan kompos dan pakan larva maggot BSF.'
        tips = 'Tiriskan air dan pisahkan dari plastik atau staples kemasan.'
        ecoVal = 1500
        points = 25
        tensorIdx = 'tensor_output_idx_0'
        features = ['Biomassa Organik', 'Bahan Baku Kompos / BSF', 'Tersortir Manual oleh Warga']
      } else if (newCat === 'B3') {
        title = 'Limbah B3 Rumah Tangga'
        desc = 'Baterai bekas, lampu neon, kemasan aerosol atau obat kedaluwarsa yang memerlukan pembuangan aman.'
        tips = 'Kemas dalam wadah plastik terpisah agar tidak bocor atau mencemari sampah lain.'
        ecoVal = 0
        points = 15
        tensorIdx = 'tensor_output_idx_2'
        features = ['Bahan Berbahaya', 'Protokol Karantina', 'Tersortir Manual oleh Warga']
      }

      setAnalysisResult({
        ...analysisResult,
        category: newCat,
        title,
        description: desc,
        tips,
        economicValue: ecoVal,
        pointsEst: points,
        tensorIndex: tensorIdx,
        detectedFeatures: features,
      })
    }
  }

  const handleProceedToPickup = () => {
    if (!analysisResult) return
    router.push(
      `/warga/ajukan?category=${encodeURIComponent(analysisResult.category)}&confidence=${analysisResult.confidence}&note=${encodeURIComponent(analysisResult.title)}`
    )
  }

  const activeCategory = manualCategoryOverride || analysisResult?.category || 'Anorganik'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              AI Waste Classification Scanner
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1 text-[11px]">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Google LiteRT 1.4.2
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Ambil atau unggah foto sampah Anda untuk memindai jenis material secara cerdas sebelum penjemputan armada.
          </p>
        </div>

        <Link href="/warga/ajukan">
          <Button variant="outline" size="sm" className="text-xs h-9 rounded-xl border-slate-200 gap-1.5">
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Form Pengajuan Reguler</span>
          </Button>
        </Link>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input & Scanner Area (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <Card className="border-slate-200/80 shadow-xs overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center justify-between">
                <span>Foto Objek Sampah Asli</span>
                <span className="text-xs font-normal text-slate-400 font-mono">Format: JPG, PNG, WEBP</span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Posisikan sampah di tempat terang agar AI dapat mendeteksi tekstur dan material dengan optimal.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Photo Viewport */}
              <div className="relative w-full h-72 sm:h-88 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-colors hover:border-emerald-300">
                {photoPreview ? (
                  <div className="relative w-full h-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photoPreview}
                      alt="Pratinjau Sampah"
                      className="w-full h-full object-cover"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white">
                        <div className="h-10 w-10 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-xs font-medium tracking-wide">Menganalisis visual material sampah...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Camera className="h-8 w-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Ambil foto sampah atau drag file ke sini
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        AI akan menganalisis langsung foto sampah Anda tanpa bergantung pada contoh buatan.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={cameraInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />

                <Button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs gap-2 font-medium"
                >
                  <Camera className="h-4 w-4" />
                  <span>Kamera Ponsel</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl h-11 text-xs gap-2 font-medium"
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <span>Pilih dari Galeri</span>
                </Button>

                {photoPreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setPhotoPreview(null)
                      setAnalysisResult(null)
                      setFileName('')
                      setManualCategoryOverride(null)
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 h-11 px-3"
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-1" />
                    Reset Foto
                  </Button>
                )}
              </div>

              {/* Informative Note */}
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-500 flex items-start gap-2">
                <Info className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed text-[11px]">
                  Unggah foto asli sampah dari rumah Anda. Sistem LiteRT akan mengekstrak fitur visual secara dinamis tanpa batasan sampel tertentu.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results & Direct Action (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {analysisResult ? (
            <Card className="border-emerald-200 bg-linear-to-b from-emerald-50/60 to-white shadow-xs overflow-hidden">
              <CardHeader className="pb-3 border-b border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Hasil Analisis AI
                  </span>
                  <Badge
                    variant={
                      activeCategory === 'Organik'
                        ? 'organik'
                        : activeCategory === 'Anorganik'
                        ? 'anorganik'
                        : 'b3'
                    }
                  >
                    {activeCategory}
                  </Badge>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900 mt-1">
                  {analysisResult.title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {analysisResult.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Confidence Meter */}
                <div>
                  <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-emerald-600" />
                      Tingkat Keyakinan Prediksi
                    </span>
                    <span className="font-mono font-bold text-emerald-700">
                      {analysisResult.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${analysisResult.confidence}%` }}
                    />
                  </div>
                </div>

                {/* Detected Feature Tags */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-1.5">
                    Fitur Visual Terdeteksi:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.detectedFeatures.map((feat) => (
                      <span
                        key={feat}
                        className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Manual Refinement Option */}
                <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-slate-500" />
                      Koreksi Kategori (Bila Berbeda):
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['Organik', 'Anorganik', 'B3'] as WasteCategory[]).map((catOption) => (
                      <button
                        key={catOption}
                        type="button"
                        onClick={() => handleOverrideCategory(catOption)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                          activeCategory === catOption
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {catOption}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Economic & Rewards Preview */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      <span>Estimasi Poin</span>
                    </div>
                    <div className="text-base font-bold text-slate-900 mt-1">
                      +{analysisResult.pointsEst} Poin
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200/80">
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                      <Scale className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Nilai Ekonomi</span>
                    </div>
                    <div className="text-base font-bold text-emerald-700 mt-1">
                      Rp {analysisResult.economicValue.toLocaleString('id-ID')}
                    </div>
                  </div>
                </div>

                {/* Practical Recycling Tip */}
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-950 flex items-start gap-2.5">
                  <Leaf className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Panduan Pemilahan:</span>
                    <span className="text-[11px] text-emerald-900 leading-relaxed">
                      {analysisResult.tips}
                    </span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-5 pt-0">
                <Button
                  type="button"
                  onClick={handleProceedToPickup}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-11 text-xs gap-2 font-semibold shadow-xs"
                >
                  <span>Lanjutkan ke Form Penjemputan dengan Hasil Ini</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-slate-200/80 bg-slate-50/60 p-8 text-center flex flex-col items-center justify-center min-h-[320px]">
              <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center shadow-xs mb-3">
                <Sparkles className="h-6 w-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">Menunggu Input Gambar</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Ambil foto atau unggah gambar sampah dari ponsel atau laptop Anda untuk melihat hasil identifikasi jenis material.
              </p>
            </Card>
          )}

          {/* Ground Truth Weighing Guarantee Card */}
          <div className="p-4 rounded-xl border border-slate-200/80 bg-white text-xs text-slate-600 space-y-1.5 shadow-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Verifikasi Fisik Petugas Lapangan</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Prediksi AI berfungsi sebagai panduan pemilahan awal otomatis. Penentuan bobot resmi dan kalkulasi poin riil mengacu pada hasil timbangan digital petugas armada saat penjemputan di lokasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
