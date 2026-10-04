import review from "./data/national-review-2026-10-04.json";
import catalogue from "./data/national-catalogue-2026-10-04.json";

const codes = ["missing-utme", "missing-olevel", "missing-waivers", "subject-categories", "wording-review", "waiver-review", "source-differences", "text-encoding", "blank-programme", "screening-review"] as const;
type ReviewSnapshot = {
  schemaVersion: number;
  sourceSnapshotSha256: string;
  codes: string[];
  messages: Record<string, string>;
  offerings: number[][];
};

/** Evidence diagnostics cannot change a candidate's eligibility status. Every
 * source offering must have a blocker record; incomplete imports fail closed.
 */
export function validateNationalReview(value: unknown, expectedIds: number[]) {
  const snapshot = value as ReviewSnapshot;
  if (!snapshot || snapshot.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(snapshot.sourceSnapshotSha256) || !Array.isArray(snapshot.codes) || snapshot.codes.join("|") !== codes.join("|") || !Array.isArray(snapshot.offerings)) throw new Error("Malformed national requirement reconciliation");
  if (!snapshot.messages || codes.some(code => typeof snapshot.messages[code] !== "string" || !snapshot.messages[code].trim())) throw new Error("Missing reconciliation explanations");
  const expected = new Set(expectedIds), seen = new Set<number>();
  if (expected.size !== expectedIds.length) throw new Error("Duplicate expected offering identity");
  for (const row of snapshot.offerings) {
    if (!Array.isArray(row) || row.length !== 2 || !Number.isInteger(row[0]) || !expected.has(row[0]) || seen.has(row[0]) || !Number.isInteger(row[1]) || row[1] < 1 || row[1] >= 2 ** codes.length || !(row[1] & (1 << codes.indexOf("screening-review")))) throw new Error("Invalid, duplicate or unsafe reconciliation offering");
    seen.add(row[0]);
  }
  if (seen.size !== expected.size) throw new Error("Incomplete national requirement reconciliation");
}

const offeringIds = [...catalogue.pairs.flatMap(row => row[2] as number[]), ...catalogue.unresolvedOfferings.map(row => row.offeringId)];
validateNationalReview(review, offeringIds);
const byOffering = new Map(review.offerings.map(([id, mask]) => [id, mask]));

export function nationalReviewReasons(offeringIds: number[]): string[] {
  if (!offeringIds.length) throw new Error("A source offering is required for reconciliation");
  const mask = offeringIds.reduce((combined, id) => {
    const value = byOffering.get(id);
    if (value === undefined) throw new Error("Unknown reconciliation offering");
    return combined | value;
  }, 0);
  return codes.flatMap((code, index) => mask & (1 << index) ? [review.messages[code]] : []);
}
