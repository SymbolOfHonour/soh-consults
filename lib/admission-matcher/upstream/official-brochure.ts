export type IbassBrochureEvidence = {
  provider: "jamb-ibass";
  sourceType: "official-brochure";
  sourceUrl: string;
  observedAt: string;
  programme: string;
  institutions: string[];
  directEntryText?: string;
  olevelText?: string;
  utmeSubjectsText?: string;
  waiverText?: string;
};

export type IbassRequirementEvidenceBundle = {
  programmeId?: number;
  institutionId?: number;
  programme: string;
  baseline: IbassBrochureEvidence;
  eligibilityObservation?: {
    componentUtmeStatus?: "qualified" | "disqualified" | "unknown";
    overallStatus?: "qualified" | "disqualified" | "unknown";
  };
  unresolved: string[];
};

/**
 * Brochure evidence is authoritative raw evidence, not permission to guess a
 * normalized rule. Empty/ambiguous requirement columns stay unresolved until
 * the relevant programme row and institution waiver can be parsed exactly.
 */
export function validateBrochureEvidence(evidence: IbassBrochureEvidence): string[] {
  const errors: string[] = [];
  if (evidence.provider !== "jamb-ibass") errors.push("Unexpected brochure provider.");
  if (!evidence.sourceUrl.startsWith("https://ibass.jamb.gov.ng/")) {
    errors.push("Brochure evidence must originate from official JAMB IBASS.");
  }
  if (!evidence.programme.trim()) errors.push("Brochure programme is required.");
  if (!evidence.institutions.length) errors.push("Brochure institution list is required.");
  if (!evidence.observedAt) errors.push("Brochure observation date is required.");
  return errors;
}

export function requirementBundleNeedsReview(bundle: IbassRequirementEvidenceBundle): boolean {
  if (bundle.unresolved.length) return true;
  const { baseline } = bundle;
  return !baseline.olevelText?.trim() || !baseline.utmeSubjectsText?.trim();
}
