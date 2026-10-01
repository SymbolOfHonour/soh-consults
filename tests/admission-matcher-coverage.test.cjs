const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {discoverProgrammes,discoverSubjects,discoverUtmeSubjects,isApprovedUtmeSubject,coverage,subjectKey,normalise}=loadMatcher('lib/admission-matcher/catalogue');
test('registered programmes and alternative-only subjects remain discoverable',()=>{
 const programmes=discoverProgrammes(data);for(const name of ['Accounting','Computer Science','Biochemistry','Civil Engineering','Doctor Of Pharmacy','Nursing','Software Engineering','Political Science','Mass Communication','Law','Chemistry Education','Psychology','Architecture','Marketing'])assert.ok(programmes.includes(name),name);
 const subjects=discoverSubjects(data);for(const name of ['Mathematics','Economics','Government','Commerce','Financial Accounting','Biology','Chemistry','Physics','Literature in English','Geography','Agricultural Science','Civic Education','Book Keeping','Office Practice','Technical Drawing'])assert.ok(subjects.includes(name),name);
 const probe=[{programme:'New registered course',requiredUtmeSubjects:[],requiredOlevelCredits:[],utmeGroups:[{subjects:['Alternative-only subject'],count:1}]}];assert.deepEqual(discoverProgrammes(probe),['New registered course']);assert.deepEqual(discoverSubjects(probe),['Alternative-only subject']);
 assert.equal(new Set(subjects.map(subjectKey)).size,subjects.length);
 const utme=discoverUtmeSubjects(data);assert.equal(utme.length,24);assert.ok(utme.every(isApprovedUtmeSubject));
 for(const name of ['Music','Arabic','Computer Studies','Physical and Health Education'])assert.ok(utme.includes(name));
 for(const name of ['Civic Education','Marketing','Book Keeping','Further Mathematics','Data Processing'])assert.ok(!utme.includes(name));
});
test('LASU official catalogue expansion remains broad and review-safe',()=>{
 const lasu=data.filter(r=>r.institutionId==='lasu');
 assert.ok(lasu.length>=100,`expected at least 100 LASU records, got ${lasu.length}`);
 const names=new Set(lasu.map(r=>normalise(r.programme)));
 for(const name of ['Accounting','Aerospace Engineering','Advertising','Architecture','Banking and Finance','Business Administration','Computer Science','Cyber Security','Data Science','Dentistry','Film and Multimedia','Information and Communication Technology','Journalism and Media Studies','Logistics and Supply Chain Management','Marketing','Medical Laboratory Science','Medicine and Surgery','Nursing'])assert.ok(names.has(normalise(name)),`LASU catalogue missing ${name}`);
 for(const r of lasu){assert.equal(r.minimumUtmeScore,195,`${r.programme} LASU screening floor`);assert.equal(r.firstChoiceRequired,true,`${r.programme} LASU first-choice rule`);if(r.programme!=='Accounting')assert.equal(r.verificationStatus,'review',`${r.programme} must stay review-only until its complete rules are machine-safe`);}
});
test('dataset records have unique identities, precise provenance and well-formed rules',()=>{
 const ids=new Set();for(const r of data){const id=r.institutionId+'::'+normalise(r.programme);assert.ok(!ids.has(id),id);ids.add(id);assert.ok(r.institutionType);assert.ok(['verified','review'].includes(r.verificationStatus));assert.ok(r.sources.length);for(const s of r.sources){assert.ok(s.label && s.session && s.scope!==undefined || s.label && s.session);assert.match(s.url,/^https:\/\//);assert.match(s.lastVerified,/^\d{4}-\d{2}-\d{2}$/);}
 for(const core of [r.requiredUtmeSubjects,r.requiredOlevelCredits]){assert.ok(core.every(s=>s.trim()));assert.equal(new Set(core.map(subjectKey)).size,core.length);}
 for(const group of [...(r.utmeGroups??[]),...(r.olevelGroups??[])])assert.ok(Number.isInteger(group.count)&&group.count>0&&group.count<=new Set(group.subjects.map(subjectKey)).size,id);
 for(const [groups,counts] of [[r.utmeAlternatives,r.utmeAlternativeMinimums],[r.olevelAlternatives,r.olevelAlternativeMinimums]]){if(counts)assert.equal(groups.length,counts.length);for(let i=0;i<(groups?.length??0);i++)assert.ok((counts?.[i]??1)<=new Set(groups[i].map(subjectKey)).size);}
 if(r.minimumUtmeScore!==undefined)assert.ok(Number.isInteger(r.minimumUtmeScore)&&r.minimumUtmeScore>=0&&r.minimumUtmeScore<=400&&r.scoreScope);
 if(r.verificationStatus==='verified'){assert.ok(r.minimumUtmeScore!==undefined&&r.maximumSittings&&r.minimumOlevelCreditCount&&!r.unresolvedChecks?.length);const slots=r.requiredUtmeSubjects.length+(r.utmeGroups??[]).reduce((n,g)=>n+g.count,0)+(r.utmeAlternatives??[]).reduce((n,g,i)=>n+(r.utmeAlternativeMinimums?.[i]??1),0);assert.equal(slots,3,id);}
 else assert.ok(r.reviewReasons?.length,id);
 }
});
test('coverage counts distinguish full verification from review records',()=>{
 const c=coverage(data);assert.equal(c.records,data.length);assert.equal(c.verifiedRecords,data.filter(r=>r.verificationStatus==='verified').length);assert.ok(c.records>c.verifiedRecords);assert.ok(c.programmes>c.verifiedProgrammes);assert.ok(c.institutions>c.verifiedInstitutions);
 console.log('Matcher coverage:',JSON.stringify(c));
});
