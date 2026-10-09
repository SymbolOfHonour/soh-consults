export type InstitutionRecord={key:string;name:string;aliases:string[];officialDomains:string[];sourceUrls?:string[]};
export const INSTITUTIONS:InstitutionRecord[]=[
 {key:"unilorin",name:"University of Ilorin",aliases:["unilorin","university of ilorin","university of ilorin kwara"],officialDomains:["unilorin.edu.ng"]},
 {key:"lasu",name:"Lagos State University",aliases:["lasu","lagos state university"],officialDomains:["lasu.edu.ng","lidc.lasu.edu.ng","services.lidc.lasu.edu.ng"],sourceUrls:["https://lasu.edu.ng/home/news/","https://services.lidc.lasu.edu.ng/admissionscreening/"]},
 {key:"futa",name:"Federal University of Technology Akure",aliases:["futa","federal university of technology akure","federal university of technology, akure"],officialDomains:["futa.edu.ng","admission.futa.edu.ng"]},
 {key:"oau",name:"Obafemi Awolowo University",aliases:["oau","obafemi awolowo university"],officialDomains:["oauife.edu.ng","eportal.oauife.edu.ng"]},
 {key:"fuoye",name:"Federal University Oye-Ekiti",aliases:["fuoye","federal university oye ekiti","federal university oye-ekiti"],officialDomains:["fuoye.edu.ng"],sourceUrls:["https://putme.fuoye.edu.ng/utme/","https://news.fuoye.edu.ng/"]},
 {key:"lasustech",name:"Lagos State University of Science and Technology",aliases:["lasustech","lagos state university of science and technology"],officialDomains:["lasustech.edu.ng","admission.lasustech.edu.ng"]},
 {key:"uniosun",name:"Osun State University",aliases:["uniosun","osun state university"],officialDomains:["uniosun.edu.ng"],sourceUrls:["https://admissions.uniosun.edu.ng/"]},
 {key:"oou",name:"Olabisi Onabanjo University",aliases:["oou","olabisi onabanjo university"],officialDomains:["oouagoiwoye.edu.ng"]},
 {key:"lasued",name:"Lagos State University of Education",aliases:["lasued","lagos state university of education"],officialDomains:["lasued.edu.ng"]},
 {key:"yabatech",name:"Yaba College of Technology",aliases:["yabatech","yaba college of technology"],officialDomains:["yabatech.edu.ng"]},
 {key:"jamb",name:"Joint Admissions and Matriculation Board",aliases:["jamb","joint admissions and matriculation board"],officialDomains:["jamb.gov.ng"]},
 {key:"waec",name:"West African Examinations Council",aliases:["waec","west african examinations council"],officialDomains:["waec.org","waecnigeria.org","waecdirect.org"]},
 {key:"neco",name:"National Examinations Council",aliases:["neco","national examinations council"],officialDomains:["neco.gov.ng"]},
 {key:"nysc",name:"National Youth Service Corps",aliases:["nysc","national youth service corps"],officialDomains:["nysc.gov.ng"]}
];
function normalizedWords(value:string){return ` ${value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim()} `;}
export function resolveInstitution(text:string){const q=normalizedWords(text);return INSTITUTIONS.find(i=>i.aliases.some(a=>q.includes(normalizedWords(a))))||null;}
export function isOfficialInstitutionUrl(url:string,institutionKey?:string|null){try{const parsed=new URL(url);if(parsed.protocol!=="https:"||parsed.username||parsed.password||(parsed.port&&parsed.port!=="443"))return false;const host=parsed.hostname.toLowerCase().replace(/^www\./,"");const candidates=institutionKey?INSTITUTIONS.filter(i=>i.key===institutionKey):INSTITUTIONS;return candidates.some(i=>i.officialDomains.some(d=>host===d||host.endsWith(`.${d}`)));}catch{return false;}}

export function allOfficialDomains(){return [...new Set(INSTITUTIONS.flatMap(i=>i.officialDomains))];}
