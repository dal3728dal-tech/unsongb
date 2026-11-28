-- 운쏭B 초기 DB
-- profiles: 회원 (가입 트리거가 auth.users에서 자동 생성)
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null default '',
  name text not null default '',
  phone text not null default '',
  company text not null default '',
  role text not null default 'member' check (role in ('member','admin')),
  member_type text not null default 'orderer' check (member_type in ('orderer','producer','driver','site')),
  status text not null default 'active' check (status in ('active','trial','suspended','blocked')),
  is_demo boolean not null default false,
  eeum_uid text unique,
  eeum_status text,
  eeum_until date,
  eeum_seen timestamptz,
  listed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "본인 읽기" on public.profiles for select using (auth.uid() = id);
create policy "본인 수정" on public.profiles for update using (auth.uid() = id)
  with check (
    id = auth.uid()
    and role = (select role from public.profiles where id = auth.uid())
    and is_demo = (select is_demo from public.profiles where id = auth.uid())
    and eeum_uid is not distinct from (select eeum_uid from public.profiles where id = auth.uid())
    and eeum_status is not distinct from (select eeum_status from public.profiles where id = auth.uid())
    and eeum_until is not distinct from (select eeum_until from public.profiles where id = auth.uid())
  );
create policy "관리자 전체" on public.profiles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 가입 트리거
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, coalesce(new.email,''), coalesce(new.raw_user_meta_data->>'name',''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 구독
create table public.subscriptions (
  user_id uuid primary key references public.profiles on delete cascade,
  tier text not null default 'basic' check (tier in ('basic','pro')),
  expires_at timestamptz not null,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
create policy "본인 읽기" on public.subscriptions for select using (auth.uid() = user_id);
create policy "관리자 전체" on public.subscriptions for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 요금제
create table public.plans (
  id text primary key,
  name text not null,
  tier text not null default 'basic',
  months int not null default 1,
  price int not null default 0,
  promo_rate int not null default 0,
  promo_start date,
  promo_end date,
  promo_name text not null default '',
  member_types text[] not null default '{orderer,producer,driver}',
  sort_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.plans enable row level security;
create policy "누구나 읽기" on public.plans for select using (true);

-- 설정
create table public.app_config (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.app_config enable row level security;
create policy "누구나 읽기" on public.app_config for select using (true);
create policy "관리자 쓰기" on public.app_config for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 결제
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles on delete cascade,
  plan_id text references public.plans,
  amount int not null default 0,
  method text not null default 'bank',
  status text not null default 'pending' check (status in ('pending','paid','cancelled','refunded')),
  memo text not null default '',
  period_start timestamptz,
  period_end timestamptz,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);
alter table public.payments enable row level security;
create policy "본인 읽기" on public.payments for select using (auth.uid() = user_id);
create policy "관리자 전체" on public.payments for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- 이음B SSO 기록
create table public.eeum_sso_log (
  jti text primary key,
  admin_id uuid,
  admin_email text,
  next text,
  created_at timestamptz not null default now()
);
-- service_role만 접근
alter table public.eeum_sso_log enable row level security;

-- service_role 권한
grant all on public.eeum_sso_log to service_role;
grant select (id, email, role, status) on public.profiles to service_role;

-- 구독 확인 함수
create or replace function public.has_active_sub(uid uuid default auth.uid())
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.subscriptions
    where user_id = uid and expires_at > now()
  ) or exists (
    select 1 from public.profiles
    where id = uid and role = 'admin'
  );
$$;

-- DB 마이그레이션 기록 (자동 반영용)
create schema if not exists us_ops;
create table if not exists us_ops.migrations (
  filename text primary key,
  applied_at timestamptz not null default now(),
  success boolean not null default true,
  message text
);

-- 초기 설정값
insert into public.app_config (key, value) values
  ('trial_days', '7'::jsonb),
  ('bank', '{"name":"","number":"","holder":""}'::jsonb),
  ('free_tier', '{"trial":"basic","invite":"basic"}'::jsonb),
  ('invite_free', '{"n":30,"unit":"day"}'::jsonb)
on conflict (key) do nothing;

-- 초기 요금제
insert into public.plans (id, name, tier, months, price, member_types, sort_order) values
  ('basic-monthly', '기본 월간', 'basic', 1, 33000, '{orderer,producer,driver}', 1),
  ('basic-yearly', '기본 연간', 'basic', 12, 330000, '{orderer,producer,driver}', 2)
on conflict (id) do nothing;
