# Production verification

1. Confirm the Vercel build succeeds on the preview branch.
2. Confirm CRON_SECRET is configured and the scheduled /api/cron/import-news invocation is authorized.
3. Inspect the latest import health record and any source failures.
4. Confirm imported stories appear as drafts only, and verify publication metadata before approval.
5. Confirm the existing recovery workflow handles trash and permanent deletion; the older dashboard delete button requires a separate fix.
