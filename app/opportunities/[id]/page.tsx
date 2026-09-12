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
    programme: "2026/2027 Undergraduate Admission",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE has commenced activities for the 2026/2027 admission exercise. Candidates should check the official portal for current application and screening information.",
    applicationUrl: "https://www.putme.fuoye.edu.ng/",
  },

  {
    id: 2,
    institution: "University of Lagos (UNILAG)",
    programme: "2026/2027 Direct Entry Screening",
    category: "University",
    status: "CLOSING SOON",
    deadline: "22 September 2026",
    description:
      "UNILAG Direct Entry registration for the 2026/2027 academic session is open for eligible candidates.",
    applicationUrl: "https://applications.unilag.edu.ng/",
  },

  {
    id: 3,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "2026/2027 Part-Time Programmes",
    category: "University",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE's official portal currently lists 2026/2027 Part-Time admission applications among its available programmes.",
    applicationUrl: "https://www.putme.fuoye.edu.ng/",
  },

  {
    id: 4,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "2026/2027 JUPEB",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE JUPEB application for the 2026/2027 academic session is currently available.",
    applicationUrl: "https://www.portal.jupeb.fuoye.edu.ng/",
  },

  {
    id: 5,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "2026/2027 Pre-Degree",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE's official admission portal currently lists the 2026/2027 Pre-Degree programme as open.",
    applicationUrl: "https://www.putme.fuoye.edu.ng/",
  },

  {
    id: 6,
    institution: "Nigerian Army University Biu (NAUB)",
    programme: "2026/2027 IJMB",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "NAUB is currently advertising its 2026/2027 IJMB application opportunity.",
    applicationUrl: "https://naub.edu.ng/",
  },

  {
    id: 7,
    institution: "Nigerian Army University Biu (NAUB)",
    programme: "2026/2027 Diploma Programmes",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "NAUB is currently advertising 2026/2027 Diploma admission opportunities.",
    applicationUrl: "https://naub.edu.ng/",
  },

  {
    id: 8,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "2026/2027 Distance Learning",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE's official CASAPS portal currently lists Distance Learning among its open 2026/2027 applications.",
    applicationUrl: "https://www.putme.fuoye.edu.ng/",
  },

  {
    id: 9,
    institution: "Federal University Oye-Ekiti (FUOYE)",
    programme: "2026/2027 Sandwich & Affiliate Programmes",
    category: "Other",
    status: "OPEN",
    deadline: "Check official portal",
    description:
      "FUOYE's official portal currently lists Sandwich and Affiliate programmes for the 2026/2027 academic session.",
    applicationUrl: "https://www.putme.fuoye.edu.ng/",
  },
];