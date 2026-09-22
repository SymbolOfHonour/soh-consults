export type NewsSource = { name: string; url: string; baseUrl: string; official?: boolean };

/** Public discovery endpoints. Add institution-specific URLs only after checking their official domains. */
export const newsSources: NewsSource[] = [
  { name: "Myschool", url: "https://myschool.ng/news", baseUrl: "https://myschool.ng" },
  { name: "MySchoolGist", url: "https://myschoolgist.com/", baseUrl: "https://myschoolgist.com" },
  { name: "WAEC Nigeria", url: "https://www.waecnigeria.org/news", baseUrl: "https://www.waecnigeria.org", official: true },
  { name: "JAMB", url: "https://www.jamb.gov.ng/Bulletins", baseUrl: "https://www.jamb.gov.ng", official: true },
  { name: "NECO", url: "https://neco.gov.ng/", baseUrl: "https://neco.gov.ng", official: true },
  { name: "NABTEB", url: "https://nabteb.gov.ng/", baseUrl: "https://nabteb.gov.ng", official: true },
  { name: "NYSC", url: "https://nysc.gov.ng/", baseUrl: "https://nysc.gov.ng", official: true },
  { name: "LASU", url: "https://www.lasu.edu.ng/home/index.php", baseUrl: "https://www.lasu.edu.ng", official: true },
  { name: "UNILAG", url: "https://unilag.edu.ng/", baseUrl: "https://unilag.edu.ng", official: true },
  { name: "UI", url: "https://ui.edu.ng/", baseUrl: "https://ui.edu.ng", official: true },
  { name: "OAU", url: "https://oauife.edu.ng/", baseUrl: "https://oauife.edu.ng", official: true },
  { name: "UNN", url: "https://www.unn.edu.ng/", baseUrl: "https://www.unn.edu.ng", official: true },
  { name: "UNIBEN", url: "https://uniben.edu/", baseUrl: "https://uniben.edu", official: true },
  { name: "FUTA", url: "https://futa.edu.ng/", baseUrl: "https://futa.edu.ng", official: true },
  { name: "FUTO", url: "https://futo.edu.ng/", baseUrl: "https://futo.edu.ng", official: true },
  { name: "UNILORIN", url: "https://www.unilorin.edu.ng/", baseUrl: "https://www.unilorin.edu.ng", official: true },
  { name: "YABATECH", url: "https://yabatech.edu.ng/", baseUrl: "https://yabatech.edu.ng", official: true },
  { name: "Federal Polytechnic Ilaro", url: "https://federalpolyilaro.edu.ng/", baseUrl: "https://federalpolyilaro.edu.ng", official: true },
];
