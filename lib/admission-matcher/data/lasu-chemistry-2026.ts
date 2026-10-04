import { lasuCurrentScreeningSource } from "../current-screening";
import type { ProgrammeRequirement } from "../types";
import { lasuLiveCatalogue2026 } from "./lasu-live-2026";

const captured = lasuLiveCatalogue2026.find(row => row.programme === "Chemistry");
if (!captured) throw new Error("LASU Chemistry catalogue evidence is required");

/** Exact enumerated subjects corroborated by LASU wording and the official
 * IBASS checker. Broad-category rules for other programmes are not inferred.
 * The current UTME announcement supplies the separately verified sitting rule.
 */
export const lasuChemistry2026: ProgrammeRequirement = {
  ...captured,
  requiredUtmeSubjects: ["Chemistry"],
  utmeGroups: [{ subjects: ["Physics", "Biology", "Mathematics"], count: 2 }],
  requiredOlevelCredits: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
  minimumOlevelCreditCount: 5,
  maximumSittings: 2,
  verificationStatus: "verified",
  unresolvedChecks: [],
  reviewReasons: [],
  sources: [...captured.sources, lasuCurrentScreeningSource, {
    label: "JAMB IBASS official eligibility checker",
    url: "https://ibass.jamb.gov.ng/eligibility-checker",
    session: "Live checker observed 2026-10-04; current screening conditions are separate",
    lastVerified: "2026-10-04",
    locator: "UTME > Degree Awarding Institutions > State Universities > Lagos State University, Ojo > Chemistry",
    scope: "Enumerated Chemistry UTME and O-Level subjects; positive and missing-compulsory-subject synthetic probes",
  }],
  notes: ["Use of English is compulsory and is supplied separately from the three UTME electives.", "This record covers UTME subject and credit checks. The current UTME screening announcement confirms two sittings; Direct Entry requires separate assessment.", "O-Level upload to JAMB CAPS and other administrative admission requirements remain applicable."],
};
