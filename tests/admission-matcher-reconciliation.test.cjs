const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {validateNationalReview,nationalReviewReasons}=loadMatcher('lib/admission-matcher/national-review');
const {nationalRequirementsForProgramme}=loadMatcher('lib/admission-matcher/national-catalogue');
const {matchCandidate}=loadMatcher('lib/admission-matcher/match');
const compact=require('../lib/admission-matcher/data/national-review-2026-10-04.json');
const catalogue=require('../lib/admission-matcher/data/national-catalogue-2026-10-04.json');
const root=path.resolve(__dirname,'..');
const audit=path.join(root,'docs/admission-matcher/audit/ibass-2026-10-04');
const ids=[...catalogue.pairs.flatMap(row=>row[2]),...catalogue.unresolvedOfferings.map(row=>row.offeringId)];
const read=name=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(audit,name))));

test('all 15696 offerings have hash-linked, reproducible reconciliation with no automatic promotions',()=>{
  const source=fs.readFileSync(path.join(audit,'evidence-snapshot.json.gz'));
  const original=JSON.parse(zlib.gunzipSync(source));
  const manifest=read('requirement-reconciliation.json.gz');
  assert.equal(manifest.sourceSnapshotSha256,crypto.createHash('sha256').update(source).digest('hex'));
  assert.equal(compact.sourceSnapshotSha256,manifest.sourceSnapshotSha256);
  assert.equal(manifest.records.length,original.records.length);
  const byId=new Map(original.records.map(row=>[row.offeringId,row]));
  for(const row of manifest.records){
    const captured=byId.get(row.offeringId);assert.ok(captured);
    assert.equal(row.institutionId,captured.institutionId);assert.equal(row.programmeId,captured.programmeId);
    assert.equal(row.sourceUrl,captured.sourceUrl);assert.equal(row.observedAt,captured.observedAt);
    assert.equal(row.verificationStatus,'review');assert.ok(row.blockers.includes('screening-review'));
    for(const [field,ref] of Object.entries(row.evidenceRefs))assert.equal(ref,captured[field]);
  }
  execFileSync('python',['docs/admission-matcher/tools/reconcile-requirements.py','--check'],{cwd:root});
});

test('missing, orphan, duplicate, malformed and unsafe reconciliation imports fail closed',()=>{
  const mutate=fn=>{const value=structuredClone(compact);fn(value);assert.throws(()=>validateNationalReview(value,ids));};
  mutate(value=>value.offerings.pop());mutate(value=>value.offerings.push(value.offerings[0]));
  mutate(value=>value.offerings[0][0]=-1);mutate(value=>value.offerings[0][1]=0);
  mutate(value=>value.offerings[0][1]=2**value.codes.length);
  mutate(value=>value.offerings[0][1]=1);mutate(value=>value.codes.reverse());
  mutate(value=>value.sourceSnapshotSha256='bad');mutate(value=>delete value.messages['missing-utme']);
  assert.throws(()=>nationalReviewReasons([99999999]));assert.throws(()=>nationalReviewReasons([]));
});

test('source differences are preserved and wording-only captures never become matches',()=>{
  const manifest=read('requirement-reconciliation.json.gz');
  const conflict=manifest.records.find(row=>row.blockers.includes('source-differences')&&row.programme==='ARCHITECTURE');
  assert.ok(conflict);
  const reasons=nationalReviewReasons([conflict.offeringId]);assert.ok(reasons.some(reason=>reason.includes('different requirement evidence')));
  const rows=nationalRequirementsForProgramme('ARCHITECTURE');
  const row=rows.find(row=>row.sources.some(source=>source.locator.split(': ')[1].split(', ').includes(String(conflict.offeringId))));
  assert.ok(row);assert.equal(row.verificationStatus,'review');assert.deepEqual(row.requiredUtmeSubjects,[]);
  const candidate={programme:'ARCHITECTURE',utmeScore:400,utmeSubjects:['Mathematics','Physics','Chemistry'],olevelCredits:['English Language','Mathematics','Physics','Chemistry','Biology'],sittings:1};
  assert.equal(matchCandidate(candidate,[row])[0].status,'review');
});

