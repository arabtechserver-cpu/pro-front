const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function clientHarness(fetch) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/paypal-config.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { module, exports: module.exports, fetch });
  return module.exports.fetchPayPalClientId;
}

test('checkout loads the current server ID without caching or a build-time merchant fallback', async () => {
  let currentId = ' runtime-merchant ';
  const signal = new AbortController().signal;
  const load = clientHarness(async (url, options) => {
    assert.equal(url, '/api/wallet/paypal/client-id');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.signal, signal);
    return Response.json({ success: true, clientId: currentId, configured: true });
  });
  assert.equal(await load(signal), 'runtime-merchant');
  currentId = 'new-merchant';
  assert.equal(await load(signal), 'new-merchant');
});

test('a temporarily unavailable endpoint can be retried and is distinct from unconfigured PayPal', async () => {
  let response = () => Response.json({ error: 'not found' }, { status: 404 });
  const load = clientHarness(async () => response());
  const signal = new AbortController().signal;
  await assert.rejects(() => load(signal), /Unable to load/);
  response = () => Response.json({ success: true, configured: false, clientId: '' });
  assert.equal(await load(signal), '');
  response = () => Response.json({ success: true, clientId: 'recovered-id' });
  assert.equal(await load(signal), 'recovered-id');
  response = () => Response.json({ success: true });
  await assert.rejects(() => load(signal), /Invalid PayPal/);
});
