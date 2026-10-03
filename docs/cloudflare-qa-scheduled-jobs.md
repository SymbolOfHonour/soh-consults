# Cloudflare QA scheduled jobs

The QA worker delegates scheduled events to the existing authenticated routes using the QA worker runtime. HTTP requests continue through the generated OpenNext worker. No production host is used.

The following schedules are configured in wrangler.jsonc:

| UTC schedule | Route |
| --- | --- |
| `0 5 * * *` | `/api/cron/smart-operations` |
| `0 6 * * *` | `/api/cron/import-news` |
| `0 7 * * *` | `/api/cron/backup-updates` |

The QA deployment workflow creates a fresh QA-only CRON_SECRET for each QA deployment, stores it as an encrypted Worker secret, and masks it in CI logs. The scheduled handler refuses any database URL other than the isolated QA Supabase project. No production secret is reused.

After deployment, scripts/verify-qa-cron.mjs checks unauthenticated rejection and authenticated execution for all three routes, including confirmation that the snapshot was saved or already exists. This validates the live route path; a timer-fired event still requires checking Cloudflare scheduled-event records after its configured UTC time. Cron configuration changes may take time to propagate.

Missing secrets, unknown schedules and unsuccessful route responses fail the scheduled event. Backups contain content records and attachment URLs, not uploaded file binaries or a complete database export. Snapshots are stored in the same QA database.
