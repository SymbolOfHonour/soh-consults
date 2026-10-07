const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),ts=require('typescript');
const root=process.cwd(),cache=new Map();
function load(name){
  const file=path.resolve(root,name.endsWith('.ts')?name:name+'.ts');
  if(cache.has(file))return cache.get(file).exports;
  const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));cache.set(file,m);
  m.require=spec=>spec.startsWith('.')?load(path.relative(root,path.resolve(path.dirname(file),spec))):require(spec);
  m._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,file);return m.exports;
}
const {unifiedSearch,relatedContent}=load('lib/algorithm-phase2');
const {rankContent}=load('lib/ranking-engine');
const {deadlineDate}=load('lib/discovery-text');
const {newestContent,publicOpportunities,opportunityStatus,contentCatalogue}=load('lib/content-catalogue');
const now=new Date('2026-10-05T10:00:00Z');
const item=(id,title,extra={})=>({id,href:`/updates/${id}`,kind:'update',title,...extra});
test('search filters unrelated records and requires all meaningful terms',()=>{
 const items=[item('caps','JAMB CAPS admission status'),item('scholarship','LASU scholarship'),item('campus','Campus cleanup')];
 assert.deepEqual(unifiedSearch(items,'JAMB CAPS',{now}).map(r=>r.item.id),['caps']);
 assert.equal(unifiedSearch(items,'zzzznothing',{now}).length,0);
 assert.equal(unifiedSearch(items,'LASU CAPS',{now}).length,0);
});
test('Unicode headlines and institution abbreviations are searchable',()=>{
 assert.equal(unifiedSearch([item('lasu','𝗟𝗔𝗦𝗨 𝗦𝗖𝗥𝗘𝗘𝗡𝗜𝗡𝗚')],'LASU screening',{now}).length,1);
 assert.equal(unifiedSearch([item('lasu','Lagos State University screening')],'LASU',{now}).length,1);
});
test('a title match outranks a fresh popular record with only a body match',()=>{
 const exact=item('exact','JAMB CAPS',{publishedAt:'2025-01-01'});
 const indirect=item('indirect','New campus event',{body:'JAMB CAPS',publishedAt:'2026-10-05',views:1000000,isPinned:true,isOfficial:true});
 assert.equal(unifiedSearch([indirect,exact],'JAMB CAPS',{now})[0].item.id,'exact');
});
test('latest uses publication time and does not mutate input or promote old edits',()=>{
 const a=[item('old','Old',{publishedAt:'2026-09-01',updatedAt:'2026-10-05'}),item('new','New',{publishedAt:'2026-09-30'})];
 assert.equal(newestContent(a)[0].id,'new');assert.equal(a[0].id,'old');
});
test('date-only deadlines expire at the end of the Lagos calendar day',()=>{
 assert.equal(deadlineDate('2026-10-05').toISOString(),'2026-10-05T22:59:59.999Z');
 assert.equal(deadlineDate('5 October 2026').toISOString(),'2026-10-05T22:59:59.999Z');
 assert.equal(opportunityStatus({status:'OPEN',deadline:'2026-10-05'},now),'Closing soon');
 assert.equal(opportunityStatus({status:'OPEN',deadline:'2026-10-05'},new Date('2026-10-05T23:00:00Z')),'Closed');
 assert.equal(deadlineDate('Check latest deadline'),null);
 assert.equal(opportunityStatus({status:'OPEN',deadline:'Check portal'},now),'Confirm availability');
});
test('expired opportunities are penalised and never recommended as current next steps',()=>{
 const current=item('current','Scholarship application');
 const expired=item('expired','Scholarship application deadline',{deadline:'2026-10-01',publishedAt:'2026-10-05'});
 const open=item('open','Scholarship application deadline',{deadline:'2026-10-10',publishedAt:'2026-10-05'});
 assert.equal(rankContent([expired,open],{now})[0].item.id,'open');
 assert.deepEqual(relatedContent(current,[current,expired,open],6,now).map(r=>r.item.id),['open']);
});
test('recommendations use genuine shared topics and keep engagement data unchanged',()=>{
 const current=item('current','JAMB CAPS admission status');
 const guide={...item('guide','How to accept JAMB CAPS admission'),kind:'guide',clicks:2};
 const unrelated=item('event','University football match for students');
 const result=relatedContent(current,[guide,unrelated],6,now);
 assert.deepEqual(result.map(r=>r.item.id),['guide']);assert.equal(result[0].item.clicks,2);
});
test('catalogue includes published CMS stories, working guide links and calculators',()=>{
 const stories=[{id:'cms',title:'New JAMB CAPS update',summary:'Published story',details:'CMS content',category:'JAMB',institution:'Nigeria',source_url:'manual:cms',source_published_at:null,created_at:'2026-10-05',updated_at:'2026-10-05',official_source_url:null}];
 const corpus=contentCatalogue(stories);
 assert.ok(corpus.some(i=>i.id==='cms'&&i.href==='/updates/new-jamb-caps-update'));
 assert.ok(unifiedSearch(corpus,'LASU screening',{now}).some(r=>r.item.href==='/lasu-calculator'));
 assert.ok(unifiedSearch(corpus,'CGPA',{now}).some(r=>r.item.href==='/cgpa-calculator'));
 assert.ok(corpus.some(i=>i.kind==='deadline'&&i.href.startsWith('/deadlines?q=')));
 assert.ok(corpus.some(i=>i.kind==='guide'&&i.href.startsWith('/guides/')));
 assert.ok(publicOpportunities([]).length>0);
});


