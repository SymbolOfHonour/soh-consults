# National checker reconciliation — 4 October 2026

The audit reconciles all 529 catalogue schools and 15,696 source offerings against a fresh capture of 299 official JAMB checker institutions and 8,274 programmes. Ordered official names, including the catalogue's explicit former-name fields, identify 281 schools. No fuzzy name or guessed ID joins are used. Of the source offerings, 4,913 have an exact checker programme title, 131 have ambiguous titles, 5,121 lack a resolved checker identity, and 5,531 are absent from this checker snapshot. Absence is not evidence of ineligibility.

An initial 179 institution/programme requests returned 118 usable responses and 61 HTTP errors. These requests targeted the initial identity mapping, rather than every programme at all 281 subsequently mapped schools. A further 192 synthetic positive/negative requests across 96 explicit configurations completed without request errors. Combined with the original 32 observations, the saved source contains 342 successful official observations. Capture files preserve unsuccessful attempts separately.

Every deployed component requires exact institution/programme association, an unambiguous current checker selection, identical parsed configurations across observations, and agreement with both positive and negative official outcomes. Categorical, incomplete and conflicting configurations remain unresolved. The result is 98 school/programme records, comprising 90 confirmed UTME components and 36 confirmed O'Level components; 28 records contain both. These counts describe independent subject components, not national admission verification.

Only UNILAG Medicine currently combines both confirmed subject components with the official 2026/2027 screening notice: 200 minimum UTME, first choice, and relevant credits at one sitting. This verifies the basic checks represented by the matcher. Age, registration, uploads, screening participation and final admission decisions are outside that result. Other unknown screening requirements remain review. NBC profiles defer SSCE-only credit interpretation for institutional review.

All screening calculators are unchanged. National verification remains incomplete; the audit does not mark missing requirements as finished.

## Reproduction

- `python -B docs/admission-matcher/tools/reconcile-checker-catalogues.py --check`
- `node docs/admission-matcher/tools/build-checker-subjects.cjs --check`
- `npm test`
- `npx tsc --noEmit`
- `npm run build`

The capture tool uses synthetic profiles, bounded concurrency, two-second request spacing, cached responses, and stops on rate limiting. The probe planner generates minimal valid and invalid profiles only from explicit supported configurations. The merge tool appends successful observations by unique key and saves complete attempt records. Official checker alternatives are separate programme recommendations and are not treated as subject waivers.
