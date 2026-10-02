const test=require('node:test');
const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {institutionExpansion2026:added}=loadMatcher('lib/admission-matcher/data/expansion/index');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {matchCandidate}=loadMatcher('lib/admission-matcher/match');
const {normalise,subjectKey,discoverUtmeSubjects,coverage}=loadMatcher('lib/admission-matcher/catalogue');
const ids=['unilag','ui','oau','unilorin','uniben','unn','abu','futa','futminna','futo','unical','uniuyo','delsu','eksu','aaua','oou','tasued','kwasu','lautech'];
const science={programme:'Civil Engineering',utmeScore:400,utmeSubjects:['Mathematics','Physics','Chemistry'],olevelCredits:['English Language','Mathematics','Physics','Chemistry','Biology'],sittings:1};
const result=(profile,id)=>matchCandidate({...profile,institution:id,firstChoiceInstitution:id},data)[0];

test('first expansion batch has three independently sourced records at each requested institution',()=>{
 assert.equal(added.length,57);
 assert.deepEqual([...new Set(added.map(r=>r.institutionId))].sort(),ids.slice().sort());
 const identities=new Set();
 for(const id of ids)assert.equal(added.filter(r=>r.institutionId===id).length,3,id);
 for(const r of added){
  const key=r.institutionId+'::'+normalise(r.programme);assert.ok(!identities.has(key));identities.add(key);
  const primary=r.sources[0];assert.match(primary.url,/^https:\/\/ibass\.jamb\.gov\.ng\/brochure-courses\?id=\d+&school=/);
  assert.equal(primary.lastVerified,'2026-10-02');assert.match(primary.session,/session not specified/);assert.ok(primary.locator);
  assert.ok(r.notes.some(n=>n.startsWith('IBASS OLevel requirement:')));
  assert.ok(r.notes.some(n=>n.startsWith('IBASS UTME requirement:')));
  assert.ok(r.sources.length>=2);assert.ok(r.institutionAliases.length);
  assert.equal(r.verificationStatus,'review');assert.ok(r.reviewReasons.length);
 }
});
test('unknown current screening thresholds are never replaced with national or other university floors',()=>{
 const known={unilag:200,oau:200,unn:160,unical:150,uniuyo:150,tasued:160};
 for(const r of added){
  assert.equal(r.minimumUtmeScore,known[r.institutionId],r.institutionId);
  if(known[r.institutionId])assert.equal(r.scoreScope,'institution-screening');
  else assert.ok(r.unresolvedChecks.includes('score'));
 }
 assert.ok(added.filter(r=>r.institutionId==='futminna').every(r=>r.minimumUtmeScore===undefined));
 assert.equal(added.find(r=>r.institutionId==='tasued').institutionType,'federal-university');
 assert.ok(added.find(r=>r.institutionId==='tasued').institutionAliases.includes('TASFUED'));
});
test('no expansion record can match even a score-400 profile supplying every listed credit',()=>{
 for(const r of added){
  const credits=[...new Map(['English Language','Mathematics','Economics','Physics','Chemistry','Biology',...r.requiredOlevelCredits,...(r.olevelGroups??[]).flatMap(g=>g.subjects)].map(s=>[subjectKey(s),s])).values()];
  const outcome=matchCandidate({programme:r.programme,utmeScore:400,utmeSubjects:['Mathematics','Physics','Chemistry'],olevelCredits:credits,sittings:1,firstChoiceInstitution:r.institutionId},[r])[0];
  assert.notEqual(outcome.status,'match',r.institutionId+' '+r.programme);
  assert.ok(outcome.needsReview.length);
 }
});
test('representative institution-specific UTME alternatives retain exact counts',()=>{
 const futminna={...science,programme:'Building',utmeSubjects:['Mathematics','Physics','Economics'],olevelCredits:['English Language','Mathematics','Physics','Economics','Biology']};
 const valid=result(futminna,'futminna');assert.equal(valid.status,'review');assert.ok(valid.passed.some(p=>p.includes('UTME alternatives satisfied')));
 assert.equal(result({...futminna,utmeSubjects:['Mathematics','Physics','Commerce']},'futminna').status,'not_match');
 const futo={...science,programme:'Building Technology',utmeSubjects:['Mathematics','Geography','Economics'],olevelCredits:['English Language','Mathematics','Physics','Geography','Economics']};
 assert.equal(result(futo,'futo').status,'review');
 assert.equal(result({...futo,utmeSubjects:['Mathematics','Geography','Government']},'futo').status,'not_match');
 const biochem={...science,programme:'Biochemistry',utmeSubjects:['Biology','Chemistry','Mathematics']};
 assert.equal(result(biochem,'kwasu').status,'review');
 assert.equal(result({...biochem,utmeSubjects:['Biology','Chemistry','Economics']},'kwasu').status,'not_match');
});
test('blank and conflicting source cells remain unresolved without broadening approved UTME subjects',()=>{
 const tasued=added.filter(r=>r.institutionId==='tasued');assert.ok(tasued.every(r=>r.unresolvedChecks.includes('olevel')));
 assert.ok(tasued.find(r=>r.programme==='Economics').unresolvedChecks.includes('utme'));
 const bank=added.find(r=>r.institutionId==='aaua'&&r.programme==='Banking and Finance');assert.ok(bank.unresolvedChecks.includes('utme'));assert.match(bank.reviewReasons.join(' '),/Civic Education/);
 const oou=added.find(r=>r.institutionId==='oou'&&r.programme==='Accounting');assert.ok(oou.unresolvedChecks.includes('utme'));assert.match(oou.reviewReasons.join(' '),/Book Keeping/);
 const ui=added.filter(r=>r.institutionId==='ui');assert.ok(ui.every(r=>r.unresolvedChecks.includes('sittings')&&r.unresolvedChecks.includes('olevel')));
 const subjects=discoverUtmeSubjects(data);assert.equal(subjects.length,24);assert.ok(!subjects.includes('Civic Education')&&!subjects.includes('Book Keeping'));
});
test('new first-choice ordering and existing LASUSTECH Accounting passing case coexist',()=>{
 const accounting={programme:'Accounting',utmeScore:195,utmeSubjects:['Mathematics','Economics','Commerce'],olevelCredits:['English Language','Mathematics','Economics','Commerce','Financial Accounting'],sittings:1,firstChoiceInstitution:'LASUSTECH'};
 assert.equal(matchCandidate(accounting,data)[0].requirement.institutionId,'lasustech');
 assert.equal(result(accounting,'lasustech').status,'match');
 const unn=matchCandidate({...accounting,firstChoiceInstitution:'UNN'},data);assert.equal(unn[0].requirement.institutionId,'unn');assert.equal(unn[0].status,'review');
 assert.equal(coverage(data).institutions,23);assert.equal(coverage(data).verifiedRecords,48);
});
