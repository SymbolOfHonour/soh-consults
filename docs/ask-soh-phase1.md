# Ask S.O.H Phase 1

Scope: shared retrieval, reviewed knowledge and official-source evidence. Phases 2–5 are not implemented. Calculators, CMS publishing, branding and Admission Matcher were not changed.

## Architecture

`resolveQuestion → reviewed facts/optional semantic retrieval + published SOH content → official adapters → provider fallback/refetch → ranked session-bound evidence → deadline/score validation → conflict/freshness gates → cited answer or human escalation`.

`source-discovery.ts` contains WordPress posts, RSS/Atom, XML sitemap/index, HTML/news/portal and PDF adapters. Published, unprotected WordPress REST article content remains cited evidence when the HTML page is unavailable; the actual API retrieval URL is recorded and drafts are excluded. Embedded official PDF links are discovered from article content. Public AJAX fragments retain isolated publisher sessions, legacy news cards keep their own title/date/abstract, and bounded archive pagination reaches older notices. Public SPA assets expose PDF links only; their JavaScript is never executed or treated as evidence. Declarative countdowns retain UTME/Direct Entry scope. Registry settings provide institution aliases, official domains and stable portal roots, not hardcoded announcement URLs. The API consumes these shared adapters. Every fetched article and redirect must retain official HTTPS domain ownership. Search snippets cannot establish facts. Bounded extraction supports 16 MB PDFs with an 80-page cap and destroys the parser after extraction; HTML remains limited to 8 MB; scanned/image-only PDFs need OCR and remain a documented coverage gap.

`answer-verification.ts` ranks articles/PDFs above homepages, requires explicit sessions for session-dependent questions and exam years for JAMB/WAEC/NECO, validates calendar dates, and resolves different deadlines only with a dated later extension. Time-prefixed dates and explicit reopening ranges are supported; relative durations are not calculated into deadlines. SSCE category and normal/late registration stages are kept separate. Accessible portals do not establish open status; explicit category-labelled portal declarations may establish a freshly observed status at medium confidence. Missing evidence, unsupported exact names/scores and conflicts cannot become high confidence. Generic generation can select only exact source quotations, with server-side quotation checks; otherwise the extractive fallback is used.

Existing `ask_soh_facts`, `ask_soh_institutions` and `ask_soh_fact_versions` are reused. Registry edits are audited transactionally. Editing an authoritative fact, exam-year metadata or validity/review scope returns it to review. QA also verified that changing the examination year resets verification and creates exactly one history version. Verified entries require evidence, official provenance, a verification timestamp and future review date. Retrieval rejects expired/stale/conflicting entries. Semantic retrieval is optional and uses a cosine-distance threshold; production currently lacks embeddings and retains keyword-only compatibility.

## Verification

- 315 repository tests passed, including 115 Ask S.O.H behavioural/service tests; TypeScript and targeted ESLint passed.
- Local Next.js production build passed for the initial architectural commit; the corrected code is validated by Vercel Preview before acceptance.
- QA migration applied; production migration/release not applied.
- QA transaction: editing a verified fact produced `status=review`, `verified_at=null`, and exactly one version. Rolled back all test rows.
- QA semantic query: matching vector returned 1 test fact, opposite vector returned 0. Rolled back test data.
- Initial Preview discovered real UNILORIN articles but exposed an Elementor/sidebar extraction error. Fixed by balanced post-content extraction and content-aware notice ranking, with a regression test. A fresh official-page download confirmed the article body and stated registration deadline.
- Corrected Preview also exposed category ambiguity: a generic registration question selected an inter-university transfer notice. Added an application-type clarification gate and screening-category exclusions, plus behavioural regression tests.
- Automated actual-source evaluation covers UNILORIN, LASU, FUOYE, LASUSTECH, UNIOSUN, JAMB, WAEC and NECO. Retrieval failures are preserved as coverage gaps, not successful deadline answers. Run `node --use-env-proxy scripts/ask-soh-live-evaluation.cjs /tmp/ask-soh-live.json`.

- Coverage follow-up verified real LASU public AJAX notices, FUOYE category declarations, LASUSTECH explicit reopening dates and NECO external registration PDFs. Preview verification and remaining inaccessible-source coverage are recorded in PR #324.

