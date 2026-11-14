require('../scripts/ask-soh-test-loader.cjs');
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {parseLasuRequirements}=require('../lib/lasu-portal.ts');
const html=fs.readFileSync('tests/fixtures/lasu-accounting-2026-11-14.html','utf8');
test('official Accounting requirement text excludes neighbouring JAMB heading and footer',()=>{
 const parsed=parseLasuRequirements(html,'0811');
 assert.equal(parsed.oLevel,'English Language, Mathematics, Economics, and any subject from Social Science');
 assert.equal(parsed.utme,'ENG, MAT, ECO, and any subject from Social Science');
 assert.ok(!parsed.oLevel.includes('JAMB'));assert.ok(!parsed.utme.includes('Visits'));
});
test('a result must confirm both programme ID and heading',()=>{
 assert.throws(()=>parseLasuRequirements(html,'0631'));
 assert.throws(()=>parseLasuRequirements(html.replace('<h3>Accounting</h3>','<h3>Advertising</h3>'),'0811'));
 assert.throws(()=>parseLasuRequirements(html.replace("value='0811' selected","value='0811'"),'0811'));
});
test('missing or duplicate sections cannot be mistaken for requirements',()=>{
 assert.throws(()=>parseLasuRequirements(html.replace('JAMB UTME Subject Requirements','Unknown label'),'0811'));
 const duplicate='<div class="section-label">O-Level Subject Requirements</div><div class="subject-pill-wrap">Wrong value</div>';
 assert.throws(()=>parseLasuRequirements(html+duplicate,'0811'));
});
test('all saved fields match the independently parsed current official DOM',()=>{
 const zlib=require('node:zlib'),{JSDOM}=require('jsdom');
 const evidence=JSON.parse(zlib.gunzipSync(fs.readFileSync('docs/lasu-requirements/portal-capture-2026-11-14.json.gz')));
 const rows=require('../data/lasu-requirements-snapshot.json');
 assert.equal(evidence.responses.length,113);assert.equal(rows.length,113);
 const clean=s=>s.replace(/\s+/g,' ').trim();
 for(const row of rows){
  const original=evidence.responses.find(r=>r.courseId===row.courseId);assert.ok(original);
  const parsed=parseLasuRequirements(original.html,row.courseId);
  assert.equal(row.retrievedAt,original.retrievedAt);
  assert.equal(row.programme,parsed.programme);
  const dom=new JSDOM(original.html).window.document;
  const values={};for(const section of dom.querySelectorAll('.result-section'))values[clean(section.querySelector('.section-label').textContent)]=clean(section.querySelector('.subject-pill-wrap').textContent);
  assert.equal(row.oLevel,values['O-Level Subject Requirements']);assert.equal(row.utme,values['JAMB UTME Subject Requirements']);
  assert.equal(row.oLevel,parsed.oLevel);assert.equal(row.utme,parsed.utme);
 }
});
test('confirmed source blanks remain blank and cannot produce an eligibility pass',()=>{
 const partial=html.replace('ENG, MAT, ECO, and any subject from Social Science','');
 assert.equal(parseLasuRequirements(partial,'0811').utme,'');
 const page=fs.readFileSync('app/lasu-calculator/page.tsx','utf8'),vm=require('node:vm');
 const start=page.indexOf('      const requirementLoaded ='),end=page.indexOf('      return {',start);
 const actual=page.slice(start,end)+'\nresult = eligible;';
 const context={Boolean,candidateName:'Test',selectedCourseId:'0811',jambCutoffValid:true,jambRequirementValid:true,oLevelRequirementValid:true,bestFive:[1,2,3,4,5],lasuRequirement:{oLevel:'Official requirements',utme:''},result:null};
 vm.runInNewContext(actual,context);assert.equal(context.result,false);
 const complete={...context,lasuRequirement:{oLevel:'Official requirements',utme:'Official requirements'},result:null};vm.runInNewContext(actual,complete);assert.equal(complete.result,true);
});
