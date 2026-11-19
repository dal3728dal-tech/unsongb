/* GET/POST /api/eeum-billing — 이음B 구독·결제 기준 관리 (공통 꼴 2판 2026-11-19)
   세 묶음: plans(요금제 = 구독 + 세금계산서 + opt) → discount(기간 할인) → options(서비스 전체 제한)
   값의 원본 = 운송B DB plans · app_config. service_role로 us_billing_get · us_billing_apply만 부름 */
import { verifyEeumCall } from './sso-verify.js';

const AUD = 'unsong.bid';
const json = (o, s = 200) => new Response(JSON.stringify(o), {
  status: s, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
});

const PERIODS = [{ v: 'month', t: '월' }, { v: 'year', t: '연' }];
const PAYS    = [{ v: 'bank', t: '계좌입금' }, { v: 'card', t: '카드' }, { v: 'invoice', t: '세금계산서' }];
const ROLES   = [{ v: 'all', t: '전체' }, { v: 'orderer', t: '화주' }, { v: 'producer', t: '생산자' }, { v: 'driver', t: '화물기사' }, { v: 'site', t: '현장' }];
const WHO     = [{ v: 'new', t: '새로 구독하는 사람만' }, { v: 'all', t: '기존 구독 갱신 포함' }];
const BASES   = [
  { v: 'prorata', t: '일할 계산(결제금액 × 쓴 날 ÷ 기간 일수)' },
  { v: 'monthly_price', t: '월 정가(연 구독은 쓴 개월 × 월 정가)' }
];
const APPLY = {
  plan: '다음 신청부터', active: '바로', trial: '새로 가입하는 분부터',
  discount: '바로(다음 결제부터)', option: '바로',
  bank: '바로(다음 입금 안내부터)', refund: '바로(다음 환불 계산부터)'
};

function monthsToPeriod(m) { return m >= 12 ? 'year' : 'month'; }
function periodToMonths(p) { return p === 'year' ? 12 : 1; }

