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
  status text not null default 'draft' check (status in ('draft', 'approved', 'published', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news_queue enable row level security;

create index if not exists news_queue_status_created_idx
  on public.news_queue (status, created_at desc);

comment on table public.news_queue is
  'Private S.O.H CONSULTS queue. Only server-side service-role requests can access it.';
