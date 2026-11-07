import { createClient } from '@supabase/supabase-js'
import { SupabaseConnectionStatus, DbWasteCategory } from '@/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
const supabaseAnonKey = (
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
  ''
)

// Memeriksa apakah format URL dan Key valid dan bukan placeholder
export const isSupabaseConfigured: boolean = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project') &&
  supabaseAnonKey.length > 15
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null

/**
 * Menguji koneksi langsung ke Supabase dengan query ringan ke tabel public.waste_categories
 */
export async function checkSupabaseConnection(): Promise<SupabaseConnectionStatus> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      isConfigured: false,
      isConnected: false,
      message: 'Supabase belum terkonfigurasi lengkap di web/.env.local (URL atau API Key kosong).',
    }
  }

  try {
    const { data, error, count } = await supabase
      .from('waste_categories')
      .select('id, code, name, description, is_hazardous, allows_auto_points, color_hex', { count: 'exact' })

    if (error) {
      return {
        isConfigured: true,
        isConnected: false,
        message: `Koneksi gagal: ${error.message} (Kode: ${error.code || 'UNKNOWN'})`,
        error: error.message,
      }
    }

    return {
      isConfigured: true,
      isConnected: true,
      message: `Terhubung ke Supabase. Ditemukan ${data?.length ?? 0} kategori sampah di database asli.`,
      categories: (data as DbWasteCategory[]) || [],
      categoriesCount: count ?? data?.length ?? 0,
    }
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    return {
      isConfigured: true,
      isConnected: false,
      message: `Gagal menghubungi server Supabase: ${errMsg}`,
      error: errMsg,
    }
  }
}
