import type { ProgrammeRequirement } from "../types";
import { fuoye2026Requirements } from "./fuoye-2026";

const engineeringSource = {
  label: "FUOYE Faculty of Engineering admission requirements",
  url: "https://engineering.fuoye.edu.ng/",
  session: "Current faculty admission requirements checked 2026-10-01",
  lastVerified: "2026-10-01",
  scope: "Five O-Level credits including English, Mathematics, Physics, Chemistry and one other science subject in not more than two sittings; UTME English plus Mathematics, Chemistry and Physics"
};

// These programmes are promoted only where the current Faculty of Engineering rule and
// FUOYE's 2026/2027 programme score/source data together cover every machine decision.
const sourceCompleteEngineering = new Set([
  "Agricultural and Bioresources Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Mechatronics Engineering",
  "Metallurgical and Materials Engineering",
]);

export const fuoyeVerified2026Requirements: ProgrammeRequirement[] = fuoye2026Requirements.map((record) => {
  if (!sourceCompleteEngineering.has(record.programme)) return record;
  return {
    ...record,
    maximumSittings: 2,
    verificationStatus: "verified",
    unresolvedChecks: [],
    reviewReasons: [],
    sources: [...record.sources, { ...engineeringSource, locator: record.programme }],
    notes: [
      ...(record.notes ?? []),
      "Verified only for the stored UTME/O-Level/sitting/2026 programme-screening checks; admission remains subject to FUOYE/JAMB administrative decisions."
    ]
  };
});
