# Direct article uploads

This replaces the initial 4 MiB Vercel-proxied upload flow in the existing QA branch. New/edit article screens, content images, galleries, PDFs, videos and featured images use one shared direct uploader. Limits: images/PDFs 10 MiB; MP4/WebM videos 50 MiB. Hosted HTTPS links remain available for larger files.

## Flow

1. Validate the file's size, MIME and signature locally.
2. An authenticated, same-origin JSON request asks the server for an upload token scoped to a newly generated UUID object path. Overwriting is disabled. Supabase's token lifetime is two hours. A separate server-signed receipt binds the path, size, type and expiry.
3. `tus-js-client` sends 6 MiB chunks directly to the configured Supabase storage host, with progress and automatic retries after interruptions. Tokens are not persisted in browser storage. Retrying within an active upload can resume its offset; refreshing the page starts a new upload.
4. An authenticated completion request verifies the receipt, actual storage object size/MIME and up to 64 signature bytes before returning an article URL. Video bodies are never buffered through Vercel. Authentication, RLS, service-role secrecy and existing bucket visibility remain unchanged. Admin CSP permits connections only to the configured Supabase project and its direct storage hostname.

Legacy multipart API clients still work for files up to 4 MiB and receive a refresh instruction for larger files. Existing stored article attachments need no migration.

## Required QA setup

The user supplied a success screenshot for the earlier video MIME migration in `soh-consults-qa`. The existing bucket's 10 MiB size limit still needs raising:

```sql
update storage.buckets
set file_size_limit = 52428800
where id = 'news-attachments';
```

The complete idempotent script is `supabase/direct-article-uploads-migration.sql`. It also preserves existing MIME restrictions and appends MP4/WebM. Verify the project-wide Storage file limit is at least 50 MB. Apply only to the separate QA project. The agent's Supabase session is signed out, so the new size change has not been applied here.

## Validation

- All 76 executable tests pass, including a real TUS client transferring an 8 MiB file to a disposable local storage fixture, recovering a failed chunk via HEAD/offset and completing without routing file bytes through Vercel.
- Tests cover token secrecy, unique object names/no overwrite, receipt tampering/expiry, actual storage size/type/signature mismatch, failed final verification, limits and admin authentication.
- Full lint: zero errors, 12 pre-existing warnings. Production build and TypeScript pass.
- Production dependency audit passes the high/critical threshold; the previously documented low DOMPurify advisory remains.
- Live Supabase larger-file upload, actual file playback/download and mobile interaction remain unverified until the QA size limit is raised and authenticated testing is completed. Local tests do not certify the live storage configuration.

Official implementation references: https://supabase.com/docs/guides/storage/uploads/resumable-uploads and https://supabase.com/docs/guides/storage/uploads/file-limits .
