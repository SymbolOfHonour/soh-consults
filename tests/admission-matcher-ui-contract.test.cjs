const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const client = fs.readFileSync(path.join(root, "app/admission-matcher/MatcherClient.tsx"), "utf8");
const page = fs.readFileSync(path.join(root, "app/admission-matcher/page.tsx"), "utf8");
const index = fs.readFileSync(path.join(root, "lib/admission-matcher/data/index.ts"), "utf8");
const accounting = fs.readFileSync(path.join(root, "lib/admission-matcher/data/accounting-ibass-2026.ts"), "utf8");
const fuoye = fs.readFileSync(path.join(root, "lib/admission-matcher/data/fuoye-2026.ts"), "utf8");
const types = fs.readFileSync(path.join(root, "lib/admission-matcher/types.ts"), "utf8");
const matcher = fs.readFileSync(path.join(root, "lib/admission-matcher/match.ts"), "utf8");
if (!client.includes("admissionMatcherRequirements.flatMap")) throw new Error("Programme selector must be generated from the complete registered Matcher dataset.");
if (!client.includes("item.utmeAlternatives")) throw new Error("Subject discovery must include UTME alternative groups from the registered dataset.");
if (!client.includes('max={3}') || !client.includes('utmeSubjects.length !== 3')) throw new Error("Matcher must enforce exactly three UTME subjects apart from Use of English.");
if (!client.includes("olevelSittings") || !types.includes("olevelSittings: 1 | 2")) throw new Error("Matcher UI and candidate model must preserve the O'Level sitting count.");
if (!matcher.includes("candidate.olevelSittings") || !matcher.includes("requirement.maximumSittings")) throw new Error("Matching engine must enforce verified O'Level sitting limits.");
if (!matcher.includes("olevelAlternativeMinimums") || !matcher.includes("utmeAlternativeMinimums")) throw new Error("Matching engine must enforce counted alternative subject groups.");
if (!index.includes("accountingIbass2026Requirements")) throw new Error("Accounting dataset must remain registered in the Matcher index.");
if (!accounting.includes('programme: "Accounting"') && !accounting.includes('programme:"Accounting"')) throw new Error("Accounting must remain available as a selectable Matcher programme.");
if (!accounting.includes("olevelAlternativeMinimums: [2]") && !accounting.includes("olevelAlternativeMinimums:[2]")) throw new Error("Accounting must require two additional relevant O'Level credits.");
for (const programme of ["Medicine & Surgery", "Accounting", "Business Administration", "Political Science", "Mass Communication", "Software Engineering"]) {
  if (!fuoye.includes(`programme:\"${programme}\"`) && !fuoye.includes(`programme: \"${programme}\"`)) throw new Error(`Expanded FUOYE programme missing: ${programme}`);
}
if (/selected FUOYE|first verified dataset currently covers selected FUOYE/i.test(page)) throw new Error("Admission Matcher page must not regress to obsolete FUOYE-only copy.");
if (!page.includes("unsupported requirements are never guessed")) throw new Error("Beta page must preserve the verified-data safety boundary.");
console.log("Admission Matcher UI/data contract guard passed.");
