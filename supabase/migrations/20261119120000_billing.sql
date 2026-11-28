-- 운쏭B 구독·결제 기준 관리 (이음B 공통 꼴)
-- billing_log: 이음B 관리자가 바꾼 기록
-- us_billing_get / us_billing_apply: service_role 전용 RPC

-- plans에 pay 칸 추가 (결제 방법)
alter table public.plans add column if not exists pay text not null default 'bank';

-- 기간 할인은 app_config 'discount' 키에 저장 (초기값)
insert into public.app_config (key, value) values
  ('discount', '{"on":false,"label":"","pct":0,"from":"","to":"","target":"all","who":"new"}'::jsonb),
  ('options', '{"fee_per_trip":0,"rate_pct":0}'::jsonb),
  ('refund_policy', '{"withdraw_days":7,"penalty_rate":10,"basis":"prorata"}'::jsonb)
on conflict (key) do nothing;

-- 바꾼 기록
create table if not exists public.billing_log (
  id serial primary key,
  changed_at timestamptz not null default now(),
  changed_by text not null default '',
  changes jsonb not null default '{}'::jsonb
);
alter table public.billing_log enable row level security;
grant all on public.billing_log to service_role;
grant usage, select on sequence public.billing_log_id_seq to service_role;

-- 읽기: plans + app_config + 최근 기록
create or replace function public.us_billing_get()
returns jsonb language plpgsql security definer stable as $$
begin
  return jsonb_build_object(
    'plans', coalesce((select jsonb_agg(to_jsonb(p) order by p.sort_order, p.id) from public.plans p), '[]'::jsonb),
    'config', coalesce((select jsonb_object_agg(key, value) from public.app_config), '{}'::jsonb),
    'log', coalesce((
      select jsonb_agg(to_jsonb(l) order by l.changed_at desc)
      from (select changed_at as at, changed_by as by, changes from public.billing_log order by changed_at desc limit 10) l
    ), '[]'::jsonb)
  );
end;
$$;

-- 쓰기: plans 칸 · app_config 칸 · 기록
create or replace function public.us_billing_apply(
  p_plans jsonb default '{}'::jsonb,
  p_config jsonb default '{}'::jsonb,
  p_changes jsonb default '{}'::jsonb,
  p_by text default ''
)
returns void language plpgsql security definer as $$
declare
  pid text;
  cols jsonb;
begin
  -- plans 표 업데이트
  if p_plans is not null and p_plans != '{}'::jsonb then
    for pid, cols in select * from jsonb_each(p_plans) loop
      update public.plans set
        price = coalesce((cols->>'price')::int, price),
        active = coalesce((cols->>'active')::boolean, active),
        name = coalesce(cols->>'name', name),
        pay = coalesce(cols->>'pay', pay),
        months = coalesce((cols->>'months')::int, months),
        updated_at = now()
      where id = pid;
    end loop;
  end if;

  -- app_config 업데이트 (키마다 통째 또는 값만)
  if p_config is not null and p_config != '{}'::jsonb then
    for pid, cols in select * from jsonb_each(p_config) loop
      -- 숫자면 그대로, 객체면 통째
      insert into public.app_config (key, value, updated_at) values (pid, cols, now())
        on conflict (key) do update set value = cols, updated_at = now();
    end loop;
  end if;

  -- 기록
  if p_changes is not null and p_changes != '{}'::jsonb then
    insert into public.billing_log (changed_by, changes) values (p_by, p_changes);
  end if;
end;
$$;

grant execute on function public.us_billing_get() to service_role;
grant execute on function public.us_billing_apply(jsonb, jsonb, jsonb, text) to service_role;

-- app_config에 updated_at 칸이 없으면 추가
do $$ begin
  alter table public.app_config add column if not exists updated_at timestamptz not null default now();
exception when others then null;
end $$;
