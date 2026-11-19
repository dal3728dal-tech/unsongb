#!/usr/bin/env node
/* 시험 서버 — 가짜 Supabase, 비밀값 필요 없음 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2]) || 8782;
const PUBLIC = path.join(__dirname, '..', 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

function serve(req, res) {
  let url = req.url.split('?')[0];

  // 가짜 Supabase 응답
  if (url.startsWith('/rest/') || url.startsWith('/auth/')) {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    if (url.includes('/auth/v1/token')) {
      return res.end(JSON.stringify({
        access_token: 'mock-token',
        token_type: 'bearer',
        user: { id: '00000000-0000-0000-0000-000000000001', email: 'test@demo.unsong.bid' }
      }));
    }
    if (url.includes('/auth/v1/user')) {
      return res.end(JSON.stringify({
        id: '00000000-0000-0000-0000-000000000001',
        email: 'test@demo.unsong.bid'
      }));
    }
    return res.end('[]');
  }

  if (url === '/') url = '/index.html';

  // .html 확장자 없이도 찾기
  let file = path.join(PUBLIC, url);
  if (!fs.existsSync(file) && !path.extname(url)) {
    file = path.join(PUBLIC, url + '.html');
  }
  if (!fs.existsSync(file)) {
    file = path.join(PUBLIC, '404.html');
    if (!fs.existsSync(file)) { res.writeHead(404); return res.end('Not Found'); }
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return fs.createReadStream(file).pipe(res);
  }

  const ext = path.extname(file);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(serve);
server.listen(PORT, () => console.log('시험 서버: http://127.0.0.1:' + PORT));
