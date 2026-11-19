/* POST /api/eeum-login — 이음B 통합 회원 로그인 */
import { verifyEeumTicket } from './sso-verify.js';
import { createClient } from '@supabase/supabase-js';

export async function handleLogin(request, env) {
  if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const origin = request.headers.get('Origin') || '';
  if (origin !== 'https://eeum.bid') {
    return new Response('Forbidden', { status: 403 });
  }

  try {
    const body = await request.formData();
    const t = body.get('t');
    if (!t) return loginFail('입장권 없음');

    const jwkX = env.EEUM_SSO_JWK_X;
    if (!jwkX) return new Response('준비 중', { status: 503 });

    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) return new Response('준비 중', { status: 503 });

    // jti 1회용
    const used = {
      async check(jti) {
        const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
        const { data } = await sb.from('eeum_sso_log').select('jti').eq('jti', jti).maybeSingle();
        return !!data;
      }
    };

    const payload = await verifyEeumTicket(t, {
      aud: 'unsong.bid',
      jwkX,
      used
    });

    if (payload.sub !== 'eeum-member') return loginFail('회원 입장권 아님');
    if (payload.status === 'blocked') return loginFail('정지된 계정입니다');

    const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

    // eeum_uid로 운송B 회원 찾기 또는 만들기
    let { data: profile } = await sb.from('profiles')
      .select('id, eeum_uid, email, name, role, status')
      .eq('eeum_uid', payload.uid)
      .maybeSingle();

    if (!profile) {
      // 첫 로그인 — 회원 만들기
      const { data: authUser, error: authErr } = await sb.auth.admin.createUser({
        email: payload.email,
        email_confirm: true,
        user_metadata: { name: payload.name, eeum_uid: payload.uid }
      });
      if (authErr) return loginFail('계정 생성 실패: ' + authErr.message);

      await sb.from('profiles').update({
        eeum_uid: payload.uid,
        name: payload.name,
        phone: payload.phone || '',
        member_type: payload.role || 'orderer',
        status: payload.status || 'trial'
      }).eq('id', authUser.user.id);

      // 체험 구독 만들기
      if (payload.until) {
        await sb.from('subscriptions').upsert({
          user_id: authUser.user.id,
          expires_at: payload.until + 'T23:59:59+09:00',
          source: 'eeum',
          tier: 'basic'
        }, { onConflict: 'user_id' });
      }

      profile = { id: authUser.user.id, eeum_uid: payload.uid };
    } else {
      // 기존 회원 — 역할·상태 갱신
      await sb.from('profiles').update({
        member_type: payload.role || profile.role,
        status: payload.status || profile.status,
        name: payload.name || profile.name
      }).eq('id', profile.id);
    }

    // 1회용 로그인 링크
    const redirect = payload.next && payload.next.startsWith('/') && !payload.next.startsWith('//')
      ? payload.next : '/';

    const { data: link, error } = await sb.auth.admin.generateLink({
      type: 'magiclink',
      email: payload.email,
      options: { redirectTo: `https://unsong.bid${redirect}` }
    });

    if (error || !link?.properties?.action_link) return loginFail('로그인 링크 실패');

    // 기록
    await sb.from('eeum_sso_log').insert({
      jti: payload.jti, admin_id: profile.id, next: redirect
    }).catch(() => {});

    return Response.redirect(link.properties.action_link, 303);
  } catch (e) {
    return loginFail(e.message);
  }
}

function loginFail(msg) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>운송B</title></head>
<body style="font-family:Pretendard,sans-serif;text-align:center;padding:60px 20px">
<h2>로그인 실패</h2><p>${msg}</p>
<p><a href="https://unsong.bid/">운송B 첫 화면</a></p></body></html>`;
  return new Response(html, { status: 401, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
