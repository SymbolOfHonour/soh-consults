import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS homepage keeps both public tools",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/screening-calculator/);assert.match(s,/cgpa-calculator/)});
