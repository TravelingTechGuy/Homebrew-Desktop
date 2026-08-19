#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const electronDir = path.join(projectRoot, 'node_modules', 'electron');
const pathTxt = path.join(electronDir, 'path.txt');
const distDir = path.join(electronDir, 'dist');

let relativeExec;
if (process.platform === 'darwin') {
  relativeExec = 'Electron.app/Contents/MacOS/Electron';
} else if (process.platform === 'win32') {
  relativeExec = 'electron.exe';
} else {
  relativeExec = 'electron';
}

const fullExec = path.join(distDir, relativeExec);

function isInstalled() {
  if (fs.existsSync(fullExec)) {
    fs.writeFileSync(pathTxt, relativeExec, 'utf8');
    try {
      execSync(`chmod +x "${fullExec}"`, { stdio: 'ignore' });
    } catch (e) {}
    return true;
  }
  return false;
}

if (isInstalled()) {
  process.exit(0);
}

console.log('\x1b[36m%s\x1b[0m', '[Homebrew Desktop] Electron binary missing in node_modules. Downloading via native macOS curl...');

const isArm = process.arch === 'arm64' || process.platform === 'darwin';
const arch = process.arch === 'arm64' ? 'darwin-arm64' : (process.platform === 'darwin' ? 'darwin-arm64' : 'darwin-x64');
const version = 'v34.3.0';
const zipName = `electron-${version}-${arch}.zip`;
const url = `https://github.com/electron/electron/releases/download/${version}/${zipName}`;
const tmpZip = path.join(electronDir, zipName);

try {
  if (!fs.existsSync(electronDir)) {
    fs.mkdirSync(electronDir, { recursive: true });
  }
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  console.log(`==> Fetching ${url}...`);
  execSync(`curl -L --fail --retry 3 --progress-bar -o "${tmpZip}" "${url}"`, { stdio: 'inherit' });

  console.log(`==> Extracting to ${distDir}...`);
  execSync(`unzip -o -q "${tmpZip}" -d "${distDir}"`, { stdio: 'inherit' });

  if (fs.existsSync(tmpZip)) {
    fs.unlinkSync(tmpZip);
  }

  fs.writeFileSync(pathTxt, relativeExec, 'utf8');

  try {
    execSync(`chmod +x "${fullExec}"`, { stdio: 'ignore' });
  } catch (e) {}

  console.log('\x1b[32m%s\x1b[0m', `✔ Electron successfully configured: ${fullExec}`);
} catch (err) {
  console.error('\x1b[31m%s\x1b[0m', `Failed to download Electron binary automatically: ${err.message}`);
  process.exit(1);
}

