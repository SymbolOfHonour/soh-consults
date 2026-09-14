create table if not exists public.update_comments (
  id bigint generated always as identity primary key,
  update_id integer not null,
  name varchar(80) not null,
  email varchar(160) not null,
  comment varchar(1500) not null,
  created_at timestamptz not null default now()
);

create index if not exists update_comments_update_id_created_at_idx
  on public.update_comments (update_id, created_at);

alter table public.update_comments enable row level security;

-- No public RLS policies are intentionally created.
-- The Next.js server route uses the Supabase service-role key, so visitor emails
-- remain server-side and are never exposed through direct public database access.