## Acceptance and deployment

PR #324 is a draft until corrected Preview verification is complete. The Preview must use QA Supabase; production must not be promoted until its additive migration and verified acceptance results are approved. Original QA branch bindings are restored after each isolated Preview build.

Limitations: external sources can timeout, block extraction, omit publication dates or omit academic sessions. Those cases require review. Scanned PDFs need OCR. Institution domains require reviewed registry entries; URLs/aliases can be maintained through the existing institution table. This work does not claim universal notice discovery or proof that no newer extension exists.

Work allowance cannot be measured through the tools. Do not begin Phase 2 until Phase 1 acceptance and the user's remaining allowance are confirmed.

## Recovery checkpoint, 10 October 2026

Resumed PR #324 at `4f7152b9ccb20bbf518832495d49ef54f99c22c6`; its GitHub CI was successful and Preview `soh-consults-3u8yozi9u-symbol-of-honour.vercel.app` was READY. The Preview redirects unauthenticated requests to Vercel SSO. Protection was not disabled and no share/bypass links were created.

Recovery fixes require registration/application wording in a JAMB deadline clause, preventing a neighbouring examination closing date from becoming a registration deadline. Agency REST searches use registration rather than university Post-UTME keywords. PDF extraction accepts up to 32 MB, rejects more than 80 pages, and releases its parser in a finally block. Byte limits remain enforced before and during streaming. These bounds do not resolve network timeouts, OCR, or the existing 24,000-character evidence window.

Validation: 320 repository tests passed, including five new regressions; TypeScript and targeted ESLint passed. The PDF test uses an actual generated PDF exceeding 8 MB; separate tests reject excessive page count and declared byte size. QA read-only inspection confirmed RLS on facts, institutions and versions, the installed guard trigger, transactional history, review demotion for authoritative changes, source ownership and future-review checks. No migration was applied in this recovery; historical rolled-back behavioural QA tests are documented above.

Real eight-institution evaluation (local outbound environment, not Vercel runtime):

| Institution | Result |
| --- | --- |
| LASU | High confidence, dated official reopening deadline, 9 August 2026 |
| UNIOSUN | High confidence, dated official deadline, 17 September 2026 |
| LASUSTECH | High confidence, dated official reopening deadline, 25 August 2026; earlier Vercel 403 is still unverified |
| NECO | Medium confidence, official normal external-registration deadline, 26 October 2026; publication metadata unavailable |
| FUOYE | Low confidence; UTME deadline unverified |
| WAEC | Low confidence; registration deadline unverified |
| JAMB | Low confidence; archive 404s, oversized PDFs and network timeouts |
| UNILORIN | Low confidence; conflicting explicit deadlines remain under review |

UNILORIN's 6 July publication explicitly extends registration to 12 July. Its 2 August publication quotes the Admissions Officer and explicitly lists 9 August, but does not explicitly identify the notice as superseding the July extension. The algorithm therefore continues to flag the conflict rather than choose the later date. Publication, registration, slip-printing and examination dates remain distinct.

Phase 1 is not accepted yet. Remaining work: current protected Preview API evaluation with QA database binding confirmed; JAMB large-document/time-budget and mixed-topic/year evidence coverage; authoritative FUOYE UTME and WAEC registration evidence; UNILORIN supersession resolution; NECO publication metadata; Vercel-specific LASUSTECH access validation. Current source-access failures are safe escalations, not proven retrieval coverage.

Calculators, CMS publishing, branding, production and database schema were not modified. The abandoned Admission Matcher was not revived. Phases 2–5 remain planned and require further authorisation; Phase 2 is not started. Work allowance is not exposed to these tools and cannot be estimated as a measured percentage.

## Phase 1 completion follow-up

Closed implementation gaps with reusable news-subdomain WordPress discovery, balanced TagDiv article extraction, explicit portal ticker notices, same-owner archive filename-case recovery, updated-document ranking and a shared 55-second discovery budget. Public PDF requests are limited to two concurrent downloads, up to 32 MB and 80 pages. Pages retain individual citations and applicability, including their real page numbers; all pages are available to conflict detection. Truncated evidence is rejected rather than promoted to high confidence. Public bulletin issue dates are extracted only from explicit volume/issue headers. HTTP modification dates, PDF creation dates and search crawl dates are not substituted for publication dates.

