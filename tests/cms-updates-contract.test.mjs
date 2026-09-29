import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("latest update count is CMS controlled",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/slice\(0,settings.latestUpdatesCount\)/)});
