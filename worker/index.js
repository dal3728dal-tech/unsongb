/* 운송B 워커 — Cloudflare Workers */

import { handleSSO } from './sso.js';
import { handleBilling } from './billing.js';
import { handleAdminInfo } from './admininfo.js';
import { handleLogin } from './login.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;

    // 이음B 관리자 한 번 로그인
    if (p === '/api/eeum-sso') return handleSSO(request, env);

    // 이음B 통합 회원 로그인
    if (p === '/api/eeum-login') return handleLogin(request, env);

    // 이음B 구독·결제 기준
    if (p === '/api/eeum-billing') return handleBilling(request, env);

    // 이음B 운영 현황
    if (p === '/api/eeum-admin') return handleAdminInfo(request, env);

    // AI 상태 (나중)
    if (p === '/api/ai-status') return json({ claude: false, free: false });

    // /favicon.ico → eeum.bid 파비콘
    if (p === '/favicon.ico') return Response.redirect('https://eeum.bid/brand/favicon/unsong.ico', 301);

    // 정적 자산은 ASSETS가 처리
    return env.ASSETS.fetch(request);
  }
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
