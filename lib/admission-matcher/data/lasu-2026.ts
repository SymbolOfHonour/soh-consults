import type { ProgrammeRequirement } from "../types";

const source = {
  label: "LASU 2026/2027 Admission Screening Portal",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/index.php",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const programmeSource = { label: "LASU official JAMB course requirements checker", url: "https://services.lidc.lasu.edu.ng/admissionscreening/courserequirement/", session: "Current undated programme rules, linked by 2026/2027 portal", lastVerified: "2026-10-01", scope: "Accounting View Requirement result: English Language, Mathematics, Economics and broad Social Science wording", locator: "Choose Accounting, then Check Requirement" };
const jambSource = { label: "JAMB IBASS Degree Administration brochure", url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf", session: "Current IBASS brochure checked 2026-10-01", lastVerified: "2026-10-01", scope: "Accounting general five-credit framework and LASU Accounting special-consideration context; used conservatively where the LASU checker remains broader" };

export const lasu2026Requirements: ProgrammeRequirement[] = [{
  institutionId: "lasu", institutionName: "Lagos State University (LASU)", institutionType: "state-university", institutionAliases: ["LASU"], programme: "Accounting", aliases: ["Accountancy"], minimumUtmeScore: 195, scoreScope: "institution-screening", firstChoiceRequired: true,
  // The current LASU checker names Mathematics and Economics, then uses the broad phrase
  // "any subject from Social Science". Do not encode a guessed closed list here. The
  // unresolved flag deliberately prevents these placeholders from deciding eligibility.
  requiredUtmeSubjects: ["Mathematics", "Economics"], utmeGroups: [{subjects: ["Government", "Geography", "Commerce", "Financial Accounting"],count:1}],
  requiredOlevelCredits: ["English Language", "Mathematics", "Economics"], minimumOlevelCreditCount: 5, maximumSittings: 2,
  verificationStatus: "review", unresolvedChecks: ["utme", "olevel"],
  reviewReasons: ["LASU's official checker confirms Accounting and its English/Mathematics/Economics core requirements but describes the remaining subject category broadly as Social Science. The complete current LASU accepted subject set and any programme-specific waivers still need authoritative verification, so subject eligibility remains review-only."],
  screeningMethod: "online", sources: [programmeSource, jambSource, {...source,scope: "195 institution screening floor and first choice, not a departmental admission cutoff"}],
  notes: ["Alternative subjects shown in stored data are non-decisional placeholders while the Social Science category remains unresolved; they must not be presented as a complete accepted list.", "The stored maximum of two sittings and five-credit framework are independently source-backed, but they do not make the unresolved subject-category rule automatic.", "OLevel upload to JAMB CAPS and all administrative admission checks remain required."]
}];

export const lasu2026Baseline = {
  institutionId: "lasu",
  institutionName: "Lagos State University (LASU)",
  minimumUtmeScore: 195,
  firstChoiceRequired: true,
  screeningMethod: "online" as const,
  source,
};
