# Admission Matcher release report, 4 October 2026

**NOT MERGED - BLOCKED**

The execution environment disconnected after national capture and local integration testing. Terminal recovery failed with `409 Conflict, environment_offline: Environment is not connected`. Browser recovery returned the same error. GitHub remains available. This is an external workspace blocker, not a request for another approval.

## Dataset and reconciliation

- All 529 official degree-catalogue institutions were discovered and completely captured. No institution retrieval remains failed or partial.
- 15,696 source offering rows; 1,596 literal source labels including the blank value; 1,513 nonblank labels after case and whitespace normalization only.
- 15,192 named institution/programme presentation pairs. All original offering IDs are retained; identical institution/title rows are collapsed only for presentation.
- Eight blank-title source offerings are preserved as explicit unresolved exceptions. No title is guessed from another institution or a conflicting programme ID.
- UTME evidence: 9,562 source rows. O'Level evidence: 9,562. Direct Entry evidence: 9,546. Special-consideration evidence: 8,354.
- New verified records: 0. New review records: 15,696. Existing curated verification is preserved.
- Institution pagination totals reconcile for all 529 institutions. No duplicate offering IDs or pagination conflicts were found.
- All nine official brochure families captured, totaling 1,043 pages and 2,932 nonempty raw table rows.
- Brochure page coverage: Administration 49; Agriculture 80; Arts/Humanities 126; Education 216; Engineering/Environmental/Technology 143; Law 14; Medical/Pharmaceutical/Health Sciences 63; Sciences 231; Social/Management Sciences 121.
- Medical is explicitly included. Its national index has 18 entries, including Medicine and Surgery, Dentistry, Nursing, Pharmacy, Medical Laboratory Technology/Science and Physiotherapy.
- The live catalogue has 1,423 source offerings in the official department values MEDICAL, MED/PHARM/HEALTH SCIENCES and HEALTH. All remain review.
- Every nonempty brochure table row is retained as an exact evidence association or explicit unresolved exception. Every index candidate and every page's raw text remains available in the local evidence snapshot. No fuzzy programme or institution join is used.
- Exact identity reconciliation between the public checker's 299 degree institutions and the live institution catalogue found 168 exact full-name mappings and 131 unresolved identities. These are different ID namespaces, e.g. UNILAG catalogue 494 and checker 1345.
- Brochure continuation interpretation, programme variants, ambiguous abbreviations, subject categories and institution-specific waivers remain review. This is evidence accounting, not a claim that all semantic admission rules are verified.
- Seven live rows carry the official department NATIONAL DIPLOMA inside the degree-institution catalogue; they require scope review rather than an inferred degree classification.
- The new runtime catalogue stores all raw offering IDs plus eight explicit unnamed exceptions. Structural tests compare its union against every captured source offering, so there are no silent missing or orphan imported offerings.

## QA

Local expanded implementation:
- Full repository tests: 181 passed, 0 failed.
- Five new national tests validate all offering IDs and raw-evidence references, every brochure page/table row, Medical coverage, unsafe schema mutations, review-only health results and the LASUSTECH Accounting regression.
- Lint: 0 errors, 12 existing warnings.
- Type checking: passed.
- Optimized production build: passed.
- Raw audit blobs are excluded from the browser bundle. The candidate-facing integration uses an offline local snapshot through a public S.O.H GET route, never direct JAMB runtime requests.
- Institution selection adds search and alphabetic ordering. Identity joins require an exact official full name or an unambiguous official abbreviation already explicitly associated with the curated institution.

Official checker observations:
- 29 synthetic probes completed across three institutions, covering Administration, Agriculture, Education, Engineering, Environmental, Law, Sciences, Social Sciences, Medicine, Nursing, Pharmacy, Dentistry, Medical Laboratory Science, Physiotherapy, Radiography and Biomedical Engineering. The initial Arts selection was Education and English Language; a separate exact English Language probe remains needed.
- Qualified and disqualified UTME/O'Level observations, Commerce alternatives, Civic/Marketing category probes and a DE probe were captured without personal data.
- UNILAG Accounting accepted the tested Commerce, Civic Education and Marketing third-subject requests. This does not establish a general taxonomy or approved UTME subject list; no category rule was promoted.
- The checker returned an Agriculture UTME disqualification despite an apparent slash alternative in its configuration. This discrepancy remains review.
- Engineering and Architecture O'Level probes exposed institution-specific Further Mathematics and Fine Art/Technical Drawing requirements. Additional targeted waiver/alternative probes remain needed.
- DE success labels do not establish DE qualification eligibility; no DE record was verified.
- The local raw probe file is at audit/ibass-2026-10-04/parity-probes.json. It was not uploaded before the environment disconnected.

