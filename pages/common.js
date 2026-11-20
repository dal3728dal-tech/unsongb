/* 운송B 공통 JS */
'use strict';

window.US = window.US || {};

US.supabase = null;

US.initSupabase = function () {
  if (US.supabase) return US.supabase;
  if (!window.USConfig) return null;
  const { createClient } = window.supabase;
  US.supabase = createClient(USConfig.supabaseUrl, USConfig.supabaseKey);
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

/* 로그인 작은 창: login-popup.js가 작은 창을 열고, 로그인 뒤 작은 창이 next + eeum_popup=1로 돌아옴.
   Supabase가 # 뒤 토큰을 저장하는 데 시간이 걸림 → 공통 스크립트보다 먼저 표시를 지우고,
   저장이 끝난 뒤에 원래 페이지에 알리고 닫음 */
(function () {
  var q = new URLSearchParams(location.search);
  if (q.get('eeum_popup') !== '1') return;
  q.delete('eeum_popup');
  try { history.replaceState(null, '', location.pathname + (q.toString() ? '?' + q : '') + location.hash); } catch (e) {}
  if (!window.opener) return;
  var sent = false;
  function tell() {
    if (sent) return; sent = true;
    try { var bc = new BroadcastChannel('eeum-login'); bc.postMessage('done'); setTimeout(function () { bc.close(); }, 500); } catch (e) {}
    try { localStorage.setItem('eeum-login-done', String(Date.now())); } catch (e) {}
    try { if (window.opener && !window.opener.closed) window.opener.postMessage({ type: 'eeum-login' }, location.origin); } catch (e) {}
    setTimeout(function () { try { window.close(); } catch (e) {} }, 150);
    setTimeout(function () {
      if (window.closed || !document.body) return;
      var d = document.createElement('div'); d.setAttribute('role', 'status');
      d.style.cssText = 'position:fixed;left:50%;bottom:16px;transform:translateX(-50%);z-index:2147483647;background:#1f2933;color:#fff;font:600 14px/1.4 Pretendard,system-ui,sans-serif;padding:12px 16px;border-radius:14px;max-width:calc(100vw - 32px)';
      d.textContent = '로그인됐습니다. 이 창은 닫아도 됩니다.'; document.body.appendChild(d);
    }, 900);
  }
  setTimeout(tell, 10000);
  US.getUser().then(tell, tell);
})();
