# National requirement reconciliation checkpoint, 4 October 2026

National eligibility verification is **incomplete**. This change does not promote any imported national catalogue record to verified and must not be described as a completed national eligibility release.

## Completed

Recovered the branch from production base `ff3a2f03e00668e13ac9796a45a63e3dc14af08c`. No post-release reconciliation changes were present on the remote recovery branch.

Reconciled all 15,696 captured offerings from 529 institutions against their immutable evidence references. The deterministic offline tool verifies every evidence checksum, preserves source URL/date and brochure programme/offering identities, strips executable/formatting markup for diagnostics, and retains every unresolved offering. It does not infer subject-category membership, waiver applicability, screening thresholds, checker IDs or programme aliases.

The report records 6,135 offerings without readable UTME wording and 6,134 without readable O-Level wording. These are gaps in the captured institution catalogue, not a claim that JAMB has no requirements elsewhere. Among duplicate institution/title groups, 256 contain different cleaned requirement text across UTME, O-Level, Direct Entry or special considerations. All source versions remain preserved; none is silently selected. Counts overlap and must not be summed as distinct offerings.

Each national result now explains the applicable evidence gaps and lists its source offering IDs. A compact server-side diagnostic file covers every offering, including blank-title exceptions. It cannot change review records into matches, and a missing/duplicate/orphan/malformed diagnostic import fails closed.

LASU Chemistry subject checks were separately reconciled from explicit LASU programme wording and two live official IBASS browser submissions. Chemistry plus two of Physics/Biology/Mathematics qualifies in the observed UTME component; Physics/Mathematics/Biology without Chemistry is disqualified. The five enumerated O-Level credits match the official component. The local engine reproduces these observations. Sitting restrictions remain unresolved, so the positive candidate still receives Needs Review; Direct Entry and overall admission eligibility are not inferred. Existing LASU and LASUSTECH verified records are preserved.

## Reproduce

Run `python docs/admission-matcher/tools/reconcile-requirements.py --check` to verify that the audit, summary and runtime diagnostics exactly match the captured snapshot. Omit `--check` to regenerate all three. Matcher tests run the reproducibility gate and cover hash integrity, malformed imports, duplicate source conflicts, empty/markup-only evidence, medical gaps, LASU component parity and existing eligibility regressions.

## Remaining national verification work

- Recover missing institution-specific requirements from the official brochure families/checker, including medicine and health programmes.
- Reconcile duplicate requirement variants and applicable institutional waivers using explicit source identities.
- Obtain authoritative membership for broad subject categories rather than expanding them from an invented taxonomy.
- Resolve damaged wording against official source versions.
- Establish current screening and sitting overlays independently of generic JAMB requirements.
- Compare normalized rules with official positive and negative checker outcomes before promoting each complete record.

The catalogue alone cannot supply these decisions. No blanket removal of Needs Review is safe.

## Validation

- Full repository suite: 188 tests passed, zero failed. Matcher-only suite: 72 tests (including six new reconciliation tests).
- TypeScript check passed; Matcher lint passed without errors or warnings. Full repository lint: zero errors and 12 pre-existing warnings.
- Optimized production build passed.
- Local production HTTP smoke passed: 529-institution summary, medical review explanations and offering IDs, Matcher page, and invalid query rejection.
- Two official LASU Chemistry browser component probes passed as documented in `lasu-chemistry-parity.json`.
- Main and production remain unchanged. No remote CI or Vercel Preview is claimed.

## Publication blocker

Automatic approval review rejected the attempted push to `SymbolOfHonour/soh-consults` because publishing newly committed code and audit artifacts was treated as an external mutation/data disclosure requiring explicit user authorization. Work is saved as a local commit on `feature/admission-matcher-requirement-reconciliation`. Approval to push that branch and open a draft PR is needed before remote CI/Preview work can proceed. National rule verification remains incomplete independently of this publication block.
