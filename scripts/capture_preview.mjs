import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const PORT = 3005;
const SCREENSHOT_DIR = path.resolve('web/public/screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

function waitForServer(url, timeout = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const check = () => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      }).on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Server start timed out'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

function runEdgeScreenshot(url, outputPath, windowSize = '1280,1800') {
  return new Promise((resolve, reject) => {
    const args = [
      '--headless',
      '--disable-gpu',
      `--window-size=${windowSize}`,
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
  console.log('Starting Next.js production server on port', PORT);
  const nextServer = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: path.resolve('web'),
    shell: true,
  });

  nextServer.stdout.on('data', (d) => process.stdout.write(d.toString()));
  nextServer.stderr.on('data', (d) => process.stderr.write(d.toString()));

  try {
    console.log('Waiting for Next.js server to be ready...');
    await waitForServer(`http://localhost:${PORT}/`);
    console.log('Server is ready! Capturing screenshots...');

    // 1. Full page overview / Hero
    const heroShot = path.join(SCREENSHOT_DIR, 'hero_section.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/`, heroShot, '1280,900');
    console.log('Captured Hero section:', heroShot, fs.statSync(heroShot).size, 'bytes');

    // 2. Ekosistem Terintegrasi
    const ekoShot = path.join(SCREENSHOT_DIR, 'ekosistem_section.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/#ekosistem`, ekoShot, '1280,1400');
    console.log('Captured Ekosistem section:', ekoShot, fs.statSync(ekoShot).size, 'bytes');

    // 3. Biokonversi BSF Section
    const bsfShot = path.join(SCREENSHOT_DIR, 'bsf_biokonversi_section.png');
    await runEdgeScreenshot(`http://localhost:${PORT}/#maggot-bsf`, bsfShot, '1280,2400');
    console.log('Captured BSF section:', bsfShot, fs.statSync(bsfShot).size, 'bytes');

    console.log('All screenshots captured successfully!');
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

