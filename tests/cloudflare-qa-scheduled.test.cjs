const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(fetch) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync('cloudflare-qa-worker.js', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, allowJs: true } }).outputText;
  vm.runInNewContext(code, { exports, require: () => ({ default: { fetch } }), Request, Error });
  return exports;
}
test('all QA schedules dispatch authenticated requests through the worker', async () => {
  const requests = [];
  const worker = load(async (request, env, ctx) => { requests.push(request); assert.equal(env.CRON_SECRET, 'test-only'); assert.ok(ctx); return new Response('{}'); });
  for (const cron of ['0 5 * * *', '0 6 * * *', '0 7 * * *']) await worker.runQaScheduled({ cron }, { CRON_SECRET: 'test-only', SUPABASE_URL: 'https://hyzyklmctuppypvqxggo.supabase.co' }, {});
  assert.deepEqual(requests.map(r => new URL(r.url).pathname), ['/api/cron/smart-operations', '/api/cron/import-news', '/api/cron/backup-updates']);
  for (const request of requests) {
    assert.equal(new URL(request.url).hostname, 'soh-consults-qa.oluyepeadetayo.workers.dev');
    assert.equal(request.headers.get('authorization'), 'Bearer test-only');
  }
});
test('missing secret and unknown schedule fail without invoking routes', async () => {
  const worker = load(() => assert.fail('unexpected route'));
  await assert.rejects(worker.runQaScheduled({ cron: '0 7 * * *' }, { SUPABASE_URL: 'https://hyzyklmctuppypvqxggo.supabase.co' }, {}), /secret/);
  await assert.rejects(worker.runQaScheduled({ cron: '*' }, { CRON_SECRET: 'test-only', SUPABASE_URL: 'https://hyzyklmctuppypvqxggo.supabase.co' }, {}), /Unknown/);
});
test('route failures reject the scheduled event', async () => {
  const worker = load(async () => new Response('{}', { status: 500 }));
  await assert.rejects(worker.runQaScheduled({ cron: '0 7 * * *' }, { CRON_SECRET: 'test-only', SUPABASE_URL: 'https://hyzyklmctuppypvqxggo.supabase.co' }, {}), /500/);
});
test('scheduled handler tracks completion and preserves HTTP handler', async () => {
  const fetch = async () => new Response('{}');
  const worker = load(fetch);
  assert.equal(worker.default.fetch, fetch);
  let pending;
  worker.default.scheduled({ cron: '0 7 * * *' }, { CRON_SECRET: 'test-only', SUPABASE_URL: 'https://hyzyklmctuppypvqxggo.supabase.co' }, { waitUntil(promise) { pending = promise; } });
  assert.ok(pending);
  await pending;
});

test('scheduled jobs reject a production or missing database binding', async () => {
 const worker = load(() => assert.fail('unexpected route'));
 await assert.rejects(worker.runQaScheduled({ cron: '0 7 * * *' }, { CRON_SECRET: 'test-only', SUPABASE_URL: 'https://production.example' }, {}), /isolated QA database/);
});
