/* POST /api/eeum-sso — 이음B 관리자 한 번 로그인 */
import { verifyEeumTicket } from './sso-verify.js';
import { createClient } from '@supabase/supabase-js';

export async function handleSSO(request, env) {
  if (request.method === 'GET') return new Response('Method Not Allowed', { status: 405 });
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const origin = request.headers.get('Origin') || '';
  if (origin !== 'https://eeum.bid') {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body = await request.formData();
    const t = body.get('t');
    if (!t) return ssoFail('입장권 없음');

    const jwkX = env.EEUM_SSO_JWK_X;
    if (!jwkX) return new Response('준비 중', { status: 503 });

    // 입장권 확인을 먼저 — 엉터리 입장권은 비밀값 없어도 401
    const used = jtiChecker(env);

    const payload = await verifyEeumTicket(t, {
      aud: 'unsong.bid',
      jwkX,
      used
    });

    if (payload.sub !== 'eeum-admin') return ssoFail('관리자 입장권 아님');

    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return new Response('준비 중', { status: 503 });

    // 최고관리자 확인
    const adminEmail = env.EEUM_SSO_ADMIN || 'dal106@admin.unsong.bid';
    const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

    const { data: profile } = await sb.from('profiles')
      .select('id, email, role, status')
      .eq('email', adminEmail)
      .eq('role', 'admin')
      .single();

    if (!profile) return ssoFail('관리자 계정이 없습니다');

    // 1회용 로그인 링크
    const redirect = payload.next && payload.next.startsWith('/') && !payload.next.startsWith('//')
      ? payload.next : '/admin';

    const { data: link, error } = await sb.auth.admin.generateLink({
      type: 'magiclink',
      email: adminEmail,
      options: { redirectTo: `https://unsong.bid${redirect}` }
    });

    if (error || !link?.properties?.action_link) return ssoFail('로그인 링크 실패');

    // 기록
    await sb.from('eeum_sso_log').insert({
      jti: payload.jti, admin_id: profile.id, next: redirect
    }).catch(() => {});

    return Response.redirect(link.properties.action_link, 303);
  } catch (e) {
    return ssoFail(e.message);
  }
}

function ssoFail(msg) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>운송B 관리자</title></head>
<body style="font-family:Pretendard,sans-serif;text-align:center;padding:60px 20px">
<h2>관리자 로그인 실패</h2><p>${msg}</p>
<p><a href="https://unsong.bid/account">관리자 로그인</a></p></body></html>`;
  return new Response(html, { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

function jtiChecker(env) {
  // Supabase eeum_sso_log 표로 1회용 확인
  return {
    async check(jti, exp) {
      if (!env.SUPABASE_SERVICE_ROLE_KEY) return false;
      const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      const { data } = await sb.from('eeum_sso_log').select('jti').eq('jti', jti).maybeSingle();
      return !!data;
    }
  };
}
