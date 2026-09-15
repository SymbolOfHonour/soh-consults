create extension if not exists pgcrypto;

create table if not exists public.news_queue (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_url text not null unique,
  source_published_at timestamptz,
  title text not null,
  institution text not null default 'To be confirmed',
  category text not null default 'Admission',
  summary text not null default '',
  details text not null default '',
  deadline text,
  deadline_iso date,
  image_url text,
  document_url text,
  document_name text,
  official_source_name text,
  official_source_url text,
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_queue enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on table public.news_queue to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-attachments',
  'news-attachments',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create index if not exists news_queue_status_created_idx
  on public.news_queue (status, created_at desc);

comment on table public.news_queue is
  'Private S.O.H CONSULTS queue. Only server-side service-role requests can access it.';
