const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const names=['Medicine and Surgery','Nursing','Medical Laboratory Science','Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering'];
const byName=(name)=>data.find(r=>r.institutionId==='lasu'&&r.programme===name);
test('LASU priority programmes have one active record and complete source-backed baseline checks',()=>{
 for(const name of names){const rows=data.filter(r=>r.institutionId==='lasu'&&r.programme===name);assert.equal(rows.length,1,name);const r=rows[0];assert.equal(r.minimumUtmeScore,195);assert.equal(r.firstChoiceRequired,true);assert.equal(r.verificationStatus,'verified');assert.deepEqual(r.unresolvedChecks,[]);assert.ok(r.maximumSittings===1||r.maximumSittings===2,name);}
});
test('LASU clinical programmes preserve explicit Physics Chemistry Biology combination and sitting rules',()=>{
 for(const name of ['Medicine and Surgery','Nursing','Medical Laboratory Science']){const r=byName(name);assert.deepEqual(r.requiredUtmeSubjects,['Physics','Chemistry','Biology']);assert.deepEqual(r.requiredOlevelCredits,['English Language','Mathematics','Physics','Chemistry','Biology']);assert.equal(r.minimumOlevelCreditCount,5);}
 assert.equal(byName('Medicine and Surgery').maximumSittings,1);
 assert.equal(byName('Nursing').maximumSittings,2);
 assert.equal(byName('Medical Laboratory Science').maximumSittings,2);
});
test('LASU engineering priority programmes preserve explicit Mathematics Physics Chemistry combination',()=>{
 for(const name of ['Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering']){const r=byName(name);assert.deepEqual(r.requiredUtmeSubjects,['Mathematics','Physics','Chemistry']);assert.equal(r.maximumSittings,2);assert.ok(r.requiredOlevelCredits.includes('English Language'));assert.ok(r.requiredOlevelCredits.includes('Mathematics'));assert.ok(r.requiredOlevelCredits.includes('Physics'));assert.ok(r.requiredOlevelCredits.includes('Chemistry'));}
 assert.equal(byName('Aerospace Engineering').minimumOlevelCreditCount,6);
 assert.ok(byName('Aerospace Engineering').requiredOlevelCredits.includes('Further Mathematics'));
});
