"use client"

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Truck,
  Scale,
  Coins,
  Check,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export interface AppNotification {
  id: string
  user_id?: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'pickup' | 'reward'
  is_read: boolean
  link?: string
  created_at: string
}

export function NotificationPopover() {
  const { user } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Load notifikasi akun
  useEffect(() => {
    let isMounted = true

    async function fetchNotifications() {
      if (!user?.id || !supabase) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('id, user_id, title, message, type, is_read, link, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(15)

        if (!error && data && isMounted) {
          setNotifications(
            data.map((n: any) => ({
              id: n.id,
              user_id: n.user_id,
              title: n.title || 'Pemberitahuan',
              message: n.message || '',
              type: (n.type as AppNotification['type']) || 'info',
              is_read: Boolean(n.is_read),
              link: n.link,
              created_at: n.created_at,
            }))
          )
        }
      } catch (err) {
        // Handle quietly without creating dummy notifications
        console.warn('Gagal memuat notifikasi Supabase:', err)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchNotifications()

    return () => {
      isMounted = false
    }
  }, [user])

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))

    if (user?.id && supabase) {
      try {
        await supabase
          .from('notifications')
          .update({ is_read: true })
          .eq('user_id', user.id)
          .eq('is_read', false)
      } catch (err) {
        console.warn('Gagal memperbarui status notifikasi:', err)
      }
    }
  }

  const handleItemClick = async (notif: AppNotification) => {
    // Tandai dibaca
    if (!notif.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      )
      if (supabase) {
        try {
          await supabase.from('notifications').update({ is_read: true }).eq('id', notif.id)
        } catch (err) {
          console.warn('Gagal update is_read:', err)
        }
      }
    }

    setIsOpen(false)
    if (notif.link) {
      router.push(notif.link)
    }
  }

  const renderIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'pickup':
        return <Truck className="h-4 w-4 text-sky-600" />
      case 'reward':
        return <Coins className="h-4 w-4 text-amber-600" />
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Bell className="h-4 w-4 text-slate-500" />
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-600 hover:text-slate-900 h-9 w-9 rounded-xl"
        aria-label="Notifikasi"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-600 text-white text-[9px] font-bold ring-2 ring-white animate-in zoom-in-50">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between p-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs text-slate-900">Notifikasi</span>
              {unreadCount > 0 && (
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-[10px] font-semibold py-0">
                  {unreadCount} baru
                </Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                <span>Tandai semua dibaca</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Bell className="h-5 w-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">Belum Ada Notifikasi</p>
                <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                  Pemberitahuan status jadwal penjemputan dan poin reward akan muncul di sini.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 ${
                    !notif.is_read ? 'bg-emerald-50/30' : 'bg-white'
                  }`}
                >
                  <div className="mt-0.5 p-2 rounded-xl bg-slate-100 shrink-0">
                    {renderIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs font-semibold truncate ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>{notif.created_at ? new Date(notif.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja'}</span>
                      {notif.link && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
                          Lihat detail <ExternalLink className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

