/**
 * WasteWise Server-Side Administrative Cleanup & Audit Tool
 * 
 * Penggunaan:
 *   1. Mode Audit Saja (Dry-Run - Default, Aman, Tanpa Penghapusan):
 *      node scripts/cleanup_accounts.mjs
 * 
 *   2. Mode Eksekusi Penghapusan (Hanya jika terbukti bersih & ada konfirmasi):
 *      node scripts/cleanup_accounts.mjs --execute
 * 
 * Keamanan:
 * - Menggunakan kredensial server-side (SUPABASE_SERVICE_ROLE_KEY).
 * - Tidak pernah di-bundle ke frontend maupun Android.
 * - Memeriksa kesesuaian URL project dan service_role key.
 * - Memeriksa keberadaan data secara atomik via RPC PostgreSQL khusus: audit_user_operational_data()
 *   yang berjalan dengan SECURITY DEFINER dan search_path aman.
 * - Menangani error RPC secara ketat: jika RPC gagal, penghapusan DIBATALKAN.
 * - Memproteksi mutlak 5 akun resmi WasteWise (@wastewise.id).
 * - Target hanya 3 akun percobaan: warga.test@gmail.com, wargatest41660@gmail.com, ibnuaqil0912@gmail.com.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// 1. Baca Konfigurasi Lingkungan
const envPath = path.resolve(process.cwd(), '.env.local')
const env = {}
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match) {
      let val = match[2] || ''
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      env[match[1]] = val.trim()
    }
  })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || env['NEXT_PUBLIC_SUPABASE_URL']
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env['SUPABASE_SERVICE_ROLE_KEY']

// Periksa argumen CLI untuk mode eksekusi
const isExecuteMode = process.argv.includes('--execute') || process.argv.includes('--confirm-delete')

console.log('====================================================================')
console.log(' WasteWise Administrative Account Audit & Cleanup Tool')
console.log('====================================================================')
console.log('Supabase URL :', url || '(Belum disetel)')
console.log('Mode Operasi :', isExecuteMode ? 'EKSEKUSI PENGHAPUSAN (--execute)' : 'AUDIT SAJA (DRY-RUN - DEFAULT)')
console.log('====================================================================')

if (!url) {
  console.error('[ERROR] NEXT_PUBLIC_SUPABASE_URL tidak ditemukan di .env.local atau environment variable.')
  process.exit(1)
}

if (!serviceRoleKey) {
  console.log('\n[INFO] SUPABASE_SERVICE_ROLE_KEY belum ditemukan di environment.')
  console.log('Script memerlukan kunci administratif server-side (Service Role) untuk mengakses Auth Admin API.')
  console.log('\nCara menjalankan di terminal PowerShell:')
  console.log('  1. Mode Audit Saja (Dry-Run):')
  console.log('     $env:SUPABASE_SERVICE_ROLE_KEY="kunci_service_role_anda"')
  console.log('     node scripts/cleanup_accounts.mjs')
  console.log('\n  2. Mode Eksekusi Penghapusan:')
  console.log('     $env:SUPABASE_SERVICE_ROLE_KEY="kunci_service_role_anda"')
  console.log('     node scripts/cleanup_accounts.mjs --execute')
  console.log('\nPastikan fungsi RPC audit_user_operational_data sudah dibuat di Supabase SQL Editor.')
  process.exit(0)
}

// 2. Validasi bahwa URL dan Service Role Key Berasal dari Project yang Sama
function validateProjectMatch(projectUrl, key) {
  try {
    const urlObj = new URL(projectUrl)
    const hostParts = urlObj.hostname.split('.')
    const projectRefFromUrl = hostParts[0]

    // Jika key adalah JWT token (standar Supabase)
    if (key.includes('.')) {
      const parts = key.split('.')
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf8')
        const payload = JSON.parse(payloadJson)

        if (payload.ref && payload.ref !== projectRefFromUrl) {
          console.error(`\n[SECURITY MISMATCH] Kunci Service Role berasal dari project "${payload.ref}",`)
          console.error(`tetapi NEXT_PUBLIC_SUPABASE_URL mengarah ke project "${projectRefFromUrl}".`)
          console.error('Eksekusi dibatalkan demi mencegah salah sasaran project!')
          process.exit(1)
        }

        if (payload.role !== 'service_role') {
          console.warn(`[WARNING] Kunci yang diberikan memiliki role "${payload.role}", bukan "service_role".`)
        }
      }
    }
  } catch (err) {
    console.warn('[WARNING] Tidak dapat memvalidasi payload token:', err.message)
  }
}

validateProjectMatch(url, serviceRoleKey)

// Inisialisasi Supabase Admin Client
const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TARGET_EMAILS = [
  'warga.test@gmail.com',
  'wargatest41660@gmail.com',
  'ibnuaqil0912@gmail.com'
]

const PROTECTED_DOMAINS = ['@wastewise.id']

async function runAuditAndCleanup() {
  console.log('\n[LANGKAH 1] Mengambil daftar akun dari Supabase Auth Admin API...')
  const { data: userListData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 100 })

  if (listErr) {
    console.error('[ERROR] Gagal membaca daftar akun dari Auth Admin API:', listErr.message)
    process.exit(1)
  }

  const allUsers = userListData.users || []
  const targetUsers = allUsers.filter(u => TARGET_EMAILS.includes(u.email || ''))

  if (targetUsers.length === 0) {
    console.log('[SELESAI] Tidak ditemukan akun dari target email (warga.test@gmail.com, wargatest41660@gmail.com, ibnuaqil0912@gmail.com).')
    console.log('Ketiga akun tersebut kemungkinan sudah dibersihkan sebelumnya.')
    return
  }

  console.log(`Ditemukan ${targetUsers.length} akun target untuk diaudit:\n`)

  const summary = {
    audited: 0,
    safeToDelete: [],
    hasCriticalData: [],
    failedQueries: [],
    deleted: []
  }

  for (const user of targetUsers) {
    summary.audited++
    console.log('--------------------------------------------------------------------')
    console.log(`Akun [${summary.audited}/${targetUsers.length}]: ${user.email}`)
    console.log(`User ID : ${user.id}`)
    console.log(`Created : ${user.created_at}`)

    // 1. Proteksi Mutlak Akun Resmi WasteWise
    if (PROTECTED_DOMAINS.some(dom => user.email?.toLowerCase().endsWith(dom))) {
      console.log(`[DITOLAK] Akun ${user.email} merupakan AKUN RESMI WasteWise. Tidak boleh dimanipulasi!`)
      continue
    }

    // 2. Audit Atomik via PostgreSQL RPC (SECURITY DEFINER)
    console.log('\nMemeriksa relasi data melalui PostgreSQL RPC: audit_user_operational_data()...')
    const { data: auditResult, error: rpcErr } = await supabase.rpc('audit_user_operational_data', {
      p_user_id: user.id
    })

    // Tangani error RPC secara ketat
    if (rpcErr) {
      console.error(`  ✕ [ERROR RPC] Gagal mengeksekusi RPC audit: ${rpcErr.message}`)
      if (rpcErr.message.includes('schema cache') || rpcErr.message.includes('Could not find')) {
        console.error('  ──────────────────────────────────────────────────────────────────')
        console.error('  [PENYEBAB]: Fungsi public.audit_user_operational_data() belum dibuat di Supabase.')
        console.error('  [SOLUSI]  : Salin dan jalankan file migration berikut di Supabase SQL Editor:')
        console.error('              web/supabase/migrations/20261106000000_audit_user_data_rpc.sql')
        console.error('  ──────────────────────────────────────────────────────────────────')
      }
      console.log(`  [STATUS] PEMERIKSAAN GAGAL: Akun ${user.email} TIDAK BOLEH dihapus.`)
      summary.failedQueries.push(user.email)
      continue
    }

    if (!auditResult || !auditResult.success) {
      const errMsg = auditResult?.error || 'Hasil audit tidak valid dari RPC.'
      console.error(`  ✕ [ERROR AUDIT] ${errMsg}`)
      console.log(`  [STATUS] PEMERIKSAAN GAGAL: Akun ${user.email} TIDAK BOLEH dihapus.`)
      summary.failedQueries.push(user.email)
      continue
    }

    // Tampilkan hasil hitungan seluruh 13 tabel aktual
    console.log(`  ✓ profiles               : ${auditResult.profiles_count ?? 0} baris`)
    console.log(`  ✓ pickup_requests        : ${auditResult.pickup_requests_count ?? 0} baris`)
    console.log(`  ✓ pickup_assignments     : ${auditResult.pickup_assignments_count ?? 0} baris`)
    console.log(`  ✓ pickup_verifications   : ${auditResult.pickup_verifications_count ?? 0} baris`)
    console.log(`  ✓ waste_records          : ${auditResult.waste_records_count ?? 0} baris`)
    console.log(`  ✓ waste_classifications  : ${auditResult.waste_classifications_count ?? 0} baris`)
    console.log(`  ✓ waste_photos           : ${auditResult.waste_photos_count ?? 0} baris`)
    console.log(`  ✓ reward_transactions    : ${auditResult.reward_transactions_count ?? 0} baris`)
    console.log(`  ✓ reward_redemptions     : ${auditResult.reward_redemptions_count ?? 0} baris`)
    console.log(`  ✓ user_addresses         : ${auditResult.user_addresses_count ?? 0} baris`)
    console.log(`  ✓ staff_assignments     : ${auditResult.staff_assignments_count ?? 0} baris`)
    console.log(`  ✓ notifications          : ${auditResult.notifications_count ?? 0} baris`)
    console.log(`  ✓ audit_logs             : ${auditResult.audit_logs_count ?? 0} baris`)

    // Evaluasi Keamanan Data
    if (auditResult.has_critical_data || !auditResult.is_safe_to_delete) {
      console.log(`\n[STATUS] ${auditResult.status_message}`)
      summary.hasCriticalData.push(user.email)
      continue
    }

    // Jika bebas dari transaksi operasional penting
    summary.safeToDelete.push(user)
    console.log(`\n[STATUS] ${auditResult.status_message}`)

    // Eksekusi Penghapusan Jika Mode --execute Aktif
    if (isExecuteMode) {
      console.log(`\n[EKSEKUSI] Menghapus ${user.email} via Supabase Auth Admin API...`)
      const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
      if (delErr) {
        console.error(`✕ Gagal menghapus user ${user.email}:`, delErr.message)
      } else {
        console.log(`✓ [BERHASIL] Akun ${user.email} berhasil dihapus dari Supabase Auth dan profiles.`)
        summary.deleted.push(user.email)
      }
    } else {
      console.log(`[DRY-RUN] Akun ${user.email} aman dihapus, namun tidak dihapus karena dalam mode audit saja.`)
    }
  }

  // 3. Ringkasan Akhir
  console.log('\n====================================================================')
  console.log(' RINGKASAN AUDIT AKUN PENGUJIAN')
  console.log('====================================================================')
  console.log(`Total Akun Diaudit       : ${summary.audited}`)
  console.log(`Aman Dihapus             : ${summary.safeToDelete.length} (${summary.safeToDelete.map(u => u.email).join(', ') || 'Tidak ada'})`)
  console.log(`Memiliki Data Penting    : ${summary.hasCriticalData.length} (${summary.hasCriticalData.join(', ') || 'Tidak ada'})`)
  console.log(`Audit Gagal / Ditahan    : ${summary.failedQueries.length} (${summary.failedQueries.join(', ') || 'Tidak ada'})`)

  if (isExecuteMode) {
    console.log(`Berhasil Dihapus         : ${summary.deleted.length} (${summary.deleted.join(', ') || 'Tidak ada'})`)
  } else {
    console.log('\n[CATATAN]: Script berjalan dalam MODE AUDIT SAJA (Dry-Run).')
    console.log('Tidak ada data yang dihapus dari database.')
    if (summary.safeToDelete.length > 0) {
      console.log('Untuk mengeksekusi penghapusan akun yang terverifikasi aman, jalankan:')
      console.log('  node scripts/cleanup_accounts.mjs --execute')
    }
  }
  console.log('====================================================================\n')
}

runAuditAndCleanup().catch(err => {
  console.error('[FATAL ERROR]:', err)
  process.exit(1)
})
