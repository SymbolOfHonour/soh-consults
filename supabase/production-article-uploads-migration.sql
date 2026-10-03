-- Approved production release preparation, not an automatic migration.
-- Verify project rajbswknmdscrilrcwoj before running. Retains visibility and policies.
-- Abort rather than create a new bucket or expose a private bucket.
begin;
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'news-attachments' and public = true) then
    raise exception 'Existing public news-attachments bucket must be verified before release';
  end if;
end $$;
alter table public.news_queue
  add column if not exists image_url text,
  add column if not exists document_url text,
  add column if not exists document_name text;
update storage.buckets
set file_size_limit = case when file_size_limit is null then null else greatest(file_size_limit, 52428800) end,
    allowed_mime_types = case when allowed_mime_types is null then null else
      array(select distinct mime from unnest(allowed_mime_types || array['application/pdf','video/mp4','video/webm']) as mime)
    end
where id = 'news-attachments';
commit;
select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'news-attachments';
