const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const client = fs.readFileSync(path.join(root, "app/admission-matcher/MatcherClient.tsx"), "utf8");
const page = fs.readFileSync(path.join(root, "app/admission-matcher/page.tsx"), "utf8");
const index = fs.readFileSync(path.join(root, "lib/admission-matcher/data/index.ts"), "utf8");
const accounting = fs.readFileSync(path.join(root, "lib/admission-matcher/data/accounting-ibass-2026.ts"), "utf8");

if (!client.includes("admissionMatcherRequirements.map((item) => item.programme)")) {
  throw new Error("Programme selector must be generated from the complete registered Matcher dataset.");
}
if (!index.includes("accountingIbass2026Requirements")) {
  throw new Error("Accounting dataset must remain registered in the Matcher index.");
}
if (!accounting.includes('programme: "Accounting"')) {
  throw new Error("Accounting must remain available as a selectable Matcher programme.");
}
if (/selected FUOYE|first verified dataset currently covers selected FUOYE/i.test(page)) {
  throw new Error("Admission Matcher page must not regress to obsolete FUOYE-only copy.");
}
if (!page.includes("unsupported requirements are never guessed")) {
  throw new Error("Beta page must preserve the verified-data safety boundary.");
}

console.log("Admission Matcher UI/data contract guard passed.");
