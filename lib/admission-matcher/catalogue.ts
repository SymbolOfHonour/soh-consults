import type { ProgrammeRequirement } from "./types";

export const normalise = (value: string) => value.trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
const subjectAliases: Record<string, string> = {
  "use of english": "English Language", english: "English Language", "english language": "English Language",
  maths: "Mathematics", "general mathematics": "Mathematics", "mathematics general mathematics": "Mathematics",
  agriculture: "Agricultural Science", "agric science": "Agricultural Science", "agricultural science": "Agricultural Science",
  accounting: "Financial Accounting", "principles of accounting": "Financial Accounting", "principles of accounts": "Financial Accounting", "princ of account": "Financial Accounting", "financial accounting": "Financial Accounting",
  "lit in english": "Literature in English", "literature in english": "Literature in English",
  crs: "Christian Religious Knowledge", crk: "Christian Religious Knowledge", "christian religious studies": "Christian Religious Knowledge", "christian rel know": "Christian Religious Knowledge", "christian religious knowledge": "Christian Religious Knowledge",
  irs: "Islamic Religious Knowledge", irk: "Islamic Religious Knowledge", "islamic studies": "Islamic Religious Knowledge", "islamic religious studies": "Islamic Religious Knowledge", "islamic religious knowledge": "Islamic Religious Knowledge",
  "yoruba language": "Yoruba", "igbo language": "Igbo", "hausa language": "Hausa", "french language": "French", "art": "Fine Arts", "fine art": "Fine Arts", fishery: "Fisheries", "general agricultural science": "Agricultural Science",
  "book keeping": "Book Keeping", bookkeeping: "Book Keeping",
};
export const canonicalSubject = (value: string) => subjectAliases[normalise(value)] ?? value.trim().replace(/\s+/g, " ");
export const subjectKey = (value: string) => normalise(canonicalSubject(value));
export const isEnglish = (value: string) => subjectKey(value) === "english language";
export function discoverProgrammes(records: ProgrammeRequirement[]) {
  return [...new Set(records.map((record) => record.programme))].sort((a, b) => a.localeCompare(b));
}
export function discoverSubjects(records: ProgrammeRequirement[]) {
  const subjects = records.flatMap((item) => [
    ...item.requiredUtmeSubjects, ...item.requiredOlevelCredits,
    ...(item.utmeAlternatives ?? []).flat(), ...(item.olevelAlternatives ?? []).flat(),
    ...(item.utmeGroups ?? []).flatMap((g) => g.subjects), ...(item.olevelGroups ?? []).flatMap((g) => g.subjects),
  ]);
  return [...new Set(subjects.map(canonicalSubject))].sort((a, b) => a.localeCompare(b));
}
export function coverage(records: ProgrammeRequirement[]) {
  const verified = records.filter((item) => item.verificationStatus === "verified");
  return {
    programmes: discoverProgrammes(records).length, institutions: new Set(records.map((r) => r.institutionId)).size,
    records: records.length, verifiedRecords: verified.length, verifiedProgrammes: discoverProgrammes(verified).length,
    verifiedInstitutions: new Set(verified.map((r) => r.institutionId)).size,
    types: [...new Set(records.map((r) => r.institutionType ?? "other"))].sort(),
  };
}
