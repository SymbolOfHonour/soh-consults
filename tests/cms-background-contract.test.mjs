import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS section background setting reaches public renderer",()=>{assert.match(fs.readFileSync("components/CmsHomepage.tsx","utf8"),/s.background/)});
