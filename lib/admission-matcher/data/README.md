# Admission Matcher data audit

Checked 2026-10-02. All data and logic are isolated from existing calculators.

The registered dataset contains 341 institution/programme records, 182 distinct
programme names and 23 institutions. These are catalogue counts, not fully
verified eligibility coverage. 48 records, representing 41 programmes at three
institutions, have fully verified stored UTME screening, subject, credit and
sitting checks. 293 records require review. No national completeness is claimed.
Federal and state university entries are represented. The model supports
polytechnics, monotechnics and colleges of education; no such records are claimed.

## Sources and scope

- The [first institution expansion batch](./expansion/README.md) adds 111 records
  across 19 independently researched institutions. All 111 remain Needs Review.
  Each institution has its own module with observed live IBASS table text and
  current institutional source limitations. Existing institution records and
  matching semantics are preserved.

- JAMB IBASS live UNIOSUN institution catalogue, reconciled with UNIOSUN's current
  undergraduate pages and its dated 2026/2027 Post-UTME notice. The active set now
  contains 18 UNIOSUN records. The 2026/2027 notice verifies first choice, the 160
  general screening floor, the 200 floor for Law and Nursing, five relevant
  credits, a maximum of two sittings generally and one sitting for Law/Nursing.
  Medicine is explicitly put on hold for 2026/2027 and is therefore excluded from
  active matching even though it remains visible in the broader IBASS catalogue.
  Arabic Language and Literature remains excluded because its IBASS entry points
  to an unexpanded requirement. Programme subject rules remain review-only where
  the general JAMB table has not yet been reconciled with a sufficiently explicit
  current UNIOSUN programme rule. Screening floors are not admission guarantees.
- FUOYE official 2026/2027 admission requirements PDF, programme screening-score
  page and current Post-UTME portal. 63 programme records have source-backed
  programme subjects/scores. The current general sitting rules remain unresolved.
  Finance, Geology, Chemistry Education and Physics Education have additional
  ambiguous/conflicting subject rules and cannot decide those checks. Law is
  excluded because FUOYE's current portal explicitly suspends 2026/2027 admission.
- LASUSTECH official 36-programme requirements directory, supplemented by its
  2026/2027 screening notice. The 195 figure is an institution screening floor,
  not a programme admission cutoff. First choice and maximum two sittings are
  checked. Aquaculture needs an additional Physics pass-grade check; Horticulture
  has pass-grade waivers; Arts and Industrial Design has broad subject-category
  rules. These three records remain review-only. An undated directory is labelled
  explicitly as current undated requirements, with the dated screening source
  separate. Administrative screening and origin-verification requirements are
  disclosed, not represented as an admission guarantee.
- The inherited 27-institution Accounting expansion references the JAMB
  Administration brochure. That PDF currently cannot be revalidated as a dated
  2026 document. Current programme availability and institutional exceptions
  remain unverified. These 27 records are retained in a separate research file and excluded from
  active matching, programme discovery and coverage counts. Unconfirmed programme
  availability must not be presented as an assessed option.
  Illustrative inherited subject pools are never treated as institutional rules.
  Other institutional cutoffs stay unknown.
- LASU's current 2026/2027 screening portal independently confirms the institution
  screening floor of 195, LASU first-choice requirement and O'Level upload to JAMB
  CAPS. LASU's official course checker confirms Accounting with English Language,
  Mathematics and Economics as the core and describes the remaining requirement
  broadly as Social Science. The current JAMB IBASS Administration brochure was
  also checked for the general Accounting framework and LASU special-consideration
  context. The record now stores the source-backed five-credit framework and a
  maximum of two sittings. The complete current LASU accepted Social Science
  subject set and any programme-specific waivers are still not sufficiently
  explicit across the authoritative sources, so UTME and O'Level subject checks
  remain review-only. A candidate at 195 or above therefore does not become a
  confirmed LASU Accounting match merely because the score/sitting checks pass.

Every record has source label, URL, scope/session information and check date.
A check date is not a claim that every institutional rule was confirmed. The
verification status, unresolved checks and review reasons state those limits.
The source registry alone does not establish record verification.

## Matching semantics

- Exactly three distinct UTME subjects excluding Use of English. Aliases are
  normalised without conflating genuinely different subjects.
- UTME choices are restricted to the 24 non-English subjects in the official
  JAMB 2026 Training Manual (printed page 92). O'Level-only subjects such as
  Marketing, Civic Education, Book Keeping and Further Mathematics cannot be
  submitted as UTME choices even when an institution's table lists them.
  Source: https://www.jamb.gov.ng/PDFs/2026/2026%20TRAINING%20MANUAL%20%20final.pdf
  This restriction is enforced in both the UI and the matching engine.
- All compulsory subjects plus the specified number of distinct alternatives.
  A credit cannot satisfy two independent option slots or count again as a core
  subject. An allocation algorithm handles overlapping groups correctly.
- One/two sittings, first-choice requirements and SSCE-equivalent credit inputs.
  NBC and pass-grade exceptions need review. Direct Entry is outside scope.
- Unknown scores, sitting rules, institutional exceptions, missing provenance or
  malformed subject rules cannot produce a confirmed match. A known failure is
  reported as not matched even when other checks still need review.
- Aliases search existing records; they do not create fictitious programmes.
  Unsupported courses return no assessed records, not an ineligibility decision.

## Regression and scope protection

Behavioural tests execute the TypeScript engine and registered datasets. They
cover Accounting, engineering, medicine, boundaries, counted alternatives,
normalisation, invalid profiles, overlapping allocation, sittings, first choice,
unknown requirements and unsupported programmes. LASU Accounting has explicit
regression cases for the owner's supplied subject profile at the 195 boundary,
above the boundary, below it, one/two sittings and wrong first choice; unresolved
subject categories remain review-only. UNIOSUN regression cases enforce the 160
baseline, first choice, Nursing's 200/one-sitting rules and the 2026/2027 Medicine
suspension without pretending unresolved subject combinations are verified.
Integrity tests distinguish catalogue counts from fully verified coverage and
reject duplicate records.
The dedicated Admission Matcher workflow rejects any changed path outside this
feature, its tests and its workflow, protecting every existing calculator and
all other production files. The existing repository CI remains unchanged.
