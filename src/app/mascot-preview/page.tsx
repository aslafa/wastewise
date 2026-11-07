"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { WawiCharacter, WawiMood } from '@/components/mascot/WawiCharacter'
import { triggerWawi } from '@/components/mascot/WawiMascot'
import {
  Sparkles,
  ArrowLeft,
  Smile,
  Heart,
  Lightbulb,
  CheckCircle2,
  Truck,
  Scale,
  Award,
  RefreshCw,
  Layers,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export default function MascotPreviewPage() {
  const [activeMood, setActiveMood] = useState<WawiMood>('idle')
  const [selectedRole, setSelectedRole] = useState<'warga' | 'petugas' | 'admin' | 'mitra' | 'super_admin'>('warga')
  const [lastActivityEvent, setLastActivityEvent] = useState<string | null>(null)

  const roleDialogs = {
    warga: {
      title: 'Portal Warga (Nasabah)',
      message: 'Halo! Aku Wawi 🌱 Yuk, pilah sampahmu dan kumpulkan poin hari ini!',
      sub: 'Wawi mendampingi warga memilah 3 kategori dan mengingatkan jadwal penjemputan sampah.',
      color: 'border-emerald-300 bg-[#DDF7EA]/60 text-[#006B45]',
    },
    petugas: {
      title: 'Portal Petugas Lapangan',
      message: 'Hai, petugas! Pastikan setiap penimbangan tercatat dengan benar, ya!',
      sub: 'Wawi membantu petugas memastikan foto timbangan jelas dan kategori diinput presisi.',
      color: 'border-sky-300 bg-sky-50 text-[#0284C7]',
    },
    admin: {
      title: 'Portal Admin Operasional',
      message: 'Halo Admin! Yuk, pantau aktivitas pengelolaan sampah hari ini!',
      sub: 'Wawi merangkum tiket penjemputan menunggu dan kesiapan armada logistik desa.',
      color: 'border-amber-300 bg-amber-50 text-[#D97706]',
    },
    mitra: {
      title: 'Portal Mitra Pengolah',
      message: 'Hai Mitra! Siap mengolah material menjadi produk yang lebih bernilai?',
      sub: 'Wawi mencatat tanda terima pasokan bahan baku dan siklus 14–21 hari biokonversi BSF.',
      color: 'border-teal-300 bg-teal-50 text-[#009B63]',
    },
    super_admin: {
      title: 'Portal Super Admin',
      message: 'Halo Super Admin! Sistem WasteWise beroperasi normal dan seluruh RLS aktif terlindungi.',
      sub: 'Wawi memantau audit trails, keamanan multi-role, dan integritas transaksi poin.',
      color: 'border-indigo-300 bg-indigo-50 text-[#4F46E5]',
    },
  }

  // Trigger Live Event Simulator
  const handleSimulateActivity = (type: 'pickup' | 'weigh' | 'points' | 'error') => {
    switch (type) {
      case 'pickup':
        setLastActivityEvent('Pengajuan Penjemputan Berhasil')
        triggerWawi({
          mood: 'happy',
          message: 'Hore! Pengajuan penjemputan sampahmu berhasil dikirim 🚛 Wawi bangga padamu!',
          durationMs: 5000,
        })
        break
      case 'weigh':
        setLastActivityEvent('Penimbangan Lapangan Berhasil')
        triggerWawi({
          mood: 'happy',
          message: 'Penimbangan fisik terverifikasi! Berat aktual tercatat transparan di sistem ⚖️',
          durationMs: 5000,
        })
        break
      case 'points':
        setLastActivityEvent('Poin Reward Ditambahkan')
        triggerWawi({
          mood: 'happy',
          message: 'Selamat! +100 Poin Organik berhasil masuk ke akun tabungan sampahmu 🌟',
          durationMs: 5000,
        })
        break
      case 'error':
        setLastActivityEvent('Terjadi Kendala / Error')
        triggerWawi({
          mood: 'thinking',
          message: 'Ups! Terjadi kendala koneksi. Coba periksa kembali jaringan internetmu ya 🤔',
          durationMs: 5000,
        })
        break
    }
  }

  return (
    <div className="min-h-screen bg-[#F3FAF6] text-slate-800 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="outline" className="border-emerald-200 text-[#006B45] hover:bg-[#DDF7EA] gap-2 rounded-xl text-xs font-bold">
              <ArrowLeft className="h-4 w-4" />
              <span>Kembali ke Beranda</span>
            </Button>
          </Link>
          <Badge className="bg-[#006B45] text-white border-0 text-xs px-3 py-1 font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#FDE047]" />
            <span>WasteWise Mascot Studio</span>
          </Badge>
        </div>

        {/* Hero Header Maskot WAWI */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#DDF7EA] to-white rounded-full blur-3xl pointer-events-none -z-0" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DDF7EA] text-[#006B45] text-xs font-extrabold border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-[#009B63] animate-pulse" />
                <span>Maskot Resmi WasteWise</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-[#142B36] tracking-tight">
                Kenalkan, <span className="bg-gradient-to-r from-[#006B45] via-[#009B63] to-[#16A765] bg-clip-text text-transparent">WAWI</span>!
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
                <strong>WAWI (WasteWise Buddy)</strong> adalah karakter asisten cerdas yang ramah, lincah, dan penuh semangat. Terinspirasi dari tunas daun hijau muda, emblem daur ulang 3-panah, dan tetesan embun segar untuk memotivasi masyarakat mengelola sampah bernilai ekonomi sirkular.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="border-emerald-300 text-[#006B45] bg-[#DDF7EA]/60 text-xs py-1">
                  🌱 Tunas Daun Kembar
                </Badge>
                <Badge variant="outline" className="border-emerald-300 text-[#006B45] bg-[#DDF7EA]/60 text-xs py-1">
                  ♻️ Emblem Daur Ulang Dada
                </Badge>
                <Badge variant="outline" className="border-emerald-300 text-[#006B45] bg-[#DDF7EA]/60 text-xs py-1">
                  👀 Mata Besar Ekspresif & Berkedip
                </Badge>
                <Badge variant="outline" className="border-emerald-300 text-[#006B45] bg-[#DDF7EA]/60 text-xs py-1">
                  ✨ Vektor Ringan Beranimasi CSS
                </Badge>
              </div>
            </div>

            {/* Large Interactive Preview Centerpiece */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#F3FAF6] to-white rounded-3xl border border-emerald-200 shadow-inner">
              <WawiCharacter mood={activeMood} size={185} />
              <div className="mt-3 text-center">
                <span className="text-xs font-black text-[#006B45] uppercase tracking-wider block">
                  Status: {activeMood.toUpperCase()}
                </span>
                <span className="text-[11px] text-slate-500">
                  {activeMood === 'idle' && 'Bernapas perlahan & daun bergoyang'}
                  {activeMood === 'wave' && 'Melambaikan tangan menyapa ceria'}
                  {activeMood === 'happy' && 'Melompat senang & mata tersenyum'}
                  {activeMood === 'thinking' && 'Kepala miring menopang dagu'}
                  {activeMood === 'bounce' && 'Memantul halus saat asisten dibuka'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 1. SECTION: PREVIEW 4 KONDISI ANIMASI WAWI (IDLE, MENYAPA, SENANG, BERPIKIR) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#142B36]">
                Preview 4 Kondisi Animasi Utama Wawi
              </h2>
              <p className="text-xs text-slate-500">
                Setiap animasi bergerak secara kontinu dan halus menggunakan keyframe CSS murni yang hemat memori.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-400">Pilih kartu untuk fokus tampilan</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Kondisi Idle */}
            <div
              onClick={() => setActiveMood('idle')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4 bg-white ${
                activeMood === 'idle'
                  ? 'border-[#006B45] ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div className="h-32 flex items-center justify-center">
                <WawiCharacter mood="idle" size={110} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-[#DDF7EA] text-[#006B45] border-0 text-[10px] font-bold">
                    Kondisi 1
                  </Badge>
                  <h3 className="font-extrabold text-sm text-[#142B36]">Idle (Bernapas)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tubuh bergerak naik-turun lembut menyerupai ritme bernapas santai. Tunas daun kembar bergoyang dan mata berkedip berkala.
                </p>
              </div>
              <Button
                variant={activeMood === 'idle' ? 'default' : 'outline'}
                className={activeMood === 'idle' ? 'bg-[#006B45] text-white w-full text-xs font-bold h-8' : 'w-full text-xs font-semibold h-8'}
              >
                Pilih Idle
              </Button>
            </div>

            {/* 2. Kondisi Menyapa (Wave) */}
            <div
              onClick={() => setActiveMood('wave')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4 bg-white ${
                activeMood === 'wave'
                  ? 'border-[#006B45] ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div className="h-32 flex items-center justify-center">
                <WawiCharacter mood="wave" size={110} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-sky-100 text-sky-800 border-0 text-[10px] font-bold">
                    Kondisi 2
                  </Badge>
                  <h3 className="font-extrabold text-sm text-[#142B36]">Menyapa (Wave)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tangan kanan terangkat dan melambai riang ke arah pengguna dengan kilau sapaan kuning cerah ketika menyambut pengguna.
                </p>
              </div>
              <Button
                variant={activeMood === 'wave' ? 'default' : 'outline'}
                className={activeMood === 'wave' ? 'bg-[#006B45] text-white w-full text-xs font-bold h-8' : 'w-full text-xs font-semibold h-8'}
              >
                Pilih Menyapa
              </Button>
            </div>

            {/* 3. Kondisi Senang (Happy) */}
            <div
              onClick={() => setActiveMood('happy')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4 bg-white ${
                activeMood === 'happy'
                  ? 'border-[#006B45] ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div className="h-32 flex items-center justify-center">
                <WawiCharacter mood="happy" size={110} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] font-bold">
                    Kondisi 3
                  </Badge>
                  <h3 className="font-extrabold text-sm text-[#142B36]">Senang (Happy Jump)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Melompat ceria dengan mata tersenyum melengkung, mulut terbuka tertawa, serta confetti bintang emas dan daun hijau berputar.
                </p>
              </div>
              <Button
                variant={activeMood === 'happy' ? 'default' : 'outline'}
                className={activeMood === 'happy' ? 'bg-[#006B45] text-white w-full text-xs font-bold h-8' : 'w-full text-xs font-semibold h-8'}
              >
                Pilih Senang
              </Button>
            </div>

            {/* 4. Kondisi Berpikir (Thinking) */}
            <div
              onClick={() => setActiveMood('thinking')}
              className={`p-6 rounded-3xl border transition-all cursor-pointer flex flex-col items-center justify-between text-center space-y-4 bg-white ${
                activeMood === 'thinking'
                  ? 'border-[#006B45] ring-2 ring-emerald-500/20 shadow-md'
                  : 'border-slate-200 hover:border-emerald-300 shadow-xs'
              }`}
            >
              <div className="h-32 flex items-center justify-center">
                <WawiCharacter mood="thinking" size={110} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-center gap-1.5">
                  <Badge className="bg-purple-100 text-purple-800 border-0 text-[10px] font-bold">
                    Kondisi 4
                  </Badge>
                  <h3 className="font-extrabold text-sm text-[#142B36]">Berpikir (Thinking)</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kepala miring sedikit, tangan kanan menopang dagu dengan gelembung pikiran tanda tanya hijau berputar lembut di atas kepala.
                </p>
              </div>
              <Button
                variant={activeMood === 'thinking' ? 'default' : 'outline'}
                className={activeMood === 'thinking' ? 'bg-[#006B45] text-white w-full text-xs font-bold h-8' : 'w-full text-xs font-semibold h-8'}
              >
                Pilih Berpikir
              </Button>
            </div>
          </div>
        </div>

        {/* 2. SECTION: SIMULATOR SAPAAN BERDASARKAN ROLE PENGGUNA */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3 py-1 rounded-full border border-emerald-200">
              Interaksi Multi-Role
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-[#142B36] mt-2">
              Sapaan Kontekstual Sesuai Peran Pengguna
            </h2>
            <p className="text-xs text-slate-500">
              Ketika pengguna login, Wawi secara otomatis menyesuaikan salam, tips pemilahan, dan tautan aksi cepat.
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['warga', 'petugas', 'admin', 'mitra', 'super_admin'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRole(r)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                  selectedRole === r
                    ? 'bg-[#006B45] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {r === 'super_admin' ? 'Super Admin' : r}
              </button>
            ))}
          </div>

          {/* Display Speech Bubble of Selected Role */}
          <div className={`p-5 rounded-2xl border ${roleDialogs[selectedRole].color} space-y-3 transition-all`}>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              <span className="font-extrabold text-xs uppercase tracking-wide">
                {roleDialogs[selectedRole].title}
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
              &ldquo;{roleDialogs[selectedRole].message}&rdquo;
            </p>
            <p className="text-xs text-slate-600 leading-relaxed border-t border-slate-200/60 pt-2">
              {roleDialogs[selectedRole].sub}
            </p>
          </div>
        </div>

        {/* 3. SECTION: SIMULATOR RESPON AKTIVITAS PENGGUNA */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3 py-1 rounded-full border border-emerald-200">
                Event-Driven Response
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#142B36] mt-2">
                Simulasi Respons Wawi Terhadap Aksi Pengguna
              </h2>
              <p className="text-xs text-slate-500">
                Klik tombol simulasi di bawah untuk menguji reaksi Wawi pada widget mengambang di pojok kanan bawah.
              </p>
            </div>
            {lastActivityEvent && (
              <Badge className="bg-emerald-100 text-[#006B45] border-emerald-300 text-xs px-3 py-1">
                Terpicu: {lastActivityEvent}
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <button
              onClick={() => handleSimulateActivity('pickup')}
              className="p-4 rounded-2xl border border-emerald-200 bg-[#F3FAF6] hover:bg-[#DDF7EA] text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center gap-2 text-[#006B45] font-bold text-xs">
                <Truck className="h-4 w-4" />
                <span>Jemput Berhasil</span>
              </div>
              <p className="text-[11px] text-slate-600">Wawi melompat senang dan memuji warga yang tertib memilah.</p>
            </button>

            <button
              onClick={() => handleSimulateActivity('weigh')}
              className="p-4 rounded-2xl border border-sky-200 bg-sky-50/50 hover:bg-sky-100 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center gap-2 text-[#0284C7] font-bold text-xs">
                <Scale className="h-4 w-4" />
                <span>Timbangan Sah</span>
              </div>
              <p className="text-[11px] text-slate-600">Wawi mengonfirmasi berat fisik riil masuk ke sistem.</p>
            </button>

            <button
              onClick={() => handleSimulateActivity('points')}
              className="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center gap-2 text-[#D97706] font-bold text-xs">
                <Award className="h-4 w-4" />
                <span>Poin Ditambahkan</span>
              </div>
              <p className="text-[11px] text-slate-600">Wawi memberi ucapan selamat atas perolehan poin reward.</p>
            </button>

            <button
              onClick={() => handleSimulateActivity('error')}
              className="p-4 rounded-2xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100 text-left space-y-1.5 transition-all group"
            >
              <div className="flex items-center gap-2 text-purple-700 font-bold text-xs">
                <Zap className="h-4 w-4" />
                <span>Simulasi Error</span>
              </div>
              <p className="text-[11px] text-slate-600">Wawi menampilkan ekspresi berpikir dan menyarankan solusi.</p>
            </button>
          </div>
        </div>

        {/* Petunjuk Uji Widget Mengambang */}
        <div className="p-5 rounded-2xl bg-[#DDF7EA]/50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
          <Sparkles className="h-4 w-4 text-[#006B45] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Catatan Pengujian Maskot Mengambang:</strong> Perhatikan widget Wawi di pojok kanan bawah layar Anda. Klik avatar Wawi untuk membuka asisten interaktif lengkap, membaca tips pemilahan, atau menekan tombol simulator untuk menguji respons Wawi secara seketika!
          </div>
        </div>
      </div>
    </div>
  )
}

