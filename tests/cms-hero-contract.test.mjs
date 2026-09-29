import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("public hero uses CMS copy",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");for(const k of ["heroEyebrow","heroTitle","heroAccent","heroDescription"]){assert.ok(s.includes(`settings.${k}`),k)}});
