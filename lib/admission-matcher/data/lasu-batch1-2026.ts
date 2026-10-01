import type { ProgrammeRequirement } from "../types";

const courseSource = {
  label: "LASU official course requirements checker",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/",
  session: "Current LASU checker, retrieved 2026-10-01",
  lastVerified: "2026-10-01",
  scope: "Programme-specific O-Level and UTME subject wording",
};
const screeningSource = {
  label: "LASU 2026/2027 Admission Screening Portal",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/index.php",
  session: "2026/2027",
  lastVerified: "2026-10-01",
  scope: "195 UTME screening floor, LASU first choice, O-Level upload to JAMB CAPS",
};
const sittingSource = {
  label: "LASU undergraduate admission screening guidelines",
  url: "https://lasu.edu.ng/home/news_file/20202021%20UNDERGRADUATE%20ADMISSION%20SCREENING%20EXERCISES_1607515798.pdf",
  session: "2020/2021 published university-wide screening rule; rechecked 2026-10-01",
  lastVerified: "2026-10-01",
  scope: "Five relevant O-Level credits at no more than two sittings; Medicine and Dentistry one sitting; Engineering using two sittings requires six credits including Mathematics, Physics, Chemistry, English and another Science subject",
};

function row(programme:string,id:string,utme:string[],olevel:string[],minimumOlevelCreditCount:number,maximumSittings:number,notes:string[]=[]):ProgrammeRequirement {
  return {
    institutionId:"lasu",institutionName:"Lagos State University (LASU)",institutionType:"state-university",institutionAliases:["LASU"],programme,
    minimumUtmeScore:195,scoreScope:"institution-screening",firstChoiceRequired:true,
    requiredUtmeSubjects:utme,requiredOlevelCredits:olevel,minimumOlevelCreditCount,maximumSittings,
    verificationStatus:"verified",screeningMethod:"online",
    sources:[{...courseSource,locator:`Course ID ${id}`},screeningSource,sittingSource],
    notes:["The 195 score is LASU's institutional screening floor, not a departmental admission cutoff.",...notes],
  };
}

export const lasuBatch1Requirements:ProgrammeRequirement[] = [
  row("Medicine and Surgery","0710",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,1,["LASU's published university-wide screening rule expressly limits Medicine to one O-Level sitting."]),
  row("Nursing","1212",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,2),
  row("Medical Laboratory Science","1721",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,2),
  // Engineering records remain conservative: the current checker supplies the core subjects, while LASU's published two-sitting rule requires six credits.
  // Because the engine cannot yet express a sitting-dependent credit-count rule, keep engineering at one sitting for automatic matching rather than create a false two-sitting positive.
  row("Chemical Engineering","0231",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,1,["Two-sitting Engineering eligibility has an additional six-credit LASU rule that is not yet representable by the current engine; automatic matching is therefore conservatively limited to one sitting."]),
  row("Civil Engineering","0241",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,1,["Two-sitting Engineering eligibility has an additional six-credit LASU rule that is not yet representable by the current engine; automatic matching is therefore conservatively limited to one sitting."]),
  row("Mechanical Engineering","0221",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,1,["Two-sitting Engineering eligibility has an additional six-credit LASU rule that is not yet representable by the current engine; automatic matching is therefore conservatively limited to one sitting."]),
  row("Electronics and Computer Engineering","0211",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,1,["Two-sitting Engineering eligibility has an additional six-credit LASU rule that is not yet representable by the current engine; automatic matching is therefore conservatively limited to one sitting."]),
  row("Aerospace Engineering","0251",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry","Further Mathematics"],6,1,["LASU additionally requires Further Mathematics for Aerospace Engineering. Two-sitting Engineering eligibility is conservatively withheld until the engine can express LASU's conditional six-credit rule exactly."]),
];
