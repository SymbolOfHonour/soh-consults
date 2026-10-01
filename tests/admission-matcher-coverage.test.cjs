const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const accounting = fs.readFileSync(path.join(root, "lib/admission-matcher/data/accounting-ibass-2026.ts"), "utf8");
const fuoye = fs.readFileSync(path.join(root, "lib/admission-matcher/data/fuoye-2026.ts"), "utf8");
const lasustech = fs.readFileSync(path.join(root, "lib/admission-matcher/data/lasustech-2026.ts"), "utf8");
const index = fs.readFileSync(path.join(root, "lib/admission-matcher/data/index.ts"), "utf8");

const ids = new Set();
for (const source of [accounting, fuoye, lasustech]) {
  for (const match of source.matchAll(/institutionId:\s*"([^"]+)"/g)) ids.add(match[1]);
  for (const match of source.matchAll(/\{ id:\s*"([^"]+)"/g)) ids.add(match[1]);
}

if (ids.size < 30) throw new Error(`Admission Matcher must cover at least 30 unique institutions; found ${ids.size}.`);
if (!index.includes("accountingIbass2026Requirements")) throw new Error("Expanded verified dataset is not registered in the Matcher index.");
if (!accounting.includes("brochure-degree-admin.pdf")) throw new Error("Accounting expansion must retain its JAMB IBASS primary source.");
if (!accounting.includes("intentionally not guessed")) throw new Error("Unverified institution-specific thresholds must remain explicitly guarded.");

console.log(`Admission Matcher coverage guard passed with ${ids.size} unique institutions.`);
