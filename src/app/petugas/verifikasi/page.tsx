"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { wasteService, VerificationItemPayload } from '@/services/wasteService'
import { DbWasteCategory } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Scale,
  Camera,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck2,
  Coins,
  QrCode,
  ShieldCheck,
  MapPin,
  User,
  ArrowRight,
  Sparkles,
  Database,
  Loader2,
} from 'lucide-react'

export default function PetugasVerifikasiPage() {
  const { user, profile } = useAuth()
  const [categories, setCategories] = useState<DbWasteCategory[]>([])
  const [assignedPickups, setAssignedPickups] = useState<Array<{ id: string; pickup_id: string; request_number: string; user_name: string; address: string }>>([])

  const [selectedPickupId, setSelectedPickupId] = useState('')
  const [organikWeight, setOrganikWeight] = useState('0')
  const [anorganikWeight, setAnorganikWeight] = useState('4.85')
  const [b3Weight, setB3Weight] = useState('0')
  const [scalePhotoFile, setScalePhotoFile] = useState<File | null>(null)
  const [scalePhotoPreview, setScalePhotoPreview] = useState<string | null>(null)
  const [officerNotes, setOfficerNotes] = useState('Sampah anorganik bersih, kardus dan botol rapi.')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [wasSubmittedLive, setWasSubmittedLive] = useState(false)

  // Inisialisasi master kategori & penugasan petugas
  useEffect(() => {
    let isMounted = true

    async function loadData() {
      const activeOfficerId = user?.id || profile?.id || 'demo-petugas-01'
      const [catRes, taskRes] = await Promise.all([
        wasteService.getWasteCategories(),
        wasteService.getPetugasTasks(activeOfficerId),
      ])

      if (isMounted) {
        setCategories(catRes.categories)
        if (taskRes.tasks.length > 0) {
          setAssignedPickups(taskRes.tasks)
          setSelectedPickupId(taskRes.tasks[0].pickup_id || taskRes.tasks[0].id)
        } else {
          setAssignedPickups([
            {
              id: 'task-mock-01',
              pickup_id: 'PKP-2026-001',
              request_number: 'REQ-KDS-001',
              user_name: 'Budi Santoso',
              address: 'Jl. Merdeka No. 45, Demaan, Kota Kudus',
            },
          ])
          setSelectedPickupId('PKP-2026-001')
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  // Hitung total berat aktual
  const numOrg = parseFloat(organikWeight) || 0
  const numAnorg = parseFloat(anorganikWeight) || 0
  const numB3 = parseFloat(b3Weight) || 0
  const totalWeight = (numOrg + numAnorg + numB3).toFixed(2)

  // Estimasi Poin (Organik 100 poin/kg, Anorganik 50 poin/kg, B3 0 poin karena karantina)
  const estimatedPoints = Math.floor(numOrg * 100 + numAnorg * 50)

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Ukuran foto terlalu besar. Maksimal 10 MB.')
        return
      }
      setScalePhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setScalePhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    if (parseFloat(totalWeight) <= 0) {
      setSubmitError('Total berat sampah harus lebih besar dari 0 Kg.')
      return
    }

    setIsSubmitting(true)

    try {
      const activeOfficerId = user?.id || profile?.id || 'demo-petugas-01'

      // Susun rincian item berdasarkan kategori aktif
      const orgCat = categories.find((c) => c.name === 'Organik')
      const anorgCat = categories.find((c) => c.name === 'Anorganik')
      const b3Cat = categories.find((c) => c.name === 'B3')

      const verificationItems: VerificationItemPayload[] = []
      if (numOrg > 0) {
        verificationItems.push({
          categoryId: orgCat?.id || 'cat-org-01',
          actualWeightKg: numOrg,
          pointsAwarded: Math.floor(numOrg * 100),
          economicValueIdr: numOrg * 500,
        })
      }
      if (numAnorg > 0) {
        verificationItems.push({
          categoryId: anorgCat?.id || 'cat-anorg-02',
          actualWeightKg: numAnorg,
          pointsAwarded: Math.floor(numAnorg * 50),
          economicValueIdr: numAnorg * 3000,
        })
      }
      if (numB3 > 0) {
        verificationItems.push({
          categoryId: b3Cat?.id || 'cat-b3-03',
          actualWeightKg: numB3,
          pointsAwarded: 0,
          economicValueIdr: 0,
        })
      }

      const res = await wasteService.submitPickupVerification({
        pickupId: selectedPickupId,
        officerId: activeOfficerId,
        totalScaleKg: parseFloat(totalWeight),
        scalePhotoFile,
        officerNotes: officerNotes.trim(),
        items: verificationItems,
      })

      if (!res.success) {
        setSubmitError(res.error || 'Gagal menyimpan verifikasi penimbangan.')
        setIsSubmitting(false)
        return
      }

      setWasSubmittedLive(res.isLive)
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
    setOrganikWeight('0')
    setAnorganikWeight('0')
    setB3Weight('0')
    setScalePhotoFile(null)
    setScalePhotoPreview(null)
    setOfficerNotes('')
    setSubmitError(null)
  }

  const currentSelectedTask = assignedPickups.find(
    (p) => p.pickup_id === selectedPickupId || p.id === selectedPickupId
  )

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="text-xs font-semibold text-sky-800 uppercase tracking-wider">
            Petugas Lapangan • Verifikasi Fisik
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
          Formulir Verifikasi Timbangan Fisik
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Catat berat riil hasil penimbangan di lokasi warga dan upload foto skala timbangan digital untuk verifikasi poin otomatis.
        </p>
      </div>

      {isSubmitted ? (
        <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white shadow-sm p-6 sm:p-8 text-center animate-in zoom-in-95 duration-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            Verifikasi Timbangan Berhasil Disimpan!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            Data penimbangan resmi telah tercatat. Status tiket penjemputan <span className="font-mono font-semibold">{selectedPickupId}</span> kini berubah menjadi <span className="text-emerald-700 font-semibold">Completed</span>.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border border-emerald-200 bg-emerald-100/70 text-emerald-800">
            <Database className="h-3.5 w-3.5" />
            <span>
              {wasSubmittedLive
                ? 'Data tersimpan secara resmi di sistem dan saldo poin warga otomatis terbit'
                : 'Mode Terhubung: Verifikasi timbangan siap dikirim ke sistem operasional'}
            </span>
          </div>

          <div className="my-6 max-w-sm mx-auto p-4 bg-white rounded-xl border border-slate-200 text-left text-xs space-y-2 shadow-xs">
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Total Berat Terverifikasi:</span>
              <span className="font-bold text-slate-900">{totalWeight} Kg</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Rincian Organik:</span>
              <span className="font-medium text-slate-800">{numOrg} Kg ({Math.floor(numOrg * 100)} Poin)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Rincian Anorganik:</span>
              <span className="font-medium text-slate-800">{numAnorg} Kg ({Math.floor(numAnorg * 50)} Poin)</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2">
              <span className="text-slate-500">Limbah B3:</span>
              <span className="font-medium text-slate-800">{numB3} Kg (Karantina)</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="font-bold text-slate-700">Total Poin Warga:</span>
              <span className="font-bold text-emerald-700">+{estimatedPoints} Poin</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={handleReset}
              className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold h-10 px-5 rounded-xl shadow-xs"
            >
              Input Verifikasi Tiket Lain
            </Button>
          </div>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <Card className="border-slate-200/80 shadow-xs">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="h-4.5 w-4.5 text-sky-600" />
                Data Penimbangan Lapangan & Validasi Poin
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Pilih tiket penjemputan warga yang sedang Anda tangani di lapangan untuk memasukkan hasil timbangan fisik.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {submitError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 flex items-start gap-2.5">
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Pickup Target Selector */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Pilih Tiket Penjemputan Ditugaskan
                  </label>
                  <select
                    value={selectedPickupId}
                    onChange={(e) => setSelectedPickupId(e.target.value)}
                    className="w-full h-10 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-600 focus:outline-hidden font-mono"
                  >
                    {assignedPickups.map((p) => (
                      <option key={p.pickup_id || p.id} value={p.pickup_id || p.id}>
                        {p.request_number || p.pickup_id} • {p.user_name} ({p.address.slice(0, 30)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    <span>Warga Pemilik: <strong className="text-slate-800">{currentSelectedTask?.user_name || 'Warga WasteWise'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-red-500" />
                    <span className="truncate">{currentSelectedTask?.address || 'Kudus'}</span>
                  </div>
                </div>
              </div>

              {/* Weight Inputs Per Category */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Input Bobot Timbangan Fisik Aktual (Kilogram)
                  </h3>
                  <span className="text-[11px] text-slate-500">Gunakan angka desimal dengan titik (misal: 4.85)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Organik */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900">Organik</span>
                      <Badge variant="organik">100 Poin/Kg</Badge>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        value={organikWeight}
                        onChange={(e) => setOrganikWeight(e.target.value)}
                        className="text-right pr-9 font-bold text-slate-900 bg-white border-emerald-200 rounded-xl h-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                        Kg
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Sisa makanan, dedaunan</span>
                  </div>

                  {/* Anorganik */}
                  <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-sky-900">Anorganik</span>
                      <Badge variant="anorganik">50 Poin/Kg</Badge>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        value={anorganikWeight}
                        onChange={(e) => setAnorganikWeight(e.target.value)}
                        className="text-right pr-9 font-bold text-slate-900 bg-white border-sky-200 rounded-xl h-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                        Kg
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Plastik, kardus, botol, kaleng</span>
                  </div>

                  {/* B3 */}
                  <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-red-900">Limbah B3</span>
                      <Badge variant="b3">0 Poin (Karantina)</Badge>
                    </div>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.05"
                        min="0"
                        value={b3Weight}
                        onChange={(e) => setB3Weight(e.target.value)}
                        className="text-right pr-9 font-bold text-slate-900 bg-white border-red-200 rounded-xl h-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500">
                        Kg
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 block">Baterai, lampu TL (Tanpa Poin)</span>
                  </div>
                </div>
              </div>

              {/* Total Summary & Estimated Points */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-slate-600" />
                  <div>
                    <span className="text-xs text-slate-500 block">Akumulasi Bobot Timbangan Fisik:</span>
                    <span className="text-lg font-extrabold text-slate-900">{totalWeight} Kg</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-emerald-100/60 px-3.5 py-2 rounded-xl border border-emerald-200">
                  <Coins className="h-4.5 w-4.5 text-emerald-700" />
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Poin Yang Diterima Warga:</span>
                    <span className="text-sm font-bold text-emerald-950">+{estimatedPoints} Poin</span>
                  </div>
                </div>
              </div>

              {/* Scale Display Photo Upload */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Foto Bukti Layar Timbangan Digital (Wajib)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    Disimpan ke Supabase Storage bucket <code className="font-mono text-emerald-700">pickup-evidence</code>
                  </span>
                </div>

                {scalePhotoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-sky-300 max-w-xs">
                    <img src={scalePhotoPreview} alt="Foto Skala Timbangan" className="w-full h-44 object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setScalePhotoFile(null)
                        setScalePhotoPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-lg hover:bg-black/80 transition-colors"
                    >
                      Ganti Foto
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-200 hover:border-sky-500 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/20 transition-all">
                    <Camera className="h-8 w-8 text-slate-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-700">Ambil / Unggah Foto Layar Timbangan</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, WebP (Maksimal 10 MB)</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>

              {/* Officer Notes */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-700 block">
                  Catatan Lapangan & Kondisi Sampah
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="Kondisi pemilahan sampah warga, kerapihan, dll..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-sky-600 focus:outline-hidden"
                />
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50/60 border-t border-slate-100 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Poin reward langsung masuk ke ledger warga setelah verifikasi disimpan</span>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs h-10 px-6 rounded-xl shadow-xs gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Menyimpan Verifikasi...</span>
                  </>
                ) : (
                  <>
                    <span>Simpan Hasil Penimbangan Resmi</span>
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
