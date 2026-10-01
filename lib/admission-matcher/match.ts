import type { CandidateProfile, MatchResult, ProgrammeRequirement } from "./types";

const normalise = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");
const has = (values: string[], subject: string) => values.map(normalise).includes(normalise(subject));

export function matchCandidate(
  candidate: CandidateProfile,
  requirements: ProgrammeRequirement[],
): MatchResult[] {
  const requestedProgramme = normalise(candidate.programme);

  return requirements
    .filter((item) => {
      const names = [item.programme, ...(item.aliases ?? [])].map(normalise);
      return names.includes(requestedProgramme);
    })
    .map((requirement) => {
      const passed: string[] = [];
      const failed: string[] = [];
      const needsReview: string[] = [];

      if (typeof requirement.minimumUtmeScore === "number") {
        if (candidate.utmeScore >= requirement.minimumUtmeScore) passed.push(`UTME score meets the stored minimum of ${requirement.minimumUtmeScore}.`);
        else failed.push(`UTME score is below the stored minimum of ${requirement.minimumUtmeScore}.`);
      } else needsReview.push("No programme-specific UTME minimum has been verified in the Matcher dataset yet.");

      const missingUtme = requirement.requiredUtmeSubjects.filter(
        (subject) => normalise(subject) !== "english language" && !has(candidate.utmeSubjects, subject),
      );
      if (missingUtme.length) failed.push(`UTME subject requirement missing: ${missingUtme.join(", ")}.`);
      else passed.push("Stored UTME subject combination is satisfied.");

      const missingOlevel = requirement.requiredOlevelCredits.filter((subject) => !has(candidate.olevelCredits, subject));
      if (missingOlevel.length) failed.push(`O'Level credit requirement missing: ${missingOlevel.join(", ")}.`);
      else passed.push("Stored core O'Level credit requirements are satisfied.");

      for (const group of requirement.olevelAlternatives ?? []) {
        if (group.some((subject) => has(candidate.olevelCredits, subject))) passed.push(`O'Level option satisfied by one of: ${group.join(", ")}.`);
        else failed.push(`O'Level requires at least one of: ${group.join(", ")}.`);
      }

      const status = failed.length ? "not_match" : needsReview.length ? "review" : "match";
      return { requirement, status, passed, failed, needsReview };
    });
}
