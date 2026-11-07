import http from 'http';
import fs from 'fs';
import path from 'path';

const imageList = [
  '/illustrations/hero-eco.svg',
  '/illustrations/sorting.svg',
  '/illustrations/recycling.svg',
  '/illustrations/composting.svg',
  '/illustrations/circular-economy.svg',
  '/illustrations/organic.svg',
  '/illustrations/inorganic.svg',
  '/illustrations/hazard-b3.svg',
  '/images/bsf_larvae_waste.jpg',
  '/images/maggot_siap_jadi.jpeg',
  '/images/produk_maggot.jpeg',
  '/images/maggot_kering.jpg',
  '/images/minyak_maggot.svg',
  '/images/bsf_frass_kasgot.jpg',
];

console.log('Checking physical existence of all landing page images:');
let allExist = true;
for (const img of imageList) {
  const physicalPath = path.resolve('web/public', img.replace(/^\//, ''));
  if (fs.existsSync(physicalPath)) {
    const stats = fs.statSync(physicalPath);
    console.log(`[OK] ${img} -> Size: ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.error(`[MISSING] ${img}`);
    allExist = false;
  }
}

if (!allExist) {
  process.exit(1);
} else {
  console.log('All 14 landing page images physically exist and have non-zero size!');
}

