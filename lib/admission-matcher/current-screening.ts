import type { ProgrammeRequirement, SourceRecord } from "./types";

const sources: Record<string, SourceRecord> = {
  lasu: {label:"LASU 2026/2027 UTME screening announcement",url:"https://lasu.edu.ng/home/news/read.php?id=642",session:"2026/2027",lastVerified:"2026-10-04",scope:"195 UTME floor, first choice, two sittings generally, one for Medicine/Dentistry; additional engineering credits at two sittings"},
  unilag: {label:"UNILAG 2026/2027 Post-UTME screening announcement",url:"https://unilag.edu.ng/important-notice-on-2026-2027-post-utme-screening-exercise/",session:"2026/2027",lastVerified:"2026-10-04",scope:"200 UTME floor, first choice, one sitting, and English Language/Mathematics credits for all programmes"},
  uniosun: {label:"UNIOSUN current admission screening notice",url:"https://uniosun.edu.ng/news/2026-2027-admissions-exercise-post-utme-screening/",session:"2026/2027",lastVerified:"2026-10-04",scope:"160 general floor, 200 for named exceptions, first choice, sitting limits, and Medicine admission on hold"},
  fuoye: {label:"FUOYE current admission screening portal",url:"https://www.casaps.fuoye.edu.ng/utme/index.php",session:"2026/2027",lastVerified:"2026-10-04",scope:"Law admission is unavailable in this session"},
  unn: {label:"UNN 2026/2027 admission screening announcement",url:"https://www.unn.edu.ng/2026-2027-screening-exercise-for-admission/",session:"2026/2027",lastVerified:"2026-10-04",scope:"160 UTME floor and first choice; programme sitting exceptions remain unresolved"},
  oau: {label:"OAU 2026 admission screening announcement",url:"https://oauife.edu.ng/2026-admission-screening-exercise-for-utme-and-direct-entry-candidates/",session:"2026/2027",lastVerified:"2026-10-04",scope:"200 UTME floor and first choice; sitting limits remain unresolved"},
  uniport: {label:"UNIPORT 2026/2027 Post-UTME announcement",url:"https://www.uniport.edu.ng/latest-info/advertisement-for-2026-2027-post-utme-screening-exercise/",session:"2026/2027",lastVerified:"2026-10-04",scope:"160 UTME floor and first choice; sitting limits remain unresolved"},
  unilorin: {label:"UNILORIN 2026/2027 pre-admission registration instructions",url:"https://www.unilorin.edu.ng/wp-content/uploads/2026/06/Pre-admission-screening-2026.pdf",session:"2026/2027",lastVerified:"2026-10-04",scope:"One sitting for Medicine, Pharmacy, Optometry and Computer Engineering; this notice supplies no UTME floor"},
  ui: {label:"UI 2026/2027 admission screening announcement",url:"https://ui.edu.ng/news/post-utmedirect-entry-screening-prospective-candidates-20262027-admission-exercise",session:"2026/2027",lastVerified:"2026-10-04",scope:"One sitting for College of Medicine and Pharmacy; this notice supplies no UTME floor"},
};
export const lasuCurrentScreeningSource = sources.lasu;
const nameKey = (value:string) => value.toUpperCase().replace(/&/g," AND ").replace(/[^A-Z0-9]+/g," ").trim();
const uniosunExceptions = new Set(["LAW","NURSING","NURSING SCIENCE","NURSING NURSING SCIENCE","MEDICINE AND SURGERY","MEDICINE","ISLAMIC LAW","COMMON AND ISLAMIC LAW","LAW ISLAMIC LAW"]);
const lasuEngineering = new Set(["AERONAUTIC AND ASTRONAUTIC ENGINEERING","AERONAUTICAL AND ASTRONAUTICAL ENGINEERING","CHEMICAL ENGINEERING","CIVIL ENGINEERING","ELECTRONICS AND COMPUTER ENGINEERING","INDUSTRIAL ENGINEERING","MECHANICAL ENGINEERING"]);
const screeningScore = (record:ProgrammeRequirement, floor:number): Pick<ProgrammeRequirement,"minimumUtmeScore"|"scoreScope"> => record.scoreScope==="programme-screening" && !record.unresolvedChecks?.includes("score") && Number.isInteger(record.minimumUtmeScore) && record.minimumUtmeScore!>=floor ? {minimumUtmeScore:record.minimumUtmeScore,scoreScope:"programme-screening"} : {minimumUtmeScore:floor,scoreScope:"institution-screening"};

