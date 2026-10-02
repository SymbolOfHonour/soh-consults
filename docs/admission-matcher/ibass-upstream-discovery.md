# JAMB IBASS upstream discovery

Date: 2026-10-02

## Decision

Treat JAMB IBASS as the authoritative upstream evidence source for programme availability and JAMB admission subject/qualification requirements. S.O.H CONSULTS remains a separate intelligence layer and must not copy JAMB branding, UI, source code, or imply affiliation.

Production is unchanged during discovery.

## Public surfaces confirmed

The public IBASS application exposes:

- institution brochure pages at `/brochure-courses?id=<institution-id>&school=<encoded institution name>`;
- programme-by-faculty brochure PDFs under `/assets/uploads/`;
- degree-specific institutional requirements PDF under `/assets/uploads/degree-specific-requirements.pdf`;
- the JavaScript eligibility checker at `/eligibility-checker`.

Search-engine-visible institution pages demonstrate that programme catalogues can be publicly enumerated for at least some institutions. The public PDFs contain baseline UTME/Direct Entry requirements and institution-specific special-consideration/waiver remarks.

## Integration guardrails

1. Do not depend on undocumented live checker endpoints until their normal browser request/response flow is inspected and reuse is shown to be stable and permitted.
2. Do not bypass authentication, bot controls, rate limits, CAPTCHAs, or access restrictions.
3. Prefer versioned ingestion of public official evidence over fragile runtime scraping.
4. Store raw source wording alongside normalized rules, source URL, locator/session when available, observed/fetched date, and parser/schema version.
5. Candidate matching must use a local versioned snapshot so JAMB downtime or a changed frontend cannot silently alter S.O.H results.
6. IBASS baseline requirements and institution-specific special considerations must remain distinguishable. A baseline row alone must never erase an institution waiver/exception.
7. Unresolved or ambiguous evidence remains `Needs Review`; never promote by analogy.
8. Keep S.O.H overlays separate from JAMB-derived requirements: current screening threshold, first-choice policy, institutional screening notices, deadlines, age/administrative conditions, competitive cut-offs and S.O.H explanatory text.
9. Schema must support UTME now and Direct Entry/A-Level later.

## Proposed canonical evidence model

- upstream provider (`jamb-ibass`)
- entry mode (`utme`, `direct-entry`)
- institution id/name/category/type
- programme canonical name + upstream label + aliases
- baseline O-Level required credits/passes and grouped alternatives
- baseline UTME subjects and grouped alternatives
- Direct Entry/A-Level requirements
- institution-specific special-consideration/waiver clauses
- normalized matcher rule(s)
- unresolved checks
- source URL + source type + locator
- source session/version if stated
- observed/fetched timestamp
- parser/schema version
- verification status
- S.O.H overlay references

## Sync strategy

Use an offline/versioned ingestion pipeline:

1. discover official public catalogue/PDF evidence;
2. capture raw evidence without destructive normalization;
3. normalize into canonical subjects/institutions/programmes;
4. attach institution-specific waiver clauses;
5. validate duplicates and impossible subject names;
6. compare representative normalized results with the official Eligibility Checker;
7. publish a versioned snapshot only after regression tests;
8. preserve the previous snapshot for rollback and evidence history.

A sync failure must leave the last known-good snapshot active. New/changed ambiguous rows must default to review rather than silently changing eligibility.

## Prototype parity cases

### UNILAG Accountancy/Accounting

Use as the first new parity case. Current stored evidence already contains live IBASS programme wording plus official UNILAG screening overlays. The eligibility-checker result must be compared against the normalized rule before any review flag is removed.

### LASUSTECH Accounting

Use as the regression case because the existing S.O.H profile is already known to return `Requirements Matched`. The upstream prototype must not regress that outcome without authoritative evidence demonstrating that the old rule is wrong.

## Discovery finding

The architecture can proceed immediately using public official brochure/catalogue evidence and versioned local ingestion. What remains unresolved is whether the JavaScript Eligibility Checker itself exposes a suitable reusable request/response API. That question requires normal browser DevTools Network inspection while submitting a checker request. Until then, no undocumented checker endpoint should be built into production.

## Required browser evidence to resolve API question

For one UNILAG Accountancy/Accounting eligibility submission, capture the DevTools Network request(s) triggered by `Check Eligibility`, including request URL/method, non-secret request payload/parameters, response shape/status, and whether authentication/session/anti-bot state is required. Do not send cookies, authorization tokens, passwords or other secrets.
