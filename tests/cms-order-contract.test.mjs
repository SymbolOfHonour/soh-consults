import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("public sections preserve CMS array order",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/sections\.map\(render\)/)});
