"use client"

import React, { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { TypewriterEffect } from '@/components/ui/TypewriterEffect'
import {
  Leaf,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  User,
  ArrowLeft,
  Sparkles,
  Scale,
  Coins,
  Truck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function LoginFormContent() {
  const { signIn, signUp, isAuthenticated, role, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTarget = searchParams.get('redirect')

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login')

  // Form State
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Redirect jika sudah terautentikasi sesuai role dari database
  useEffect(() => {
    if (isAuthenticated && role) {
      if (redirectTarget && role === 'warga') {
        router.push(redirectTarget)
      } else {
        switch (role) {
          case 'admin':
            router.push('/admin')
            break
          case 'super_admin':
            router.push('/super-admin')
            break
          case 'petugas':
            router.push('/petugas')
            break
          case 'mitra':
            router.push('/mitra')
            break
          case 'warga':
            router.push(redirectTarget || '/warga')
            break
        }
      }
    }
  }, [isAuthenticated, role, router, redirectTarget])

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage('Silakan lengkapi email dan kata sandi Anda.')
      return
    }

    setIsSubmitting(true)
    const result = await signIn(email, password)
    setIsSubmitting(false)

    if (!result.success) {
      setErrorMessage(result.error || 'Autentikasi gagal. Periksa kembali email dan kata sandi Anda.')
      return
    }

    // Role-based redirect otomatis berdasarkan database PostgreSQL
    if (result.role === 'warga') router.push(redirectTarget || '/warga')
    else if (result.role === 'admin') router.push('/admin')
    else if (result.role === 'super_admin') router.push('/super-admin')
    else if (result.role === 'petugas') router.push('/petugas')
    else if (result.role === 'mitra') router.push('/mitra')
    else router.push('/')
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setSuccessMessage(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMessage('Lengkapi nama lengkap, email, dan kata sandi Anda.')
      return
    }

    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter demi keamanan akun.')
      return
    }

    setIsSubmitting(true)
    const result = await signUp(email, password, fullName)
    setIsSubmitting(false)

    if (!result.success) {
      setErrorMessage(result.error || 'Pendaftaran gagal. Silakan coba kembali.')
      return
    }

    if (result.hasSession) {
      setSuccessMessage('Pendaftaran berhasil! Akun Anda aktif dan sesi telah dibuat.')
      router.push(redirectTarget || '/warga')
      return
    }

    setSuccessMessage(
      'Pendaftaran berhasil! Akun warga Anda telah dibuat di database. Anda dapat langsung masuk sekarang.'
    )
    setActiveTab('login')
    setPassword('')
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F3FAF6] p-4 sm:p-6 lg:p-8">
      {/* 2-Column Responsive Card Container */}
      <div className="w-full max-w-5xl rounded-3xl overflow-hidden bg-white shadow-xl border border-emerald-100 grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* LEFT COLUMN: Visual Showcase (Deep Green Gradient & Eco Art) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#006B45] via-[#009B63] to-[#16A765] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          {/* Ambient circles for depth */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#DDF7EA]/15 rounded-full blur-2xl pointer-events-none" />

          {/* Top: Back to home & logo */}
          <div className="relative z-10 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#DDF7EA] hover:text-white transition-colors bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-xs w-fit"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kembali ke Beranda Utama</span>
            </Link>

            <div className="flex items-center gap-2.5 pt-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#006B45] shadow-md">
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-white leading-none block">
                  WasteWise
                </span>
                <span className="text-[10px] font-semibold text-[#DDF7EA] tracking-wider uppercase">
                  AI + Smart Waste Platform
                </span>
              </div>
            </div>
          </div>

          {/* Center: Headline, Typewriter & Hero Art */}
          <div className="relative z-10 my-6 space-y-4 text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug">
              Bersama WasteWise, Ubah Sampah Menjadi Nilai.
            </h2>

            {/* Typewriter text on supporting line */}
            <div className="min-h-[2.5rem] text-xs sm:text-sm font-medium text-[#DDF7EA] flex items-center">
              <TypewriterEffect
                words={[
                  'Pilah Cerdas dengan AI LiteRT',
                  'Timbang Akurat & Dapatkan Poin Reward',
                  'Jemput Sampah Terjadwal ke Rumah',
                  'Dukung Ekonomi Sirkular Desa',
                ]}
              />
            </div>

            {/* Vector Illustration */}
            <div className="relative h-44 sm:h-52 w-full flex items-center justify-center animate-float py-2">
              <Image
                src="/illustrations/login-hero.svg"
                alt="WasteWise Eco Illustration"
                width={360}
                height={260}
                unoptimized
                priority
                className="object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Bottom: Feature Chips */}
          <div className="relative z-10 pt-2 border-t border-white/15 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] font-bold text-white block">100% Transparan</span>
              <span className="text-[9px] text-[#DDF7EA]">Timbangan Digital</span>
            </div>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] font-bold text-white block">AI Verified</span>
              <span className="text-[9px] text-[#DDF7EA]">3 Kategori Utama</span>
            </div>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <span className="text-[10px] font-bold text-white block">Poin Reward</span>
              <span className="text-[9px] text-[#DDF7EA]">Tukar Hadiah</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Form Card (Clean, Minimal, Professional) */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between bg-white">
          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006B45] bg-[#DDF7EA] px-3 py-1 rounded-full mb-3">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Portal Akun Terpadu</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#142B36]">
                Selamat Datang Kembali
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Masuk untuk mengelola aktivitas dan penjemputan sampah Anda.
              </p>
            </div>

            {/* Tab Switcher: Masuk / Registrasi */}
            <div className="flex rounded-xl bg-[#F3FAF6] p-1 border border-emerald-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'login'
                    ? 'bg-white text-[#006B45] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Masuk ke Akun
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register')
                  setErrorMessage(null)
                  setSuccessMessage(null)
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'register'
                    ? 'bg-white text-[#006B45] shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Daftar Akun Warga
              </button>
            </div>

            {/* Error & Success Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl border border-red-200 bg-red-50 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form Masuk (Login) */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="pl-10 h-11 text-xs border-slate-200 focus:border-[#009B63] focus:ring-[#009B63] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi Anda"
                      className="pl-10 pr-10 h-11 text-xs border-slate-200 focus:border-[#009B63] focus:ring-[#009B63] rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#006B45] to-[#009B63] hover:from-[#005234] hover:to-[#007D4F] text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-emerald-800/15 gap-2 transition-all mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Memverifikasi Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Form Registrasi Warga Baru */}
            {activeTab === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Nama Lengkap
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nama lengkap Anda"
                      className="pl-10 h-11 text-xs border-slate-200 focus:border-[#009B63] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="pl-10 h-11 text-xs border-slate-200 focus:border-[#009B63] rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Kata Sandi (Min. 6 Karakter)
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Buat kata sandi akun"
                      className="pl-10 pr-10 h-11 text-xs border-slate-200 focus:border-[#009B63] rounded-xl"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#006B45] to-[#009B63] hover:from-[#005234] hover:to-[#007D4F] text-white font-bold text-xs h-11 rounded-xl shadow-md shadow-emerald-800/15 gap-2 transition-all mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Mendaftarkan Akun...</span>
                    </>
                  ) : (
                    <>
                      <span>Daftar Sebagai Warga</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="text-center mt-8 text-[11px] text-slate-400 border-t border-slate-100 pt-4">
            <p>© 2026 WasteWise Ecosystem. Platform AI + Smart Waste Management.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F3FAF6]">
          <Loader2 className="h-6 w-6 animate-spin text-[#006B45]" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  )
}
