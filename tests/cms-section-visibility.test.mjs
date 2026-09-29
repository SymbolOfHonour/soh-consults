import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("hidden CMS sections do not render",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/settings.sections.filter\(s=>s.visible\)/)});
