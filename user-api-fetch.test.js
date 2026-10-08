const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function clientHarness() {
  const stored = new Map([['user_token', 'old-token'], ['user_session', '{"id":"client"}']]);
  const requests = [], redirects = [];
  let fetchResponse = async () => Response.json({ success: true });
  const module = { exports: {} };
  const context = {
    module, exports: module.exports,
    require: () => require('./src/lib/client-auth-token'),
    Headers, Response, AbortSignal, Event,
    localStorage: { getItem: key => stored.get(key) || null, removeItem: key => stored.delete(key) },
    document: { cookie: '' },
    window: { dispatchEvent() {}, location: { pathname: '/ar/profile', replace: url => redirects.push(url) } },
    fetch: async (input, init) => { requests.push({ input, init }); return fetchResponse(); }
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/user-api-fetch.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, context);
  return { stored, requests, redirects, setResponse: fn => { fetchResponse = fn; }, fetch: module.exports.userApiFetch };
}

test('client requests use the legacy token fallback and exclude admin cookies', async () => {
  const client = clientHarness();
  client.stored.set('user_token', 'null');
  client.stored.set('token', 'legacy-token');
  await client.fetch('/api/users/profile', { headers: { Authorization: 'Bearer null' }, credentials: 'include' });
  assert.equal(client.requests[0].init.headers.get('Authorization'), 'Bearer legacy-token');
  assert.equal(client.requests[0].init.credentials, 'omit');
});

test('expired sessions are cleared once and do not issue repeated unauthorized requests', async () => {
  const client = clientHarness();
  client.setResponse(async () => Response.json({ error: 'expired' }, { status: 401 }));
  await client.fetch('/api/users/profile');
  await client.fetch('/api/transactions');
  assert.equal(client.requests.length, 1);
  assert.equal(client.redirects.length, 1);
  assert.equal(client.redirects[0], '/ar/login?reason=session-expired');
  assert.equal(client.stored.has('user_session'), false);
});

test('a delayed 401 for an old token cannot clear a newer signed-in session', async () => {
  const client = clientHarness();
  let release;
  client.setResponse(() => new Promise(resolve => { release = resolve; }));
  const pending = client.fetch('/api/orders');
  client.stored.set('user_token', 'new-token');
  release(Response.json({ error: 'old session' }, { status: 401 }));
  await pending;
  assert.equal(client.redirects.length, 0);
  assert.equal(client.stored.get('user_token'), 'new-token');
});
