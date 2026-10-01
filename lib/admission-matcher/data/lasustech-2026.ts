import type { ProgrammeRequirement } from "../types";

const screeningSource = {
  label: "LASUSTECH 2026/2027 Online Admission Screening Exercise",
  url: "https://lasustech.edu.ng/events.php?event=2026-2027-online-admission-screening-exercise-for-100-level-and-direct-entry-candidates",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const requirementsSource = {
  label: "LASUSTECH Official Programme Admission Requirements",
  url: "https://www.lasustech.edu.ng/colleges-and-directorates/admissions/",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const engineeringOlevel = ["English Language", "Mathematics", "Physics", "Chemistry"];
const engineeringAlternative = [["Biology", "Agricultural Science", "Technical Drawing", "Further Mathematics", "Economics", "Computer Studies", "Geography"]];

export const lasustech2026Requirements: ProgrammeRequirement[] = [
  {
    institutionId: "lasustech",
    institutionName: "Lagos State University of Science and Technology (LASUSTECH)",
    programme: "Civil and Construction Engineering",
    aliases: ["Civil Engineering"],
    minimumUtmeScore: 195,
    requiredUtmeSubjects: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevelCredits: engineeringOlevel,
    olevelAlternatives: engineeringAlternative,
    maximumSittings: 2,
    screeningMethod: "online",
    notes: ["LASUSTECH requires first-choice status and O'Level credits at not more than two sittings for the 2026/2027 screening exercise."],
    sources: [screeningSource, requirementsSource],
  },
  {
    institutionId: "lasustech",
    institutionName: "Lagos State University of Science and Technology (LASUSTECH)",
    programme: "Computer Engineering",
    minimumUtmeScore: 195,
    requiredUtmeSubjects: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevelCredits: engineeringOlevel,
    olevelAlternatives: engineeringAlternative,
    maximumSittings: 2,
    screeningMethod: "online",
    sources: [screeningSource, requirementsSource],
  },
  {
    institutionId: "lasustech",
    institutionName: "Lagos State University of Science and Technology (LASUSTECH)",
    programme: "Agricultural and Biosystems Engineering",
    minimumUtmeScore: 195,
    requiredUtmeSubjects: ["Mathematics", "Physics", "Chemistry"],
    requiredOlevelCredits: engineeringOlevel,
    olevelAlternatives: engineeringAlternative,
    maximumSittings: 2,
    screeningMethod: "online",
    sources: [screeningSource, requirementsSource],
  },
  {
    institutionId: "lasustech",
    institutionName: "Lagos State University of Science and Technology (LASUSTECH)",
    programme: "Insurance",
    minimumUtmeScore: 195,
    requiredUtmeSubjects: ["Mathematics", "Economics"],
    requiredOlevelCredits: ["English Language", "Mathematics", "Economics"],
    olevelAlternatives: [["Financial Accounting", "Principles of Accounting", "Business Methods", "Commerce", "Book Keeping", "Marketing", "Insurance", "Government", "Civic Education", "Geography", "Data Processing", "Computer Studies", "Office Practice", "CRS", "IRS", "Agricultural Science", "Biology", "Physics"]],
    maximumSittings: 2,
    screeningMethod: "online",
    notes: ["The official requirement needs two additional listed O'Level subjects. The Beta matcher currently verifies the core compulsory credits and flags alternative-group handling conservatively."],
    sources: [screeningSource, requirementsSource],
  },
];
