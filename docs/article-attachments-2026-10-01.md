# PDF and video attachments

The new and edit article screens now offer **+ PDF attachment** and **+ Video** content blocks. Multiple attachments can be moved or removed like other article blocks. PDF files open in a new tab; video watch links open the hosting website. Uploaded MP4/WebM files display in a responsive video player with controls, inline mobile playback, metadata-only preloading and no autoplay. Existing legacy articles, images, galleries, typography and top-level document attachments remain compatible.

Uploads use the existing authenticated admin endpoint and `news-attachments` bucket. The server checks the declared MIME against the file signature and rejects empty files and files over 4 MiB. The client reports the limit before sending a large file. The conservative limit leaves room below Vercel's 4.5 MB request ceiling. Larger PDFs/videos can use hosted HTTPS links. Video pages such as YouTube should use Watch link; Video player requires a direct media-file URL. HTTPS links with embedded credentials are rejected. The service-role key remains server-only. Saving and publishing are disabled while a content-block upload is in progress.

## QA storage setup

PDF MIME is already included in the existing bucket configuration. Video uploads require this migration in **soh-consults-qa only**:

```sql
update storage.buckets
set allowed_mime_types = array(select distinct mime from unnest(allowed_mime_types || array['video/mp4','video/webm']) as mime)
where id = 'news-attachments' and allowed_mime_types is not null;
```

This preserves the existing whitelist and appends video MIME types. It does not modify content rows, public/private bucket settings, permissions or production. An unrestricted bucket remains unrestricted. See `supabase/article-video-attachments-migration.sql`.

## Verification

- All 66 tests pass, including mixed attachment serialization, unsafe URL rejection, file kind/signature/size checks, authenticated upload routing and rendered article behavior.
- Repository lint: zero errors, 12 pre-existing warnings.
- TypeScript and production build pass locally.
- The browser's Supabase session has expired, so the migration has not been applied by this continuation.
- Actual QA storage upload/playback and mobile interaction for these new controls still require verification after the migration and deployment. Prior user-reported manual checks concern the previous version, not these new controls.
- No main merge or production deployment is authorized.
