import fs from 'fs';
import path from 'path';

const content = `"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/context/AuthContext'
import { TypewriterEffect } from '@/components/ui/TypewriterEffect'
import {
  Leaf,
  CalendarPlus,
  ArrowRight,
  Truck,
  Scale,
  Coins,
  Recycle,
  Sparkles,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronRight,
  Layers,
  HeartHandshake,
  LogIn,
  LayoutDashboard,
  Menu,
  X,
  Phone,
  Mail,
  HelpCircle,
  ShieldAlert,
  ArrowUpRight,
  Info,
  Check,
  ExternalLink,
  TrendingUp,
  Droplets,
  ShoppingBag,
  Boxes,
  FileText,
  Factory,
  Sprout,
  SunMedium,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

// Data 4 Kartu Ekosistem untuk Modal Detail Interaktif
interface EcosystemDetail {
  id: string
  title: string
  tagline: string
  illustration: string
  bgColor: string
  borderColor: string
  accentColor: string
  process: string
  materials: string[]
  environmentalImpact: string
  economicValue: string
  wasteWiseSupport: string
  isCircularFlow?: boolean
}

const ECOSYSTEM_DETAILS: Record<string, EcosystemDetail> = {
  sorting: {
    id: 'sorting',
    title: 'Pemilahan Cerdas',
    tagline: 'Klasifikasi Presisi 3 Kategori Utama Berbasis Kecerdasan Buatan',
    illustration: '/illustrations/sorting.svg',
    bgColor: 'bg-[#DDF7EA]/60',
    borderColor: 'border-emerald-300',
    accentColor: '#006B45',
    process:
      'Warga memilah sampah langsung di sumbernya ke dalam tiga wadah terpisah: Organik, Anorganik, dan Limbah B3. Kamera ponsel pintar dengan AI visual LiteRT membantu mendeteksi jenis sampah secara seketika.',
    materials: ['Sisa makanan & dedaunan (Organik)', 'Botol PET, kardus, kaleng (Anorganik)', 'Baterai & lampu neon (Limbah B3)'],
    environmentalImpact:
      'Mencegah kontaminasi silang materi daur ulang dan menurunkan beban timbulan sampah ke TPA hingga 65%.',
    economicValue:
      'Material terpilah bersih memiliki harga jual 2-3 kali lebih tinggi dibanding sampah tercampur.',
    wasteWiseSupport:
      'Aplikasi WasteWise menyediakan fitur analisis foto AI, panduan pemilahan interaktif, dan pencatatan volume awal.',
  },
  recycling: {
    id: 'recycling',
    title: 'Daur Ulang Material',
    tagline: 'Transformasi Sampah Plastik, Kertas, dan Logam Menjadi Komoditas Baru',
    illustration: '/illustrations/recycling.svg',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-300',
    accentColor: '#0284C7',
    process:
      'Material anorganik yang dijemput oleh armada ditimbang secara akurat, kemudian dipilah berdasarkan jenis polimer (PET, HDPE) dan disalurkan ke fasilitas pencacahan atau press baling.',
    materials: ['Botol plastik minuman (PET)', 'Tutup botol & galon (HDPE)', 'Kardus cokelat tebal & kertas arsip', 'Kaleng aluminium & seng'],
    environmentalImpact:
      'Mengurangi emisi karbon setara 1.82 kg CO₂e untuk setiap 1 kg plastik yang didaur ulang kembali.',
    economicValue:
      'Warga menerima 50 Poin/Kg yang dapat dikonversi menjadi voucher reward atau saldo tabungan sampah.',
    wasteWiseSupport:
      'Platform mencatat riwayat penimbangan digital transparan dan menghubungkan pasokan ke agregator daur ulang.',
  },
  composting: {
    id: 'composting',
    title: 'Pengomposan Alami',
    tagline: 'Pengolahan Sisa Makanan Menjadi Pupuk Subur dan Pakan Protein Tinggi',
    illustration: '/illustrations/composting.svg',
    bgColor: 'bg-[#FFF9ED]',
    borderColor: 'border-amber-300',
    accentColor: '#D97706',
    process:
      'Sampah sisa dapur dan dedaunan pekarangan diolah melalui dekomposisi aerobik terpadu dan biokonversi larva lalat tentara hitam (Maggot BSF) yang cepat mengurai bahan organik.',
    materials: ['Sisa sayur, nasi, dan kulit buah', 'Ampas kelapa & sisa dapur basah', 'Dedaunan ranting kebun', 'Cangkang telur'],
    environmentalImpact:
      'Mereduksi gas metana (CH₄) berbahaya yang biasa timbul dari pembusukan anaerobik di TPA liar.',
    economicValue:
      'Warga menerima 100 Poin/Kg untuk sampah organik terpilah, sekaligus menghasilkan kompos kasgot berkualitas dan larva maggot berprotein tinggi.',
    wasteWiseSupport:
      'Sistem menyediakan penjemputan berkala sampah basah agar tidak menimbulkan bau di pemukiman warga.',
  },
  circular: {
    id: 'circular',
    title: 'Ekonomi Sirkular',
    tagline: 'Sirkulasi Nilai Berkelanjutan: Dari Pemilahan Warga Hingga Produk Bermanfaat',
    illustration: '/illustrations/circular-economy.svg',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-300',
    accentColor: '#009B63',
    process:
      'Alur terpadu WasteWise: Warga memilah sampah di rumah -> Armada menjemput dan melakukan penimbangan fisik digital -> Data diverifikasi dan poin diterbitkan -> Material dikonsolidasikan untuk disalurkan ke pengolah UMKM -> Hasil olahan memiliki nilai komersial nyata.',
    materials: ['Maggot segar pakan ternak', 'Maggot kering tahan simpan', 'Sabun batang minyak maggot', 'Pupuk organik kasgot & POC'],
    environmentalImpact:
      'Mewujudkan konsep Zero Waste to Landfill dengan menutup siklus materi sehingga tidak terbuang sia-sia ke TPA.',
    economicValue:
      'Membuka lapangan kerja bagi armada penjemput, bank sampah desa, peternak lokal, dan pelaku usaha produk turunan.',
    wasteWiseSupport:
      'WasteWise menjadi jembatan digital tata kelola sampah dari hulu ke hilir. Penyaluran ke pengolah dikelola bertahap melalui program kemitraan binaan resmi dan bank sampah desa.',
    isCircularFlow: true,
  },
}

// Data Kategori Sampah untuk Modal Informasi
interface CategoryModalData {
  category: 'Organik' | 'Anorganik' | 'B3'
  title: string
  color: string
  badgeVariant: 'organik' | 'anorganik' | 'b3'
  points: string
  illustration: string
  materials: string[]
  benefits: string
  warnings: string
}

const CATEGORY_MODAL_DATA: Record<string, CategoryModalData> = {
  Organik: {
    category: 'Organik',
    title: 'Sampah Organik Rumah Tangga',
    color: '#006B45',
    badgeVariant: 'organik',
    points: '100 Poin / Kg',
    illustration: '/illustrations/organic.svg',
    materials: ['Sisa sayuran & buah-buahan', 'Sisa nasi, roti, & makanan matang', 'Dedaunan kering & ranting kecil pekarangan', 'Ampas kopi, teh, & cangkang telur'],
    benefits: 'Diolah menjadi pupuk kompos organik alami serta pakan budidaya larva Maggot BSF tinggi protein.',
    warnings: 'Tiriskan kuah atau minyak berlebih sebelum dimasukkan ke wadah agar tidak bocor dan menimbulkan aroma tidak sedap.',
  },
  Anorganik: {
    category: 'Anorganik',
    title: 'Sampah Anorganik Bernilai Daur Ulang',
    color: '#0284C7',
    badgeVariant: 'anorganik',
    points: '50 Poin / Kg',
    illustration: '/illustrations/inorganic.svg',
    materials: ['Botol plastik mineral (PET) & tutupnya (HDPE)', 'Kardus packing, karton, & kertas koran/arsip', 'Kaleng biskuit, susu kental manis, & minuman kaleng', 'Gelas plastik & botol kaca bening'],
    benefits: 'Disalurkan ke industri daur ulang untuk diolah kembali menjadi pelet plastik dan bubur kertas bermutu tinggi.',
    warnings: 'Bilas sisa cairan pada botol dan pipihkan kardus untuk menghemat ruang tampung armada penjemput.',
  },
  B3: {
    category: 'B3',
    title: 'Limbah Bahan Berbahaya & Beracun (B3)',
    color: '#DC2626',
    badgeVariant: 'b3',
    points: '0 Poin (Karantina Khusus)',
    illustration: '/illustrations/hazard-b3.svg',
    materials: ['Baterai bekas (kering / isi ulang)', 'Lampu neon TL & lampu bohlam rusak', 'Botol kemasan obat kimia, racun serangga, & pestisida', 'Kemasan pemutih & limbah elektronik kecil'],
    benefits: 'Dikarantina terisolasi agar racun logam berat tidak mencemari air tanah dan kesehatan warga.',
    warnings: 'DILARANG KERAS mencampur limbah B3 dengan sampah organik atau anorganik! Diserahkan ke DLH untuk pemusnahan resmi berizin.',
  },
}

export default function PublicHomePage() {
  const { isAuthenticated, role } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedEcosystem, setSelectedEcosystem] = useState<EcosystemDetail | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<CategoryModalData | null>(null)

  const getDashboardHref = () => {
    if (!role) return '/login'
    switch (role) {
      case 'warga':
        return '/warga'
      case 'petugas':
        return '/petugas'
      case 'admin':
        return '/admin'
      case 'mitra':
        return '/mitra'
      case 'super_admin':
        return '/super-admin'
      default:
        return '/warga'
    }
  }

  return (
    <div className="min-h-screen bg-[#F3FAF6] text-slate-800 font-sans selection:bg-[#DDF7EA] selection:text-[#006B45]">
      {/* 1. NAVBAR DENGAN GLASSMORPHISM */}
      <nav className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-emerald-100 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-2xl bg-gradient-to-tr from-[#006B45] to-[#009B63] p-2 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl font-black tracking-tight text-[#006B45]">
                    Waste<span className="text-[#009B63]">Wise</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#DDF7EA] text-[#006B45] border border-emerald-200">
                    Eco
                  </span>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                  Circular & AI Waste Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
              <a href="#ekosistem" className="hover:text-[#006B45] transition-colors">
                Ekosistem
              </a>
              <a href="#cara-kerja" className="hover:text-[#006B45] transition-colors">
                Alur Layanan
              </a>
              <a href="#maggot-bsf" className="hover:text-[#006B45] transition-colors flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#009B63]" />
                Biokonversi BSF
              </a>
              <a href="#peluang-ekonomi" className="hover:text-[#006B45] transition-colors">
                Nilai Ekonomi
              </a>
              <a href="#jenis-sampah" className="hover:text-[#006B45] transition-colors">
                Kategori Sampah
              </a>
              <a href="#umkm" className="hover:text-[#006B45] transition-colors">
                Penyaluran UMKM
              </a>
            </div>

            {/* Right Action CTA */}
            <div className="hidden sm:flex items-center gap-3">
              {isAuthenticated ? (
                <Link href={getDashboardHref()}>
                  <Button className="bg-[#006B45] hover:bg-[#004D31] text-white text-xs font-bold rounded-xl px-4 h-10 shadow-sm gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Masuk Dashboard</span>
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="outline"
                      className="border border-emerald-300 bg-white hover:bg-emerald-50 text-[#006B45] hover:text-[#004D31] text-xs font-bold rounded-xl h-10 px-4 gap-1.5 shadow-2xs transition-all"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Masuk</span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button className="bg-[#009B63] hover:bg-[#006B45] text-white text-xs font-bold rounded-xl px-4 h-10 shadow-sm shadow-emerald-600/20 gap-1.5 transition-all">
                      <CalendarPlus className="h-3.5 w-3.5" />
                      <span>Ajukan Penjemputan</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex sm:hidden items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-b border-emerald-100 bg-white/95 px-4 pt-2 pb-5 space-y-3">
            <div className="flex flex-col space-y-2 text-xs font-semibold text-slate-700">
              <a
                href="#ekosistem"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Ekosistem
              </a>
              <a
                href="#cara-kerja"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Alur Layanan
              </a>
              <a
                href="#maggot-bsf"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Biokonversi Maggot BSF
              </a>
              <a
                href="#peluang-ekonomi"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Nilai Ekonomi
              </a>
              <a
                href="#jenis-sampah"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Kategori Sampah
              </a>
              <a
                href="#umkm"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-[#DDF7EA]/50"
              >
                Penyaluran UMKM
              </a>
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-[#006B45] text-white text-xs font-bold h-10 rounded-xl">
                  {isAuthenticated ? 'Masuk ke Dashboard' : 'Masuk / Daftar Akun'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION DENGAN ANIMASI HEADLINE 2 BARIS (BARIS 1 TETAP, BARIS 2 TYPING DI BAWAHNYA) */}
      <section className="relative overflow-hidden pt-10 sm:pt-16 pb-16 sm:pb-24">
        {/* Soft radial background lights */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#DDF7EA]/70 to-[#FFF9ED]/60 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Text & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Badge Sub-Header */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-[#006B45] border border-emerald-200 shadow-2xs">
                <span className="flex h-2 w-2 rounded-full bg-[#009B63] animate-pulse" />
                <span>Teknologi Pemilahan AI & Ekonomi Sirkular Desa</span>
              </div>

              {/* Susunan Headline 2 Baris:
                  Baris 1 (tetap): "Ubah Sampah Menjadi"
                  Baris 2 (tepat DI BAWAHNYA, bergantian typing):
                  - "Poin & Hadiah Nyata"
                  - "Lingkungan Lebih Bersih"
                  - "Ekonomi Lebih Bernilai"
              */}
              <div className="space-y-1">
                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#142B36] tracking-tight leading-tight">
                  Ubah Sampah Menjadi
                </h1>
                <div className="min-h-[50px] sm:min-h-[70px] lg:min-h-[78px] flex items-center justify-center lg:justify-start">
                  <span className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-[#006B45] via-[#009B63] to-[#16A765] bg-clip-text text-transparent">
                    <TypewriterEffect
                      words={[
                        'Poin & Hadiah Nyata',
                        'Lingkungan Lebih Bersih',
                        'Ekonomi Lebih Bernilai',
                      ]}
                      typingSpeed={85}
                      deletingSpeed={45}
                      pauseDuration={2400}
                      className="bg-gradient-to-r from-[#006B45] via-[#009B63] to-[#16A765] bg-clip-text text-transparent inline-block"
                      cursorClassName="bg-[#009B63] w-[4px] h-[0.9em]"
                    />
                  </span>
                </div>
              </div>

              {/* Clean Static Sub-Headline (Tanpa Animasi Mengetik) */}
              <p className="text-xs sm:text-sm font-bold text-[#006B45] tracking-wide uppercase">
                Platform Terpadu Pengelolaan Sampah Cerdas, Transparan, dan Bernilai Nyata
              </p>

              {/* Description Body */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                WasteWise membantu masyarakat memilah sampah menggunakan teknologi AI langsung dari perangkat, mengajukan penjemputan, dan mencatat hasil penimbangan secara transparan. Setiap sampah yang terkumpul dapat menghasilkan poin reward, sementara material yang telah dipilah berpeluang disalurkan untuk didaur ulang atau diolah menjadi produk bernilai ekonomi.
              </p>

              {/* Two CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                <Link href={isAuthenticated ? '/warga/ajukan' : '/login?redirect=/warga/ajukan'} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-[#006B45] hover:bg-[#004D31] text-white font-extrabold text-xs sm:text-sm h-12 px-7 rounded-2xl shadow-lg shadow-emerald-800/20 gap-2 transition-all">
                    <CalendarPlus className="h-4 w-4" />
                    <span>Ajukan Penjemputan Sampah</span>
                  </Button>
                </Link>
                <a href="#cara-kerja" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto border-emerald-300 text-[#006B45] hover:bg-[#DDF7EA]/60 font-bold text-xs sm:text-sm h-12 px-6 rounded-2xl gap-2 transition-all"
                  >
                    <span>Pelajari Alur Layanan</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              {/* 3 Value Proposition Bullets (Poin Baru: Organik 100, Anorganik 50, B3 0) */}
              <div className="pt-4 grid grid-cols-3 gap-2 border-t border-emerald-100 max-w-lg mx-auto lg:mx-0 text-left">
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-black text-[#006B45]">100 Poin/Kg</span>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                    Sampah Organik
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-black text-[#0284C7]">50 Poin/Kg</span>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                    Sampah Anorganik
                  </p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-xs sm:text-sm font-black text-[#DC2626]">0 Poin</span>
                  <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                    Limbah B3 (Karantina)
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Centerpiece Illustration + Floating Badges */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Decorative back plate */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#DDF7EA] to-white rounded-3xl -rotate-2 scale-95 border border-emerald-200/80 shadow-md -z-10" />

              {/* Main Card Frame */}
              <div className="relative w-full max-w-md bg-white rounded-3xl border border-emerald-200 p-5 sm:p-6 shadow-xl shadow-emerald-900/5">
                {/* SVG Illustration Container */}
                <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#F3FAF6] border border-emerald-100/90 flex items-center justify-center p-3">
                  <Image
                    src="/illustrations/hero-eco.svg"
                    alt="Ilustrasi Ekosistem Cerdas WasteWise"
                    width={400}
                    height={290}
                    priority
                    unoptimized
                    className="object-contain"
                  />
                </div>

                {/* Floating Badge Top-Left: +100 Poin Organik */}
                <div className="absolute -top-3.5 -left-3.5 sm:-left-4 bg-white rounded-2xl border border-amber-200 px-3.5 py-2 shadow-lg flex items-center gap-2.5 animate-float">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center text-white shadow-xs">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Reward Baru</span>
                    <span className="text-xs font-black text-[#92400E]">+100 Poin / Kg</span>
                  </div>
                </div>

                {/* Floating Badge Bottom-Right: AI Classifier Valid */}
                <div className="absolute -bottom-3.5 -right-3.5 sm:-right-4 bg-white rounded-2xl border border-emerald-200 px-3.5 py-2 shadow-lg flex items-center gap-2.5 animate-float-slow">
                  <div className="h-8 w-8 rounded-xl bg-[#009B63] flex items-center justify-center text-white shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Klasifikasi AI</span>
                    <span className="text-xs font-black text-[#006B45]">AI: Organik 98% Valid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION: 4 PILAR EKOSISTEM WASTEWISE (Semua 4 Kartu Memiliki Ilustrasi Seragam & Nyata) */}
      <section id="ekosistem" className="py-14 sm:py-20 bg-white border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3 py-1 rounded-full border border-emerald-200">
              Pilar Layanan
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B36] tracking-tight">
              Ekosistem Terintegrasi WasteWise
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Klik setiap kartu pilar untuk menjelajahi detail mekanisme, material yang ditangani, dan nilai manfaatnya.
            </p>
          </div>

          {/* 4 Pastel Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Pemilahan Cerdas */}
            <div
              onClick={() => setSelectedEcosystem(ECOSYSTEM_DETAILS.sorting)}
              className="group cursor-pointer rounded-2xl border border-emerald-200/90 bg-[#DDF7EA]/40 p-5 shadow-xs hover:-translate-y-1.5 hover:border-[#006B45] hover:shadow-lg hover:shadow-emerald-600/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white/80 mb-4 flex items-center justify-center p-3 border border-emerald-100">
                  <Image
                    src="/illustrations/sorting.svg"
                    alt="Ilustrasi Pemilahan Cerdas"
                    width={220}
                    height={130}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#006B45]" />
                    <h3 className="font-bold text-sm text-[#142B36]">Pemilahan Cerdas</h3>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#006B45] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Identifikasi visual cepat dengan kecerdasan buatan LiteRT on-device untuk memilah sampah tepat di sumbernya.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#006B45] flex items-center gap-1 group-hover:underline pt-2 border-t border-emerald-100/60">
                Pelajari Detail Alur →
              </span>
            </div>

            {/* Card 2: Daur Ulang Material */}
            <div
              onClick={() => setSelectedEcosystem(ECOSYSTEM_DETAILS.recycling)}
              className="group cursor-pointer rounded-2xl border border-sky-200/90 bg-sky-50/70 p-5 shadow-xs hover:-translate-y-1.5 hover:border-sky-400 hover:shadow-lg hover:shadow-sky-600/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white/80 mb-4 flex items-center justify-center p-3 border border-sky-100">
                  <Image
                    src="/illustrations/recycling.svg"
                    alt="Ilustrasi Daur Ulang Material"
                    width={220}
                    height={130}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#0284C7]" />
                    <h3 className="font-bold text-sm text-[#142B36]">Daur Ulang Material</h3>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#0284C7] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Penjemputan dan penimbangan fisik botol plastik, kardus, dan logam yang langsung dikonversi menjadi poin reward.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#0284C7] flex items-center gap-1 group-hover:underline pt-2 border-t border-sky-100/60">
                Lihat Spesifikasi Material →
              </span>
            </div>

            {/* Card 3: Pengomposan Alami */}
            <div
              onClick={() => setSelectedEcosystem(ECOSYSTEM_DETAILS.composting)}
              className="group cursor-pointer rounded-2xl border border-amber-200/90 bg-[#FFF9ED] p-5 shadow-xs hover:-translate-y-1.5 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-600/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white/80 mb-4 flex items-center justify-center p-3 border border-amber-100">
                  <Image
                    src="/illustrations/composting.svg"
                    alt="Ilustrasi Pengomposan Alami"
                    width={220}
                    height={130}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#D97706]" />
                    <h3 className="font-bold text-sm text-[#142B36]">Pengomposan Alami</h3>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#D97706] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Dekomposisi sisa makanan dan biokonversi Maggot BSF menghasilkan pupuk kompos kaya hara dan pakan ternak.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#D97706] flex items-center gap-1 group-hover:underline pt-2 border-t border-amber-100/60">
                Lihat Alur Kompos & Kasgot →
              </span>
            </div>

            {/* Card 4: Ekonomi Sirkular (Ilustrasi Baru: Sampah Terpilah -> Pengolahan -> Produk Bernilai -> Mitra UMKM) */}
            <div
              onClick={() => setSelectedEcosystem(ECOSYSTEM_DETAILS.circular)}
              className="group cursor-pointer rounded-2xl border border-teal-200/90 bg-teal-50/70 p-5 shadow-xs hover:-translate-y-1.5 hover:border-[#009B63] hover:shadow-lg hover:shadow-teal-600/10 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden bg-white/80 mb-4 flex items-center justify-center p-3 border border-teal-100">
                  <Image
                    src="/illustrations/circular-economy.svg"
                    alt="Ilustrasi Ekonomi Sirkular: Sampah Terpilah, Pengolahan, Produk Bernilai, dan Mitra UMKM"
                    width={220}
                    height={130}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#009B63]" />
                    <h3 className="font-bold text-sm text-[#142B36]">Ekonomi Sirkular</h3>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-[#009B63] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Penyaluran terverifikasi yang menghasilkan reward poin warga dan membuka peluang wirausaha daur ulang bernilai ekonomi.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#009B63] flex items-center gap-1 group-hover:underline pt-2 border-t border-teal-100/60">
                Lihat Alur Siklus Tertutup →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECTION: BAGAIMANA WASTEWISE BEKERJA (5 TAHAP ALUR & MEKANISME KERJA) */}
      <section id="cara-kerja" className="py-14 sm:py-20 bg-[#F3FAF6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-emerald-200">
              Alur & Mekanisme Kerja Terintegrasi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B36] tracking-tight">
              Bagaimana WasteWise Bekerja untuk Anda?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Lima tahapan sistematis dan transparan mulai dari depan pintu rumah tangga hingga fasilitas pengolahan bernilai ekonomi.
            </p>
          </div>

          {/* Desktop Timeline (Horizontal with Connected Line) */}
          <div className="relative">
            <div className="hidden lg:block absolute top-12 left-10 right-10 h-1 bg-gradient-to-r from-[#006B45] via-[#0284C7] via-[#D97706] via-[#4F46E5] to-[#009B63] -z-0 rounded-full opacity-35" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
              {/* Tahap 1 */}
              <div className="bg-white rounded-2xl border border-emerald-200/90 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#006B45] text-white font-extrabold text-base shadow-sm">
                      1
                    </div>
                    <Badge variant="outline" className="border-emerald-300 text-[#006B45] bg-[#DDF7EA] text-[10px]">
                      Pemilahan Sumber
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#142B36]">Tahap 1 – Pemilahan Sampah dari Rumah</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Warga memilah sampah berdasarkan jenisnya. Sampah organik seperti sisa makanan, sayuran, dan buah dipisahkan dari sampah anorganik serta limbah B3 agar dapat ditangani sesuai karakteristiknya.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#006B45] flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 shrink-0" /> Pemisahan wadah 3 kategori
                </div>
              </div>

              {/* Tahap 2 */}
              <div className="bg-white rounded-2xl border border-sky-200/90 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0284C7] text-white font-extrabold text-base shadow-sm">
                      2
                    </div>
                    <Badge variant="outline" className="border-sky-300 text-[#0284C7] bg-sky-50 text-[10px]">
                      Aplikasi WasteWise
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#142B36]">Tahap 2 – Pengajuan Penjemputan</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Warga mengajukan jadwal penjemputan melalui WasteWise, melengkapi alamat, perkiraan berat, serta foto sampah untuk membantu proses identifikasi awal.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#0284C7] flex items-center gap-1.5">
                  <Truck className="h-3.5 w-3.5 shrink-0" /> Jadwal & titik GPS lokasi
                </div>
              </div>

              {/* Tahap 3 */}
              <div className="bg-white rounded-2xl border border-amber-200/90 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#D97706] text-white font-extrabold text-base shadow-sm">
                      3
                    </div>
                    <Badge variant="outline" className="border-amber-300 text-[#D97706] bg-amber-50 text-[10px]">
                      Timbangan Fisik
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#142B36]">Tahap 3 – Penjemputan dan Penimbangan</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Petugas menerima penugasan, mendatangi lokasi warga, memverifikasi jenis sampah, dan melakukan penimbangan menggunakan timbangan fisik. Berat aktual menjadi dasar pencatatan dan perhitungan poin.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#D97706] flex items-center gap-1.5">
                  <Scale className="h-3.5 w-3.5 shrink-0" /> Berat riil & poin langsung
                </div>
              </div>

              {/* Tahap 4 */}
              <div className="bg-white rounded-2xl border border-indigo-200/90 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#4F46E5] text-white font-extrabold text-base shadow-sm">
                      4
                    </div>
                    <Badge variant="outline" className="border-indigo-300 text-[#4F46E5] bg-indigo-50 text-[10px]">
                      Sistem & Logistik
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#142B36]">Tahap 4 – Pencatatan dan Penyaluran Material</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Data hasil penimbangan dicatat dalam sistem. Material dikelompokkan berdasarkan jenis dan kondisi untuk mendukung proses pengelolaan atau penyaluran ke pengolah yang sesuai.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#4F46E5] flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 shrink-0" /> Pengelompokan jenis & mutu
                </div>
              </div>

              {/* Tahap 5 */}
              <div className="bg-white rounded-2xl border border-teal-200/90 p-5 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all space-y-3.5 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#009B63] text-white font-extrabold text-base shadow-sm">
                      5
                    </div>
                    <Badge variant="outline" className="border-teal-300 text-[#009B63] bg-teal-50 text-[10px]">
                      Sirkular & Bernilai
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#142B36]">Tahap 5 – Pengolahan Menjadi Produk Bernilai</h3>
                    <p className="text-xs text-slate-600 leading-relaxed mt-2">
                      Sampah organik berpotensi diolah melalui budidaya maggot BSF. Material anorganik yang memenuhi persyaratan dapat disalurkan ke proses daur ulang. Setiap hasil pengolahan diarahkan untuk menghasilkan manfaat lingkungan dan nilai ekonomi.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 text-[11px] font-semibold text-[#009B63] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" /> Manfaat ekonomi & hijau
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECTION: KATEGORI SAMPAH TERPILAH */}
      <section id="jenis-sampah" className="py-14 sm:py-20 bg-white border-y border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3 py-1 rounded-full">
              Kategori Terpilah
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B36] tracking-tight">
              Tiga Kategori Sampah yang Dikelola
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sesuai dengan 3 kelas model AI: Organik, Anorganik, dan Limbah B3. Klik kartu untuk melihat rincian material.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Organik: 100 Poin / Kg */}
            <div
              onClick={() => setSelectedCategory(CATEGORY_MODAL_DATA.Organik)}
              className="cursor-pointer group rounded-3xl border border-emerald-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-[#006B45] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-[#DDF7EA]/50 flex items-center justify-center p-3 border border-emerald-100">
                  <Image
                    src="/illustrations/organic.svg"
                    alt="Kategori Sampah Organik"
                    width={220}
                    height={140}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="organik" className="text-xs font-bold bg-[#DDF7EA] text-[#006B45] border-emerald-300">
                    Organik • 100 Poin / Kg
                  </Badge>
                  <span className="text-xs font-bold text-[#006B45]">Pakan & Kompos</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#142B36]">Sampah Organik Rumah Tangga</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sisa sayur, buah, nasi, dedaunan, dan ampas dapur. Diolah melalui biokonversi Maggot BSF dan dekomposisi pupuk organik bernilai tinggi.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#006B45]">Panduan Pemilahan Lengkap</span>
                <ArrowRight className="h-4 w-4 text-[#006B45] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 2. Anorganik: 50 Poin / Kg */}
            <div
              onClick={() => setSelectedCategory(CATEGORY_MODAL_DATA.Anorganik)}
              className="cursor-pointer group rounded-3xl border border-sky-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-[#0284C7] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-sky-50 flex items-center justify-center p-3 border border-sky-100">
                  <Image
                    src="/illustrations/inorganic.svg"
                    alt="Kategori Sampah Anorganik"
                    width={220}
                    height={140}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="anorganik" className="text-xs font-bold bg-sky-100 text-sky-800 border-sky-300">
                    Anorganik • 50 Poin / Kg
                  </Badge>
                  <span className="text-xs font-bold text-[#0284C7]">Daur Ulang Industri</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#142B36]">Sampah Anorganik Daur Ulang</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Botol plastik PET, gelas mineral, kardus kemasan, kertas arsip, dan kaleng logam. Disalurkan ke rantai agregator daur ulang resmi.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#0284C7]">Panduan Pemilahan Lengkap</span>
                <ArrowRight className="h-4 w-4 text-[#0284C7] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 3. Limbah B3: 0 Poin (Karantina Khusus) */}
            <div
              onClick={() => setSelectedCategory(CATEGORY_MODAL_DATA.B3)}
              className="cursor-pointer group rounded-3xl border border-red-200 bg-white p-6 shadow-xs hover:shadow-lg hover:border-[#DC2626] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-red-50/60 flex items-center justify-center p-3 border border-red-100">
                  <Image
                    src="/illustrations/hazard-b3.svg"
                    alt="Kategori Limbah B3"
                    width={220}
                    height={140}
                    unoptimized
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="b3" className="text-xs font-bold bg-red-100 text-red-800 border-red-300">
                    B3 • Karantina (0 Poin)
                  </Badge>
                  <span className="text-xs font-bold text-[#DC2626]">Karantina DLH Khusus</span>
                </div>
                <h3 className="text-lg font-extrabold text-[#142B36]">Limbah Bahan Berbahaya & Beracun</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Baterai, lampu neon TL, botol deterjen/kimia, dan e-waste kecil. Dilarang dicampur demi mencegah kontaminasi racun logam berat.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#DC2626]">Instruksi Keselamatan B3</span>
                <ArrowRight className="h-4 w-4 text-[#DC2626] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SUBBAGIAN KHUSUS: BIOKONVERSI BSF (TAMPILAN LEGA, FOTO ASLI 3 KOLOM, DAN ALUR VISUAL PROPORSIONAL) */}
      <section id="maggot-bsf" className="py-16 sm:py-24 bg-gradient-to-b from-white via-[#F3FAF6] to-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header dengan Margin Lega */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3.5 py-1.5 rounded-full border border-emerald-200">
              Inovasi Biokonversi Ramah Lingkungan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#142B36] tracking-tight">
              Dari Sampah Organik Menjadi Beragam Produk Bernilai
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Sampah organik bukan sekadar sisa yang harus dibuang. Melalui budidaya maggot Black Soldier Fly (BSF), sisa makanan dan bahan organik dapat dimanfaatkan menjadi sumber daya baru yang memiliki nilai guna dan nilai ekonomi.
            </p>
          </div>

          {/* Alur Visual Proporsional: Sampah Organik -> Larva BSF -> Maggot -> Produk Turunan & Kasgot */}
          <div className="bg-white rounded-3xl border border-emerald-200/90 p-6 sm:p-8 shadow-xs">
            <div className="text-center mb-6">
              <span className="text-xs font-extrabold text-[#006B45] uppercase tracking-wider">
                Alur Transformasi Biokonversi WasteWise
              </span>
            </div>

            {/* Step Bar Horizontal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
              <div className="p-4 rounded-2xl bg-[#DDF7EA]/50 border border-emerald-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#006B45] bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                  Langkah 1
                </span>
                <h4 className="font-bold text-xs text-[#142B36] pt-1">Sampah Organik Terpilah</h4>
                <p className="text-[11px] text-slate-600">Sisa sayur, buah, & sisa dapur rumah tangga bebas plastik.</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#D97706] bg-white px-2 py-0.5 rounded-md border border-amber-200">
                  Langkah 2
                </span>
                <h4 className="font-bold text-xs text-[#142B36] pt-1">Biokonversi Larva BSF</h4>
                <p className="text-[11px] text-slate-600">Larva Hermetia illucens mengurai biomasa aktif dalam 14–21 hari.</p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#009B63] bg-white px-2 py-0.5 rounded-md border border-teal-200">
                  Langkah 3
                </span>
                <h4 className="font-bold text-xs text-[#142B36] pt-1">Biomassa Maggot Panen</h4>
                <p className="text-[11px] text-slate-600">Larva dewasa berprotein 40-45% dipanen untuk pakan & minyak.</p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-center space-y-1">
                <span className="text-[10px] font-bold text-[#7C3AED] bg-white px-2 py-0.5 rounded-md border border-purple-200">
                  Langkah 4
                </span>
                <h4 className="font-bold text-xs text-[#142B36] pt-1">Produk Turunan & Kasgot</h4>
                <p className="text-[11px] text-slate-600">Pakan kering, sabun alami, serta pupuk organik kaya nutrisi.</p>
              </div>
            </div>
          </div>

          {/* Galeri Visual 3 Kolom Menampilkan Foto Asli Produk & Budidaya Nyata */}
          <div className="space-y-4 pt-2">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-lg sm:text-xl font-extrabold text-[#142B36]">
                Bukti Nyata Pengolahan & Produk Biokonversi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dokumentasi proses nyata dari budidaya larva BSF hingga produk hilirisasi sabun dan pakan bernilai tambah.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Kolom 1: Foto Larva BSF Sedang Mengurai Sampah */}
              <div className="bg-white rounded-3xl border border-emerald-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/bsf_larvae_waste.jpg"
                      alt="Foto Nyata Larva BSF Mengurai Sampah Organik"
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#006B45] bg-[#DDF7EA] px-2.5 py-0.5 rounded-md border border-emerald-200">
                        Proses Biokonversi
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">14-21 Hari Siklus</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Larva BSF Mengurai Sampah</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Ribuan larva BSF secara rakus mendegradasi limbah organik rumah tangga tanpa menimbulkan bau busuk dan mereduksi volume sampah hingga 70%.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-[#006B45] flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Zero Waste to Landfill
                </div>
              </div>

              {/* Kolom 2: Foto Asli Maggot Siap Panen (Foto User maggot_siap_jadi.jpeg) */}
              <div className="bg-white rounded-3xl border border-teal-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/maggot_siap_jadi.jpeg"
                      alt="Foto Asli Hasil Panen Maggot BSF Berkualitas Siap Olah"
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-md border border-teal-200">
                        Biomassa Segar
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Produk Diuji Nyata</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Biomassa Maggot Siap Panen</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Hasil pemeliharaan menghasilkan maggot segar padat protein (40–45%) yang sangat diminati peternak ayam kampung, bebek, dan pembudidaya ikan lele lokal.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-teal-800 flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Pakan Alternatif Berprotein Tinggi
                </div>
              </div>

              {/* Kolom 3: Foto Asli Sabun Batang Minyak Maggot (Foto User produk_maggot.jpeg) */}
              <div className="bg-white rounded-3xl border border-indigo-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src="/images/produk_maggot.jpeg"
                      alt="Foto Asli Sabun Batang Minyak Maggot Hasil Hilirisasi"
                      fill
                      unoptimized
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2.5 py-0.5 rounded-md border border-indigo-200">
                        Inovasi Hilirisasi
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold">Contoh Produk Nyata</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[#142B36]">Sabun Batang Minyak Maggot</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Contoh produk hilirisasi nyata dari ekstraksi lipid maggot yang kaya asam laurat, diformulasikan menjadi sabun batang ramah lingkungan yang lembut di kulit.
                    </p>
                  </div>
                </div>
                <div className="p-5 pt-0 text-[11px] font-semibold text-indigo-800 flex items-center gap-1.5 border-t border-slate-100 mx-5 pb-4">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> Nilai Tambah Ekonomi Sirkular
                </div>
              </div>
            </div>
          </div>

          {/* 5 KARTU PRODUK TURUNAN: SELURUH LIMA KARTU MEMILIKI GAMBAR NYATA & TATA LETAK SEIMBANG */}
          <div className="space-y-6 pt-6">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-bold text-[#009B63] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-emerald-200">
                Diversifikasi Komoditas
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#142B36] mt-2">
                Hasil & Produk Turunan Bernilai Tinggi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Seluruh produk memiliki peran strategis dalam rantai pasok ekonomi sirkular desa dan peternakan rakyat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {/* Kartu 1: Maggot Segar */}
              <div className="rounded-3xl border border-emerald-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  {/* Foto Di Bagian Atas */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-emerald-50 border border-emerald-100">
                    <Image
                      src="/images/maggot_siap_jadi.jpeg"
                      alt="Foto Maggot Segar Pakan Hidup"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Label Kategori & Status Di Bawah Foto */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                      Pakan Segar
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Produk yang Telah Diuji</span>
                  </div>
                  {/* Nama Produk Jelas */}
                  <h4 className="font-extrabold text-sm text-[#142B36]">Maggot Segar (Pakan Hidup)</h4>
                  {/* Deskripsi Maksimal 2-3 Baris */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Larva maggot hidup berprotein tinggi (40-45%) sebagai pakan berkualitas untuk ayam kampung dan budidaya ikan lele lokal.
                  </p>
                </div>
                {/* Informasi Tambahan Di Bawah */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-emerald-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Check className="h-3.5 w-3.5 shrink-0" /> Protein 40–45% Alami
                </div>
              </div>

              {/* Kartu 2: Maggot Kering */}
              <div className="rounded-3xl border border-amber-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  {/* Foto Di Bagian Atas */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-amber-50 border border-amber-100">
                    <Image
                      src="/images/maggot_kering.jpg"
                      alt="Foto Maggot BSF Kering Tahan Simpan"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Label Kategori & Status Di Bawah Foto */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Pakan Kering
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Contoh Produk</span>
                  </div>
                  {/* Nama Produk Jelas */}
                  <h4 className="font-extrabold text-sm text-[#142B36]">Maggot Kering (Dried BSF)</h4>
                  {/* Deskripsi Maksimal 2-3 Baris */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Maggot hasil pengeringan higienis dengan kadar air rendah sehingga awet disimpan lama untuk pakan burung kicau dan ikan hias.
                  </p>
                </div>
                {/* Informasi Tambahan Di Bawah */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-amber-800 font-semibold flex items-center gap-1.5 mt-3">
                  <SunMedium className="h-3.5 w-3.5 shrink-0" /> Awet & Kadar Air Rendah
                </div>
              </div>

              {/* Kartu 3: Minyak Maggot */}
              <div className="rounded-3xl border border-purple-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  {/* Foto / Ilustrasi Di Bagian Atas */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-purple-50 border border-purple-100">
                    <Image
                      src="/images/minyak_maggot.svg"
                      alt="Ilustrasi Botol Minyak Ekstraksi Maggot BSF"
                      fill
                      unoptimized
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Label Kategori & Status Di Bawah Foto */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-md">
                      Ekstraksi Lipid
                    </span>
                    <span className="text-[10px] text-purple-700 font-semibold">Ilustrasi Potensi Produk</span>
                  </div>
                  {/* Nama Produk Jelas */}
                  <h4 className="font-extrabold text-sm text-[#142B36]">Minyak Maggot BSF</h4>
                  {/* Deskripsi Maksimal 2-3 Baris */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Ekstraksi lipid dari biomassa maggot kaya asam laurat alami untuk bahan baku formulasi industri kosmetik dan pembersih.
                  </p>
                </div>
                {/* Informasi Tambahan Di Bawah */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-purple-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Droplets className="h-3.5 w-3.5 shrink-0" /> Kaya Asam Laurat Alami
                </div>
              </div>

              {/* Kartu 4: Sabun Batang Minyak Maggot */}
              <div className="rounded-3xl border border-indigo-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  {/* Foto Di Bagian Atas (Foto Asli Lampiran User) */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-indigo-50 border border-indigo-100">
                    <Image
                      src="/images/produk_maggot.jpeg"
                      alt="Foto Asli Sabun Batang Berbahan Minyak Maggot"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Label Kategori & Status Di Bawah Foto */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-md">
                      Hilirisasi Perawatan
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Contoh Produk Nyata</span>
                  </div>
                  {/* Nama Produk Jelas */}
                  <h4 className="font-extrabold text-sm text-[#142B36]">Sabun Batang Minyak Maggot</h4>
                  {/* Deskripsi Maksimal 2-3 Baris */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Inovasi produk hilirisasi nyata berupa sabun batang berbahan minyak maggot alami yang lembut di kulit dan ramah lingkungan.
                  </p>
                </div>
                {/* Informasi Tambahan Di Bawah */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-indigo-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" /> Formulasi Lembut Ramah Lingkungan
                </div>
              </div>

              {/* Kartu 5: Kasgot / Pupuk Organik */}
              <div className="rounded-3xl border border-teal-200 bg-white p-4.5 shadow-xs hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between h-full group">
                <div className="space-y-3.5">
                  {/* Foto Di Bagian Atas */}
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-teal-50 border border-teal-100">
                    <Image
                      src="/images/bsf_frass_kasgot.jpg"
                      alt="Foto Asli Pupuk Kasgot Frass Bekas Maggot"
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Label Kategori & Status Di Bawah Foto */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-md">
                      Pupuk Organik
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Produk yang Dihasilkan</span>
                  </div>
                  {/* Nama Produk Jelas */}
                  <h4 className="font-extrabold text-sm text-[#142B36]">Kasgot & Pupuk Organik</h4>
                  {/* Deskripsi Maksimal 2-3 Baris */}
                  <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                    Residu organik sisa media biokonversi kaya unsur hara makro untuk pupuk padat serta potensi pupuk organik cair penyubur tanah.
                  </p>
                </div>
                {/* Informasi Tambahan Di Bawah */}
                <div className="pt-3 border-t border-slate-100 text-[10px] text-teal-800 font-semibold flex items-center gap-1.5 mt-3">
                  <Sprout className="h-3.5 w-3.5 shrink-0" /> Nutrisi Makro Kasgot Alami
                </div>
              </div>
            </div>
          </div>

          {/* Catatan Transparansi Roadmap Hilirisasi BSF */}
          <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
            <Info className="h-4 w-4 text-[#006B45] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Catatan Transparansi Hilirisasi:</strong> WasteWise berfokus penuh pada digitalisasi penjemputan terpilah dan penerbitan reward poin warga. Inovasi biokonversi maggot BSF dan produk turunan merupakan bagian dari roadmap pengembangan jangka panjang hilirisasi ekonomi sirkular yang disalurkan melalui mitra pembudidaya dan pengolah terverifikasi.
            </div>
          </div>
        </div>
      </section>

      {/* 7. SECTION: NILAI EKONOMI & 4 FAKTOR PENENTU REALISASI NILAI */}
      <section id="peluang-ekonomi" className="py-14 sm:py-20 bg-white border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-[#DDF7EA] px-3.5 py-1.5 rounded-full border border-emerald-200">
              Peluang Ekonomi Berkelanjutan
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#142B36] tracking-tight">
              Satu Sampah, Banyak Peluang Ekonomi
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Mengubah biaya pembuangan sampah menjadi nilai tambah ekonomi nyata bagi warga, armada penjemput, dan pelaku usaha lokal.
            </p>
          </div>

          {/* Simple Visual Journey Bar */}
          <div className="bg-[#F3FAF6] rounded-2xl border border-emerald-200 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#006B45] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  🌱
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#142B36]">Alur Nilai Ekonomi:</h4>
                  <p className="text-[11px] text-slate-600">
                    Sampah Terpilah → Penimbangan Digital → Poin Reward Warga → Penyaluran Mitra Pengolah → Nilai Tambah
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="border-emerald-300 bg-white text-[#006B45] font-bold text-xs shrink-0">
                Sirkular Tertutup
              </Badge>
            </div>
          </div>

          {/* 4 Kartu Sederhana: Faktor Penentu Realisasi Nilai Ekonomi */}
          <div className="bg-[#F3FAF6] rounded-3xl border border-emerald-200/90 p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#142B36]">
                Faktor Penentu Realisasi Nilai Ekonomi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                WasteWise mengedukasi ekosistem bahwa realisasi nilai ekonomi sampah dipengaruhi oleh 4 faktor penting:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Faktor 1 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#006B45] text-white font-bold text-xs">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36]">Kualitas Pemilahan</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jenis dan kebersihan sampah memengaruhi peluang pengolahan dan nilai jual material.
                </p>
              </div>

              {/* Faktor 2 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-sky-300 transition-all">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0284C7] text-white font-bold text-xs">
                    2
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36]">Berat dan Volume</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jumlah sampah yang terkumpul menjadi dasar pencatatan, perhitungan poin, dan potensi penyaluran.
                </p>
              </div>

              {/* Faktor 3 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-amber-300 transition-all">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D97706] text-white font-bold text-xs">
                    3
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36]">Kesiapan Pengolahan</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Material perlu memenuhi persyaratan teknis sebelum diolah menjadi bahan baku atau produk turunan.
                </p>
              </div>

              {/* Faktor 4 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2 hover:border-emerald-400 transition-all">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#009B63] text-white font-bold text-xs">
                    4
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36]">Permintaan Pasar</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nilai ekonomi bergantung pada kebutuhan mitra, kualitas produk, biaya pengolahan, dan peluang pemasaran.
                </p>
              </div>
            </div>

            {/* Official Transparent Note */}
            <div className="p-3.5 bg-white rounded-xl border border-emerald-200 text-xs text-slate-600 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#006B45] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Ketentuan Informasi Nilai:</strong> Nilai ekonomi dihitung berdasarkan hasil produksi dan harga pasar aktual. Platform WasteWise tidak menampilkan estimasi harga fiktif, melainkan berfokus pada pencatatan akurat berat sampah terverifikasi dan penerbitan poin reward warga yang transparan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION: ALUR PENYALURAN SAMPAH KE PELAKU UMKM (5 TAHAP STEPPER) */}
      <section id="umkm" className="py-14 sm:py-20 bg-[#F3FAF6] border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-12">
            <span className="text-xs font-bold text-[#006B45] uppercase tracking-wider bg-white px-3 py-1 rounded-full border border-emerald-200">
              Perjalanan Material Sirkular
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B36] tracking-tight">
              Alur Penyaluran Sampah ke Pelaku UMKM
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Sampah tidak berakhir menumpuk di TPA, melainkan dialokasikan secara transparan ke mata rantai daur ulang bernilai ekonomi melalui 5 tahapan.
            </p>
          </div>

          {/* 5-Stage Stepper (Desktop Horizontal, Mobile Vertical) */}
          <div className="bg-white rounded-3xl border border-emerald-200/90 p-6 sm:p-8 shadow-xs space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              {/* Stepper 1 */}
              <div className="p-4 rounded-2xl bg-[#DDF7EA]/40 border border-emerald-200 space-y-2 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#006B45] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    Tahap 1
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36] mt-2">Pemilahan oleh Warga</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Warga memilah sampah organik dan anorganik dari rumah tangga.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-[#006B45]">
                  Wadah terpisah
                </div>
              </div>

              {/* Stepper 2 */}
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 space-y-2 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-sky-200">
                    Tahap 2
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36] mt-2">Pengajuan Penjemputan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Warga menjadwalkan penjemputan sampah melalui aplikasi WasteWise.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-[#0284C7]">
                  Jadwal & titik jemput
                </div>
              </div>

              {/* Stepper 3 */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#D97706] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-amber-200">
                    Tahap 3
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36] mt-2">Verifikasi & Penimbangan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Petugas memeriksa jenis sampah dan menimbang berat aktual secara transparan.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-[#D97706]">
                  Poin reward langsung
                </div>
              </div>

              {/* Stepper 4 */}
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#4F46E5] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                    Tahap 4
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36] mt-2">Pengumpulan & Pengolahan</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Material dikelompokkan dan disiapkan untuk proses daur ulang atau biokonversi.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-[#4F46E5]">
                  Konsolidasi material
                </div>
              </div>

              {/* Stepper 5 */}
              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 space-y-2 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#009B63] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-teal-200">
                    Tahap 5
                  </span>
                  <h4 className="font-bold text-xs text-[#142B36] mt-2">Penyaluran ke Mitra UMKM</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                    Material yang memenuhi standar disalurkan ke mitra pengolah dan UMKM binaan.
                  </p>
                </div>
                <div className="pt-2 text-[10px] font-semibold text-[#009B63]">
                  Nilai ekonomi sirkular
                </div>
              </div>
            </div>

            {/* 3 Potensi Hasil Olahan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-slate-100">
              <div className="p-4.5 rounded-2xl border border-emerald-100 bg-[#F3FAF6] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#006B45]">
                  <Leaf className="h-4 w-4" />
                  <span>Pengolahan Organik</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Disalurkan ke pembudidaya Maggot BSF dan fasilitas pengomposan desa untuk pakan ternak dan pupuk organik.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl border border-sky-100 bg-sky-50/50 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#0284C7]">
                  <Recycle className="h-4 w-4" />
                  <span>Daur Ulang Plastik & Kertas</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pencacahan botol PET menjadi pelet murni dan pemanfaatan kardus terlipat untuk bubur kertas pengrajin lokal.
                </p>
              </div>

              <div className="p-4.5 rounded-2xl border border-amber-100 bg-[#FFF9ED] space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-[#D97706]">
                  <Building2 className="h-4 w-4" />
                  <span>Kemitraan Bank Sampah</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Mendukung legalitas dan kapasitas Bank Sampah desa dengan integrasi pencatatan digital transaksi serah terima material yang sah.
                </p>
              </div>
            </div>

            {/* Transparent Status Note */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-500 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-[#006B45] shrink-0 mt-0.5" />
              <span>
                <strong>Catatan Tata Kelola Kemitraan:</strong> Seluruh pencatatan penimbangan awal dan penerbitan poin warga telah berjalan penuh pada sistem. Penyaluran material hilir ke mitra pengolah dipersiapkan melalui proses verifikasi kesepakatan kerjasama (MoU) resmi binaan pemerintah daerah secara bertahap.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CALL TO ACTION SECTION */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-[#006B45] via-[#009B63] to-[#004D31] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#16A765]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-semibold text-[#DDF7EA] border border-white/20 backdrop-blur-xs">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Mulai Gerakan Lingkungan Bersih Sekarang</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Mulai Kelola Sampah dengan Lebih Cerdas
          </h2>

          <p className="text-xs sm:text-sm text-[#DDF7EA] leading-relaxed max-w-2xl mx-auto">
            Bergabunglah bersama komunitas warga bijak sampah. Ajukan penjemputan dari rumah, dapatkan poin reward nyata, dan berkontribusi langsung pada ekonomi sirkular.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href={isAuthenticated ? '/warga/ajukan' : '/login?redirect=/warga/ajukan'}>
              <Button className="w-full sm:w-auto bg-white hover:bg-[#DDF7EA] text-[#006B45] font-extrabold text-sm h-12 px-8 rounded-2xl shadow-xl gap-2.5 transition-all">
                <CalendarPlus className="h-4.5 w-4.5 text-[#006B45]" />
                <span>Ajukan Penjemputan Sekarang</span>
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white text-[#006B45] hover:bg-emerald-50 border border-transparent font-bold text-sm h-12 px-7 rounded-2xl shadow-md transition-all"
              >
                <span>Masuk ke Akun Anda</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-[#142B36] text-white pt-14 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Kolom 1: WasteWise */}
            <div className="space-y-4 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#006B45] to-[#009B63] p-1.5 flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight text-white">
                  Waste<span className="text-[#009B63]">Wise</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inovasi platform penjemputan sampah cerdas berbasis pemilahan AI, verifikasi timbangan digital, dan hilirisasi ekonomi sirkular desa.
              </p>
              <div className="flex items-center gap-2 text-xs text-[#009B63] font-semibold">
                <span className="h-2 w-2 rounded-full bg-[#009B63] animate-pulse" />
                <span>Sistem Operasional Aktif</span>
              </div>
            </div>

            {/* Kolom 2: Jelajahi */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Jelajahi
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#ekosistem" className="hover:text-white transition-colors">4 Pilar Ekosistem</a>
                </li>
                <li>
                  <a href="#cara-kerja" className="hover:text-white transition-colors">5 Tahap Alur Layanan</a>
                </li>
                <li>
                  <a href="#maggot-bsf" className="hover:text-white transition-colors">Biokonversi BSF</a>
                </li>
                <li>
                  <a href="#peluang-ekonomi" className="hover:text-white transition-colors">Nilai Ekonomi</a>
                </li>
                <li>
                  <a href="#jenis-sampah" className="hover:text-white transition-colors">Kategori Sampah</a>
                </li>
                <li>
                  <a href="#umkm" className="hover:text-white transition-colors">Penyaluran UMKM</a>
                </li>
              </ul>
            </div>

            {/* Kolom 3: Layanan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Layanan
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <a href="#jenis-sampah" className="hover:text-white transition-colors">Pemilahan Berbasis AI</a>
                </li>
                <li>
                  <a href="#cara-kerja" className="hover:text-white transition-colors">Penjemputan Terjadwal</a>
                </li>
                <li>
                  <a href="#cara-kerja" className="hover:text-white transition-colors">Timbangan Digital Lapangan</a>
                </li>
                <li>
                  <a href="#peluang-ekonomi" className="hover:text-white transition-colors">Penukaran Reward Poin</a>
                </li>
              </ul>
            </div>

            {/* Kolom 4: Akses Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Akses Platform
              </h4>
              <ul className="space-y-2 text-xs text-slate-400">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">Portal Warga</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">Portal Petugas Lapangan</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">Portal Admin Operasional</Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">Portal Mitra Pengolah</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3 border-t border-slate-800">
            <p>© 2026 WasteWise. Inovasi Pengelolaan Sampah Cerdas dan Ekonomi Sirkular.</p>
            <div className="flex items-center gap-4 text-slate-400">
              <span>Solusi Ramah Lingkungan</span>
              <span>•</span>
              <span>Inovasi Teknologi Berkelanjutan</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 11. MODAL DETAIL EKOSISTEM INTERAKTIF */}
      {selectedEcosystem && (
        <Dialog open={Boolean(selectedEcosystem)} onOpenChange={(open) => !open && setSelectedEcosystem(null)}>
          <DialogContent className={selectedEcosystem.id === 'circular' ? "max-w-3xl p-0 overflow-hidden rounded-3xl border-slate-200" : "max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200"}>
            {selectedEcosystem.id === 'circular' ? (
              <div>
                <div className="bg-gradient-to-r from-[#006B45] via-[#009B63] to-[#16A765] text-white p-6 sm:p-7 relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 text-[#DDF7EA] px-2.5 py-0.5 rounded-full backdrop-blur-xs">
                      Pilar Utama Inovasi
                    </span>
                  </div>
                  <DialogTitle className="text-xl sm:text-3xl font-extrabold text-white">
                    Ekonomi Sirkular Berkelanjutan
                  </DialogTitle>
                  <DialogDescription className="text-xs sm:text-sm text-[#DDF7EA] mt-1.5 leading-relaxed">
                    Sirkulasi Nilai Tertutup: Mengolah Sampah Organik Menjadi Pakan Maggot, Sabun Alami, dan Pupuk Organik.
                  </DialogDescription>
                </div>

                <div className="p-6 space-y-6 max-h-[72vh] overflow-y-auto">
                  <div className="rounded-2xl border border-emerald-200 bg-[#F3FAF6] p-3 flex items-center justify-center">
                    <Image
                      src="/illustrations/circular-economy.svg"
                      alt="Ilustrasi Siklus Ekonomi Sirkular Terintegrasi"
                      width={600}
                      height={350}
                      unoptimized
                      className="w-full h-auto object-contain rounded-xl max-h-[280px]"
                    />
                  </div>

                  {/* Timeline 4 Tahap Sirkular */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-[#142B36] uppercase tracking-wider">
                      Timeline Alur Sirkular WasteWise
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                        <span className="text-[10px] font-black text-[#006B45] bg-white px-2 py-0.5 rounded-md">1. Pilah</span>
                        <p className="text-[11px] font-bold text-slate-800">Dapur Warga</p>
                        <p className="text-[10px] text-slate-500">Pemisahan bahan organik segar</p>
                      </div>
                      <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-1">
                        <span className="text-[10px] font-black text-[#0284C7] bg-white px-2 py-0.5 rounded-md">2. Jemput</span>
                        <p className="text-[11px] font-bold text-slate-800">Timbang Riil</p>
                        <p className="text-[10px] text-slate-500">Penerbitan poin instan warga</p>
                      </div>
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
                        <span className="text-[10px] font-black text-[#D97706] bg-white px-2 py-0.5 rounded-md">3. Bioproses</span>
                        <p className="text-[11px] font-bold text-slate-800">Maggot BSF</p>
                        <p className="text-[10px] text-slate-500">Penguraian biomasa 14-21 hari</p>
                      </div>
                      <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-center space-y-1">
                        <span className="text-[10px] font-black text-[#009B63] bg-white px-2 py-0.5 rounded-md">4. Nilai Baru</span>
                        <p className="text-[11px] font-bold text-slate-800">Hilirisasi</p>
                        <p className="text-[10px] text-slate-500">Pakan, sabun, & pupuk POC</p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Contoh Produk Turunan */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-bold text-[#142B36] uppercase tracking-wider">
                      Contoh Produk Turunan Nyata
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-xl border border-teal-200 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800 font-bold shrink-0">
                          🐔
                        </div>
                        <div>
                          <span className="text-xs font-bold text-teal-900 block">Maggot Segar & Kering</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Pakan berprotein tinggi 40-45% untuk pakan ayam dan budidaya ikan lele lokal.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-purple-200 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-800 font-bold shrink-0">
                          🧼
                        </div>
                        <div>
                          <span className="text-xs font-bold text-purple-900 block">Sabun Batang Minyak Maggot</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Contoh produk nyata pemanfaatan ekstraksi minyak biomassa kaya asam laurat alami.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-[#006B45] font-bold shrink-0">
                          🌱
                        </div>
                        <div>
                          <span className="text-xs font-bold text-emerald-900 block">Kasgot (Pupuk Organik Padat)</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Residu sisa biokonversi BSF yang kaya unsur hara untuk menyuburkan tanah pekarangan.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-xl border border-amber-200 flex items-start gap-3">
                        <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold shrink-0">
                          💧
                        </div>
                        <div>
                          <span className="text-xs font-bold text-amber-900 block">Potensi Pupuk Organik Cair (POC)</span>
                          <p className="text-[11px] text-slate-600 leading-relaxed">
                            Pengembangan nutrisi cair tanaman setelah proses ekstraksi dan uji kelayakan.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dampak Lingkungan & Nilai Ekonomi */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-[#006B45] block">Nilai Manfaat Lingkungan</span>
                      <p className="text-slate-600 leading-relaxed">
                        Mencegah pembusukan anaerobik di TPA yang memicu gas metana (CH₄), serta mendukung target Zero Waste to Landfill.
                      </p>
                    </div>
                    <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <span className="font-bold text-[#D97706] block">Nilai Manfaat Ekonomi</span>
                      <p className="text-slate-600 leading-relaxed">
                        Nilai ekonomi dihitung berdasarkan hasil produksi dan harga pasar aktual. Membuka peluang wirausaha desa dan menekan biaya pakan peternak.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => setSelectedEcosystem(null)}
                      className="bg-[#006B45] hover:bg-[#004D31] text-white text-xs font-bold px-6 h-10 rounded-xl"
                    >
                      Tutup Penjelasan
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className={\`p-6 \${selectedEcosystem.bgColor} border-b border-slate-200/60\`}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: selectedEcosystem.accentColor }}
                    />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Detail Pilar Ekosistem
                    </span>
                  </div>
                  <DialogTitle className="text-xl sm:text-2xl font-extrabold text-[#142B36]">
                    {selectedEcosystem.title}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-600 mt-1">
                    {selectedEcosystem.tagline}
                  </DialogDescription>
                </div>

                <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                  <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center p-3">
                    <Image
                      src={selectedEcosystem.illustration}
                      alt={selectedEcosystem.title}
                      width={320}
                      height={170}
                      unoptimized
                      className="object-contain"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#142B36] uppercase tracking-wider">
                      Alur & Mekanisme Kerja
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed bg-[#F3FAF6] p-3.5 rounded-xl border border-emerald-100">
                      {selectedEcosystem.process}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#142B36] uppercase tracking-wider">
                      Contoh Material yang Dikelola
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedEcosystem.materials.map((mat, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-slate-100">
                          <CheckCircle2 className="h-3.5 w-3.5 text-[#009B63] shrink-0" />
                          <span>{mat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                      <span className="font-bold text-[#006B45]">Dampak Lingkungan</span>
                      <p className="text-slate-600 leading-relaxed">{selectedEcosystem.environmentalImpact}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                      <span className="font-bold text-[#D97706]">Nilai Manfaat Ekonomi</span>
                      <p className="text-slate-600 leading-relaxed">{selectedEcosystem.economicValue}</p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <span className="font-bold text-[#142B36]">Peran Platform WasteWise</span>
                    <p className="text-slate-600 leading-relaxed">{selectedEcosystem.wasteWiseSupport}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Button
                      onClick={() => setSelectedEcosystem(null)}
                      variant="outline"
                      className="text-xs font-semibold"
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* 12. MODAL DETAIL KATEGORI SAMPAH */}
      {selectedCategory && (
        <Dialog open={Boolean(selectedCategory)} onOpenChange={(open) => !open && setSelectedCategory(null)}>
          <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-slate-200">
            <div className="p-6 bg-slate-50 border-b border-slate-200/80">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={selectedCategory.badgeVariant} className="text-xs">
                  {selectedCategory.points}
                </Badge>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold text-[#142B36]">
                {selectedCategory.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Panduan pemilahan resmi berstandar model klasifikasi WasteWise AI.
              </DialogDescription>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-white border border-slate-200 flex items-center justify-center p-3">
                <Image
                  src={selectedCategory.illustration}
                  alt={selectedCategory.title}
                  width={300}
                  height={160}
                  unoptimized
                  className="object-contain"
                />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#142B36] uppercase tracking-wider">
                  Contoh Material yang Diterima
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedCategory.materials.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                <span className="font-bold text-[#006B45]">Potensi & Manfaat Pengolahan</span>
                <p className="text-slate-600 leading-relaxed">{selectedCategory.benefits}</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                <span className="font-bold text-[#D97706] flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4" />
                  Peringatan Penanganan
                </span>
                <p className="text-slate-700 leading-relaxed font-medium">{selectedCategory.warnings}</p>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={() => setSelectedCategory(null)}
                  variant="outline"
                  className="text-xs font-semibold"
                >
                  Tutup Panduan
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
`;

fs.writeFileSync(path.resolve('web/src/app/page.tsx'), content, 'utf8');
console.log('Successfully written web/src/app/page.tsx, size:', content.length);
