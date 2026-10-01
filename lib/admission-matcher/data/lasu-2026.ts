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
  // Only encode the subject requirements that the current LASU checker states explicitly.
  // Its remaining requirement is the broad category "any subject from Social Science".
  // Until LASU/JAMB provides an authoritative machine-safe category membership list for
  // this current rule, the category remains unresolved instead of being represented by
  // a guessed closed list of subjects.
  requiredUtmeSubjects: ["Mathematics", "Economics"], utmeGroups: [],
  requiredOlevelCredits: ["English Language", "Mathematics", "Economics"], minimumOlevelCreditCount: 5, maximumSittings: 2,
  verificationStatus: "review", unresolvedChecks: ["utme", "olevel"],
  reviewReasons: ["LASU's official checker confirms Accounting and its English/Mathematics/Economics core requirements but describes the remaining subject category broadly as Social Science. The complete current LASU accepted subject set and any programme-specific waivers still need authoritative verification, so subject eligibility remains review-only."],
  screeningMethod: "online", sources: [programmeSource, jambSource, {...source,scope: "195 institution screening floor and first choice, not a departmental admission cutoff"}],
  notes: ["No guessed Social Science subject list is stored. The broad category remains explicitly unresolved and cannot decide eligibility.", "The stored maximum of two sittings and five-credit framework are independently source-backed, but they do not make the unresolved subject-category rule automatic.", "OLevel upload to JAMB CAPS and all administrative admission checks remain required."]
}];

export const lasu2026Baseline = {
  institutionId: "lasu",
  institutionName: "Lagos State University (LASU)",
  minimumUtmeScore: 195,
  firstChoiceRequired: true,
  screeningMethod: "online" as const,
  source,
};