JAMB's retrieved 9 MB, 26-page official bulletin demonstrates the distinction between the misleading short headline and its explicit body/update: PIN vending ends 26 February; completed UTME registration ends 28 February. Registration and PIN questions now use separate clause checks and labels. An updated bulletin link is prioritised without hardcoding any individual notice URL. Outbound failure still produces a safe escalation.

UNILORIN supersession requires more than a later date: an attributed Admissions Office statement, matching explicit deadline summary, coherent later slip-printing/test sequence and later publication than competing notices. The later schedule is reported at medium confidence with the earlier notice retained. Missing attribution, mismatched summaries, incoherent schedules and late publication remain conflicts. This is evidence-based schedule reconciliation, not automatic selection of the largest date.

FUOYE's news subdomain now supplies its dated initial UTME screening period, ending 10 July 2026; this does not prove absence of subsequent reopening. Direct Entry requires separate explicit category evidence. WAEC's official private second-series ticker supplies normal registration ending 18 September 2026, with walk-in registration kept separate. WAEC and NECO notices without genuine source publication dates remain medium confidence and retain their metadata limitations.

Local validation: 340 tests passed; TypeScript and targeted ESLint passed. Five new tests in the initial recovery and twenty in this follow-up cover actual parsing, evidence conflicts, category separation, portal content, PDF bounds/concurrency, cancelled discovery, and runtime availability. Missing rate-limit backend configuration now returns a fail-closed HTTP 503 instead of falsely telling visitors they exhausted their quota; actual quota exhaustion remains HTTP 429.

The current isolated Preview is being built with the existing QA-only Supabase bindings. Both bindings will be restored to qa/production-readiness after the build. Authenticated Vercel connector requests preserve Deployment Protection; temporary authentication links are not published. Final CI, Preview API coverage and acceptance status are recorded in PR #324 after validation. No production merge, migration or release is authorised. Phases 2–5 remain planned.

Preview testing exposed and fixed a registry freshness error: reading a still-valid reviewed fact now sets its evidence observation timestamp to the current record read, while the original review and validity dates remain enforced by fact applicability. A route regression verifies a three-day-old review still returns the exact score and expired review records remain inapplicable. JAMB archive filename spelling is corrected before downloading, with a same-host archive fallback only on HTTP 404.

## Authorised production release

On 11 October 2026 (Africa/Lagos), the user authorised deployment of Phase 1 followed by Phase 2 implementation. The reviewed additive ask_soh_phase1_evidence migration was applied to production rajbswknmdscrilrcwoj. Verification confirmed both new fields, the review/history trigger, seven original facts preserved, no anonymous fact read grant and no service-role audit-history write grant. The scope guard is identical to the installed guard body and does not require a redundant migration.

Phase 1 acceptance completed at bd95943412aa30dd788f9c6ea3de48e5993c9cc6: 341 repository tests, 141 Ask S.O.H tests, TypeScript, full lint (zero errors / 18 existing warnings), CI success and READY protected QA Preview with eleven HTTP 200 evaluations (nine grounded and two safe escalations). Final detailed coverage is recorded in PR #324. JAMB registration and PIN vending were separately verified from the updated bulletin. LASUSTECH access and WAEC/NECO publication metadata remain documented safe limitations.

Production release completed through PR #324, with score-label and evidence-collision corrections in PRs #327 and #328. Current release commit: 8f5af18f7970f8e465cd8fb117046ab44447e51b; production deployment dpl_CS4qVqGkwX4KkKjGgR1rteRmA3j9 is READY and assigned to sohconsults.com.ng. The live LASU 2026/2027 minimum JAMB score query returns 195/high with the official screening source, independently confirmed by the user. Different evidence at the same URL is retained for conflict detection; a fetched page cannot overwrite reviewed evidence solely because its URL matches. Repository protections were retained. Phase 2 is now authorised. Phases 3–5 remain planned and are not authorised by this instruction.
