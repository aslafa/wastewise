import { spawn } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const outputPath = path.resolve('web/public/screenshots/test_success.png');
const tmpDir = path.join(os.tmpdir(), `edge_test_${Date.now()}`);

const args = [
  '--headless',
  '--disable-gpu',
  `--user-data-dir=${tmpDir}`,
  `--screenshot=${outputPath}`,
  'data:text/html,<html><body style="background:green"><h1 style="color:white">EDGE SCREENSHOT SUCCESS</h1></body></html>',
];

console.log('Running Edge with args:', args);
const proc = spawn(EDGE_PATH, args);
proc.on('close', (code) => {
  console.log('Edge exited with code:', code);
  if (fs.existsSync(outputPath)) {
    console.log('Output file exists! Size:', fs.statSync(outputPath).size);
  } else {
    console.log('Output file DOES NOT exist.');
  }
});

