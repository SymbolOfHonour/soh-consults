# Admission Matcher recovery and release report, 4 October 2026

Release status: **MERGED AND DEPLOYED; post-deployment production browser verification blocked.**

The disconnected workspace was recovered. The national integration and full evidence snapshot are now being preserved on PR #213. PR #213 was merged only after the mandatory pre-release gates passed.

## Dataset and reconciliation

529 institutions discovered and completely captured; 0 failed or partial. 15,696 source offerings, 15,192 named institution/programme pairs, 1,513 programme labels after case/whitespace normalization, and 8 explicit blank-title exceptions. No source offering is silently omitted; 0 missing or orphan offerings. All original offering IDs and programme IDs remain in the audit snapshot.

UTME evidence: 9,562; O'Level: 9,562; Direct Entry: 9,546; special considerations: 8,354. All 15,696 new source records remain review. No new verified rules; existing curated verification is preserved.

All nine degree brochure families are captured: Administration (49 pages), Agriculture (80), Arts/Humanities (126), Education (216), Engineering/Environmental/Technology (143), Law (14), Medical/Pharmaceutical/Health Sciences (63), Sciences (231), Social/Management Sciences (121). Total: 1,043 pages and 2,932 nonempty table rows. Every page, table row and index candidate is retained as linked evidence or an explicit review exception. 97 row associations and 2,880 exceptions are preserved; some rows have both an association and an exception.

Medical is included explicitly. Its index contains 18 candidates, including Medicine and Surgery, Dentistry, Nursing, Pharmacy, Medical Laboratory Science/Technology and Physiotherapy. The original capture identified 1,423 offerings under the official MEDICAL, MED/PHARM/HEALTH SCIENCES and HEALTH departments. New medical results remain Needs Review.

Checker/catalogue IDs are separate namespaces. 168 exact full-name mappings and 131 unresolved checker identities remain documented. Eight blank names and seven NATIONAL DIPLOMA rows within the degree catalogue remain scope exceptions. Programme variants, abbreviations, categories and waivers are not inferred from similar names.

Coverage accounting passes. Semantic requirement interpretation remains review; this is not a claim that national admission rules are fully verified.

## Official parity observations

32 synthetic probes across three institutions and 17 programme groups, including Arts, Agriculture, Engineering, Environmental, Education, Law, Sciences, Social Sciences, Administration and eight medical/specialist groups. Qualified/disqualified UTME and O'Level cases, Commerce/Civic/Marketing alternatives and a DE probe are preserved.

Added exact English Language observation and Engineering/Architecture waiver-subject probes. Both Engineering and Architecture O'Level observations changed from disqualified to matching when Further Mathematics/Fine Art/Technical Drawing were added together. This identifies a requirement difference but does not isolate a universal substitution rule. English Language and Agriculture UTME discrepancies remain review. The earlier Arts probe selected Education and English Language; both the old and exact selections are retained.

These observations do not establish a general subject taxonomy or verified DE qualifications. New snapshot records deliberately return Needs Review rather than force pass/fail parity. The raw observations and checker configurations are preserved in parity-probes.json.gz.

## Implementation and QA

The public Matcher uses versioned local snapshots through /api/public/admission-matcher. No candidate-facing JAMB scraping. Raw evidence is kept in repository audit files and excluded from the browser bundle. Compact runtime snapshot is approximately 384 KB on the server; clients receive only catalogue summaries and requested programme records.

Searchable programme and first-choice institution selection, alphabetical ordering, existing curated rules, pagination and the homepage entry are preserved. Failed or stalled national requests show an explicit error and do not display incomplete results.

Recovered implementation: 182 tests passed, 0 failed; type check passed; lint had 0 errors and 12 existing warnings; optimized production build passed. Final rerun after request timeout and institution-type polish passed.

LASUSTECH Accounting: the 245-score, Mathematics/Economics/Government, appropriate five-credit, one-sitting, first-choice regression passes without changing the verified result. Medical listings safely remain review. Structural tests account for every source offering, every brochure row, medical coverage, unsafe snapshot mutations and preserved curated behaviour.

Both GitHub workflows passed on the final source HEAD. Final Vercel Preview deployed successfully. Desktop homepage-to-Matcher-to-results passed; LASUSTECH Accounting returned Requirements Matched (259 Accounting records: 1 matched, 250 review, 8 not matched). Medicine, Nursing, Pharmacy, Physiotherapy and Medical Laboratory Science were browser-tested; new records remained review. Affiliated colleges are no longer classified as universities from their names. Homepage, Opportunities, LASU Screening Calculator and CGPA tools loaded. The target planner returned required GPA 4.97 for 3.50 CGPA/60 units targeting 3.57 with 3 future units; the projector returned CGPA 3.57 for an A in a 3-unit course. Preview Updates loaded with zero rows; Preview environment data parity with production is not claimed. No website runtime errors were observed in the tested Matcher journeys; console errors came from a browser extension. The separate Cloudflare QA build failed, as it did before recovery; the authorized Vercel release deployment and both repository workflows passed. Mobile viewport emulation is not available in this browser; mobile browser verification is not claimed.

## Git and production

Branch: feature/admission-matcher-verification-depth. PR: #213, merged. Recovery base: 083ad93274d264f5884487a6b3a69ac47717ae58.

Final pre-merge source HEAD: 3a6ead2a20b36fbedc2a5e6c9490fae932338114. Merge/production commit: ff3a2f03e00668e13ac9796a45a63e3dc14af08c. Vercel production deployment succeeded: https://vercel.com/symbol-of-honour/soh-consults/5WGh3pnMAHSF9gk5mync8SYNwzez. No corrective PR was needed.

Post-deployment production verification is NOT complete. The browser opened the production homepage during deployment, then stalled for 300 seconds on Updates navigation. Its recovery/documentation call also timed out for 300 seconds, despite a 20-second requested timeout. Direct terminal probes of the homepage, Updates, Opportunities, LASU Screening Calculator, CGPA, Matcher and its national API all returned HTTP 403 from this execution context. A 403 alone does not establish a website defect or bot block. We did not bypass access controls or claim those pages passed.

Production target: https://sohconsults.com.ng. The remaining action is one live browser smoke check after browser access recovers: homepage → Matcher → LASUSTECH Accounting, a medical programme, and the major site pages. No new implementation approval is required. The user can also test the live page independently, but that does not transfer their session to this browser.

## Exact unresolved counts and artefacts

555 brochure index candidates retained; 252 have no exact catalogue-label match. Five brochure rows include ambiguous official institution abbreviations; 57 include programme-pair discrepancies against the catalogue. These are explicit exceptions, not silent losses. There are 2,880 brochure exception rows in total; exceptions can coexist with exact evidence associations. 131 checker institution identities remain unresolved. Subject-category and source-rule discrepancies are preserved in the raw checker probes and must not be interpreted as universal taxonomies.

Raw UTME, O'Level, DE, waivers, official institution/programme/offering identities, observation dates and URLs are in evidence-snapshot.json.gz. All 1,043 brochure page texts/tables are in brochure-evidence.json.gz. All row/index exceptions are in brochure-reconciliation.json.gz. Official checker observations are in parity-probes.json.gz. These files are committed on the feature branch and incorporated into the merge.

New import verification remains 0 verified, 15,696 review source records. Existing curated data contains 48 verified matching records across 41 programmes and three institutions. This release expands catalogue discovery substantially, but does not turn every new listing into an evaluated eligibility rule.

Recovery implementation changed 18 files; the institution classification correction changed three of those. PR #213 contains 36 changed paths including prior source checkpoints. Final release report is preserved on the feature branch after release so documentation does not trigger another production deployment.