/* DB 값 → {groups, fields, values} */
function shape(db) {
  const C = db.config || {};
  const groups = [], fields = [], values = {};
  const add = (f, v) => { fields.push({ help: '', readonly: false, ...f }); values[f.key] = v; };

  // ── 1. plans ──
  groups.push({ id: 'plans', title: '요금제', note: '금액은 부가세 포함(원). 요금제 추가·삭제는 운송B 관리자에서' });
  for (const p of db.plans || []) {
    const k = 'plans.' + p.id + '.';
    const nm = p.name || p.id;

    // 구독
    add({ key: k + 'name',   group: 'plans', label: nm + ' — 이름',      type: 'text',   applies: APPLY.plan }, nm);
    add({ key: k + 'on',     group: 'plans', label: nm + ' — 판매 중',   type: 'bool',   applies: APPLY.active }, !!p.active);
    add({ key: k + 'price',  group: 'plans', label: nm + ' — 금액',      type: 'money',  unit: '원', min: 0, max: 10000000, step: 100, applies: APPLY.plan }, p.price || 0);
    add({ key: k + 'period', group: 'plans', label: nm + ' — 기간',      type: 'select', options: PERIODS, applies: APPLY.plan }, monthsToPeriod(p.months));
    add({ key: k + 'pay',    group: 'plans', label: nm + ' — 결제 방법',  type: 'select', options: PAYS, applies: APPLY.plan }, p.pay || 'bank');
    const role = (p.member_types?.length === 1) ? p.member_types[0] : 'all';
    add({ key: k + 'role',   group: 'plans', label: nm + ' — 대상 역할',  type: 'select', options: ROLES, applies: APPLY.plan }, role);

    // 세금계산서
    add({ key: k + 'invoice',        group: 'plans', label: nm + ' — 세금계산서',      type: 'bool',   applies: APPLY.plan, help: '세금계산서로도 살 수 있음(사업자, 입금 확인 뒤)' }, !!p.invoice);
    add({ key: k + 'invoice_price',  group: 'plans', label: nm + ' — 세금계산서 금액', type: 'money',  unit: '원', min: 0, max: 10000000, step: 100, applies: APPLY.plan }, p.invoice_price || 0);
    add({ key: k + 'invoice_period', group: 'plans', label: nm + ' — 세금계산서 기간', type: 'select', options: PERIODS, applies: APPLY.plan }, p.invoice_period || 'year');

    // 이 요금제 옵션 (opt.*)
    const opt = p.opt || {};
    add({ key: k + 'opt.fee_per_trip', group: 'plans', label: nm + ' — 건당 수수료',       type: 'money',   unit: '원', min: 0, max: 1000000, step: 100, applies: APPLY.option, help: '이 요금제 운송 건마다 붙는 수수료(0 = 없음)' }, Number(opt.fee_per_trip || 0));
    add({ key: k + 'opt.rate_pct',     group: 'plans', label: nm + ' — 운임 중개 수수료율', type: 'percent', unit: '%', min: 0, max: 50, step: 1, applies: APPLY.option, help: '이 요금제 운임의 몇 %를 수수료로(0 = 없음)' }, Number(opt.rate_pct || 0));
  }
  add({ key: 'plans.trial_days', group: 'plans', label: '무료 체험 기간', type: 'days', unit: '일', min: 0, max: 365, step: 1, applies: APPLY.trial }, Number(C.trial_days || 0));

  // ── 2. discount ──
  const disc = C.discount || {};
  const planOpts = [{ v: 'all', t: '전체 요금제' }, ...(db.plans || []).map(p => ({ v: p.id, t: p.name || p.id }))];
  groups.push({ id: 'discount', title: '기간 할인', note: '할인 기간(한국 날짜)에 결제하면 할인(원 단위 내림)' });
  add({ key: 'discount.on',     group: 'discount', label: '할인 켜기',       type: 'bool',    applies: APPLY.discount }, !!disc.on);
  add({ key: 'discount.label',  group: 'discount', label: '화면에 보일 이름', type: 'text',    applies: APPLY.discount }, disc.label || '');
  add({ key: 'discount.pct',    group: 'discount', label: '할인율',          type: 'percent', unit: '%', min: 0, max: 90, step: 1, applies: APPLY.discount }, Number(disc.pct || 0));
  add({ key: 'discount.from',   group: 'discount', label: '시작일',          type: 'date',    applies: APPLY.discount, help: '비우면 끝없음' }, disc.from || '');
  add({ key: 'discount.to',     group: 'discount', label: '끝나는 날',       type: 'date',    applies: APPLY.discount, help: '비우면 끝없음' }, disc.to || '');
  add({ key: 'discount.target', group: 'discount', label: '적용 대상',       type: 'select',  options: planOpts, applies: APPLY.discount }, disc.target || 'all');
  add({ key: 'discount.who',    group: 'discount', label: '대상',            type: 'select',  options: WHO, applies: APPLY.discount }, disc.who || 'new');

  // ── 3. options (서비스 전체 제한만) ──
  groups.push({ id: 'options', title: '서비스 옵션', note: '운송B 전체 제한(요금제별 수수료는 요금제 옵션에)' });

  // ── bank ──
  const bk = C.bank || {};
  groups.push({ id: 'bank', title: '입금 계좌', note: '계좌입금 결제용' });
  add({ key: 'bank.bank',    group: 'bank', label: '은행',     type: 'text', applies: APPLY.bank }, bk.bank || '');
  add({ key: 'bank.account', group: 'bank', label: '계좌번호', type: 'text', applies: APPLY.bank }, bk.account || '');
  add({ key: 'bank.holder',  group: 'bank', label: '예금주',   type: 'text', applies: APPLY.bank }, bk.holder || '');

  // ── refund ──
  const rp = { withdraw_days: 7, penalty_rate: 10, basis: 'prorata', ...(C.refund_policy || {}) };
  groups.push({ id: 'refund', title: '환불 규정' });
  add({ key: 'refund_policy.withdraw_days', group: 'refund', label: '청약철회 기간', type: 'days',    unit: '일', min: 7, max: 60, step: 1, applies: APPLY.refund, help: '법정 최소 7일' }, Number(rp.withdraw_days));
  add({ key: 'refund_policy.penalty_rate',  group: 'refund', label: '중도 해지 위약금', type: 'percent', unit: '%', min: 0, max: 10, step: 1, applies: APPLY.refund, help: '남은 기간 금액의(최대 10%)' }, Number(rp.penalty_rate));
  add({ key: 'refund_policy.basis',         group: 'refund', label: '쓴 날 금액 계산', type: 'select',  options: BASES, applies: APPLY.refund }, rp.basis === 'monthly_price' ? 'monthly_price' : 'prorata');

  return { groups, fields, values };
}

