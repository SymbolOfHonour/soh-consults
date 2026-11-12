const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const source = fs.readFileSync('app/lasu-calculator/page.tsx', 'utf8');
const logic = source.slice(source.indexOf('type Programme'), source.indexOf('export default function LASUCalculator'));
const shared = { exports: {} };
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/olevel-subjects.ts', 'utf8'), {compilerOptions: {module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020}}).outputText, shared);
const context = { exports: {}, getOLevelSubjectOptions: shared.exports.getOLevelSubjectOptions };
vm.runInNewContext(ts.transpileModule(logic + '\nexports.api = {oLevelSubjects, jambSubjects, getAvailableOLevelOptions, extractSubjects, oLevelAliases};', { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText, context);
const api = context.exports.api;

test('legacy and 2026 computing results are selectable in both sittings without entering the JAMB list', () => {
  for (const subject of ['Data Processing', 'Computer Studies', 'Digital Technologies']) {
    for (const sitting of [[], [{subject: 'English Language', grade: 'A1'}]]) {
      assert.ok(api.getAvailableOLevelOptions(sitting, 1).includes(subject));
    }
  }
  assert.ok(!api.jambSubjects.includes('Data Processing'));
  assert.ok(!api.jambSubjects.includes('Digital Technologies'));
  assert.equal(new Set(api.oLevelSubjects).size, api.oLevelSubjects.length);
});

test('adding subjects preserves compulsory English and duplicate prevention', () => {
  const rows = [{subject: 'English Language', grade: 'A1'}, {subject: 'Data Processing', grade: 'B2'}, {subject: '', grade: ''}];
  assert.deepEqual(Array.from(api.getAvailableOLevelOptions(rows, 0)), ['English Language']);
  assert.ok(api.getAvailableOLevelOptions(rows, 1).includes('Data Processing'));
  assert.ok(!api.getAvailableOLevelOptions(rows, 2).includes('Data Processing'));
  assert.ok(!api.getAvailableOLevelOptions(rows, 2).includes('English Language'));
});

test('named computing requirements remain distinct subjects', () => {
  for (const subject of ['Data Processing', 'Computer Studies', 'Digital Technologies']) {
    assert.deepEqual(Array.from(api.extractSubjects(subject, api.oLevelAliases)), [subject]);
  }
});
