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
    url: "https://ibass.jamb.gov.ng/static/media/administration2.761d70e6bc1b9835cf46.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "AGRICULTURE",
    url: "https://ibass.jamb.gov.ng/static/media/agriculture2.cf5b628bd6858860b511.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "ARTS/HUMANITIES",
    url: "https://ibass.jamb.gov.ng/static/media/arts2.516c8989c3c4d5645ecf.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "EDUCATION",
    url: "https://ibass.jamb.gov.ng/static/media/education2.c7464d956aa589cb499a.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "ENGINEERING/ENVIRONMENTAL/TECHNOLOGY",
    url: "https://ibass.jamb.gov.ng/static/media/engineering2.a81443bb885b5e602704.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "LAW",
    url: "https://ibass.jamb.gov.ng/static/media/law2.b9d2b9a1d45cec78c1f3.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "MEDICAL/PHARMACEUTICAL/HEALTH SCIENCES",
    url: "https://ibass.jamb.gov.ng/static/media/medical2.405f991c7ddd53f4c45b.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "SCIENCES",
    url: "https://ibass.jamb.gov.ng/static/media/sciences2.bad9ac2971d976b5becc.pdf",
    purpose: "baseline-and-waivers",
  },
  {
    faculty: "SOCIAL SCIENCES",
    url: "https://ibass.jamb.gov.ng/static/media/social2.e60f8b472d5ce2c89edc.pdf",
    purpose: "baseline-and-waivers",
  },
];

export const getIbassOfficialBrochure = (faculty: string) =>
  ibassOfficialBrochures.find((item) => item.faculty === faculty.trim().toUpperCase());
