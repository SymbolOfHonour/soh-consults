require('../scripts/ask-soh-test-loader.cjs');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {POST}=require('../app/api/lasu/requirements/route.ts');
const {GET}=require('../app/api/lasu/programmes/route.ts');
const {readLasuBackup,saveLasuBackup}=require('../lib/lasu-backup.ts');
const request=id=>new Request('https://example.test/api/lasu/requirements',{method:'POST',body:JSON.stringify({courseId:id})});
const original=global.fetch;
const accountingHtml=require('node:fs').readFileSync('tests/fixtures/lasu-accounting-2026-11-14.html','utf8');
const html=accountingHtml.replace(/0811/g,'0631').replace(/Accounting/g,'Political Science').replace(/ENG, MAT, ECO, and any subject from Social Science/g,'ENG, MAT, GOV');
test('LASU live and outage recovery',async t=>{
 const oldUrl=process.env.SUPABASE_URL,oldKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
 delete process.env.SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;
 try {
 await t.test('live changes appear on each request',async()=>{let calls=0;global.fetch=async()=>{calls++;return new Response(html.replace('ENG, MAT, GOV',calls===1?'ENG, MAT, GOV':'ENG, GOV, ECO'))};let a=await(await POST(await request('0631'))).json();let b=await(await POST(await request('0631'))).json();assert.equal(a.mode,'live');assert.match(b.utme,/ECO/);assert.equal(calls,2)});
 for(const [name,response] of [['HTTP error',()=>new Response('down',{status:503})],['HTML error page',()=>new Response('<!DOCTYPE html><h1>Unavailable</h1>')],['timeout',()=>{throw new DOMException('timeout','TimeoutError')}],['partial result',()=>new Response(html.replace('JAMB UTME Subject Requirements','Missing heading'))]]) {
 await t.test(name+' uses dated backup',async()=>{global.fetch=async()=>response();const result=await(await POST(await request('0631'))).json();assert.equal(result.mode,'backup');assert.ok(result.retrievedAt.startsWith('2026-11-14')); assert.ok(result.utme.length > 0)});
 }
 await t.test('missing backup never invents requirements',async()=>{global.fetch=async()=>{throw Error('offline')};const response=await POST(await request('999999'));assert.equal(response.status,502);assert.equal((await response.json()).success,false)});
 await t.test('invalid IDs rejected before network',async()=>{global.fetch=async()=>{throw Error('must not fetch')};assert.equal((await POST(await request('../x'))).status,400)});
 await t.test('programme selector survives outage',async()=>{global.fetch=async()=>{throw Error('offline')};const result=await(await GET()).json();assert.equal(result.mode,'backup');assert.ok(result.programmes.some(p=>p.id==='0631'))});
 await t.test('durable backup survives new reads',async()=>{process.env.SUPABASE_URL='https://storage.example';process.env.SUPABASE_SERVICE_ROLE_KEY='test';let saved;global.fetch=async(url,init)=>{if(init.method==='POST'){saved=JSON.parse(init.body);return new Response(null,{status:204})}return Response.json([{details:saved.details}])};const record={courseId:'0631',programme:'Political Science',oLevel:'Updated official O-Level',utme:'Updated official UTME',retrievedAt:'2026-11-15T10:00:00Z'};await saveLasuBackup(record);assert.equal(saved.status,'archived');assert.deepEqual(await readLasuBackup('0631'),record);await assert.rejects(()=>saveLasuBackup({...record,utme:'',oLevel:''}));});
 } finally {global.fetch=original;if(oldUrl===undefined)delete process.env.SUPABASE_URL;else process.env.SUPABASE_URL=oldUrl;if(oldKey===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=oldKey;}
});

test('fallback catalogue preserves all 113 official programmes and corrected IDs',()=>{
 const rows=require('../data/lasu-requirements-snapshot.json');
 assert.equal(rows.length,113);assert.equal(new Set(rows.map(r=>r.courseId)).size,113);
 assert.equal(rows.find(r=>r.programme==='Accounting').courseId,'0811');
 assert.equal(rows.find(r=>r.programme==='Social Studies and Civic Education').courseId,'0160');
 const page=require('node:fs').readFileSync('app/lasu-calculator/page.tsx','utf8');
 assert.ok(!page.includes('Showing saved official requirements'));
 assert.ok(!page.includes('programmes from the saved LASU catalogue'));
});
