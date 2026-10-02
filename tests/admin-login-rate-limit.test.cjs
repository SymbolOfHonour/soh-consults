const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loadFile(path, env, fetch, rate) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const nextResponse = { json(body, options = {}) {
    const response = Response.json(body, options);
    response.cookies = { set() { throw new Error('No session should be issued in these tests'); } };
    return response;
  } };
  vm.runInNewContext(code, { exports, process: { env }, Buffer, Request, Response, AbortSignal, fetch,
    require(name) {
      if (name === 'crypto') return require('node:crypto');
      if (name === 'next/server') return { NextResponse: nextResponse };
      if (name.endsWith('/rate-limit')) return { checkRateLimit: rate };
      if (name.endsWith('/admin-auth')) return { ADMIN_COOKIE: 'test', createAdminToken() { throw new Error('Unexpected authentication'); } };
      throw new Error(`Unexpected import: ${name}`);
    },
  }, { filename: path });
  return exports;
}
const env = { SUPABASE_URL: 'https://qa.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-service-key', ADMIN_SESSION_SECRET: 'test-secret', NODE_ENV: 'production' };
const request = () => new Request('https://qa.invalid/api/admin/login', { method: 'POST', body: JSON.stringify({ password: 'test', otp: '123456' }) });
async function check(overrides, fetch) {
  return loadFile('lib/rate-limit.ts', { ...env, ...overrides }, fetch).checkRateLimit(request(), 'admin-login', 8, 900);
}
test('missing runtime configuration denies access as unavailable', async () => {
  for (const key of ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'ADMIN_SESSION_SECRET']) {
    const result = await check({ [key]: undefined }, () => { throw new Error('Must not call database'); });
    assert.equal(result.allowed, false); assert.equal(result.unavailable, true);
  }
});
test('database errors and network failures remain fail closed', async () => {
  for (const fetch of [async () => new Response('', { status: 401 }), async () => new Response('', { status: 404 }), async () => { throw new Error('Network failure'); }]) {
    const result = await check({}, fetch); assert.equal(result.allowed, false); assert.equal(result.unavailable, true);
  }
});
test('malformed responses are unavailable rather than fake lockouts', async () => {
  for (const value of [null, {}, { allowed: 'false' }, []]) {
    assert.equal((await check({}, async () => Response.json(value))).unavailable, true);
  }
  assert.equal((await check({}, async () => new Response('invalid json'))).unavailable, true);
});
test('real lockout preserves remaining retry duration', async () => {
  const result = await check({}, async () => Response.json({ allowed: false, retry_after: 42 }));
  assert.equal(result.allowed, false); assert.equal(result.retryAfter, 42); assert.equal(result.unavailable, undefined);
});
test('allowed and legacy boolean responses still work', async () => {
  for (const value of [true, { allowed: true, retry_after: 900 }]) assert.equal((await check({}, async () => Response.json(value))).allowed, true);
  assert.equal((await check({}, async () => Response.json(false))).unavailable, undefined);
});
test('retry durations are bounded and invalid values use the configured window', async () => {
  for (const value of [0, -1, 'bad', 2000]) assert.equal((await check({}, async () => Response.json({ allowed: false, retry_after: value }))).retryAfter, 900);
});
test('configuration is read at request time and RPC retains authentication and timeout', async () => {
  const currentEnv = { ...env, SUPABASE_URL: undefined };
  const module = loadFile('lib/rate-limit.ts', currentEnv, async (url, options) => {
    assert.equal(url, 'https://qa.invalid/rest/v1/rpc/check_rate_limit');
    assert.equal(options.headers.apikey, 'test-service-key'); assert.ok(options.signal);
    const body = JSON.parse(options.body); assert.equal(body.p_limit, 8); assert.equal(body.p_window_seconds, 900);
    return Response.json({ allowed: true });
  });
  currentEnv.SUPABASE_URL = env.SUPABASE_URL;
  assert.equal((await module.checkRateLimit(request(), 'admin-login', 8, 900)).allowed, true);
});
test('login returns 503 for unavailable protection without issuing a session', async () => {
  const route = loadFile('app/api/admin/login/route.ts', env, null, async () => ({ allowed: false, retryAfter: 900, unavailable: true }));
  const response = await route.POST(request()); assert.equal(response.status, 503);
  const body = await response.json(); assert.equal(body.code, 'SIGN_IN_UNAVAILABLE'); assert.doesNotMatch(body.error, /Too many/);
});
test('login returns 429 and visible cooldown only for genuine lockouts', async () => {
  const route = loadFile('app/api/admin/login/route.ts', env, null, async () => ({ allowed: false, retryAfter: 42 }));
  const response = await route.POST(request()); assert.equal(response.status, 429); assert.equal(response.headers.get('Retry-After'), '42');
  const body = await response.json(); assert.equal(body.retryAfter, 42); assert.match(body.error, /42 seconds/);
});
test('allowed limiter does not bypass password and two-factor configuration checks', async () => {
  const route = loadFile('app/api/admin/login/route.ts', { ...env, ADMIN_PASSWORD: 'test' }, null, async () => ({ allowed: true, retryAfter: 900 }));
  const response = await route.POST(request()); assert.equal(response.status, 503); assert.match((await response.json()).error, /two-factor authentication/);
});
