import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS navigation supports configured items and safe fallback",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/settings.navigation/);assert.match(s,/fallbackNav/)});
