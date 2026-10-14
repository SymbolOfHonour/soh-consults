const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const feed = fs.readFileSync(path.join(__dirname, "../app/components/MySchoolFeed.tsx"), "utf8");
const schoolLogic = fs.readFileSync(path.join(__dirname, "../lib/school-feed.ts"), "utf8");

test("My School keeps previously saved schools selectable when the current feed has no stories for them", () => {
  assert.match(feed, /\[\.\.\.preferences\.schools, \.\.\.schools\]/);
  assert.match(feed, /Previously saved schools remain selectable/);
});

test("My School preference storage is device-local and safely handles storage errors", () => {
  assert.match(feed, /localStorage\.getItem\(SCHOOL_PREFERENCES_KEY\)/);
  assert.match(feed, /localStorage\.setItem\(SCHOOL_PREFERENCES_KEY/);
  assert.match(feed, /catch/);
  assert.match(feed, /Clear preferences/);
});

test("My School enforces a five-school selection limit and permits removing selections", () => {
  assert.match(feed, /preferences\.schools\.length >= 5/);
  assert.match(feed, /previous\.includes\(value\) \? previous\.filter/);
  assert.match(schoolLogic, /\.slice\(0, 5\)/);
});

test("My School search reports when there are no matching schools", () => {
  assert.match(feed, /No matching institution found/);
  assert.match(feed, /type="search"/);
});

test("My School handles an empty matching feed and offers incremental pagination", () => {
  assert.match(feed, /There are no published updates matching your choices yet/);
  assert.match(feed, /results\.slice\(0, limit\)/);
  assert.match(feed, /setLimit\(value => value \+ 12\)/);
});

test("school feed excludes closed and expired applications", () => {
  assert.match(schoolLogic, /item\.status === "CLOSED"/);
  assert.match(schoolLogic, /deadline && \+deadline < \+now/);
});
