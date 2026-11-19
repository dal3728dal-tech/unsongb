#!/usr/bin/env node
/* DB 마이그레이션 자동 반영 — 절곡B 방식 그대로 */
'use strict';

const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
if (!TOKEN) { console.log('DB 반영: 건너뜀 (SUPABASE_ACCESS_TOKEN 없음)'); process.exit(0); }

const fs = require('fs');
const path = require('path');
const https = require('https');

const REF = 'vxiehnzccxntctyjyzuf';
const DIR = path.join(__dirname, '..', 'supabase', 'migrations');

async function main() {
  if (!fs.existsSync(DIR)) { console.log('DB 반영: migrations 폴더 없음'); return; }
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.sql')).sort();
  if (!files.length) { console.log('DB 반영: 파일 없음'); return; }

  // 이미 넣은 목록 가져오기
  const applied = await query("select filename from us_ops.migrations order by filename");
  const done = new Set((applied || []).map(r => r.filename));

  let count = 0;
  for (const f of files) {
    if (done.has(f)) continue;
    const sql = fs.readFileSync(path.join(DIR, f), 'utf8');
    console.log('DB 반영:', f);
    try {
      await query(sql);
      await query(`insert into us_ops.migrations (filename) values ('${f}')`);
      count++;
    } catch (e) {
      console.error('DB 반영 실패:', f, e.message || e);
      await query(`insert into us_ops.migrations (filename, success, message) values ('${f}', false, '${String(e.message || e).slice(0, 500).replace(/'/g, "''")}')`).catch(() => {});
      process.exit(1);
    }
  }
  console.log('DB 반영:', count ? count + '개 적용' : '새 파일 없음');
}

function query(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: REF + '.supabase.co',
      path: '/rest/v1/rpc/pg',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': TOKEN,
        'Authorization': 'Bearer ' + TOKEN,
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=representation'
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode >= 400) {
          // SQL Editor 직접 실행 방식 사용
          reject(new Error(d));
        } else {
          try { resolve(JSON.parse(d)); } catch { resolve(null); }
        }
      });
    });
    req.on('error', reject);
    req.end(body);
  });
}

main().catch(e => { console.error(e); process.exit(1); });
