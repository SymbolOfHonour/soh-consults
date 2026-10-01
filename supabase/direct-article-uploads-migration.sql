-- Apply only to soh-consults-qa for Preview testing.
-- Preserve existing visibility and permissions, and append supported video types.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = case when allowed_mime_types is null then null else
      array(select distinct mime from unnest(allowed_mime_types || array['video/mp4','video/webm']) as mime)
    end
where id = 'news-attachments';

-- Verify the bucket settings. If the global Storage limit is lower, raise it to 50 MB in Storage Settings.
select id, file_size_limit, allowed_mime_types from storage.buckets where id = 'news-attachments';
