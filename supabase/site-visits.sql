create table if not exists public.site_stats (
  key text primary key,
  value bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_stats (key, value)
values ('total_visits', 0)
on conflict (key) do nothing;

alter table public.site_stats enable row level security;

create or replace function public.increment_site_visit()
returns bigint
language sql
security definer
set search_path = public
as $$
  update public.site_stats
  set value = value + 1,
      updated_at = now()
  where key = 'total_visits'
  returning value;
$$;

revoke all on function public.increment_site_visit() from public, anon, authenticated;
grant execute on function public.increment_site_visit() to service_role;
