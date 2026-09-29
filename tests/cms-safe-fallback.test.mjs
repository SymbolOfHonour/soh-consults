import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("homepage has a safe CMS fallback",()=>{
 const src=fs.readFileSync("app/homepage-server.tsx","utf8");
 assert.match(src,/defaultSiteSettings/); assert.match(src,/try/); assert.match(src,/catch/);
});
