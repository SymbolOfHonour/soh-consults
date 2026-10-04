import { lasuCurrentScreeningSource } from "../current-screening";
import type { ProgrammeRequirement } from "../types";
import { lasuLiveCatalogue2026 } from "./lasu-live-2026";

const names = ["Biochemistry", "Microbiology", "Pharmacology", "Pharmacy", "Physiology", "Physiotheraphy", "Radiography and Radiation Science", "Science Laboratory Technology"];

/** Enumerated subjects observed directly in LASU's course checker on 2026-10-04.
 * The current UTME announcement separately establishes sitting limits.
 */
export const lasuScienceHealth2026: ProgrammeRequirement[] = names.map(programme => {
  const captured = lasuLiveCatalogue2026.find(row => row.programme === programme);
  if (!captured) throw new Error(`Missing LASU catalogue evidence: ${programme}`);
  const alternative = programme === "Biochemistry" || programme === "Microbiology";
  return {
    ...captured,
    requiredUtmeSubjects: alternative ? ["Biology", "Chemistry"] : ["Physics", "Chemistry", "Biology"],
    utmeGroups: alternative ? [{ subjects: ["Physics", "Mathematics"], count: 1 }] : undefined,
    requiredOlevelCredits: ["English Language", "Mathematics", "Physics", "Chemistry", "Biology"],
    minimumOlevelCreditCount: 5,
    maximumSittings: 2,
    verificationStatus: "verified",
    unresolvedChecks: [],
    reviewReasons: [],
    sources: [...captured.sources.map(source => source.label === "LASU official course requirements checker" ? {
      ...source,
      session: "Current LASU checker, observed 2026-10-04",
      lastVerified: "2026-10-04",
      scope: `${programme}; explicitly enumerated UTME and O-Level subjects observed in the rendered course result`,
    } : source), lasuCurrentScreeningSource],
    notes: [...(captured.notes ?? []).slice(0, 1), "Use of English is compulsory. The current UTME announcement confirms two sittings. Direct Entry qualifications and administrative admission requirements remain separate."],
  };
});
