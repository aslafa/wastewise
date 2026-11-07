import https from 'https';
import fs from 'fs';
import path from 'path';

function getJson(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'WasteWiseBot/1.0 (contact@wastewise.eco)' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'WasteWiseBot/1.0 (contact@wastewise.eco)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, dest).then(resolve).catch(reject);
      }
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  const targets = [
    {
      name: 'bsf_larvae_waste.jpg',
      fileTitle: 'File:Black_Soldier_Fly_Larvae-Waste_Management.jpg'
    },
    {
      name: 'bsf_larvae.jpg',
      fileTitle: 'File:Black_Soldier_Fly_Larvae.jpg'
    },
    {
      name: 'bsf_frass_kasgot.jpg',
      fileTitle: 'File:Wet_black_soldier_fly_frass.jpg'
    }
  ];

  for (const t of targets) {
    const apiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(t.fileTitle)}&prop=imageinfo&iiprop=url&format=json`;
    console.log('Querying API:', apiUrl);
    try {
      const res = await getJson(apiUrl);
      const pages = res.query?.pages;
      if (pages) {
        const pageId = Object.keys(pages)[0];
        const directUrl = pages[pageId]?.imageinfo?.[0]?.url;
        if (directUrl) {
          console.log('Direct URL found:', directUrl);
          const dest = path.resolve('web/public/images', t.name);
          await downloadFile(directUrl, dest);
          console.log('Successfully saved to:', dest, 'size:', fs.statSync(dest).size);
        } else {
          console.error('No url in imageinfo for', t.fileTitle);
        }
      }
    } catch (e) {
      console.error('Error fetching', t.name, e);
    }
  }
}

run();
