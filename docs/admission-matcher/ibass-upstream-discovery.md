# JAMB IBASS upstream discovery

Date: 2026-10-02

## Decision

Treat JAMB IBASS as the authoritative upstream evidence source for programme availability and JAMB admission subject/qualification requirements. S.O.H CONSULTS remains a separate intelligence layer and must not copy JAMB branding, UI, source code, or imply affiliation.

Production is unchanged during discovery.

## Public surfaces confirmed

The public IBASS application exposes institution brochure pages, programme-by-faculty brochure PDFs, degree-specific institutional requirements, and the JavaScript Eligibility Checker.

Search-engine-visible institution pages demonstrate that programme catalogues can be publicly enumerated for at least some institutions. Public JAMB documents contain baseline UTME/Direct Entry requirements and institution-specific special-consideration/waiver remarks.

## Browser-observed eligibility contract

A normal browser submission of the public IBASS Eligibility Checker for University of Lagos / Accountancy-Accounting / UTME was inspected in Chrome DevTools on 2026-10-02. The checker generated an XHR request named `submit` which returned HTTP 200 and a structured JSON response. No secret headers, cookies, credentials or tokens were captured or stored in this repository.

The observed response contains structured objects/fields for:

- institution details, including the upstream institution name/identity;
- programme details, including upstream programme label, faculty and institution associations;
- programme UTME requirement wording;
- programme subject data / normalized requirement metadata;
- candidate-submitted UTME subjects;
- separate UTME qualification status and passed/failed subject information;
- candidate-submitted O-Level information;
- programme O-Level requirement subject data;
- overall eligibility status;
- upstream requirement records and metadata.

The observed result is important semantically: IBASS can report the UTME subject-combination component as `Qualified` while the candidate's overall eligibility is `Disqualified`. S.O.H must therefore model eligibility as composable checks rather than a single boolean.

The UNILAG Accounting observation also demonstrates that free-text categories such as `any Social Science subject` must not be expanded using an S.O.H-created broad taxonomy. IBASS's actual accepted subject mapping/requirement metadata is authoritative. Subjects commonly described informally as social-science/business subjects must not automatically be treated as interchangeable unless the upstream rule/evidence says so.

## Integration guardrails

1. Do not copy or proxy JAMB branding/UI/source code or imply affiliation.
2. Do not bypass authentication, bot controls, rate limits, CAPTCHAs or access restrictions.
3. Do not put an undocumented JAMB endpoint directly in the candidate-facing runtime until reuse terms, stability and failure behaviour are understood.
4. Prefer versioned ingestion of public official evidence over fragile runtime dependence.
5. Store raw source wording alongside normalized rules, source URL/locator, observed date and parser/schema version.
6. Candidate matching must use a local versioned snapshot so JAMB downtime or a changed frontend cannot silently alter S.O.H results.
7. IBASS baseline requirements and institution-specific special considerations must remain distinguishable.
8. Unresolved or ambiguous evidence remains `Needs Review`; never promote by analogy.
9. Keep S.O.H overlays separate from JAMB-derived requirements: current screening threshold, first-choice policy, screening notices, deadlines, age/administrative conditions, competitive cut-offs and explanatory text.
10. Schema must support UTME now and Direct Entry/A-Level later.
11. Preserve component outcomes (UTME, O-Level, A-Level/DE where applicable, institutional overlay) independently from the final S.O.H verdict.
12. Never invent broad subject-category membership when IBASS provides a narrower accepted set or machine-readable mapping.

## Canonical evidence model

- upstream provider (`jamb-ibass`)
- entry mode (`utme`, `direct-entry`)
- institution id/name/category/type
- programme canonical name + upstream label + aliases
- faculty
- raw baseline O-Level requirement wording
- normalized O-Level required credits/passes and grouped alternatives
- raw baseline UTME requirement wording
- normalized UTME subjects and grouped alternatives
- Direct Entry/A-Level requirements
- institution-specific special-consideration/waiver clauses
- upstream subject/category mapping where observed
- component eligibility checks
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

1. discover official public catalogue/document/checker evidence;
2. capture raw evidence without destructive normalization;
3. normalize institutions, programmes and exact subject mappings;
4. attach institution-specific waiver clauses;
5. validate duplicates, impossible subject names and unresolved category mappings;
6. compare representative normalized results with the official Eligibility Checker;
7. publish a versioned snapshot only after regression tests;
8. preserve the previous snapshot for rollback and evidence history.

A sync failure must leave the last known-good snapshot active. New/changed ambiguous rows default to review rather than silently changing eligibility.

## Runtime architecture decision

The target architecture is hybrid rather than a live clone:

`Official JAMB IBASS evidence -> controlled ingestion/parity checks -> versioned local S.O.H snapshot -> S.O.H matching engine -> current institution overlays -> candidate explanation`

This gives S.O.H broad JAMB-backed programme intelligence while retaining independent availability, reproducibility, current institutional screening intelligence and explicit evidence safeguards.

A direct live dependency on the observed `submit` XHR is intentionally deferred. Discovery of a structured response proves that automated normalization/parity tooling is technically plausible, but it does not by itself establish that JAMB intends the endpoint to be a stable public API. A local snapshot remains the safe production design unless a documented/stable integration surface is established.

## Prototype parity cases

### UNILAG Accountancy/Accounting

Use as the first upstream parity case. Preserve the upstream programme label `ACCOUNTANCY/ACCOUNTING`. Compare raw UTME/O-Level requirement wording, exact accepted subject mapping, component outcomes and final eligibility. Do not remove review flags until the complete upstream requirement plus current UNILAG overlay is reconciled.

### LASUSTECH Accounting

Use as the regression case because the existing S.O.H profile is already known to return `Requirements Matched`. The upstream prototype must not regress that outcome without authoritative evidence demonstrating that the old rule is wrong.

## Next implementation gate

Before broad migration:

1. introduce typed upstream evidence/snapshot structures without replacing the existing matcher;
2. create a fixture representing the observed UNILAG response shape using only non-secret requirement/result fields;
3. implement a normalizer that preserves raw wording and produces explicit component checks;
4. add parity tests for UNILAG and LASUSTECH;
5. ensure unknown subject-category membership produces `Needs Review`, not an inferred match;
6. keep all existing production records active until snapshot parity passes.