test("Ask S.O.H official retrieval covers supported education authorities and institutions", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  for (const host of ["jamb.gov.ng","waec.org","neco.gov.ng","fuoye.edu.ng","lasustech.edu.ng","uniosun.edu.ng","oouagoiwoye.edu.ng","lasued.edu.ng","yabatech.edu.ng"]) {
    assert.match(route, new RegExp(host.replaceAll(".","\\.")));
  }
  assert.match(route, /target url returned error/i);
  assert.match(route, /start screening/i);
});

test("Ask S.O.H keeps conversation history and institution calculator routing", () => {
  const widget = fs.readFileSync(path.join(root,"app/components/AskSOH.tsx"),"utf8");
  assert.match(widget, /history/);
  for (const route of ["/lasu-calculator","/fuoye-calculator","/lasustech-calculator","/uniosun-calculator","/oou-calculator","/lasued-calculator","/yabatech-calculator"]) {
    assert.match(widget, new RegExp(route.replaceAll("/","\\/")));
  }
});


test("Ask S.O.H fallback suppresses portal boilerplate and caps evidence summaries", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(route, /javascript\|mail\|helpline/);
  assert.match(route, /slice\(0,520\)/);
  assert.match(route, /start screening/i);
});


test("Ask S.O.H rejects CAPTCHA and anti-bot challenge pages as evidence", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  for (const marker of ["captcha","performing security verification","verifies you are not a bot","verify you are human","checking your browser","security service to protect against malicious bots"]) {
    assert.match(route, new RegExp(marker, "i"));
  }
});


test("Ask S.O.H uses multiple official admission endpoints when an institution homepage is blocked", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  for (const endpoint of ["putme.fuoye.edu.ng/utme/","news.fuoye.edu.ng/tag/2026-2027-post-utme/","admission.lasustech.edu.ng/","admissions.uniosun.edu.ng/"]) {
    assert.match(route, new RegExp(endpoint.replaceAll(".","\\.")));
  }
  assert.match(route, /Promise\.allSettled\(direct\.map/);
});


test("Ask S.O.H synthesizes FUOYE screening status instead of dumping portal text", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(route, /fuoyeScreening/);
  assert.match(route, /closing\\s\+in/);
  assert.match(route, /screening exercise has been reopened/);
  assert.match(route, /yes\/no or status questions/i);
});