Last pushed code checkpoint:
- Commit ed206b6ece768d0a9d33a494d0f2f07bf7844b6e passed both GitHub CI and Admission Matcher workflows.
- Isolated Vercel Preview deployed successfully.
- Preview homepage CTA was present after hydration and led directly to Admission Matcher.
- Desktop Homepage → Matcher → candidate input → results passed for Accounting.
- LASUSTECH Accounting, score 245, Mathematics/Economics/Government UTME, five appropriate credits, one sitting and LASUSTECH first choice returned Requirements Matched.
- No site runtime error was observed in that journey; the observed console error originated from a browser extension.
- Mobile viewport emulation was unavailable; mobile browser verification is not claimed.
- This Preview tested the earlier pushed checkpoint, not the locally expanded national integration. Expanded Preview health-programme QA, selectors, and complete major-feature browser regression remain pending.

## Git and preserved work

Repository: SymbolOfHonour/soh-consults
Branch: feature/admission-matcher-verification-depth
PR: #213, open, draft, unmerged; GitHub reported mergeable before the documentation checkpoint.
Last CI-validated source HEAD: ed206b6ece768d0a9d33a494d0f2f07bf7844b6e.

Pushed source changes include main synchronization, current official URLs for all nine brochure families, resumable capture/audit tooling, stricter snapshot provenance/schema validation and tests preventing incomplete requirements or DE rules from being promoted using UTME evidence.

This report and the already-uploaded full 1,043-page brochure evidence are committed through GitHub after the workspace outage. The national snapshot and expanded integration remain in the disconnected workspace and could not be uploaded:
- app/admission-matcher/MatcherClient.tsx
- app/api/public/admission-matcher/route.ts
- lib/admission-matcher/national-catalogue.ts
- lib/admission-matcher/national-snapshot.ts
- lib/admission-matcher/data/national-catalogue-2026-10-04.json
- tests/admission-matcher-national.test.cjs
- tests/admission-matcher-helper.cjs
- docs/admission-matcher/tools/build-national-catalogue.py
- docs/admission-matcher/tools/index-ibass-brochures.py
- docs/admission-matcher/tools/reconcile-ibass.py
- docs/admission-matcher/tools/capture-ibass-parity.py
- local audit snapshots, original response/PDF archives and parity observations.

Workspace root: /workspace/scratch/6dd66903a2f4/soh-consults.
Canonical completed capture: audit/ibass-2026-10-04.
The final local audit rebuild was started immediately before disconnection; verify its completion on recovery. Do not start overlapping captures. The complete cached capture is resumable without requesting successful pages again.

## Production

Main was not modified and PR #213 was not merged. No production deployment or production success is claimed.
Production target: https://sohconsults.com.ng.
No production candidate, health-programme, LASUSTECH or post-release regression verification occurred. No corrective PR was needed.

## Exact blocker and recovery

Restore/reconnect the execution workspace. No new authorization is needed.

After recovery:
1. Verify the completed audit rebuild; preserve/upload the national evidence snapshot and final source changes.
2. Finish exact Arts and targeted waiver probes; compile discrepancies and final medical/alias metrics.
3. Make audit tool paths consistent under docs/admission-matcher/audit, keeping all source provenance.
4. Rerun final structural/tests/type/build checks and push the national integration.
5. Wait for its GitHub checks and isolated Preview; test the entire homepage journey, multiple health programmes and all required site features.
6. Merge only after every mandatory gate passes; then verify the actual production deployment and journeys.

The environment outage prevents safe completion of these final gates. Do not merge the earlier limited checkpoint merely because its CI passed.
