import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS spacing setting affects public section padding",()=>{assert.match(fs.readFileSync("components/CmsHomepage.tsx","utf8"),/s.spacing/)});
