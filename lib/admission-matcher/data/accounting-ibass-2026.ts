import type { ProgrammeRequirement } from "../types";

const jambAccountingSource = {
  label: "JAMB IBASS Degree Brochure - Administration (Accounting)",
  url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
  session: "2026/2027 eligibility reference",
  lastVerified: "2026-10-01",
};

const jambPolicySource = {
  label: "JAMB 2026 Policy Meeting minimum tolerable admission scores",
  url: "https://www.jamb.gov.ng/",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const lasuSource = {
  label: "LASU 2026/2027 Admission Screening Portal",
  url: "https://services.lidc.lasu.edu.ng/admissionscreening/index.php",
  session: "2026/2027",
  lastVerified: "2026-10-01",
};

const socialScienceUtmeOptions = ["Government", "Geography", "Commerce", "Accounting", "Financial Accounting", "Civic Education"];

const institutions: Array<{ id: string; name: string; minimumUtmeScore?: number; extraSources?: typeof jambAccountingSource[] }> = [
  { id: "lasu", name: "Lagos State University (LASU)", minimumUtmeScore: 195, extraSources: [lasuSource] },
  { id: "aaua", name: "Adekunle Ajasin University, Akungba-Akoko (AAUA)" },
  { id: "absu", name: "Abia State University (ABSU)" },
  { id: "abu", name: "Ahmadu Bello University (ABU)" },
  { id: "uniabuja", name: "University of Abuja (UNIABUJA)" },
  { id: "adun", name: "Admiralty University of Nigeria (ADUN)" },
  { id: "al-ansar", name: "Al-Ansar University" },
  { id: "apu", name: "Ahman Pategi University (APU)" },
  { id: "aletheia", name: "Aletheia University" },
  { id: "amou", name: "Al-Muhibbah Open University" },
  { id: "aun", name: "American University of Nigeria (AUN)" },
  { id: "aust", name: "African University of Science and Technology (AUST)" },
  { id: "ave-maria", name: "Ave Maria University" },
  { id: "azman", name: "Azman University" },
  { id: "basu", name: "Bauchi State University (BASU)" },
  { id: "bsu", name: "Benue State University (BSU)" },
  { id: "bouedst", name: "Bamidele Olumilua University of Education, Science and Technology (BOUESTI/BOUEDST)" },
  { id: "caritas", name: "Caritas University" },
  { id: "ccu", name: "Capital City University, Kano (CCU)" },
  { id: "coou", name: "Chukwuemeka Odumegwu Ojukwu University (COOU)" },
  { id: "cosmopolitan", name: "Cosmopolitan University" },
  { id: "crutech", name: "University of Cross River State (UNICROSS/CRUTECH)" },
  { id: "cun", name: "Claretian University of Nigeria (CUN)" },
  { id: "delsu", name: "Delta State University (DELSU)" },
  { id: "ebsu", name: "Ebonyi State University (EBSU)" },
  { id: "eksu", name: "Ekiti State University (EKSU)" },
  { id: "unizik", name: "Nnamdi Azikiwe University (UNIZIK)" },
  { id: "uniuyo", name: "University of Uyo (UNIUYO)" },
];

export const accountingIbass2026Requirements: ProgrammeRequirement[] = institutions.map((institution) => ({
  institutionId: institution.id,
  institutionName: institution.name,
  programme: "Accounting",
  aliases: ["Accountancy"],
  minimumUtmeScore: institution.minimumUtmeScore,
  requiredUtmeSubjects: ["Mathematics", "Economics"],
  utmeAlternatives: [socialScienceUtmeOptions],
  requiredOlevelCredits: ["English Language", "Mathematics", "Economics"],
  minimumOlevelCreditCount: 5,
  maximumSittings: 2,
  screeningMethod: "other",
  notes: [
    "JAMB IBASS lists Accounting for this institution under the Administration degree brochure.",
    "The stored subject rule follows JAMB's Accounting requirement: five SSC credits including English Language, Mathematics and Economics, plus two other subjects; UTME Mathematics, Economics and another Social Science subject.",
    institution.minimumUtmeScore
      ? "An institution-specific 2026/2027 screening floor has also been verified and stored."
      : "The institution-specific 2026/2027 screening score is intentionally not guessed; the result remains Review until that score is verified from an official institutional source.",
    "JAMB's 2026 university-wide tolerable floor is 150, but the Matcher does not substitute that national floor for a university or programme-specific screening threshold.",
  ],
  sources: [jambAccountingSource, jambPolicySource, ...(institution.extraSources ?? [])],
}));
