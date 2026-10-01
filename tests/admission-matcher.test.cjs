const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Admission Matcher stays isolated from existing screening calculator source", () => {
  const client = fs.readFileSync(path.join(process.cwd(), "app/admission-matcher/MatcherClient.tsx"), "utf8");
  assert.match(client, /lib\/admission-matcher\/data/);
  assert.doesNotMatch(client, /screening-calculator|lasu-calculator|fuoye-calculator/i);
});

test("Matcher datasets retain source verification metadata", () => {
  for (const file of ["fuoye-2026.ts", "lasustech-2026.ts", "lasu-2026.ts"]) {
    const content = fs.readFileSync(path.join(process.cwd(), "lib/admission-matcher/data", file), "utf8");
    assert.match(content, /lastVerified/);
    assert.match(content, /2026\/2027/);
  }
});
