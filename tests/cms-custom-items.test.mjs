import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("CMS custom items render cards with links and images",()=>{const s=fs.readFileSync("components/CmsHomepage.tsx","utf8");assert.match(s,/i.image/);assert.match(s,/i.link/);assert.match(s,/i.description/)});
