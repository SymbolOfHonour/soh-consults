# Private editor team workflow

This change affects private admin/editor routes only. Existing public page components are not modified.

## Activation

1. Apply `supabase/private-editor-team-migration.sql` to the existing Supabase project using its SQL editor. It creates two private tables and a service-role-only transaction for importing submissions as drafts. It does not publish or rewrite existing articles.
2. Deploy this branch with the existing `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SESSION_SECRET` and rate-limit configuration. No new secrets are required. Supabase Auth must have its email/password provider enabled; no email delivery is needed for the manual invitation links.
3. Sign in with the existing owner login and open `/admin/team`.
4. Generate a writer invitation and share it privately with the named recipient. The application does not send email. The invitation is a bearer capability, single-use and expires according to Supabase Auth configuration.
5. Use a separate browser profile for a writer account. Activate the account, create a draft, reload to verify persistence, submit it, request changes as owner, resubmit, then move it into the owner editor as an unpublished draft. Verify the publisher field before publishing.

## Access

- Owner authentication is unchanged. Staff cookies do not satisfy `isAdmin()`.
- Writers use `/admin/writer` and can create or edit only their own drafts/returned submissions. They cannot change owner settings, publish, manage members, or modify submitted/imported content.
- Editors can inspect submissions and request changes. Publishing and moving articles into the owner editor remain owner-only in this initial release.
- Owner can disable/enable staff or change their role; the current database membership is checked on every staff request. Password-reset links are generated privately from Team access.
- Staff sign-in uses managed Supabase Auth; passwords and refresh tokens are never stored by the application. HttpOnly staff cookies expire after at most one hour; writers sign in again when needed. Draft recovery remains available.
- All mutation endpoints are under `/api/admin/` and inherit the existing same-origin request guard.
- Direct client access to the new tables and import RPC is revoked for `anon` and `authenticated`. Only server-side service-role requests can access them.
- Uploads use a separate staff endpoint with membership checks and rate limits. The owner upload endpoint is unchanged.

## Editing

- Admission, scholarship, school-fees and guide templates append structured headings and blank paragraphs without overwriting content.
- Duplicate creates a deep copy; heading anchors are regenerated.
- Focus writing hides advanced typography controls without changing saved styling.
- Writer drafts autosave after five seconds once a headline is present. Saves use optimistic revision checks; a conflicting revision pauses editing rather than overwriting another session. Automatic retries pause after errors; manual Save draft retries.
- Submission review and owner import use the submitted snapshot. Import is a database transaction that locks and checks the exact revision, creates one draft and records the imported article ID.

## Validation boundaries

Unit/integration fixtures exercise authentication gates, ownership, role restrictions, revision conflicts, input shapes, server-assigned author identity, the owner import call and editor regression flows. A successful local build does not validate the production Supabase Auth configuration or install the SQL migration. Complete the separate-browser activation flow above before treating staff access as operational.
