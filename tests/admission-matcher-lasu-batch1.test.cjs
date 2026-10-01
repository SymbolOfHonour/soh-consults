const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const names=['Medicine and Surgery','Nursing','Medical Laboratory Science','Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering'];
const byName=(name)=>data.find(r=>r.institutionId==='lasu'&&r.programme===name);
test('LASU batch 1 has one active record per programme and stays review-only until sittings are current-source verified',()=>{
 for(const name of names){const rows=data.filter(r=>r.institutionId==='lasu'&&r.programme===name);assert.equal(rows.length,1,name);const r=rows[0];assert.equal(r.minimumUtmeScore,195);assert.equal(r.firstChoiceRequired,true);assert.equal(r.verificationStatus,'review');assert.deepEqual(r.unresolvedChecks,['sittings']);assert.ok(!r.maximumSittings,name);}
});
test('LASU clinical batch uses the explicit Physics Chemistry Biology UTME combination and five named O-Level credits',()=>{
 for(const name of ['Medicine and Surgery','Nursing','Medical Laboratory Science']){const r=byName(name);assert.deepEqual(r.requiredUtmeSubjects,['Physics','Chemistry','Biology']);assert.deepEqual(r.requiredOlevelCredits,['English Language','Mathematics','Physics','Chemistry','Biology']);assert.equal(r.minimumOlevelCreditCount,5);}
});
test('LASU engineering batch preserves explicit Mathematics Physics Chemistry UTME combination without inventing a sitting rule',()=>{
 for(const name of ['Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering']){const r=byName(name);assert.deepEqual(r.requiredUtmeSubjects,['Mathematics','Physics','Chemistry']);assert.ok(r.requiredOlevelCredits.includes('English Language'));assert.ok(r.requiredOlevelCredits.includes('Mathematics'));assert.ok(r.requiredOlevelCredits.includes('Physics'));assert.ok(r.requiredOlevelCredits.includes('Chemistry'));}
 assert.equal(byName('Aerospace Engineering').minimumOlevelCreditCount,6);
 assert.ok(byName('Aerospace Engineering').requiredOlevelCredits.includes('Further Mathematics'));
});
