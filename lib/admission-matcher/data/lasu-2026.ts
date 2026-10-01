import type { ProgrammeRequirement } from "../types";

const source = {
  label: "LASU 2026/2027 Admission Screening Portal",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/index.php",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

// LASU's official portal confirms the institution-wide 195 UTME screening floor.
// Programme records are intentionally not guessed here: programme-specific subject
// rules are added only after they have been verified from LASU's official requirements.
export const lasu2026Requirements: ProgrammeRequirement[] = [];

export const lasu2026Baseline = {
  institutionId: "lasu",
  institutionName: "Lagos State University (LASU)",
  minimumUtmeScore: 195,
  firstChoiceRequired: true,
  screeningMethod: "online" as const,
  source,
};
