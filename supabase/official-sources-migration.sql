alter table public.news_queue
  add column if not exists official_source_name text,
  add column if not exists official_source_url text;

grant select, insert, update, delete
on table public.news_queue
to service_role;
