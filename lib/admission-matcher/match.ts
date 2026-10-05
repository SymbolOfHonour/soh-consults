import { applyCurrentScreeningNotice } from "./current-screening";
import type { CandidateProfile, MatchResult, ProgrammeRequirement, SubjectGroup } from "./types";
import { isApprovedUtmeSubject, isEnglish, normalise, subjectKey } from "./catalogue";

export function validateCandidate(candidate: CandidateProfile): string[] {
  const errors: string[] = [];
  if (typeof candidate.programme !== "string" || !candidate.programme.trim()) errors.push("Choose a programme.");
  if (!Number.isInteger(candidate.utmeScore) || candidate.utmeScore < 0 || candidate.utmeScore > 400) errors.push("Enter a whole-number UTME score from 0 to 400.");
  const validSubjects = (values: unknown): values is string[] => Array.isArray(values) && values.every(s => typeof s === "string" && s.trim().length > 0);
  if (!validSubjects(candidate.utmeSubjects) || candidate.utmeSubjects.length !== 3 || candidate.utmeSubjects.some(isEnglish)) errors.push("Select exactly three UTME subjects apart from Use of English.");
  if (validSubjects(candidate.utmeSubjects) && new Set(candidate.utmeSubjects.map(subjectKey)).size !== candidate.utmeSubjects.length) errors.push("UTME subjects must not contain duplicates or equivalent aliases.");
  if (validSubjects(candidate.utmeSubjects) && candidate.utmeSubjects.some(s => !isEnglish(s) && !isApprovedUtmeSubject(s))) errors.push("Select only JAMB-approved UTME subjects. O'Level-only subjects cannot be used as UTME subjects.");
  if (!validSubjects(candidate.olevelCredits) || !candidate.olevelCredits.length) errors.push("Supply your O'Level credit subjects.");
  if (validSubjects(candidate.olevelCredits) && new Set(candidate.olevelCredits.map(subjectKey)).size !== candidate.olevelCredits.length) errors.push("O'Level subjects must not contain duplicates or equivalent aliases.");
  for (const sittings of [candidate.sittings, candidate.olevelSittings]) if (sittings !== undefined && sittings !== 1 && sittings !== 2) errors.push("Choose one or two sittings.");
  if (candidate.sittings && candidate.olevelSittings && candidate.sittings !== candidate.olevelSittings) errors.push("Conflicting sitting counts supplied.");
  if (candidate.certificateType && !["SSCE", "NBC"].includes(candidate.certificateType)) errors.push("Choose an SSCE-equivalent or NBC certificate.");
  return errors;
}
// Bipartite allocation: a subject cannot satisfy two independent option slots
// or count again after satisfying a compulsory subject.
export function satisfyGroups(values: string[], core: string[], groups: SubjectGroup[]): boolean {
  if (groups.some(g => !Number.isInteger(g.count) || g.count < 1 || g.count > new Set(g.subjects.map(subjectKey)).size)) return false;
  const excluded = new Set(core.map(subjectKey));
  const available = [...new Set(values.map(subjectKey))].filter((s) => !excluded.has(s));
  const slots = groups.flatMap((g) => Array.from({ length: g.count }, () => new Set(g.subjects.map(subjectKey))));
  const assigned = new Map<string, number>();
  function place(slot: number, visited: Set<string>): boolean {
    for (const subject of available) {
      if (!slots[slot].has(subject) || visited.has(subject)) continue;
      visited.add(subject);
      const previous = assigned.get(subject);
      if (previous === undefined || place(previous, visited)) { assigned.set(subject, slot); return true; }
    }
    return false;
  }
  return slots.every((_, i) => place(i, new Set()));
}
export function matchCandidate(candidate: CandidateProfile, requirements: ProgrammeRequirement[]): MatchResult[] {
  const errors = validateCandidate(candidate);
  if (errors.length) throw new Error(errors.join(" "));
  const requested = normalise(candidate.programme);
  const firstChoice = normalise(candidate.firstChoiceInstitution ?? "");
  const isSelectedFirstChoice = (requirement: ProgrammeRequirement) => !!firstChoice && [requirement.institutionId, requirement.institutionName, ...(requirement.institutionAliases ?? [])].some((n) => normalise(n) === firstChoice);
  return requirements.filter((item) => [item.programme, ...(item.aliases ?? [])].some((n) => normalise(n) === requested))
    .filter((item) => !candidate.institution || [item.institutionId, item.institutionName, ...(item.institutionAliases ?? [])].some((n) => normalise(n) === normalise(candidate.institution!)))
    .map(applyCurrentScreeningNotice)
    .map((requirement): MatchResult => {
      const passed: string[] = [], failed: string[] = [], needsReview: string[] = [];
      const unresolved = new Set(requirement.unresolvedChecks ?? []);
      if (requirement.admissionRestriction) failed.push(requirement.admissionRestriction.reason);
      if (requirement.verificationStatus !== "verified") needsReview.push(...(requirement.reviewReasons?.length ? requirement.reviewReasons : ["Institution-specific rules are not fully verified for this record."]));
      if (!requirement.sources.length || requirement.sources.some((s) => !/^https:\/\//.test(s.url) || !s.label || !s.session || !/^\d{4}-\d{2}-\d{2}$/.test(s.lastVerified))) needsReview.push("Source verification metadata is incomplete.");
      if (unresolved.has("score") || !["institution-screening", "programme-screening"].includes(requirement.scoreScope ?? "") || !Number.isInteger(requirement.minimumUtmeScore) || requirement.minimumUtmeScore! < 0 || requirement.minimumUtmeScore! > 400) needsReview.push("The current institutional/programme screening score is unknown. A national JAMB floor is not substituted.");
      else {
        const meets = candidate.utmeScore >= requirement.minimumUtmeScore!;
        (meets ? passed : failed).push("UTME score " + candidate.utmeScore + (meets ? " meets" : " is below") + " the verified " + (requirement.scoreScope === "institution-screening" ? "institution screening" : "programme screening") + " minimum of " + requirement.minimumUtmeScore + ".");
      }
      const checkSubjects = (kind: "utme" | "olevel", values: string[], core: string[], legacy: string[][], groups: SubjectGroup[]) => {
        const label = kind === "utme" ? "UTME" : "O'Level credit";
        if (kind === "olevel" && candidate.certificateType === "NBC") { needsReview.push("NBC-specific credit subjects and certificate exceptions need manual verification; SSCE-only subject rules do not reject this certificate."); return; }
        if (unresolved.has(kind)) { needsReview.push(label + " rules or institutional exceptions need verification; no eligibility decision is made from an incomplete rule."); return; }
        const minimums = kind === "utme" ? requirement.utmeAlternativeMinimums : requirement.olevelAlternativeMinimums;
        const rules = [...legacy.map((subjects, i) => ({ subjects, count: minimums?.[i] ?? 1 })), ...groups];
        const required = kind === "utme" ? core.filter((s) => !isEnglish(s)) : core;
        if (rules.some(g => !Number.isInteger(g.count) || g.count < 1 || g.count > new Set(g.subjects.map(subjectKey)).size) || (minimums && minimums.length !== legacy.length) || new Set(required.map(subjectKey)).size !== required.length || (kind === "utme" && required.length + rules.reduce((n,g)=>n+g.count,0) !== 3)) {
          needsReview.push(label + " rule is incomplete or malformed and must be verified."); return;
        }
        const keys = new Set(values.map(subjectKey));
        const missing = required.filter((s) => !keys.has(subjectKey(s)));
        if (missing.length) failed.push(label + " compulsory subjects missing: " + missing.join(", ") + ".");
        else passed.push(label + " compulsory subjects satisfied" + (required.length ? ": " + required.join(", ") : "") + ".");
        if (rules.length) {
          const fulfilled = satisfyGroups(values, required, rules);
          const explanation = rules.map((g) => g.count + " of " + g.subjects.join(", ")).join("; ");
          (fulfilled ? passed : failed).push(label + " alternatives " + (fulfilled ? "satisfied" : "not satisfied") + ": " + explanation + ". Each credit/subject counts once.");
        }
        if (kind === "olevel") {
          const count = requirement.minimumOlevelCreditCount;
          if (!Number.isInteger(count) || count! < 1) needsReview.push("The minimum number of O'Level credits needs verification.");
          else (keys.size >= count! ? passed : failed).push(keys.size + " distinct O'Level credits supplied; " + count + " required.");
        }
      };
      checkSubjects("utme", candidate.utmeSubjects, requirement.requiredUtmeSubjects, requirement.utmeAlternatives ?? [], requirement.utmeGroups ?? []);
      checkSubjects("olevel", candidate.olevelCredits, requirement.requiredOlevelCredits, requirement.olevelAlternatives ?? [], requirement.olevelGroups ?? []);
      const sittings = candidate.sittings ?? candidate.olevelSittings;
      if (candidate.certificateType !== "NBC") for (const condition of requirement.sittingCreditConditions ?? []) {
        if (condition.sittings !== sittings) continue;
        const credits = new Set(candidate.olevelCredits.map(subjectKey));
        const missing = condition.requiredCredits.filter(subject=>!credits.has(subjectKey(subject)));
        if (missing.length) failed.push("O'Level credits required at " + sittings + " sittings are missing: " + missing.join(", ") + ".");
        (credits.size >= condition.minimumCreditCount ? passed : failed).push(sittings + " sittings require " + condition.minimumCreditCount + " O'Level credits; " + credits.size + " supplied.");
      }
      if (candidate.certificateType !== "NBC" && requirement.screeningRequiredOlevelCredits?.length) {
        const credits = new Set(candidate.olevelCredits.map(subjectKey));
        const missing = requirement.screeningRequiredOlevelCredits.filter(subject=>!credits.has(subjectKey(subject)));
        (missing.length ? failed : passed).push(missing.length ? "Current screening announcement requires additional O'Level credits: " + missing.join(", ") + "." : "Additional screening credit requirements satisfied.");
      }
      if (unresolved.has("sittings") || ![1, 2].includes(requirement.maximumSittings ?? 0)) needsReview.push("The current sitting restriction needs verification.");
      else if (!sittings) needsReview.push("Supply the number of O'Level sittings.");
      else (sittings <= requirement.maximumSittings! ? passed : failed).push(sittings + " sitting(s) supplied; a maximum of " + requirement.maximumSittings + " is permitted.");
      if (requirement.firstChoiceRequired) {
        if (!candidate.firstChoiceInstitution?.trim()) needsReview.push("First-choice institution must be confirmed.");
        else {
          const isChoice = isSelectedFirstChoice(requirement);
          (isChoice ? passed : failed).push(isChoice ? "First-choice institution requirement satisfied." : "This institution must be your first choice.");
        }
      }
      if (candidate.certificateType === "NBC") needsReview.push("NBC-specific subject and certificate exceptions require manual review.");
      return { requirement, passed, failed, needsReview, status: failed.length ? "not_match" : needsReview.length ? "review" : "match" };
    }).sort((a, b) => Number(isSelectedFirstChoice(b.requirement)) - Number(isSelectedFirstChoice(a.requirement)) || ({ match: 0, review: 1, not_match: 2 }[a.status] - { match: 0, review: 1, not_match: 2 }[b.status]) || a.requirement.institutionName.localeCompare(b.requirement.institutionName));
}
