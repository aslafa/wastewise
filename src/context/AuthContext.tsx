"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { UserRole, UserProfile } from '@/types'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
  isDemoSession: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; role?: UserRole; error?: string }>
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; hasSession?: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Ambil profil & role resmi dari database public.profiles via RPC get_current_role()
  const fetchProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!isSupabaseConfigured || !supabase) return null

    try {
      // 1. Ambil role resmi langsung dari PostgreSQL RPC get_current_role()
      let userRole: UserRole = 'warga'
      try {
        const { data: rpcRole, error: rpcErr } = await supabase.rpc('get_current_role')
        if (!rpcErr && rpcRole) {
          userRole = rpcRole as UserRole
        }
      } catch (rpcEx) {
        console.warn('RPC get_current_role warning:', rpcEx)
      }

      // 2. Coba ambil detail tambahan dari tabel public.profiles jika diizinkan
      let rawProfile: Partial<UserProfile> = {}
      try {
        const { data: profData, error: profErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (!profErr && profData) {
          rawProfile = profData as UserProfile
          if (profData.role) {
            userRole = profData.role as UserRole
          }
        }
      } catch (tblEx) {
        // Abaikan jika permission 403, fallback ke session user
      }

      // 3. Ambil data session user terkini
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user
      const email = currentUser?.email || rawProfile.email || ''
      const fullName = (currentUser?.user_metadata?.full_name as string) || 
                       rawProfile.full_name || 
                       (email ? email.split('@')[0] : 'Pengguna WasteWise')

      const userProfile: UserProfile = {
        id: userId,
        email: email,
        full_name: fullName,
        role: userRole,
        phone: rawProfile.phone || (currentUser?.user_metadata?.phone as string) || null,
        avatar_url: rawProfile.avatar_url || null,
        points_balance: rawProfile.points_balance ?? 0,
        customer_qr_token: rawProfile.customer_qr_token || `WW-NSB-${userId.slice(0, 6).toUpperCase()}`,
        status: rawProfile.status || 'active',
        partner_id: rawProfile.partner_id || null,
        created_at: rawProfile.created_at || currentUser?.created_at || new Date().toISOString(),
      }

      return userProfile
    } catch (err) {
      console.error('Error fetching profile from Supabase:', err)
      return null
    }
  }, [])

  // Inisialisasi session saat komponen pertama kali dimuat
  useEffect(() => {
    let isMounted = true

    async function initSession() {
      setIsLoading(true)

      // Cek session dari Supabase Auth
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session }, error } = await supabase.auth.getSession()
          if (!error && session?.user) {
            const userProfile = await fetchProfile(session.user.id)
            if (isMounted) {
              setUser(session.user)
              if (userProfile) {
                setProfile(userProfile)
                setRole(userProfile.role)
              }
            }
          }
        } catch (err) {
          console.error('Auth initialization error:', err)
        }
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    initSession()

    // Listener perubahan autentikasi Supabase
    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return

        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          if (prof) {
            setProfile(prof)
            setRole(prof.role)
          }
        } else {
          setUser(null)
          setProfile(null)
          setRole(null)
        }
      })

      return () => {
        isMounted = false
        subscription.unsubscribe()
      }
    }

    return () => {
      isMounted = false
    }
  }, [fetchProfile])

  // Fungsi Registrasi Akun Warga Baru
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; hasSession?: boolean; error?: string }> => {
    setIsLoading(true)

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return { success: false, error: 'Koneksi Supabase belum terkonfigurasi di web/.env.local.' }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      })

      if (error) {
        setIsLoading(false)
        return { success: false, error: error.message }
      }

      if (data.session?.user) {
        setUser(data.session.user)
        const prof = await fetchProfile(data.session.user.id)
        if (prof) {
          setProfile(prof)
          setRole(prof.role)
        }
        setIsLoading(false)
        return { success: true, hasSession: true }
      }

      setIsLoading(false)
      return { success: true, hasSession: false }
    } catch (err: unknown) {
      setIsLoading(false)
      const message = err instanceof Error ? err.message : String(err)
      return { success: false, error: message }
    }
  }

  // Fungsi Login dengan Supabase Auth
  const signIn = async (email: string, password: string): Promise<{ success: boolean; role?: UserRole; error?: string }> => {
    setIsLoading(true)

    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false)
      return {
        success: false,
        error: 'Koneksi Supabase belum dikonfigurasi di web/.env.local.',
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error || !data.user) {
        setIsLoading(false)
        return {
          success: false,
          error: error?.message || 'Email atau kata sandi yang Anda masukkan salah.',
        }
      }

      // Ambil profil & role resmi dari database PostgreSQL
      const prof = await fetchProfile(data.user.id)

      if (!prof) {
        await supabase.auth.signOut()
        setIsLoading(false)
        return {
          success: false,
          error: 'Gagal memverifikasi profil akun dari database WasteWise. Hubungi administrator.',
        }
      }

      if (prof.status === 'suspended' || prof.status === 'inactive') {
        await supabase.auth.signOut()
        setIsLoading(false)
        return {
          success: false,
          error: `Akun Anda berstatus "${prof.status}". Akses dashboard saat ini dinonaktifkan.`,
        }
      }

      setUser(data.user)
      setProfile(prof)
      setRole(prof.role)

      setIsLoading(false)
      return {
        success: true,
        role: prof.role,
      }
    } catch (err: unknown) {
      setIsLoading(false)
      const message = err instanceof Error ? err.message : String(err)
      return {
        success: false,
        error: `Terjadi kesalahan saat masuk: ${message}`,
      }
    }
  }

  // Fungsi Logout
  const signOut = async () => {
    setIsLoading(true)
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (err) {
        console.warn('Supabase sign out warning:', err)
      }
    }
    setUser(null)
    setProfile(null)
    setRole(null)
    setIsLoading(false)
    router.push('/')
  }

  const refreshProfile = async () => {
    if (user) {
      const p = await fetchProfile(user.id)
      if (p) {
        setProfile(p)
        setRole(p.role)
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated: Boolean(user && profile && role),
        isDemoSession: false,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
