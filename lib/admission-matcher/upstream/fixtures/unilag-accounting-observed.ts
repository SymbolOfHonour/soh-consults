import type { IbassEligibilityEvidence } from "../types";

/**
 * Sanitized fixture based on normal browser observations of the public JAMB
 * IBASS Eligibility Checker on 2026-10-02. It deliberately contains no
 * cookies, headers, tokens, credentials or candidate-identifying data.
 *
 * Catalogue observation established institution upstream id 1345 and
 * ACCOUNTANCY/ACCOUNTING programme upstream id 1537. Unknown O-Level details
 * remain unresolved rather than being guessed.
 */
export const unilagAccountingObserved: IbassEligibilityEvidence = {
  provider: "jamb-ibass",
  observedAt: "2026-10-02",
  entryMode: "utme",
  institution: {
    upstreamId: 1345,
    name: "UNIVERSITY OF LAGOS, LAGOS STATE",
    abbreviation: "UNILAG",
  },
  programme: {
    upstreamId: 1537,
    label: "ACCOUNTANCY/ACCOUNTING",
    faculty: "ADMINISTRATION",
    rawUtmeRequirement: "Mathematics, Economics plus any Social Science subject.",
  },
  utme: {
    status: "qualified",
    passed: ["Mathematics", "English Language", "Economics", "Commerce"],
    failed: [],
    submitted: ["English Language", "Mathematics", "Economics", "Commerce"],
    requiredText: "Mathematics, Economics plus any Social Science subject.",
  },
  overallStatus: "disqualified",
  source: {
    url: "https://ibass.jamb.gov.ng/eligibility-checker",
    sourceType: "eligibility-checker",
    locator: "Institution 1345 catalogue + normal Check Eligibility submission; structured XHR responses observed in DevTools.",
  },
  unresolved: [
    "Exact IBASS accepted-subject mapping for the Social Science category has not yet been captured as a reusable snapshot.",
    "The O-Level component responsible for the observed overall disqualification has not yet been fully transcribed into this sanitized fixture.",
    "The observed XHR is undocumented and is not treated as a stable production API.",
  ],
};
