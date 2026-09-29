import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("core CMS section types have public renderers",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");for(const type of ["hero","updates","tools","services","contact","founder"]){assert.ok(s.includes(`s.type===\"${type}\"`),type)}});
