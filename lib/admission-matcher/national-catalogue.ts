import { normalise } from "./catalogue";
import { applyCurrentScreeningNotice } from "./current-screening";
import { nationalReviewReasons } from "./national-review";
import { checkerSubjectsForProgramme, confirmedCheckerCreditSubjects, confirmedCheckerCoverage } from "./checker-subjects";
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
    confirmedSubjects: confirmedCheckerCoverage(),
  };
}

/** Offline snapshot only. No JAMB request occurs in candidate-facing runtime.
 * Missing/ambiguous rules remain review; no baseline category or waiver is
 * inferred from a programme name, institution type or another university.
 */
export function nationalRequirementsForProgramme(programme: string): ProgrammeRequirement[] {
  const requested = normalise(programme);
  const indices = new Set(snapshot.programmes.flatMap((label, index) => normalise(label) === requested ? [index] : []));
  return snapshot.pairs.filter(([, programmeIndex]) => indices.has(programmeIndex as number)).map(pair => {
    const [institutionId, programmeIndex, offeringIds] = pair as [number, number, number[]];
    const institution = byId.get(institutionId)!;
    const subjects = checkerSubjectsForProgramme(institutionId, snapshot.programmes[programmeIndex]);
    const screening = subjects?.screening;
    const verifiedBasicChecks = !!subjects?.utme && !!subjects?.olevel && !!screening;
    const record = {
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
    const current = applyCurrentScreeningNotice(record);
    if (subjects?.utme && subjects.olevel && !current.unresolvedChecks?.length && Number.isInteger(current.minimumUtmeScore) && [1,2].includes(current.maximumSittings??0)) return {...current,verificationStatus:"verified" as const,reviewReasons:[]};
    return current;
  }).filter(record => !admissionMatcherRequirements.some(existing => existing.institutionId === record.institutionId && [existing.programme, ...(existing.aliases ?? [])].some(label => normalise(label) === normalise(record.programme))));
}

/** Independently confirmed components can fill unresolved fields of an existing
 * literal programme record; a verified curated rule is never overwritten.
 */
export function reconciledCuratedRequirementsForProgramme(programme:string): ProgrammeRequirement[] {
  return admissionMatcherRequirements.flatMap(existing => {
    if (existing.verificationStatus === "verified" || ![existing.programme,...(existing.aliases??[])].some(label=>normalise(label)===normalise(programme))) return [];
    const institution = institutions.find(row=>canonicalId(row)===existing.institutionId);
    if (!institution) return [];
    const labels = [existing.programme,...(existing.aliases??[])];
    const matches = labels.flatMap(label=>{const evidence=checkerSubjectsForProgramme(institution.id,label);return evidence?[evidence]:[];});
    if (matches.length!==1) return [];
    const subjects=matches[0], unresolved=new Set(existing.unresolvedChecks??[]);
    const fillUtme=!!subjects.utme&&unresolved.has("utme"), fillOlevel=!!subjects.olevel&&unresolved.has("olevel");
    if (!fillUtme&&!fillOlevel) return [];
    if (fillUtme) unresolved.delete("utme");
    if (fillOlevel) unresolved.delete("olevel");
    const updated=applyCurrentScreeningNotice({
      ...existing,
      ...(fillUtme?{requiredUtmeSubjects:subjects.utme!.requiredSubjects,utmeGroups:subjects.utme!.groups,utmeAlternatives:[],utmeAlternativeMinimums:undefined}:{}),
      ...(fillOlevel?{requiredOlevelCredits:subjects.olevel!.requiredSubjects,olevelGroups:subjects.olevel!.groups,olevelAlternatives:[],olevelAlternativeMinimums:undefined,minimumOlevelCreditCount:subjects.olevel!.minimumCreditCount}:{}),
      unresolvedChecks:[...unresolved],
      sources:[...existing.sources,{label:"JAMB official checker component parity",url:subjects.sourceUrl,session:"UTME subject components",lastVerified:subjects.observedAt,locator:`Checker institution ${subjects.checkerInstitutionId}, programme ${subjects.checkerProgrammeId}`}],
    });
    const complete=fillUtme&&fillOlevel&&!updated.unresolvedChecks?.length&&Number.isInteger(updated.minimumUtmeScore)&&["institution-screening","programme-screening"].includes(updated.scoreScope??"")&&[1,2].includes(updated.maximumSittings??0);
    return [{...updated,verificationStatus:complete?"verified":"review",reviewReasons:complete?[]:["Official positive and negative observations confirm the supplied subject components; remaining checks require institutional evidence."],notes:[...(updated.notes??[]).filter(note=>!note.includes("empty result dialog")&&!note.includes("no successful eligibility check")),"Current checker components fill only previously unresolved subject fields. Separate certificate and administrative conditions still apply."]}];
  });
}
