import type { IbassInstitutionCatalogue } from "./catalogue";
import type { IbassBrochureEvidence } from "./official-brochure";
import { buildIbassRequirementRecord, type IbassProgrammeRequirementRecord } from "./requirements";

const canonical = (value: string) =>
  value
    .toUpperCase()
    .replace(/&/g, "AND")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

export type IbassRequirementLinkResult = {
  linked: IbassProgrammeRequirementRecord[];
  unresolvedProgrammes: Array<{ id: number; title: string; reason: string }>;
};

/**
 * Joins an observed institution catalogue to official brochure rows by exact
 * canonical programme label only. Fuzzy/semantic matching is deliberately not
 * used because a wrong programme join could create a false eligibility result.
 */
export function linkCatalogueToBrochureEvidence(
  catalogue: IbassInstitutionCatalogue,
  evidence: IbassBrochureEvidence[],
): IbassRequirementLinkResult {
  const byProgramme = new Map<string, IbassBrochureEvidence[]>();
  for (const row of evidence) {
    const key = canonical(row.programme);
    byProgramme.set(key, [...(byProgramme.get(key) ?? []), row]);
  }

  const linked: IbassProgrammeRequirementRecord[] = [];
  const unresolvedProgrammes: IbassRequirementLinkResult["unresolvedProgrammes"] = [];

  for (const programme of catalogue.programmes) {
    const candidates = byProgramme.get(canonical(programme.title)) ?? [];
    if (candidates.length !== 1) {
      unresolvedProgrammes.push({
        id: programme.id,
        title: programme.title,
        reason: candidates.length === 0
          ? "No exact official brochure programme row was found."
          : "Multiple official brochure rows share this canonical programme label.",
      });
      continue;
    }

    const row = candidates[0];
    linked.push(buildIbassRequirementRecord({
      institutionUpstreamId: catalogue.institutionUpstreamId,
      programmeUpstreamId: programme.id,
      programmeLabel: programme.title,
      faculty: "UNRESOLVED",
      rawUtmeRequirement: row.utmeSubjectsText,
      rawOlevelRequirement: row.olevelText,
      rawDirectEntryRequirement: row.directEntryText,
      specialConsiderations: row.waiverText ? [row.waiverText] : [],
      sources: [{
        url: row.sourceUrl,
        sourceType: "official-brochure",
        locator: `Programme row: ${row.programme}`,
        observedAt: row.observedAt,
      }],
      unresolved: [
        ...(row.utmeSubjectsText?.trim() ? [] : ["Official brochure UTME requirement is missing."]),
        ...(row.olevelText?.trim() ? [] : ["Official brochure O-Level requirement is missing."]),
        "Faculty linkage must be confirmed before verification.",
        "Institution-specific brochure applicability/waiver must be confirmed before verification.",
      ],
    }));
  }

  return { linked, unresolvedProgrammes };
}
