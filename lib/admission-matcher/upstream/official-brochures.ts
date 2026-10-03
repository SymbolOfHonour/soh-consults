export type IbassOfficialBrochure = {
  faculty: string;
  url: string;
  purpose: "baseline-and-waivers";
};

/**
 * Official JAMB IBASS brochure evidence is used as a stable, public evidence
 * layer alongside browser-observed Eligibility Checker parity cases. These
 * documents can establish baseline requirements and institution-specific
 * special-consideration/waiver text without making the undocumented checker
 * XHR a production dependency.
 *
 * Coverage is intentionally reconciled with IBASS's institution catalogue:
 * programme-family PDFs are evidence sources, not proof that every listed
 * programme is offered by every institution.
 */
export const ibassOfficialBrochures: IbassOfficialBrochure[] = [
  {
    faculty: "ADMINISTRATION",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-admin.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "AGRICULTURE",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-agriculture.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "ARTS/HUMANITIES",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-arts.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "EDUCATION",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-education.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "ENGINEERING/ENVIRONMENTAL/TECHNOLOGY",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-engineering.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "LAW",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-law.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "SCIENCES",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-sciences.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "SOCIAL SCIENCES",
    url: "https://ibass.jamb.gov.ng/assets/uploads/brochure-degree-social-sciences.pdf",
    purpose: "baseline-and-waivers",
  },
];

export const getIbassOfficialBrochure = (faculty: string) =>
  ibassOfficialBrochures.find((item) => item.faculty === faculty.trim().toUpperCase());
