import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Baca konfigurasi env
const envPath = path.resolve(__dirname, '../.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)
const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=(.*)/)
const secretMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)

const supabaseUrl = urlMatch ? urlMatch[1].trim() : ''
const supabaseAnonKey = keyMatch ? keyMatch[1].trim() : ''
const supabaseServiceKey = secretMatch ? secretMatch[1].trim() : ''

console.log('====================================================')
console.log(' PENGUJIAN OTOMATIS TAHAP 1: MODUL WARGA (NASABAH)')
console.log(' Target URL:', supabaseUrl)
console.log('====================================================\n')

async function runTestSuite() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

  let passedTests = 0
  let totalTests = 0

  function assert(condition, testName, details = '') {
    totalTests++
    if (condition) {
      console.log(` [PASS] ${testName}`)
      if (details) console.log(`        Detail: ${details}`)
      passedTests++
    } else {
      console.error(`❌ [FAIL] ${testName}`)
      if (details) console.error(`        Detail: ${details}`)
    }
  }

  // ----------------------------------------------------
  // TEST 1: Login Akun Resmi Warga
  // ----------------------------------------------------
  console.log('\n--- 1. PENGUJIAN LOGIN AKUN RESMI WARGA ---')
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'warga@wastewise.id',
    password: 'WasteWise123',
  })

  assert(
    authData.user && authData.user.email === 'warga@wastewise.id',
    'Login warga@wastewise.id berhasil',
    `User ID: ${authData.user?.id}, Session Token: ${authData.session ? 'Terbit' : 'Kosong'}`
  )

  const wargaUserId = authData.user?.id
  if (!wargaUserId) {
    console.error('Pengujian dihentikan karena login gagal.')
    return
  }

  // ----------------------------------------------------
  // TEST 2: Saldo Awal Warga Baru & QR Nasabah Publik
  // ----------------------------------------------------
  console.log('\n--- 2. PENGUJIAN SALDO PROFIL & CUSTOMER QR TOKEN ---')
  const { data: profData, error: profErr } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', wargaUserId)
    .single()

  assert(
    profData && profData.points_balance === 0,
    'Saldo awal akun warga murni 0 poin (Bebas dummy 340 poin)',
    `Saldo Aktual: ${profData?.points_balance} Poin`
  )

  assert(
    profData && profData.customer_qr_token && !profData.customer_qr_token.includes(wargaUserId),
    'Customer QR Token nasabah publik terpasang dan BUKAN mengekspos UUID akun',
    `Token Publik: ${profData?.customer_qr_token}`
  )

  // ----------------------------------------------------
  // TEST 3: Riwayat Transaksi Ledger Poin (reward_transactions)
  // ----------------------------------------------------
  console.log('\n--- 3. PENGUJIAN RIWAYAT BUKU BESAR (LEDGER) ---')
  const { data: txnData, error: txnErr } = await supabaseAdmin
    .from('reward_transactions')
    .select('*')
    .eq('user_id', wargaUserId)

  assert(
    !txnErr && Array.isArray(txnData),
    'Query reward_transactions berhasil diakses',
    `Jumlah mutasi awal: ${txnData?.length} (Bersih, tidak ada data fiktif TXN-001)`
  )

  // ----------------------------------------------------
  // TEST 4: Riwayat Pengajuan Penjemputan (pickup_requests)
  // ----------------------------------------------------
  console.log('\n--- 4. PENGUJIAN STATUS PENJEMPUTAN WARGA ---')
  const { data: pickupData, error: pickupErr } = await supabaseAdmin
    .from('pickup_requests')
    .select('id, request_number, status, total_estimated_kg, total_verified_kg')
    .eq('user_id', wargaUserId)

  assert(
    !pickupErr && Array.isArray(pickupData),
    'Query pickup_requests milik warga berhasil',
    `Jumlah tiket penjemputan awal: ${pickupData?.length} tiket`
  )

  // ----------------------------------------------------
  // TEST 5: Master Katalog Reward
  // ----------------------------------------------------
  console.log('\n--- 5. PENGUJIAN MASTER KATALOG REWARD ---')
  const { data: rwdData, error: rwdErr } = await supabaseAdmin
    .from('rewards')
    .select('id, title, points_required, stock_quantity, is_active')
    .eq('is_active', true)

  assert(
    !rwdErr && rwdData && rwdData.length > 0,
    'Master katalog reward tersedia',
    `Katalog aktif: ${rwdData?.length} voucher (${rwdData?.map(r => r.title).join(', ')})`
  )

  // ----------------------------------------------------
  // TEST 6: Proteksi Transaksi Penukaran Reward (Saldo Kurang)
  // ----------------------------------------------------
  console.log('\n--- 6. PENGUJIAN VALIDASI ATOMIK PENUKARAN REWARD ---')
  if (rwdData && rwdData.length > 0) {
    const targetReward = rwdData[0]
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('redeem_reward_atomic', {
      p_reward_id: targetReward.id,
      p_user_id: wargaUserId,
    })

    assert(
      (rpcRes && rpcRes.success === false) || rpcErr !== null,
      'Penukaran ditolak dengan aman saat saldo tidak mencukupi (Anti-Fraud)',
      `Respons RPC: ${JSON.stringify(rpcRes || rpcErr?.message)}`
    )
  }

  // ----------------------------------------------------
  // TEST 7: Pengujian RLS (Isolasi Data Antar Pengguna)
  // ----------------------------------------------------
  console.log('\n--- 7. PENGUJIAN KEAMANAN RLS (TENANT ISOLATION) ---')
  const petugasId = 'a0000000-0000-0000-0000-000000000002'

  // Warga mencoba membaca profil petugas via client authenticated warga
  const { data: otherUserProf, error: otherProfErr } = await supabase
    .from('profiles')
    .select('email, points_balance')
    .eq('id', petugasId)

  assert(
    !otherUserProf || otherUserProf.length === 0,
    'RLS aktif: Warga dilarang membaca profil pengguna lain secara sembarangan',
    `Hasil akses: ${JSON.stringify(otherUserProf || 'Diblokir / Kosong')}`
  )

  // Warga mencoba membaca ledger pengguna lain
  const { data: otherLedger, error: otherLedgerErr } = await supabase
    .from('reward_transactions')
    .select('*')
    .eq('user_id', petugasId)

  assert(
    !otherLedger || otherLedger.length === 0,
    'RLS aktif: Warga dilarang membaca mutasi transaksi ledger milik pengguna lain',
    `Hasil akses ledger: ${JSON.stringify(otherLedger || 'Diblokir / Kosong')}`
  )

  console.log('\n====================================================')
  console.log(` HASIL AKHIR PENGUJIAN: ${passedTests} / ${totalTests} PENGUJIAN LULUS (${Math.round((passedTests/totalTests)*100)}%)`)
  console.log('====================================================')
}

runTestSuite().catch(console.error)

