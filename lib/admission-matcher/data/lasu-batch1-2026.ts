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
  label: "LASU 2026/2027 admission screening instructions",
  url: "https://www.lasu.edu.ng/home/news/read.php?id=351",
  session: "2026/2027",
  lastVerified: "2026-10-01",
  scope: "General O-Level sitting rule: maximum two sittings; Medicine and Dentistry one sitting; engineering candidates using two sittings require six relevant O-Level credits. Programme subject wording remains sourced from the official LASU checker.",
};

function row(programme:string,id:string,utme:string[],olevel:string[],minimumOlevelCreditCount:number,maximumSittings:1|2):ProgrammeRequirement {
  return {
    institutionId:"lasu",
    institutionName:"Lagos State University (LASU)",
    institutionType:"state-university",
    institutionAliases:["LASU"],
    programme,
    minimumUtmeScore:195,
    scoreScope:"institution-screening",
    firstChoiceRequired:true,
    requiredUtmeSubjects:utme,
    requiredOlevelCredits:olevel,
    minimumOlevelCreditCount,
    maximumSittings,
    verificationStatus:"verified",
    unresolvedChecks:[],
    reviewReasons:[],
    screeningMethod:"online",
    sources:[{...courseSource,locator:`Course ID ${id}`},screeningSource,sittingSource],
    notes:["Programme subject checks, the 195/first-choice screening baseline and the sitting limit are source-backed.","The 195 score is LASU's institutional screening floor, not a departmental admission cutoff."],
  };
}

export const lasuBatch1Requirements:ProgrammeRequirement[] = [
  row("Medicine and Surgery","0710",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,1),
  row("Nursing","1212",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,2),
  row("Medical Laboratory Science","1721",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5,2),
  row("Chemical Engineering","0231",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,2),
  row("Civil Engineering","0241",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,2),
  row("Mechanical Engineering","0221",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,2),
  row("Electronics and Computer Engineering","0211",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5,2),
  row("Aerospace Engineering","0251",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry","Further Mathematics"],6,2),
];
