import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("CMS homepage keeps mobile navigation and responsive controls",()=>{
 const src=fs.readFileSync("components/CmsHomepage.tsx","utf8");
 assert.match(src,/mobileVisible/); assert.match(src,/tabletVisible/); assert.match(src,/desktopVisible/);
 assert.match(src,/lg:hidden/); assert.match(src,/grid-cols-2/);
});
