"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Coins, Sparkles, Heart, ArrowRight } from 'lucide-react'
import { WawiCharacter, WawiMood } from './WawiCharacter'

interface HeroWawiCardProps {
  className?: string
}

export function HeroWawiCard({ className = '' }: HeroWawiCardProps) {
  const [mood, setMood] = useState<WawiMood>('wave')
  const [speech, setSpeech] = useState<string>('Halo! Aku WAWI, sahabat pilah sampahmu 🌱')
  const [heartsCount, setHeartsCount] = useState<number>(128)
  const [isLoved, setIsLoved] = useState<boolean>(false)

  const handleMoodChange = (newMood: WawiMood, text: string) => {
    setMood(newMood)
    setSpeech(text)
  }

  const handleHeartClick = () => {
    if (!isLoved) {
      setHeartsCount((prev) => prev + 1)
      setIsLoved(true)
      setMood('happy')
      setSpeech('Terima kasih banyak! Ayo semangat jaga bumi! 💚✨')
    } else {
      setHeartsCount((prev) => prev - 1)
      setIsLoved(false)
    }
  }

  return (
    <div className={`relative w-full max-w-[440px] mx-auto ${className}`}>
      {/* Decorative ambient backdrop */}
      <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-[#DDF7EA] via-emerald-50 to-white rounded-3xl -rotate-1 scale-95 border border-emerald-200/80 shadow-md -z-10" />

      {/* Main Showcase Card Frame */}
      <div className="relative w-full bg-white rounded-3xl border border-emerald-200 p-4 sm:p-5 shadow-xl shadow-emerald-900/5 flex flex-col gap-3.5">
        
        {/* 1. Header informasi WasteWise dan jumlah likes */}
        <div className="flex items-center justify-between pb-2.5 border-b border-emerald-100">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#006B45]">
              Maskot Resmi WasteWise
            </span>
          </div>
          <button
            type="button"
            onClick={handleHeartClick}
            className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full transition-all duration-200 ${
              isLoved
                ? 'bg-rose-100 text-rose-700 shadow-xs scale-105'
                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
            title="Beri apresiasi untuk WAWI"
          >
            <Heart className={`h-3.5 w-3.5 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{heartsCount}</span>
          </button>
        </div>

        {/* 2. Kartu Reward Baru (Posisi Normal Flow / Bebas Tabrakan) */}
        <div className="w-full bg-gradient-to-r from-amber-50 to-amber-100/60 border border-amber-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center text-white shadow-xs shrink-0">
              <Coins className="h-4.5 w-4.5" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider block">
                Reward Baru
              </span>
              <span className="text-xs sm:text-sm font-black text-[#92400E] tracking-tight block">
                +100 Poin / Kg Sampah
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full shrink-0 border border-amber-300/50">
            Bonus Aktif
          </span>
        </div>

        {/* Area Panggung Maskot & Tombol Interaksi */}
        <div className="relative w-full rounded-2xl bg-gradient-to-b from-[#F3FAF6] to-emerald-50/50 border border-emerald-100/90 p-3.5 sm:p-4 flex flex-col items-center justify-between gap-3 overflow-hidden">
          
          {/* 3. Bubble Sapaan WAWI */}
          <div className="relative z-10 w-full max-w-[290px] bg-white rounded-2xl border border-emerald-200/90 px-3.5 py-2 shadow-xs text-center">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              {speech}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-200/90 rotate-45" />
          </div>

          {/* 4. Karakter WAWI (Tetap Besar, Dominan & Proporsional: size 205) */}
          <div
            className="my-1 cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center"
            onClick={() => handleMoodChange(mood === 'happy' ? 'wave' : 'happy', 'Asyik! Kamu menyapa WAWI! 🎉')}
            title="Klik WAWI untuk bereaksi!"
          >
            <WawiCharacter mood={mood} size={205} />
          </div>

          {/* 5. Tombol Interaksi (Sapa, Rayakan, Tips Pilah) */}
          <div className="relative z-10 flex items-center justify-center gap-2 w-full pt-0.5">
            <button
              type="button"
              onClick={() => handleMoodChange('wave', 'Halo! Senang bertemu denganmu di WasteWise! 👋')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                mood === 'wave'
                  ? 'bg-[#006B45] text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200/80'
              }`}
            >
              👋 Sapa
            </button>
            <button
              type="button"
              onClick={() => handleMoodChange('happy', 'Hore! Setiap pilahan sampah menyelamatkan bumi! 🌟')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                mood === 'happy'
                  ? 'bg-[#009B63] text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200/80'
              }`}
            >
              🎉 Rayakan
            </button>
            <button
              type="button"
              onClick={() => handleMoodChange('thinking', 'Hmm... Jangan campur botol plastik dan sisa makanan ya! 💡')}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all text-center ${
                mood === 'thinking'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-slate-700 border border-emerald-200/80'
              }`}
            >
              💡 Tips Pilah
            </button>
          </div>
        </div>

        {/* 6. Informasi Klasifikasi AI (Posisi Normal Flow di Bawah Panggung) */}
        <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50/70 border border-emerald-200/90 rounded-2xl p-2.5 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-[#009B63] flex items-center justify-center text-white shadow-xs shrink-0">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <div className="truncate text-left">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                Klasifikasi AI
              </span>
              <span className="text-xs sm:text-sm font-black text-[#006B45] tracking-tight block">
                AI: Organik 98% Valid
              </span>
            </div>
          </div>
          <Link href="/warga/klasifikasi" className="shrink-0">
            <span className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-white border border-emerald-200 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all shadow-2xs hover:shadow-xs">
              Buka AI Scanner
              <ArrowRight className="h-3 w-3" />
            </span>
          </Link>
        </div>

      </div>
    </div>
  )
}
