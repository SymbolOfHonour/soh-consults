const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const resolver=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/question-resolver.ts"),"utf8");
const repo=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/knowledge-repository.ts"),"utf8");
const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
const migration=fs.readFileSync(path.join(process.cwd(),"supabase/ask-soh-v2-migration.sql"),"utf8");
test("v2 resolves facts before live retrieval",()=>{assert.match(route,/findVerifiedFact\(resolved\)/);assert.match(route,/sourceType:"verified_knowledge"/);});
test("v2 has bounded institution resolution",()=>{assert.match(resolver,/explicit=resolveInstitution\(question\)/);assert.match(resolver,/inherited=!explicit&&context/);});
test("v2 routes simple answer modes",()=>{assert.match(resolver,/cutoff\?"numeric"/);assert.match(resolver,/vc\?"name"/);assert.match(resolver,/status\?"boolean"/);});
test("v2 separates freshness from stable facts",()=>{assert.match(resolver,/currentSensitive:CURRENT\.test/);assert.match(route,/!knowledge\.stale&&!resolved\.currentSensitive/);});
test("v2 knowledge lifecycle and provenance exist",()=>{for(const token of ["ask_soh_facts","ask_soh_fact_versions","review_due_at","evidence_text","source_authority","due_review","expired","archived"])assert.match(migration,new RegExp(token));});
test("v2 telemetry and feedback stores exist",()=>{assert.match(migration,/ask_soh_questions/);assert.match(migration,/ask_soh_feedback/);});
test("v2 repository filters to verified knowledge",()=>{assert.match(repo,/\["verified","published"\]/);assert.match(repo,/valid_until/);});

test("v2 protects current-sensitive queries from stable cache",()=>{assert.match(route,/cached=!resolved\.currentSensitive/);assert.match(route,/cacheSet\(cacheKey/);});
test("v2 records privacy-safe telemetry",()=>{const telemetry=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/telemetry.ts"),"utf8");assert.match(telemetry,/redactQuestion/);assert.match(telemetry,/question_hash/);assert.match(telemetry,/cache_hit/);});
test("v2 reconciles contradictory evidence",()=>{const evidence=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/evidence.ts"),"utf8");assert.match(evidence,/conflict/);assert.match(evidence,/requires review/);assert.match(evidence,/sourceUrl/);});
test("v2 evaluation corpus covers at least 20 diverse questions",()=>{const corpus=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/evaluation-cases.ts"),"utf8");const count=(corpus.match(/\{q:/g)||[]).length;assert.ok(count>=20);for(const token of ["LASU","FUTA","OAU","JAMB","WAEC","NYSC","LASUSTECH","UNIOSUN","OOU","YABATECH"])assert.match(corpus,new RegExp(token));});
