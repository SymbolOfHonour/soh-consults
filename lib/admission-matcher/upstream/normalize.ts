import type { IbassEligibilityEvidence, IbassSnapshotRecord } from "./types";

const clean = (value: string) => value.trim().replace(/\s+/g, " ");
const unique = (values: string[]) => [...new Set(values.map(clean).filter(Boolean))];

/**
 * Converts observed IBASS evidence into a local snapshot conservatively.
 *
 * This intentionally does NOT infer subjects from prose categories such as
 * "any Social Science subject". Those categories require an authoritative
 * upstream mapping before a record can be considered fully verified.
 */
export function normalizeIbassEvidence(
  evidence: IbassEligibilityEvidence,
  input: {
    institutionId: string;
    programme: string;
    explicitUtmeSubjects?: string[];
    explicitOlevelCredits?: string[];
    categoryMappingsResolved?: boolean;
  },
): IbassSnapshotRecord {
  const reviewReasons = unique(evidence.unresolved);

  if (!input.categoryMappingsResolved) {
    reviewReasons.push(
      "Upstream subject-category membership is unresolved; no broad S.O.H subject taxonomy was inferred.",
    );
  }

  if (evidence.overallStatus === "unknown") {
    reviewReasons.push("IBASS overall eligibility outcome is unavailable or unresolved.");
  }

  return {
    schemaVersion: 1,
    evidence,
    normalized: {
      institutionId: clean(input.institutionId),
      programme: clean(input.programme),
      requiredUtmeSubjects: unique(input.explicitUtmeSubjects ?? []),
      requiredOlevelCredits: unique(input.explicitOlevelCredits ?? []),
      verificationStatus: reviewReasons.length === 0 ? "verified" : "review",
      reviewReasons: unique(reviewReasons),
    },
  };
}
