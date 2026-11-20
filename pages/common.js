/* 운송B 공통 JS */
'use strict';

window.US = window.US || {};

US.supabase = null;

US.initSupabase = function () {
  if (US.supabase) return US.supabase;
  if (!window.US_CONFIG || !window.supabase) return null;
  const { createClient } = window.supabase;
  US.supabase = createClient(US_CONFIG.supabaseUrl, US_CONFIG.supabaseKey);
  return US.supabase;
};

US.getUser = async function () {
  const sb = US.initSupabase();
  if (!sb) return null;
  const { data: { user } } = await sb.auth.getUser();
  return user;
};

US.getProfile = async function (uid) {
  const sb = US.initSupabase();
  if (!sb) return null;
  const { data } = await sb.from('profiles').select('*').eq('id', uid).single();
  return data;
};

US.eeumLogin = function (next) {
  const url = 'https://eeum.bid/login?svc=us' + (next ? '&next=' + encodeURIComponent(next) : '');
  location.href = url;
};

US.typeLabel = function (type) {
  return { orderer: '화주', producer: '생산자', driver: '화물기사', site: '현장' }[type] || type;
};

US.typeChip = function (type) {
  const colors = { orderer: '#3a7575', producer: '#4a8a4a', driver: '#8a6a3a', site: '#6a4a8a' };
  const label = US.typeLabel(type);
  return '<span style="display:inline-block;padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600;color:#fff;background:' + (colors[type] || '#888') + '">' + label + '</span>';
};

US.formatDate = function (d) {
  if (!d) return '';
  const dt = new Date(d);
  return dt.getFullYear() + '.' + String(dt.getMonth() + 1).padStart(2, '0') + '.' + String(dt.getDate()).padStart(2, '0');
};

/* 로그인 작은 창: 공통 스크립트(login-popup.js)가 eeum_popup=1을 보고 알리고 닫되,
   Supabase 토큰 저장이 끝날 때까지 기다리게 eeumPopupWait를 둠 */
if (new URLSearchParams(location.search).get('eeum_popup') === '1') {
  window.eeumPopupWait = US.getUser();
}
