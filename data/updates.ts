export type Update = {
  id: number;
  category: string;
  institution: string;
  title: string;
  date: string;
  summary: string;
  details: string;
  jamb?: boolean;
  isOpportunity?: boolean;
  opportunityCategory?: string;
  opportunityProgramme?: string;
  opportunityStatus?: string;
  opportunityDeadline?: string;
  deadline?: string;
  sourceUrl?: string;
  source?: string;
};

export type Opportunity = {
  institution: string;
  programme: string;
  category: string;
  status: string;
  deadline: string;
  description: string;
};

export const opportunities: Opportunity[] = [
  {
    institution: "FUOYE",
    programme: "Post UTME / Undergraduate Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal University Oye-Ekiti admission information for the 2026/2027 academic session.",
  },
  {
    institution: "UNILAG",
    programme: "Direct Entry Screening",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "University of Lagos Direct Entry screening information for the 2026/2027 academic session.",
  },
  {
    institution: "FUOTUOKE",
    programme: "Post UTME / Undergraduate Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal University Otuoke Post UTME admission opportunity for 2026/2027.",
  },
  {
    institution: "FUOTUOKE",
    programme: "Part-Time Degree Admission",
    category: "Universities",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Part-Time degree admission opportunity for the 2026/2027 academic session.",
  },
  {
    institution: "FEDPONAM",
    programme: "ND Post UTME Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Kaura-Namoda ND admission opportunity for 2026/2027.",
  },
  {
    institution: "FEDPONAM",
    programme: "HND Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Kaura-Namoda HND admission opportunity for 2026/2027.",
  },
  {
    institution: "BIDAPOLY",
    programme: "ND Full-Time Admission",
    category: "Polytechnics",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal Polytechnic Bida admission information for ND Full-Time applicants.",
  },
  {
    institution: "FCE Iwo",
    programme: "NCE Post UTME",
    category: "Colleges",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Federal College of Education Iwo NCE admission opportunity for 2026/2027.",
  },
  {
    institution: "NAUB",
    programme: "IJMB Admission",
    category: "Other",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Nigerian Army University Biu IJMB admission opportunity for 2026/2027.",
  },
  {
    institution: "NAUB",
    programme: "Diploma Admission",
    category: "Other",
    status: "OPEN",
    deadline: "Check latest deadline",
    description:
      "Nigerian Army University Biu Diploma admission opportunity for 2026/2027.",
  },

];

