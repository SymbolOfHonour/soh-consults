const test=require('node:test');
const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {mergeProgrammeEvidence}=loadMatcher('lib/admission-matcher/merge-evidence');
const {nationalRequirementsForProgramme,reconciledCuratedRequirementsForProgramme}=loadMatcher('lib/admission-matcher/national-catalogue');
const {admissionMatcherRequirements}=loadMatcher('lib/admission-matcher/data/index');

test('server evidence replacements preserve registered identities and never duplicate curated journeys',()=>{
 const overrides=['Accounting','Biochemistry','Computer Science','Civil Engineering'].flatMap(reconciledCuratedRequirementsForProgramme);
 assert.ok(overrides.length>0);
 const combined=mergeProgrammeEvidence(admissionMatcherRequirements,[],overrides);
 assert.equal(combined.length,admissionMatcherRequirements.length);
 for(const row of overrides){assert.ok(admissionMatcherRequirements.some(old=>old.institutionId===row.institutionId&&old.programme===row.programme&&old.verificationStatus!=='verified'));assert.equal(combined.filter(item=>item.institutionId===row.institutionId&&item.programme===row.programme).length,1);}
 assert.throws(()=>mergeProgrammeEvidence(admissionMatcherRequirements,[],[{...overrides[0],institutionId:'different-school'}]));
 assert.throws(()=>mergeProgrammeEvidence(admissionMatcherRequirements,[],[overrides[0],overrides[0]]));
});

test('ampersand searches reach the same confirmed Medicine listing without changing offering evidence',()=>{
 const and=nationalRequirementsForProgramme('Medicine and Surgery').find(row=>row.institutionId==='unilag');
 const amp=nationalRequirementsForProgramme('Medicine & Surgery').find(row=>row.institutionId==='unilag');
 assert.ok(and);assert.deepEqual(amp,and);
});
