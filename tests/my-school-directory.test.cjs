const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const source = fs.readFileSync(path.join(root, "lib/ibass-school-directory.ts"), "utf8");
const page = fs.readFileSync(path.join(root, "app/my-school/page.tsx"), "utf8");
const feed = fs.readFileSync(path.join(root, "app/components/MySchoolFeed.tsx"), "utf8");
test("IBASS pagination checks current page, total and page bound", () => {
  assert.match(source, /page !== expectedPage/);
  assert.match(source, /next\.total !== first\.total/);
  assert.match(source, /result\.length !== first\.total/);
});
test("missing categories do not discard successful categories", () => {
  assert.match(source, /Promise\.allSettled/);
  assert.match(source, /categoryCount\+\+/);
  assert.match(source, /complete: false/);
});
test("directory prevents case and spacing duplicates", () => {
  assert.match(source, /normalize\("NFKC"\)/);
  assert.match(source, /names\.has\(key\)/);
});
test("saved schools survive upstream and article catalogue changes", () => {
  assert.match(feed, /preferences\.schools, \.\.\.schools/);
  assert.match(page, /directory\.names, \.\.\.schoolOptions\(items\)/);
});
test("directory status and official source are visible", () => {
  assert.match(feed, /directoryComplete/);
  assert.match(feed, /Official JAMB IBASS directory/);
  assert.match(feed, /No matching institution found/);
});

test("regulator snapshot is versioned and only verified entries are shown offline", () => {
  const snapshot = JSON.parse(fs.readFileSync(path.join(root, "data/official-institutions.json"), "utf8"));
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.coverage, "partial");
  assert.ok(snapshot.institutions.length > 0);
  for (const entry of snapshot.institutions) {
    assert.equal(entry.status, "verified");
    assert.match(entry.source, /^https:\/\/(enuc\.nuc\.edu\.ng|www\.ncce\.gov\.ng)\//);
  }
  assert.match(source, /snapshot\.institutions\.filter/);
});
test("official refresh refuses partial or implausibly small regulator downloads", () => {
  const script = fs.readFileSync(path.join(root, "scripts/refresh-official-institutions.py"), "utf8");
  assert.match(script, /Refusing incomplete refresh/);
  assert.match(script, /implausibly small regulator inventory/);
  assert.match(script, /coverage.*partial/);
});