test('absent medical wording is reported as absent capture, never filled from a similar programme',()=>{
  const rows=nationalRequirementsForProgramme('MEDICINE AND SURGERY');assert.ok(rows.length);
  const missing=rows.filter(row=>row.reviewReasons.some(reason=>reason.startsWith('No readable UTME')));
  assert.ok(missing.length);assert.ok(missing.every(row=>row.requiredUtmeSubjects.length===0&&row.requiredOlevelCredits.length===0));
});

test('HTML comments and executable markup are excluded without damaging inline words or inferring waiver scope',()=>{
  const script=String.raw`
import importlib.util,hashlib
spec=importlib.util.spec_from_file_location('reconciliation','docs/admission-matcher/tools/reconcile-requirements.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.text('<style>fake</style><!-- hidden --><p>Mathe<span>matics</span> &amp; Physics</p><script>fake</script>')=='Mathematics & Physics'
assert m.text('<p><br></p><!-- empty -->')==''
raw=['<p><br></p>','Mathematics, Physics, Chemistry','Five credits in English Language, Mathematics, Physics, Chemistry and Biology.','']
pool={hashlib.sha256(s.encode()).hexdigest():s for s in raw}
refs=list(pool)
snapshot={'summary':{'coverageGate':'PASS'},'institutions':[{'id':1}],'evidencePool':pool,'records':[{'offeringId':1,'institutionId':1,'programmeId':2,'programme':'Physics','sourceUrl':'https://ibass-api.jamb.gov.ng/api/ibass/institution/programmes/1?page=1','observedAt':'2026-10-04','rawUtme':refs[0],'rawOlevel':refs[2],'rawDirectEntry':refs[3],'rawWaivers':refs[3]}]}
manifest,compact,summary=m.reconcile(snapshot,'a'*64)
assert 'missing-utme' in manifest['records'][0]['blockers']
assert 'missing-waivers' in manifest['records'][0]['blockers']
assert 'subject-categories' not in manifest['records'][0]['blockers']
snapshot['evidencePool'][refs[0]]='tampered'
try:m.reconcile(snapshot,'a'*64)
except ValueError:pass
else:raise AssertionError('tampered evidence accepted')
`;
  execFileSync('python',['-B','-c',script],{cwd:root});
});

test('LASU Chemistry matches observed official subject components while unresolved sittings stay review',()=>{
  const {admissionMatcherRequirements}=loadMatcher('lib/admission-matcher/data/index');
  const rows=admissionMatcherRequirements.filter(row=>row.institutionId==='lasu'&&row.programme==='Chemistry');
  assert.equal(rows.length,1);
  const evidence=require('../docs/admission-matcher/audit/ibass-2026-10-04/lasu-chemistry-parity.json');
  for(const probe of evidence.probes){
    const result=matchCandidate({programme:'Chemistry',utmeScore:245,utmeSubjects:probe.utmeSubjects.filter(subject=>subject!=='English Language'),olevelCredits:probe.olevelCredits,sittings:1,firstChoiceInstitution:'lasu'},rows)[0];
    assert.equal(result.status,probe.observedUtmeStatus==='Qualified'?'review':'not_match');
    assert.ok(result.needsReview.some(reason=>reason.includes('sitting')));
    assert.ok(result.passed.some(reason=>reason.includes("O'Level credit compulsory subjects satisfied")));
    if(probe.observedUtmeStatus==='Disqualified')assert.ok(result.failed.some(reason=>reason.includes('Chemistry')));
    else assert.deepEqual(result.failed,[]);
  }
  // Every explicit two-subject choice is accepted; the slot allocator cannot
  // count one elective twice or substitute a broad science category.
  for(const subjects of [['Chemistry','Physics','Biology'],['Chemistry','Biology','Mathematics'],['Chemistry','Physics','Mathematics']]){
    assert.equal(matchCandidate({programme:'Chemistry',utmeScore:245,utmeSubjects:subjects,olevelCredits:evidence.probes[0].olevelCredits,sittings:1,firstChoiceInstitution:'lasu'},rows)[0].failed.length,0);
  }
});
