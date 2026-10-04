import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("public homepage is CMS-driven",()=>{
 const page=fs.readFileSync("app/page.tsx","utf8");
 const server=fs.readFileSync("app/homepage-server.tsx","utf8");
 const renderer=fs.readFileSync("components/CmsHomepage.tsx","utf8");
 assert.match(page,/homepage-server/);
 assert.match(server,/getPublishedSiteSettings/);
 assert.match(renderer,/settings\.sections\.filter/);
 assert.match(renderer,/mobileVisible/);
 assert.match(renderer,/settings\.navigation/);
 assert.match(renderer,/latestUpdatesCount/);
});
