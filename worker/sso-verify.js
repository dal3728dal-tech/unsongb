/* 이음B 입장권 확인 — 절곡B tools/sso-verify-example.js 기반 */

export async function verifyEeumTicket(t, { aud, jwkX, used }) {
  const dot = t.indexOf('.');
  if (dot < 0) throw new Error('입장권 형식 오류');
  const payB64 = t.slice(0, dot);
  const sigB64 = t.slice(dot + 1);

  const payload = JSON.parse(b64urlDec(payB64));

  if (payload.iss !== 'eeum.bid') throw new Error('iss 틀림');
  if (payload.aud !== aud) throw new Error('aud 틀림');

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now - 30) throw new Error('만료됨');
  if (payload.exp - payload.iat > 120) throw new Error('유효 기간 초과');
  if (!payload.jti || payload.jti.length !== 32) throw new Error('jti 형식 오류');

  // 1회용 확인
  if (used) {
    const dup = await used.check(payload.jti, payload.exp);
    if (dup) throw new Error('이미 쓴 입장권');
  }

  // Ed25519 서명 확인
  const jwk = { kty: 'OKP', crv: 'Ed25519', x: jwkX };
  const key = await crypto.subtle.importKey('jwk', jwk, { name: 'Ed25519' }, false, ['verify']);
  const data = new TextEncoder().encode(payB64);
  const sig = Uint8Array.from(atob(b64urlToB64(sigB64)), c => c.charCodeAt(0));
  const ok = await crypto.subtle.verify('Ed25519', key, sig, data);
  if (!ok) throw new Error('서명 틀림');

  return payload;
}

export async function verifyEeumCall(authHeader, { aud, jwkX, used, method, rawBody, sub, act }) {
  if (!authHeader || !authHeader.startsWith('Eeum ')) throw new Error('인증 없음');
  const t = authHeader.slice(5);
  const payload = await verifyEeumTicket(t, { aud, jwkX, used });

  if (sub && payload.sub !== sub) throw new Error('sub 틀림: ' + payload.sub);
  if (act && payload.act !== act) throw new Error('act 틀림: ' + payload.act);

  if (method === 'POST' && rawBody) {
    const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawBody));
    const bh = btoa(String.fromCharCode(...new Uint8Array(hash)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (payload.bh !== bh) throw new Error('본문 지문 틀림');
  }

  return payload;
}

function b64urlDec(s) {
  return new TextDecoder().decode(Uint8Array.from(atob(b64urlToB64(s)), c => c.charCodeAt(0)));
}
function b64urlToB64(s) {
  return s.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice(0, (4 - s.length % 4) % 4);
}
