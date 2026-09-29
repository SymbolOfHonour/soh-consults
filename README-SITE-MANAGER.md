# S.O.H CONSULTS Site Manager

## Owner goal
Routine operation must not require coding. Visitor-facing business information belongs in Admin. Core application code, authentication, secrets, database schema and deployment remain protected.

## Owner entry points
- `/admin` — control centre
- `/admin/modules` — all management modules
- `/admin/site-manager` — no-code brand, homepage and contact controls
- `/admin/updates` — news publishing
- `/admin/media` — media records
- `/admin/seo` — SEO controls
- `/admin/recovery` — recovery/accountability
- `/admin/diagnostics` — plain-English system health

## Deployment safety
Never make emergency edits directly to production unless unavoidable. Use a branch, Vercel Preview, CI/verify, then merge to `main`. Git history is the rollback record.

## Secrets
Never place API keys, passwords, Supabase service keys, Vercel secrets or authentication secrets in Site Manager fields, source documentation, screenshots or support messages. Environment variable names may be documented; values stay in the deployment secret store.

## Architecture
Next.js App Router frontend. Admin authentication lives in `lib/admin-auth`. Published updates and module records use the existing news/module storage. Site Manager settings are stored through `lib/site-manager.ts` using the settings module store. Public-safe settings are available from `/api/public/site-settings`; private writes require Admin through `/api/admin/site-manager`.

## Recovery
1. Open `/admin/diagnostics` and note failing checks.
2. Open `/admin/recovery` for available content recovery/version controls.
3. Check the most recent GitHub pull request and Vercel deployment.
4. Revert to the last known-good commit if a code deployment caused the issue.
5. Give a new developer/AI this file and the diagnostics result. Do not share secret values.

## Product rule
Admin controls what visitors see and normal business rules through validated forms. Raw source code and secrets are not exposed as editable text boxes.
