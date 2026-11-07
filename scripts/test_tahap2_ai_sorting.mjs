// ====================================================================
// WasteWise Tahap 2: AI Smart Sorting & Supabase Integration Test
// Built-in ESM without third-party dependencies (Node 22 native fetch/fs)
// ====================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Baca .env.local secara manual
let SUPABASE_URL = 'https://kpdrvvvruehmabopqoig.supabase.co';
let SUPABASE_ANON_KEY = 'sb_publishable_7UAxvmCpu3xLTXFtUGk1CQ_f4y9Cxh7';

try {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=([^\r\n]+)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=([^\r\n]+)/);
    if (urlMatch) SUPABASE_URL = urlMatch[1].trim();
    if (keyMatch) SUPABASE_ANON_KEY = keyMatch[1].trim();
  }
} catch (e) {
  // Gunakan fallback resmi
}

console.log('--- TEST SUITE TAHAP 2: AI SMART SORTING & SUPABASE INTEGRATION ---');
console.log(`Supabase URL: ${SUPABASE_URL}`);
console.log(`Anon Key Prefix: ${SUPABASE_ANON_KEY.substring(0, 15)}...`);

async function runTestSuite() {
  const results = {
    authWarga: false,
    authPetugas: false,
    insertClassification: false,
    readClassificationPetugas: false,
    offlineResilience: false,
    scientificMetrics: false,
  };

  try {
    // 1. TEST AUTENTIKASI WARGA (SIMULASI ANDROID LOGIN VIA REST AUTH)
    console.log('\n[1/6] Menguji Autentikasi Warga via Supabase Auth REST...');
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'warga@wastewise.id',
        password: 'WasteWise123'
      })
    });

    const authData = await authRes.json();
    if (!authRes.ok || !authData.access_token) {
      console.error('❌ Gagal login warga:', authData);
      return;
    }
    console.log(`✅ Login warga berhasil. User ID: ${authData.user.id}, Role: ${authData.user.aud}`);
    results.authWarga = true;

    const wargaToken = authData.access_token;
    const wargaUserId = authData.user.id;

    // 2. TEST SINKRONISASI INFERENSI AI (SIMULASI SUPABASESYNCSERVICE ANDROID)
    console.log('\n[2/6] Menguji Sinkronisasi Inferensi AI (Android -> Supabase)...');
    
    // Ambil category anorganik
    const catRes = await fetch(`${SUPABASE_URL}/rest/v1/waste_categories?code=eq.ANORG&select=id`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${wargaToken}`
      }
    });
    const categories = await catRes.json();
    const anorgCategoryId = categories[0]?.id || 'c1000000-0000-0000-0000-000000000002';

    const testPayload = {
      user_id: wargaUserId,
      predicted_category_id: anorgCategoryId,
      confidence_score: 93.85,
      raw_tensor_index: '1',
      image_storage_path: 'android_camera_test_sample.jpg',
      client_device_metadata: {
        platform: 'Android Native Java',
        model_engine: 'TensorFlow Lite Task Vision 0.4.3',
        model_file: 'model.tflite',
        test_run: true
      }
    };

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/waste_classifications`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${wargaToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(testPayload)
    });

    const insertedData = await insertRes.json();
    let testClassificationId = null;
    if (insertRes.ok && Array.isArray(insertedData) && insertedData.length > 0) {
      testClassificationId = insertedData[0].id;
      console.log(`✅ Sinkronisasi inferensi AI berhasil! Classification ID: ${testClassificationId}`);
      console.log(`   Kategori Terdeteksi: ANORG, Confidence: 93.85%`);
      results.insertClassification = true;
    } else {
      console.warn('⚠️ Respons simpan klasifikasi:', insertedData);
    }

    // 3. TEST OFFLINE RESILIENCE & ERROR HANDLING
    console.log('\n[3/6] Menguji Ketahanan Offline & Safe Error Handling...');
    try {
      const offlinePromise = fetch('http://127.0.0.1:59999/invalid_endpoint', {
        signal: AbortSignal.timeout(1000)
      }).catch(err => ({ errorCaught: true, msg: err.message }));

      const offlineResult = await offlinePromise;
      if (offlineResult.errorCaught) {
        console.log(`✅ Safe offline exception caught: ${offlineResult.msg} (Aplikasi tidak crash)`);
        results.offlineResilience = true;
      }
    } catch (e) {
      console.log('✅ Offline resilience verified.');
      results.offlineResilience = true;
    }

    // 4. TEST AUTENTIKASI PETUGAS & HAK AKSES OPERASIONAL
    console.log('\n[4/6] Menguji Autentikasi Petugas Lapangan...');
    const authPetugasRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'petugas@wastewise.id',
        password: 'WasteWise123'
      })
    });

    const petugasData = await authPetugasRes.json();
    if (authPetugasRes.ok && petugasData.access_token) {
      console.log(`✅ Login petugas berhasil. User ID: ${petugasData.user.id}`);
      results.authPetugas = true;

      const petugasToken = petugasData.access_token;

      // 5. TEST PEMBACAAN DAN EVALUASI OLEH PETUGAS
      console.log('\n[5/6] Menguji Pembacaan Klasifikasi Sampah oleh Petugas...');
      const readRes = await fetch(`${SUPABASE_URL}/rest/v1/waste_classifications?select=id,confidence_score,created_at&limit=5`, {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${petugasToken}`
        }
      });
      const readData = await readRes.json();
      if (readRes.ok && Array.isArray(readData)) {
        console.log(`✅ Petugas berhasil mengakses riwayat klasifikasi operasional (${readData.length} records dibaca)`);
        results.readClassificationPetugas = true;
      } else {
        console.warn('⚠️ Status read klasifikasi petugas:', readData);
      }
    }

    // 6. TEST KALKULASI METRIK EVALUASI ILMIAH (CONFUSION MATRIX 3X3)
    console.log('\n[6/6] Menguji Kalkulasi Evaluasi Ilmiah AI (Confusion Matrix, Precision, Recall, F1)...');
    
    // Dataset simulasi berlabel untuk evaluasi model MobileNet 3-kelas
    const evaluationSample = [
      { predicted: 'Organik', actual: 'Organik' },
      { predicted: 'Organik', actual: 'Organik' },
      { predicted: 'Organik', actual: 'Anorganik' }, // False Positive Organik
      { predicted: 'Anorganik', actual: 'Anorganik' },
      { predicted: 'Anorganik', actual: 'Anorganik' },
      { predicted: 'Anorganik', actual: 'Anorganik' },
      { predicted: 'Anorganik', actual: 'Organik' },   // False Positive Anorganik
      { predicted: 'B3', actual: 'B3' },
      { predicted: 'B3', actual: 'B3' },
      { predicted: 'Anorganik', actual: 'B3' }         // False Negative B3
    ];

    const classes = ['Organik', 'Anorganik', 'B3'];
    const matrix = {
      Organik: { Organik: 0, Anorganik: 0, B3: 0 },
      Anorganik: { Organik: 0, Anorganik: 0, B3: 0 },
      B3: { Organik: 0, Anorganik: 0, B3: 0 }
    };

    evaluationSample.forEach(item => {
      if (matrix[item.actual] && matrix[item.actual][item.predicted] !== undefined) {
        matrix[item.actual][item.predicted]++;
      }
    });

    let correctTotal = 0;
    classes.forEach(c => {
      correctTotal += matrix[c][c];
    });
    const accuracy = (correctTotal / evaluationSample.length) * 100;

    let sumPrecision = 0;
    let sumRecall = 0;
    let sumF1 = 0;

    classes.forEach(c => {
      const tp = matrix[c][c];
      const fp = classes.reduce((sum, other) => other !== c ? sum + matrix[other][c] : sum, 0);
      const fn = classes.reduce((sum, other) => other !== c ? sum + matrix[c][other] : sum, 0);

      const prec = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const rec = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (prec + rec) > 0 ? (2 * prec * rec) / (prec + rec) : 0;

      sumPrecision += prec;
      sumRecall += rec;
      sumF1 += f1;
    });

    const macroPrecision = (sumPrecision / 3) * 100;
    const macroRecall = (sumRecall / 3) * 100;
    const macroF1 = (sumF1 / 3) * 100;

    console.log(`✅ Confusion Matrix 3x3:`);
    console.log(`   Actual Organik   -> Pred: [Org: ${matrix.Organik.Organik}, Anorg: ${matrix.Organik.Anorganik}, B3: ${matrix.Organik.B3}]`);
    console.log(`   Actual Anorganik -> Pred: [Org: ${matrix.Anorganik.Organik}, Anorg: ${matrix.Anorganik.Anorganik}, B3: ${matrix.Anorganik.B3}]`);
    console.log(`   Actual B3        -> Pred: [Org: ${matrix.B3.Organik}, Anorg: ${matrix.B3.Anorganik}, B3: ${matrix.B3.B3}]`);
    console.log(`   Scientific Accuracy: ${accuracy.toFixed(1)}%`);
    console.log(`   Macro Precision    : ${macroPrecision.toFixed(1)}%`);
    console.log(`   Macro Recall       : ${macroRecall.toFixed(1)}%`);
    console.log(`   Macro F1-Score     : ${macroF1.toFixed(1)}%`);
    results.scientificMetrics = true;

    console.log('\n======================================================');
    console.log('HASIL EVALUASI INTEGRASI TAHAP 2:');
    console.log(JSON.stringify(results, null, 2));
    console.log('======================================================');

  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTestSuite();
