const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const zlib=require('node:zlib');
const {loadMatcher}=require('./admission-matcher-helper.cjs');
const {validateNationalSnapshot}=loadMatcher('lib/admission-matcher/national-snapshot');
const {nationalCatalogueSummary,nationalRequirementsForProgramme}=loadMatcher('lib/admission-matcher/national-catalogue');
const {matchCandidate}=loadMatcher('lib/admission-matcher/match');
const {admissionMatcherRequirements}=loadMatcher('lib/admission-matcher/data/index');
const compact=require('../lib/admission-matcher/data/national-catalogue-2026-10-04.json');
const root=path.join(__dirname,'../docs/admission-matcher/audit/ibass-2026-10-04');
const read=name=>JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root,name))));

test('national catalogue accounts for every official offering, including explicit blank-title exceptions',()=>{
  validateNationalSnapshot(compact);
  const evidence=read('evidence-snapshot.json.gz');
  assert.equal(evidence.summary.coverageGate,'PASS');
  assert.equal(evidence.coverage.length,529);
  assert.ok(evidence.coverage.every(row=>row.complete));
  const imported=new Set([...compact.pairs.flatMap(row=>row[2]),...compact.unresolvedOfferings.map(row=>row.offeringId)]);
  assert.equal(imported.size,evidence.records.length);
  const institutions=new Set(evidence.institutions.map(row=>row.id));
  for(const row of evidence.records){
    assert.ok(imported.has(row.offeringId));assert.ok(institutions.has(row.institutionId));
    assert.equal(row.verificationStatus,'review');assert.equal(row.normalizedRule,null);
    const url=new URL(row.sourceUrl);assert.equal(url.hostname,'ibass-api.jamb.gov.ng');assert.equal(url.protocol,'https:');
    for(const field of ['rawUtme','rawOlevel','rawDirectEntry','rawWaivers'])assert.equal(typeof evidence.evidencePool[row[field]],'string');
  }
});

test('all nine brochure families, every page and nonempty table row are retained or explicitly unresolved',()=>{
  const evidence=read('brochure-evidence.json.gz'), reconciliation=read('brochure-reconciliation.json.gz');
  assert.equal(evidence.families.length,9);assert.equal(reconciliation.coverageReconciliationGate,'PASS');
  assert.ok(evidence.families.some(row=>row.family==='Medical/Pharmaceutical/Health Sciences'));
  const accounted=new Set([...reconciliation.claims,...reconciliation.exceptions].map(row=>row.locator));
  for(const family of evidence.families){
    const coverage=reconciliation.families.find(row=>row.family===family.family);
    assert.ok(coverage.indexCandidates.length);assert.equal(coverage.pages,family.pages.length);
    for(const page of family.pages){assert.ok(page.text);page.tables.forEach((table,ti)=>table.forEach((cells,ri)=>{if(cells.some(Boolean))assert.ok(accounted.has(`${family.family}:page-${page.page}:table-${ti}:row-${ri}`));}));}
  }
  const medical=reconciliation.families.find(row=>row.family.startsWith('Medical/'));
  for(const needle of ['Medicine and Surgery','Nursing','Pharmacy','Dentistry','Medical Laboratory','Physiotherapy'])assert.ok(medical.indexCandidates.some(row=>row.rawLabel.includes(needle)),needle);
});

test('national validator rejects unsafe mutations instead of trusting generated totals',()=>{
  const mutate=fn=>{const value=structuredClone(compact);fn(value);assert.throws(()=>validateNationalSnapshot(value));};
  mutate(x=>x.institutions.push(x.institutions[0]));mutate(x=>x.institutions[0].name='');
  mutate(x=>x.programmes[0]='');mutate(x=>x.pairs.push(x.pairs[0]));
  mutate(x=>x.pairs[0][0]=-1);mutate(x=>x.pairs[0][1]=999999);mutate(x=>x.pairs[1][2].push(x.pairs[0][2][0]));
  mutate(x=>x.stats.verifiedNewRecords=1);mutate(x=>x.stats.sourceOfferings--);mutate(x=>x.schemaVersion=999);
  mutate(x=>x.unresolvedOfferings[0].sourceUrl='https://ibass-api.jamb.gov.ng.evil.example/');
});

test('national medical listings always produce review and never fabricated eligibility',()=>{
  for(const programme of ['MEDICINE & SURGERY','NURSING/NURSING SCIENCE','PHARMACY','PHYSIOTHERAPY','MEDICAL LABORATORY SCIENCE']){
    const rows=nationalRequirementsForProgramme(programme);assert.ok(rows.length,programme);
    assert.ok(rows.every(row=>row.verificationStatus==='review'));
    const result=matchCandidate({programme,utmeScore:400,utmeSubjects:['Physics','Chemistry','Biology'],olevelCredits:['English Language','Mathematics','Physics','Chemistry','Biology'],sittings:1},rows);
    assert.ok(result.length);assert.ok(result.every(row=>row.status==='review'));
  }
});

test('exact identity integration preserves the verified LASUSTECH Accounting journey',()=>{
  const candidate={programme:'Accounting',utmeScore:245,utmeSubjects:['Mathematics','Economics','Government'],olevelCredits:['English Language','Mathematics','Economics','Financial Accounting','Government'],sittings:1,firstChoiceInstitution:'lasustech'};
  const before=matchCandidate(candidate,admissionMatcherRequirements).find(row=>row.requirement.institutionId==='lasustech');
  const after=matchCandidate(candidate,[...admissionMatcherRequirements,...nationalRequirementsForProgramme('Accounting')]).find(row=>row.requirement.institutionId==='lasustech');
  assert.equal(before.status,'match');assert.deepEqual(after,before);
  const summary=nationalCatalogueSummary();assert.equal(summary.stats.institutions,529);
  assert.equal(summary.institutions.filter(row=>row.id==='lasustech').length,1);
});


test('affiliation names and ownership do not incorrectly classify national colleges as universities',()=>{
  const rows=nationalRequirementsForProgramme('Accounting');
  assert.ok(rows.some(row=>row.institutionName.includes('POLYTECHNIC')));
  assert.ok(rows.every(row=>row.institutionType==='other'));
});
