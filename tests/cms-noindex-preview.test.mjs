import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS QA preview is noindex",()=>{assert.match(fs.readFileSync("app/cms-home/layout.tsx","utf8"),/index:false/)});