/** Current session notices supplement each independently sourced component.
 * They never supply missing subjects or promote a review record on their own.
 */
export function applyCurrentScreeningNotice(record: ProgrammeRequirement): ProgrammeRequirement {
  const id = record.institutionId.toLowerCase();
  if (["unilag","jamb-brochure-494"].includes(id)) return {...record,...screeningScore(record,200),maximumSittings:1,firstChoiceRequired:true,screeningRequiredOlevelCredits:["English Language","Mathematics"],unresolvedChecks:record.unresolvedChecks?.filter(check=>check!=="score"&&check!=="sittings"),sources:[...record.sources.filter(source=>source.url!==sources.unilag.url),sources.unilag]};
  const scorePolicy = [{ids:["unn","jamb-brochure-805"],source:"unn",score:160},{ids:["oau","jamb-brochure-620"],source:"oau",score:200},{ids:["uniport","jamb-brochure-668"],source:"uniport",score:160}].find(policy=>policy.ids.includes(id));
  if (scorePolicy) return {...record,...screeningScore(record,scorePolicy.score),firstChoiceRequired:true,unresolvedChecks:record.unresolvedChecks?.filter(check=>check!=="score"),sources:[...record.sources.filter(source=>source.url!==sources[scorePolicy.source].url),sources[scorePolicy.source]]};
  const oneSittingSchool = ["unilorin","jamb-brochure-423"].includes(id)?"unilorin":["ui","jamb-brochure-392"].includes(id)?"ui":null;
  const oneSittingProgramme = oneSittingSchool==="unilorin"?["MEDICINE AND SURGERY","MEDICINE","MBBS","MB BS","PHARMACY","OPTOMETRY","OPTOMETRY AND VISION SCIENCE","COMPUTER ENGINEERING"]:["MEDICINE AND SURGERY","MEDICINE","PHARMACY"];
  if (oneSittingSchool && oneSittingProgramme.includes(nameKey(record.programme))) return {...record,maximumSittings:1,unresolvedChecks:record.unresolvedChecks?.filter(check=>check!=="sittings"),sources:[...record.sources.filter(source=>source.url!==sources[oneSittingSchool].url),sources[oneSittingSchool]]};
  const school = ["lasu","jamb-brochure-503"].includes(id) ? "lasu" : ["uniosun","jamb-brochure-798"].includes(id) ? "uniosun" : ["fuoye","jamb-brochure-290"].includes(id) ? "fuoye" : null;
  if (!school) return record;
  const programme = nameKey(record.programme);
  const suspended = school === "fuoye" && programme === "LAW" || school === "uniosun" && ["MEDICINE","MEDICINE AND SURGERY"].includes(programme);
  if (school === "fuoye" && !suspended) return record;
  const remaining = (record.unresolvedChecks ?? []).filter(check => check !== "score" && (school === "fuoye" || check !== "sittings"));
  const result: ProgrammeRequirement = {
    ...record,
    ...(school === "lasu" ? {...screeningScore(record,195),maximumSittings:["MEDICINE","MEDICINE AND SURGERY","DENTISTRY","DENTISTRY AND DENTAL SURGERY"].includes(programme)?1 as const:2 as const,firstChoiceRequired:true,screeningRequiredOlevelCredits:["English Language"]} : {}),
    ...(school === "lasu" && lasuEngineering.has(programme) ? {sittingCreditConditions:[{sittings:2 as const,minimumCreditCount:6,requiredCredits:["English Language","Mathematics","Physics","Chemistry"]}]} : {}),
    ...(school === "lasu" && ["AERONAUTIC AND ASTRONAUTIC ENGINEERING","AERONAUTICAL AND ASTRONAUTICAL ENGINEERING"].includes(programme) ? {screeningRequiredOlevelCredits:["English Language","Further Mathematics"]} : {}),
    ...(school === "uniosun" ? {...screeningScore(record,uniosunExceptions.has(programme)?200:160),maximumSittings:uniosunExceptions.has(programme) ? 1 as const : 2 as const,firstChoiceRequired:true} : {}),
    unresolvedChecks: school === "fuoye" ? record.unresolvedChecks : remaining,
    sources: [...record.sources.filter(source => source.url !== sources[school].url),sources[school]],
    ...(suspended ? {admissionRestriction:{session:"2026/2027",reason:school === "fuoye" ? "FUOYE is not admitting Law candidates for 2026/2027." : "UNIOSUN Medicine admission is on hold for 2026/2027."}} : {}),
  };
  return result;
}
