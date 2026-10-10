const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function routeWithRate(rate,dependencies={}){const exports={};const code=ts.transpileModule(fs.readFileSync('app/api/ask-soh/search/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,process:{env:{}},require(name){const dependency=Object.keys(dependencies).find(key=>name.endsWith(key));if(dependency)return dependencies[dependency];if(name.endsWith('/conversation'))return require('../lib/ask-soh/conversation.ts');if(name==='next/server')return {NextResponse:{json:Response.json}};if(name.endsWith('/rate-limit'))return {checkRateLimit:async()=>rate};return {};}});return exports;}
test('Ask S.O.H backend outage returns 503 without falsely claiming rate exhaustion',async()=>{const r=await routeWithRate({allowed:false,unavailable:true,retryAfter:3600}).GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU')});assert.equal(r.status,503);assert.equal(r.headers.get('Retry-After'),'60');assert.match((await r.json()).error,/temporarily unavailable/);});
test('Ask S.O.H genuine rate exhaustion remains 429 with its cooldown',async()=>{const r=await routeWithRate({allowed:false,retryAfter:42}).GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q=LASU')});assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'42');});

require('../scripts/ask-soh-test-loader.cjs');
test('reviewed current fact uses record read time while retaining review validity checks',async()=>{
 const {resolveQuestion,formatAnswer}=require('../lib/ask-soh/question-resolver.ts');
 const {verifyAnswer,rankDocuments}=require('../lib/ask-soh/answer-verification.ts');
 const {factApplicable}=require('../lib/ask-soh/knowledge-repository.ts');
 const fact={institution_key:'lasu',intent:'cutoff',topic:'admission',value_text:'195',academic_session:'2026/2027',source_name:'LASU screening',source_url:'https://lasu.edu.ng/admissionscreening/',evidence_text:'195+ Minimum UTME Score',status:'verified',verified_at:new Date(Date.now()-3*86400000).toISOString(),review_due_at:new Date(Date.now()+86400000).toISOString()};
 const question='LASU 2026/2027 minimum JAMB score';
 assert.equal(factApplicable(fact,resolveQuestion(question)),true);
 const route=routeWithRate({allowed:true},{'/question-resolver':{resolveQuestion,formatAnswer},'/knowledge-repository':{getInstitution:async()=>({key:'lasu'}),findVerifiedFacts:async()=>[fact]},'/source-discovery':{discoverOfficialSources:async()=>({documents:[{url:fact.source_url,title:'LASU admissions',snippet:'Start screening',official:true,verified:true,kind:'homepage',fetchedAt:new Date().toISOString()}],gaps:[],cacheHit:false})},'/answer-verification':{verifyAnswer,rankDocuments},'/telemetry':{recordQuestion:async()=>{}}});
 const response=await route.GET({nextUrl:new URL('https://qa.invalid/api/ask-soh/search?q='+encodeURIComponent(question))});
 const body=await response.json();assert.equal(body.answer,'195');assert.equal(body.confidence,'high');assert.equal(body.knowledgeMatches,1);
 assert.equal(factApplicable({...fact,review_due_at:new Date(Date.now()-1).toISOString()},resolveQuestion(question)),false);
});

test('compound institution questions retrieve independent evidence and calibrate each part',async()=>{
 const {resolveQuestion,formatAnswer}=require('../lib/ask-soh/question-resolver.ts');
 const {verifyAnswer,rankDocuments}=require('../lib/ask-soh/answer-verification.ts');
 const probes=[];
 const route=routeWithRate({allowed:true},{'/question-resolver':{resolveQuestion,formatAnswer},'/knowledge-repository':{getInstitution:async key=>({key}),findVerifiedFacts:async resolved=>resolved.institutionKey==='lasu'?[{institution_key:'lasu',intent:'cutoff',topic:'admission',value_text:'195',academic_session:'2026/2027',source_name:'LASU screening',source_url:'https://lasu.edu.ng/admissionscreening/',evidence_text:'195+ Minimum UTME Score'}]:[]},'/source-discovery':{discoverOfficialSources:async(institution,question)=>{probes.push({key:institution.key,question});return {documents:[],gaps:[],cacheHit:false};},searchProviderSources:async()=>({documents:[],gaps:[]})},'/answer-verification':{verifyAnswer,rankDocuments},'/telemetry':{recordQuestion:async()=>{}}});
 const body=await (await route.POST({nextUrl:new URL('https://qa.invalid/api/ask-soh/search'),json:async()=>({question:'LASU and FUOYE 2026/2027 minimum JAMB score'})})).json();
 assert.equal(body.parts.length,2);assert.equal(body.parts[0].answer,'195');assert.equal(body.parts[0].confidence,'high');assert.equal(body.parts[1].confidence,'low');assert.equal(body.confidence,'low');assert.equal(body.needsHuman,true);
 assert.ok(probes.some(p=>p.key==='fuoye'&&!/LASU/i.test(p.question)));
});
test('short conversational acknowledgements are accepted by the API',async()=>{const body=await(await routeWithRate({allowed:true}).POST({nextUrl:new URL('https://qa.invalid/api/ask-soh/search'),json:async()=>({question:'ok'})})).json();assert.match(body.answer,/question/);assert.equal(body.needsHuman,false);});
