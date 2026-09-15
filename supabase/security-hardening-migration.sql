-- Run once in Supabase SQL Editor before deploying the hardening branch.

-- Allow archived updates while preserving the existing status validation.
do $$
declare constraint_name text;
begin
  select conname into constraint_name
  from pg_constraint
  where conrelid = 'public.news_queue'::regclass
    and contype = 'c'
    and pg_get_constraintdef(oid) ilike '%status%';
  if constraint_name is not null then
    execute format('alter table public.news_queue drop constraint %I', constraint_name);
  end if;
end $$;

alter table public.news_queue
  add constraint news_queue_status_check
  check (status in ('draft', 'approved', 'published', 'rejected', 'archived'));

create table if not exists public.rate_limits (
  scope text not null,
  identifier text not null,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  primary key (scope, identifier)
);

alter table public.rate_limits enable row level security;
revoke all on table public.rate_limits from public, anon, authenticated;
grant select, insert, update, delete on table public.rate_limits to service_role;

create or replace function public.check_rate_limit(
  p_scope text,
  p_identifier text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  current_row public.rate_limits%rowtype;
  retry_after integer;
begin
  insert into public.rate_limits(scope, identifier, window_started_at, request_count)
  values (p_scope, p_identifier, now(), 1)
  on conflict (scope, identifier) do update
  set window_started_at = case
        when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then now()
        else public.rate_limits.window_started_at
      end,
      request_count = case
        when public.rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds) then 1
        else public.rate_limits.request_count + 1
      end
  returning * into current_row;

  retry_after := greatest(1, p_window_seconds - extract(epoch from (now() - current_row.window_started_at))::integer);
  return jsonb_build_object('allowed', current_row.request_count <= p_limit, 'retry_after', retry_after);
end;
$$;

revoke all on function public.check_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, text, integer, integer) to service_role;

-- Keep the table small. This can be run periodically or manually.
delete from public.rate_limits where window_started_at < now() - interval '2 days';
