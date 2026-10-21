-- Private editor records: NEVER exposed to public/anon/authenticated clients.
-- Apply once in the existing project's Supabase SQL editor before enabling Team.
begin;
create table if not exists public.editor_team (
  id uuid primary key references auth.users(id),
  email text not null unique,
  name text not null check (char_length(name) between 1 and 100),
  role text not null default 'writer' check (role in ('writer','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists public.editor_submissions (
  id uuid primary key,
  author_id uuid not null references public.editor_team(id),
  author_name text not null,
  status text not null default 'draft' check (status in ('draft','submitted','changes_requested','imported')),
  snapshot jsonb not null,
  feedback text not null default '',
  story_id uuid references public.news_queue(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists editor_submissions_author on public.editor_submissions(author_id,updated_at desc);
create index if not exists editor_submissions_review on public.editor_submissions(status,updated_at desc);
alter table public.editor_team enable row level security;
alter table public.editor_submissions enable row level security;
revoke all on public.editor_team, public.editor_submissions from anon, authenticated;
grant select, insert, update on public.editor_team, public.editor_submissions to service_role;
-- Atomically lock the reviewed revision, create exactly one draft, and mark it imported.
create or replace function public.import_editor_submission(p_id uuid, p_expected timestamptz, p_details text)
returns setof public.editor_submissions
language plpgsql security invoker set search_path = public as $$
declare item public.editor_submissions; article_id uuid;
begin
  select * into item from public.editor_submissions where id=p_id for update;
  if not found or item.status <> 'submitted' or item.updated_at <> p_expected then
    raise exception 'Submission changed; reload before importing';
  end if;
  insert into public.news_queue (id,source_name,source_url,title,institution,category,summary,details,official_source_name,official_source_url,status,created_at,updated_at)
  values (item.id,'S.O.H CONSULTS','writer:'||item.id,item.snapshot->>'title',item.snapshot->>'institution',coalesce(nullif(item.snapshot->>'category',''),'Admission'),item.snapshot->>'summary',p_details,nullif(item.snapshot->>'official_source_name',''),nullif(item.snapshot->>'official_source_url',''),'draft',now(),now())
  on conflict (source_url) do nothing;
  select id into article_id from public.news_queue where source_url='writer:'||item.id;
  return query update public.editor_submissions set status='imported',story_id=article_id,updated_at=clock_timestamp() where id=p_id returning *;
end $$;
revoke all on function public.import_editor_submission(uuid,timestamptz,text) from public, anon, authenticated;
grant execute on function public.import_editor_submission(uuid,timestamptz,text) to service_role;
commit;
