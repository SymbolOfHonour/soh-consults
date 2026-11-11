const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const data = require('../lib/fustech/programmes.json');
const context = { exports: {}, require: () => data };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/fustech/calculate.ts','utf8'), { compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, context);
const { calculate, bestFive, validUtme } = context.exports;
const course = code => data.find(p => p.code === code);
const rows = (...subjects) => subjects.map(subject => ({ subject, grade: 'A1', sitting: 1 }));
const science = rows('English Language','Mathematics','Physics','Chemistry','Biology');
test('all 34 official programmes have distinct IDs and five credit slots', () => {
  assert.equal(data.length,34); assert.equal(new Set(data.map(p=>p.id)).size,34);
  assert.equal(new Set(data.map(p=>p.name)).size,34);
  for (const p of data) { assert.equal(p.oLevelSlots.length,5); assert.ok(p.oLevel); assert.ok(p.utme); }
});
test('official 70/30 formula, grade boundaries, minimum UTME and invalid scores', () => {
  const p = course('CSC');
  const result = calculate(p,'300',science,['MAT','PHY','CHE']);
  assert.equal(result.utme,52.5); assert.equal(result.oLevel,30); assert.equal(result.total,82.5);
  assert.equal(calculate(p,'400',science,['MAT','PHY','CHE']).total,100);
  assert.equal(calculate(p,'185',science,['MAT','PHY','CHE']).minimumMet,true);
  assert.equal(calculate(p,'184',science,['MAT','PHY','CHE']).minimumMet,false);
  const c6 = science.map(row=>({...row,grade:'C6'}));
  assert.equal(calculate(p,'200',c6,['MAT','PHY','CHE']).total,40);
  for (const score of ['', 'NaN','401','-1','200.5']) assert.equal(calculate(p,score,science,[]).scoreValid,false);
});
test('missing compulsory credits, failed grades and duplicate subjects cannot fill five slots', () => {
  const p = course('CSC');
  assert.equal(bestFive(p,science.filter(row=>row.subject!=='Mathematics')).length,0);
  assert.equal(bestFive(p,science.map(row=>row.subject==='English Language'?{...row,grade:'D7'}:row)).length,0);
  assert.equal(bestFive(p,rows('English Language','Mathematics','Physics','Chemistry','Chemistry')).length,0);
});
test('best five preserves compulsory credits, chooses alternatives and excludes a second sitting', () => {
  const p=course('CSC');
  const result=bestFive(p,[...science.map(row=>row.subject==='English Language'?{...row,grade:'C6'}:row),...rows('Further Mathematics','Computer Studies')]);
  assert.equal(result.length,5); assert.equal(result.find(row=>row.subject==='English Language').grade,'C6');
  const two=bestFive(p,[...science.map(row=>({...row,grade:'C6'})),{subject:'Physics',grade:'A1',sitting:2}]);
  assert.equal(two.find(row=>row.subject==='Physics').sitting,1);
  assert.equal(two.find(row=>row.subject==='Physics').grade,'C6');
  assert.equal(bestFive(p,[...science.filter(row=>row.subject!=='Mathematics'),{subject:'Mathematics',grade:'A1',sitting:2}]).length,0);
});
test('UTME alternatives match every programme, require four distinct subjects and reject wrong combinations', () => {
  for (const p of data) {
    const slots=[...p.utmeRules.compulsory.map(s=>[s]),...p.utmeRules.groups.flatMap(g=>Array.from({length:g.count},()=>g.subjects))];
    let found;
    function visit(i,chosen) { if(found)return; if(i===slots.length){found=chosen;return;} for(const s of slots[i])if(!chosen.includes(s))visit(i+1,[...chosen,s]); }
    visit(0,[]); assert.ok(found,p.name); assert.equal(validUtme(p,found.filter(s=>s!=='ENG')),true,p.name);
  }
  assert.equal(validUtme(course('CSC'),['MAT','PHY','AGR']),true);
  assert.equal(validUtme(course('CSC'),['MAT','ECO','CHE']),false);
  assert.equal(validUtme(course('CSC'),['MAT','MAT','CHE']),false);
  assert.equal(validUtme(course('CSC'),['MAT','PHY','ENG']),false);
  assert.equal(validUtme(course('LSC'),['MAT','ECO','ACC']),false);
});
test('280 UTME and A1, B2, B3, C4, C5 yield the supplied 69-point example', () => {
  const grades = ['A1','B2','B3','C4','C5'];
  const result = calculate(course('CSC'),'280',science.map((row,i)=>({...row,grade:grades[i]})),['MAT','PHY','CHE']);
  assert.equal(result.utme,49); assert.equal(result.oLevel,20); assert.equal(result.total,69);
});
