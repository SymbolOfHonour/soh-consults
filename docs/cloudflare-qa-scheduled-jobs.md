# Cloudflare QA scheduled jobs

The QA worker delegates scheduled events to the existing authenticated routes using the QA worker runtime. HTTP requests continue through the generated OpenNext worker. No production host is used.

Schedules are prepared but not activated in wrangler.jsonc:

| UTC schedule | Route |
| --- | --- |
| `0 5 * * *` | `/api/cron/smart-operations` |
| `0 6 * * *` | `/api/cron/import-news` |
| `0 7 * * *` | `/api/cron/backup-updates` |

Before activation, configure a fresh QA-only `CRON_SECRET` as a Worker secret. Then add these schedules to `triggers.crons` in the QA configuration and deploy QA. Never reuse a production secret. Confirm scheduled run records and a daily backup snapshot after testing; unit tests do not establish that live scheduling works.

Missing secrets, unknown schedules and unsuccessful route responses fail the scheduled event. Backups contain content records and attachment URLs, not uploaded file binaries or a complete database export. Snapshots are stored in the same QA database.
