const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

test("IBASS upstream layer is snapshot-based and not wired to undocumented runtime XHR", () => {
  const discovery = read("docs/admission-matcher/ibass-upstream-discovery.md");
  const normalizer = read("lib/admission-matcher/upstream/normalize.ts");
  const ingestion = read("lib/admission-matcher/upstream/ingest.ts");
  const catalogue = read("lib/admission-matcher/upstream/catalogue.ts");
  const brochure = read("lib/admission-matcher/upstream/official-brochure.ts");
  assert.match(discovery, /versioned local S\.O\.H snapshot/i);
  assert.match(discovery, /direct live dependency.*deferred/i);
  assert.doesNotMatch(normalizer + ingestion + catalogue + brochure, /fetch\s*\(/);
  assert.doesNotMatch(normalizer + ingestion + catalogue + brochure, /axios|XMLHttpRequest/);
});

test("normalizer refuses to infer unresolved broad subject categories", () => {
  const normalizer = read("lib/admission-matcher/upstream/normalize.ts");
  assert.match(normalizer, /categoryMappingsResolved/);
  assert.match(normalizer, /no broad S\.O\.H subject taxonomy was inferred/i);
  assert.match(normalizer, /verificationStatus: reviewReasons\.length === 0 \? "verified" : "review"/);
});

test("UNILAG observed fixture preserves upstream ids and component-vs-overall distinction", () => {
  const fixture = read("lib/admission-matcher/upstream/fixtures/unilag-accounting-observed.ts");
  assert.match(fixture, /upstreamId: 1345/);
  assert.match(fixture, /upstreamId: 1537/);
  assert.match(fixture, /label: "ACCOUNTANCY\/ACCOUNTING"/);
  assert.match(fixture, /status: "qualified"/);
  assert.match(fixture, /overallStatus: "disqualified"/);
  assert.match(fixture, /Social Science category has not yet been captured/i);
});

test("observed UNILAG catalogue preserves real IBASS ids and programme labels", () => {
  const fixture = read("lib/admission-matcher/upstream/fixtures/unilag-catalogue-observed.ts");
  assert.match(fixture, /unilagIbassInstitutionId = 1345/);
  assert.match(fixture, /id: 1537, title: "ACCOUNTANCY\/ACCOUNTING"/);
  assert.match(fixture, /id: 1542, title: "ACTUARIAL SCIENCE"/);
  assert.match(fixture, /id: 2191, title: "ARCHITECTURE"/);
});

test("catalogue normalizer validates upstream ids and rejects duplicates", () => {
  const catalogue = read("lib/admission-matcher/upstream/catalogue.ts");
  assert.match(catalogue, /positive IBASS institution id is required/);
  assert.match(catalogue, /Duplicate IBASS programme id/);
  assert.match(catalogue, /Duplicate IBASS programme title/);
  assert.match(catalogue, /provider: "jamb-ibass"/);
});

test("official brochure registry keeps stable JAMB evidence separate from undocumented XHR", () => {
  const brochures = read("lib/admission-matcher/upstream/official-brochures.ts");
  assert.match(brochures, /brochure-degree-admin\.pdf/);
  assert.match(brochures, /brochure-degree-social-sciences\.pdf/);
  assert.match(brochures, /brochure-degree-education\.pdf/);
  assert.match(brochures, /baseline-and-waivers/);
  assert.doesNotMatch(brochures, /fetch\s*\(/);
});

test("official brochure evidence cannot silently become verified when requirement columns are incomplete", () => {
  const brochure = read("lib/admission-matcher/upstream/official-brochure.ts");
  assert.match(brochure, /sourceType: "official-brochure"/);
  assert.match(brochure, /Brochure evidence must originate from official JAMB IBASS/);
  assert.match(brochure, /return !baseline\.olevelText\?\.trim\(\) \|\| !baseline\.utmeSubjectsText\?\.trim\(\)/);
});

test("sanitized fixtures contain no captured browser secrets", () => {
  const fixture = read("lib/admission-matcher/upstream/fixtures/unilag-accounting-observed.ts") + read("lib/admission-matcher/upstream/fixtures/unilag-catalogue-observed.ts");
  assert.doesNotMatch(fixture, /cookie\s*:/i);
  assert.doesNotMatch(fixture, /authorization\s*:/i);
  assert.doesNotMatch(fixture, /bearer\s+[a-z0-9._-]+/i);
  assert.doesNotMatch(fixture, /csrf.*:/i);
});

test("upstream model reserves UTME and Direct Entry evidence modes", () => {
  const types = read("lib/admission-matcher/upstream/types.ts");
  assert.match(types, /"utme" \| "direct-entry"/);
  assert.match(types, /alevel\?: IbassComponentResult/);
  assert.match(types, /rawUtmeRequirement\?: string/);
  assert.match(types, /rawOlevelRequirement\?: string/);
});

test("ingestion builds versioned snapshots and rejects duplicate institution-programme-mode records", () => {
  const ingestion = read("lib/admission-matcher/upstream/ingest.ts");
  assert.match(ingestion, /schemaVersion: 1/);
  assert.match(ingestion, /Duplicate IBASS snapshot record/);
  assert.match(ingestion, /stats: \{ total: records\.length, verified, review:/);
});

test("snapshot validation blocks unsafe verified records", () => {
  const ingestion = read("lib/admission-matcher/upstream/ingest.ts");
  assert.match(ingestion, /verified but still has unresolved review reasons/);
  assert.match(ingestion, /verified without explicit UTME subject rules/);
  assert.match(ingestion, /Official source must use HTTPS/);
});
