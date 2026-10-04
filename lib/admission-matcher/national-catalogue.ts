import { nationalReviewReasons } from "./national-review";
import { checkerSubjectsForProgramme, confirmedCheckerCreditSubjects } from "./checker-subjects";
import { validateNationalSnapshot } from "./national-snapshot";
import snapshot from "./data/national-catalogue-2026-10-04.json";
import { admissionMatcherRequirements } from "./data";
const key = (value: string) => value.trim().toUpperCase().replace(/\s+/g, " ");
import type { ProgrammeRequirement } from "./types";

type NationalInstitution = { id: number; name: string; abbreviation?: string | null; state?: string | null; ownership?: string | null };
validateNationalSnapshot(snapshot);
const institutions = snapshot.institutions as NationalInstitution[];
const legacyInstitutions = [...new Map(admissionMatcherRequirements.map(item => [item.institutionId, item])).values()];
const abbreviationCounts = new Map<string, number>();
for (const item of institutions) if (item.abbreviation) abbreviationCounts.set(key(item.abbreviation), (abbreviationCounts.get(key(item.abbreviation)) ?? 0) + 1);
// Identity joins require an exact official full name or an unambiguous official
// abbreviation already explicitly attached to a curated institution. No fuzzy names.
const legacyById = new Map(institutions.flatMap(item => {
  const matches = legacyInstitutions.filter(legacy => key(legacy.institutionName) === key(item.name) || (item.abbreviation && abbreviationCounts.get(key(item.abbreviation)) === 1 && [legacy.institutionId, ...(legacy.institutionAliases ?? [])].some(alias => key(alias) === key(item.abbreviation!))));
  return matches.length === 1 ? [[item.id, matches[0]] as const] : [];
}));
const canonicalId = (item: NationalInstitution) => legacyById.get(item.id)?.institutionId ?? `jamb-brochure-${item.id}`;
const byId = new Map(institutions.map(item => [item.id, item]));

export function nationalCatalogueSummary() {
  return {
    schemaVersion: snapshot.schemaVersion,
    observedAt: snapshot.observedAt,
    programmes: [...snapshot.programmes].sort((a, b) => a.localeCompare(b)),
    institutions: institutions.map(item => ({ id: canonicalId(item), upstreamId: item.id, name: legacyById.get(item.id)?.institutionName ?? item.name })).sort((a, b) => a.name.localeCompare(b.name)),
    stats: snapshot.stats,
    creditSubjects: confirmedCheckerCreditSubjects(),
  };
}

/** Offline snapshot only. No JAMB request occurs in candidate-facing runtime.
 * Missing/ambiguous rules remain review; no baseline category or waiver is
 * inferred from a programme name, institution type or another university.
 */
export function nationalRequirementsForProgramme(programme: string): ProgrammeRequirement[] {
  const requested = key(programme);
  const indices = new Set(snapshot.programmes.flatMap((label, index) => key(label) === requested ? [index] : []));
  return snapshot.pairs.filter(([, programmeIndex]) => indices.has(programmeIndex as number)).map(pair => {
    const [institutionId, programmeIndex, offeringIds] = pair as [number, number, number[]];
    const institution = byId.get(institutionId)!;
    const subjects = checkerSubjectsForProgramme(institutionId, snapshot.programmes[programmeIndex]);
    const screening = subjects?.screening;
    const verifiedBasicChecks = !!subjects?.utme && !!subjects?.olevel && !!screening;
    return {
      institutionId: canonicalId(institution),
      institutionName: institution.name,
      // Ownership does not prove that a degree-awarding college is a university.
      institutionType: "other",
      programme: snapshot.programmes[programmeIndex],
      requiredUtmeSubjects: subjects?.utme?.requiredSubjects ?? [],
      utmeGroups: subjects?.utme?.groups,
      requiredOlevelCredits: subjects?.olevel?.requiredSubjects ?? [],
      olevelGroups: subjects?.olevel?.groups,
      minimumOlevelCreditCount: subjects?.olevel?.minimumCreditCount,
      minimumUtmeScore: screening?.minimumUtmeScore,
      scoreScope: screening ? "institution-screening" : undefined,
      maximumSittings: screening?.maximumSittings,
      firstChoiceRequired: screening?.firstChoiceRequired,
      verificationStatus: verifiedBasicChecks ? "verified" : "review",
      unresolvedChecks: [...(!subjects?.utme ? ["utme" as const] : []), ...(!subjects?.olevel ? ["olevel" as const] : []), ...(!screening ? ["sittings" as const, "score" as const] : [])],
      reviewReasons: verifiedBasicChecks ? [] : subjects ? [
        "Positive and negative official checker observations confirm the displayed subject components only.",
        ...(!screening ? ["Current screening and sitting conditions remain unverified."] : []),
        ...(!subjects.utme || !subjects.olevel ? ["The other subject component remains unresolved; a partial checker configuration is not a complete eligibility rule."] : []),
        "Brochure variants and Direct Entry or alternative-certificate conditions remain separate evidence and are not resolved by these UTME observations.",
      ] : nationalReviewReasons(offeringIds),
      sources: [{
        label: "JAMB IBASS institution brochure",
        url: `https://ibass.jamb.gov.ng/brochure-courses?id=${institution.id}&school=${encodeURIComponent(institution.name)}`,
        session: "JAMB catalogue; current screening conditions require confirmation",
        lastVerified: snapshot.observedAt,
        locator: `Official offering IDs: ${offeringIds.join(", ")}`,
      }, ...(subjects ? [{
        label: "JAMB IBASS official checker subject observations",
        url: subjects.sourceUrl,
        session: "UTME subject components; current institutional screening requires confirmation",
        lastVerified: subjects.observedAt,
        scope: "Explicit institution-specific configurations reproduced against positive and negative official observations",
        locator: `Checker institution ${subjects.checkerInstitutionId}, programme ${subjects.checkerProgrammeId}`,
      }] : []), ...(screening ? [{
        label: "UNILAG current official screening notice",
        url: screening.sourceUrl, session: screening.session, lastVerified: screening.observedAt,
        scope: "200 institutional screening floor, one O-Level sitting and first choice; explicitly applies to all undergraduate programmes",
      }] : [])],
      notes: ["A programme listing does not establish eligibility or guarantee admission. Direct Entry qualifications require a separate review.",
        ...(subjects ? ["Verified basic checks cover only confirmed subject components and any cited screening baseline. Age, result uploads, test participation, application deadlines, prior-student restrictions and final selection are separate administrative requirements."] : [])],
    } satisfies ProgrammeRequirement;
  }).filter(record => !admissionMatcherRequirements.some(existing => existing.institutionId === record.institutionId && [existing.programme, ...(existing.aliases ?? [])].some(label => key(label) === key(record.programme))));
}
