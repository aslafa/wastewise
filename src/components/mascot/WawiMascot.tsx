"use client"

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { WawiCharacter, WawiMood } from './WawiCharacter'
import {
  X,
  Sparkles,
  ChevronRight,
  Lightbulb,
  BookOpen,
  ArrowRight,
  Smile,
  RefreshCw,
  Heart,
  CalendarPlus,
  Scale,
  Award,
  Truck,
  Layers,
  Database,
  HelpCircle,
  Minimize2,
  Maximize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Event helper to trigger Wawi from anywhere in the app
export function triggerWawi(action: {
  mood?: WawiMood
  message?: string
  durationMs?: number
}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wawi:trigger', { detail: action }))
  }
}

interface RoleContent {
  greeting: string
  subGreeting: string
  tips: string[]
  guides: Array<{ title: string; desc: string; href: string }>
  quickActions: Array<{ label: string; href: string; icon: string }>
}

const ROLE_CONTENT: Record<string, RoleContent> = {
  warga: {
    greeting: 'Halo! Aku Wawi 🌱 Yuk, pilah sampahmu dan kumpulkan poin hari ini!',
    subGreeting: 'Sahabat Cerdas Pilah Sampah & Tabungan Hijau',
    tips: [
      'Pisahkan sampah organik sisa makanan dari plastik dan kardus agar bernilai 100 Poin/Kg.',
      'Bilas sisa cairan pada botol plastik dan pipihkan sebelum diserahkan ke armada.',
      'Ajukan penjemputan sebelum jam 14.00 WIB untuk jadwal penjemputan di hari yang sama.',
      'Tukarkan akumulasi poin timbanganmu menjadi sembako atau voucher di menu Reward.',
    ],
    guides: [
      { title: 'Cara Pilah 3 Kategori', desc: 'Pisahkan Organik, Anorganik, dan Karantina B3.', href: '/#jenis-sampah' },
      { title: 'Ajukan Jemput Sampah', desc: 'Pilih jadwal dan isi perkiraan berat.', href: '/warga/ajukan' },
      { title: 'Cek Poin & Hadiah', desc: 'Pantau saldo dan tukar sembako.', href: '/warga/reward' },
    ],
    quickActions: [
      { label: 'Ajukan Jemput', href: '/warga/ajukan', icon: 'truck' },
      { label: 'Poin & Reward', href: '/warga/reward', icon: 'gift' },
      { label: 'Riwayat Sampah', href: '/warga/riwayat', icon: 'scale' },
    ],
  },
  petugas: {
    greeting: 'Hai, petugas! Pastikan setiap penimbangan tercatat dengan benar, ya!',
    subGreeting: 'Pahlawan Armada Hijau Lapangan WasteWise',
    tips: [
      'Gunakan timbangan digital yang telah terkalibrasi dan unggah foto penimbangan yang jelas.',
      'Pastikan klasifikasi Organik = 100 Poin/Kg dan Anorganik = 50 Poin/Kg terhitung presisi.',
      'Segera tandai tiket tugas sebagai selesai begitu proses verifikasi di rumah warga rampung.',
      'Karantina limbah B3 dan simpan di wadah terisolasi demi keselamatan lingkungan.',
    ],
    guides: [
      { title: 'Daftar Tugas Harian', desc: 'Lihat rute dan alamat pemohon penjemputan.', href: '/petugas/tugas' },
      { title: 'Verifikasi Timbangan', desc: 'Input berat riil dan foto skala timbangan.', href: '/petugas/verifikasi' },
      { title: 'Riwayat Kerja', desc: 'Rekapitulasi total timbulan sampah terjemput.', href: '/petugas/riwayat' },
    ],
    quickActions: [
      { label: 'Tugas Hari Ini', href: '/petugas/tugas', icon: 'truck' },
      { label: 'Input Timbangan', href: '/petugas/verifikasi', icon: 'scale' },
      { label: 'Riwayat Kerja', href: '/petugas/riwayat', icon: 'layers' },
    ],
  },
  admin: {
    greeting: 'Halo Admin! Yuk, pantau aktivitas pengelolaan sampah hari ini!',
    subGreeting: 'Pusat Kendali Operasional Terintegrasi',
    tips: [
      'Alokasikan petugas lapangan terdekat untuk tiket penjemputan berstatus Menunggu.',
      'Pantau grafik akumulasi sampah harian dan estimasi reduksi jejak karbon desa.',
      'Periksa hasil klasifikasi AI visual on-device di menu Monitoring AI secara berkala.',
    ],
    guides: [
      { title: 'Monitoring Penjemputan', desc: 'Pantau status tiket dari penugasan hingga selesai.', href: '/admin/penjemputan' },
      { title: 'Inventaris Sampah', desc: 'Kelola data timbulan organik dan anorganik.', href: '/admin/data-sampah' },
      { title: 'Laporan Statistik', desc: 'Unduh laporan performa operasional berkala.', href: '/admin/laporan' },
    ],
    quickActions: [
      { label: 'Monitoring Tiket', href: '/admin/penjemputan', icon: 'truck' },
      { label: 'Data Sampah', href: '/admin/data-sampah', icon: 'database' },
      { label: 'Laporan', href: '/admin/laporan', icon: 'file' },
    ],
  },
  mitra: {
    greeting: 'Hai Mitra! Siap mengolah material menjadi produk yang lebih bernilai?',
    subGreeting: 'Mitra Pengolah Hilirisasi Ekonomi Sirkular',
    tips: [
      'Periksa tanda terima material masuk dari bank sampah untuk memperbarui rantai pasok.',
      'Kelompokkan batch pengolahan biokonversi larva maggot BSF dan pupuk organik kasgot.',
      'Catat hasil produksi olahan bernilai tambah untuk transparansi neraca sirkular.',
    ],
    guides: [
      { title: 'Penerimaan Material', desc: 'Verifikasi pasokan bahan baku dari armada.', href: '/mitra/receipts' },
      { title: 'Batch Pengolahan', desc: 'Pantau siklus 14–21 hari biokonversi maggot.', href: '/mitra/batches' },
      { title: 'Catatan Output', desc: 'Dokumentasikan produk maggot, sabun, & pupuk.', href: '/mitra/outputs' },
    ],
    quickActions: [
      { label: 'Material Masuk', href: '/mitra/receipts', icon: 'layers' },
      { label: 'Batch Bioproses', href: '/mitra/batches', icon: 'refresh' },
      { label: 'Hasil Olahan', href: '/mitra/outputs', icon: 'sparkles' },
    ],
  },
  super_admin: {
    greeting: 'Halo Super Admin! Sistem WasteWise beroperasi normal dan seluruh RLS aktif terlindungi.',
    subGreeting: 'Pusat Keamanan & Tata Kelola Platform',
    tips: [
      'Seluruh mutasi poin reward terenkripsi dan diaudit secara otomatis di basis data.',
      'Gunakan menu Audit Logs untuk menelusuri riwayat login dan perubahan status sistem.',
    ],
    guides: [
      { title: 'Manajemen Admin', desc: 'Kelola akun operasional dan peran pengguna.', href: '/super-admin/admins' },
      { title: 'Audit Logs', desc: 'Log aktivitas transaksi dan kepatuhan sistem.', href: '/super-admin/audit-logs' },
    ],
    quickActions: [
      { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: 'shield' },
      { label: 'Kelola Admin', href: '/super-admin/admins', icon: 'user' },
    ],
  },
}

