-- 이음B 현장 공유(11/19, CONNECT.md "현장 공유")
--  현장 목록 원본 = 이음B(eeum.bid/api/sites). 운송B는 운송 요청의 출발/도착 현장을 이음B 현장에서 고르거나 새로 만들고 eeum_site_id로 이어 둠.
--  · eeum_tokens: 통합 로그인 입장권에 든 sites_token(그 회원만, 30일)을 서버에만 보관
--  여러 번 실행해도 됨.

create table if not exists public.eeum_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sites_token text not null,
  expires_at timestamptz not null,
  updated_at timestamptz not null default now()
);
alter table public.eeum_tokens enable row level security;
grant all on public.eeum_tokens to service_role;
