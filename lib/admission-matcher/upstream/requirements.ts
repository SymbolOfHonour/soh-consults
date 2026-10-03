export type IbassRequirementSource = {
  url: string;
  sourceType: "official-brochure" | "eligibility-checker";
  locator: string;
  observedAt: string;
};

export type IbassProgrammeRequirementRecord = {
  institutionUpstreamId: number;
  programmeUpstreamId: number;
  programmeLabel: string;
  faculty: string;
  rawUtmeRequirement?: string;
  rawOlevelRequirement?: string;
  rawDirectEntryRequirement?: string;
  specialConsiderations: string[];
  sources: IbassRequirementSource[];
  unresolved: string[];
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ");

/**
 * Builds a requirement record only from captured official evidence. Missing
 * components remain unresolved instead of being inferred from neighbouring
 * programmes, faculty conventions or S.O.H-created subject taxonomies.
 */
export function buildIbassRequirementRecord(
  input: IbassProgrammeRequirementRecord,
): IbassProgrammeRequirementRecord {
  if (!Number.isInteger(input.institutionUpstreamId) || input.institutionUpstreamId <= 0) {
    throw new Error("A positive IBASS institution id is required.");
  }
  if (!Number.isInteger(input.programmeUpstreamId) || input.programmeUpstreamId <= 0) {
    throw new Error("A positive IBASS programme id is required.");
  }
  if (!input.sources.length) throw new Error("At least one official IBASS evidence source is required.");
  if (input.sources.some((source) => !source.url.startsWith("https://ibass.jamb.gov.ng/"))) {
    throw new Error("Requirement evidence must point to official JAMB IBASS.");
  }

  const unresolved = [...new Set(input.unresolved.map(clean).filter(Boolean))];
  if (!input.rawUtmeRequirement?.trim()) unresolved.push("UTME requirement has not been captured from official evidence.");
  if (!input.rawOlevelRequirement?.trim()) unresolved.push("O-Level requirement has not been captured from official evidence.");

  return {
    ...input,
    programmeLabel: clean(input.programmeLabel),
    faculty: clean(input.faculty).toUpperCase(),
    rawUtmeRequirement: input.rawUtmeRequirement ? clean(input.rawUtmeRequirement) : undefined,
    rawOlevelRequirement: input.rawOlevelRequirement ? clean(input.rawOlevelRequirement) : undefined,
    rawDirectEntryRequirement: input.rawDirectEntryRequirement ? clean(input.rawDirectEntryRequirement) : undefined,
    specialConsiderations: [...new Set(input.specialConsiderations.map(clean).filter(Boolean))],
    unresolved: [...new Set(unresolved)],
  };
}

export const isIbassRequirementComplete = (record: IbassProgrammeRequirementRecord) =>
  Boolean(record.rawUtmeRequirement && record.rawOlevelRequirement && record.sources.length && record.unresolved.length === 0);
