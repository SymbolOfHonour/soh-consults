const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const page = fs.readFileSync(path.join(root, "app/my-school/page.tsx"), "utf8");
const feed = fs.readFileSync(path.join(root, "app/components/MySchoolFeed.tsx"), "utf8");
const snapshot = JSON.parse(fs.readFileSync(path.join(root, "data/official-institutions.json"), "utf8"));

test("My School does not depend on IBASS while that source is deferred", () => {
  assert.doesNotMatch(page, /ibassSchoolDirectory/);
  assert.doesNotMatch(feed, /Official JAMB IBASS directory/);
});

test("school options include the verified offline snapshot and published-content schools", () => {
  assert.match(page, /snapshot\.institutions\.filter/);
  assert.match(page, /schoolOptions\(items\)/);
  assert.equal(snapshot.coverage, "partial");
  assert.ok(snapshot.institutions.length > 0);
});

test("school choices do not depend on whether an institution has published news", () => {
  assert.match(feed, /Previously saved schools remain selectable/);
  assert.match(feed, /No matching institution found/);
  assert.match(feed, /preferences\.schools, \.\.\.schools/);
});

test("saved preferences are device-local, recover safely, and can be cleared", () => {
  assert.match(feed, /localStorage\.getItem\(SCHOOL_PREFERENCES_KEY\)/);
  assert.match(feed, /localStorage\.setItem\(SCHOOL_PREFERENCES_KEY/);
  assert.match(feed, /Clear preferences/);
  assert.match(feed, /catch/);
});

test("mobile-friendly school search and incremental feed pagination remain available", () => {
  assert.match(feed, /type="search"/);
  assert.match(feed, /max-h-64/);
  assert.match(feed, /results\.slice\(0, limit\)/);
  assert.match(feed, /setLimit\(value => value \+ 12\)/);
});

test("offline records retain regulator source provenance and explicit partial coverage", () => {
  assert.equal(snapshot.schemaVersion, 1);
  assert.equal(snapshot.coverage, "partial");
  assert.ok(snapshot.institutions.every(x => x.status === "verified" && /^https:\/\//.test(x.source)));
});
