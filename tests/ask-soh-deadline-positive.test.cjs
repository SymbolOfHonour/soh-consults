require('../scripts/ask-soh-test-loader.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const {verifyAnswer,parseCalendarDate,rankDocuments}=require('../lib/ask-soh/answer-verification.ts');
const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');
const q=resolveQuestion('LASU 2026/2027 screening deadline');
const doc=(text,extra={})=>({title:'LASU 2026/2027 screening',url:'https://lasu.edu.ng/notice',snippet:text,official:true,verified:true,kind:'article',fetchedAt:new Date().toISOString(),publishedAt:'2026-07-01T00:00:00Z',...extra});
for(const [raw,expected] of [['15 October 2026','2026-10-15'],['15/10/2026','2026-10-15'],['August 9, 2026','2026-08-09'],['2026-10-15','2026-10-15'],['31 February 2026',null]])test('calendar '+raw,()=>assert.equal(parseCalendarDate(raw),expected));
for(const label of ['Closing date:','Registration closes on','Registration deadline is','Deadline for application:'])test(label,()=>assert.equal(verifyAnswer('',q,[doc('2026/2027 screening. '+label+' 15 October 2026.')]).confidence,'high'));
test('extension marker dates extracted',()=>assert.match(verifyAnswer('',q,[doc('2026/2027 screening registration extended to 15 October 2026.')]).answer,/15 October/));
test('newer dated extension supersedes original',()=>{const result=verifyAnswer('',q,[doc('2026/2027 screening. Closing date: 12 July 2026.'),doc('2026/2027 screening. Registration extended to 9 August 2026.',{url:'https://lasu.edu.ng/extension',publishedAt:'2026-07-10T00:00:00Z'})]);assert.equal(result.confidence,'high');assert.match(result.answer,/9 August/);});
for(const [label,docs] of [
 ['undated extension',[doc('2026/2027 screening. Closing date: 12 July 2026.'),doc('2026/2027 screening. Registration extended to 9 August 2026.',{publishedAt:null,url:'https://lasu.edu.ng/extension'})]],
 ['competing notices',[doc('2026/2027 screening. Closing date: 12 July 2026.'),doc('2026/2027 screening. Closing date: 9 August 2026.',{url:'https://lasu.edu.ng/other'})]]
])test(label,()=>{const r=verifyAnswer('',q,docs);assert.equal(r.contradiction,true);assert.equal(r.needsHuman,true);assert.equal(r.confidence,'low');});
for(const [label,extra,text] of [
 ['wrong session',{},'2025/2026 screening. Closing date: 15 October 2026.'],
 ['mixed sessions',{},'2026/2027 screening. Closing date: 15 October 2026. 2025/2026 admissions.'],
 ['homepage',{kind:'homepage'},'2026/2027 screening. Closing date: 15 October 2026.'],
 ['search snippet',{verified:false,kind:'search'},'2026/2027 screening. Closing date: 15 October 2026.'],
 ['lookalike domain',{url:'https://lasu.edu.ng.evil.test/notice'},'2026/2027 screening. Closing date: 15 October 2026.'],
 ['old fetch',{fetchedAt:'2020-01-01T00:00:00Z'},'2026/2027 screening. Closing date: 15 October 2026.'],
 ['portal action',{kind:'portal'},'2026/2027 screening. Start Screening.']
])test('refuses '+label,()=>{const r=verifyAnswer('',q,[doc(text,extra)]);assert.equal(r.confidence,'low');assert.equal(r.needsHuman,true);});
test('missing session asks clarification',()=>assert.match(verifyAnswer('',resolveQuestion('LASU screening deadline'),[doc('2026/2027 screening. Closing date: 15 October 2026.')]).answer,/academic session/));
test('publication date missing is never high',()=>assert.equal(verifyAnswer('',q,[doc('2026/2027 screening. Closing date: 15 October 2026.',{publishedAt:null})]).confidence,'medium'));
test('cutoff conflict cannot select first score',()=>{const c=resolveQuestion('LASU 2026/2027 minimum JAMB score');const r=verifyAnswer('',c,[doc('2026/2027 Minimum UTME score of 195.'),doc('2026/2027 Minimum UTME score of 200.',{url:'https://lasu.edu.ng/other'})]);assert.equal(r.contradiction,true);});
test('rank article above homepage',()=>assert.equal(rankDocuments([doc('2026/2027 screening',{kind:'homepage',url:'https://lasu.edu.ng/'}),doc('2026/2027 screening')],'screening',q)[0].kind,'article'));
