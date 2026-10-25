const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function routeWithRate(rate,dependencies={}){const exports={};const code=ts.transpileModule(fs.readFileSync('app/api/ask-soh/search/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,process:{env:{}},require(name){const dependency=Object.keys(dependencies).find(key=>name.endsWith(key));if(dependency)return dependencies[dependency];if(name.endsWith('/direct-answer'))return require('../lib/ask-soh/direct-answer.ts');if(name.endsWith('/business-answer'))return require('../lib/ask-soh/business-answer.ts');if(name==='next/server')return {NextResponse:{json:Response.json}};if(name.endsWith('/rate-limit'))return {checkRateLimit:async()=>rate};return {};}});return exports;}
test('Ask S.O.H backend outage returns 503 without falsely claiming rate exhaustion',async()=>{const r=await routeWithRate({allowed:false,unavailable:true,retryAfter:3600}).GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU')});assert.equal(r.status,503);assert.equal(r.headers.get('Retry-After'),'60');assert.match((await r.json()).error,/temporarily unavailable/);});
test('Ask S.O.H genuine rate exhaustion remains 429 with its cooldown',async()=>{const r=await routeWithRate({allowed:false,retryAfter:42}).GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU')});assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'42');});

require('../scripts/ask-soh-test-loader.cjs');
test('reviewed current fact uses record read time while retaining review validity checks',async()=>{
 const {resolveQuestion,formatAnswer}=require('../lib/ask-soh/question-resolver.ts');
 const {verifyAnswer,rankDocuments}=require('../lib/ask-soh/answer-verification.ts');
 const {factApplicable}=require('../lib/ask-soh/knowledge-repository.ts');
 const fact={institution_key:'lasu',intent:'cutoff',topic:'admission',value_text:'195',academic_session:'2026/2027',source_name:'LASU screening',source_url:'https://lasu.edu.ng/admissionscreening/',evidence_text:'Minimum score of 195 in the 2026 UTME.',status:'verified',verified_at:new Date(Date.now()-3*86400000).toISOString(),review_due_at:new Date(Date.now()+86400000).toISOString()};
 const question='LASU 2026/2027 minimum JAMB score';
 assert.equal(factApplicable(fact,resolveQuestion(question)),true);
 const route=routeWithRate({allowed:true},{'/question-resolver':{resolveQuestion,formatAnswer},'/knowledge-repository':{getInstitution:async()=>({key:'lasu'}),findVerifiedFacts:async()=>[fact]},'/source-discovery':{discoverOfficialSources:async()=>({documents:[],gaps:[],cacheHit:false})},'/answer-verification':{verifyAnswer,rankDocuments},'/telemetry':{recordQuestion:async()=>{}}});
 const response=await route.GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q='+encodeURIComponent(question))});
 const body=await response.json();assert.equal(body.answer,'195');assert.equal(body.confidence,'high');assert.equal(body.knowledgeMatches,1);
 assert.equal(factApplicable({...fact,review_due_at:new Date(Date.now()-1).toISOString()},resolveQuestion(question)),false);
});
test('missing admission session clarifies before any source discovery',async()=>{
 const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');let lookups=0;
 const route=routeWithRate({allowed:true},{'/question-resolver':{resolveQuestion},'/knowledge-repository':{getInstitution:async()=>{lookups++;throw Error('Unexpected lookup')}}});
 const r=await route.GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU%20cutoff')});const body=await r.json();assert.equal(lookups,0);assert.equal(body.needsClarification,true);assert.deepEqual(body.results,[]);
});
test('unverified historical answer does not expose unrelated retrieved sources as citations',async()=>{
 const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');const {verifyAnswer,rankDocuments}=require('../lib/ask-soh/answer-verification.ts');
 const docs=[{title:'LASU 2026/2027 screening',url:'https://lasu.edu.ng/new-notice',snippet:'2026/2027 minimum UTME score of 195.',official:true,verified:true,kind:'article',fetchedAt:new Date().toISOString()}];
 const route=routeWithRate({allowed:true},{'/question-resolver':{resolveQuestion},'/knowledge-repository':{getInstitution:async()=>({key:'lasu'}),findVerifiedFacts:async()=>[]},'/source-discovery':{discoverOfficialSources:async()=>({documents:docs,gaps:[],cacheHit:false}),searchProviderSources:async()=>({documents:[],gaps:[]})},'/answer-verification':{verifyAnswer,rankDocuments},'/telemetry':{recordQuestion:async()=>{}}});
 const r=await route.GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU%202025%2F2026%20cutoff')});const body=await r.json();assert.equal(body.confidence,'low');assert.deepEqual(body.results,[]);
});
