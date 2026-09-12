export type OpportunityCategory =
  | "University"
  | "Polytechnic"
  | "College"
  | "Other";

export type OpportunityStatus =
  | "OPEN"
  | "CLOSING SOON"
  | "EXTENDED"
  | "COMING SOON"
  | "CLOSED";

export type Opportunity = {
  id: number;
  institution: string;
  programme: string;
  category: OpportunityCategory;
  status: OpportunityStatus;
  deadline?: string;
  description: string;
  applicationUrl?: string;
};

export const opportunities: Opportunity[] = [
  {
    id: 1,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "Post-UTME / Undergraduate Admission",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "Admission opportunity for eligible candidates seeking undergraduate admission into FUOYE.",
    applicationUrl: "https://fuoye.edu.ng/",
  },

  {
    id: 2,
    institution: "University of Lagos (UNILAG)",
    programme: "Direct Entry Screening",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "Direct Entry candidates can complete the required screening process through the official UNILAG portal.",
    applicationUrl: "https://unilag.edu.ng/",
  },

  {
    id: 3,
    institution: "Federal University Otuoke (FUOTUOKE)",
    programme: "Post-UTME / Undergraduate Admission",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "Post-UTME admission opportunity for eligible candidates seeking undergraduate admission.",
    applicationUrl: "https://fuotuoke.edu.ng/",
  },

  {
    id: 4,
    institution: "Federal University Otuoke (FUOTUOKE)",
    programme: "Part-Time Degree",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "Part-Time degree admission opportunity for qualified applicants.",
    applicationUrl: "https://fuotuoke.edu.ng/",
  },

  {
    id: 5,
    institution: "Federal Polytechnic Nasarawa",
    programme: "ND Post-UTME",
    category: "Polytechnic",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "ND admission opportunity for candidates seeking admission into the Polytechnic.",
  },

  {
    id: 6,
    institution: "Federal Polytechnic Nasarawa",
    programme: "HND Admission",
    category: "Polytechnic",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "HND admission opportunity for suitably qualified candidates.",
  },

  {
    id: 7,
    institution: "Federal Polytechnic Bida (BIDAPOLY)",
    programme: "ND Full-Time Admission",
    category: "Polytechnic",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "ND Full-Time admission opportunity for eligible candidates.",
  },

  {
    id: 8,
    institution: "Federal College of Education, Iwo",
    programme: "NCE Post-UTME",
    category: "College",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "NCE admission opportunity for eligible candidates seeking admission into the college.",
  },

  {
    id: 9,
    institution: "Nigerian Army University Biu (NAUB)",
    programme: "IJMB",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "IJMB programme opportunity for candidates interested in the available programme.",
  },

  {
    id: 10,
    institution: "Nigerian Army University Biu (NAUB)",
    programme: "Diploma Programmes",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "Diploma programme opportunities for qualified applicants.",
  },
];