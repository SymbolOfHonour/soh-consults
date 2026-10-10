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




test("Ask S.O.H keeps conversation history and institution calculator routing", () => {
  const widget = fs.readFileSync(path.join(root,"app/components/AskSOH.tsx"),"utf8");
  assert.match(widget, /history/);
  for (const route of ["/lasu-calculator","/fuoye-calculator","/lasustech-calculator","/uniosun-calculator","/oou-calculator","/lasued-calculator","/yabatech-calculator"]) {
    assert.match(widget, new RegExp(route.replaceAll("/","\\/")));
  }
});














test("Ask S.O.H follow-ups preserve latest intent instead of replaying previous status intent", () => {
  const widget = fs.readFileSync(path.join(root,"app/components/AskSOH.tsx"),"utf8");
  const route = fs.readFileSync(path.join(root,"app/api/ask-soh/search/route.ts"),"utf8");
  assert.match(widget, /searchWeb\(question, subjectContext/);
  assert.match(route, /Context subject:/);
  assert.match(route, /verifyAnswer\(safeQuestion,resolved/);
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




test("Ask S.O.H keeps simple facts concise through answer-mode routing",()=>{
 const route=fs.readFileSync(path.join(process.cwd(),"app/api/ask-soh/search/route.ts"),"utf8");
 const resolver=fs.readFileSync(path.join(process.cwd(),"lib/ask-soh/question-resolver.ts"),"utf8");
 assert.match(resolver,/intent==="cutoff"\?"numeric"/);
 assert.match(resolver,/intent==="vice_chancellor"\?"name"/);
 assert.match(route,/one sentence or at most two short sentences/);
});





test("Ask S.O.H renders a valid API answer even when no source cards are returned",()=>{
 const widget=fs.readFileSync(path.join(process.cwd(),"app/components/AskSOH.tsx"),"utf8");
 const noBest=widget.indexOf("if (!best)");
 const answerCheck=widget.indexOf("if (payload.answer)",noBest);
 const retrievalFailure=widget.indexOf("Ask S.O.H received no usable answer or sources",noBest);
 assert.ok(noBest>=0 && answerCheck>noBest && retrievalFailure>answerCheck);
 assert.match(widget.slice(answerCheck,retrievalFailure),/text: payload\.answer/);
});

test('search treats common admission spellings and keyword-only terms consistently',()=>{
 const content=[item('cutoff','UNIOSUN cut-off marks'),item('upload',"O’Level upload guide"),{...item('tool','Academic tool'),keywords:['semester','course units']}];
 assert.equal(unifiedSearch(content,'UNIOSUN cutoff',{now})[0].item.id,'cutoff');
 assert.equal(unifiedSearch(content,'olevel upload',{now})[0].item.id,'upload');
 assert.equal(unifiedSearch(content,'course units',{now})[0].item.id,'tool');
});

test('search keeps LASU distinct from LASUED and LASUSTECH, including full names',()=>{
 const content=[item('lasu','LASU screening'),item('lasued','Lagos State University of Education screening'),item('tech','Lagos State University of Science and Technology screening')];
 assert.deepEqual(unifiedSearch(content,'LASU screening',{now}).map(r=>r.item.id),['lasu']);
 assert.deepEqual(unifiedSearch(content,'Lagos State University screening',{now}).map(r=>r.item.id),['lasu']);
 assert.deepEqual(unifiedSearch(content,'LASUSTECH screening',{now}).map(r=>r.item.id),['tech']);
 assert.deepEqual(unifiedSearch(content,'LASUED screening',{now}).map(r=>r.item.id),['lasued']);
});

test('school-specific next steps never send a LASU reader to another school calculator',()=>{
 const current=item('story','LASU Post-UTME screening',{institution:'Nigeria',category:'Admission'});
 const corpus=contentCatalogue([]);
 const related=relatedContent(current,corpus,20,now).map(r=>r.item);
 assert.ok(related.some(i=>i.href==='/lasu-calculator'));
 assert.ok(related.some(i=>i.kind==='guide'));
 assert.ok(!related.some(i=>i.kind==='calculator'&&['/fuoye-calculator','/lasued-calculator','/lasustech-calculator'].includes(i.href)));
 const general=relatedContent(item('general','JAMB CAPS admission status',{institution:'Nigeria'}),corpus,30,now).map(r=>r.item);
 assert.ok(!general.some(i=>i.kind==='calculator'&&i.institution));
});

test('explicitly closed and upcoming opportunities are not recommended as current next steps',()=>{
 const current=item('current','Scholarship applications');
 const closed=item('closed','Scholarship application',{status:'CLOSED'});
 const upcoming=item('upcoming','Scholarship application',{status:'COMING SOON'});
 const open=item('open','Scholarship application',{deadline:'2026-10-10'});
 assert.deepEqual(relatedContent(current,[closed,upcoming,open],6,now).map(r=>r.item.id),['open']);
 assert.ok(rankContent([closed,open],{now}).find(r=>r.item.id==='closed').breakdown.stalenessPenalty>=40);
});

test('archived opportunity deep links explicitly include the full list',()=>{
 const all=publicOpportunities([]);
 assert.ok(all.length>0);
 assert.ok(all.every(item=>item.href.includes('?status=all#'+item.id)));
});

test('published application date ranges supply deadlines without inventing a year',()=>{
 const {statedDeadline}=load('lib/discovery-text');
 assert.equal(statedDeadline('Applications will run from Tuesday, October 6 to Tuesday, October 13, 2026.'),'2026-10-13T22:59:59.999Z');
 assert.equal(statedDeadline('Applications are available from 5 October to 13 November 2026.'),'2026-11-13T22:59:59.999Z');
 assert.equal(statedDeadline('Application deadline: 13 October 2026.'),'2026-10-13T22:59:59.999Z');
 assert.equal(statedDeadline('Applications are available from 5 October to 13 November.'),null);
 assert.equal(statedDeadline('Orientation is from 5 October to 13 November 2026.'),null);
 assert.equal(statedDeadline('Deadline: 13 October 2026. Deadline: 14 October 2026.'),null);
});

test('published admission application notices are discoverable as opportunities',()=>{
 const story={id:'new',title:'FUTA RELEASES TOP-UP DEGREE ADMISSION FORM',institution:'FUTA',category:'Admission',summary:'Applications are available from 5 October to 13 November 2026.',details:'Published application instructions.',source_url:'manual:new',source_published_at:null,created_at:'2026-10-05',updated_at:'2026-10-05'};
 const found=publicOpportunities([story]).find(i=>i.id==='opportunity-new');
 assert.ok(found);assert.equal(found.deadline,'2026-11-13T22:59:59.999Z');assert.equal(found.deadlineLabel,'13 November 2026');
});

test('new published notices feed the deadline tracker and global deadline search',()=>{
 const {publishedDeadlines}=load('lib/content-catalogue');
 const story={id:'new',title:'FUTES Admission Portal Reopened',institution:'FUTES',category:'Admission',summary:'Applications will run from Tuesday, October 6 to Tuesday, October 13, 2026.',details:'Published instructions',source_url:'manual:new',source_published_at:null,created_at:'2026-10-05',updated_at:'2026-10-05'};
 const deadlines=publishedDeadlines([story]);assert.equal(deadlines.length,1);assert.equal(deadlines[0].deadline,'2026-10-13T22:59:59.999Z');assert.equal(deadlines[0].href,'/updates/futes-admission-portal-reopened');
 assert.ok(unifiedSearch(contentCatalogue([story]),'FUTES',{now}).some(r=>r.item.kind==='deadline'));
});
