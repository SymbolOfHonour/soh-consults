const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const vm = require('node:vm');

function setup(initial, history = null) {
  const records = new Map([[initial.id, { ...initial }]]);
  if (history) records.set(history.id, { ...history });
  let beforePatch = null;
  const requests = [];
  const fetchMock = async (input, options = {}) => {
    const url = new URL(input);
    const method = options.method || 'GET';
    requests.push({ method, url });
    const idFilter = url.searchParams.get('id');
    const id = idFilter?.startsWith('eq.') ? idFilter.slice(3) : null;
    if (method === 'GET') return { ok: true, json: async () => records.has(id) ? [{ ...records.get(id) }] : [] };
    if (method === 'POST') return { ok: true, json: async () => [] };
    if (method === 'PATCH') {
      if (beforePatch) { const callback = beforePatch; beforePatch = null; callback(records); }
      const row = records.get(id);
      const source = url.searchParams.get('source_name');
      const timestamp = url.searchParams.get('updated_at');
      const matches = row && source === `eq.${row.source_name}` && timestamp === `eq.${row.updated_at}`;
      if (!matches) return { ok: true, json: async () => [] };
      const updated = { ...row, ...JSON.parse(options.body) };
      records.set(id, updated);
      return { ok: true, json: async () => [{ ...updated }] };
    }
    throw Error(`Unexpected request ${method}`);
  };
  const source = fs.readFileSync('lib/admin-recovery.ts', 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${js}\n})`, {
    process: { env: { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SERVICE_ROLE_KEY: 'test-key' } },
    URLSearchParams, Date, crypto: { randomUUID: () => 'audit-id' }, fetch: fetchMock,
  })((name) => { if (name === './news-queue') return {}; throw Error(`Unexpected import ${name}`); }, module, module.exports);
  return { api: module.exports, records, requests, race: callback => { beforePatch = callback; } };
}

const story = () => ({ id: 'story-1', source_name: 'S.O.H CONSULTS', source_url: 'manual:1', status: 'draft', title: 'Original', updated_at: '2026-09-18T10:00:00Z' });
const trashed = () => ({ ...story(), source_name: `S.O.H Trash:${encodeURIComponent(JSON.stringify({ source_name: 'S.O.H CONSULTS', status: 'draft' }))}`, status: 'archived' });
const history = (snapshot = story()) => ({ id: 'history-1', source_name: 'S.O.H System:history:story-1', details: JSON.stringify({ snapshot }) });

test('moving to Trash requires unchanged source and timestamp', async () => {
  const env = setup(story());
  env.race(rows => rows.set('story-1', { ...rows.get('story-1'), updated_at: 'changed' }));
  assert.equal(await env.api.moveStoryToTrash('story-1'), null);
  assert.equal(env.records.get('story-1').source_name, 'S.O.H CONSULTS');
  assert.equal(env.requests.filter(r => r.method === 'POST').length, 0);
});

test('restoring from Trash fails if another request changed its state', async () => {
  const env = setup(trashed());
  env.race(rows => rows.set('story-1', { ...rows.get('story-1'), source_name: 'S.O.H CONSULTS' }));
  assert.equal(await env.api.restoreStoryFromTrash('story-1'), null);
  assert.equal(env.records.get('story-1').status, 'archived');
});

test('version restore rejects a currently trashed update without patching', async () => {
  const env = setup(trashed(), history());
  assert.equal(await env.api.restoreVersion('history-1'), null);
  assert.equal(env.requests.filter(r => r.method === 'PATCH').length, 0);
});

test('version restore rejects mismatched snapshot identity and Trash snapshots', async () => {
  for (const snapshot of [{ ...story(), id: 'another-story' }, trashed()]) {
    const env = setup(story(), history(snapshot));
    assert.equal(await env.api.restoreVersion('history-1'), null);
    assert.equal(env.requests.filter(r => r.method === 'PATCH').length, 0);
  }
});

test('version restore cannot overwrite a concurrent Trash transition', async () => {
  const env = setup(story(), history({ ...story(), title: 'Previous version' }));
  env.race(rows => rows.set('story-1', trashed()));
  assert.equal(await env.api.restoreVersion('history-1'), null);
  assert.equal(env.records.get('story-1').source_name.startsWith('S.O.H Trash:'), true);
  assert.equal(env.requests.filter(r => r.method === 'POST').length, 0);
});

test('normal Trash and Restore operations remain available', async () => {
  const env = setup(story());
  const moved = await env.api.moveStoryToTrash('story-1');
  assert.equal(moved.source_name.startsWith('S.O.H Trash:'), true);
  const restored = await env.api.restoreStoryFromTrash('story-1');
  assert.equal(restored.source_name, 'S.O.H CONSULTS');
  assert.equal(restored.status, 'draft');
});
