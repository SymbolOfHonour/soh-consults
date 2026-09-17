# Phase 3.2 Smart Operations: implementation and safety gates

Status: design/audit only. Do not claim features deployed from this document.

## Existing architecture verified
- `news_queue` is canonical; linked module feeds derive from `listStories()` and `operations-insights.ts`.
- `QueuedStory` has no module-override or scheduled-publication column. New fields require an additive, deployed Supabase migration before application code depends on them.
- Article details contain structured blocks and existing feature/breaking/schedule/expiry markers. The structured editor rebuilds details from flags and blocks; any new metadata embedded in details must survive this save path or be stored separately.
- `updateStory()` deletes replaced image/document objects. A reusable media asset must not rely on the existing attachment cleanup logic; introduce reference tracking or non-destructive shared storage before offering reuse.
- Status transitions in `/api/admin/stories/status` are authenticated, versioned, audited, and revalidate the linked modules. Preserve these guarantees.

## Implementation gates
1. **Manual module override:** additive schema migration for a validated override field, or a backward-compatible metadata representation preserved by all editors; shared classifier must respect it and allow clearing override. No public-category mutation.
2. **Deadline extensions:** validate calendar dates, retain an extension history and source attribution, distinguish past deadline from independently verified closed status, and make all affected modules refresh. Do not infer an extension from free text.
3. **Scheduled publication:** additive `publish_at` field plus authenticated scheduling UI, reliable server-side scheduled job with idempotent transitions, audit/version history, and explicit time zone. A browser timer or static marker alone is not reliable.
4. **Reusable media:** shared asset registry with ownership and references, authenticated search/copy/select UI, and reference-safe deletion. Existing image URLs must remain intact during migration.
5. **Activity:** read existing audit/version records using authenticated endpoints; avoid inventing editor identities or displaying private details publicly.

## Release checklist
- Unit tests for classifier overrides, invalid/extended deadlines, scheduled jobs and media references.
- Integration tests for create/edit/publish/archive/restore and module consistency.
- Existing published data and LASU calculator unchanged.
- CI success, migration applied, deployment success, then live authenticated smoke tests.
