"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { Coins, Sparkles, Heart, Bot, HelpCircle, ArrowRight } from 'lucide-react'
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
    <div className={`relative w-full max-w-md p-3 sm:p-4 ${className}`}>
      {/* Decorative ambient backdrop */}
      <div className="absolute inset-2 sm:inset-3 bg-gradient-to-br from-[#DDF7EA] via-emerald-50 to-white rounded-3xl -rotate-2 scale-95 border border-emerald-200/80 shadow-md -z-10" />

      {/* Main Showcase Card Frame */}
      <div className="relative w-full bg-white rounded-3xl border border-emerald-200 p-5 sm:p-6 shadow-xl shadow-emerald-900/5">
        {/* Subtle Top Accent Ribbon */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-emerald-100/70">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#006B45]">
              Maskot Resmi WasteWise
            </span>
          </div>
          <button
            onClick={handleHeartClick}
            className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full transition-all duration-200 ${
              isLoved
                ? 'bg-rose-100 text-rose-700 shadow-xs scale-105'
                : 'bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600'
            }`}
            title="Beri cinta untuk Wawi"
          >
            <Heart className={`h-3.5 w-3.5 ${isLoved ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{heartsCount}</span>
          </button>
        </div>

        {/* Mascot Center Stage with Speech Bubble */}
        <div className="relative h-[310px] sm:h-[340px] w-full rounded-2xl bg-gradient-to-b from-[#F3FAF6] to-emerald-50/40 border border-emerald-100/90 flex flex-col items-center justify-between p-3.5 sm:p-4 overflow-hidden">
          {/* Speech Bubble */}
          <div className="relative z-10 w-full max-w-[270px] bg-white/95 backdrop-blur-xs rounded-2xl border border-emerald-200/80 px-3 py-2 shadow-sm text-center transition-all duration-300 animate-fade-in shrink-0">
            <p className="text-xs font-bold text-slate-800 leading-snug">
              {speech}
            </p>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-emerald-200/80 rotate-45" />
          </div>

          {/* Central Interactive WAWI Character (Enlarged & Dominant) */}
          <div className="my-auto cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center" onClick={() => handleMoodChange(mood === 'happy' ? 'wave' : 'happy', 'Asyik! Kamu mengklik WAWI! 🎉')}>
            <WawiCharacter mood={mood} size={205} />
          </div>

          {/* Interactive Mood Reaction Buttons */}
          <div className="relative z-10 flex items-center justify-center gap-1.5 w-full pt-1 shrink-0">
            <button
              onClick={() => handleMoodChange('wave', 'Halo! Senang bertemu denganmu di WasteWise! 👋')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mood === 'wave'
                  ? 'bg-[#006B45] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-emerald-200/60'
              }`}
            >
              👋 Sapa
            </button>
            <button
              onClick={() => handleMoodChange('happy', 'Hore! Setiap pilahan sampah menyelamatkan bumi! 🌟')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mood === 'happy'
                  ? 'bg-[#009B63] text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-emerald-200/60'
              }`}
            >
              🎉 Rayakan
            </button>
            <button
              onClick={() => handleMoodChange('thinking', 'Hmm... Jangan campur botol plastik dengan sisa sayur ya! 💡')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                mood === 'thinking'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-emerald-200/60'
              }`}
            >
              💡 Tips Pilah
            </button>
          </div>
        </div>

        {/* Floating Badge Top-Left: +100 Poin Organik */}
        <div className="absolute top-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-amber-200 px-3.5 py-2 shadow-lg flex items-center gap-2.5 animate-float z-20">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-[#D97706] to-[#F59E0B] flex items-center justify-center text-white shadow-xs">
            <Coins className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold text-slate-400 block uppercase">Reward Baru</span>
            <span className="text-xs font-black text-[#92400E]">+100 Poin / Kg</span>
          </div>
        </div>

        {/* Floating Badge Bottom-Right: AI Classifier Valid */}
        <div className="absolute bottom-2 -right-2 sm:-right-4 bg-white/95 backdrop-blur-xs rounded-2xl border border-emerald-200 px-3.5 py-2 shadow-lg flex items-center gap-2.5 animate-float-slow z-20">
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
  )
}
