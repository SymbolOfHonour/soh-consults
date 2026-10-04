const test=require('node:test');
const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {matchCandidate}=loadMatcher('lib/admission-matcher/match');
const evidence=require('../docs/admission-matcher/audit/ibass-2026-10-04/lasu-science-health-subjects.json');

test('eight LASU subject captures reject missing compulsory subjects with current two-sitting eligibility',()=>{
  for(const captured of evidence.records){
    const rows=data.filter(row=>row.institutionId==='lasu'&&row.programme===captured.programme);
    assert.equal(rows.length,1,captured.programme);
    const row=rows[0];
    assert.ok(row.sources.some(source=>source.locator===`Course ID ${captured.courseId}`&&source.lastVerified==='2026-10-04'));
    const candidate={programme:captured.programme,utmeScore:245,utmeSubjects:['Physics','Chemistry','Biology'],olevelCredits:['English Language','Mathematics','Physics','Chemistry','Biology'],sittings:1,firstChoiceInstitution:'lasu'};
    assert.equal(matchCandidate(candidate,rows)[0].status,'match');
    assert.equal(matchCandidate({...candidate,sittings:2},rows)[0].status,'match');
    assert.equal(matchCandidate({...candidate,utmeSubjects:['Physics','Mathematics','Biology']},rows)[0].status,'not_match');
    assert.equal(matchCandidate({...candidate,olevelCredits:candidate.olevelCredits.filter(subject=>subject!=='Chemistry')},rows)[0].status,'not_match');
    const withMathematics=matchCandidate({...candidate,utmeSubjects:['Mathematics','Chemistry','Biology']},rows)[0];
    assert.equal(withMathematics.status,['Biochemistry','Microbiology'].includes(captured.programme)?'match':'not_match');
    assert.deepEqual(row.unresolvedChecks,[]);
    assert.equal(row.maximumSittings,2);
  }
});

test('current priority limits use the UTME announcement and keep unresolved engineering credits in review',()=>{
  const names=['Medicine and Surgery','Nursing','Medical Laboratory Science','Chemical Engineering','Civil Engineering','Mechanical Engineering','Electronics and Computer Engineering','Aerospace Engineering'];
  for(const name of names){
    const row=data.find(row=>row.institutionId==='lasu'&&row.programme===name);
    assert.ok(!row.sources.some(source=>source.url===evidence.sittingEvidenceIssue.url));
    const candidate={programme:name,utmeScore:245,utmeSubjects:row.requiredUtmeSubjects,olevelCredits:[...new Set([...row.requiredOlevelCredits,'Biology','Further Mathematics'])],sittings:2,firstChoiceInstitution:'lasu'};
    const result=matchCandidate(candidate,[row])[0];
    assert.ok(row.sources.some(source=>source.url==='https://lasu.edu.ng/home/news/read.php?id=642'));
    assert.equal(result.status,name==='Medicine and Surgery'?'not_match':['Nursing','Medical Laboratory Science'].includes(name)?'match':'review',name);
    if(name==='Medicine and Surgery')assert.ok(result.failed.some(reason=>reason.includes('maximum of 1')));
    else assert.deepEqual(result.failed,[]);
  }
});
