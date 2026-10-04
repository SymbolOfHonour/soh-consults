import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("homepage server delegates settings persistence to Site Manager store",()=>{const s=fs.readFileSync("app/homepage-server.tsx","utf8");assert.match(s,/getPublishedSiteSettings/);assert.equal(s.includes("saveSiteSettings"),false)});
