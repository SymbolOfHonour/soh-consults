const test = require('node:test');
const assert = require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {matchCandidate,validateCandidate,satisfyGroups}=loadMatcher('lib/admission-matcher/match');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {canonicalSubject,subjectKey}=loadMatcher('lib/admission-matcher/catalogue');
const accounting = {programme:'Accounting',utmeScore:245,utmeSubjects:['Mathematics','Economics','Government'],olevelCredits:['English Language','Mathematics','Economics','Government','Commerce'],sittings:1,firstChoiceInstitution:'LASUSTECH'};
const at=(candidate,institution='lasustech')=>matchCandidate(candidate,data).find(r=>r.requirement.institutionId===institution);
const known=data.find(r=>r.institutionId==='lasustech' && r.programme==='Accounting');

test('Accounting end to end, alias and institution aliases',()=>{
  assert.equal(at(accounting).status,'match');
  assert.equal(matchCandidate({...accounting,programme:'Accountancy',institution:'LaSuStEcH'},data).length,1);
  assert.equal(at({...accounting,programme:'Accountancy'}).status,'match');
});
test('verified score boundary and below-boundary explanations',()=>{
  assert.equal(at({...accounting,utmeScore:195}).status,'match');
  const fail=at({...accounting,utmeScore:194});assert.equal(fail.status,'not_match');assert.ok(fail.failed.some(s=>s.includes('194') && s.includes('195')));
});
test('wrong UTME combination and missing compulsory OLevel credit',()=>{
  assert.equal(at({...accounting,utmeSubjects:['Mathematics','Biology','Government']}).status,'not_match');
  const missing=at({...accounting,olevelCredits:['Mathematics','Economics','Government','Commerce','Geography']});assert.equal(missing.status,'not_match');assert.ok(missing.failed.some(s=>s.includes('English Language')));
});
test('valid alternatives, count two extra credits, and invalid alternative',()=>{
  assert.equal(at({...accounting,utmeSubjects:['Maths','Economics','Accounting'],olevelCredits:['English','Maths','Economics','Accounting','Bookkeeping']}).status,'match');
  assert.equal(at({...accounting,olevelCredits:['English','Mathematics','Economics','Government','Chemistry']}).status,'not_match');
  assert.equal(at({...accounting,programme:'Insurance',utmeSubjects:['Mathematics','Economics','Biology']}).status,'match');
});
test('exactly three distinct non-English UTME subjects enforced by engine',()=>{
  for(const utmeSubjects of [[],['Maths','Economics'],['Maths','Economics','Government','Commerce'],['Use of English','Maths','Economics'],['Maths','Mathematics','Economics'],['Financial Accounting','Accounting','Maths'],['','Maths','Economics']])assert.throws(()=>matchCandidate({...accounting,utmeSubjects},data));
});
test('invalid and incomplete profiles cannot silently match',()=>{
  for(const utmeScore of [-1,401,245.5,NaN,Infinity,'245'])assert.ok(validateCandidate({...accounting,utmeScore}).length);
  for(const override of [{programme:''},{utmeSubjects:null},{utmeSubjects:[1,2,3]},{olevelCredits:null},{olevelCredits:[]},{olevelCredits:['English','English Language']},{sittings:3},{olevelSittings:3},{sittings:1,olevelSittings:2}])assert.throws(()=>matchCandidate({...accounting,...override},data));
});
test('sitting restrictions, missing sittings, legacy sitting input and first choice',()=>{
  assert.equal(at({...accounting,sittings:2}).status,'match');
  assert.equal(at({...accounting,sittings:undefined}).status,'review');
  assert.equal(at({...accounting,sittings:undefined,olevelSittings:2}).status,'match');
  assert.equal(matchCandidate({...accounting,sittings:2},[{...known,maximumSittings:1}])[0].status,'not_match');
  assert.equal(at({...accounting,firstChoiceInstitution:''}).status,'review');
  assert.equal(at({...accounting,firstChoiceInstitution:'FUOYE'}).status,'not_match');
});
test('LASU Accounting keeps unresolved subject categories review-only while enforcing verified boundaries',()=>{
  const ownerProfile={...accounting,institution:'LASU',firstChoiceInstitution:'LASU',utmeSubjects:['Mathematics','Economics','Commerce'],olevelCredits:['English Language','Mathematics','Economics','Commerce','Financial Accounting']};
  const lasu=data.find(r=>r.institutionId==='lasu'&&r.programme==='Accounting');
  assert.ok(lasu);assert.deepEqual(lasu.utmeGroups,[]);assert.deepEqual(lasu.unresolvedChecks,['utme','olevel']);
  for(const sittings of [1,2]) {
    const boundary=at({...ownerProfile,utmeScore:195,sittings},'lasu');assert.equal(boundary.status,'review');assert.ok(boundary.passed.some(s=>s.includes('maximum of 2')));assert.ok(boundary.needsReview.some(s=>s.includes('UTME')));assert.ok(boundary.needsReview.some(s=>s.includes("O'Level")));
    assert.equal(at({...ownerProfile,utmeScore:400,sittings},'lasu').status,'review');
  }
  for(const third of ['Commerce','Government','Geography','Financial Accounting']) assert.equal(at({...ownerProfile,utmeSubjects:['Mathematics','Economics',third]},'lasu').status,'review');
  const below=at({...ownerProfile,utmeScore:194,sittings:1},'lasu');assert.equal(below.status,'not_match');assert.ok(below.failed.some(s=>s.includes('194')&&s.includes('195')));
  const wrongChoice=at({...ownerProfile,utmeScore:245,sittings:1,firstChoiceInstitution:'FUOYE'},'lasu');assert.equal(wrongChoice.status,'not_match');assert.ok(wrongChoice.failed.some(s=>s.includes('first choice')));
});
test('selected first-choice institution is displayed first regardless of status',()=>{
  const ownerProfile={...accounting,firstChoiceInstitution:'LASU',utmeScore:194,utmeSubjects:['Mathematics','Economics','Commerce'],olevelCredits:['English Language','Mathematics','Economics','Commerce','Financial Accounting']};
  const results=matchCandidate(ownerProfile,data);assert.equal(results[0].requirement.institutionId,'lasu');assert.equal(results[0].status,'not_match');
  const fuoyeFirst=matchCandidate({...ownerProfile,firstChoiceInstitution:'FUOYE'},data);assert.equal(fuoyeFirst[0].requirement.institutionId,'fuoye');
});
test('fully verified LASU Medicine produces positive and negative decisions',()=>{
  const medicine={programme:'Medicine and Surgery',utmeScore:250,utmeSubjects:['Biology','Chemistry','Physics'],olevelCredits:['English Language','Mathematics','Biology','Chemistry','Physics'],sittings:1,firstChoiceInstitution:'LASU'};
  const positive=at(medicine,'lasu');assert.ok(positive);assert.equal(positive.status,'match');assert.equal(positive.needsReview.length,0);assert.equal(positive.failed.length,0);
  assert.equal(at({...medicine,utmeScore:194},'lasu').status,'not_match');
  assert.equal(at({...medicine,sittings:2},'lasu').status,'not_match');
  assert.equal(at({...medicine,utmeSubjects:['Biology','Chemistry','Geography']},'lasu').status,'not_match');
  assert.equal(at({...medicine,olevelCredits:['English Language','Mathematics','Biology','Chemistry','Geography']},'lasu').status,'not_match');
  assert.equal(at({...medicine,firstChoiceInstitution:'FUOYE'},'lasu').status,'not_match');
});
test('UNIOSUN 2026 screening baseline is enforced without upgrading unresolved subjects',()=>{
  const profile={...accounting,institution:'UNIOSUN',firstChoiceInstitution:'UNIOSUN'};
  const boundary=at({...profile,utmeScore:160,sittings:2},'uniosun');assert.equal(boundary.status,'review');assert.ok(boundary.passed.some(s=>s.includes('160')));assert.ok(boundary.passed.some(s=>s.includes('maximum of 2')));
  assert.equal(at({...profile,utmeScore:159},'uniosun').status,'not_match');
  assert.equal(at({...profile,utmeScore:200,sittings:1,firstChoiceInstitution:'LASU'},'uniosun').status,'not_match');
  const nursing={...profile,programme:'Nursing',utmeSubjects:['Biology','Chemistry','Physics'],olevelCredits:['English','Mathematics','Biology','Chemistry','Physics'],sittings:1};
  assert.equal(at({...nursing,utmeScore:199},'uniosun').status,'not_match');assert.equal(at({...nursing,utmeScore:200},'uniosun').status,'review');assert.equal(at({...nursing,utmeScore:200,sittings:2},'uniosun').status,'not_match');
  assert.ok(!data.some(r=>r.institutionId==='uniosun' && r.programme==='Medicine & Surgery'));
});
test('unknown cutoffs, missing sources, unknown sittings and unverified records never match',()=>{
  for(const change of [{minimumUtmeScore:undefined},{maximumSittings:undefined},{sources:[]},{verificationStatus:'review'},{unresolvedChecks:['utme']}])assert.equal(matchCandidate(accounting,[{...known,...change}])[0].status,'review');
  assert.equal(at(accounting,'abu'),undefined);
  assert.equal(at(accounting,'fuoye').status,'review');
  assert.equal(at({...accounting,certificateType:'NBC'}).status,'review');
});
test('unsupported course returns no eligibility decision and results keep status order when no first choice is supplied',()=>{
  assert.deepEqual(matchCandidate({...accounting,programme:'Unrepresented Degree'},data),[]);
  const results=matchCandidate({...accounting,firstChoiceInstitution:''},data);assert.equal(results.length,4);
  const ranks={match:0,review:1,not_match:2};assert.ok(results.every((r,i)=>!i || ranks[results[i-1].status]<=ranks[r.status]));
});
test('independent option slots use distinct subjects and can reallocate overlapping groups',()=>{
  assert.equal(satisfyGroups(['Biology'],[],[{subjects:['Biology','Physics'],count:1},{subjects:['Biology'],count:1}]),false);
  assert.equal(satisfyGroups(['Biology','Physics'],[],[{subjects:['Biology','Physics'],count:1},{subjects:['Biology'],count:1}]),true);
  assert.equal(satisfyGroups(['Maths','Government'],['Mathematics'],[{subjects:['Maths','Government'],count:2}]),false);
  assert.equal(satisfyGroups(['Accounting','Financial Accounting'],[],[{subjects:['Accounting','Financial Accounting'],count:2}]),false);
  assert.equal(satisfyGroups(['Biology'],[],[{subjects:['Biology'],count:0}]),false);
});
test('subject aliases preserve genuinely different subjects',()=>{
  assert.equal(canonicalSubject('Princ. of Account'),'Financial Accounting');assert.equal(subjectKey('Igbo Language'),subjectKey('Igbo'));assert.notEqual(subjectKey('Computer Studies'),subjectKey('Data Processing'));assert.notEqual(subjectKey('Financial Accounting'),subjectKey('Book Keeping'));
});
test('engineering and medicine discipline scenarios respect programme-specific checks',()=>{
  const science={...accounting,programme:'Civil Engineering',utmeScore:195,utmeSubjects:['Mathematics','Physics','Chemistry'],olevelCredits:['English','Mathematics','Physics','Chemistry','Biology']};assert.equal(at(science).status,'match');
  const medicine={...science,programme:'MBBS',utmeScore:280,utmeSubjects:['Physics','Chemistry','Biology']};assert.equal(at(medicine,'fuoye').status,'review');assert.equal(at({...medicine,utmeScore:279},'fuoye').status,'not_match');
});
test('malformed stored rules are review-only rather than automatic matches',()=>{
 for(const change of [{minimumUtmeScore:NaN},{scoreScope:undefined},{maximumSittings:3},{requiredUtmeSubjects:[],utmeGroups:[]},{utmeGroups:[{subjects:['Government'],count:0}]},{sources:[{label:'Source',url:'javascript:bad',session:'2026',lastVerified:'not-a-date'}]}])assert.equal(matchCandidate(accounting,[{...known,...change}])[0].status,'review');
});
test('OLevel-only subjects cannot masquerade as UTME choices',()=>{
 for(const subject of ['Civic Education','Marketing','Book Keeping','Further Mathematics','Data Processing','Office Practice']) {
  assert.throws(()=>matchCandidate({...accounting,utmeSubjects:['Mathematics','Economics',subject]},data),/JAMB-approved/);
 }
 assert.equal(at({...accounting,utmeSubjects:['Mathematics','Economics','Principles of Account']}).status,'match');
});

test('historical unconfirmed Accounting institutions never appear as assessed options',()=>{
 for(const id of ['abu','absu','aaua','aun','adun'])assert.ok(!data.some(r=>r.institutionId===id));
 assert.equal(matchCandidate(accounting,data).length,4);
});
