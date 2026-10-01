# Admission Matcher data audit

Checked 2026-10-01. All data and logic are isolated from existing calculators.

The registered dataset contains 119 institution/programme records, 95 distinct
programme names and 4 institutions. These are catalogue counts, not fully
verified eligibility coverage. 33 records, representing 33 programmes at
LASUSTECH, have fully verified stored UTME screening, subject, credit and
sitting checks. 86 records require review. No national completeness is claimed.
Federal and state university entries are represented. The model supports
polytechnics, monotechnics and colleges of education; no such records are claimed.

## Sources and scope

- JAMB IBASS live UNIOSUN institution catalogue, 19 programme records transcribed
  from individual View Details tables. The 20th entry, Arabic Language and
  Literature, refers to another unexpanded requirement and is excluded. General
  JAMB rules do not include every university waiver. Institutional screening
  scores, waivers and sittings remain unresolved. The catalogue does not state a
  session; it is labelled as a live, undated reference rather than a 2026 brochure.
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
- LASU's current portal independently confirms its institution screening floor of
  195 and first-choice requirement. The official JAMB course checker confirms
  Accounting and core subjects but broad social-science wording leaves credit
  count, accepted subject categories and current sitting/waiver rules unresolved.

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
unknown requirements and unsupported programmes. Integrity tests distinguish
catalogue counts from fully verified coverage and reject duplicate records.
The dedicated Admission Matcher workflow rejects any changed path outside this
feature, its tests and its workflow, protecting every existing calculator and
all other production files. The existing repository CI remains unchanged.
