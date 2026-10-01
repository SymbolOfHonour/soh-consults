const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const rows=id=>data.filter(r=>r.institutionId===id);

test('FUOYE promotes only source-complete engineering rules and keeps unresolved programmes review-safe',()=>{
 const fuoye=rows('fuoye');const verified=fuoye.filter(r=>r.verificationStatus==='verified');
 const expected=new Set(['Agricultural and Bioresources Engineering','Civil Engineering','Computer Engineering','Electrical and Electronics Engineering','Mechanical Engineering','Mechatronics Engineering','Metallurgical and Materials Engineering']);
 assert.deepEqual(new Set(verified.map(r=>r.programme)),expected);
 for(const r of verified){assert.equal(r.maximumSittings,2,r.programme);assert.equal(r.minimumOlevelCreditCount,5,r.programme);assert.equal(r.requiredUtmeSubjects.length,3,r.programme);assert.ok(r.sources.some(s=>String(s.url).includes('engineering.fuoye.edu.ng')),r.programme);}
 for(const r of fuoye.filter(r=>!expected.has(r.programme))){assert.equal(r.verificationStatus,'review',r.programme);assert.ok(r.unresolvedChecks?.length,r.programme);}
});

test('UNIOSUN stays review-only until institutional programme waivers are reconciled',()=>{
 const uniosun=rows('uniosun');assert.ok(uniosun.length>0);for(const r of uniosun){assert.equal(r.verificationStatus,'review',r.programme);assert.ok(r.unresolvedChecks?.includes('utme'),r.programme);assert.ok(r.unresolvedChecks?.includes('olevel'),r.programme);assert.equal(r.firstChoiceRequired,true,r.programme);assert.ok(r.maximumSittings,r.programme);}
});

test('LASUSTECH preserves the explicit review boundary for programmes whose complete machine-safe rules remain unresolved',()=>{
 const tech=rows('lasustech');assert.ok(tech.length>=30);const review=tech.filter(r=>r.verificationStatus==='review');
 const expectedReview=new Set(['Aquaculture and Fisheries Management','Horticulture and Landscape Management','Arts and Industrial Design']);
 assert.deepEqual(new Set(review.map(r=>r.programme)),expectedReview);
 for(const r of review){assert.ok(r.reviewReasons?.length,r.programme);}
 for(const r of tech.filter(r=>r.verificationStatus==='verified')){assert.equal(r.minimumUtmeScore,195,r.programme);assert.equal(r.maximumSittings,2,r.programme);assert.equal(r.firstChoiceRequired,true,r.programme);assert.equal(r.minimumOlevelCreditCount,5,r.programme);}
});
