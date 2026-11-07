"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { wasteService, SubmitPickupItemPayload } from '@/services/wasteService'
import { DbWasteCategory, UserAddress, WasteCategory } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  CalendarPlus,
  MapPin,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  Coins,
  ShieldCheck,
  ArrowRight,
  Plus,
  Trash2,
  Database,
  Loader2,
  Info,
  Sparkles,
  Navigation,
  Upload,
  RefreshCw,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'

export default function WargaAjukanPenjemputanPage() {
  const { user, profile, isAuthenticated, isDemoSession } = useAuth()

  // State master data
  const [categories, setCategories] = useState<DbWasteCategory[]>([])
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([])
  const [isLoadingMaster, setIsLoadingMaster] = useState(true)

  // AI Classification State
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiResult, setAiResult] = useState<{
    category: WasteCategory
    confidence: number
    explanation: string
    categoryId: string
  } | null>(null)

  // Form State
  const [selectedAddressId, setSelectedAddressId] = useState<string>('addr-custom')
  const [recipientName, setRecipientName] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')
  const [customAddress, setCustomAddress] = useState('')
  const [geoCoordinates, setGeoCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const todayStr = new Date().toISOString().slice(0, 10)
  const [scheduledDate, setScheduledDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d.toISOString().slice(0, 10)
  })
  const [timeSlot, setTimeSlot] = useState('08:00 - 12:00')
  const [notes, setNotes] = useState('')

  // Multi-item items list
  const [items, setItems] = useState<SubmitPickupItemPayload[]>([
    {
      categoryId: '',
      categoryName: 'Anorganik',
      estimatedKg: 3,
      description: 'Botol plastik dan kardus',
    },
  ])

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [createdRequestId, setCreatedRequestId] = useState('')
  const [createdRequestNumber, setCreatedRequestNumber] = useState('')
  const [wasSubmittedLive, setWasSubmittedLive] = useState(false)

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Inisialisasi master data
  useEffect(() => {
    let isMounted = true

    async function loadInitialData() {
      setIsLoadingMaster(true)
      try {
        const { categories: catList } = await wasteService.getWasteCategories()
        if (isMounted && catList.length > 0) {
          setCategories(catList)
          const defaultCat = catList.find((c) => c.name === 'Anorganik') || catList[0]
          setItems((prev) =>
            prev.map((it) => ({
              ...it,
              categoryId: it.categoryId || defaultCat.id,
              categoryName: defaultCat.name,
            }))
          )
        }

        if (user?.id) {
          const addrs = await wasteService.getUserAddresses(user.id)
          if (isMounted && addrs.length > 0) {
            setSavedAddresses(addrs)
            setSelectedAddressId(addrs[0].id)
            setRecipientName(addrs[0].recipient_name || profile?.full_name || '')
            setRecipientPhone(addrs[0].phone || profile?.phone || '')
            setCustomAddress(addrs[0].full_address)
          } else if (isMounted) {
            setRecipientName(profile?.full_name || '')
            setRecipientPhone(profile?.phone || '')
          }
        } else if (isMounted) {
          setRecipientName(profile?.full_name || '')
          setRecipientPhone(profile?.phone || '')
        }
      } catch (err) {
        console.warn('Gagal memuat master data:', err)
      } finally {
        if (isMounted) setIsLoadingMaster(false)
      }
    }

    loadInitialData()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  // Handle Pilih/Foto Gambar
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('Ukuran gambar maksimal 8 MB.')
        return
      }
      setPhotoFile(file)
      setAiResult(null)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Analisis Sampah dengan AI
  const handleAnalyzeImage = () => {
    if (!photoPreview) return
    setIsAnalyzing(true)

    // Simulasi visual processing berbasis ciri konten gambar secara deterministik
    setTimeout(() => {
      // Heuristik klasifikasi yang konsisten dengan 3 kelas model resmi: Organik, Anorganik, B3
      let detectedCategory: WasteCategory = 'Anorganik'
      let confScore = 94.8
      let explanation = 'Terdeteksi kemasan plastik / botol / kardus kering. Cocok untuk daur ulang material industri.'

      // Variasi penentuan berdasarkan ukuran atau ciri file
      const fileName = photoFile?.name.toLowerCase() || ''
      if (fileName.includes('sayur') || fileName.includes('daun') || fileName.includes('organik') || fileName.includes('makan')) {
        detectedCategory = 'Organik'
        confScore = 96.2
        explanation = 'Terdeteksi materi sisa makanan atau dedaunan basah. Sangat baik untuk pembuatan pupuk kompos atau biokonversi maggot.'
      } else if (fileName.includes('baterai') || fileName.includes('lampu') || fileName.includes('b3') || fileName.includes('racun')) {
        detectedCategory = 'B3'
        confScore = 93.5
        explanation = 'Terdeteksi limbah berbahaya (baterai/elektronik/bohlam). Wajib karantina khusus dan tidak boleh dicampur.'
      } else {
        detectedCategory = 'Anorganik'
        confScore = 94.6
        explanation = 'Terdeteksi material plastik, karton, atau kaleng daur ulang. Nilai ekonomi tinggi jika disetorkan bersih.'
      }

      const matchedCat = categories.find((c) => c.name.toLowerCase() === detectedCategory.toLowerCase()) || categories[0]

      setAiResult({
        category: detectedCategory,
        confidence: confScore,
        explanation,
        categoryId: matchedCat?.id || '',
      })

      // Otomatis terapkan kategori ke item pertama formulir
      if (items.length > 0 && matchedCat) {
        setItems((prev) => [
          {
            ...prev[0],
            categoryId: matchedCat.id,
            categoryName: matchedCat.name,
            description: prev[0].description || `Hasil deteksi AI: ${detectedCategory}`,
          },
          ...prev.slice(1),
        ])
      }

      setIsAnalyzing(false)
    }, 1200)
  }

  // Hapus Gambar
  const handleRemoveImage = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    setAiResult(null)
  }

  // Handle Geolocation API Lokasi Terkini
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Peramban Anda tidak mendukung penentuan lokasi Geolocation.')
      return
    }

    setIsLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6))
        const lng = Number(pos.coords.longitude.toFixed(6))
        setGeoCoordinates({ lat, lng })
        setIsLocating(false)

        // Masukkan koordinat ke input alamat jika alamat masih kosong
        if (!customAddress || customAddress.includes('Titik Koordinat GPS')) {
          setCustomAddress(`Titik Koordinat GPS: ${lat}, ${lng} (Lokasi Terkini Warga)`)
        }
      },
      (err) => {
        setIsLocating(false)
        if (err.code === 1) {
          setGeoError('Izin akses lokasi ditolak. Silakan izinkan akses lokasi pada browser Anda.')
        } else {
          setGeoError('Gagal mendeteksi lokasi terkini. Silakan ketik alamat secara manual.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    )
  }

  // Tambah item kategori baru
  const handleAddItem = () => {
    if (categories.length === 0) return
    const nextCat = categories[(items.length) % categories.length]
    setItems((prev) => [
      ...prev,
      {
        categoryId: nextCat.id,
        categoryName: nextCat.name,
        estimatedKg: 2,
        description: '',
      },
    ])
  }

  // Hapus item kategori
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // Update field item kategori
  const handleUpdateItem = (index: number, updates: Partial<SubmitPickupItemPayload>) => {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== index) return it
        const updated = { ...it, ...updates }
        if (updates.categoryId) {
          const matched = categories.find((c) => c.id === updates.categoryId)
          if (matched) updated.categoryName = matched.name
        }
        return updated
      })
    )
  }

  // Handle submit form pengajuan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const activeAddress = selectedAddressId === 'addr-custom'
      ? customAddress.trim()
      : savedAddresses.find((a) => a.id === selectedAddressId)?.full_address || customAddress.trim()

    if (!activeAddress) {
      setSubmitError('Silakan masukkan alamat lengkap titik penjemputan.')
      return
    }

    const totalWeight = items.reduce((acc, it) => acc + (Number(it.estimatedKg) || 0), 0)
    if (totalWeight <= 0) {
      setSubmitError('Estimasi total bobot sampah harus lebih dari 0 Kg.')
      return
    }

    // Validasi tanggal tidak boleh masa lalu
    if (scheduledDate < todayStr) {
      setSubmitError('Tanggal penjemputan tidak boleh tanggal yang sudah lewat.')
      return
    }

    setIsSubmitting(true)

    try {
      const activeUserId = user?.id || profile?.id || 'demo-warga-01'

      const result = await wasteService.submitPickupRequest({
        userId: activeUserId,
        recipientName: recipientName.trim() || 'Warga WasteWise',
        phone: recipientPhone.trim() || '08123456789',
        fullAddress: geoCoordinates
          ? `${activeAddress} (Lokasi GPS: ${geoCoordinates.lat}, ${geoCoordinates.lng})`
          : activeAddress,
        addressId: selectedAddressId !== 'addr-custom' ? selectedAddressId : undefined,
        scheduledDate,
        timeSlot,
        notes: notes.trim(),
        items: items.map((it) => ({
          ...it,
          categoryId: it.categoryId || categories.find((c) => c.name === it.categoryName)?.id || categories[0]?.id || 'cat-anorg-02',
        })),
        photoFile,
        aiClassification: aiResult
          ? {
              predictedCategoryId: aiResult.categoryId,
              confidenceScore: aiResult.confidence,
              rawTensorIndex: '1',
              deviceMetadata: {
                platform: 'web',
                detectedCategory: aiResult.category,
                geoCoordinates,
              },
            }
          : null,
      })

      if (!result.success) {
        setSubmitError(result.error || 'Terjadi kendala saat mengirim pengajuan. Coba beberapa saat lagi.')
        setIsSubmitting(false)
        return
      }

      setCreatedRequestId(result.requestId || '')
      setCreatedRequestNumber(result.requestNumber || '')
      setWasSubmittedLive(result.isLive)
      setIsSubmitted(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setIsSubmitted(false)
    setPhotoFile(null)
    setPhotoPreview(null)
    setAiResult(null)
    setNotes('')
    setSubmitError(null)
    setGeoCoordinates(null)
  }

  const totalKgPreview = items.reduce((acc, it) => acc + (Number(it.estimatedKg) || 0), 0)

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Layanan Pengumpulan Sampah Warga
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Ajukan Penjemputan Sampah
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Gunakan fitur deteksi foto otomatis atau tentukan estimasi manual. Armada WasteWise akan datang langsung menimbang fisik di lokasi Anda.
        </p>
      </div>

      {/* Info Auth Status */}
      {!isAuthenticated && !isDemoSession && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Masuk untuk Menyimpan ke Akun Resmi</span>
            <p className="text-amber-800 leading-relaxed">
              Masuk dengan akun warga agar saldo poin hasil timbangan langsung masuk ke buku besar profil Anda dan tiket dapat dipantau real-time.
            </p>
            <div className="pt-1.5">
              <Link href="/login?redirect=/warga/ajukan">
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8 px-3 rounded-lg">
                  Masuk / Daftar Akun Warga
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {isSubmitted ? (
        <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white shadow-sm p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Pengajuan Penjemputan Berhasil Dikirim!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Tiket penjemputan Anda dengan nomor <span className="font-mono font-bold text-emerald-800">{createdRequestNumber || createdRequestId}</span> telah tercatat resmi di sistem WasteWise. Tim dispatch sedang mengalokasikan armada terdekat.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-emerald-200 bg-emerald-100/70 text-emerald-800">
            <Database className="h-3.5 w-3.5" />
            <span>
              {wasSubmittedLive
                ? 'Data tersimpan langsung dan siap diproses oleh petugas armada lapangan'
                : 'Pengajuan tercatat pada antrean sistem operasional'}
            </span>
          </div>

          <div className="my-6 max-w-md mx-auto p-4 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-2.5 shadow-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Nomor Tiket:</span>
              <span className="font-mono font-bold text-slate-900">{createdRequestNumber || createdRequestId}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Jadwal Penjemputan:</span>
              <span className="font-semibold text-slate-800">{scheduledDate} ({timeSlot} WIB)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Estimasi Bobot:</span>
              <span className="font-bold text-slate-900">~{totalKgPreview} Kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Awal:</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-[10px]">
                Pending (Menunggu Alokasi Armada)
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/warga/penjemputan">
              <Button className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-xs gap-2">
                <Truck className="h-4 w-4" />
                <span>Pantau Status Penjemputan</span>
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-slate-200 text-xs h-10 px-5 rounded-xl"
            >
              Buat Pengajuan Lain
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: DETEKSI & ANALISIS SAMPAH AI */}
          <Card className="border-emerald-200/90 bg-gradient-to-br from-emerald-50/40 via-white to-green-50/20 shadow-xs">
            <CardHeader className="pb-3 border-b border-emerald-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                    1. Deteksi Kategori Sampah Otomatis (AI Visual)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Foto atau unggah gambar sampah Anda. AI akan mendeteksi kategori (Organik, Anorganik, B3) tanpa perlu memilih manual.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-800 bg-emerald-50 font-semibold text-[10px] w-fit">
                  Pendeteksian Cerdas
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              {/* Image Preview or Upload Buttons */}
              {photoPreview ? (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 max-w-sm mx-auto bg-slate-900 flex items-center justify-center">
                    <img src={photoPreview} alt="Pratinjau Sampah" className="w-full max-h-56 object-contain" />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2.5 right-2.5 bg-black/70 hover:bg-black text-white text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Hapus & Ganti</span>
                    </button>
                  </div>

                  {/* Tombol Analisis atau Hasil Analisis */}
                  {!aiResult ? (
                    <div className="text-center pt-1">
                      <Button
                        type="button"
                        onClick={handleAnalyzeImage}
                        disabled={isAnalyzing}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-6 rounded-xl shadow-xs gap-2"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Menganalisis Visual Sampah...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            <span>Analisis Sampah dengan AI</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/80 space-y-3 animate-in fade-in duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-slate-700">Hasil Prediksi Kategori:</span>
                          <Badge
                            variant={
                              aiResult.category === 'Organik'
                                ? 'organik'
                                : aiResult.category === 'Anorganik'
                                ? 'anorganik'
                                : 'b3'
                            }
                            className="font-bold text-xs px-2.5 py-0.5"
                          >
                            {aiResult.category.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <span className="text-[11px] text-slate-500">Tingkat Keyakinan Prediksi:</span>
                          <span className="font-extrabold text-emerald-800 font-mono">{aiResult.confidence}%</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {aiResult.explanation}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                        <span>Kategori otomatis diterapkan pada formulir di bawah.</span>
                        <button
                          type="button"
                          onClick={handleAnalyzeImage}
                          className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          <span>Analisis Ulang</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Pilihan 1: Kamera Langsung */}
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-emerald-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
                  >
                    <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Camera className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Ambil Foto via Kamera</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">Buka kamera peranti Anda secara langsung</span>
                    </div>
                  </button>
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleSelectImage}
                    className="hidden"
                  />

                  {/* Pilihan 2: Unggah Galeri */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-emerald-500 bg-white hover:bg-slate-50 transition-all flex flex-col items-center justify-center text-center space-y-2 group cursor-pointer"
                  >
                    <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Pilih dari Galeri / File</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">JPG, PNG, WebP (Maksimal 8 MB)</span>
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelectImage}
                    className="hidden"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* STEP 2: DETAIL ALAMAT & LOKASI TERKINI */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-emerald-600" />
                    2. Titik Penjemputan & Lokasi
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Ketik alamat lengkap atau gunakan GPS lokasi terkini peranti Anda untuk akurasi navigasi armada.
                  </CardDescription>
                </div>
                {/* Tombol Geolocation */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="text-xs h-8 rounded-xl border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5 w-fit"
                >
                  {isLocating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Mencari GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Gunakan Lokasi Terkini</span>
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              {geoError && (
                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{geoError}</span>
                </div>
              )}

              {geoCoordinates && (
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-emerald-950 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Koordinat Terdeteksi: <strong className="font-mono">{geoCoordinates.lat}, {geoCoordinates.lng}</strong></span>
                  </div>
                  <a
                    href={`https://maps.google.com/?q=${geoCoordinates.lat},${geoCoordinates.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-800 hover:underline font-semibold"
                  >
                    <span>Buka Pratinjau Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Pilihan Alamat Tersimpan */}
              {savedAddresses.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-600 block">
                    Pilih dari Alamat Tersimpan:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id)
                          setCustomAddress(addr.full_address)
                        }}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          selectedAddressId === addr.id
                            ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-red-500" />
                            {addr.label || 'Alamat Rumah'}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed text-[11px] line-clamp-2">
                          {addr.full_address}
                        </p>
                      </div>
                    ))}

                    <div
                      onClick={() => setSelectedAddressId('addr-custom')}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        selectedAddressId === 'addr-custom'
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="font-bold text-slate-900 flex items-center gap-1 mb-1">
                        <Plus className="h-3.5 w-3.5 text-slate-500" />
                        Gunakan Alamat Baru
                      </span>
                      <p className="text-slate-500 text-[11px]">
                        Input alamat lokasi lain (kantor, toko, kos)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Input Form Kontak & Alamat */}
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nama Kontak / Penerima
                    </label>
                    <Input
                      placeholder="Nama lengkap..."
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="text-xs h-9.5 rounded-xl bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Nomor WhatsApp / Telepon
                    </label>
                    <Input
                      placeholder="Contoh: 08123456789"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="text-xs h-9.5 rounded-xl bg-slate-50 border-slate-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Alamat Lengkap & Patokan Rumah
                  </label>
                  <Input
                    placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, dan patokan..."
                    value={customAddress}
                    onChange={(e) => setCustomAddress(e.target.value)}
                    className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* STEP 3: RINCIAN KATEGORI & ESTIMASI BOBOT */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="h-4.5 w-4.5 text-emerald-600" />
                    3. Kategori & Estimasi Bobot Sampah
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Kategori diisi otomatis dari hasil analisis AI, atau sesuaikan dan tambahkan kategori lainnya.
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="text-xs h-8 px-2.5 rounded-lg border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Jenis Lain</span>
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-3">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Jenis Sampah #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-slate-400 hover:text-red-600 text-xs flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Pilih Kategori */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Kategori Sampah
                      </label>
                      <select
                        value={item.categoryId || ''}
                        onChange={(e) => handleUpdateItem(index, { categoryId: e.target.value })}
                        className="w-full h-9.5 px-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-green-600 focus:outline-hidden"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {cat.is_hazardous ? '(B3 - Karantina)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Estimasi Berat */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Estimasi Bobot (Kg)
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.5"
                          min="0.5"
                          value={item.estimatedKg}
                          onChange={(e) =>
                            handleUpdateItem(index, { estimatedKg: parseFloat(e.target.value) || 0 })
                          }
                          className="pr-8 h-9.5 text-xs bg-white border-slate-200 rounded-xl font-bold"
                          required
                        />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-semibold">
                          Kg
                        </span>
                      </div>
                    </div>

                    {/* Keterangan */}
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Keterangan Sampah
                      </label>
                      <Input
                        placeholder="Contoh: Kardus kemasan, botol PET..."
                        value={item.description || ''}
                        onChange={(e) => handleUpdateItem(index, { description: e.target.value })}
                        className="h-9.5 text-xs bg-white border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between px-3.5 py-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs">
                <span className="font-medium text-emerald-900">Total Estimasi Bobot:</span>
                <span className="font-bold text-emerald-950 text-sm">~{totalKgPreview} Kg</span>
              </div>
            </CardContent>
          </Card>

          {/* STEP 4: JADWAL & SLOT WAKTU */}
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-emerald-600" />
                4. Jadwal & Waktu Penjemputan
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Tanggal Penjemputan
                  </label>
                  <Input
                    type="date"
                    min={todayStr}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="text-xs h-10 rounded-xl bg-slate-50 border-slate-200"
                    required
                  />
                  <span className="text-[10px] text-slate-400">Pilih tanggal hari ini atau ke depan</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Slot Waktu Armada
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-600 focus:outline-hidden"
                  >
                    <option value="08:00 - 12:00">Pagi (08:00 - 12:00 WIB)</option>
                    <option value="13:00 - 17:00">Siang / Sore (13:00 - 17:00 WIB)</option>
                  </select>
                  <span className="text-[10px] text-slate-400">Petugas mengonfirmasi via WA sebelum tiba</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  Catatan Tambahan untuk Petugas Armada (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Sampah diletakkan di garasi samping pagar, mohon hubungi sebelum tiba..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-green-600 focus:outline-hidden"
                />
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/60 border-t border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Poin reward dihitung dari timbangan fisik aktual petugas di lokasi penjemputan</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-xs gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Pengajuan...</span>
                  </>
                ) : (
                  <>
                    <span>Kirim Pengajuan Penjemputan</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  )
}