export const updates: Update[] = [
  {
    id: 14,
    category: "JAMB",
    institution: "JAMB / NBTE",
    title:
      "𝐅𝐞𝐝 𝐆𝐨𝐯𝐭 𝐀𝐩𝐩𝐫𝐨𝐯𝐞𝐬 𝐓𝐚𝐤𝐞𝐨𝐯𝐞𝐫 𝐎𝐟 𝐇𝐍𝐃 𝐀𝐝𝐦𝐢𝐬𝐬𝐢𝐨𝐧𝐬 𝐁𝐲 𝐉𝐀𝐌𝐁",
    date: "13 September 2026",
    summary:
      "The federal government has approved the takeover of Higher National Diploma admissions by the Joint Admissions and Matriculation Board (JAMB), with all HND admissions to be processed through JAMB from the current admission session.",
    details:
      "The federal government has approved the takeover of Higher National Diploma admissions by the Joint Admissions and Matriculation Board (JAMB).\n\nThe move is aimed at ending illegal and compromised admissions in polytechnics and other institutions offering HND programmes.\n\nThe National Board for Technical Education (NBTE), disclosed this in a circular dated September 9, 2026 signed by its executive secretary, Prof Idris Bugaje, which was obtained by LEADERSHIP Weekend yesterday.\n\nThe circular followed a meeting between the Minister of Education, Dr Tunji Alausa, and key stakeholders, including JAMB, the National Youth Service Corps, NBTE and the Federal Ministry of Education.\n\nUnder the new arrangement, all HND admissions across institutions are to be processed through JAMB from the current admission session.\n\nAccording to NBTE, the centralised system is intended to address irregularities in the admission process and prevent situations where students with questionable admissions are later denied mobilisation for the NYSC after completing their HND programmes.\n\nThe board said, “All HND admissions in all institutions shall from this session be taken over by JAMB to provide centralised process and avoid illegal and compromised admissions, jeopardising students’ mobilisation for NYSC after HND.”\n\nIt added that the Federal Ministry of Education would issue a detailed statement on the new arrangement next week.\n\nNBTE also said it would immediately develop comprehensive HND admission guidelines and submit them to JAMB to guide the digital admission platform.\n\n“The decisions taken and approved by the Hon Minister for immediate implementation are as follows: All HND admissions in all Institutions shall from this session be taken over by JAMB to provide centralised process and avoid illegal and compromised admissions, jeopardising students mobilisation for NYSC after HND. The FME shall issue a statement on this next week with further details,” the circular stated.\n\nThe guidelines, according to the board, will address issues including the required waiting period for National Diploma holders before proceeding to HND, as well as exemptions for certain ND health-related programmes.\n\nThe board also announced a new ceiling for part-time National Diploma admissions, following the decision to bring all part-time ND admissions under JAMB.\n\nIt said the proportion of part-time students would now be limited to 50 per cent of an institution’s approved full-time admission quota.\n\n“Now that all part-time ND admissions are under the JAMB, the proportion of part-time students is pegged at 50 per cent of the approved full-time quota,” the circular stated.\n\nThe federal government also reaffirmed an earlier NBTE directive concerning holders of combined NCE and HND qualifications and their eligibility for NYSC mobilisation.\n\nNBTE had, in a circular issued on September 7, prohibited the presentation of candidates with an NCE/HND combination for NYSC mobilisation.",
    jamb: true,
  },
  {
    id: 13,
    category: "Admission",
    institution: "LASU",
    title:
      "LAGOS STATE UNIVERSITY ANNOUNCE ONLINE ADMISSION SCREENING EXERCISE FOR DIRECT ENTRY CANDIDATES",
    date: "12 September 2026",
    isOpportunity: true,
    opportunityCategory: "Universities",
    opportunityProgramme: "2026/2027 Direct Entry Admission Screening",
    opportunityStatus: "OPEN",
    opportunityDeadline: "26 September 2026, 12 midnight",
    summary:
      "Lagos State University has announced the 2026/2027 Online Admission Screening Exercise for Direct Entry candidates. The screening is mandatory for eligible candidates seeking admission into LASU through Direct Entry.",
    details:
      "Applications are invited from suitably qualified candidates for the Lagos State University 2026/2027 Admission Screening Exercise for Regular Students seeking admission via Direct Entry. The online screening exercise is mandatory for entry into Lagos State University.\n\nELIGIBILITY FOR SCREENING\n\nAll Direct Entry candidates, including LASU Foundation (JUPEB), who wish to be considered for admission into Lagos State University for the 2026/2027 Academic Session must have obtained the Direct Entry Form from JAMB and chosen Lagos State University as their first choice institution. Only the LASU Diploma is acceptable for Direct Entry admission, except NCE into Faculty of Education programmes.\n\nCandidates of Lagos State origin, for 100 and 200 levels, who have proven their claims before the Independent Indigeneship Verification Committee (IIVC) will have their claims automatically validated in the Online Admission Screening Exercise.\n\nNOTE TO ALL DIRECT ENTRY CANDIDATES\n\nAll Direct Entry candidates are expected to immediately submit a copy each of the online Admission Screening Report and the notification of Diploma (LASU Diploma)/NCE Result at the Admission Annex/Liaison Office, Room 7, Administrative Block II.\n\nMETHOD OF APPLICATION\n\nProspective candidates should visit the LASU website, point to Student and click New Applicants, then UTME/DE Screening. Click DE CANDIDATE LOGIN, enter your UTME Registration Number and surname, submit, and proceed to make payment for Admission Screening. After successful payment, return to the dashboard and click Start Admission Screening. Supply the required information and Transaction ID, then continue with the self-screening process.\n\nO'LEVEL REQUIREMENTS\n\nCandidates must possess five O'Level credit passes in subjects relevant to their desired course of study at not more than two sittings, except Medicine and Dentistry which require only one sitting. Engineering candidates using two sittings must possess six O'Level credit passes including Mathematics, Physics, Chemistry, English Language, two other science subjects and any other subject. Aeronautic and Astronautic Engineering requires a credit pass in Further Mathematics. A credit pass in English Language is compulsory for admission into all courses in Lagos State University.\n\nCandidates must ensure they upload their O'Level results on JAMB CAPS before the closure of the Admission Screening Exercise. Any examination taken after July 2026 is not acceptable.\n\nSCREENING GRADING\n\nScreening will be based on the Point Grading System using the UTME score and SSCE or equivalent grades in five best relevant subjects for the candidate's choice of course. Candidates are advised to study the O'Level subject requirements for their course of choice before participating in the online screening.\n\nAPPLICATION PERIOD\n\nPayment and registration/updating will last for two weeks, from 12 September 2026 until 26 September 2026 at 12 midnight.\n\nAll Online Screening complaints should be directed to screeningsupport@lasu.edu.ng.",
  },
  {
    id: 1,
    category: "Admission List",
    institution: "AFUED",
    title:
      "AFUED Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Adeyemi Federal University of Education, Ondo has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to Adeyemi Federal University of Education should check their admission status and follow the institution's instructions for the next stage of the admission process.",
  },
  {
    id: 2,
    category: "Admission List",
    institution: "UNIMED",
    title:
      "UNIMED Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "University of Medical Sciences, Ondo has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to UNIMED should monitor their admission status and complete any required steps once their admission is available.",
  },
  {
    id: 3,
    category: "Admission List",
    institution: "ZAMSUT",
    title:
      "ZAMSUT Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Zamfara State University has released admission information for the 2026/2027 academic session.",
    details:
      "Applicants should check their admission status and follow the university's instructions regarding acceptance and registration.",
  },
  {
    id: 4,
    category: "Admission List",
    institution: "SSU",
    title:
      "SSU Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Sokoto State University has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates who applied to SSU should check their admission status and proceed with the necessary admission steps where applicable.",
  },
  {
    id: 5,
    category: "Admission List",
    institution: "FUOYE",
    title:
      "FUOYE Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Federal University Oye-Ekiti has released admission information for the 2026/2027 academic session.",
    details:
      "Candidates should monitor their admission status and follow the university's instructions for acceptance and registration.",
  },
  {
    id: 6,
    category: "Admission",
    institution: "BIDAPOLY",
    title:
      "BIDAPOLY Admission List for 2026/2027 ND Full-Time Applicants",
    date: "11 September 2026",
    summary:
      "Federal Polytechnic Bida has released admission information for ND Full-Time applicants.",
    details:
      "Applicants should check their admission status and follow the institution's instructions for the next stage of the admission process.",
  },
  {
    id: 7,
    category: "Admission",
    institution: "FCE Iwo",
    title:
      "FCE Iwo Post UTME Form for 2026/2027 NCE Admission",
    date: "11 September 2026",
    summary:
      "Federal College of Education, Iwo has announced its NCE Post UTME admission opportunity for 2026/2027.",
    details:
      "Interested candidates should confirm eligibility and application requirements before proceeding with registration.",
  },
  {
    id: 8,
    category: "Admission",
    institution: "UNILAG",
    title:
      "UNILAG Direct Entry Screening Form for 2026/2027",
    date: "11 September 2026",
    summary:
      "University of Lagos has released information regarding its Direct Entry screening exercise.",
    details:
      "Eligible Direct Entry candidates should review the requirements and complete the necessary screening process.",
  },
  {
    id: 9,
    category: "Admission",
    institution: "FEDPONAM",
    title:
      "FEDPONAM HND Admission Form for 2026/2027",
    date: "11 September 2026",
    summary:
      "Federal Polytechnic Kaura-Namoda has announced HND admission information for the 2026/2027 academic session.",
    details:
      "Prospective HND applicants should confirm the available programmes, requirements and application procedure.",
  },
  {
    id: 10,
    category: "Admission",
    institution: "FUOTUOKE",
    title:
      "FUOTUOKE Post UTME Form for 2026/2027 Undergraduate Admission",
    date: "11 September 2026",
    summary:
      "Federal University Otuoke has released Post UTME admission information for the 2026/2027 session.",
    details:
      "Interested candidates should verify eligibility and application requirements before proceeding.",
  },
  {
    id: 11,
    category: "Admission",
    institution: "SAZU",
    title:
      "SAZU Admission List for 2026/2027 Academic Session",
    date: "11 September 2026",
    summary:
      "Sa'adu Zungur University has released updated admission information covering multiple batches.",
    details:
      "Candidates should check their admission status and follow the university's instructions for the next stage.",
  },
  {
    id: 12,
    category: "JAMB",
    institution: "JAMB",
    title: "New JAMB Admission Status Update",
    date: "Latest Update",
    summary:
      "JAMB admission status may now show PROPOSED, RECOMMENDED or APPROVED during the admission process.",
    details:
      "JAMB has updated the admission status portal, and candidates may now see PROPOSED, RECOMMENDED or APPROVED during the admission process.",
    jamb: true,
  },

];
