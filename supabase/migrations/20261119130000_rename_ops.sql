-- bb_ops → us_ops 이름 바꾸기 (운쏭B 접두어)
-- 여러 번 실행해도 되게: bb_ops가 있으면 바꾸고, 없으면 us_ops 확인
do $$
begin
  if exists (select 1 from pg_namespace where nspname = 'bb_ops') then
    alter schema bb_ops rename to us_ops;
  end if;
  if not exists (select 1 from pg_namespace where nspname = 'us_ops') then
    create schema us_ops;
    create table us_ops.migrations (
      filename text primary key,
      applied_at timestamptz not null default now(),
      success boolean not null default true,
      message text
    );
  end if;
end $$;
