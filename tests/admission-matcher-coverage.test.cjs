const test=require('node:test');const assert=require('node:assert/strict');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {admissionMatcherRequirements:data}=loadMatcher('lib/admission-matcher/data/index');
const {discoverProgrammes,discoverSubjects,coverage,subjectKey,normalise}=loadMatcher('lib/admission-matcher/catalogue');
test('registered programmes and alternative-only subjects remain discoverable',()=>{
 const programmes=discoverProgrammes(data);for(const name of ['Accounting','Computer Science','Biochemistry','Civil Engineering','Doctor Of Pharmacy','Nursing','Software Engineering','Political Science','Mass Communication','Law','Chemistry Education','Psychology','Architecture','Marketing'])assert.ok(programmes.includes(name),name);
 const subjects=discoverSubjects(data);for(const name of ['Mathematics','Economics','Government','Commerce','Financial Accounting','Biology','Chemistry','Physics','Literature in English','Geography','Agricultural Science','Civic Education','Book Keeping','Office Practice','Technical Drawing'])assert.ok(subjects.includes(name),name);
 const probe=[{programme:'New registered course',requiredUtmeSubjects:[],requiredOlevelCredits:[],utmeGroups:[{subjects:['Alternative-only subject'],count:1}]}];assert.deepEqual(discoverProgrammes(probe),['New registered course']);assert.deepEqual(discoverSubjects(probe),['Alternative-only subject']);
 assert.equal(new Set(subjects.map(subjectKey)).size,subjects.length);
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
