const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function load(file,imports={},extra={}){const m={exports:{}};vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{module:m,exports:m.exports,require:n=>imports[n]||require(n),URL,URLSearchParams,Response,Request,Buffer,crypto,structuredClone,Date,Set,AbortSignal,...extra});return m.exports;}
const blocks=load('lib/article-blocks.ts'),meta=load('lib/smart-operations.ts');
const author={id:'11111111-1111-4111-8111-111111111111',name:'Test Writer',email:'writer@example.test',role:'writer',active:true};
const other='22222222-2222-4222-8222-222222222222';
const snapshot={title:'Admission guide',institution:'Test school',category:'Admission',summary:'',official_source_name:'',official_source_url:'',blocks:[{type:'paragraph',text:'Verified application instructions.'}]};
const initial={id:'33333333-3333-4333-8333-333333333333',author_id:author.id,author_name:author.name,status:'draft',snapshot,feedback:'',story_id:null,updated_at:'2026-10-21T00:00:00Z'};
class EditorError extends Error{constructor(message,status=400){super(message);this.status=status;}}
function fixture({owner=false,role='writer',row=initial,authenticated=true}={}){
 const calls=[];let saved=structuredClone(row);
 const actor={owner,member:owner?null:{...author,role}};
 const api=load('app/api/admin/writer/submissions/route.ts',{
  'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},
  '../../../../../lib/article-blocks':blocks,'../../../../../lib/smart-operations':meta,
  '../../../../../lib/editor-team':{EditorError,editorActor:async()=>{if(!authenticated)throw new EditorError('Unauthorized',401);return actor;},mayReview:a=>a.owner||a.member.role==='editor',teamRequest:async(path,init={})=>{
   const body=init.body?JSON.parse(init.body):null;calls.push({path,...init,body});
   if(path.includes('/rpc/'))return [{...saved,status:'imported',story_id:saved.id}];
   if(init.method==='POST'){saved={...body,updated_at:initial.updated_at};return [saved];}
   if(init.method==='PATCH'){saved={...saved,...body};return [saved];}
   if(path.includes('&author_id=eq.'))return saved.author_id===author.id?[saved]:[];
   return saved?[saved]:[];
  }}
 });
 const req=body=>new Request('https://editor.test/api/admin/writer/submissions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
 const patch=body=>api.PATCH(req({id:row.id,expected_updated_at:row.updated_at,...body}));
 return{api,calls,req,patch};
}
test('unauthenticated users cannot read submissions',async()=>{const f=fixture({authenticated:false});assert.equal((await f.api.GET()).status,401);assert.equal(f.calls.length,0);});
test('writers only query their own submissions; reviewers can query all',async()=>{for(const role of ['writer','editor']){const f=fixture({role});assert.equal((await f.api.GET()).status,200);assert.equal(f.calls[0].path.includes('&author_id=eq.'),role==='writer');}});
test('writer cannot modify or read another writer submission',async()=>{const f=fixture({row:{...initial,author_id:other}});assert.deepEqual((await (await f.api.GET()).json()).submissions,[]);assert.equal((await f.patch({snapshot})).status,404);assert.equal(f.calls.filter(c=>c.method==='PATCH').length,0);});
test('writer cannot publish or forge their author identity',async()=>{const f=fixture();const response=await f.api.POST(f.req({snapshot,status:'published',author_id:other,author_name:'Owner'}));assert.equal(response.status,201);const saved=(await response.json()).submission;assert.equal(saved.status,'draft');assert.equal(saved.author_id,author.id);assert.equal(saved.author_name,author.name);});
test('submitted articles are locked to their author until returned',async()=>{const f=fixture({row:{...initial,status:'submitted'}});assert.equal((await f.patch({snapshot})).status,403);assert.equal(f.calls.filter(c=>c.method==='PATCH').length,0);});
test('stale saves are rejected before writing',async()=>{const f=fixture();assert.equal((await f.patch({snapshot,expected_updated_at:'stale'})).status,409);assert.equal(f.calls.filter(c=>c.method==='PATCH').length,0);});
test('updates use conditional revision and status filters',async()=>{const f=fixture();assert.equal((await f.patch({snapshot})).status,200);const call=f.calls.find(c=>c.method==='PATCH');assert.match(call.path,/updated_at=eq./);assert.match(call.path,/status=eq.draft/);});
test('reviewers can request changes but cannot import into owner editor',async()=>{const row={...initial,status:'submitted',author_id:other};const f=fixture({role:'editor',row});assert.equal((await f.patch({action:'request_changes',feedback:'Please add the source.'})).status,200);assert.equal(f.calls.find(c=>c.method==='PATCH').body.status,'changes_requested');const blocked=fixture({role:'editor',row});assert.equal((await blocked.patch({action:'import'})).status,403);assert.equal(blocked.calls.filter(c=>c.path.includes('/rpc/')).length,0);});
test('owner imports atomically and author name is assigned by server',async()=>{const f=fixture({owner:true,row:{...initial,status:'submitted'}});assert.equal((await f.patch({action:'import',author_name:'Forged'})).status,200);const call=f.calls.find(c=>c.path.includes('/rpc/'));assert.equal(call.body.p_expected,initial.updated_at);assert.equal(meta.smartMeta(call.body.p_details).publisherName,author.name);assert.equal(f.calls.some(c=>c.path.includes('/news_queue')),false);});
test('malformed and oversized block payloads are rejected; incomplete media drafts are saved safely',async()=>{for(const bad of [[null],[{type:'table',headers:null,rows:'invalid'}],[{type:'unknown'}]]){const f=fixture();assert.equal((await f.api.POST(f.req({snapshot:{...snapshot,blocks:bad}}))).status,400);}const f=fixture();assert.equal((await f.api.POST(f.req({snapshot:{...snapshot,blocks:[{type:'image',url:'',alt:''}]}}))).status,201);const g=fixture();assert.equal((await g.api.POST(g.req({submit:true,snapshot:{...snapshot,blocks:[{type:'image',url:'',alt:''}]}}))).status,400);});
test('team permissions fail closed when account is disabled and secrets stay server-side',async()=>{let token='access';const calls=[];const api=load('lib/editor-team.ts',{'next/headers':{cookies:async()=>({get:()=>({value:token})})},'./admin-auth':{isAdmin:async()=>false}},{process:{env:{SUPABASE_URL:'https://database.test',SUPABASE_SERVICE_ROLE_KEY:'server-only-key'}},fetch:async(url,options)=>{calls.push({url,options});return Response.json(url.includes('/auth/')?{id:author.id}:[]);}});assert.equal(await api.currentWriter(),null);assert.match(calls[1].url,/active=eq.true/);assert.equal(calls[0].options.headers.Authorization,'Bearer access');token='';assert.equal(await api.currentWriter(),null);assert.equal(calls.length,2);});
test('team tables and import function grant no public access',()=>{const sql=fs.readFileSync('supabase/private-editor-team-migration.sql','utf8');assert.match(sql,/revoke all on public.editor_team, public.editor_submissions from anon, authenticated/);assert.match(sql,/for update/);assert.match(sql,/item.updated_at <> p_expected/);assert.match(sql,/'draft',now\(\),now\(\)/);assert.match(sql,/revoke all on function .* from public, anon, authenticated/);});
test('templates use independent block objects and duplicate headings get unique anchors',()=>{const t=load('lib/article-templates.ts');const a=t.templateBlocks('admission'),b=t.templateBlocks('admission');assert.notEqual(a[0].anchor,b[0].anchor);assert.equal(a[1].text,'');const block={type:'table',headers:['School'],rows:[['LASU']]};const copy=t.duplicateArticleBlock(block);copy.rows[0][0]='Other';assert.equal(block.rows[0][0],'LASU');assert.notEqual(t.duplicateArticleBlock(a[0]).anchor,a[0].anchor);});
test('owner invitation consumes the raw GoTrue generate_link response and never sends mail',async()=>{
 const calls=[];const api=load('app/api/admin/team/route.ts',{'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'../../../../lib/admin-auth':{isAdmin:async()=>true},'../../../../lib/editor-team':{EditorError,memberFields:'id,email,name,role,active,created_at',teamRequest:async(path,init={})=>{calls.push({path,...init});if(path.includes('/admin/generate_link'))return{id:author.id,hashed_token:'a'.repeat(64)};return[];}}});
 const r=await api.POST(new Request('https://editor.test/api/admin/team',{method:'POST',body:JSON.stringify({email:author.email,name:author.name,role:'writer'})}));
 assert.equal(r.status,200);assert.equal((await r.json()).invitation,`/admin/writer#invite=${'a'.repeat(64)}`);const saved=JSON.parse(calls.find(c=>c.path==='/rest/v1/editor_team').body);assert.equal(saved.id,author.id);assert.equal(calls.some(c=>c.path==='/auth/v1/invite'),false);
});
