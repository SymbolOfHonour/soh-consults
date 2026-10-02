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
  assert.match(discovery, /versioned local S\.O\.H snapshot/i);
  assert.match(discovery, /direct live dependency.*deferred/i);
  assert.doesNotMatch(normalizer + ingestion, /fetch\s*\(/);
  assert.doesNotMatch(normalizer + ingestion, /axios|XMLHttpRequest/);
});

test("normalizer refuses to infer unresolved broad subject categories", () => {
  const normalizer = read("lib/admission-matcher/upstream/normalize.ts");
  assert.match(normalizer, /categoryMappingsResolved/);
  assert.match(normalizer, /no broad S\.O\.H subject taxonomy was inferred/i);
  assert.match(normalizer, /verificationStatus: reviewReasons\.length === 0 \? "verified" : "review"/);
});

test("UNILAG observed fixture preserves component-vs-overall eligibility distinction", () => {
  const fixture = read("lib/admission-matcher/upstream/fixtures/unilag-accounting-observed.ts");
  assert.match(fixture, /label: "ACCOUNTANCY\/ACCOUNTING"/);
  assert.match(fixture, /status: "qualified"/);
  assert.match(fixture, /overallStatus: "disqualified"/);
  assert.match(fixture, /Social Science category has not yet been captured/i);
});

test("sanitized fixture contains no captured browser secrets", () => {
  const fixture = read("lib/admission-matcher/upstream/fixtures/unilag-accounting-observed.ts");
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
