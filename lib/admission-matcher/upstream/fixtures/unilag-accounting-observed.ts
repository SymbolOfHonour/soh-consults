import type { IbassEligibilityEvidence } from "../types";

/**
 * Sanitized fixture based on a normal browser observation of the public JAMB
 * IBASS Eligibility Checker on 2026-10-02. It deliberately contains no
 * cookies, headers, tokens, credentials or candidate-identifying data.
 *
 * Only fields clearly visible in the observed response/result are represented.
 * Unknown O-Level details remain unresolved rather than being guessed.
 */
export const unilagAccountingObserved: IbassEligibilityEvidence = {
  provider: "jamb-ibass",
  observedAt: "2026-10-02",
  entryMode: "utme",
  institution: {
    name: "UNIVERSITY OF LAGOS, LAGOS STATE",
    abbreviation: "UNILAG",
  },
  programme: {
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
    locator: "Normal browser Check Eligibility submission; structured XHR response observed in DevTools.",
  },
  unresolved: [
    "Exact IBASS accepted-subject mapping for the Social Science category has not yet been captured as a reusable snapshot.",
    "The O-Level component responsible for the observed overall disqualification has not yet been fully transcribed into this sanitized fixture.",
    "The observed XHR is undocumented and is not treated as a stable production API.",
  ],
};
