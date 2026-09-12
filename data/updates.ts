export type UpdateCategory =
  | "JAMB"
  | "Admission List"
  | "Admission"
  | "School News"
  | "Deadline";

export type UpdateItem = {
  id: number;
  title: string;
  category: UpdateCategory;
  date: string;
  summary: string;
  details: string;
  deadline?: string;
  source?: string;
  sourceUrl?: string;
};

export const updates: UpdateItem[] = [
  {
    id: 1,
    title: "JAMB Admission Status Portal Update: Candidates Advised to Check CAPS Regularly",
    category: "JAMB",
    date: "12 September 2026",
    summary:
      "Candidates seeking admission for the 2026/2027 academic session should continue checking their JAMB admission status and CAPS regularly as institutions process admissions.",
    details:
      "The admission process does not end immediately after a candidate completes UTME or Post-UTME screening. Universities and other tertiary institutions continue to process candidates at different stages, and admission offers may be reflected on JAMB CAPS as schools submit their recommendations.\n\nCandidates are therefore advised to check their JAMB admission status regularly. A candidate who sees an admission offer should carefully review the programme and institution before accepting the offer. Candidates should also remember that accepting an admission offer is an important step and should not be done casually.\n\nCandidates who have not yet received an offer should not automatically conclude that they have lost their admission opportunity. Admission processing can continue in batches, depending on the institution and available spaces. It is advisable to continue checking both the institution's admission portal and JAMB CAPS for new developments.\n\nS.O.H CONSULTS advises candidates to rely on official JAMB and school portals when checking admission information and to avoid paying individuals who promise to 'upgrade' or manipulate admission status.",
    source: "JAMB",
    sourceUrl: "https://www.jamb.gov.ng/",
  },

  {
    id: 2,
    title: "FUOYE Admission Update for 2026/2027: Candidates Should Monitor Their Admission Status",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Federal University Oye-Ekiti has continued its 2026/2027 admission activities, with prospective students advised to monitor the official university and JAMB channels.",
    details:
      "Prospective students of the Federal University Oye-Ekiti should continue monitoring the university's official admission portal and JAMB CAPS for developments concerning the 2026/2027 academic session.\n\nFUOYE currently maintains official online admission portals for its various programmes, while the university has also published information relating to its 2026/2027 admission processes. Candidates should therefore avoid relying solely on unofficial screenshots or social media posts when making decisions about their applications.\n\nCandidates who applied for undergraduate admission should ensure that their JAMB details, O'Level information and other required records are correctly reflected where applicable. Those who receive admission should carefully follow the university's instructions for acceptance and subsequent registration.\n\nApplicants who have not yet received admission should continue checking both platforms because admission may be processed in stages. Candidates should also pay attention to any new instructions released by the university.\n\nFor candidates who are unsure about what to do after receiving an offer, S.O.H CONSULTS can provide guidance on the next steps.",
    source: "Federal University Oye-Ekiti",
    sourceUrl: "https://putme.fuoye.edu.ng/",
  },

  {
    id: 3,
    title: "UNIMED Admission Update: Candidates Should Check Official Channels for 2026/2027 Information",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "The University of Medical Sciences, Ondo has continued releasing important admission-related information for prospective students.",
    details:
      "Prospective candidates of the University of Medical Sciences, Ondo should regularly monitor the institution's official website and admission channels for information concerning the 2026/2027 academic session.\n\nUNIMED's official website currently carries admission-related notices, including information concerning offers of admission and payment of fees. This means candidates who have applied should pay attention to official announcements rather than depending entirely on third-party platforms.\n\nCandidates who receive an admission offer should read the instructions carefully and take note of any required payments, documentation and registration procedures. Candidates should also be cautious of fraudulent messages claiming to represent the university.\n\nThose who are still waiting for admission should continue checking their status and ensure that their contact and application information remains accessible. Admission processes can involve different stages, and an applicant should not assume that the absence of an immediate offer means the process is over.\n\nS.O.H CONSULTS encourages applicants to verify every admission message through official UNIMED and JAMB channels before making payments.",
    source: "University of Medical Sciences, Ondo",
    sourceUrl: "https://www.unimed.edu.ng/",
  },

  {
    id: 4,
    title: "ZAMSUT Admission List Update for 2026/2027 Academic Session",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Zamfara State University has released an admission list update, giving prospective students another opportunity to confirm their admission status.",
    details:
      "Candidates who applied to Zamfara State University, Talata-Mafara should check the institution's official admission channels and JAMB CAPS for the latest information concerning the 2026/2027 academic session.\n\nAdmission lists may be released in batches, meaning that candidates who do not find their names immediately should continue checking for subsequent updates. Candidates should also ensure that they are checking with the correct application details and using official platforms.\n\nCandidates who receive an admission offer should carefully review the programme offered and follow the university's instructions for acceptance, clearance and registration. Any deadline attached to acceptance or payment should also be taken seriously.\n\nApplicants who are yet to receive an offer are advised to remain patient while continuing to monitor their admission status. They should also avoid paying unofficial agents who claim to have access to admission lists before they are officially released.\n\nS.O.H CONSULTS remains available to guide candidates who need help understanding their admission status or the next steps after admission.",
    source: "Zamfara State University",
  },

  {
    id: 5,
    title: "SSU Admission List Update for 2026/2027: Applicants Advised to Check Status",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Sokoto State University has released an admission update for prospective students applying for the 2026/2027 academic session.",
    details:
      "Applicants who selected Sokoto State University should continue checking the university's admission channels and JAMB CAPS for updates concerning their application.\n\nAdmission processing can take place in different batches, so candidates should not rely on a single check. If an applicant does not find an admission offer immediately, it is advisable to check again at intervals and monitor official announcements from the institution.\n\nCandidates who have been offered admission should confirm the details of the offer and follow the university's instructions concerning acceptance and registration. It is important to keep copies of relevant application documents and payment receipts throughout the process.\n\nCandidates should also be careful when receiving admission-related messages from unofficial sources. No candidate should make payments to a personal account simply because someone claims to have secured admission on their behalf.\n\nFor assistance with checking admission status, acceptance procedures or other admission-related steps, candidates can contact S.O.H CONSULTS for guidance.",
    source: "Sokoto State University",
  },

  {
    id: 6,
    title: "FUOYE Admission List Update: What Prospective Students Should Do Next",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Candidates who applied to FUOYE should continue monitoring both the university's admission platform and JAMB CAPS for their admission outcome.",
    details:
      "The Federal University Oye-Ekiti remains one of the institutions currently processing admissions for the 2026/2027 academic session. Prospective students should therefore remain attentive to admission notifications from the university and JAMB.\n\nOnce a candidate receives an admission offer, the next step is to verify the offer carefully. Candidates should confirm that the institution and programme displayed correspond with their application and then follow the official instructions for accepting the offer.\n\nAfter acceptance, candidates may need to proceed with acceptance fees, screening, clearance, medical requirements and other registration procedures depending on the instructions released by the university. Missing an important deadline can create unnecessary problems, so candidates should keep track of every stage.\n\nCandidates who have not yet been admitted should continue checking their status. Admission lists can be released in batches, and the absence of an offer during one check does not necessarily mean that the admission process has ended.\n\nAlways use the official FUOYE portal and JAMB CAPS when confirming admission information.",
    source: "Federal University Oye-Ekiti",
    sourceUrl: "https://putme.fuoye.edu.ng/",
  },

  {
    id: 7,
    title: "BIDAPOLY Admission List Update for 2026/2027 ND Full-Time Applicants",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Federal Polytechnic Bida has released an admission list update for candidates seeking ND Full-Time admission.",
    details:
      "Candidates who applied for National Diploma Full-Time admission at the Federal Polytechnic Bida should monitor the institution's admission channels for their admission outcome.\n\nApplicants who receive admission should carefully follow the instructions provided by the Polytechnic regarding acceptance and registration. It is important to complete each required step within the specified period and retain evidence of payments and submitted documents.\n\nCandidates should also check their JAMB CAPS where applicable because admission processing involves the institution and JAMB. A candidate should not treat a message from an unofficial source as final confirmation of admission.\n\nThose who have not yet received an offer should continue checking for additional batches or subsequent announcements from the institution. Candidates should also ensure that they have access to the phone number, email and application details used during registration.\n\nS.O.H CONSULTS can assist candidates who need help understanding their admission status and the next steps after receiving an offer.",
    source: "Federal Polytechnic Bida",
  },

  {
    id: 8,
    title: "FCE Iwo Post-UTME: 2026/2027 NCE Admission Information for Prospective Candidates",
    category: "Admission",
    date: "12 September 2026",
    summary:
      "Federal College of Education, Iwo has opened its 2026/2027 NCE admission process for eligible candidates.",
    details:
      "Prospective candidates seeking admission into Federal College of Education, Iwo should pay attention to the institution's Post-UTME admission process for the 2026/2027 academic session.\n\nBefore applying, candidates should carefully review the eligibility requirements, available programmes and documentation required by the institution. Applicants should ensure that the information supplied during registration is accurate because errors in names, examination details or other personal information can create problems later in the admission process.\n\nCandidates should also keep their application details and evidence of payment safe after completing registration. Any screening instructions or dates released by the institution should be followed carefully.\n\nApplicants are encouraged to use the official application channel rather than relying on third parties who may provide incorrect information. Candidates who are unsure whether they qualify or need help completing the process can seek professional guidance before making payment.\n\nS.O.H CONSULTS can assist prospective students with understanding the application process and preparing the required information.",
    source: "Federal College of Education, Iwo",
  },

  {
    id: 9,
    title: "UNILAG Direct Entry Screening Form 2026/2027: Registration Now Open",
    category: "Admission",
    date: "12 September 2026",
    summary:
      "The University of Lagos has opened its 2026/2027 Direct Entry screening registration for eligible candidates.",
    details:
      "The University of Lagos has commenced its Direct Entry screening process for candidates seeking admission through the Direct Entry route for the 2026/2027 academic session.\n\nCurrent information indicates that the registration window runs from 9 September to 22 September 2026. Candidates who intend to participate should not wait until the final day before beginning their application, as technical issues or incomplete information can delay submission.\n\nDirect Entry applicants should carefully review the university's requirements and ensure that the qualification they are presenting is acceptable for their intended programme. Candidates should also provide accurate JAMB and academic information during registration.\n\nAfter completing the application, candidates should retain their registration details and monitor the official UNILAG admission channels for subsequent screening instructions or announcements.\n\nBecause admission requirements can vary by programme, candidates should verify their specific eligibility before making payment or submitting an application.\n\nS.O.H CONSULTS can assist candidates who need help understanding the Direct Entry process or preparing for the application.",
    deadline: "22 September 2026",
    source: "University of Lagos",
    sourceUrl: "https://applications.unilag.edu.ng/",
  },

  {
    id: 10,
    title: "FEDPONAM HND Admission Form 2026/2027: Application Information",
    category: "Admission",
    date: "12 September 2026",
    summary:
      "Federal Polytechnic Kaura-Namoda has announced its HND admission opportunity for the 2026/2027 academic session.",
    details:
      "Federal Polytechnic Kaura-Namoda is currently offering an HND admission opportunity for suitably qualified candidates for the 2026/2027 academic session.\n\nProspective applicants should first confirm that they meet the academic requirements for their chosen programme before beginning the application. Candidates should also ensure that their supporting documents are available and that the information entered during registration matches their academic records.\n\nApplicants are advised to complete the process through the appropriate official channel and retain evidence of successful registration and payment. Where the institution provides additional screening or documentation instructions, candidates should follow them carefully.\n\nCandidates should also pay attention to the application deadline. Waiting until the final hours of an application period can expose applicants to avoidable technical or payment problems.\n\nAnyone who is unsure about programme eligibility or the documentation required can seek guidance before submitting the application.",
    source: "Federal Polytechnic Kaura-Namoda",
  },

  {
    id: 11,
    title: "FUOTUOKE Post-UTME/DE 2026/2027: Application Deadline Set for 30 September",
    category: "Deadline",
    date: "12 September 2026",
    summary:
      "Federal University Otuoke's 2026/2027 Post-UTME and Direct Entry application is ongoing, with the current deadline set for 30 September 2026.",
    details:
      "The Federal University Otuoke has opened its Post-UTME and Direct Entry screening application for candidates seeking admission for the 2026/2027 academic session.\n\nCurrent application information states that eligible candidates can apply through the university's admission portal. Candidates should carefully review the eligibility requirements before starting the application and ensure that their personal, JAMB and academic details are correctly entered.\n\nThe current deadline for submission is 30 September 2026. Applicants are strongly advised to complete their applications early rather than waiting until the deadline, especially where payment, portal access or document-upload issues could affect submission.\n\nCandidates should print or save their application confirmation and any relevant screening documentation after completing the process. The screening date and other instructions may be communicated through the university's official channels.\n\nApplicants who need help understanding their eligibility, completing registration or preparing for the next stage can contact S.O.H CONSULTS for guidance.",
    deadline: "30 September 2026",
    source: "Federal University Otuoke",
    sourceUrl:
      "https://fuotuoke.edu.ng/post-utme-screening-of-candidates-for-admission-into-the-federal-university-otuoke-for-the-2026-2027-academic-session/",
  },

  {
    id: 12,
    title: "SAZU Admission List 2026/2027: Multiple Batches Released",
    category: "Admission List",
    date: "12 September 2026",
    summary:
      "Sa'adu Zungur University has released multiple admission list updates for candidates seeking admission for the 2026/2027 academic session.",
    details:
      "Candidates who applied to Sa'adu Zungur University should check the latest admission information released by the institution and confirm their status through the appropriate official channels.\n\nThe release of multiple batches means that candidates should continue monitoring their admission status even if they were not included in an earlier batch. Admission processing can continue as institutions review applications and allocate available spaces.\n\nCandidates who receive an offer should carefully follow the university's instructions concerning acceptance, payments, documentation and registration. They should also keep evidence of every payment and submitted document for future reference.\n\nCandidates who are still waiting should remain patient but proactive. Regularly checking the institution's admission portal and JAMB CAPS is preferable to relying on unofficial messages or agents claiming to have privileged access to admission decisions.\n\nS.O.H CONSULTS can help applicants understand their admission status and identify the appropriate next steps after an admission offer.",
    source: "Sa'adu Zungur University",
  },
];