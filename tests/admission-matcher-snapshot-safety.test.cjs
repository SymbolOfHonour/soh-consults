const test = require('node:test');
const assert = require('node:assert/strict');
const { loadMatcher } = require('./admission-matcher-helper.cjs');
const { buildIbassSnapshot, validateIbassSnapshot } = loadMatcher('lib/admission-matcher/upstream/ingest');

function input() {
  return {
    institutionId: 'jamb-1', programme: 'Physics', categoryMappingsResolved: true,
    explicitUtmeSubjects: ['Physics', 'Chemistry', 'Mathematics'],
    explicitOlevelCredits: ['English Language', 'Mathematics', 'Physics', 'Chemistry', 'Biology'],
    evidence: {
      provider: 'jamb-ibass', observedAt: '2026-10-04T00:00:00Z', entryMode: 'utme',
      institution: { upstreamId: 1, name: 'Test institution' },
      programme: { upstreamId: 2, label: 'Physics', rawUtmeRequirement: 'Physics, Chemistry and Mathematics', rawOlevelRequirement: 'Five credits: English Language, Mathematics, Physics, Chemistry and Biology' },
      overallStatus: 'qualified', source: { url: 'https://ibass.jamb.gov.ng/eligibility-checker', sourceType: 'eligibility-checker' }, unresolved: [],
    },
  };
}
const build = value => buildIbassSnapshot([value], '2026-10-04T00:00:00Z');

test('Direct Entry cannot be verified by reusing UTME subject rules', () => {
  const value = input(); value.evidence.entryMode = 'direct-entry';
  assert.equal(build(value).records[0].normalized.verificationStatus, 'review');
});

test('missing raw requirements cannot be promoted by explicit subjects and a qualified outcome', () => {
  const value = input();
  delete value.evidence.programme.rawOlevelRequirement;
  assert.equal(build(value).records[0].normalized.verificationStatus, 'review');
});

test('missing structured OLevel rules remain review', () => {
  const value = input(); value.explicitOlevelCredits = [];
  assert.equal(build(value).records[0].normalized.verificationStatus, 'review');
});

test('validator rejects forged verified records, spoofed hosts and contradictory counts', () => {
  const snapshot = build(input());
  assert.deepEqual(validateIbassSnapshot(snapshot), []);
  snapshot.records[0].evidence.source.url = 'https://ibass.jamb.gov.ng.evil.example/';
  snapshot.records[0].evidence.unresolved = ['Unknown category'];
  snapshot.records[0].normalized.requiredOlevelCredits = [];
  snapshot.stats.total = 2;
  const errors = validateIbassSnapshot(snapshot).join('\n');
  assert.match(errors, /official JAMB IBASS source/);
  assert.match(errors, /unresolved raw evidence/);
  assert.match(errors, /sufficient O'Level/);
  assert.match(errors, /statistics/);
});

test('validator checks duplicates after ingestion and rejects malformed schema', () => {
  const snapshot = build(input()); snapshot.records.push(structuredClone(snapshot.records[0]));
  snapshot.records[1].schemaVersion = 99;
  const errors = validateIbassSnapshot(snapshot).join('\n');
  assert.match(errors, /Duplicate/); assert.match(errors, /unsupported record schema/);
});
