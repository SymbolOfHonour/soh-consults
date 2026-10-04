import evidence from "./data/checker-subjects-2026-10-04.json";
import catalogue from "./data/national-catalogue-2026-10-04.json";
import { approvedUtmeSubjects, isEnglish, subjectKey } from "./catalogue";
import type { CheckerSubjectRule } from "./upstream/checker-subjects";

type CheckerRecord = {
  institutionId: number; programme: string; offeringIds: number[];
  checkerInstitutionId: number; checkerProgrammeId: number;
  observedAt: string; sourceUrl: string;
  utme: CheckerSubjectRule | null; olevel: CheckerSubjectRule | null;
  screening: { minimumUtmeScore: number; maximumSittings: 1 | 2; firstChoiceRequired: boolean; sourceUrl: string; session: string; observedAt: string } | null;
};
type CheckerSnapshot = { schemaVersion: number; sourceSha256: string; records: CheckerRecord[] };
type Pair = [number, number, number[]];
const key = (value: string) => value.trim().toUpperCase().replace(/\s+/g, " ");

/** Component evidence cannot promote full eligibility. Imports must retain the
 * complete exact offering identity; invalid or overlapping snapshots fail closed.
 */
export function validateCheckerSubjectSnapshot(value: unknown, pairs: Pair[], programmes: string[]) {
  const snapshot = value as CheckerSnapshot;
  if (!snapshot || snapshot.schemaVersion !== 1 || !/^[a-f0-9]{64}$/.test(snapshot.sourceSha256) || !Array.isArray(snapshot.records)) throw new Error("Malformed checker subject evidence");
  const expected = new Map(pairs.map(([school, programme, ids]) => [`${school}:${key(programmes[programme])}`, ids]));
  const seen = new Set<string>();
  for (const row of snapshot.records) {
    if (!row || !Number.isInteger(row.institutionId) || typeof row.programme !== "string" || !row.programme.trim()) throw new Error("Missing checker offering identity");
    const identity = `${row.institutionId}:${key(row.programme)}`, ids = expected.get(identity);
    if (!ids || seen.has(identity) || !Array.isArray(row.offeringIds) || row.offeringIds.length !== ids.length ||
        [...row.offeringIds].sort((a,b)=>a-b).join(",") !== [...ids].sort((a,b)=>a-b).join(",") ||
        new Set(row.offeringIds).size !== row.offeringIds.length || !Number.isInteger(row.checkerInstitutionId) || row.checkerInstitutionId < 1 ||
        !Number.isInteger(row.checkerProgrammeId) || row.checkerProgrammeId < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(row.observedAt) ||
        row.sourceUrl !== "https://ibass.jamb.gov.ng/eligibility-checker" || (!row.utme && !row.olevel)) throw new Error("Invalid or duplicate checker offering evidence");
    seen.add(identity);
    if (row.screening && (row.institutionId !== 494 || row.screening.minimumUtmeScore !== 200 || row.screening.maximumSittings !== 1 || row.screening.firstChoiceRequired !== true ||
        row.screening.sourceUrl !== "https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/" || row.screening.session !== "2026/2027" || !/^\d{4}-\d{2}-\d{2}$/.test(row.screening.observedAt))) throw new Error("Unverified checker screening overlay");
    for (const kind of ["utme", "olevel"] as const) {
      const rule = row[kind];
      if (rule === null) continue;
      if (!rule || !Array.isArray(rule.requiredSubjects) || !Array.isArray(rule.groups) ||
          rule.requiredSubjects.some(subject => typeof subject !== "string" || !subject.trim()) ||
          new Set(rule.requiredSubjects.map(subjectKey)).size !== rule.requiredSubjects.length ||
          rule.groups.some(group => !group || !Array.isArray(group.subjects) || !Number.isInteger(group.count) || group.count < 1 ||
            group.subjects.some(subject => typeof subject !== "string" || !subject.trim()) ||
            new Set(group.subjects.map(subjectKey)).size !== group.subjects.length || group.count > group.subjects.length ||
            group.subjects.some(subject => rule.requiredSubjects.some(core => subjectKey(core) === subjectKey(subject))))) throw new Error("Malformed checker subject slots");
      const count = rule.requiredSubjects.length + rule.groups.reduce((total, group) => total + group.count, 0);
      if (kind === "utme" && (count !== 3 || rule.minimumCreditCount !== undefined || [...rule.requiredSubjects, ...rule.groups.flatMap(group=>group.subjects)].some(subject => isEnglish(subject) || !approvedUtmeSubjects.some(approved=>subjectKey(approved)===subjectKey(subject))))) throw new Error("Invalid checker UTME combination");
      if (kind === "olevel" && (!Number.isInteger(rule.minimumCreditCount) || rule.minimumCreditCount! < 5 || rule.minimumCreditCount! > 9 || count !== rule.minimumCreditCount)) throw new Error("Incomplete checker credit requirement");
    }
  }
}

validateCheckerSubjectSnapshot(evidence, catalogue.pairs as Pair[], catalogue.programmes);
const byPair = new Map((evidence as CheckerSnapshot).records.map(row => [`${row.institutionId}:${key(row.programme)}`, row]));
export function checkerSubjectsForProgramme(institutionId: number, programme: string): CheckerRecord | undefined {
  return byPair.get(`${institutionId}:${key(programme)}`);
}

export function confirmedCheckerCreditSubjects(): string[] {
  return [...new Set((evidence as CheckerSnapshot).records.flatMap(row => row.olevel ? [...row.olevel.requiredSubjects, ...row.olevel.groups.flatMap(group => group.subjects)] : []))].sort();
}
