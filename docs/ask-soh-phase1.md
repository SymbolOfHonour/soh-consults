# Ask S.O.H Phase 1

Scope: shared retrieval, reviewed knowledge and official-source evidence. Phases 2–5 are not implemented. Calculators, CMS publishing, branding and Admission Matcher were not changed.

## Architecture

`resolveQuestion → reviewed facts/optional semantic retrieval + published SOH content → official adapters → provider fallback/refetch → ranked session-bound evidence → deadline/score validation → conflict/freshness gates → cited answer or human escalation`.

`source-discovery.ts` contains WordPress posts, RSS/Atom, XML sitemap/index, HTML/news/portal and PDF adapters. Registry settings provide institution aliases, official domains and stable portal roots, not hardcoded announcement URLs. The API consumes these shared adapters. Every fetched article and redirect must retain official HTTPS domain ownership. Search snippets cannot establish facts. Bounded extraction supports 8 MB PDFs; scanned/image-only PDFs need OCR and remain a documented coverage gap.

`answer-verification.ts` ranks articles/PDFs above homepages, requires explicit sessions for session-dependent questions, validates calendar dates, and resolves different deadlines only with a dated later extension. Accessible portals do not establish open status. Missing evidence, unsupported exact names/scores and conflicts cannot become high confidence. Generic generation can select only exact source quotations, with server-side quotation checks; otherwise the extractive fallback is used.

Existing `ask_soh_facts`, `ask_soh_institutions` and `ask_soh_fact_versions` are reused. Registry edits are audited transactionally. Editing an authoritative fact returns it to review. Verified entries require evidence, official provenance, a verification timestamp and future review date. Retrieval rejects expired/stale/conflicting entries. Semantic retrieval is optional and uses a cosine-distance threshold; production currently lacks embeddings and retains keyword-only compatibility.

## Verification

- 275 repository tests passed, including 75 Ask S.O.H behavioural/service tests; TypeScript and targeted ESLint passed.
- Local Next.js production build passed for the initial architectural commit; the corrected code is validated by Vercel Preview before acceptance.
- QA migration applied; production migration/release not applied.
- QA transaction: editing a verified fact produced `status=review`, `verified_at=null`, and exactly one version. Rolled back all test rows.
- QA semantic query: matching vector returned 1 test fact, opposite vector returned 0. Rolled back test data.
- Initial Preview discovered real UNILORIN articles but exposed an Elementor/sidebar extraction error. Fixed by balanced post-content extraction and content-aware notice ranking, with a regression test. A fresh official-page download confirmed the article body and stated registration deadline.
- Automated actual-source evaluation covers UNILORIN, LASU, FUOYE, LASUSTECH, UNIOSUN, JAMB, WAEC and NECO. Retrieval failures are preserved as coverage gaps, not successful deadline answers. Run `node --use-env-proxy scripts/ask-soh-live-evaluation.cjs /tmp/ask-soh-live.json`.

## Acceptance and deployment

PR #324 is a draft until corrected Preview verification is complete. The Preview must use QA Supabase; production must not be promoted until its additive migration and verified acceptance results are approved. Original QA branch bindings are restored after each isolated Preview build.

Limitations: external sources can timeout, block extraction, omit publication dates or omit academic sessions. Those cases require review. Scanned PDFs need OCR. Institution domains require reviewed registry entries; URLs/aliases can be maintained through the existing institution table. This work does not claim universal notice discovery or proof that no newer extension exists.

Work allowance cannot be measured through the tools. Do not begin Phase 2 until Phase 1 acceptance and the user's remaining allowance are confirmed.
