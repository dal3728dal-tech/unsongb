// 이음B 현장 공유 중계(11/19, CONNECT.md "현장 공유")
//  현장 목록 원본 = 이음B(eeum.bid/api/sites)
//  운쏭B 화면 → /api/eeum-sites[/<id>] (머리값 Authorization: Bearer <운쏭B 로그인 토큰>)
//   → 워커가 그 회원의 이음B 열쇠(eeum_tokens.sites_token)로 이음B를 대신 부름
//  열쇠가 없거나(아이디·비밀번호 로그인·체험 계정) 만료·이음B 401이면 409 {relogin} → 이음B로 다시 로그인
import { createClient } from '@supabase/supabase-js';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
});
const EEUM = 'https://eeum.bid';

export async function handleSites(request, env, subPath) {
  if (!['GET', 'POST', 'DELETE'].includes(request.method)) return json({ error: 'GET · POST · DELETE만 됩니다' }, 405);

  const id = String(subPath || '').replace(/^\/+/, '');
  if (id && !/^[A-Za-z0-9_-]{1,64}$/.test(id)) return json({ error: '현장 번호가 맞지 않습니다' }, 400);
  if (request.method === 'DELETE' && !id) return json({ error: '보관할 현장을 고르세요' }, 400);

  const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: '로그인이 필요합니다' }, 401);

  const SR = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SR) return json({ error: '준비 중' }, 503);

  // 로그인 확인
  const sb = createClient(env.SUPABASE_URL, env.SUPABASE_KEY, {
    auth: { persistSession: false },
    global: { headers: { Authorization: 'Bearer ' + token } }
  });
  const { data: { user }, error: userErr } = await sb.auth.getUser(token);
  if (userErr || !user) return json({ error: '로그인이 만료되었습니다. 다시 로그인하세요' }, 401);

  // service_role로 열쇠 조회
  const sbAdmin = createClient(env.SUPABASE_URL, SR, { auth: { persistSession: false } });
  const { data: row } = await sbAdmin.from('eeum_tokens')
    .select('sites_token, expires_at')
    .eq('user_id', user.id)
    .maybeSingle();

  const relogin = (why) => json({
    error: why + ' 이음B 통합 로그인으로 다시 들어오면 현장 목록을 쓸 수 있습니다.',
    relogin: true,
    login: EEUM + '/login?svc=us&next=' + encodeURIComponent('/')
  }, 409);

  if (!row) return relogin('이음B 현장 열쇠가 없습니다(아이디·비밀번호로 로그인했거나 체험 계정).');
  if (Date.parse(row.expires_at) < Date.now()) return relogin('이음B 현장 열쇠가 만료되었습니다(30일).');

  // POST 본문 읽기
  let body;
  if (request.method === 'POST') {
    const raw = await request.text();
    if (raw.length > 20000) return json({ error: '내용이 너무 깁니다' }, 413);
    try { JSON.parse(raw || '{}'); } catch (e) { return json({ error: '본문이 JSON이 아닙니다' }, 400); }
    body = raw || '{}';
  }

  // 이음B에 중계
  const r = await fetch(EEUM + '/api/sites' + (id ? '/' + id : ''), {
    method: request.method,
    headers: Object.assign(
      { Authorization: 'Bearer ' + row.sites_token },
      body ? { 'Content-Type': 'application/json' } : {}
    ),
    body
  });

  // 이음B 401 → 열쇠 삭제 + 다시 로그인 안내
  if (r.status === 401) {
    await sbAdmin.from('eeum_tokens').delete().eq('user_id', user.id).catch(() => {});
    return relogin('이음B 현장 열쇠가 더 이상 맞지 않습니다.');
  }

  const txt = await r.text();
  return new Response(txt || '{}', {
    status: r.status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

// 통합 로그인(login.js)에서: 입장권의 sites_token을 그 회원 것으로 저장(30일)
export async function saveSitesToken(env, userId, sitesToken) {
  if (typeof sitesToken !== 'string' || !sitesToken || sitesToken.length > 4000) return;
  const SR = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SR) return;
  const sb = createClient(env.SUPABASE_URL, SR, { auth: { persistSession: false } });
  await sb.from('eeum_tokens').upsert({
    user_id: userId,
    sites_token: sitesToken,
    expires_at: new Date(Date.now() + 30 * 864e5).toISOString(),
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' }).catch(() => {});
}
