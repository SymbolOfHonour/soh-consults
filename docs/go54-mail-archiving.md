# Business mailbox archiving

The owner Team page now separates SMTP acceptance, mailbox Sent copies, and reported delivery. The existing Supabase SMTP path remains the default until explicitly enabled. No historical messages or missing historical Sent copies can be reconstructed.

## Activation

1. Apply `supabase/migrations/20261022143508_go54_mail_archive.sql` (applied to QA and production on 22 October 2026).
2. In Vercel, add server-only **Secret** `GO54_MAIL_PASSWORD`, scoped to Production, with the existing password for `support@sohconsults.com.ng`. Enter it directly in the provider UI; never place it in Git or chat. Do not share production mailbox credentials with previews.
3. Deploy, open `/admin/team`, and use **Verify mailbox connection**. This authenticates SMTP and IMAP and locates the designated Sent folder without sending an email.
4. After successful verification, set Production Config `GO54_TEAM_MAIL_ENABLED=true` and redeploy. Invitations, invitation replacements and writer password resets then use the branded direct SMTP path. Before activation, they continue through Supabase.
5. Use a normal, owner-authorized invitation/reset to confirm delivery and a matching Sent copy. Do not claim end-to-end verification from an SMTP connection check alone.

Go54 panel and mailbox logins are different. Signing into webmail does not provision the server-side Secret. Configuration is incomplete until the Secret is saved and the deployed connection check passes.

## Behavior

- Sender and Reply-To: S.O.H CONSULTS, `support@sohconsults.com.ng`.
- Verified provider endpoints: `smtp.go54mail.com:587` with mandatory STARTTLS; `imap.go54mail.com:993` with TLS and normal certificate validation. Credentials and protocol logs are never returned to the browser.
- Auth tokens come from the server-only Supabase Admin `generate_link` endpoint. Links use the existing writer activation/recovery fragment flow and password minimum of eight characters.
- One exact MIME message is composed, encrypted before SMTP, sent once, then appended to the mailbox's designated `\Sent` folder. The append is retriable without resending. Message-ID lookup and a database lease prevent duplicate archive copies.
- AES-256-GCM uses a purpose-specific HKDF key derived from `ADMIN_SESSION_SECRET`; ciphertext is authenticated against its event UUID. Keep that secret stable while retry payloads remain. Rotating it makes old pending payloads unreadable, without exposing them.
- Payloads are cleared after successful archiving. A mailbox sync also clears payloads older than seven days. This cleanup runs on sync; it is not a separate scheduled deletion job.
- **Check reports & retry Sent copies** processes up to five pending archives and up to thirty recent MIME delivery reports, each at most 256 KiB, from the last seven days. It opens mailboxes read-only, uses PEEK fetching, and does not mark existing incoming mail as read, delete it or resend it. New outgoing Sent copies are appended as read.
- Delivery updates require a structured RFC delivery-status report, a matching Message-ID/envelope ID and exact original recipient. The receiving server may not send reports. Reports are mailbox evidence, not authenticated proof of inbox placement or reading. Unknown stays unknown without a report; delay cannot overwrite delivery and nothing overwrites a permanent bounce.
- SMTP interruptions are shown as failed/unconfirmed. They are never automatically resent. A database interruption after SMTP success stays unconfirmed until reviewed, avoiding a false failure/success claim.
- Team email history uses explicit safe projections. Encrypted payloads, account links, SMTP responses and credentials are excluded from APIs and CSV exports. Only the owner can verify or sync the mailbox.

## Rollback

Set `GO54_TEAM_MAIL_ENABLED=false` and redeploy to resume the existing Supabase SMTP send path. Keep the additive audit columns. Existing saved Sent copies remain in Go54. Pending retries need re-enablement and the same encryption secret; do not resend accepted messages just to fix an archive failure.

## Publishing scheduler

The independent `soh-editor-minute-publishing` production job was explicitly approved and activated earlier on 22 October. It remains active; this mail migration does not change its schedule or article behavior.
