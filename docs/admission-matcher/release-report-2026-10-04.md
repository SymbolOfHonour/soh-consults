# Admission Matcher recovery and release report, 4 October 2026

Release status: **NOT MERGED; final CI and expanded Preview QA pending.**

The disconnected workspace was recovered. The national integration and full evidence snapshot are now being preserved on PR #213. Main and production have not been modified.

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

Recovered implementation: 181 tests passed, 0 failed; type check passed; lint had 0 errors and 12 existing warnings; optimized production build passed. Final rerun after request timeout polish is in progress.

LASUSTECH Accounting: the 245-score, Mathematics/Economics/Government, appropriate five-credit, one-sitting, first-choice regression passes without changing the verified result. Medical listings safely remain review. Structural tests account for every source offering, every brochure row, medical coverage, unsafe snapshot mutations and preserved curated behaviour.

Final GitHub CI, expanded Vercel Preview, homepage-to-results browser journey and major-feature regression are pending. Mobile viewport emulation is not available in this browser; mobile browser verification is not claimed.

## Git and production

Branch: feature/admission-matcher-verification-depth. PR: #213, draft and unmerged. Recovery base: 083ad93274d264f5884487a6b3a69ac47717ae58.

No production deployment or production verification is claimed. Release target: https://sohconsults.com.ng. Merge remains conditional on all mandatory release gates.
