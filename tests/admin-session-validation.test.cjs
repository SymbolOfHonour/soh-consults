const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
function setup() {
  let cookie;
  const env = { ADMIN_PASSWORD: 'test-only-password', ADMIN_SESSION_SECRET: 'test-only-session-secret' };
  const module = { exports: {} };
  const js = ts.transpileModule(fs.readFileSync('lib/admin-auth.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(js, { module, exports: module.exports, Buffer, crypto, process: { env },
    require(name) { return name === 'next/headers' ? { cookies: async () => ({ get: () => ({ value: cookie }) }) } : require(name); },
  });
  return { api: module.exports, set(value) { cookie = value; }, signed(payload) {
    const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return encoded + '.' + crypto.createHmac('sha256', env.ADMIN_SESSION_SECRET).update(encoded).digest('hex');
  } };
}
test('valid owner session works and tampering fails', async () => {
  const s = setup(), token = s.api.createAdminToken();
  s.set(token); assert.equal(await s.api.isAdmin(), true);
  s.set(token.slice(0, -1) + (token.endsWith('0') ? '1' : '0')); assert.equal(await s.api.isAdmin(), false);
});
test('malformed session cookies are rejected without throwing', async () => {
  const s = setup();
  for (const value of [undefined, '', 'a.' + 'é'.repeat(64), 'a.' + '0'.repeat(64), s.api.createAdminToken() + '.extra', s.api.createAdminToken() + '.', 'x'.repeat(2000)]) {
    s.set(value); assert.equal(await s.api.isAdmin(), false);
  }
});
test('signed sessions must have a valid identity and bounded expiry', async () => {
  const s = setup(), now = Math.floor(Date.now() / 1000), nonce = crypto.randomUUID();
  for (const payload of [null, {}, { exp: now - 1, nonce }, { exp: now + 43201, nonce }, { exp: now + 60.5, nonce }, { exp: now + 60 }, { exp: now + 60, nonce: 'invalid' }]) {
    s.set(s.signed(payload)); assert.equal(await s.api.isAdmin(), false);
  }
});
