import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3560;
const SCREENSHOT_DIR = path.resolve('web/public/screenshots');
const ARTIFACT_DIR = 'C:\\Users\\Asus\\.gemini\\antigravity\\brain\\11805a7f-5b19-4a17-9f7f-848852033444';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

function preloadUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      res.resume();
      resolve();
    }).on('error', () => resolve());
  });
}

function runEdgeScreenshot(url, outputPath, windowSize = '1280,1800') {
  return new Promise((resolve, reject) => {
    const tmpDir = path.join(os.tmpdir(), `edge_prof_${Math.floor(Math.random() * 100000)}`);
    const args = [
      '--headless',
      '--disable-gpu',
      `--user-data-dir=${tmpDir}`,
      `--window-size=${windowSize}`,
      `--virtual-time-budget=6000`,
      `--screenshot=${outputPath}`,
      url,
    ];
    const proc = spawn(EDGE_PATH, args);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Edge exited with code ${code}`));
    });
  });
}

async function main() {
  console.log('Starting Next.js dev server on port', PORT);
  const nextServer = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    cwd: path.resolve('web'),
    shell: true,
  });

  nextServer.stdout.on('data', (d) => console.log('[Next]', d.toString().trim()));
  nextServer.stderr.on('data', (d) => console.error('[Next ERR]', d.toString().trim()));

  try {
    console.log('Waiting 7 seconds for Next.js dev server to be fully ready...');
    await delay(7000);
    console.log('Preloading page to trigger compilation...');
    await preloadUrl(`http://localhost:${PORT}/`);
    await delay(4000);
    console.log('Server is ready! Capturing screenshots...');

    // 1. Updated Hero Section
    const heroShot = path.join(SCREENSHOT_DIR, 'hero_section_updated.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/`, heroShot, '1280,950');
    console.log('Captured Hero section:', heroShot);

    // 2. Bioconversion & Derivative Products Section (/biokonversi-preview)
    const biokonversiShot = path.join(SCREENSHOT_DIR, 'bsf_biokonversi_section.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/biokonversi-preview`, biokonversiShot, '1280,1850');
    console.log('Captured Biokonversi section:', biokonversiShot);

    // 3. Mascot Preview Studio (/mascot-preview)
    const mascotShot = path.join(SCREENSHOT_DIR, 'wawi_mascot_studio.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/mascot-preview`, mascotShot, '1280,1600');
    console.log('Captured Mascot studio:', mascotShot);

    // 3. Warga Dashboard (/warga)
    const wargaShot = path.join(SCREENSHOT_DIR, 'warga_dashboard.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/warga`, wargaShot, '1280,1100');
    console.log('Captured Warga dashboard:', wargaShot);

    // 4. Warga AI Classifier (/warga/klasifikasi)
    const klasifikasiShot = path.join(SCREENSHOT_DIR, 'warga_klasifikasi.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/warga/klasifikasi`, klasifikasiShot, '1280,1100');
    console.log('Captured Warga Klasifikasi:', klasifikasiShot);

    // 5. Petugas Tugas (/petugas/tugas)
    const petugasShot = path.join(SCREENSHOT_DIR, 'petugas_tugas.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/petugas/tugas`, petugasShot, '1280,1100');
    console.log('Captured Petugas Tugas:', petugasShot);

    // 6. Admin Penjemputan (/admin/penjemputan)
    const adminShot = path.join(SCREENSHOT_DIR, 'admin_penjemputan.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/admin/penjemputan`, adminShot, '1280,1100');
    console.log('Captured Admin Penjemputan:', adminShot);

    // Copy to artifact directory
    if (fs.existsSync(ARTIFACT_DIR)) {
      if (fs.existsSync(heroShot)) fs.copyFileSync(heroShot, path.join(ARTIFACT_DIR, 'hero_section_updated.png'));
      if (fs.existsSync(biokonversiShot)) fs.copyFileSync(biokonversiShot, path.join(ARTIFACT_DIR, 'bsf_biokonversi_section.png'));
      if (fs.existsSync(mascotShot)) fs.copyFileSync(mascotShot, path.join(ARTIFACT_DIR, 'wawi_mascot_studio.png'));
      if (fs.existsSync(wargaShot)) fs.copyFileSync(wargaShot, path.join(ARTIFACT_DIR, 'warga_dashboard.png'));
      if (fs.existsSync(klasifikasiShot)) fs.copyFileSync(klasifikasiShot, path.join(ARTIFACT_DIR, 'warga_klasifikasi.png'));
      console.log('Copied screenshots to artifact directory!');
    }
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    console.log('Stopping server...');
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(nextServer.pid), '/f', '/t'], { shell: true });
    } else {
      nextServer.kill();
    }
  }
}

main();
