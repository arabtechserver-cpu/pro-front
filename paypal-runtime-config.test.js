const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function resolver() {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/paypal-runtime-config.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { module, exports: module.exports });
  return module.exports.resolvePayPalRuntimeConfig;
}
const signal = () => new AbortController().signal;

test('current backend credentials take precedence over a stale frontend ID', async () => {
  const calls = [];
  const config = await resolver()(['http://backend:5000/'], 'stale-client', signal(), async (url, options) => {
    calls.push(url);
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    return Response.json({ success: true, clientId: ' current-client ', configured: true, clientSecret: 'must-not-return' });
  });
  assert.equal(config.clientId, 'current-client');
  assert.deepEqual(Object.keys(config).sort(), ['clientId', 'configured']);
  assert.equal(calls.length, 1);
  assert.equal(calls[0], 'http://backend:5000/api/wallet/paypal/client-id');
});

test('a missing legacy route can use the backend currency configuration', async () => {
  const calls = [];
  const config = await resolver()(['http://backend:5000'], 'stale-client', signal(), async url => {
    calls.push(url);
    return url.endsWith('/client-id') ? Response.json({}, { status: 404 })
      : Response.json({ success: true, config: { paypal: { clientId: 'legacy-client', isActive: true } } });
  });
  assert.equal(config.clientId, 'legacy-client');
  assert.equal(calls.length, 2);
  assert.equal(calls[1], 'http://backend:5000/api/currencies');
});

test('legacy releases without a public ID use the configured frontend ID without claiming server readiness', async () => {
  const config = await resolver()(['http://backend:5000'], ' frontend-client ', signal(), async url =>
    url.endsWith('/client-id') ? Response.json({}, { status: 404 })
      : Response.json({ success: true, config: { paypal: { isActive: true } } }));
  assert.equal(config.clientId, 'frontend-client');
  assert.equal(config.configured, undefined);
});

test('explicitly disabled or unconfigured gateways never use a frontend fallback', async () => {
  let count = 0;
  const disabled = await resolver()(['http://backend:5000'], 'stale-client', signal(), async () => {
    count++;
    return Response.json({ success: true, clientId: '', configured: false });
  });
  assert.equal(disabled.clientId, '');
  assert.equal(disabled.configured, false);
  assert.equal(count, 1);
  for (const paypal of [{ isActive: false }, { configured: false }]) {
    const config = await resolver()(['http://backend:5000'], 'stale-client', signal(), async url =>
      url.endsWith('/client-id') ? Response.json({}, { status: 404 }) : Response.json({ success: true, config: { paypal } }));
    assert.equal(config.configured, false);
    assert.equal(config.clientId, '');
  }
});

test('HTTP failures, redirects and malformed configuration do not enable legacy fallback', async () => {
  for (const response of [
    () => Response.json({}, { status: 500 }),
    () => Response.json({}, { status: 401 }),
    () => Response.json({}, { status: 302 }),
    () => Response.json({ success: true }),
    () => Response.json({ success: true, clientId: '', configured: true }),
    () => new Response('<html>not JSON</html>')
  ]) {
    let count = 0;
    await assert.rejects(() => resolver()(['http://backend:5000'], 'stale-client', signal(), async () => { count++; return response(); }));
    assert.equal(count, 1);
  }
  await assert.rejects(() => resolver()(['http://backend:5000'], '', signal(), async url =>
    url.endsWith('/client-id') ? Response.json({}, { status: 404 }) : Response.json({ success: true, config: {} })));
});

test('discovery retries connection failures but stays with the first backend that responds', async () => {
  const calls = [];
  const config = await resolver()(['http://offline:5000', 'http://backend:5000', 'http://unrelated:5000'], 'frontend-client', signal(), async url => {
    calls.push(url);
    if (url.includes('offline')) throw new TypeError('fetch failed');
    return url.endsWith('/client-id') ? Response.json({}, { status: 404 }) : Response.json({ success: true, config: {} });
  });
  assert.equal(config.clientId, 'frontend-client');
  assert.equal(calls.length, 3);
  assert.ok(calls.every(url => !url.includes('unrelated')));
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => resolver()(['http://backend:5000'], 'frontend-client', controller.signal, async () => { throw new Error('must not fetch'); }), /timed out/);
});
