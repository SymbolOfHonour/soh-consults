alter table public.news_queue
  add column if not exists image_url text,
  add column if not exists document_url text,
  add column if not exists document_name text;

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
