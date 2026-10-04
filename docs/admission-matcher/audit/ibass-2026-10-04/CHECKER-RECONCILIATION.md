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

## Completion of the initial school pass

A further 149 baseline requests and 38 positive/negative follow-ups completed the initial request pass across all 267 schools with exact checker selections. Together the captures contain 405 successful observations. At least one initial response succeeded at 143 schools; 124 schools did not return a successful selected-programme response. This is not evidence that every programme at those schools is unavailable. There are 142 distinct selected-programme requests with retained upstream errors, including different selections attempted at the same school.

The runtime now contains 117 records with 109 UTME components and 36 O'Level components; 28 contain both. A reproducible remaining-selection plan contains 4,617 exact programme selections without a saved successful observation. These remain pending research, not verified requirements. The 262 institutions omitted from this plan comprise 248 unresolved school identities and 14 mapped schools without an exact programme selection. It would be inaccurate to describe national verification as complete.

Current official notices additionally prevent UNIOSUN Medicine and FUOYE Law from receiving a match for 2026/2027. Confirmed screening fields supplement independent subject evidence without supplying unknown subject rules. The public catalogue displays the current component counts, supports equivalent ampersand searches, and returns exact existing-record evidence replacements separately from new national records. Verified curated records cannot be overwritten by these replacements.

## LASU sitting rule closed from the correct current notice

The paginated official news archive links the 2026/2027 UTME/Direct Entry announcement at https://lasu.edu.ng/home/news/read.php?id=642. Its article is loaded by the official page's session-backed public Ajax endpoint. It explicitly establishes two sittings generally, one for Medicine and Dentistry, and six relevant engineering credits when presenting two sittings. The source identity, current-session scope and article hash are saved in current-screening-sources.json. The unrelated notice is not used.

This completes the stored basic checks for 12 existing LASU health/science records: Medicine, Nursing, Medical Laboratory Science, Chemistry and eight previously reconciled health/science courses. Their valid profiles can now match; Medicine rejects two sittings. Engineering remains review because programme credit choices need further reconciliation. The separately confirmed national LASU Nursing record also combines its checker subject components with this screening baseline. Unknown subject fields on other LASU programmes are not promoted.

Final validation includes the full test suite, TypeScript, targeted ESLint, production build and public API smoke checks. All screening calculator files are unchanged.
