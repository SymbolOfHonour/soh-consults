const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {loadMatcher} = require('./admission-matcher-helper.cjs');
const {parseCheckerSubjects, checkerRuleSatisfied} = loadMatcher('lib/admission-matcher/upstream/checker-subjects');
const {validateCheckerSubjectSnapshot} = loadMatcher('lib/admission-matcher/checker-subjects');
const {nationalRequirementsForProgramme} = loadMatcher('lib/admission-matcher/national-catalogue');
const {matchCandidate} = loadMatcher('lib/admission-matcher/match');
const folder = path.join(__dirname,'../docs/admission-matcher/audit/ibass-2026-10-04');
const probes = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(folder,'parity-probes.json.gz')))).probes;
const audit = require('../docs/admission-matcher/audit/ibass-2026-10-04/checker-subject-reconciliation.json');
const compact = require('../lib/admission-matcher/data/checker-subjects-2026-10-04.json');
const catalogue = require('../lib/admission-matcher/data/national-catalogue-2026-10-04.json');

test('every deployed checker component reproduces all saved official outcomes including positive and negative cases',()=>{
  for (const row of audit.records) for (const kind of ['utme','olevel']) {
    const component = row.components[kind];
    if(component.status !== 'parity-confirmed') continue;
    assert.ok(component.checks.some(check=>check.qualified===true));
    assert.ok(component.checks.some(check=>check.qualified===false));
    for(const check of component.checks) {
      const probe = probes[check.probeIndex];
      assert.equal(checkerRuleSatisfied(component.rule,probe.request[kind==='utme'?'utme_subjects':'olevel_credit']),check.qualified);
      assert.equal(check.agrees,true);
    }
  }
  execFileSync('node',['docs/admission-matcher/tools/build-checker-subjects.cjs','--check'],{cwd:path.join(__dirname,'..')});
});

test('categorical, incomplete, unpublished, cross-institution and malformed checker configurations remain unresolved',()=>{
  const baseline = probes.find(probe=>probe.family==='Medicine'&&probe.variant==='baseline');
  const config = baseline.response.programme_utme_subject_data;
  assert.ok(parseCheckerSubjects(config,'utme',1345));
  for(const mutate of [value=>value.institution=1319,value=>value.ispublished='no',value=>value.optional_subjects_by_group2='Science',value=>value.required_subjects=',English Language,Biology,',value=>value.subject_count=1.5,value=>value.optional_subjects=',Unknown Science,',value=>value.required_subjects=',English Language,Biology,Biology,Physics,']) {
    const value = structuredClone(config);mutate(value);assert.equal(parseCheckerSubjects(value,'utme',1345),null);
  }
  const specialist=audit.records.find(row=>row.programme==='BIOMEDICAL ENGINEERING');
  assert.ok(specialist);assert.equal(specialist.components.utme.status,'review');
  assert.ok(specialist.components.utme.reasons.some(reason=>reason.includes('Positive and negative')));
});

test('Architecture alternatives allocate Fine Arts or Technical Drawing as one credit and preserve the separate elective',()=>{
  const row=compact.records.find(row=>row.programme==='ARCHITECTURE');assert.ok(row.olevel);
  const core=['English Language','Mathematics','Physics'];
  assert.equal(checkerRuleSatisfied(row.olevel,[...core,'Fine Arts','Biology']),true);
  assert.equal(checkerRuleSatisfied(row.olevel,[...core,'Technical Drawing','Geography']),true);
  assert.equal(checkerRuleSatisfied(row.olevel,[...core,'Fine Arts','Technical Drawing']),false);
});

test('UNILAG Medicine combines checker parity and the current screening notice without claiming admission',()=>{
  const rows=nationalRequirementsForProgramme('MEDICINE AND SURGERY').filter(row=>row.institutionId==='unilag');
  assert.equal(rows.length,1);
  const candidate={programme:'MEDICINE AND SURGERY',utmeScore:250,utmeSubjects:['Biology','Chemistry','Physics'],olevelCredits:['English Language','Mathematics','Biology','Chemistry','Physics'],sittings:1,firstChoiceInstitution:'unilag'};
  const positive=matchCandidate(candidate,rows)[0];assert.equal(positive.status,'match');assert.deepEqual(positive.failed,[]);
  assert.ok(positive.passed.some(reason=>reason.startsWith('UTME compulsory')));
  assert.ok(positive.passed.some(reason=>reason.startsWith("O'Level credit compulsory")));
  assert.deepEqual(positive.needsReview,[]);
  assert.equal(matchCandidate({...candidate,utmeScore:199},rows)[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,sittings:2},rows)[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,firstChoiceInstitution:'ui'},rows)[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,firstChoiceInstitution:undefined},rows)[0].status,'review');
  assert.equal(matchCandidate({...candidate,certificateType:'NBC',olevelCredits:['English Language']},rows)[0].status,'review');
  assert.equal(matchCandidate({...candidate,utmeSubjects:['Biology','Chemistry','Government']},rows)[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,olevelCredits:['English Language','Mathematics','Biology','Chemistry','Government']},rows)[0].status,'not_match');
});

test('UI Nursing has confirmed subject components but no invented screening score or sitting overlay',()=>{
  const rows=nationalRequirementsForProgramme('NURSING/NURSING SCIENCE').filter(row=>row.institutionId==='ui');assert.equal(rows.length,1);
  const result=matchCandidate({programme:'NURSING/NURSING SCIENCE',utmeScore:400,utmeSubjects:['Biology','Chemistry','Physics'],olevelCredits:['English Language','Mathematics','Biology','Chemistry','Physics'],sittings:1},rows)[0];
  assert.equal(result.status,'review');assert.deepEqual(result.failed,[]);
  assert.ok(result.needsReview.some(reason=>reason.includes('screening score')));
  assert.ok(result.needsReview.some(reason=>reason.includes('sitting restriction')));
});

test('checker imports refuse orphan, duplicate, moved, malformed and incomplete offering identities',()=>{
  for(const mutate of [value=>value.records.push(value.records[0]),value=>value.records[0].institutionId=999999,value=>value.records[0].offeringIds=[],value=>value.records[0].utme.requiredSubjects=['Physics'],value=>value.records[0].sourceUrl='https://example.com/',value=>value.records[0].utme=null]) {
    const value=structuredClone(compact);mutate(value);
    // Removing one independently confirmed component is allowed only when the
    // other is complete; null both to test a content-free unsafe import.
    if(value.records[0].utme===null)value.records[0].olevel=null;
    assert.throws(()=>validateCheckerSubjectSnapshot(value,catalogue.pairs,catalogue.programmes));
  }
});
