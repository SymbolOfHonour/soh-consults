const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const lasu=data.filter(r=>r.institutionId==='lasu');

test('LASU active dataset has one record per programme',()=>{
 const seen=new Set();for(const r of lasu){const key=r.programme.trim().toLowerCase();assert.ok(!seen.has(key),`duplicate LASU programme: ${r.programme}`);seen.add(key);}
 assert.ok(lasu.length>=100,`expected full LASU catalogue, got ${lasu.length}`);
});

test('every LASU record carries the current institutional screening baseline',()=>{
 for(const r of lasu){assert.equal(r.minimumUtmeScore,195,r.programme);assert.equal(r.scoreScope,'institution-screening',r.programme);assert.equal(r.firstChoiceRequired,true,r.programme);assert.equal(r.screeningMethod,'online',r.programme);assert.ok(r.sources.some(s=>String(s.url).includes('services.lidc.lasu.edu.ng/admissionscreening')),r.programme);}
});

test('LASU review records expose every unresolved decision instead of guessing eligibility',()=>{
 for(const r of lasu.filter(r=>r.verificationStatus==='review')){assert.ok(r.unresolvedChecks?.length,r.programme);assert.ok(r.reviewReasons?.length,r.programme);if(r.unresolvedChecks.includes('sittings'))assert.equal(r.maximumSittings,undefined,r.programme);}
});

test('LASU verified records may exist only when all machine decisions are complete',()=>{
 for(const r of lasu.filter(r=>r.verificationStatus==='verified')){assert.ok(!r.unresolvedChecks?.length,r.programme);assert.ok(r.maximumSittings,r.programme);assert.ok(r.minimumOlevelCreditCount,r.programme);const slots=r.requiredUtmeSubjects.length+(r.utmeGroups??[]).reduce((n,g)=>n+g.count,0)+(r.utmeAlternatives??[]).reduce((n,g,i)=>n+(r.utmeAlternativeMinimums?.[i]??1),0);assert.equal(slots,3,r.programme);}
});

test('LASU completion audit reports the exact current verification boundary',()=>{
 const verified=lasu.filter(r=>r.verificationStatus==='verified');const review=lasu.filter(r=>r.verificationStatus==='review');const reasons={};for(const r of review)for(const u of r.unresolvedChecks??[])reasons[u]=(reasons[u]??0)+1;
 console.log('LASU audit:',JSON.stringify({total:lasu.length,verified:verified.length,review:review.length,unresolved:reasons}));
 assert.equal(verified.length+review.length,lasu.length);
});
