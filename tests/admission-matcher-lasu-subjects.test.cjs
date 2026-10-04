const test=require('node:test');
const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {matchCandidate}=loadMatcher('lib/admission-matcher/match');
const evidence=require('../docs/admission-matcher/audit/ibass-2026-10-04/lasu-science-health-subjects.json');

test('eight LASU subject captures reject missing compulsory subjects while keeping sitting eligibility unresolved',()=>{
  for(const captured of evidence.records){
    const rows=data.filter(row=>row.institutionId==='lasu'&&row.programme===captured.programme);
    assert.equal(rows.length,1,captured.programme);
    const row=rows[0];
    assert.ok(row.sources.some(source=>source.locator===`Course ID ${captured.courseId}`&&source.lastVerified==='2026-10-04'));
    const candidate={programme:captured.programme,utmeScore:245,utmeSubjects:['Physics','Chemistry','Biology'],olevelCredits:['English Language','Mathematics','Physics','Chemistry','Biology'],sittings:1,firstChoiceInstitution:'lasu'};
    assert.equal(matchCandidate(candidate,rows)[0].status,'review');
    assert.equal(matchCandidate({...candidate,utmeSubjects:['Physics','Mathematics','Biology']},rows)[0].status,'not_match');
    assert.equal(matchCandidate({...candidate,olevelCredits:candidate.olevelCredits.filter(subject=>subject!=='Chemistry')},rows)[0].status,'not_match');
    const withMathematics=matchCandidate({...candidate,utmeSubjects:['Mathematics','Chemistry','Biology']},rows)[0];
    assert.equal(withMathematics.status,['Biochemistry','Microbiology'].includes(captured.programme)?'review':'not_match');
    assert.deepEqual(row.unresolvedChecks,['sittings']);
    assert.equal(row.maximumSittings,undefined);
  }
});

test('unsupported priority sitting citations never yield an automatic match or a sitting failure',()=>{
  const names=['Medicine and Surgery','Nursing','Medical Laboratory Science','Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering'];
  for(const name of names){
    const row=data.find(row=>row.institutionId==='lasu'&&row.programme===name);
    assert.ok(!row.sources.some(source=>source.url===evidence.sittingEvidenceIssue.url));
    const candidate={programme:name,utmeScore:245,utmeSubjects:row.requiredUtmeSubjects,olevelCredits:[...new Set([...row.requiredOlevelCredits,'Biology','Further Mathematics'])],sittings:2,firstChoiceInstitution:'lasu'};
    const result=matchCandidate(candidate,[row])[0];
    assert.equal(result.status,'review',name);
    assert.ok(result.needsReview.some(reason=>reason.includes('sitting')));
    assert.deepEqual(result.failed,[]);
  }
});
