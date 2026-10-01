import type { ProgrammeRequirement } from "./types";

/**
 * Admission Matcher data is intentionally isolated from every existing screening
 * calculator. Never import calculator rules into this file and never modify a
 * calculator to serve the Matcher.
 *
 * Only add a programme after its current requirements have been verified from
 * JAMB IBASS and/or the institution's official admission source. Every record
 * must carry source, admission session and last-verified metadata.
 */
export const admissionRequirements: ProgrammeRequirement[] = [];
