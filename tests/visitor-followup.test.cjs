const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const cache = new Map();
function load(name) {
  const file = path.resolve(name.endsWith('.ts') ? name : name + '.ts');
  if (cache.has(file)) return cache.get(file).exports;
  const m = new Module(file, module); m.filename = file; m.paths = Module._nodeModulePaths(path.dirname(file)); cache.set(file, m);
  m.require = spec => spec.startsWith('.') ? load(path.resolve(path.dirname(file), spec)) : require(spec);
  m._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText, file);
  return m.exports;
}
const { schoolFeed, schoolOptions, parseSchoolPreferences } = load('lib/school-feed');
const { applicationHref, applicationSections, checklistSection, safeOfficialUrl } = load('lib/application-guide');
const { serviceEnquiryUrl } = load('lib/service-enquiry');
const { writeArticleBlocks } = load('lib/article-blocks');
const now = new Date('2026-10-10T12:00:00Z');
const item = (id, title, extra = {}) => ({ id, title, kind: 'update', href: '/updates/' + id, ...extra });
test('a saved LASU feed excludes LASUED, LASUSTECH and closed applications but retains national guidance', () => {
  const source = [item('lasu', 'LASU screening'), item('edu', 'LASUED screening'), item('tech', 'LASUSTECH screening'), item('caps', 'JAMB CAPS admission status', { institution: 'Nigeria', kind: 'guide' }), item('closed', 'LASU screening application', { deadline: '2026-10-09' }), item('soon', 'LASU screening', { status: 'COMING SOON' })];
  assert.deepEqual(schoolFeed(source, { schools: ['LASU'], topics: ['admission'] }, now).map(r => r.item.id).sort(), ['caps', 'lasu']);
  assert.deepEqual(schoolFeed(source, { schools: ['LASU'], topics: [] }, now).map(r => r.item.id).sort(), ['caps', 'lasu']);
  assert.equal(source[0].title, 'LASU screening');
});
test('preference restore handles corrupted, old or unknown values without broadening selected schools', () => {
  assert.deepEqual(parseSchoolPreferences({ schools: ['LASU', 'LASU', 'missing', 2], topics: ['admission', 'unknown'] }, ['LASU']), { schools: ['LASU'], topics: ['admission'] });
  assert.deepEqual(parseSchoolPreferences([], ['LASU']), { schools: [], topics: [] });
  assert.equal(schoolFeed([item('a', 'JAMB admission')], { schools: [], topics: [] }, now).length, 0);
  assert.deepEqual(schoolOptions([item('a', 'Lagos State University of Education screening', { institution: 'Nigeria' }), item('b', 'JAMB CAPS', { institution: 'Nigeria' })]), ['LASUED']);
});
test('application pages use published headings and never manufacture fees or requirements', () => {
  const story = { details: writeArticleBlocks('', [{ type: 'heading', text: 'Eligibility requirements' }, { type: 'paragraph', text: 'Five credits as stated in this notice.' }, { type: 'heading', text: 'Application fee' }, { type: 'paragraph', text: 'See the official notice for charges.' }]) };
  const sections = applicationSections(story);
  assert.equal(checklistSection(sections, 'eligibility')[0].text.trim(), 'Five credits as stated in this notice.');
  assert.equal(checklistSection(sections, 'fees')[0].text.trim(), 'See the official notice for charges.');
  assert.equal(checklistSection(sections, 'documents').length, 0);
  assert.deepEqual(applicationSections(undefined), []);
  assert.equal(applicationHref({ id: 'opportunity-seed-3' }), '/applications/opportunity-seed-3');
  assert.equal(applicationHref({ id: 'x', detailHref: '/updates/published-notice' }), '/applications/published-notice');
  assert.equal(safeOfficialUrl('javascript:alert(1)'), undefined);
  assert.equal(safeOfficialUrl('https://name:secret@example.com'), undefined);
});
test('WhatsApp enquiries preserve selected service and school as an encoded draft', () => {
  const url = new URL(serviceEnquiryUrl('O’Level upload', 'LASU & UNILAG', 'https://sohconsults.com.ng/applications/example'));
  assert.equal(url.origin, 'https://wa.me');
  assert.match(url.searchParams.get('text'), /O’Level upload/);
  assert.match(url.searchParams.get('text'), /LASU & UNILAG/);
  assert.match(url.searchParams.get('text'), /Page: https:\/\/sohconsults.com.ng\/applications\/example/);
});
