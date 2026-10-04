import type { ProgrammeRequirement } from "./types";
const identity = (row:ProgrammeRequirement) => `${row.institutionId}:${row.programme}`;

/** Replace only the same registered record. Unknown override identities fail
 * closed; new national records remain independent source offerings.
 */
export function mergeProgrammeEvidence(curated:ProgrammeRequirement[], national:ProgrammeRequirement[], overrides:ProgrammeRequirement[]) {
  const existing = new Set(curated.map(identity));
  const replacements = new Map<string,ProgrammeRequirement>();
  for (const row of overrides) {
    const key = identity(row);
    if (!existing.has(key) || replacements.has(key)) throw new Error("Invalid curated evidence replacement");
    replacements.set(key,row);
  }
  return [...curated.map(row=>replacements.get(identity(row))??row),...national];
}
