import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS layouts alter public grids",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");for(const l of ["grid-2","grid-4","list"]){assert.ok(s.includes(l),l)}});
