-- Run in the separate QA Supabase project before testing video uploads.
-- Existing images and PDFs remain available. No news rows are modified.
update storage.buckets
set allowed_mime_types = array(select distinct mime from unnest(allowed_mime_types || array['video/mp4','video/webm']) as mime)
where id = 'news-attachments' and allowed_mime_types is not null;
