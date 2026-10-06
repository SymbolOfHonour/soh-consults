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
  const route = read("app/api/ask-soh/search/route.ts");
  for (const host of ["jamb.gov.ng","waec.org","neco.gov.ng","fuoye.edu.ng","lasustech.edu.ng","uniosun.edu.ng","oouagoiwoye.edu.ng","lasued.edu.ng","yabatech.edu.ng"]) {
    assert.match(route, new RegExp(host.replaceAll(".","\\.")));
  }
  assert.match(route, /target url returned error/i);
  assert.match(route, /start screening/i);
});

test("Ask S.O.H keeps conversation history and institution calculator routing", () => {
  const widget = read("app/components/AskSOH.tsx");
  assert.match(widget, /history/);
  for (const route of ["/lasu-calculator","/fuoye-calculator","/lasustech-calculator","/uniosun-calculator","/oou-calculator","/lasued-calculator","/yabatech-calculator"]) {
    assert.match(widget, new RegExp(route.replaceAll("/","\\/")));
  }
});
