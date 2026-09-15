# S.O.H CONSULTS news approval queue setup

The feature is intentionally not deployed yet.

## One-time Supabase setup

1. Open the SQL Editor in the Supabase project already used by the website.
2. Run `supabase/news-approval-queue.sql`.
3. Confirm that the `news_queue` table appears in Table Editor.

## Required environment variables

Keep the existing `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then add:

- `ADMIN_PASSWORD`: a strong private password for `/admin/updates`
- `CRON_SECRET`: a long random secret used to protect the scheduled importer

Do not expose either value with a `NEXT_PUBLIC_` prefix.

## Workflow

1. New Myschool and MySchoolGist links are collected into Draft.
2. Open `/admin/updates` and sign in.
3. Open the original source and verify the information.
4. Replace the placeholder summary and details with original S.O.H CONSULTS wording.
5. Save changes, then Approve.
6. Approved items remain private. Select Publish only when the story is ready for visitors.

The scheduled check is configured for 6:00 UTC daily. The dashboard also has a **Check Sources Now** button for manual checks.
