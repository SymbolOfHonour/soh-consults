-- Private team profiles and message audit. Only trusted server routes can access these records.
alter table public.editor_team
  add column if not exists about text not null default '' check (char_length(about) <= 1000),
  add column if not exists picture_url text not null default '' check (char_length(picture_url) <= 2000),
  add column if not exists activated_at timestamptz,
  add column if not exists last_invited_at timestamptz,
  add column if not exists invitation_cancelled_at timestamptz;
update public.editor_team t set activated_at = u.last_sign_in_at
from auth.users u where u.id=t.id and t.activated_at is null and u.last_sign_in_at is not null;
create table if not exists public.editor_email_events (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.editor_team(id),
  recipient text not null,
  kind text not null check (kind in ('invitation','resend','recovery')),
  status text not null default 'requested' check (status in ('requested','accepted','failed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists editor_email_events_created_idx on public.editor_email_events(created_at desc);
create index if not exists editor_email_events_member_idx on public.editor_email_events(member_id,created_at desc);
alter table public.editor_email_events enable row level security;
revoke all on public.editor_email_events from public, anon, authenticated;
grant select, insert, update on public.editor_email_events to service_role;
