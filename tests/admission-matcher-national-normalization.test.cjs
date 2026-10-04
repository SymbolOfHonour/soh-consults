const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const zlib=require('node:zlib');
const crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=require('node:path').resolve(__dirname,'..');
const folder=root+'/docs/admission-matcher/audit/ibass-2026-10-04/';

test('national subject proposals account for every school and offering without promoting eligibility',()=>{
  const raw=fs.readFileSync(folder+'evidence-snapshot.json.gz');
  const source=JSON.parse(zlib.gunzipSync(raw));
  const result=JSON.parse(zlib.gunzipSync(fs.readFileSync(folder+'national-subject-proposals.json.gz')));
  assert.equal(result.sourceSnapshotSha256,crypto.createHash('sha256').update(raw).digest('hex'));
  assert.equal(result.institutions.length,529);
  assert.deepEqual(result.institutions.map(row=>row.institutionId).sort((a,b)=>a-b),source.institutions.map(row=>row.id).sort((a,b)=>a-b));
  const offerings=result.institutions.flatMap(row=>row.offerings);
  assert.equal(offerings.length,15696);
  assert.equal(new Set(offerings.map(row=>row.offeringId)).size,15696);
  const original=new Map(source.records.map(row=>[row.offeringId,row]));
  for(const school of result.institutions)for(const row of school.offerings){
    const captured=original.get(row.offeringId);
    assert.equal(captured.institutionId,school.institutionId);
    assert.equal(row.verificationStatus,'review');
    assert.ok(row.remainingChecks.includes('waiver-applicability'));
    assert.ok(row.remainingChecks.includes('current-screening'));
    assert.ok(row.remainingChecks.includes('official-parity'));
    for(const [field,ref] of Object.entries(row.evidenceRefs))assert.equal(ref,captured[field]);
  }
  assert.equal(result.summary.verifiedNewRecords,0);
  execFileSync('python',['docs/admission-matcher/tools/normalize-national-subjects.py','--check'],{cwd:root});
});

test('strict national parser preserves explicit alternatives and refuses categories, trailing exceptions and damaged wording',()=>{
  execFileSync('python',['-B','-c',String.raw`
import importlib.util
spec=importlib.util.spec_from_file_location('normalize','docs/admission-matcher/tools/normalize-national-subjects.py')
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
assert m.parse_utme('Physics, Chemistry and Biology.')['requiredSubjects']==['Physics','Chemistry','Biology']
r=m.parse_utme('Biology, Chemistry and either Physics or Mathematics.')
assert r['requiredSubjects']==['Biology','Chemistry'] and r['groups']==[{'subjects':['Physics','Mathematics'],'count':1}]
assert m.parse_utme('Chemistry and two (2) of Physics, Biology and Mathematics.')['groups'][0]['count']==2
assert m.parse_utme('Mathematics, Physics and one (1) of Biology, Chemistry, Agric Science, Economics and Geography.')['groups'][0]['subjects'][2]=='Agricultural Science'
for text in ['Any three (3) subjects.','Mathematics, Economics and any other Social Science subject','Physics, Physics and Chemistry.','English Language, Physics and Chemistry.','Physics, Chemistry and Biology except institution X','Chemistry and one (2) of Physics, Biology and Mathematics.','Physics, Chemistry and Biology\ufffd']:
 assert m.parse_utme(text) is None,text
assert m.parse_olevel('Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology.')['minimumCreditCount']==5
for text in ['Five (5) SSC credit passes including English Language, Mathematics and Physics or Chemistry.','Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Biology. A pass in French is required.','Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and any other Science subject.','Five (5) SSC credit passes in English Language, Mathematics, Physics, Chemistry and Physics.']:
 assert m.parse_olevel(text) is None,text
`],{cwd:root});
});
