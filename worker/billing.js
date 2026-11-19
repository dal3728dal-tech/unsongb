/* GET/POST /api/eeum-billing — 이음B 구독·결제 기준 관리 */
import { verifyEeumCall } from './sso-verify.js';
import { createClient } from '@supabase/supabase-js';

export async function handleBilling(request, env) {
  const method = request.method;
  if (method !== 'GET' && method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const jwkX = env.EEUM_SSO_JWK_X;
  if (!jwkX) return json({ error: '준비 중' }, 503);

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return json({ error: '준비 중' }, 503);

  try {
    const auth = request.headers.get('Authorization') || '';
    const rawBody = method === 'POST' ? await request.text() : null;

    const used = {
      async check(jti) {
        const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
        const { data } = await sb.from('eeum_sso_log').select('jti').eq('jti', jti).maybeSingle();
        return !!data;
      }
    };

    await verifyEeumCall(auth, {
      aud: 'unsong.bid',
      jwkX,
      used,
      method,
      rawBody,
      sub: 'eeum-billing',
      act: method === 'GET' ? 'billing-read' : 'billing-write'
    });

    const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });

    if (method === 'GET') {
      const { data: result } = await sb.rpc('bb_billing_get');
      return json(result || { rev: '', groups: [], fields: [], values: {}, log: [] });
    }

    // POST
    const body = JSON.parse(rawBody);
    const { data: result, error } = await sb.rpc('bb_billing_apply', {
      p_rev: body.rev || '',
      p_changes: body.changes || {}
    });

    if (error) {
      if (error.message.includes('rev')) return json({ error: '그사이 바뀌었습니다. 새로고침하세요.' }, 409);
      return json({ error: error.message }, 400);
    }

    return json(result);
  } catch (e) {
    if (e.message.includes('인증') || e.message.includes('서명') || e.message.includes('만료')) {
      return json({ error: e.message }, 401);
    }
    return json({ error: e.message }, 400);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' }
  });
}