export function WawiMascot() {
  const { isAuthenticated, role } = useAuth()
  const pathname = usePathname()

  const [isOpen, setIsOpen] = useState(false)
  const [isBubbleVisible, setIsBubbleVisible] = useState(true)
  const [mood, setMood] = useState<WawiMood>('idle')
  const [customMessage, setCustomMessage] = useState<string | null>(null)
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)

  // Tampilkan hanya jika login di dashboard ATAU di halaman preview khusus maskot
  const isMascotPreview = pathname === '/mascot-preview'
  const isDashboardRoute =
    pathname?.startsWith('/warga') ||
    pathname?.startsWith('/petugas') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/mitra') ||
    pathname?.startsWith('/super-admin')

  const shouldRender = isMascotPreview || (isAuthenticated && isDashboardRoute)

  // Konten berdasarkan role aktif
  const activeRoleKey = role && ROLE_CONTENT[role] ? role : 'warga'
  const content = ROLE_CONTENT[activeRoleKey]

  // Otomatis wave saat pertama kali dimuat
  useEffect(() => {
    if (!shouldRender) return

    setMood('wave')
    const timer = setTimeout(() => {
      setMood('idle')
    }, 2800)

    // Sembunyikan bubble otomatis setelah 8 detik jika belum dibuka
    const bubbleTimer = setTimeout(() => {
      setIsBubbleVisible(false)
    }, 8500)

    return () => {
      clearTimeout(timer)
      clearTimeout(bubbleTimer)
    }
  }, [shouldRender])

  // Custom Event Listener untuk merespons aktivitas aplikasi secara real-time
  useEffect(() => {
    function handleWawiTrigger(e: Event) {
      const detail = (e as CustomEvent).detail
      if (!detail) return

      if (detail.mood) setMood(detail.mood)
      if (detail.message) {
        setCustomMessage(detail.message)
        setIsBubbleVisible(true)
      }

      const duration = detail.durationMs || 4500
      setTimeout(() => {
        setMood('idle')
        setCustomMessage(null)
      }, duration)
    }

    window.addEventListener('wawi:trigger', handleWawiTrigger)
    return () => window.removeEventListener('wawi:trigger', handleWawiTrigger)
  }, [])

  const handleNextTip = useCallback(() => {
    setMood('thinking')
    setCurrentTipIndex((prev) => (prev + 1) % content.tips.length)
    setTimeout(() => setMood('idle'), 1500)
  }, [content.tips.length])

  const handleOpenPanel = () => {
    setMood('bounce')
    setIsOpen(true)
    setIsBubbleVisible(false)
    setTimeout(() => setMood('idle'), 800)
  }

  const handleClosePanel = () => {
    setIsOpen(false)
    setMood('idle')
  }

  if (!shouldRender) return null

  return (
    <>
      {/* Floating Widget Maskot di Pojok Kanan Bawah */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none">
        {/* Floating Greeting Speech Bubble (Tampil saat hover atau pesan baru) */}
        {isBubbleVisible && !isOpen && !isMinimized && (
          <div className="pointer-events-auto mb-2 max-w-[240px] sm:max-w-[280px] bg-white rounded-2xl p-3 shadow-xl border border-emerald-200 text-xs text-slate-800 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group">
            <button
              onClick={() => setIsBubbleVisible(false)}
              className="absolute -top-1.5 -left-1.5 h-5 w-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Tutup pesan"
            >
              <X className="h-3 w-3" />
            </button>
            <p className="font-semibold text-emerald-950 leading-snug">
              {customMessage || content.greeting}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#006B45] font-bold">
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[#009B63] animate-pulse" />
                Wawi Online
              </span>
              <button
                onClick={handleOpenPanel}
                className="hover:underline flex items-center gap-0.5"
              >
                Buka Tips →
              </button>
            </div>
            {/* Speech bubble tail pointer */}
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          </div>
        )}

        {/* Maskot Avatar & Toggle Button */}
        <div className="pointer-events-auto flex items-end gap-2">
          {/* Tombol Mini Minimize/Expand jika user butuh ruang layar penuh */}
          {isMinimized ? (
            <button
              onClick={() => setIsMinimized(false)}
              className="h-10 w-10 rounded-full bg-white border border-emerald-200 shadow-md hover:bg-emerald-50 text-[#006B45] flex items-center justify-center transition-transform hover:scale-110"
              title="Tampilkan Wawi"
            >
              <Smile className="h-5 w-5" />
            </button>
          ) : (
            <div className="relative group flex items-end">
              {/* Tombol Minimize Kecil */}
              <button
                onClick={() => setIsMinimized(true)}
                className="absolute -top-1 -left-1 h-5 w-5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs z-10"
                title="Sembunyikan Maskot Sementara"
              >
                <Minimize2 className="h-2.5 w-2.5" />
              </button>

              {/* WAWI Mascot Avatar SVG Animatable */}
              <div
                onClick={isOpen ? handleClosePanel : handleOpenPanel}
                onMouseEnter={() => {
                  if (mood === 'idle') setMood('wave')
                  setIsBubbleVisible(true)
                }}
                onMouseLeave={() => {
                  if (mood === 'wave') setMood('idle')
                }}
                className="cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
              >
                <WawiCharacter
                  mood={mood}
                  size={120}
                  className="sm:w-[130px] sm:h-[130px] w-[100px] h-[100px]"
                />
              </div>

              {/* Quick Click Pill / Badge */}
              <button
                onClick={isOpen ? handleClosePanel : handleOpenPanel}
                className="hidden sm:flex absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#006B45] hover:bg-[#004D31] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-md items-center gap-1 border border-emerald-200"
              >
                <Sparkles className="h-2.5 w-2.5 text-[#FDE047]" />
                <span>WAWI</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Wawi Assistant Panel (Popup Modal/Drawer) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-end sm:p-6 bg-slate-900/30 backdrop-blur-2xs animate-in fade-in duration-200">
          <div
            className="w-full sm:w-[380px] max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl border border-emerald-100 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 duration-300 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="bg-gradient-to-r from-[#006B45] via-[#009B63] to-[#16A765] p-5 text-white relative">
              <button
                onClick={handleClosePanel}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
                aria-label="Tutup panel"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-white/20 p-1 flex items-center justify-center backdrop-blur-xs border border-white/30">
                  <WawiCharacter mood={mood} size={50} showBadge={false} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-black text-base text-white">WAWI Buddy</h3>
                    <Badge className="bg-[#DDF7EA] text-[#006B45] hover:bg-[#DDF7EA] border-0 text-[10px] font-bold px-1.5 py-0">
                      Asisten Pintar
                    </Badge>
                  </div>
                  <p className="text-xs text-emerald-100 font-medium">
                    {content.subGreeting}
                  </p>
                </div>
              </div>
            </div>

            {/* Panel Body Scrollable */}
            <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh] text-xs">
              {/* Contextual Sapaan Card */}
              <div className="p-3.5 rounded-2xl bg-[#DDF7EA]/60 border border-emerald-200 text-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[#006B45] font-bold text-[11px]">
                  <Smile className="h-3.5 w-3.5" />
                  <span>Pesan Hari Ini:</span>
                </div>
                <p className="leading-relaxed font-medium">
                  {content.greeting}
                </p>
              </div>

              {/* Dynamic Tips Pemilahan Sampah */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
                    Tips Pilah Sampah
                  </span>
                  <button
                    onClick={handleNextTip}
                    className="text-[11px] text-[#006B45] font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Tips Lain</span>
                    <RefreshCw className="h-3 w-3" />
                  </button>
                </div>
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-slate-700 leading-relaxed min-h-[58px] flex items-center">
                  <p>{content.tips[currentTipIndex]}</p>
                </div>
              </div>

              {/* Quick Feature Guides */}
              <div className="space-y-2">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-[#0284C7]" />
                  Panduan Fitur Terkait
                </span>
                <div className="space-y-1.5">
                  {content.guides.map((g, idx) => (
                    <Link
                      key={idx}
                      href={g.href}
                      onClick={handleClosePanel}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-300 bg-white hover:bg-[#F3FAF6] flex items-center justify-between transition-all group"
                    >
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-[#006B45]">
                          {g.title}
                        </h4>
                        <p className="text-[10px] text-slate-500">{g.desc}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#006B45] group-hover:translate-x-0.5 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mood Switcher Simulator (Untuk Menampilkan Ekspresi Wawi) */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-600 uppercase tracking-wider text-[10px] block">
                  Uji Animasi & Ekspresi Wawi:
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => setMood('idle')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      mood === 'idle'
                        ? 'bg-[#006B45] text-white border-[#006B45]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Santai
                  </button>
                  <button
                    onClick={() => setMood('wave')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      mood === 'wave'
                        ? 'bg-[#006B45] text-white border-[#006B45]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Menyapa
                  </button>
                  <button
                    onClick={() => setMood('happy')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      mood === 'happy'
                        ? 'bg-[#006B45] text-white border-[#006B45]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Senang
                  </button>
                  <button
                    onClick={() => setMood('thinking')}
                    className={`py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      mood === 'thinking'
                        ? 'bg-[#006B45] text-white border-[#006B45]'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Berpikir
                  </button>
                </div>
              </div>
            </div>

            {/* Panel Footer Aksi Cepat */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <span className="text-[10px] text-slate-500 font-medium">
                WasteWise Buddy v2.4
              </span>
              <Button
                onClick={handleClosePanel}
                className="bg-[#006B45] hover:bg-[#004D31] text-white text-xs font-bold h-8 px-4 rounded-xl"
              >
                Tutup Asisten
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