test("Ask S.O.H follow-ups preserve latest intent instead of replaying previous status intent", () => {
  const widget = fs.readFileSync(path.join(root,"app/components/AskSOH.tsx"),"utf8");
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(widget, /searchWeb\(question, subjectContext/);
  assert.match(route, /Context subject:/);
  assert.match(route, /question\.split\(\/Context subject:/);
});


test("Ask S.O.H FUOYE requirements retrieve official guides and build a practical checklist", () => {
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(route, /FOUYE-Post-UTME-Admission-Screening-Registration-GUIDE\.pdf/);
  assert.match(route, /instruction_UG\.php\?session=2026%2F2027/);
  assert.match(route, /JAMB registration number/);
  assert.match(route, /Passport photograph/);
  assert.match(route, /O'Level result\/certificate/);
  assert.match(route, /valid email address/);
  assert.match(route, /valid phone number/);
  assert.match(route, /screening-fee payment/);
  assert.match(route, /print the completed application/);
});


test("Ask S.O.H keeps enough official evidence for complete requirements checklists", () => {
  const route = fs.readFileSync(path.join(process.cwd(), "app/api/ask-soh/search/route.ts"), "utf8");
  assert.match(route, /slice\(0,8000\)/);
  assert.match(route, /JAMB registration number/);
  assert.match(route, /Passport photograph/);
  assert.match(route, /A valid phone number/);
});


test("Ask S.O.H keeps FUOYE Direct Entry follow-ups intent-specific", () => {
  const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(route,/asksDirectEntry/);
  assert.match(route,/I could not verify enough FUOYE 2026\/2027 Direct Entry-specific eligibility/);
  assert.match(route,/smartcampus\|onboarding\|applications currently open\|balance payment\|result verification/);
});


test("Ask S.O.H rejects unrelated FUOYE notices as Direct Entry evidence",()=>{
 const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
 assert.match(route,/post\.\?utme\|awaiting result\|department of law/);
 assert.match(route,/direct entry\|\\bDE\\b/);
 assert.match(route,/requirement\|eligib\|qualification\|credential\|document/);
});


test("Ask S.O.H switches fresh institutions and only inherits genuine follow-ups",()=>{
 const widget=fs.readFileSync(path.join(process.cwd(),"app/components/AskSOH.tsx"),"utf8");
 assert.match(widget,/explicitSubject/);
 assert.match(widget,/followUpCue/);
 assert.match(widget,/classifyQuestion\(question\)/);
 assert.doesNotMatch(widget,/subjectContext \|\| conversationContext \|\| previousUser/);
});

test("Ask S.O.H keeps each new answer visible automatically",()=>{
 const widget=fs.readFileSync(path.join(process.cwd(),"app/components/AskSOH.tsx"),"utf8");
 assert.match(widget,/conversationRef/);
 assert.match(widget,/conversation\.scrollTo\(\{ top: conversation\.scrollHeight, behavior: "smooth" \}\)/);
});

test("Ask S.O.H searches internal and official knowledge for non-current factual questions",()=>{
 const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
 assert.match(route,/searchSOH\(resolvedQuestion\),searchOfficialSites\(resolvedQuestion\)/);
 assert.match(route,/Treat the current Question as authoritative/);
});


test("Ask S.O.H keeps simple facts concise through answer-mode routing",()=>{
 const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
 const resolver=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/question-resolver.ts"),"utf8");
 assert.match(resolver,/intent==="cutoff"\?"numeric"/);
 assert.match(resolver,/intent==="vice_chancellor"\?"name"/);
 assert.match(route,/one sentence or at most two short sentences/);
});


test("Ask S.O.H resolves verified facts from the registry before live retrieval",()=>{
 const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
 const lookup=route.indexOf("findVerifiedFact(resolved)");
 const live=route.indexOf("searchOfficialSites(resolvedQuestion)");
 assert.ok(lookup>=0 && live>lookup);
 assert.match(route,/sourceType:"verified_knowledge"/);
 assert.doesNotMatch(route,/function verifiedFactAnswer/);
});


test("Ask S.O.H renders a valid API answer even when no source cards are returned",()=>{
 const widget=fs.readFileSync(path.join(process.cwd(),"app/components/AskSOH.tsx"),"utf8");
 const noBest=widget.indexOf("if (!best)");
 const answerCheck=widget.indexOf("if (payload.answer)",noBest);
 const retrievalFailure=widget.indexOf("I couldn’t retrieve a reliable live result just now",noBest);
 assert.ok(noBest>=0 && answerCheck>noBest && retrievalFailure>answerCheck);
 assert.match(widget.slice(answerCheck,retrievalFailure),/text: payload\.answer/);
});
