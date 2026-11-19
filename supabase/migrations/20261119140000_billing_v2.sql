-- 구독·결제 공통 꼴 2판: 세금계산서 · 요금제별 옵션
-- plans에 invoice · invoice_price · invoice_period · opt 칸 추가

alter table public.plans add column if not exists invoice boolean not null default false;
alter table public.plans add column if not exists invoice_price int not null default 0;
alter table public.plans add column if not exists invoice_period text not null default 'year';
alter table public.plans add column if not exists opt jsonb not null default '{}'::jsonb;

-- us_billing_get: 새 칸 포함 (to_jsonb(p)이 자동으로 올림 — 그대로)
-- us_billing_apply: 새 칸 저장
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
  if p_plans is not null and p_plans != '{}'::jsonb then
    for pid, cols in select * from jsonb_each(p_plans) loop
      update public.plans set
        price = coalesce((cols->>'price')::int, price),
        active = coalesce((cols->>'active')::boolean, active),
        name = coalesce(cols->>'name', name),
        pay = coalesce(cols->>'pay', pay),
        months = coalesce((cols->>'months')::int, months),
        invoice = coalesce((cols->>'invoice')::boolean, invoice),
        invoice_price = coalesce((cols->>'invoice_price')::int, invoice_price),
        invoice_period = coalesce(cols->>'invoice_period', invoice_period),
        opt = case when cols ? 'opt' then coalesce(cols->'opt', opt) else opt end,
        updated_at = now()
      where id = pid;
    end loop;
  end if;

  if p_config is not null and p_config != '{}'::jsonb then
    for pid, cols in select * from jsonb_each(p_config) loop
      insert into public.app_config (key, value, updated_at) values (pid, cols, now())
        on conflict (key) do update set value = cols, updated_at = now();
    end loop;
  end if;

  if p_changes is not null and p_changes != '{}'::jsonb then
    insert into public.billing_log (changed_by, changes) values (p_by, p_changes);
  end if;
end;
$$;
