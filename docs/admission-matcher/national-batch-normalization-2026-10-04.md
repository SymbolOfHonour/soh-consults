# National subject normalization: all captured schools

The batch processes all 529 institutions and all 15,696 captured offerings together. It consumes immutable SHA256-linked source evidence and emits provisional interpretations plus an institution-by-institution work list in `audit/ibass-2026-10-04/national-subject-proposals.json.gz`.

## Results

| Subject evidence | Explicit wording parsed | Needs manual interpretation | Missing capture |
| --- | ---: | ---: | ---: |
| UTME | 2,831 | 6,730 | 6,135 |
| O-Level | 1,136 | 8,426 | 6,134 |

981 offerings have both sections parsed. These are provisional generic subject interpretations, not verified institution-specific eligibility rules. Use of English is not counted among the three UTME electives. Every offering still requires waiver applicability, current screening conditions and official parity checks.

The parser accepts only entire supported sentences containing explicit subjects and counted groups. Unknown subjects, broad categories, overlapping groups, damaged text, trailing exceptions and alternative certificates remain unresolved. Original evidence hashes and institution IDs are retained; no source wording is replaced or guessed. Sitting limits and institutional score floors are not inferred.

## Completion boundary

National eligibility verification remains incomplete. The bulk batch reduces repeat interpretation work but cannot manufacture absent requirements or establish institution-specific waiver applicability. No record is promoted and candidate-facing matching behavior is unchanged. The output supports continuing the remaining national evidence work as one batch.

Screening calculators, formulas, routes and data remain unchanged. The previous LASU commit passed both remote CI and Admission Matcher checks. This normalization batch has reproducibility, coverage and adversarial parser tests.
