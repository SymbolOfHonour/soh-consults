import type { ProgrammeRequirement, SourceRecord } from "./types";

const sources: Record<string, SourceRecord> = {
  lasu: {label:"LASU 2026/2027 UTME screening announcement",url:"https://lasu.edu.ng/home/news/read.php?id=642",session:"2026/2027",lastVerified:"2026-10-04",scope:"195 UTME floor, first choice, two sittings generally, one for Medicine/Dentistry; additional engineering credits at two sittings"},
  uniosun: {label:"UNIOSUN current admission screening notice",url:"https://uniosun.edu.ng/news/2026-2027-admissions-exercise-post-utme-screening/",session:"2026/2027",lastVerified:"2026-10-04",scope:"160 general floor, 200 for named exceptions, first choice, sitting limits, and Medicine admission on hold"},
  fuoye: {label:"FUOYE current admission screening portal",url:"https://www.casaps.fuoye.edu.ng/utme/index.php",session:"2026/2027",lastVerified:"2026-10-04",scope:"Law admission is unavailable in this session"},
};
export const lasuCurrentScreeningSource = sources.lasu;
const nameKey = (value:string) => value.toUpperCase().replace(/&/g," AND ").replace(/[^A-Z0-9]+/g," ").trim();
const uniosunExceptions = new Set(["LAW","NURSING","NURSING SCIENCE","NURSING NURSING SCIENCE","MEDICINE AND SURGERY","MEDICINE","ISLAMIC LAW","COMMON AND ISLAMIC LAW","LAW ISLAMIC LAW"]);

/** Current session notices supplement each independently sourced component.
 * They never supply missing subjects or promote a review record on their own.
 */
export function applyCurrentScreeningNotice(record: ProgrammeRequirement): ProgrammeRequirement {
  const id = record.institutionId.toLowerCase();
  const school = ["lasu","jamb-brochure-503"].includes(id) ? "lasu" : ["uniosun","jamb-brochure-798"].includes(id) ? "uniosun" : ["fuoye","jamb-brochure-290"].includes(id) ? "fuoye" : null;
  if (!school) return record;
  const programme = nameKey(record.programme);
  const suspended = school === "fuoye" && programme === "LAW" || school === "uniosun" && ["MEDICINE","MEDICINE AND SURGERY"].includes(programme);
  if (school === "fuoye" && !suspended) return record;
  const remaining = (record.unresolvedChecks ?? []).filter(check => check !== "score" && (school === "fuoye" || check !== "sittings"));
  const result: ProgrammeRequirement = {
    ...record,
    ...(school === "lasu" ? {minimumUtmeScore:195,scoreScope:"institution-screening" as const,maximumSittings:["MEDICINE","MEDICINE AND SURGERY","DENTISTRY","DENTISTRY AND DENTAL SURGERY"].includes(programme)?1 as const:2 as const,firstChoiceRequired:true} : {}),
    ...(school === "uniosun" ? {minimumUtmeScore:uniosunExceptions.has(programme) ? 200 : 160,scoreScope:"institution-screening" as const,maximumSittings:uniosunExceptions.has(programme) ? 1 as const : 2 as const,firstChoiceRequired:true} : {}),
    unresolvedChecks: school === "fuoye" ? record.unresolvedChecks : remaining,
    sources: [...record.sources.filter(source => source.url !== sources[school].url),sources[school]],
    ...(suspended ? {admissionRestriction:{session:"2026/2027",reason:school === "fuoye" ? "FUOYE is not admitting Law candidates for 2026/2027." : "UNIOSUN Medicine admission is on hold for 2026/2027."}} : {}),
  };
  return result;
}
