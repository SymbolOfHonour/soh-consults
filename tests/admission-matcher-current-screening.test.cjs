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
  const other={...row,institutionId:'unilag'};assert.equal(matchCandidate({...profile,firstChoiceInstitution:'unilag'},[other])[0].status,'match');
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

test('LASU Engineering requires six credits at two sittings while one sitting can satisfy five',()=>{
 const engineering={...row,institutionId:'lasu',programme:'Civil Engineering',requiredUtmeSubjects:['Mathematics','Physics','Chemistry']};
 const candidate={...profile,programme:'Civil Engineering',utmeSubjects:['Mathematics','Physics','Chemistry'],firstChoiceInstitution:'lasu'};
 assert.equal(matchCandidate(candidate,[engineering])[0].status,'match');
 assert.equal(matchCandidate({...candidate,sittings:2},[engineering])[0].status,'not_match');
 assert.equal(matchCandidate({...candidate,sittings:2,olevelCredits:[...profile.olevelCredits,'Further Mathematics']},[engineering])[0].status,'match');
 const nbc=matchCandidate({...candidate,sittings:2,certificateType:'NBC'},[engineering])[0];assert.equal(nbc.status,'review');
});

test('LASU Aeronautic Further Mathematics can also satisfy a checker option without counting twice',()=>{
 const engineering={...row,institutionId:'lasu',programme:'Aeronautic & Astronautic Engineering',requiredUtmeSubjects:['Mathematics','Physics','Chemistry'],requiredOlevelCredits:['English Language','Mathematics','Physics','Chemistry'],olevelGroups:[{subjects:['Biology','Further Mathematics'],count:1}]};
 const candidate={...profile,programme:engineering.programme,utmeSubjects:['Mathematics','Physics','Chemistry'],firstChoiceInstitution:'lasu'};
 assert.equal(matchCandidate(candidate,[engineering])[0].status,'not_match');
 assert.equal(matchCandidate({...candidate,olevelCredits:['English Language','Mathematics','Physics','Chemistry','Further Mathematics']},[engineering])[0].status,'match');
});

test('new current score notices clear only the score gap and preserve unknown sitting rules',()=>{
 for(const [id,minimum] of [['jamb-brochure-805',160],['jamb-brochure-620',200],['jamb-brochure-668',160]]){
  const requirement={...row,institutionId:id,programme:'Chemistry',verificationStatus:'review',minimumUtmeScore:undefined,maximumSittings:undefined,unresolvedChecks:['score','sittings']};
  const candidate={...profile,programme:'Chemistry',firstChoiceInstitution:id};
  const updated=applyCurrentScreeningNotice(requirement);assert.equal(updated.minimumUtmeScore,minimum);assert.deepEqual(updated.unresolvedChecks,['sittings']);
  assert.equal(matchCandidate(candidate,[requirement])[0].status,'review');
  assert.equal(matchCandidate({...candidate,utmeScore:minimum-1},[requirement])[0].status,'not_match');
  assert.equal(matchCandidate({...candidate,firstChoiceInstitution:'lasu'},[requirement])[0].status,'not_match');
 }
});

test('current UI and UNILORIN one-sitting exceptions leave the unknown score unresolved',()=>{
 for(const id of ['jamb-brochure-392','jamb-brochure-423']){
  const requirement={...row,institutionId:id,verificationStatus:'review',minimumUtmeScore:undefined,maximumSittings:undefined,unresolvedChecks:['score','sittings']};
  const updated=applyCurrentScreeningNotice(requirement);assert.deepEqual(updated.unresolvedChecks,['score']);
  assert.equal(matchCandidate(profile,[requirement])[0].status,'review');
  assert.equal(matchCandidate({...profile,sittings:2},[requirement])[0].status,'not_match');
  const unknown=applyCurrentScreeningNotice({...requirement,programme:'Accounting'});assert.equal(unknown.maximumSittings,undefined);assert.deepEqual(unknown.unresolvedChecks,['score','sittings']);
 }
});

test('UNILAG current universal credits supplement a programme rule that does not name Mathematics',()=>{
 const credits=['English Language','Literature in English','Government','History','Christian Religious Studies'];
 const requirement={...row,institutionId:'unilag',programme:'Philosophy',requiredUtmeSubjects:['Literature in English','Government','Christian Religious Studies'],requiredOlevelCredits:credits};
 const candidate={...profile,programme:'Philosophy',utmeSubjects:requirement.requiredUtmeSubjects,olevelCredits:credits,firstChoiceInstitution:'unilag'};
 assert.equal(matchCandidate(candidate,[requirement])[0].status,'not_match');
 assert.equal(matchCandidate({...candidate,olevelCredits:[...credits,'Mathematics']},[requirement])[0].status,'match');
 assert.equal(matchCandidate({...candidate,olevelCredits:[...credits,'Mathematics'],sittings:2},[requirement])[0].status,'not_match');
});

test('a general screening notice cannot lower an independently verified programme minimum',()=>{
 const requirement={...row,institutionId:'unilag',minimumUtmeScore:260,scoreScope:'programme-screening'};
 const candidate={...profile,utmeScore:250,firstChoiceInstitution:'unilag'};
 assert.equal(applyCurrentScreeningNotice(requirement).minimumUtmeScore,260);
 assert.equal(matchCandidate(candidate,[requirement])[0].status,'not_match');
 assert.equal(matchCandidate({...candidate,utmeScore:260},[requirement])[0].status,'match');
 assert.equal(applyCurrentScreeningNotice({...requirement,unresolvedChecks:['score']}).minimumUtmeScore,200);
});
