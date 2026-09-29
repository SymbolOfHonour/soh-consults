import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("homepage reads CMS at runtime",()=>{const s=fs.readFileSync("app/homepage-server.tsx","utf8");assert.match(s,/force-dynamic/);assert.match(s,/await getSiteSettings/)});
