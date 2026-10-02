# First institution expansion batch

Research date: **2026-10-02**. There are **57 institution/programme records**, three at each of the 19 requested institutions. These are a first programme sample, not complete university catalogues. All 57 remain **Needs Review**; no new fully verified records are claimed. The registered dataset now has 23 institutions, 287 records and 168 distinct programme labels. The original 48 fully verified records are preserved.

Each institution has its own module. Every record preserves its exact observed IBASS programme label, displayed UTME/OLevel requirements, official source URLs, source session, date and limitations. Programme labels are formatted for display; Accountancy/Accounting and the official TASUED education labels have explicit aliases. Finance is kept distinct from Banking and Finance.

The primary interactive JAMB eligibility checker loaded its catalogue but returned an empty eligibility result dialog for the UNILAG Accounting submission, including after reload and resubmission. No successful checker result is claimed. Research continued through the official **IBASS institution brochure**, opening each imported programme's **View Details** table. Generic tables are not treated as proof that all institutional waivers have been reconciled. Broad “Social Science”, “other relevant subjects”, blank cells and conflicting options remain unresolved rather than generating guessed subject pools.

Current institution notices corroborate the screening floors used for UNILAG (200), OAU (200), UNN (160), UNICAL (150), UNIUYO (150) and TASFUED (160). These are screening floors, not final admission cutoffs. FUTMINNA's notice explicitly allows higher programme thresholds, so its 150 general floor is not assigned to these programme records. KWASU's current notice confirms its first-choice and sitting rules but does not specify a minimum UTME score. Unreadable notices, image-only notices and previous-session pages are identified in record notes; they do not supply guessed current thresholds.

Deliberate review boundaries include:

- UI: five credits at one sitting versus six at two sittings cannot be represented by the current unconditional credit-count field.
- UNILAG Accounting: reconcile the Data Processing/Computer Studies slash wording and the additional Literature option in the previous-session institutional PDF before assessing complete OLevel rules.
- AAUA Banking and Finance: the live UTME cell includes Civic Education. It remains unresolved and Civic Education is not added to approved UTME choices.
- OOU Accounting: Accounts & Book-keeping appears in the live UTME wording. Book Keeping is not added to UTME choices; the combined wording remains unresolved.
- TASFUED: sampled OLevel cells are blank, Economics has a blank UTME cell and Chemistry Education has ambiguous UTME punctuation. The current institutional notice confirms the federal identity, availability and general screening rules, but does not fill the missing programme subjects.
- All sampled programmes: complete institutional waivers and remaining current screening conditions must be reconciled before promotion. Age, CAPS uploads, examination participation, deadlines and final selection remain separate from Matcher subject checks.

The matching engine, UI and existing four institution modules are unchanged. The first-choice dropdown already derives its options from registered records. Regression tests check provenance, duplicate identities, alternative-slot counts, unknown thresholds, review safety, subject normalization, first-choice ordering and the known LASUSTECH Accounting score-195 case.

Production and `main` must remain unchanged. Only the expansion branch and an isolated Preview are authorized for this batch.
