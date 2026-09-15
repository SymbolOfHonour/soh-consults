export type AdmissionDeadline = {
  institution: string;
  shortName?: string;
  category: "University" | "Polytechnic" | "College of Nursing Sciences";
  programme: string;
  deadline?: string;
  deadlineISO?: string;
  status?: "OPEN" | "REOPENED";
  updateId: number;
};

const dated = (
  institution: string,
  shortName: string,
  category: AdmissionDeadline["category"],
  deadline: string,
  deadlineISO: string,
  status: AdmissionDeadline["status"] = "OPEN",
): AdmissionDeadline => ({
  institution,
  shortName,
  category,
  programme: "2026/2027 Post-UTME / Admission Screening",
  deadline,
  deadlineISO,
  status,
  updateId: 17,
});

const open = (
  institution: string,
  shortName: string,
  category: AdmissionDeadline["category"],
): AdmissionDeadline => ({
  institution,
  shortName,
  category,
  programme: "2026/2027 Admission Form / Screening",
  status: "OPEN",
  updateId: 17,
});

export const admissionDeadlines: AdmissionDeadline[] = [
  dated("Osun State University", "UNIOSUN", "University", "17 September 2026", "2026-09-17"),
  dated("Obafemi Awolowo University", "OAU", "University", "23 September 2026", "2026-09-23"),
  dated("Ekiti State University", "EKSU", "University", "30 September 2026", "2026-09-30"),
  dated("Ladoke Akintola University of Technology", "LAUTECH", "University", "9 September 2026", "2026-09-09"),
  dated("Federal University Wukari", "FUWUKARI", "University", "19 September 2026", "2026-09-19"),
  dated("Federal University of Lafia", "FULAFIA", "University", "20 September 2026", "2026-09-20"),
  dated("Plateau State University", "PLASU", "University", "20 September 2026", "2026-09-20"),
  dated("Akwa Ibom State University", "AKSU", "University", "22 September 2026", "2026-09-22"),
  dated("University of Ilesa", "UNILESA", "University", "30 September 2026", "2026-09-30"),
  dated("Olusegun Agagu University of Science and Technology", "OAUSTECH", "University", "15 September 2026", "2026-09-15"),
  dated("Bamidele Olumilua University of Education, Science and Technology", "BOUESTI", "University", "30 September 2026", "2026-09-30"),
  dated("Nasarawa State University, Keffi", "NSUK", "University", "30 September 2026", "2026-09-30"),
  dated("Federal University of Technology, Babura", "FUTB", "University", "30 September 2026", "2026-09-30"),
  dated("Federal University of Agriculture, Mubi", "FUAMB", "University", "31 October 2026", "2026-10-31"),
  dated("Federal University Lokoja", "FULOKOJA", "University", "13 September 2026", "2026-09-13"),
  dated("University of Agriculture and Environmental Sciences, Umudike", "UAES", "University", "31 October 2026", "2026-10-31"),
  dated("Adamawa State University", "ADSU", "University", "4 September 2026", "2026-09-04"),
  dated("University of Abuja", "UNIABUJA", "University", "2 October 2026", "2026-10-02", "REOPENED"),

  open("Ogun State Institute of Technology", "OGITECH", "Polytechnic"),
  open("Moshood Abiola Polytechnic", "MAPOLY", "Polytechnic"),
  open("Federal Polytechnic, Ilaro", "ILAROPOLY", "Polytechnic"),
  open("Federal Polytechnic, Ede", "EDEPOLY", "Polytechnic"),
  open("Federal Polytechnic, Nekede", "NEKEDEPOLY", "Polytechnic"),
  open("Auchi Polytechnic", "AUCHIPOLY", "Polytechnic"),
  open("Kaduna Polytechnic", "KADPOLY", "Polytechnic"),
  open("Kano State Polytechnic", "KANOPOLY", "Polytechnic"),
  open("Kogi State Polytechnic", "KSP", "Polytechnic"),
  open("Delta State Polytechnic, Ogwashi-Uku", "DSPG", "Polytechnic"),
  open("The Oke-Ogun Polytechnic, Saki", "TOPS", "Polytechnic"),

  dated("University of Benin Teaching Hospital", "UBTH", "College of Nursing Sciences", "11 September 2026", "2026-09-11"),
  dated("Monguno College of Nursing Sciences", "MOCONS", "College of Nursing Sciences", "13 September 2026", "2026-09-13"),
  dated("Regina Caeli College of Nursing Sciences", "RCCONS", "College of Nursing Sciences", "10 September 2026", "2026-09-10"),
  dated("Alex Ekwueme Federal University Teaching Hospital, Abakaliki", "AE-FUTHA", "College of Nursing Sciences", "21 September 2026", "2026-09-21"),
  open("Royal Nursing Sciences, Ezzangbo", "Royal Nursing", "College of Nursing Sciences"),
  open("Archbishop Charles Heerey Memorial College of Nursing Sciences", "ACHCONSA", "College of Nursing Sciences"),
  open("Jibape Memorial College of Nursing Sciences", "JMCNS", "College of Nursing Sciences"),
  open("Royal Mira College of Nursing Sciences", "Royal Mira", "College of Nursing Sciences"),
  open("St. Joseph College of Nursing Sciences", "St. Joseph", "College of Nursing Sciences"),
  open("Iyienu College of Nursing Sciences", "Iyienu", "College of Nursing Sciences"),
  open("Adazi-Nnukwu College of Nursing Sciences", "Adazi-Nnukwu", "College of Nursing Sciences"),
  open("SDA College of Nursing Sciences", "SDA", "College of Nursing Sciences"),
  open("St. Anna College of Nursing Sciences", "St. Anna", "College of Nursing Sciences"),
  open("Oasis College of Nursing Sciences, Kuje", "Oasis", "College of Nursing Sciences"),
  open("College of Nursing Sciences, Obudu", "Obudu", "College of Nursing Sciences"),
];
