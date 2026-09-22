# News ingestion release scope

The importer changes on this branch improve discovery diagnostics, extend the freshness window, and retain undated articles as drafts requiring verification. Imported stories remain drafts and must be reviewed before publication.

## Important limitations

- The admin dashboard approval and permanent-delete controls have not been changed in this release.
- Do not treat undated articles as verified publication-date news.
- Production cron execution and source health require checking in Vercel and Supabase logs.
- Do not publish imported drafts without checking official institutional sources, dates, requirements, and links.
