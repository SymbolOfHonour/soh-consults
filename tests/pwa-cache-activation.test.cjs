const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

test('activation removes only obsolete S.O.H caches', async () => {
  const handlers = {}, removed = [];
  let claimed = false;
  const self = { addEventListener: (name, fn) => { handlers[name] = fn; }, clients: { claim: () => { claimed = true; } } };
  const caches = { keys: async () => ['soh-consults-v6', 'soh-consults-v7', 'other-app-cache'], delete: async name => { removed.push(name); } };
  vm.runInNewContext(fs.readFileSync('public/sw.js', 'utf8'), { self, caches });
  let work;
  handlers.activate({ waitUntil: promise => { work = promise; } });
  await work;
  assert.deepEqual(removed, ['soh-consults-v6']);
  assert.equal(claimed, true);
});
