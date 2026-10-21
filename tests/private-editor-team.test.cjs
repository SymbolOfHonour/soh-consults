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
function invitationFixture({owner=true,existing=[],confirmed=false,mailFails=false,storageFails=false}={}) {
 const calls=[];
 const api=load('app/api/admin/team/route.ts',{'next/server':{NextResponse:{json:(v,o)=>Response.json(v,o)}},'../../../../lib/admin-auth':{isAdmin:async()=>owner},'../../../../lib/team-mail':{sendTeamMail:async(member)=>{calls.push({path:'/auth/v1/invite',body:{email:member.email}});if(mailFails)throw new EditorError('Email delivery could not be confirmed. Use Resend invitation.',503);}},'../../../../lib/editor-team':{EditorError,memberFields:'id,email,name,role,active,created_at',teamRequest:async(path,init={})=>{
  const body=init.body?JSON.parse(init.body):null;calls.push({path,...init,body});
  if(path.includes('/admin/generate_link'))return{id:author.id,hashed_token:'a'.repeat(64)};
  if(path.includes('/admin/users/'))return{email_confirmed_at:confirmed?'2026-10-21':null};
  if(path==='/auth/v1/invite'&&mailFails)throw Error('secret provider failure');
  if(path==='/rest/v1/editor_team'&&storageFails)throw Error('storage unavailable');
  return existing;
 }}});
 const post=(extra={})=>api.POST(new Request('https://editor.test/api/admin/team',{method:'POST',body:JSON.stringify({email:author.email,name:author.name,role:'writer',...extra})}));
 return{calls,post};
}
test('invitation provisions membership before sending and exposes no activation token',async()=>{
 const f=invitationFixture();const r=await f.post();assert.equal(r.status,200);assert.deepEqual(await r.json(),{emailed:true});
 const saved=f.calls.find(c=>c.path==='/rest/v1/editor_team');assert.equal(saved.body.id,author.id);
 assert.ok(f.calls.indexOf(saved)<f.calls.findIndex(c=>c.path==='/auth/v1/invite'));
 assert.equal(f.calls.find(c=>c.path==='/auth/v1/invite').body.email,author.email);
});
test('SMTP failure reports unconfirmed delivery and allows retry without recreating membership',async()=>{
 const f=invitationFixture({mailFails:true});const r=await f.post();assert.equal(r.status,503);const d=await r.json();assert.equal(d.emailed,false);assert.match(d.error,/Resend invitation/);assert.doesNotMatch(d.error,/secret provider/);
 const retry=invitationFixture({existing:[author]});assert.equal((await retry.post({action:'resend'})).status,200);assert.equal(retry.calls.some(c=>c.path.includes('generate_link')),false);assert.equal(retry.calls.some(c=>c.path==='/rest/v1/editor_team'),false);
});
test('mail is not sent if provisioning fails or the owner is unauthenticated',async()=>{
 for(const options of [{storageFails:true},{owner:false}]){const f=invitationFixture(options);assert.ok((await f.post()).status>=400);assert.equal(f.calls.some(c=>c.path==='/auth/v1/invite'),false);}
});
test('disabled, missing and activated accounts cannot receive invitation resends',async()=>{
 for(const options of [{existing:[]},{existing:[author],confirmed:true}]){const f=invitationFixture(options);assert.ok((await f.post({action:'resend'})).status>=400);assert.equal(f.calls.some(c=>c.path==='/auth/v1/invite'),false);}
 const f=invitationFixture({existing:[author]});await f.post({action:'resend'});assert.match(f.calls[0].path,/active=eq.true/);
});

test('writer login, invitation and recovery accept eight-character passwords and enforce both limits', async()=>{
 for(const mode of ['login','invite','recovery'])for(const length of [7,8,128,129]){
  const calls=[];
  const api=load('app/api/admin/writer/session/route.ts',{
   'next/server':{NextResponse:{json:(value,options)=>{const response=Response.json(value,options);response.cookies={set:()=>{}};return response;}}},
   '../../../../../lib/rate-limit':{checkRateLimit:async()=>({allowed:true})},
   '../../../../../lib/editor-team':{EditorError,WRITER_COOKIE:'writer',writerCookieOptions:()=>({}),teamRequest:async(path,init={})=>{
    calls.push({path,body:init.body?JSON.parse(init.body):null});
    if(path.includes('/verify')||path.includes('/token?'))return{access_token:'test-token',expires_in:3600,user:{id:author.id}};
    if(path.startsWith('/rest/'))return[author];
    return{};
   }}
  });
  const payload={email:author.email,password:'a'.repeat(length),...(mode==='login'?{}:{invite:'b'.repeat(64),recovery:mode==='recovery'})};
  const response=await api.POST(new Request('https://editor.test/api/admin/writer/session',{method:'POST',body:JSON.stringify(payload)}));
  if(length<8||length>128){assert.equal(response.status,400);assert.equal(calls.length,0);}
  else{assert.equal(response.status,200);assert.equal((await response.json()).member.id,author.id);if(mode!=='login'){assert.equal(calls[0].body.type,mode);assert.equal(calls.find(c=>c.path==='/auth/v1/user').body.password.length,length);}}
 }
});
