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

  for (const record of snapshot.records) {
    if (!record.normalized.institutionId.trim()) errors.push("Institution id is required.");
    if (!record.normalized.programme.trim()) errors.push("Programme is required.");
    if (!record.evidence.source.url.startsWith("https://")) errors.push(`Official source must use HTTPS: ${record.evidence.source.url}`);
    if (record.normalized.verificationStatus === "verified" && record.normalized.reviewReasons.length) {
      errors.push(`${keyFor(record)} is verified but still has unresolved review reasons.`);
    }
    if (record.normalized.verificationStatus === "verified" && !record.normalized.requiredUtmeSubjects.length && record.evidence.entryMode === "utme") {
      errors.push(`${keyFor(record)} is verified without explicit UTME subject rules.`);
    }
  }

  return [...new Set(errors)];
}
