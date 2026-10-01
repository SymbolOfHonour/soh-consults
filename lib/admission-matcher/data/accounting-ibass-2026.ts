import type { ProgrammeRequirement } from "../types";

const jambAccountingSource = { label: "JAMB IBASS Administration brochure, inherited Accounting catalogue reference", url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf", session: "Publication session unconfirmed; catalogue recheck pending", lastVerified: "2026-10-01" };
const socialScienceUtmeOptions = ["Government", "Geography", "Commerce", "Accounting", "Financial Accounting", "Civic Education"];
const accountingOlevelOptions = ["Commerce", "Government", "Geography", "Accounting", "Financial Accounting", "Book Keeping", "Marketing", "Office Practice", "Statistics", "Civic Education"];

const institutions: Array<{ id: string; name: string; minimumUtmeScore?: number; extraSources?: typeof jambAccountingSource[] }> = [
  { id: "aaua", name: "Adekunle Ajasin University, Akungba-Akoko (AAUA)" }, { id: "absu", name: "Abia State University (ABSU)" },
  { id: "abu", name: "Ahmadu Bello University (ABU)" }, { id: "uniabuja", name: "University of Abuja (UNIABUJA)" },
  { id: "adun", name: "Admiralty University of Nigeria (ADUN)" }, { id: "al-ansar", name: "Al-Ansar University" },
  { id: "apu", name: "Ahman Pategi University (APU)" }, { id: "aletheia", name: "Aletheia University" },
  { id: "amou", name: "Al-Muhibbah Open University" }, { id: "aun", name: "American University of Nigeria (AUN)" },
  { id: "aust", name: "African University of Science and Technology (AUST)" }, { id: "ave-maria", name: "Ave Maria University" },
  { id: "azman", name: "Azman University" }, { id: "basu", name: "Bauchi State University (BASU)" },
  { id: "bsu", name: "Benue State University (BSU)" }, { id: "bouedst", name: "Bamidele Olumilua University of Education, Science and Technology (BOUESTI/BOUEDST)" },
  { id: "caritas", name: "Caritas University" }, { id: "ccu", name: "Capital City University, Kano (CCU)" },
  { id: "coou", name: "Chukwuemeka Odumegwu Ojukwu University (COOU)" }, { id: "cosmopolitan", name: "Cosmopolitan University" },
  { id: "crutech", name: "University of Cross River State (UNICROSS/CRUTECH)" }, { id: "cun", name: "Claretian University of Nigeria (CUN)" },
  { id: "delsu", name: "Delta State University (DELSU)" }, { id: "ebsu", name: "Ebonyi State University (EBSU)" },
  { id: "eksu", name: "Ekiti State University (EKSU)" }, { id: "unizik", name: "Nnamdi Azikiwe University (UNIZIK)" },
  { id: "uniuyo", name: "University of Uyo (UNIUYO)" },
];

export const accountingIbass2026Requirements: ProgrammeRequirement[] = institutions.map((institution) => ({
  institutionId: institution.id, institutionName: institution.name, programme: "Accounting", aliases: ["Accountancy"],
  minimumUtmeScore: institution.minimumUtmeScore,
  firstChoiceRequired: institution.id === "lasu",
  scoreScope: "institution-screening", verificationStatus: "review", unresolvedChecks: ["utme", "olevel", "sittings"],
  institutionType: ["abu", "uniabuja", "unizik", "uniuyo"].includes(institution.id) ? "federal-university" : ["lasu", "aaua", "absu", "basu", "bsu", "bouedst", "coou", "crutech", "delsu", "ebsu", "eksu"].includes(institution.id) ? "state-university" : "private-university",
  institutionAliases: [institution.id],
  reviewReasons: ["Inherited IBASS Accounting catalogue entry. Current programme availability, institutional waivers, sittings and programme-specific subjects still need verification. Generic rules are not treated as institutional eligibility."],
  requiredUtmeSubjects: ["Mathematics", "Economics"], utmeAlternatives: [socialScienceUtmeOptions],
  requiredOlevelCredits: ["English Language", "Mathematics", "Economics"], olevelAlternatives: [accountingOlevelOptions], olevelAlternativeMinimums: [2],
  minimumOlevelCreditCount: 5, screeningMethod: "other",
  notes: [
    "The prior dataset referenced this institution in the JAMB Administration brochure; its current listing has not been revalidated.",
    "Live JAMB Accounting guidance requires English, Mathematics and Economics plus any two other SSC credits, with separate NBC provisions. The illustrative inherited alternatives below are not a complete institutional rule.",
    institution.minimumUtmeScore ? "An institution-specific 2026/2027 screening floor has also been verified and stored." : "The institution-specific 2026/2027 screening score is intentionally not guessed; the result remains Review until that score is verified from an official institutional source.",
    "JAMB's national university floor is not substituted for an institution or programme-specific screening threshold.",
  ],
  sources: [jambAccountingSource, ...(institution.extraSources ?? [])],
}));