/* values 전체 → SHA-256 앞 16자(낙관적 동시성) */
async function revOf(values) {
  const keys = Object.keys(values).sort();
  const src = JSON.stringify(keys.map(k => [k, values[k]]));
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(src)));
  return [...d.slice(0, 8)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/* 칸 하나 확인 → 저장할 값(틀리면 throw 한국어) */
function check(f, v) {
  const bad = m => { throw new Error(f.label + ': ' + m); };
  if (f.readonly) bad('여기서는 바꿀 수 없습니다');
  if (['money', 'int', 'percent', 'days'].includes(f.type)) {
    if (typeof v !== 'number' || !isFinite(v)) bad('숫자가 아닙니다');
    if (!Number.isInteger(v)) bad('정수로 적어 주세요');
    if (f.min != null && v < f.min) bad(f.min + ' 이상이어야 합니다');
    if (f.max != null && v > f.max) bad(f.max + ' 이하여야 합니다');
    return v;
  }
  if (f.type === 'bool')   { if (typeof v !== 'boolean') bad('켜기/끄기 값이 아닙니다'); return v; }
  if (f.type === 'select') { if (!f.options.some(o => o.v === v)) bad('고를 수 없는 값입니다'); return v; }
  if (f.type === 'date') {
    if (v !== '' && (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(Date.parse(v + 'T00:00:00+09:00'))))
      bad('날짜(YYYY-MM-DD)가 아닙니다');
    return v;
  }
  if (f.type === 'text') { if (typeof v !== 'string' || v.length > 200) bad('글자(200자까지)가 아닙니다'); return v.trim(); }
  bad('알 수 없는 칸');
}

/* Supabase REST RPC 직접 호출 */
async function rpc(env, fn, args) {
  const H = {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
    'content-type': 'application/json'
  };
  const r = await fetch(env.SUPABASE_URL + '/rest/v1/rpc/' + fn, {
    method: 'POST', headers: H, body: JSON.stringify(args || {})
  });
  const t = await r.text();
  if (!r.ok) {
    let m = t;
    try { m = JSON.parse(t).message || t; } catch {}
    throw new Error(m);
  }
  return t ? JSON.parse(t) : null;
}

/* jti를 eeum_sso_log에 기록 */
async function logJti(env, authHeader, label) {
  const t = (authHeader || '').startsWith('Eeum ') ? authHeader.slice(5) : '';
  if (!t) return;
  const dot = t.indexOf('.');
  if (dot <= 0) return;
  try {
    const b64 = t.slice(0, dot).replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - b64.length % 4) % 4);
    const pay = JSON.parse(atob(b64 + pad));
    const H = {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY,
      'content-type': 'application/json',
      prefer: 'return=minimal'
    };
    await fetch(env.SUPABASE_URL + '/rest/v1/eeum_sso_log', {
      method: 'POST', headers: H,
      body: JSON.stringify({ jti: pay.jti, admin_email: label, created_at: new Date().toISOString() })
    });
  } catch {}
}

