require('../scripts/ask-soh-test-loader.cjs');
const test=require('node:test'),assert=require('node:assert/strict');
const {resolveQuestion}=require('../lib/ask-soh/question-resolver.ts');
const {answersRequestedTopic}=require('../lib/ask-soh/relevance.ts');
const {businessOverviewAnswer}=require('../lib/ask-soh/business-answer.ts');
const {verifyAnswer}=require('../lib/ask-soh/answer-verification.ts');
test('route follow-up inherits FUOYE session and requirements, remaining current-sensitive',()=>{const q=resolveQuestion('And Direct Entry?','FUOYE 2026/2027 Post-UTME requirements');assert.equal(q.institutionKey,'fuoye');assert.equal(q.academicSession,'2026/2027');assert.equal(q.intent,'requirements');assert.equal(q.currentSensitive,true)});
test('new institution does not inherit former session or intent',()=>{const q=resolveQuestion('What is JAMB CAPS?','LASU 2026/2027 cutoff');assert.equal(q.institutionKey,'jamb');assert.equal(q.academicSession,null);assert.equal(q.intent,'general')});
test('explicit new session overrides conversation session',()=>assert.equal(resolveQuestion('And 2025/2026?','LASU 2026/2027 cutoff').academicSession,'2025/2026'));
test('CAPS definition cannot answer acceptance procedure',()=>{assert.equal(answersRequestedTopic('How do I accept admission on JAMB CAPS?','CAPS means Central Admissions Processing System.'),false);assert.equal(answersRequestedTopic('How do I accept admission on JAMB CAPS?','Log in to CAPS and select Accept Admission.'),true)});
test('Medicine subjects cannot be answered by acceptance fee notice',()=>{const question='What UTME subjects do I need for Medicine at LASU for 2026/2027?';const q=resolveQuestion(question);assert.equal(q.intent,'requirements');const decision=verifyAnswer(question,q,[{title:'2026/2027 LASU fee notice',url:'https://lasu.edu.ng/notice',official:true,verified:true,kind:'article',fetchedAt:new Date().toISOString(),snippet:'Candidates in the College of Medicine must pay the acceptance fee before clearance.'}]);assert.equal(decision.confidence,'low');assert.equal(decision.needsHuman,true)});
test('course-specific positive subject evidence is retained',()=>assert.equal(answersRequestedTopic('What UTME subjects do I need for Medicine at LASU for 2026/2027?','Medicine UTME subjects are English, Biology, Chemistry and Physics.'),true));
test('business contact reuses site contact data',()=>{assert.match(businessOverviewAnswer('How can I contact S.O.H CONSULTS?'),/support@sohconsults.com.ng/);assert.match(businessOverviewAnswer('What services does S.O.H CONSULTS offer?'),/Post-UTME/);assert.equal(businessOverviewAnswer('What are LASU admission requirements?'),null)});
const {institutionClarification,officialPortalAnswer}=require('../lib/ask-soh/direct-answer.ts');
const {INSTITUTIONS}=require('../lib/ask-soh/institution-registry.ts');
test('Lasuu asks for confirmation without changing the institution silently',()=>{assert.match(institutionClarification('What is Lasuu cutoff for 2026/2027?'),/Did you mean Lagos State University/);assert.equal(institutionClarification('What is LASUSTECH cutoff?'),null);assert.equal(institutionClarification('How can I contact S.O.H CONSULTS?'),null)});
test('official portal request uses the institution allowlist without implying open registration',()=>{const lasu=INSTITUTIONS.find(i=>i.key==='lasu');const answer=officialPortalAnswer('Give me the official LASU admission screening portal',lasu);assert.equal(answer.url,'https://services.lidc.lasu.edu.ng/admissionscreening/');assert.match(answer.answer,/does not confirm/);assert.equal(officialPortalAnswer('Is the official LASU admission portal still open?',lasu),null);assert.equal(officialPortalAnswer('What are LASU portal admission requirements?',lasu),null);assert.equal(officialPortalAnswer('Give me official LASU admission portal',{...lasu,sourceUrls:['https://example.com/admissionscreening']}),null)});
const {factApplicable}=require('../lib/ask-soh/knowledge-repository.ts');
test('reviewed course and route facts cannot leak across programmes or admission routes',()=>{
 const fact={institution_key:'lasu',topic:'Medicine UTME subjects',intent:'requirements',status:'verified',verified_at:new Date().toISOString(),review_due_at:'2099-01-01',source_url:'https://lasu.edu.ng/requirements',evidence_text:'Medicine UTME subjects English, Physics, Chemistry, Biology',academic_session:'2026/2027',metadata:{course:'medicine',admission_route:'utme'}};
 assert.equal(factApplicable(fact,resolveQuestion('What UTME subjects for Medicine at LASU for 2026/2027?')),true);
 assert.equal(factApplicable(fact,resolveQuestion('What UTME subjects for Nursing at LASU for 2026/2027?')),false);
 assert.equal(factApplicable(fact,resolveQuestion('What are Direct Entry requirements for Medicine at LASU for 2026/2027?')),false);
 assert.equal(factApplicable(fact,resolveQuestion('What UTME subjects for Medicine at LASU for 2025/2026?')),false);
});
test('institution minimum does not become a Medicine departmental cutoff',()=>{
 const q=resolveQuestion('What is the cutoff for Medicine at LASU for 2026/2027?');assert.equal(q.course,'medicine');
 const decision=verifyAnswer('What is the cutoff for Medicine at LASU for 2026/2027?',q,[{title:'2026/2027 screening',url:'https://lasu.edu.ng/screening',snippet:'2026/2027 minimum UTME score of 195.',official:true,verified:true,kind:'article',fetchedAt:new Date().toISOString()}]);assert.equal(decision.confidence,'low');assert.match(decision.answer,/university-wide/);
});
