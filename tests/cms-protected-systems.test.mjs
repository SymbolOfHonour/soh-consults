import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("CMS homepage renderer does not expose protected engineering controls",()=>{
 const src=fs.readFileSync("components/CmsHomepage.tsx","utf8");
 for(const forbidden of ["CRON_SECRET","SUPABASE_SERVICE_ROLE_KEY","process.env","updateModuleRecord","saveSiteSettings"]){assert.equal(src.includes(forbidden),false,forbidden)}
});
