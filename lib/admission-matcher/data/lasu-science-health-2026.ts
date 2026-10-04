import type { ProgrammeRequirement } from "../types";
import { lasuLiveCatalogue2026 } from "./lasu-live-2026";

const names = ["Biochemistry", "Microbiology", "Pharmacology", "Pharmacy", "Physiology", "Physiotheraphy", "Radiography and Radiation Science", "Science Laboratory Technology"];

/** Enumerated subjects observed directly in LASU's course checker on 2026-10-04.
 * This is subject reconciliation, not a claim of complete admission eligibility.
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
    verificationStatus: "review",
    unresolvedChecks: ["sittings"],
    reviewReasons: ["Explicit UTME and O-Level subjects have been reconciled with LASU's official course checker. Current programme sitting restrictions still require confirmation."],
    sources: captured.sources.map(source => source.label === "LASU official course requirements checker" ? {
      ...source,
      session: "Current LASU checker, observed 2026-10-04",
      lastVerified: "2026-10-04",
      scope: `${programme}; explicitly enumerated UTME and O-Level subjects observed in the rendered course result`,
    } : source),
    notes: [...(captured.notes ?? []).slice(0, 1), "Use of English is compulsory. Sitting limits and Direct Entry eligibility are not established by this subject capture."],
  };
});
