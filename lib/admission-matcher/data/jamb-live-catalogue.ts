import type { ProgrammeRequirement } from "../types";

// Live institution catalogue and individual View Details tables checked 2026-10-01.
// IBASS shows general programme requirements here, without all institutional waivers.
const E = "English Language", M = "Mathematics", P = "Physics", C = "Chemistry", B = "Biology", A = "Agricultural Science", Ec = "Economics", G = "Government", Ge = "Geography";
const g = (subjects: string[], count = 1) => ({ subjects, count });
const arts = [G, "History", Ge, "Literature in English", "French", "Christian Religious Knowledge", "Islamic Religious Knowledge", Ec, "Commerce", "Financial Accounting"];
const sciences = [P,C,B,A,"Further Mathematics","Computer Studies",Ge];
const source = { label: "JAMB IBASS live UNIOSUN programme catalogue and View Details tables", url: "https://ibass.jamb.gov.ng/brochure-courses?id=798&school=OSUN+STATE+UNIVERSITY%2C+OSOGBO%2C+OSUN+STATE", session: "Live IBASS catalogue, session not specified", lastVerified: "2026-10-01", scope: "Programme availability and general JAMB subject rules, institutional waivers not displayed" };
const screeningSource = { label: "UNIOSUN 2026/2027 Post-UTME Screening Notice", url: "https://uniosun.edu.ng/news/2026-2027-admissions-exercise-post-utme-screening/", session: "2026/2027", lastVerified: "2026-10-01", scope: "First-choice requirement, 160 general screening floor, 200 floor for Law/Nursing/Common and Islamic Law, five relevant credits, and maximum sitting rules" };
function row(programme: string, requiredUtmeSubjects: string[], requiredOlevelCredits: string[], utmeGroups: ProgrammeRequirement["utmeGroups"] = [], olevelGroups: ProgrammeRequirement["olevelGroups"] = [], aliases: string[] = [], options: {minimumUtmeScore?: number; maximumSittings?: 1|2} = {}): ProgrammeRequirement {
  return { institutionId: "uniosun", institutionName: "Osun State University (UNIOSUN)", institutionType: "state-university", institutionAliases: ["UNIOSUN"], programme, aliases, requiredUtmeSubjects, requiredOlevelCredits, utmeGroups, olevelGroups, minimumUtmeScore: options.minimumUtmeScore ?? 160, scoreScope: "institution-screening", firstChoiceRequired: true, maximumSittings: options.maximumSittings ?? 2, minimumOlevelCreditCount: 5, verificationStatus: "review", unresolvedChecks: ["utme", "olevel"], reviewReasons: ["UNIOSUN's 2026/2027 screening baseline is verified, but the live IBASS table supplies general JAMB subject rules and does not expose every current UNIOSUN programme waiver. Subject eligibility therefore remains review-only until each programme is reconciled with an authoritative institutional rule."], sources: [{...source, locator: programme + " View Details"}, screeningSource], notes: ["SSCE UTME entry only. NBC/NTC, Direct Entry and subject-specialisation provisions need separate verification.", "The stored screening score is an application/screening floor, not a guarantee of admission."] };
}
export const jambLiveCatalogueRequirements: ProgrammeRequirement[] = [
  row("Accounting",[M,Ec],[E,M,Ec],[g(arts)],[],["Accountancy"]),
  row("Banking and Finance",[M,Ec],[E,M],[g([G,Ge])]),
  row("Business Administration",[M,Ec],[E,M,Ec],[g([...arts,...sciences])],[g(["Financial Accounting","Business Methods","Commerce",G,Ge,"Statistics"],2)]),
  row("Law",[],[E,"Literature in English",M],[g(arts,3)],[],[],{minimumUtmeScore:200,maximumSittings:1}),
  row("Building",[M,P,C],[M,E,P,C],[],[g([Ge,Ec,"Fine Arts","Technical Drawing"])]),
  ...["Anatomy","Public Health Technology","Physiology"].map(name => row(name,[B,C,P],[E,M,B,C,P])),
  row("Nursing",[B,C,P],[E,M,B,C,P],[],[],["Nursing Science"],{minimumUtmeScore:200,maximumSittings:1}),
  // Medicine is explicitly put on hold for the 2026/2027 admission exercise by UNIOSUN.
  // It must not appear as an assessed active option merely because it exists in IBASS.
  row("Civil Engineering",[P,C,M],[P,C,M,E],[],[g(sciences)]),
  row("Economics",[Ec,M],[E,M,Ec],[g([G,"History",Ge,"Literature in English","French","Christian Religious Knowledge","Islamic Religious Knowledge"])],[g(arts,2)]),
  row("Fisheries and Aquaculture",[C],[C,M,E],[g([B,A]),g(sciences)],[g([B,A]),g(sciences)]),
  row("Agricultural Economics",[C],[E,M,C],[g([B,A]),g([M,P])],[g([B,A]),g([Ge,P,Ec])]),
  row("Vocational and Technical Education",[],[E,M,"Technical Drawing",P]),
  row("Chemistry Education",[C],[M,C,E],[g([P,B,M],2)],[g([P,B,A],2)],["Education and Chemistry"]),
  row("Geography",[Ge],[E,Ge],[g(arts,2)],[g(arts,3)]),
  row("Biochemistry",[B,C],[E,C,M,P,B],[g([P,M])]),
  row("Mathematics and Education Technology",[M,P],[E,M],[g(sciences)],[g(sciences,3)]),
];
