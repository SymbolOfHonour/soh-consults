import type { ProgrammeRequirement } from "../types";

const source = {
  label: "LASU 2026/2027 Admission Screening Portal",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/index.php",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const programmeSource = { label: "LASU official JAMB course requirements checker", url: "https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/", session: "Current undated programme rules, linked by 2026/2027 portal", lastVerified: "2026-10-01", scope: "Accounting View Requirement result, general social-science subject wording", locator: "Choose Accounting, then Check Requirement" };
export const lasu2026Requirements: ProgrammeRequirement[] = [{
  institutionId: "lasu", institutionName: "Lagos State University (LASU)", institutionType: "state-university", institutionAliases: ["LASU"], programme: "Accounting", aliases: ["Accountancy"], minimumUtmeScore: 195, scoreScope: "institution-screening", firstChoiceRequired: true,
  requiredUtmeSubjects: ["Mathematics", "Economics"], utmeGroups: [{subjects: ["Government", "Economics", "Geography", "Commerce", "Financial Accounting"],count:1}],
  requiredOlevelCredits: ["English Language", "Mathematics", "Economics"], minimumOlevelCreditCount: 5,
  verificationStatus: "review", unresolvedChecks: ["utme", "olevel", "sittings"],
  reviewReasons: ["LASU's official checker confirms Accounting and its English/Mathematics/Economics requirements but describes the remaining subjects broadly as Social Science. The full accepted subject categories, credit count and current sitting/waiver rules need verification."],
  screeningMethod: "online", sources: [programmeSource, {...source,scope: "195 institution screening floor and first choice, not a departmental admission cutoff"}],
  notes: ["The example alternative subjects are illustrative; the incomplete rule does not decide eligibility.", "OLevel upload to JAMB CAPS and all administrative admission checks remain required."]
}];

export const lasu2026Baseline = {
  institutionId: "lasu",
  institutionName: "Lagos State University (LASU)",
  minimumUtmeScore: 195,
  firstChoiceRequired: true,
  screeningMethod: "online" as const,
  source,
};
