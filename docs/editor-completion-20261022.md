# Private editor completion — 22 October 2026

Implemented in the existing owner and writer editors:

- Owner drafts autosave after five seconds; live article edits remain explicit saves. Failed automatic saves pause, and browser recovery remains available. A browser recovery decision is required before autosave begins. New drafts persist a client request identifier before saving, recover the same server record after a timed-out create, and reuse the returned server ID on subsequent saves. A replay leaves newer local edits unsaved for explicit application.
- Owner saves use optimistic concurrency, including full article edits, to avoid overwriting a writer or another owner tab.
- Per-article owner revision history includes a preview and explicit restore confirmation. Writer revision restoration retains publication status and authorship.
- Replaced images/documents are retained for historical restoration and shared media reuse. Permanent deletion continues through the existing recovery workflow.
- Existing starter templates remain available. Authenticated team members can save article blocks to a private reusable template library and append them without deleting the current article. Fresh heading anchors prevent collisions.
- Publication checklist distinguishes required narrative/headline from optional images, institution and source links.
- Writers can schedule unpublished articles in Lagos time and cancel schedules. Publishing now removes a pending schedule. Writers cannot unpublish, set expiry, alter authorship or delete articles.
- Owner publishing schedule shows the timer heartbeat, scheduled items and blocked publication reasons. A manual run does not count as a timer heartbeat.
- Email history can be searched, filtered and exported as CSV. “Accepted” remains service acceptance, not proof of inbox delivery. No external mail was sent as a test.

## Database scheduler

The migration creates a private, non-exposed schema, RLS-protected singleton heartbeat, immutable URI codecs and invoker functions. The public RPC wrappers are executable only by service_role. The named pg_cron task checks every minute, using an advisory lock and row locks. Each successful publication/expiry records history and audit in the same transaction. One invalid row does not stop other articles. Blank narrative, invalid metadata and already-expired publication windows are blocked. Existing article metadata and author attribution are preserved.

**The migration prepares the production cron job disabled by default.** Automatic approval review rejected enabling the live job because it can publish or archive real articles; activation is pending explicit approval. The isolated QA timer was enabled and successful timer-fired runs were verified. Production retains the existing daily authenticated cron route and manual owner run. Neither proves the one-minute timer is active.

Once approval is given, enable only the named production job and verify a timer-fired success and timer_last_run heartbeat. The database may be delayed or unavailable; publication is not guaranteed at an exact second. Public content reads use no-store; the homepage is dynamic.

## Verification

The isolated database test used transactional fixtures and rolled them back: due article published; future article held; empty narrative blocked; rejected article unchanged; expired published article archived; snapshots recorded; Unicode and percent-sign metadata round-tripped. Anonymous and authenticated roles cannot execute the scheduler RPC. QA timer run logs confirmed successful real scheduled invocations.

Frontend/API tests cover owner autosave create→PATCH, no autosaving live edits, stale owner saves, template authentication/private storage/malformed input, Lagos scheduling instants, writer schedule/cancel and author/expiry protections, checklist semantics and CSV formula escaping. Full build, typecheck and lint also run before release.

## External mail work still requiring configuration

Supabase Auth currently sends the branded account emails through the existing mail setup. The editor can report request acceptance and failures. Go54 Sent-folder copies require a supported mailbox/IMAP archival path; delivery/bounce tracking requires mail-provider events. These are not claimed as complete. Website features such as reader subscriptions, school hubs and public roundups were not part of this private-editor release.
