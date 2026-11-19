#!/usr/bin/env node
/* 운송B 빌드 — node build.cjs → public/ */
const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT = path.join(SRC, 'public');

// public 폴더 초기화
if (fs.existsSync(OUT)) fs.rmSync(OUT, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

// pages/ 복사
const pagesDir = path.join(SRC, 'pages');
if (fs.existsSync(pagesDir)) {
  copyDir(pagesDir, OUT);
}

// config.js 복사
copyFile('config.js', OUT);

// icons.js 복사
if (fs.existsSync(path.join(SRC, 'pages', 'icons.js')))
  copyFile(path.join('pages', 'icons.js'), OUT);

// 파비콘 복사 (brand/favicon/unsong-*)
const favDir = path.join(SRC, 'brand', 'favicon');
if (fs.existsSync(favDir)) {
  for (const f of fs.readdirSync(favDir)) {
    if (f.startsWith('unsong')) fs.copyFileSync(path.join(favDir, f), path.join(OUT, f));
  }
}

console.log('빌드 완료 → public/');

function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      fs.mkdirSync(d, { recursive: true });
      copyDir(s, d);
    } else {
      fs.copyFileSync(s, d);
    }
  }
}

function copyFile(rel, dest) {
  const src = path.join(SRC, rel);
  const out = path.join(dest, path.basename(rel));
  if (fs.existsSync(src)) fs.copyFileSync(src, out);
}
