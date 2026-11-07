"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { wasteService } from '@/services/wasteService'
import { DbPickupRequest } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WawiCharacter } from '@/components/mascot/WawiCharacter'
import {
  Coins,
  Scale,
  Truck,
  CalendarPlus,
  ArrowRight,
  Gift,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Leaf,
  Database,
  Loader2,
  QrCode,
  ShieldCheck,
  User,
  CreditCard,
  Copy,
  Check,
} from 'lucide-react'

export default function WargaDashboardPage() {
  const { user, profile } = useAuth()
  const [stats, setStats] = useState({
    pointsBalance: profile?.points_balance ?? 0,
    totalWasteKg: 0,
    activePickupsCount: 0,
    completedPickupsCount: 0,
    isLive: false,
  })
  const [activePickup, setActivePickup] = useState<DbPickupRequest | null>(null)
  const [userAiLogs, setUserAiLogs] = useState<Array<{ id: string; category: string; confidence: number; date: string; engine: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCopiedToken, setIsCopiedToken] = useState(false)
  const [showQrModal, setShowQrModal] = useState(false)

  const customerToken = profile?.customer_qr_token || `WW-NSB-${(profile?.id || 'WRG001').slice(0, 6).toUpperCase()}`

  useEffect(() => {
    let isMounted = true

    async function loadWargaData() {
      setIsLoading(true)
      const activeUserId = user?.id || profile?.id || ''
      try {
        const [statsRes, pickupsRes] = await Promise.all([
          wasteService.getWargaStats(activeUserId),
          wasteService.getWargaPickups(activeUserId),
        ])

        if (isMounted) {
          setStats(statsRes)
          // Cari pickup yang aktif (belum selesai/batal)
          const foundActive = pickupsRes.pickups.find(
            (p) => !['completed', 'cancelled'].includes(p.status)
          )
          setActivePickup(foundActive || null)
        }

        // Ambil riwayat pemilahan AI resmi pengguna dari tabel public.waste_classifications
        if (supabase && activeUserId) {
          try {
            const { data: aiData, error: aiErr } = await supabase
              .from('waste_classifications')
              .select('id, confidence_score, predicted_category_id, created_at, client_device_metadata')
              .eq('user_id', activeUserId)
              .order('created_at', { ascending: false })
              .limit(5)

            if (!aiErr && aiData && aiData.length > 0) {
              const mapped = aiData.map((d: any) => {
                let cat = 'Anorganik'
                if (d.predicted_category_id === 'e7f46595-d8e0-4116-81da-32c767f78068') cat = 'Organik'
                else if (d.predicted_category_id === '5eb4a256-ea8b-494e-84a9-586e717a92c0') cat = 'B3'

                const dObj = new Date(d.created_at)
                const dateStr = isNaN(dObj.getTime())
                  ? 'Hari Ini'
                  : dObj.toLocaleDateString('id-ID', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })

                return {
                  id: d.id,
                  category: cat,
                  confidence: Number(d.confidence_score) || 87.5,
                  date: dateStr,
                  engine: d.client_device_metadata?.model_engine || 'Google LiteRT 1.4.2',
                }
              })
              if (isMounted) {
                setUserAiLogs(mapped)
              }
            }
          } catch (aiEx) {
            console.warn('Gagal memuat log AI warga:', aiEx)
          }
        }
      } catch (err) {
        console.warn('Gagal memuat data dashboard warga:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadWargaData()

    return () => {
      isMounted = false
    }
  }, [user, profile])

  const handleCopyToken = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(customerToken)
      setIsCopiedToken(true)
      setTimeout(() => setIsCopiedToken(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with WAWI Mascot */}
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-green-50/60 p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="shrink-0 p-1 bg-white/90 rounded-2xl border border-emerald-100 shadow-xs">
              <WawiCharacter mood="wave" size={72} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                  Bank Sampah Digital • Portal Nasabah
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                  WAWI Aktif
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                Halo, {profile?.full_name || 'Nasabah WasteWise'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                WAWI siap mendampingi kamu memilah sampah dan mengumpulkan reward sirkular ekonomi hari ini 🌱
              </p>
            </div>
          </div>
          <Link href="/warga/ajukan">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-5 rounded-xl gap-2 shadow-xs shrink-0">
              <CalendarPlus className="h-4 w-4" />
              <span>Ajukan Penjemputan Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Database Connection Status Indicator */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        stats.isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            {stats.isLive
              ? 'Tersinkronisasi langsung dengan buku besar saldo & tiket penjemputan Supabase.'
              : 'Mode Terhubung: Memuat profil terdaftar akun nasabah resmi Anda.'}
          </span>
        </div>
        <Badge variant="outline" className={stats.isLive ? 'border-emerald-300 text-emerald-800 font-bold text-[10px]' : 'border-amber-300 text-amber-800 font-bold text-[10px]'}>
          {stats.isLive ? 'DATABASE LIVE' : 'TERKONEKSI'}
        </Badge>
      </div>

      {/* 3 Metric Cards + Kartu Nasabah Digital Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metric Cards (2 Kolom di Desktop) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Poin Balance */}
            <Card className="border-slate-200/80 bg-gradient-to-br from-amber-50/50 to-white shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Saldo Poin</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <Coins className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {stats.pointsBalance.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs font-semibold text-amber-700 ml-1.5">Poin</span>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-amber-100/60">
                  <span className="text-[11px] text-slate-500">Hasil timbangan fisik</span>
                  <Link href="/warga/reward">
                    <span className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-0.5">
                      Tukar <ArrowRight className="h-3 w-3" />
                    </span>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Total Sampah Disetor */}
            <Card className="border-slate-200/80 bg-gradient-to-br from-emerald-50/40 to-white shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Total Terverifikasi</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <Scale className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {stats.totalWasteKg.toFixed(1)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">Kg</span>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-100/60 text-[11px] text-emerald-700 font-medium">
                  Dari {stats.completedPickupsCount} penjemputan selesai
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Frekuensi Penjemputan */}
            <Card className="border-slate-200/80 bg-gradient-to-br from-sky-50/40 to-white shadow-xs">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">Tiket Penjemputan</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                    <Truck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                    {stats.activePickupsCount + stats.completedPickupsCount}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 ml-1">total tiket</span>
                </div>
                <div className="mt-3 pt-2 border-t border-sky-100/60 text-[11px] text-sky-700 font-medium">
                  {stats.activePickupsCount} tiket aktif berjalan
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/warga/ajukan" className="group">
              <Card className="h-full border-slate-200/80 hover:border-emerald-300 transition-all hover:shadow-xs">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CalendarPlus className="h-4.5 w-4.5 text-green-600" />
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-green-700 transition-colors">
                        Ajukan Penjemputan Sampah
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Pilih alamat penjemputan, input estimasi sampah, dan jadwalkan armada Bank Sampah.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                </CardContent>
              </Card>
            </Link>

            <Link href="/warga/reward" className="group">
              <Card className="h-full border-slate-200/80 hover:border-amber-300 transition-all hover:shadow-xs">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4.5 w-4.5 text-amber-600" />
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-amber-800 transition-colors">
                        Katalog Penukaran Reward
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Tukarkan poin hasil pemilahan dengan voucher sembako, token PLN, atau bibit pohon.
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Kartu Identitas Digital Nasabah + QR Code */}
        <div className="lg:col-span-1">
          <Card className="border-emerald-200 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-emerald-500/10 pointer-events-none" />
            <div className="absolute right-2 top-2 h-20 w-20 rounded-full bg-emerald-500/10 pointer-events-none" />

            <CardHeader className="pb-3 border-b border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold tracking-wider uppercase text-emerald-300">
                    Kartu Nasabah Digital
                  </span>
                </div>
                <Badge variant="outline" className="border-emerald-400/40 bg-emerald-500/20 text-emerald-300 font-semibold text-[10px]">
                  Aktif Terdaftar
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-[10px] uppercase text-slate-400 tracking-wider">Nama Lengkap Nasabah</p>
                <p className="text-sm font-bold text-white mt-0.5 truncate">
                  {profile?.full_name || 'Nasabah Bank Sampah'}
                </p>
                <p className="text-[11px] text-slate-300 truncate">{profile?.email}</p>
              </div>

              {/* QR Code Nasabah Box */}
              <div className="p-3.5 rounded-xl bg-white text-slate-900 flex items-center gap-3 shadow-xs">
                {/* SVG QR Code Icon Clean Display */}
                <div className="h-14 w-14 shrink-0 bg-slate-900 rounded-lg p-1.5 flex items-center justify-center text-emerald-400">
                  <QrCode className="h-10 w-10 text-emerald-400" />
                </div>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Kode Token Nasabah (Publik)
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-900 truncate">
                    {customerToken}
                  </p>
                  <button
                    onClick={handleCopyToken}
                    className="text-[10px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
                  >
                    {isCopiedToken ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-700/60 flex items-center gap-2 text-[11px] text-slate-300 leading-relaxed">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Tunjukkan kode token ini kepada petugas saat armada tiba untuk verifikasi transaksi tanpa mengekspos ID akun internal.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Pickup Request Live Tracker OR Empty State */}
      {activePickup ? (
        <Card className="border-emerald-200 bg-white shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-green-600" />
                  Status Penjemputan Terkini
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Tiket <span className="font-mono font-semibold text-slate-700">{activePickup.request_number}</span> • Jadwal: {activePickup.scheduled_date} ({activePickup.time_slot} WIB)
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-sky-50 text-sky-800 border-sky-200 font-semibold w-fit">
                Status: {activePickup.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Progress Tracker Stepper */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-slate-900">1. Pengajuan</span>
                <span className="text-[10px] text-slate-400">Jadwal tercatat</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                  ['assigned', 'on_the_way', 'arrived', 'verified', 'completed'].includes(activePickup.status)
                    ? 'bg-sky-600 text-white ring-4 ring-sky-100'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Truck className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-sky-800">2. Armada Ditugaskan</span>
                <span className="text-[10px] text-slate-500">
                  {activePickup.assigned_officer_name || 'Alokasi rute'}
                </span>
              </div>

              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                  ['verified', 'completed'].includes(activePickup.status)
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Scale className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">3. Timbang Fisik</span>
                <span className="text-[10px] text-slate-400">Timbangan petugas</span>
              </div>

              <div className="flex flex-col items-center text-center space-y-1.5">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shadow-xs ${
                  activePickup.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}>
                  <Coins className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-600">4. Poin Masuk</span>
                <span className="text-[10px] text-slate-400">Kredit otomatis</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                {activePickup.address && (
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <MapPin className="h-3.5 w-3.5 text-red-500 shrink-0" />
                    <span>Titik Jemput: {activePickup.address.full_address}</span>
                  </div>
                )}
                <div className="text-[11px] text-slate-500">
                  Total Estimasi: <strong>~{activePickup.total_estimated_kg} Kg</strong>
                  {activePickup.notes && ` • "${activePickup.notes}"`}
                </div>
              </div>
              <Link href="/warga/penjemputan">
                <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-slate-300">
                  Lihat Detail Tiket
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed border-emerald-300/80 bg-gradient-to-b from-white to-emerald-50/20 shadow-xs">
          <CardContent className="p-8 text-center space-y-3">
            <div className="flex justify-center mx-auto">
              <WawiCharacter mood="thinking" size={85} />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Penjemputan Aktif</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Kata WAWI: Belum ada jadwal penjemputan sampahmu saat ini. Pilah sampah rumah tanggamu dan jadwalkan armada Bank Sampah yuk! 🌱
              </p>
            </div>
            <div className="pt-2">
              <Link href="/warga/ajukan">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-4 rounded-xl gap-2 font-semibold shadow-xs">
                  <CalendarPlus className="h-4 w-4" />
                  <span>Jadwalkan Penjemputan Pertama</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Riwayat Klasifikasi AI LiteRT */}
      <Card className="border-slate-200/80 bg-white shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                Riwayat Klasifikasi AI (Google LiteRT 1.4.2)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Deteksi jenis sampah otomatis via Kamera/Galeri Aplikasi Android WasteWise yang tersinkronisasi ke Cloud.
              </CardDescription>
            </div>
            <Link href="/warga/klasifikasi">
              <Button variant="outline" size="sm" className="text-xs h-8 rounded-lg border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Buka AI Scanner Web</span>
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {userAiLogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAiLogs.map((log) => {
                const isOrg = log.category.toLowerCase().includes('organik') && !log.category.toLowerCase().includes('an')
                const isAnorg = log.category.toLowerCase().includes('anorganik')
                const isB3 = log.category.toLowerCase().includes('b3')

                const badgeBg = isOrg
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : isAnorg
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : isB3
                  ? 'bg-red-50 text-red-800 border-red-200'
                  : 'bg-slate-50 text-slate-800 border-slate-200'

                return (
                  <div key={log.id} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={`font-bold text-xs uppercase px-2.5 py-0.5 ${badgeBg}`}>
                        {log.category}
                      </Badge>
                      <span className="text-xs font-bold text-slate-700">
                        {log.confidence.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>{log.date}</span>
                      <span className="font-mono text-[10px] text-emerald-700 font-semibold bg-emerald-100/50 px-1.5 py-0.5 rounded">
                        {log.engine}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mx-auto">
                <Sparkles className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Belum Ada Riwayat Klasifikasi AI</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Gunakan aplikasi Android WasteWise atau AI Scanner Web untuk memindai sampah Anda. Model LiteRT 1.4.2 akan mendeteksi kategori Organik, Anorganik, atau B3 secara real-time.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
