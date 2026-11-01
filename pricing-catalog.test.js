const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(fetch) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/pricing-catalog.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { module, exports: module.exports, fetch, Array, Error });
  return module.exports.fetchPricingCatalog;
}
test('pricing rejects error pages and malformed catalog data; preserves valid empty and populated catalogs', async () => {
  const signal = new AbortController().signal;
  await assert.rejects(load(async () => Response.json({}, { status: 504 }))(signal), /CATALOG_HTTP_504/);
  for (const body of [{ error: 'unavailable' }, [null], [{}], [{ services: 'invalid' }]]) {
    await assert.rejects(load(async () => Response.json(body))(signal), /CATALOG_INVALID_RESPONSE/);
  }
  for (const body of [[], [{ services: [{ id: 'service' }] }]]) {
    const result = await load(async (_url, options) => {
      assert.equal(options.signal, signal); return Response.json(body);
    })(signal);
    assert.deepEqual(result, body);
  }
});
test('pricing propagates request cancellation instead of silently waiting indefinitely', async () => {
  const controller = new AbortController();
  const fetchCatalog = load((_url, { signal }) => new Promise((resolve, reject) => {
    signal.addEventListener('abort', () => reject(new Error('REQUEST_ABORTED')), { once: true });
  }));
  const pending = fetchCatalog(controller.signal); controller.abort();
  await assert.rejects(pending, /REQUEST_ABORTED/);
});
