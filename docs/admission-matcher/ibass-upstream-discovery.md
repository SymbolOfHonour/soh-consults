# JAMB IBASS upstream discovery

Date: 2026-10-02

## Decision

Treat JAMB IBASS as the authoritative upstream evidence source for programme availability and JAMB admission subject/qualification requirements. S.O.H CONSULTS remains a separate intelligence layer and must not copy JAMB branding, UI, source code, or imply affiliation.

Production is unchanged during discovery.

## Browser-observed contracts

### Eligibility result

A normal browser submission of the public IBASS Eligibility Checker for University of Lagos / Accountancy-Accounting / UTME was inspected in Chrome DevTools on 2026-10-02. The checker generated an XHR request named `submit` which returned HTTP 200 and structured JSON. No secret headers, cookies, credentials or tokens were captured or stored.

Observed semantics include institution/programme details, raw UTME/O-Level requirements, normalized requirement metadata, submitted subjects, component qualification results and an overall eligibility result. IBASS can report UTME subject combination as `Qualified` while overall eligibility is `Disqualified`, so S.O.H models eligibility as composable checks rather than one boolean.

Free-text categories such as `any Social Science subject` must not be expanded using an S.O.H-created broad taxonomy. IBASS's actual accepted subject mapping is authoritative.

### Institution -> programme catalogue

A second normal browser observation was made after selecting University of Lagos in the same checker. One XHR request named `1345` returned HTTP 200 with a successful JSON object shaped as:

`{ status: true, message: "Success.", data: [{ id, title }, ...] }`

The request name matches the observed UNILAG upstream institution id (`1345`). Visible public programme pairs included `1537 -> ACCOUNTANCY/ACCOUNTING`, `1542 -> ACTUARIAL SCIENCE`, `2303 -> ADULT EDUCATION:`, `2191 -> ARCHITECTURE`, `1540 -> BANKING AND FINANCE`, `1678 -> BIOCHEMISTRY`, and `2120 -> BIOLOGY`.

This confirms that IBASS uses stable-looking upstream identifiers in the current browser application for institution-to-programme discovery. It does NOT by itself establish a documented/stable public API, so the candidate-facing S.O.H runtime still must not call the endpoint directly. The identifiers and response shape are captured only as evidence for a controlled offline/versioned catalogue ingestion layer.

## Integration guardrails

1. Do not copy/proxy JAMB branding, UI or source code or imply affiliation.
2. Do not bypass authentication, bot controls, rate limits, CAPTCHAs or restrictions.
3. Do not make undocumented IBASS XHRs a candidate-facing runtime dependency.
4. Prefer versioned ingestion of official public evidence.
5. Store raw wording and upstream ids alongside normalized rules, source locator, observed date and schema version.
6. Candidate matching uses a local versioned snapshot.
7. Keep IBASS baseline requirements separate from institution-specific waivers and S.O.H current-session overlays.
8. Ambiguous evidence stays Needs Review.
9. Preserve UTME/O-Level/A-Level component outcomes independently.
10. Never invent subject-category membership.
11. Reject duplicate upstream programme ids/titles within one institution snapshot.
12. Preserve upstream labels even where punctuation looks unusual; aliases/canonical names are a separate S.O.H layer.

## Canonical evidence model

- upstream provider (`jamb-ibass`)
- entry mode (`utme`, `direct-entry`)
- institution upstream id/name/category/type
- programme upstream id + upstream label + canonical name + aliases
- faculty
- raw baseline O-Level requirement wording
- normalized O-Level required credits/passes and grouped alternatives
- raw baseline UTME requirement wording
- normalized UTME subjects and grouped alternatives
- Direct Entry/A-Level requirements
- institution-specific special-consideration/waiver clauses
- upstream subject/category mapping where observed
- component eligibility checks
- unresolved checks
- source locator/type
- observed timestamp
- parser/schema version
- verification status
- S.O.H overlay references

## Sync strategy

Use an offline/versioned ingestion pipeline:

1. discover official public catalogue/document/checker evidence;
2. capture raw evidence without destructive normalization;
3. normalize institution/programme ids and exact subject mappings;
4. attach institution-specific waiver clauses;
5. validate duplicates, impossible subject names and unresolved category mappings;
6. compare representative normalized results with the official Eligibility Checker;
7. publish a versioned snapshot only after regression tests;
8. preserve the previous snapshot for rollback/evidence history.

A sync failure leaves the last known-good snapshot active. New/changed ambiguous rows default to review rather than silently changing eligibility.

## Runtime architecture

`Official JAMB IBASS evidence -> controlled ingestion/parity checks -> versioned local S.O.H snapshot -> S.O.H matching engine -> current institution overlays -> candidate explanation`

A direct live dependency on the observed XHRs is intentionally deferred because structured JSON does not establish a documented/stable public API.

## Prototype parity cases

UNILAG Accountancy/Accounting is the first upstream parity case. Preserve the upstream programme label and id `1537`; keep review flags until complete upstream requirements and current UNILAG overlays are reconciled.

LASUSTECH Accounting remains the regression case because the existing S.O.H profile is already known to return `Requirements Matched`; the prototype must not regress it without authoritative contrary evidence.

## Next implementation gate

1. Catalogue model/parser and observed UNILAG fixture: implemented.
2. Typed eligibility evidence/snapshot model: implemented.
3. Conservative normalizer and validation gates: implemented.
4. Unknown category membership -> Needs Review: implemented.
5. Next discovery target: programme-selection/requirement-loading response, to determine whether requirement ingestion can be generalized without manual transcription.
6. Existing production records remain active until broad snapshot parity passes.
