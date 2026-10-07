const test=require("node:test");const assert=require("node:assert/strict");const fs=require("node:fs");const path=require("node:path");
const resolver=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/question-resolver.ts"),"utf8");
const repo=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/knowledge-repository.ts"),"utf8");
const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
const migration=fs.readFileSync(path.join(process.cwd(),"supabase/ask-soh-v2-migration.sql"),"utf8");
test("v2 resolves facts before live retrieval",()=>{assert.match(route,/findVerifiedFact\(resolved\)/);assert.match(route,/sourceType:"verified_knowledge"/);});
test("v2 has bounded institution resolution",()=>{assert.match(resolver,/explicit=resolveInstitution\(question\)/);assert.match(resolver,/inherited=!explicit&&context/);});
test("v2 routes simple answer modes",()=>{assert.match(resolver,/intent==="cutoff"\?"numeric"/);assert.match(resolver,/intent==="vice_chancellor"\?"name"/);assert.match(resolver,/status\?"boolean"/);});
test("v2 separates freshness from stable facts",()=>{assert.match(resolver,/currentSensitive:CURRENT\.test/);assert.match(route,/!knowledge\.stale&&!resolved\.currentSensitive/);});
test("v2 knowledge lifecycle and provenance exist",()=>{for(const token of ["ask_soh_facts","ask_soh_fact_versions","review_due_at","evidence_text","source_authority","due_review","expired","archived"])assert.match(migration,new RegExp(token));});
test("v2 telemetry and feedback stores exist",()=>{assert.match(migration,/ask_soh_questions/);assert.match(migration,/ask_soh_feedback/);});
test("v2 repository filters to verified knowledge",()=>{assert.match(repo,/\["verified","published"\]/);assert.match(repo,/valid_until/);});

test("v2 protects current-sensitive queries from stable cache",()=>{assert.match(route,/cached=!resolved\.currentSensitive/);assert.match(route,/cacheSet\(cacheKey/);});
test("v2 records privacy-safe telemetry",()=>{const telemetry=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/telemetry.ts"),"utf8");assert.match(telemetry,/redactQuestion/);assert.match(telemetry,/question_hash/);assert.match(telemetry,/cache_hit/);});
test("v2 reconciles contradictory evidence",()=>{const evidence=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/evidence.ts"),"utf8");assert.match(evidence,/conflict/);assert.match(evidence,/requires review/);assert.match(evidence,/sourceUrl/);});
test("v2 evaluation corpus covers at least 60 diverse questions",()=>{const corpus=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/evaluation-cases.ts"),"utf8");const count=(corpus.match(/\{q:/g)||[]).length;assert.ok(count>=60);for(const token of ["LASU","FUTA","OAU","JAMB","WAEC","NYSC","LASUSTECH","UNIOSUN","OOU","YABATECH"])assert.match(corpus,new RegExp(token));});

test("v2 admin enforces review lifecycle",()=>{const api=fs.readFileSync(path.join(process.cwd(),"app/api/admin/ask-soh-knowledge/route.ts"),"utf8");assert.match(api,/draft:\["review","archived"\]/);assert.match(api,/review:\["verified","draft","archived"\]/);assert.match(api,/Invalid knowledge transition/);});
test("v2 feedback is privacy protected and rate limited",()=>{const feedback=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/feedback/route.ts"),"utf8");assert.match(feedback,/checkRateLimit/);assert.match(feedback,/redactQuestion/);assert.match(feedback,/questionHash/);});

test("v2 route has no hard-coded FUTA/LASU answer authority",()=>{assert.doesNotMatch(route,/function verifiedFactAnswer/);assert.doesNotMatch(route,/LASU's Vice-Chancellor is/);assert.doesNotMatch(route,/FUTA's minimum UTME score/);});
test("v2 official retrieval follows resolved institution",()=>{assert.match(route,/INSTITUTIONS\.find/);assert.match(route,/institution\.officialDomains\[0\]/);assert.doesNotMatch(route,/site:lasu\.edu\.ng/);});
test("v2 records all retrieval outcomes",()=>{for(const source of ["verified_knowledge","verified_cache","official_live","internal","web","none"])assert.match(route,new RegExp(source));});

test("v2 contradiction engine is active in live route",()=>{assert.match(route,/reconcileEvidence/);assert.match(route,/contradiction:Boolean/);assert.match(route,/needsReview/);});
test("v2 bulk imports require review",()=>{const bulk=fs.readFileSync(path.join(process.cwd(),"app/api/admin/ask-soh-knowledge/import/route.ts"),"utf8");assert.match(bulk,/status:"review"/);assert.doesNotMatch(bulk,/status:"published"/);});

test("v2 semantic retrieval is verified and bounded",()=>{assert.match(migration,/embedding extensions\.vector\(1536\)/);assert.match(migration,/match_ask_soh_facts/);assert.match(route,/semanticCandidate/);assert.match(route,/verified_semantic/);assert.match(route,/!resolved\.currentSensitive&&semanticCandidate/);});

test("v2 privacy hashing remains edge compatible",()=>{const privacy=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/privacy.ts"),"utf8");assert.doesNotMatch(privacy,/from [\"']crypto[\"']/);assert.match(privacy,/crypto\.subtle\.digest/);});

test("v2 numeric answer mode shapes official evidence to a value",()=>{assert.match(route,/shapeEvidenceAnswer\(resolved\.answerMode,results\)/);assert.match(route,/mode===\"numeric\"/);assert.match(route,/n<100\|\|n>400/);assert.doesNotMatch(route,/answer:\"195\"/);});

test("v2 exact answer modes bypass generative rewriting",()=>{assert.match(route,/exactMode=resolved\.answerMode===\"numeric\"\|\|resolved\.answerMode===\"name\"/);assert.match(route,/generated=exactMode\?null:/);});

test("v2 numeric shaper requires nearby admission-score language",()=>{assert.match(route,/window=text\.slice/);assert.match(route,/minimum\|utme\|jamb\|cut/);});
