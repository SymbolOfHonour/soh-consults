import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
test("root route delegates to CMS homepage",()=>{assert.match(fs.readFileSync("app/page.tsx","utf8"),/homepage-server/)});
