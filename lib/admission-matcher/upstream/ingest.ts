import { normalizeIbassEvidence } from "./normalize";
import type { IbassEligibilityEvidence, IbassSnapshotRecord } from "./types";

export type IbassIngestionInput = {
  evidence: IbassEligibilityEvidence;
  institutionId: string;
  programme: string;
  explicitUtmeSubjects?: string[];
  explicitOlevelCredits?: string[];
  categoryMappingsResolved?: boolean;
};

export type IbassSnapshot = {
  provider: "jamb-ibass";
  schemaVersion: 1;
  generatedAt: string;
  records: IbassSnapshotRecord[];
  stats: {
    total: number;
    verified: number;
    review: number;
  };
};

const keyFor = (record: IbassSnapshotRecord) =>
  `${record.normalized.institutionId.trim().toLowerCase()}::${record.normalized.programme.trim().toLowerCase()}::${record.evidence.entryMode}`;

export function buildIbassSnapshot(inputs: IbassIngestionInput[], generatedAt: string): IbassSnapshot {
  const seen = new Set<string>();
  const records = inputs.map((input) => {
    const record = normalizeIbassEvidence(input.evidence, input);
    const key = keyFor(record);
    if (seen.has(key)) throw new Error(`Duplicate IBASS snapshot record: ${key}`);
    seen.add(key);
    return record;
  });

  const verified = records.filter((record) => record.normalized.verificationStatus === "verified").length;
  return {
    provider: "jamb-ibass",
    schemaVersion: 1,
    generatedAt,
    records,
    stats: { total: records.length, verified, review: records.length - verified },
  };
}

export function validateIbassSnapshot(snapshot: IbassSnapshot): string[] {
  const errors: string[] = [];
  if (snapshot.provider !== "jamb-ibass") errors.push("Unexpected upstream provider.");
  if (snapshot.schemaVersion !== 1) errors.push("Unsupported snapshot schema version.");
  if (!snapshot.generatedAt) errors.push("Snapshot generation timestamp is required.");
  if (!Number.isFinite(Date.parse(snapshot.generatedAt))) errors.push("Invalid snapshot generation timestamp.");
  const seen = new Set<string>();

  for (const record of snapshot.records) {
    const key = keyFor(record);
    if (seen.has(key)) errors.push(`Duplicate IBASS snapshot record: ${key}`);
    seen.add(key);
    if (record.schemaVersion !== 1) errors.push(`${key} has an unsupported record schema.`);
    if (record.evidence.provider !== "jamb-ibass") errors.push(`${key} has an unexpected evidence provider.`);
    if (!record.evidence.institution.name.trim()) errors.push(`${key} has a blank institution name.`);
    if (!record.evidence.programme.label.trim()) errors.push(`${key} has a blank official programme label.`);
    if (!record.normalized.institutionId.trim()) errors.push("Institution id is required.");
    if (!record.normalized.programme.trim()) errors.push("Programme is required.");
    if (!record.evidence.source.url.startsWith("https://")) errors.push(`Official source must use HTTPS: ${record.evidence.source.url}`);
    try {
      const url = new URL(record.evidence.source.url);
      if (url.protocol !== "https:" || !["ibass.jamb.gov.ng", "ibass-api.jamb.gov.ng"].includes(url.hostname) || url.username || url.password) {
        errors.push(`${key} does not have an official JAMB IBASS source URL.`);
      }
    } catch {
      errors.push(`${key} has an invalid source URL.`);
    }
    if (record.normalized.verificationStatus === "verified" && record.normalized.reviewReasons.length) {
      errors.push(`${keyFor(record)} is verified but still has unresolved review reasons.`);
    }
    if (record.normalized.verificationStatus === "verified" && !record.normalized.requiredUtmeSubjects.length && record.evidence.entryMode === "utme") {
      errors.push(`${keyFor(record)} is verified without explicit UTME subject rules.`);
    }
    if (record.normalized.verificationStatus === "verified") {
      if (record.evidence.entryMode === "direct-entry") errors.push(`${key} cannot be verified without dedicated Direct Entry qualification rules.`);
      if (record.evidence.unresolved.length) errors.push(`${key} has unresolved raw evidence.`);
      if (!record.normalized.requiredOlevelCredits.length || !record.evidence.programme.rawOlevelRequirement?.trim()) errors.push(`${key} is verified without sufficient O'Level evidence.`);
      if (record.evidence.entryMode === "utme" && !record.evidence.programme.rawUtmeRequirement?.trim()) errors.push(`${key} is verified without raw UTME evidence.`);
    }
  }

  const verified = snapshot.records.filter(record => record.normalized.verificationStatus === "verified").length;
  if (snapshot.stats.total !== snapshot.records.length || snapshot.stats.verified !== verified || snapshot.stats.review !== snapshot.records.length - verified) errors.push("Snapshot statistics do not match its records.");

  return [...new Set(errors)];
}
