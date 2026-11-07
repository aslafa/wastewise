"use client"

import React from 'react'

export type WawiMood = 'idle' | 'wave' | 'happy' | 'thinking' | 'bounce'

interface WawiCharacterProps {
  mood?: WawiMood
  size?: number
  className?: string
  showBadge?: boolean
  onClick?: () => void
}

export function WawiCharacter({
  mood = 'idle',
  size = 110,
  className = '',
  showBadge = true,
  onClick,
}: WawiCharacterProps) {
  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`relative select-none transition-transform duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
      title="WAWI — Maskot Resmi WasteWise"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          {/* Body Gradient: Emerald Fresh */}
          <linearGradient id="wawiBodyGrad" x1="50" y1="30" x2="150" y2="180" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          {/* Belly Highlight: Soft Mint Cream */}
          <linearGradient id="wawiBellyGrad" x1="100" y1="100" x2="100" y2="160" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ECFDF5" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.8" />
          </linearGradient>

          {/* Sprout Leaves Gradient: Vibrant Lime/Gold Leaf */}
          <linearGradient id="wawiSproutGrad" x1="100" y1="10" x2="100" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="40%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          {/* Cheek Blush */}
          <radialGradient id="wawiCheekGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </radialGradient>

          {/* Recycle Badge Gold Rim */}
          <linearGradient id="wawiGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>

          {/* Soft Ground Shadow */}
          <radialGradient id="wawiShadowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0F172A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
          </radialGradient>
        </defs>

        <style>{`
          /* Idle gentle breathing */
          @keyframes wawiIdleBody {
            0%, 100% { transform: translateY(0px) scale(1, 1); }
            50% { transform: translateY(-4px) scale(1.02, 0.98); }
          }
          /* Head twin sprout sway */
          @keyframes wawiSproutSway {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(6deg); }
          }
          /* Regular eye blink */
          @keyframes wawiEyeBlink {
            0%, 88%, 100% { transform: scaleY(1); }
            94% { transform: scaleY(0.12); }
          }
          /* Wave hand */
          @keyframes wawiWaveArm {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-32deg); }
            75% { transform: rotate(18deg); }
          }
          /* Happy energetic jump */
          @keyframes wawiHappyJump {
            0%, 100% { transform: translateY(0px) scale(1, 1); }
            30% { transform: translateY(-16px) scale(1.04, 0.96); }
            55% { transform: translateY(-20px) scale(0.96, 1.04); }
            80% { transform: translateY(0px) scale(1.08, 0.92); }
          }
          /* Thinking tilt and hand on chin */
          @keyframes wawiThinkingTilt {
            0%, 100% { transform: rotate(0deg); }
            50% { transform: rotate(-8deg) translateY(-2px); }
          }
          /* Sparkles float */
          @keyframes wawiSparkleFloat {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            50% { transform: translateY(-8px) scale(1.2); opacity: 1; }
            100% { transform: translateY(-16px) scale(0.8); opacity: 0; }
          }
          /* Bounce on open */
          @keyframes wawiBounceEntry {
            0% { transform: scale(0.8) translateY(10px); }
            50% { transform: scale(1.12) translateY(-8px); }
            75% { transform: scale(0.95) translateY(2px); }
            100% { transform: scale(1) translateY(0); }
          }

          .wawi-anim-idle { animation: wawiIdleBody 3.2s ease-in-out infinite; transform-origin: 100px 170px; }
          .wawi-anim-sprout { animation: wawiSproutSway 2.8s ease-in-out infinite; transform-origin: 100px 52px; }
          .wawi-anim-eyes { animation: wawiEyeBlink 4.5s ease-in-out infinite; transform-origin: 100px 92px; }
          .wawi-anim-wave-arm { animation: wawiWaveArm 0.9s ease-in-out infinite; transform-origin: 148px 115px; }
          .wawi-anim-happy { animation: wawiHappyJump 0.85s ease-in-out infinite; transform-origin: 100px 170px; }
          .wawi-anim-thinking { animation: wawiThinkingTilt 2.2s ease-in-out infinite; transform-origin: 100px 150px; }
          .wawi-anim-bounce { animation: wawiBounceEntry 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; transform-origin: 100px 150px; }
          .wawi-sparkle-1 { animation: wawiSparkleFloat 1.8s ease-in-out infinite; }
          .wawi-sparkle-2 { animation: wawiSparkleFloat 2.1s ease-in-out infinite 0.6s; }

          @media (prefers-reduced-motion: reduce) {
            .wawi-anim-idle, .wawi-anim-sprout, .wawi-anim-eyes, .wawi-anim-wave-arm,
            .wawi-anim-happy, .wawi-anim-thinking, .wawi-anim-bounce, .wawi-sparkle-1, .wawi-sparkle-2 {
              animation: none !important;
            }
          }
        `}</style>

        {/* 1. Ground Shadow (Reacts to Jump) */}
        <ellipse
          cx="100"
          cy="184"
          rx={mood === 'happy' ? '36' : '52'}
          ry={mood === 'happy' ? '8' : '11'}
          fill="url(#wawiShadowGrad)"
          className="transition-all duration-300"
        />

        {/* 2. Character Body Assembly Group */}
        <g
          className={
            mood === 'happy'
              ? 'wawi-anim-happy'
              : mood === 'thinking'
              ? 'wawi-anim-thinking'
              : mood === 'bounce'
              ? 'wawi-anim-bounce'
              : 'wawi-anim-idle'
          }
        >
          {/* Left Foot */}
          <ellipse cx="76" cy="170" rx="16" ry="10" fill="#047857" stroke="#065F46" strokeWidth="2" />
          <ellipse cx="74" cy="168" rx="9" ry="4.5" fill="#10B981" opacity="0.6" />

          {/* Right Foot */}
          <ellipse cx="124" cy="170" rx="16" ry="10" fill="#047857" stroke="#065F46" strokeWidth="2" />
          <ellipse cx="122" cy="168" rx="9" ry="4.5" fill="#10B981" opacity="0.6" />

          {/* Main Chubby Body (Rotund volumetric organic pear shape) */}
          <path
            d="M100 48 C144 48 168 76 166 118 C164 156 138 172 100 172 C62 172 36 156 34 118 C32 76 56 48 100 48 Z"
            fill="url(#wawiBodyGrad)"
            stroke="#047857"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Body Top Highlight (3D Soft Rim Light) */}
          <path
            d="M68 62 C80 52 120 52 132 62 C116 58 84 58 68 62 Z"
            fill="#A7F3D0"
            opacity="0.85"
          />

          {/* Soft Cream Belly Patch (Wider, rounder) */}
          <ellipse cx="100" cy="126" rx="40" ry="34" fill="url(#wawiBellyGrad)" />

          {/* Chest Badge: 3-Arrow Circular Recycle Icon (Emblem Daur Ulang) */}
          {showBadge && (
            <g transform="translate(100, 136)">
              <circle cx="0" cy="0" r="15" fill="#FFFFFF" stroke="url(#wawiGoldRim)" strokeWidth="2" />
              {/* Green Recycle Symbol inside badge */}
              <g transform="scale(0.9) translate(-12, -12)">
                <path
                  d="M12 4 L14.5 8 H9.5 Z M12 6 C15.5 6 18.5 8.5 19.5 12 L17.5 12.5 C16.7 9.8 14.5 8 12 8 Z"
                  fill="#006B45"
                />
                <path
                  d="M19 14 L20.5 18.5 L16.5 17 Z M19.5 16 C18 19 15 21 11.5 20.8 L11.7 18.8 C14.4 19 16.8 17.5 18 15 Z"
                  fill="#009B63"
                />
                <path
                  d="M5 14 L8.5 12.5 L7 17 Z M6 13.5 C6.5 10.5 9 8.2 12 7.8 L11.8 9.8 C9.5 10.1 7.7 11.8 7.3 14 Z"
                  fill="#16A765"
                />
              </g>
            </g>
          )}

          {/* Cheek Blush (Pipi Merona Merah Muda) */}
          <ellipse cx="64" cy="108" rx="10" ry="6" fill="url(#wawiCheekGrad)" />
          <ellipse cx="136" cy="108" rx="10" ry="6" fill="url(#wawiCheekGrad)" />

          {/* Eyes (Mata Besar Ekspresif & Berkedip) */}
          <g className="wawi-anim-eyes">
            {mood === 'happy' ? (
              /* Happy Curved Eyes (Mata Tersenyum) */
              <g stroke="#064E3B" strokeWidth="4.5" strokeLinecap="round" fill="none">
                <path d="M66 94 Q75 83 84 94" />
                <path d="M116 94 Q125 83 134 94" />
              </g>
            ) : mood === 'thinking' ? (
              /* Thinking Eyes (Melirik ke atas-kanan) */
              <g>
                {/* Left Eye */}
                <ellipse cx="74" cy="94" rx="11" ry="14" fill="#064E3B" />
                <circle cx="77" cy="89" r="5" fill="#FFFFFF" />
                <circle cx="72" cy="98" r="2" fill="#FFFFFF" />
                {/* Right Eye */}
                <ellipse cx="126" cy="94" rx="11" ry="14" fill="#064E3B" />
                <circle cx="129" cy="89" r="5" fill="#FFFFFF" />
                <circle cx="124" cy="98" r="2" fill="#FFFFFF" />
              </g>
            ) : (
              /* Normal Big Expressive Eyes */
              <g>
                {/* Left Eye */}
                <ellipse cx="74" cy="94" rx="11" ry="14" fill="#064E3B" />
                <circle cx="72" cy="89" r="5" fill="#FFFFFF" />
                <circle cx="78" cy="98" r="2.2" fill="#FFFFFF" />
                <ellipse cx="74" cy="93" rx="4.5" ry="6.5" fill="#10B981" opacity="0.35" />

                {/* Right Eye */}
                <ellipse cx="126" cy="94" rx="11" ry="14" fill="#064E3B" />
                <circle cx="124" cy="89" r="5" fill="#FFFFFF" />
                <circle cx="130" cy="98" r="2.2" fill="#FFFFFF" />
                <ellipse cx="126" cy="93" rx="4.5" ry="6.5" fill="#10B981" opacity="0.35" />
              </g>
            )}
          </g>

          {/* Mouth / Smile */}
          {mood === 'happy' ? (
            /* Big Joyful Open Mouth */
            <g transform="translate(100, 108)">
              <path d="M-13 0 Q0 17 13 0 Z" fill="#BE123C" stroke="#064E3B" strokeWidth="2.5" />
              <path d="M-7 4 Q0 13 7 4 Q0 8.5 -7 4 Z" fill="#FB7185" />
            </g>
          ) : mood === 'thinking' ? (
            /* Pouty / Curious Small O-Mouth */
            <ellipse cx="100" cy="111" rx="4" ry="5" fill="#064E3B" />
          ) : (
            /* Sweet Cheerful Curved Smile */
            <path
              d="M90 106 Q100 116 110 106"
              stroke="#064E3B"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Left Arm: Holding Mini Green Sprout Leaf */}
          <g transform="translate(42, 118)">
            <ellipse cx="0" cy="0" rx="10" ry="8" fill="#10B981" stroke="#047857" strokeWidth="2" />
            {/* Small Fresh Dew Leaf being held */}
            <path
              d="M-5 -2 C-15 -8 -19 -20 -11 -22 C-3 -24 1 -12 -5 -2 Z"
              fill="#34D399"
              stroke="#059669"
              strokeWidth="1.5"
            />
            <path d="M-5 -2 Q-9 -14 -11 -22" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
            <circle cx="-9" cy="-14" r="1.5" fill="#FFFFFF" opacity="0.9" />
          </g>

          {/* Right Arm: Idle or Waving */}
          {mood === 'wave' ? (
            <g className="wawi-anim-wave-arm">
              {/* Raised arm waving */}
              <path
                d="M158 116 Q174 96 174 74"
                stroke="#10B981"
                strokeWidth="15"
                strokeLinecap="round"
              />
              <path
                d="M158 116 Q174 96 174 74"
                stroke="#047857"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Cute Little Hand Mitt */}
              <circle cx="174" cy="72" r="8.5" fill="#10B981" stroke="#047857" strokeWidth="2" />
              {/* Friendly greeting lines */}
              <path d="M184 66 Q190 70 186 76" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M188 60 Q196 66 192 74" stroke="#10B981" strokeWidth="2" strokeLinecap="round" fill="none" />
            </g>
          ) : mood === 'thinking' ? (
            /* Arm touching chin thoughtfully */
            <g>
              <path
                d="M158 120 Q144 123 118 115"
                stroke="#10B981"
                strokeWidth="13"
                strokeLinecap="round"
              />
              <circle cx="116" cy="115" r="7.5" fill="#10B981" stroke="#047857" strokeWidth="2" />
            </g>
          ) : (
            /* Normal Resting Right Hand */
            <g transform="translate(158, 118)">
              <ellipse cx="0" cy="0" rx="10" ry="8" fill="#10B981" stroke="#047857" strokeWidth="2" />
            </g>
          )}

          {/* Head Twin Sprout Leaf (Tunas Daun Kembar yang Bergoyang) */}
          <g className="wawi-anim-sprout">
            {/* Stem */}
            <path d="M100 48 Q100 34 100 26" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" />
            {/* Left Leaf Sprout */}
            <path
              d="M100 28 C86 24 78 10 90 6 C102 2 102 20 100 28 Z"
              fill="url(#wawiSproutGrad)"
              stroke="#047857"
              strokeWidth="2"
            />
            {/* Right Leaf Sprout */}
            <path
              d="M100 28 C114 24 122 10 110 6 C98 2 98 20 100 28 Z"
              fill="url(#wawiSproutGrad)"
              stroke="#047857"
              strokeWidth="2"
            />
            {/* Dew drop highlight on leaf */}
            <circle cx="93" cy="12" r="2" fill="#FFFFFF" opacity="0.9" />
          </g>
        </g>

        {/* 3. Floating Reaction Overlays for Specific Moods */}
        {mood === 'happy' && (
          <g>
            {/* Confetti / Golden Stars */}
            <g className="wawi-sparkle-1" transform="translate(42, 60)">
              <polygon points="0,-6 2,-2 6,0 2,2 0,6 -2,2 -6,0 -2,-2" fill="#F59E0B" />
            </g>
            <g className="wawi-sparkle-2" transform="translate(158, 50)">
              <polygon points="0,-7 2.5,-2.5 7,0 2.5,2.5 0,7 -2.5,2.5 -7,0 -2.5,-2.5" fill="#10B981" />
            </g>
            <g className="wawi-sparkle-1" transform="translate(170, 95)">
              <circle cx="0" cy="0" r="3.5" fill="#FDE047" />
            </g>
          </g>
        )}

        {mood === 'thinking' && (
          <g className="wawi-sparkle-1" transform="translate(145, 35)">
            {/* Thought bubble with leaf / question mark */}
            <circle cx="0" cy="14" r="3" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
            <circle cx="8" cy="6" r="5" fill="#D1FAE5" stroke="#10B981" strokeWidth="1" />
            <rect x="12" y="-18" width="28" height="22" rx="8" fill="#FFFFFF" stroke="#009B63" strokeWidth="2" />
            <text x="26" y="-3" fill="#006B45" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="900" textAnchor="middle">
              ?
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

