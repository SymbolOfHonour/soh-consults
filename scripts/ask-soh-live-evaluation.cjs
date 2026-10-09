require('./ask-soh-test-loader.cjs');
const fs=require('node:fs'),assert=require('node:assert/strict');
const {INSTITUTIONS}=require('../lib/ask-soh/institution-registry.ts');
const {discoverOfficialSources,searchProviderSources}=require('../lib/ask-soh/source-discovery.ts');
const {verifyAnswer}=require('../lib/ask-soh/answer-verification.ts');
const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');
(async()=>{
 const keys=['unilorin','lasu','fuoye','lasustech','uniosun','jamb','waec','neco'];const rows=[];
 for(let start=0;start<keys.length;start+=4)await Promise.all(keys.slice(start,start+4).map(async key=>{
  const inst=INSTITUTIONS.find(i=>i.key===key),question=key+' 2026/2027 registration deadline';
  const discovery=await discoverOfficialSources(inst,question,'2026/2027',{useCache:false,timeoutMs:12000});
  const providers=await searchProviderSources(question,inst,{timeoutMs:12000});const docs=[...discovery.documents,...providers.documents];const answer=verifyAnswer(question,resolveQuestion(question),docs);
  assert.ok(answer.confidence!=='high'||answer.citations.every(d=>d.official&&d.verified&&d.kind!=='homepage'));
  rows.push({institution:key,question,documents:docs.map(d=>({url:d.url,title:d.title,kind:d.kind,publishedAt:d.publishedAt,session:d.session,characters:d.snippet.length})),answer,gaps:[...discovery.gaps,...providers.gaps]});console.log(key+': '+docs.length+' fetched documents; '+answer.confidence+' confidence; '+answer.reason);
 }));
 const output=process.argv[2]||'/tmp/ask-soh-live-evaluation.json';fs.writeFileSync(output,JSON.stringify({ranAt:new Date().toISOString(),rows},null,2));console.log('Evidence saved: '+output);
})().catch(e=>{console.error(e);process.exitCode=1;});
