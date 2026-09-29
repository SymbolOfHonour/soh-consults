import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS section titles and descriptions render publicly",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/s.title/);assert.match(s,/s.description/)});
