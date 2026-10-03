# JAMB IBASS upstream discovery

Date: 2026-10-02

## Decision

Treat JAMB IBASS as the authoritative upstream evidence source for programme availability and JAMB admission subject/qualification requirements. S.O.H CONSULTS remains a separate intelligence layer and must not copy JAMB branding, UI, source code, or imply affiliation.

Production is unchanged during discovery.

## Browser-observed eligibility contract

A normal browser submission of the public IBASS Eligibility Checker for University of Lagos / Accountancy-Accounting / UTME was inspected in Chrome DevTools on 2026-10-02. The checker generated an XHR request named `submit` which returned HTTP 200 and a structured JSON response. No secret headers, cookies, credentials or tokens were captured or stored.

Observed response semantics include institution/programme details, raw UTME/O-Level requirements, normalized requirement metadata, submitted subjects, component qualification results and an overall eligibility result. IBASS can report UTME subject combination as Qualified while overall eligibility is Disqualified, so S.O.H models eligibility as composable checks rather than one boolean.

Free-text categories such as `any Social Science subject` must not be expanded using an S.O.H-created broad taxonomy. IBASS's actual accepted subject mapping is authoritative.

## Guardrails

1. Do not copy/proxy JAMB branding, UI or source code or imply affiliation.
2. Do not bypass authentication, bot controls, rate limits, CAPTCHAs or restrictions.
3. Do not make the undocumented XHR a candidate-facing runtime dependency.
4. Prefer versioned ingestion of official public evidence.
5. Store raw wording alongside normalized rules, source locator, observed date and schema version.
6. Candidate matching uses a local versioned snapshot.
7. Keep IBASS baseline requirements separate from institution-specific waivers and S.O.H current-session overlays.
8. Ambiguous evidence stays Needs Review.
9. Preserve UTME/O-Level/A-Level component outcomes independently.
10. Never invent subject-category membership.

## Architecture

`Official JAMB IBASS evidence -> controlled ingestion/parity checks -> versioned local S.O.H snapshot -> S.O.H matching engine -> current institution overlays -> candidate explanation`

A direct live dependency on the observed `submit` XHR is intentionally deferred because discovery of structured JSON does not establish a documented/stable public API.

## Prototype parity cases

UNILAG Accountancy/Accounting is the first upstream parity case. Preserve the upstream label and keep review flags until complete upstream requirements and current UNILAG overlays are reconciled.

LASUSTECH Accounting is the regression case because the existing S.O.H profile is already known to return Requirements Matched; the prototype must not regress it without authoritative contrary evidence.
