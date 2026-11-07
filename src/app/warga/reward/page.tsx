"use client"

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { wasteService } from '@/services/wasteService'
import { DbReward } from '@/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Gift,
  Coins,
  CheckCircle2,
  Sparkles,
  ShoppingBag,
  Zap,
  TreePine,
  Receipt,
  AlertCircle,
  Copy,
  Check,
  Loader2,
  Database,
  ArrowRight,
} from 'lucide-react'

export default function WargaRewardPage() {
  const { profile, refreshProfile } = useAuth()
  const points = profile?.points_balance ?? 0

  const [rewards, setRewards] = useState<DbReward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLive, setIsLive] = useState(false)

  // Redemption state
  const [redeemingId, setRedeemingId] = useState<string | null>(null)
  const [claimedCode, setClaimedCode] = useState<string | null>(null)
  const [claimedTitle, setClaimedTitle] = useState('')
  const [claimedPointsSpent, setClaimedPointsSpent] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function loadRewards() {
      setIsLoading(true)
      try {
        const res = await wasteService.getRewardsCatalog()
        if (isMounted) {
          setRewards(res.rewards)
          setIsLive(res.isLive)
        }
      } catch (err) {
        console.warn('Gagal memuat katalog reward:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRewards()

    return () => {
      isMounted = false
    }
  }, [])

  const getRewardIcon = (type: DbReward['reward_type'], title: string) => {
    if (title.toLowerCase().includes('listrik') || title.toLowerCase().includes('pln')) return Zap
    if (type === 'donasi_pohon') return TreePine
    if (type === 'diskon_jasa') return Receipt
    return ShoppingBag
  }

  const handleClaim = async (item: DbReward) => {
    setErrorMessage(null)

    if (points < item.points_required) {
      setErrorMessage(`Saldo poin Anda (${points.toLocaleString('id-ID')} Poin) belum mencukupi untuk reward ini (${item.points_required.toLocaleString('id-ID')} Poin). Pilah dan setor lebih banyak sampah!`)
      return
    }

    if (item.stock_quantity <= 0) {
      setErrorMessage(`Maaf, stok untuk reward "${item.title}" saat ini sedang kosong.`)
      return
    }

    const userId = profile?.id
    if (!userId) {
      setErrorMessage('Sesi akun nasabah tidak ditemukan. Silakan login kembali.')
      return
    }

    setRedeemingId(item.id)

    try {
      const res = await wasteService.redeemReward(item.id, userId)

      if (res.success && res.redemptionCode) {
        setClaimedCode(res.redemptionCode)
        setClaimedTitle(item.title)
        setClaimedPointsSpent(item.points_required)

        // Perbarui stok lokal seketika
        setRewards(prev =>
          prev.map(r => r.id === item.id ? { ...r, stock_quantity: Math.max(0, r.stock_quantity - 1) } : r)
        )

        // Segarkan data profil auth di context
        await refreshProfile()
      } else {
        setErrorMessage(res.error || 'Gagal memproses penukaran reward.')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setErrorMessage(`Terjadi kesalahan: ${msg}`)
    } finally {
      setRedeemingId(null)
    }
  }

  const handleCopyCode = () => {
    if (claimedCode && typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(claimedCode)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Point Balance Banner */}
      <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50/50 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Katalog Poin & Reward Lingkungan
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Tukarkan Sampah Terpilah Menjadi Hadiah
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Poin Anda dihimpun dari setiap kilogram sampah yang berhasil diverifikasi resmi oleh petugas Bank Sampah.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-xs flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <Coins className="h-5 w-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Saldo Poin Aktif</div>
            <div className="text-xl font-extrabold text-slate-900">
              {points.toLocaleString('id-ID')}{' '}
              <span className="text-xs font-semibold text-amber-700">Poin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Database Connection Indicator */}
      <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
        isLive
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}>
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>
            {isLive
              ? 'Katalog reward dan penukaran saldo terhubung langsung dengan sistem Bank Sampah resmi.'
              : 'Memuat katalog resmi Bank Sampah WasteWise.'}
          </span>
        </div>
        <Badge variant="outline" className={isLive ? 'border-emerald-300 text-emerald-800 font-bold text-[10px]' : 'border-amber-300 text-amber-800 font-bold text-[10px]'}>
          {isLive ? 'KATALOG LIVE' : 'TERHUBUNG'}
        </Badge>
      </div>

      {/* Error Message Alert */}
      {errorMessage && (
        <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-start gap-3 animate-in fade-in duration-200">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Penukaran Belum Dapat Diproses:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold text-rose-700 hover:text-rose-900"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Claimed Voucher Modal / Notification */}
      {claimedCode && (
        <div className="p-5 rounded-2xl border-2 border-emerald-400 bg-emerald-50/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-0.5">
              <div className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                <span>Penukaran Berhasil! ({claimedTitle})</span>
                <Badge className="bg-emerald-600 text-white text-[10px]">Terkonfirmasi</Badge>
              </div>
              <p className="text-xs text-emerald-800">
                Poin Anda telah dipotong sebesar <strong>{claimedPointsSpent} Poin</strong> secara atomik ke buku besar transaksi. Tunjukkan kode voucher ini kepada mitra:
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-emerald-300 shrink-0 shadow-xs">
            <span className="font-mono text-sm font-extrabold text-slate-900 tracking-wider">
              {claimedCode}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyCode}
              className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-700"
              title="Salin Kode Voucher"
            >
              {isCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(idx => (
            <Card key={idx} className="border-slate-200/80 animate-pulse">
              <CardContent className="p-6 space-y-4">
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-2/3" />
                <div className="h-12 bg-slate-100 rounded w-full" />
                <div className="h-10 bg-slate-200 rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : rewards.length === 0 ? (
        <Card className="border-dashed border-slate-300 bg-white/70">
          <CardContent className="p-8 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 mx-auto">
              <Gift className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">Katalog Reward Sedang Diperbarui</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Admin sedang menyiapkan penawaran reward menarik berikutnya. Saldo poin Anda tetap aman di buku besar digital.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Reward Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rewards.map((item) => {
            const Icon = getRewardIcon(item.reward_type, item.title)
            const canAfford = points >= item.points_required
            const hasStock = item.stock_quantity > 0
            const isRedeemingThis = redeemingId === item.id

            return (
              <Card
                key={item.id}
                className={`border transition-all flex flex-col justify-between ${
                  canAfford && hasStock
                    ? 'border-slate-200/80 hover:border-amber-300 hover:shadow-xs bg-white'
                    : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                }`}
              >
                <CardHeader className="pb-3 border-b border-slate-100/80">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        canAfford && hasStock
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold text-slate-900 leading-snug">
                          {item.title}
                        </CardTitle>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Tipe: {item.reward_type.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 font-bold text-[10px] ${
                        hasStock
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-slate-100 text-slate-500'
                      }`}
                    >
                      {hasStock ? `Sisa: ${item.stock_quantity}` : 'Stok Habis'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-5 flex-1">
                  <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                    {item.description || 'Voucher resmi mitra Bank Sampah WasteWise.'}
                  </p>
                </CardContent>

                <CardFooter className="pt-3 pb-5 px-5 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40 rounded-b-xl">
                  <div className="flex items-center gap-1.5">
                    <Coins className="h-4 w-4 text-amber-600" />
                    <span className="text-base font-extrabold text-slate-900">
                      {item.points_required.toLocaleString('id-ID')}
                    </span>
                    <span className="text-xs font-semibold text-amber-700">Poin</span>
                  </div>

                  <Button
                    onClick={() => handleClaim(item)}
                    disabled={!canAfford || !hasStock || isRedeemingThis}
                    className={`text-xs h-9 rounded-xl font-semibold gap-1.5 ${
                      canAfford && hasStock
                        ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200'
                    }`}
                  >
                    {isRedeemingThis ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Memproses...</span>
                      </>
                    ) : !hasStock ? (
                      <span>Stok Habis</span>
                    ) : !canAfford ? (
                      <span>Kurang {(item.points_required - points).toLocaleString('id-ID')} Poin</span>
                    ) : (
                      <>
                        <Gift className="h-3.5 w-3.5" />
                        <span>Tukarkan Sekarang</span>
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
