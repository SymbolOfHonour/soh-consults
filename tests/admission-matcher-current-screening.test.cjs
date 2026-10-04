const test = require('node:test');
const assert = require('node:assert/strict');
const {loadMatcher} = require('./admission-matcher-helper.cjs');
const {matchCandidate} = loadMatcher('lib/admission-matcher/match');
const {applyCurrentScreeningNotice} = loadMatcher('lib/admission-matcher/current-screening');
const profile={programme:'Medicine and Surgery',utmeScore:400,utmeSubjects:['Biology','Chemistry','Physics'],olevelCredits:['English Language','Mathematics','Biology','Chemistry','Physics'],sittings:1};
const row={institutionId:'uniosun',institutionName:'Osun State University',programme:profile.programme,requiredUtmeSubjects:['Biology','Chemistry','Physics'],requiredOlevelCredits:profile.olevelCredits,minimumOlevelCreditCount:5,maximumSittings:2,minimumUtmeScore:160,scoreScope:'institution-screening',verificationStatus:'verified',sources:[{label:'Official',url:'https://uniosun.edu.ng/',session:'2026/2027',lastVerified:'2026-10-04'}]};

test('current programme suspension prevents a perfect profile from receiving a match',()=>{
  const result=matchCandidate({...profile,firstChoiceInstitution:'uniosun'},[row])[0];
  assert.equal(result.status,'not_match');assert.ok(result.failed.some(reason=>reason.includes('on hold')));
  const law={...row,institutionId:'fuoye',programme:'Law'};
  const resultLaw=matchCandidate({...profile,programme:'Law'},[law])[0];assert.equal(resultLaw.status,'not_match');assert.ok(resultLaw.failed.some(reason=>reason.includes('not admitting Law')));
  assert.equal(matchCandidate({...profile,programme:'Medicine & Surgery'},[{...row,programme:'Medicine & Surgery'}])[0].status,'not_match');
  const other={...row,institutionId:'unilag'};assert.equal(matchCandidate(profile,[other])[0].status,'match');
});

test('UNIOSUN known screening fields are evaluated while unverified subjects remain review',()=>{
  const nursing={...row,programme:'Nursing/Nursing Science',verificationStatus:'review',unresolvedChecks:['utme','olevel','score','sittings']};
  const candidate={...profile,programme:nursing.programme,firstChoiceInstitution:'uniosun'};
  assert.equal(matchCandidate(candidate,[nursing])[0].status,'review');
  assert.equal(matchCandidate({...candidate,utmeScore:199},[nursing])[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,sittings:2},[nursing])[0].status,'not_match');
  const updated=applyCurrentScreeningNotice(nursing);assert.deepEqual(updated.unresolvedChecks,['utme','olevel']);assert.equal(updated.verificationStatus,'review');
});

test('LASU current UTME notice supplies sitting limits without promoting unknown subject evidence',()=>{
 const lasu={...row,institutionId:'lasu',verificationStatus:'review',maximumSittings:undefined,minimumUtmeScore:undefined,unresolvedChecks:['sittings','score']};
 const candidate={...profile,firstChoiceInstitution:'lasu'};
 const result=matchCandidate(candidate,[lasu])[0];assert.equal(result.status,'review');assert.equal(matchCandidate({...candidate,sittings:2},[lasu])[0].status,'not_match');
 assert.equal(matchCandidate({...candidate,utmeScore:194},[lasu])[0].status,'not_match');
 const updated=applyCurrentScreeningNotice(lasu);assert.equal(updated.maximumSittings,1);assert.deepEqual(updated.unresolvedChecks,[]);assert.equal(updated.verificationStatus,'review');
});
