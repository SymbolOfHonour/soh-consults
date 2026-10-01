export type AdmissionSource = {
  id: string;
  authority: "JAMB" | "INSTITUTION";
  title: string;
  url: string;
  scope: string;
  session?: string;
};

/**
 * Primary-source registry for Admission Matcher research.
 * Adding a source here does not by itself verify a programme record.
 */
export const admissionSourceRegistry: AdmissionSource[] = [
  {
    id: "jamb-ibass-eligibility",
    authority: "JAMB",
    title: "JAMB IBASS Eligibility Checker",
    url: "https://eligibility.jamb.gov.ng/",
    scope: "Programme availability, O'Level selection and UTME subject combination eligibility",
  },
  {
    id: "jamb-2026-training-manual",
    authority: "JAMB",
    title: "JAMB 2026 UTME Training Manual",
    url: "https://www.jamb.gov.ng/PDFs/2026/2026%20TRAINING%20MANUAL%20%20final.pdf",
    scope: "2026 general entry requirements and IBASS guidance",
    session: "2026",
  },
];
