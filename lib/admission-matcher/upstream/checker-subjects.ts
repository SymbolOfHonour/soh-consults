import { approvedUtmeSubjects, canonicalSubject, isEnglish, subjectKey } from "../catalogue";
import { satisfyGroups } from "../match";
import type { SubjectGroup } from "../types";

export type CheckerSubjectRule = { requiredSubjects: string[]; groups: SubjectGroup[]; minimumCreditCount?: number };
const knownSubjects = [...approvedUtmeSubjects, "English Language", "Business Management", "Computer Studies", "Data Processing", "Further Mathematics", "Technical Drawing", "Building Construction", "Decorative Painting", "Health Science"];
const known = new Map(knownSubjects.map(subject => [subjectKey(subject), subject]));

function list(value: unknown): string[][] | null {
  if (typeof value !== "string") return null;
  const tokens = value.split(",").map(token => token.trim()).filter(Boolean);
  const result: string[][] = [];
  for (const token of tokens) {
    const alternatives = token.split("/").map(part => known.get(subjectKey(canonicalSubject(part))));
    if (!alternatives.length || alternatives.some(subject => !subject)) return null;
    result.push([...new Set(alternatives as string[])]);
  }
  return result;
}

/** Explicit institution-specific checker configuration only. Broad categories,
 * unidentified records, missing slots and unmodelled alternatives fail closed.
 * Parsing alone does not establish parity or current screening conditions.
 */
export function parseCheckerSubjects(value: unknown, kind: "utme" | "olevel", institutionId: number): CheckerSubjectRule | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const config = value as Record<string, unknown>;
  if (config.institution !== institutionId || config.section !== "Course" || config.ispublished !== "yes" ||
      config.type !== (kind === "utme" ? "UTME_Subject_Requirements_Config" : "Entry_Requirements_Config") ||
      (kind === "olevel" && (config.category !== "UTME" || config.level_grade !== ",O Level Credit,")) ||
      typeof config.optional_subjects_by_group2 !== "string" || config.optional_subjects_by_group2.trim() ||
      !Number.isInteger(config.subject_count) || Number(config.subject_count) < 0) return null;
  const required = list(config.required_subjects), optional = list(config.optional_subjects);
  if (!required || !optional || !required.length) return null;
  if (kind === "utme" && !required.some(group => group.length === 1 && isEnglish(group[0]))) return null;
  if (optional.some(group => group.some(isEnglish))) return null;
  const core = required.filter(group => group.length === 1).flat();
  const groups = required.filter(group => group.length > 1).map(subjects => ({ subjects, count: 1 }));
  const keys = required.flat().map(subjectKey);
  if (new Set(keys).size !== keys.length) return null;
  const count = kind === "utme" ? Number(config.subject_count) : Number(config.subject_count) - required.length;
  if (count < 0 || (count > 0 && !optional.length) || (count === 0 && optional.length)) return null;
  // Alternatives within the optional pool occupy the same counted slots.
  const choices = [...new Set(optional.flat())];
  if (choices.some(subject => keys.includes(subjectKey(subject))) || count > choices.length) return null;
  if (count) groups.push({ subjects: choices, count });
  if (kind === "utme") {
    const electives = core.filter(subject => !isEnglish(subject));
    if (electives.length + groups.reduce((total, group) => total + group.count, 0) !== 3 ||
        [...electives, ...groups.flatMap(group => group.subjects)].some(subject => !approvedUtmeSubjects.some(approved => subjectKey(approved) === subjectKey(subject)))) return null;
    return { requiredSubjects: electives, groups };
  }
  if (Number(config.subject_count) < 5 || Number(config.subject_count) > 9) return null;
  return { requiredSubjects: core, groups, minimumCreditCount: Number(config.subject_count) };
}

export function checkerRuleSatisfied(rule: CheckerSubjectRule, subjects: string[]): boolean {
  const keys = new Set(subjects.map(subjectKey));
  return rule.requiredSubjects.every(subject => keys.has(subjectKey(subject))) &&
    satisfyGroups(subjects, rule.requiredSubjects, rule.groups) &&
    (rule.minimumCreditCount === undefined || keys.size >= rule.minimumCreditCount);
}