export async function handleBilling(request, env) {
  if (request.method !== 'GET' && request.method !== 'POST') return json({ error: 'GET · POST만 됩니다' }, 405);

  const X = env.EEUM_SSO_JWK_X;
  if (!X) return json({ error: '준비 중' }, 503);

  const rawBody = request.method === 'POST' ? await request.text() : '';

  try {
    // 입장권 확인을 먼저 — 엉터리 입장권은 비밀값 없어도 401
    const used = {
      async check(jti) {
        const SR = env.SUPABASE_SERVICE_ROLE_KEY;
        if (!SR) return false;
        const H = { apikey: SR, authorization: 'Bearer ' + SR, accept: 'application/vnd.pgrst.object+json' };
        const r = await fetch(env.SUPABASE_URL + '/rest/v1/eeum_sso_log?jti=eq.' + jti, { headers: H });
        return r.ok && r.status !== 406;
      }
    };
    await verifyEeumCall(request.headers.get('authorization'), {
      aud: AUD, jwkX: X, used,
      method: request.method, rawBody,
      sub: 'eeum-billing',
      act: request.method === 'GET' ? 'billing-read' : 'billing-write'
    });

    const SR = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!SR) return json({ error: '준비 중' }, 503);

    await logJti(env, request.headers.get('authorization'), 'eeum-billing:' + request.method);

    const db = await rpc(env, 'us_billing_get');
    const cur = shape(db);
    const rev = await revOf(cur.values);

    if (request.method === 'GET') {
      return json({ rev, groups: cur.groups, fields: cur.fields, values: cur.values, log: db.log || [] });
    }

    // POST: 저장
    let body;
    try { body = JSON.parse(rawBody); } catch { return json({ error: '본문이 JSON이 아닙니다' }, 400); }
    if (!body || typeof body.changes !== 'object' || Array.isArray(body.changes)) {
      return json({ error: 'changes가 없습니다' }, 400);
    }
    if (body.rev !== rev) {
      return json({ error: '그사이 다른 곳에서 값이 바뀌었습니다. 새로 불러온 뒤 다시 저장하세요', rev }, 409);
    }

    const byKey = Object.fromEntries(cur.fields.map(f => [f.key, f]));
    const plans = {}, conf = {};
    const log = {};
    const db0 = db.config || {};

    for (const [k, val] of Object.entries(body.changes)) {
      const f = byKey[k];
      if (!f) throw new Error('없는 칸: ' + k);
      const nv = check(f, val);
      if (nv === cur.values[k]) continue;
      log[k] = [cur.values[k], nv];

      // plans.<id>.<col> (구독 + 세금계산서)
      const pm = /^plans\.([^.]+)\.(name|on|price|period|pay|role|invoice|invoice_price|invoice_period)$/.exec(k);
      if (pm) {
        const [, pid, col] = pm;
        const po = plans[pid] = plans[pid] || {};
        if (col === 'on') po.active = nv;
        else if (col === 'period') po.months = periodToMonths(nv);
        else if (col === 'role') po.member_types = nv === 'all' ? null : [nv];
        else po[col] = nv;
        continue;
      }

      // plans.<id>.opt.<name> (요금제별 옵션)
      const om2 = /^plans\.([^.]+)\.opt\.(.+)$/.exec(k);
      if (om2) {
        const [, pid, optKey] = om2;
        const po = plans[pid] = plans[pid] || {};
        const curPlan = (db.plans || []).find(p => p.id === pid);
        po.opt = { ...(curPlan?.opt || {}), ...(po.opt || {}), [optKey]: nv };
        continue;
      }

      if (k === 'plans.trial_days') { conf.trial_days = nv; continue; }

      // discount.*
      const dm = /^discount\.(.+)$/.exec(k);
      if (dm) { conf.discount = { ...(conf.discount || db0.discount || {}), [dm[1]]: nv }; continue; }

      // options.*
      const om = /^options\.(.+)$/.exec(k);
      if (om) { conf.options = { ...(conf.options || db0.options || {}), [om[1]]: nv }; continue; }

      // bank.*, refund_policy.*
      const dot = k.indexOf('.');
      if (dot > 0) {
        const grp = k.slice(0, dot), sub = k.slice(dot + 1);
        conf[grp] = { ...(conf[grp] || db0[grp] || {}), [sub]: nv };
        continue;
      }
      conf[k] = nv;
    }

    if (conf.discount) {
      const d = conf.discount;
      if (d.from && d.to && d.from > d.to) return json({ error: '기간 할인: 끝나는 날이 시작일보다 앞입니다' }, 400);
    }

    if (Object.keys(log).length) {
      await rpc(env, 'us_billing_apply', { p_plans: plans, p_config: conf, p_changes: log, p_by: 'eeum-admin' });
    }

    const db2 = await rpc(env, 'us_billing_get');
    const s2 = shape(db2);
    return json({ rev: await revOf(s2.values), groups: s2.groups, fields: s2.fields, values: s2.values, log: db2.log || [] });

  } catch (e) {
    const m = e.message || '';
    if (m.includes('인증') || m.includes('서명') || m.includes('만료') || m.includes('입장권')) {
      return json({ error: m }, 401);
    }
    return json({ error: m }, 400);
  }
}
