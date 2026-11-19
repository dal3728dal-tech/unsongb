/* GET /api/eeum-admin — 이음B 운영 현황 */
import { verifyEeumCall } from './sso-verify.js';
import { createClient } from '@supabase/supabase-js';

export async function handleAdminInfo(request, env) {
  if (request.method !== 'GET') return json({ error: 'Method Not Allowed' }, 405);

  const jwkX = env.EEUM_SSO_JWK_X;
  if (!jwkX) return json({ error: '준비 중' }, 503);

  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return json({ error: '준비 중' }, 503);

  try {
    const auth = request.headers.get('Authorization') || '';

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
      method: 'GET',
      sub: 'eeum-info',
      act: 'info-read'
    });

    const sb = createClient(env.SUPABASE_URL, serviceKey, { auth: { persistSession: false } });
    const { data: info } = await sb.rpc('us_admin_info');

    return json(info || {
      updated: new Date().toISOString(),
      stats: [
        { key: 'members', label: '전체 회원', value: 0, unit: '명' },
        { key: 'new7', label: '최근 7일 가입', value: 0, unit: '명' },
        { key: 'paying', label: '유료 이용 중', value: 0, unit: '명' },
        { key: 'paid', label: '이번 달 결제', value: 0, unit: '원' }
      ],
      todo: [],
      lists: [],
      menu: [
        { label: '회원 관리', desc: '역할·상태·정지', link: '/admin#members' },
        { label: '운송 현황', desc: '진행 중·완료·문제', link: '/admin#shipments' },
        { label: '요금·설정', desc: '구독 요금·수수료', link: '/admin#settings' },
        { label: '차량 관리', desc: '차량 종류·규격', link: '/admin#vehicles' },
        { label: '정산', desc: '운임 정산 내역', link: '/admin#settlements' }
      ]
    });
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
