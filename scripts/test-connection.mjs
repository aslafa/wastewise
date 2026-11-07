import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log('==================================================')
console.log(' WasteWise Supabase Connection Diagnostics Tool')
console.log('==================================================\n')

// 1. Baca web/.env.local
const envLocalPath = path.resolve(__dirname, '..', '.env.local')
let envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

if (fs.existsSync(envLocalPath)) {
  console.log(`[INFO] Menemukan file .env.local di: ${envLocalPath}`)
  const envContent = fs.readFileSync(envLocalPath, 'utf-8')
  const lines = envContent.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [k, ...v] = trimmed.split('=')
    const key = k?.trim()
    const val = v.join('=').trim().replace(/^["']|["']$/g, '')
    if (key === 'NEXT_PUBLIC_SUPABASE_URL' && val) envUrl = val
    if ((key === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' || key === 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') && val) {
      envKey = val
    }
  }
} else {
  console.log(`[WARN] File .env.local belum ditemukan di ${envLocalPath}`)
}

console.log(`[STATUS] NEXT_PUBLIC_SUPABASE_URL          : ${envUrl ? envUrl : '(KOSONG / BELUM DIISI)'}`)
console.log(`[STATUS] ANON / PUBLISHABLE KEY            : ${envKey ? envKey.substring(0, 20) + '... (terisi)' : '(KOSONG / BELUM DIISI)'}\n`)

if (!envUrl || !envKey || envUrl.includes('your-project')) {
  console.log('--------------------------------------------------')
  console.log('HASIL DIAGNOSTIK:')
  console.log('Status: BELUM TERHUBUNG (Menunggu Kredensial)')
  console.log('Catatan: Silakan buka file web/.env.local dan masukkan URL & Key Supabase.')
  console.log('--------------------------------------------------')
  process.exit(0)
}

// 2. Inisialisasi Supabase Client & Uji Query
console.log('[INFO] Menghubungi Supabase dan menguji query ke tabel waste_categories...')

const client = createClient(envUrl, envKey)

try {
  const { data, error, count } = await client
    .from('waste_categories')
    .select('id, code, name, description, is_hazardous, allows_auto_points, color_hex', { count: 'exact' })

  if (error) {
    console.error('\n[GAGAL] Query ke tabel waste_categories mengalami error:')
    console.error(`- Pesan: ${error.message}`)
    console.error(`- Kode : ${error.code || 'UNKNOWN'}`)
    console.error(`- Detail: ${error.details || '-'}`)
    console.error(`- Hint  : ${error.hint || '-'}`)
    process.exit(1)
  }

  console.log('\n[BERHASIL] Koneksi ke Supabase terverifikasi aktif!')
  console.log(`[DATA] Ditemukan ${data?.length || 0} kategori sampah di tabel public.waste_categories:`)
  data?.forEach((cat, idx) => {
    console.log(`  ${idx + 1}. [${cat.code}] ${cat.name} - Warna: ${cat.color_hex} | B3: ${cat.is_hazardous ? 'Ya' : 'Tidak'} | Poin: ${cat.allows_auto_points ? 'Aktif' : 'Non-aktif'}`)
    if (cat.description) {
      console.log(`     Deskripsi: ${cat.description}`)
    }
  })
  console.log('\n==================================================')
} catch (err) {
  console.error('\n[FATAL] Gagal terhubung ke host Supabase:', err.message || err)
  process.exit(1)
}
