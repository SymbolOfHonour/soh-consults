import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("public homepage uses CMS footer setting",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/settings.footerText/)});
