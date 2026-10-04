import { lasuCurrentScreeningSource } from "../current-screening";
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

function row(programme:string,id:string,utme:string[],olevel:string[],minimumOlevelCreditCount:number):ProgrammeRequirement {
  const health = ["Medicine and Surgery","Nursing","Medical Laboratory Science"].includes(programme);
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
    maximumSittings: programme === "Medicine and Surgery" ? 1 : 2,
    verificationStatus:health ? "verified" : "review",
    unresolvedChecks:health ? [] : ["olevel"],
    reviewReasons:health ? [] : ["The current announcement requires six relevant credits for engineering at two sittings. Remaining programme credit choices need institution-specific reconciliation."],
    screeningMethod:"online",
    sources:[{...courseSource,locator:`Course ID ${id}`},screeningSource,lasuCurrentScreeningSource],
    notes:["Current UTME screening limits are confirmed. Unresolved subject conditions require review; administrative conditions and Direct Entry remain separate.","The 195 score is LASU's institutional screening floor, not a departmental admission cutoff."],
  };
}

export const lasuBatch1Requirements:ProgrammeRequirement[] = [
  row("Medicine and Surgery","0710",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5),
  row("Nursing","1212",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5),
  row("Medical Laboratory Science","1721",["Physics","Chemistry","Biology"],["English Language","Mathematics","Physics","Chemistry","Biology"],5),
  row("Chemical Engineering","0231",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5),
  row("Civil Engineering","0241",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5),
  row("Mechanical Engineering","0221",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5),
  row("Electronics and Computer Engineering","0211",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry"],5),
  row("Aerospace Engineering","0251",["Mathematics","Physics","Chemistry"],["English Language","Mathematics","Physics","Chemistry","Further Mathematics"],6),
];
