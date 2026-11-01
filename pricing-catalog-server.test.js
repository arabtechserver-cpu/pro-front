const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText;
const cacheSource = compile('./src/lib/pricing-catalog.server.ts');

function load(fetch, { now = Date.now, timeout = ms => AbortSignal.timeout(ms) } = {}) {
  const module = { exports: {} };
  vm.runInNewContext(cacheSource, {
    module, exports: module.exports, fetch, Buffer, JSON, Array, Error,
    Date: { now }, AbortSignal: { timeout }, process: { env: { INTERNAL_API_URL: 'http://catalog.test/' } },
    require(name) {
      if (name === 'server-only') return {};
      if (name === './api-proxy-candidates') return require('./src/lib/api-proxy-candidates');
      throw new Error(`Unexpected import: ${name}`);
    }
  });
  return module.exports.readPublicPricingCatalog;
}

test('catalog over 2MiB bypasses Next Data Cache, coalesces reads, and preserves every service and field', async () => {
  const catalog = [{
    id: 'category', name: 'Full catalog',
    services: Array.from({ length: 2200 }, (_, index) => ({
      id: `service-${index}`, name: `Service ${index}`, isActive: index % 2 === 0,
      description: 'details-'.repeat(140), price: index + 0.5,
      customFields: [{ name: 'serial', required: true }], extra: { retained: true }
    }))
  }];
  const body = JSON.stringify(catalog);
  assert.ok(Buffer.byteLength(body) > 2 * 1024 * 1024);
  assert.ok(Buffer.byteLength(body) < 4 * 1024 * 1024);
  let calls = 0, respond;
  const read = load((url, options) => {
    calls++;
    assert.equal(url, 'http://catalog.test/api/dhru/services?view=pricing');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.next, undefined);
    assert.equal(options.headers, undefined, 'no user/session headers may enter the public cache');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.redirect, 'error');
    assert.ok(options.signal instanceof AbortSignal);
    return new Promise(resolve => { respond = resolve; });
  });
  const reads = Array.from({ length: 20 }, () => read());
  assert.equal(calls, 1);
  respond(new Response(body));
  const results = await Promise.all(reads);
  assert.deepEqual(results[0], catalog);
  assert.ok(results.every(result => result === results[0]));
  results[0][0].services.pop();
  const hit = await read();
  assert.deepEqual(hit, catalog, 'mutating a returned object cannot corrupt the retained bytes');
  assert.equal(hit[0].services.length, 2200);
  assert.equal(calls, 1);
});

test('the 4MiB retained-byte cap never truncates catalogs and still coalesces over-cap reads', async () => {
  const catalog = [{ services: [
    { id: 'large', description: '\u20ac'.repeat(Math.ceil(4 * 1024 * 1024 / 3)) },
    { id: 'last', customFields: { preserve: 'everything' } }
  ] }];
  const body = JSON.stringify(catalog);
  assert.ok(body.length < 4 * 1024 * 1024);
  assert.ok(Buffer.byteLength(body) > 4 * 1024 * 1024, 'cap is bytes, not character count');
  let calls = 0;
  const read = load(async () => { calls++; return new Response(body); });
  const results = await Promise.all(Array.from({ length: 8 }, () => read()));
  assert.equal(calls, 1);
  assert.deepEqual(results[0], catalog);
  assert.deepEqual(await read(), catalog);
  assert.equal(calls, 2, 'over-cap bytes are not retained after the in-flight fetch completes');
});

test('snapshot expires exactly 120 seconds after completion and refreshes once for concurrent readers', async () => {
  let now = 1000, calls = 0, respond;
  const read = load(() => {
    calls++;
    if (calls === 1) return new Promise(resolve => { respond = resolve; });
    return Promise.resolve(Response.json([{ services: [{ id: 'fresh' }] }]));
  }, { now: () => now });
  const first = read();
  now = 4000;
  respond(Response.json([{ services: [{ id: 'original' }] }]));
  await first;
  now = 123999;
  assert.equal((await read())[0].services[0].id, 'original');
  assert.equal(calls, 1);
  now = 124000;
  const refreshed = await Promise.all([read(), read(), read()]);
  assert.ok(refreshed.every(data => data[0].services[0].id === 'fresh'));
  assert.equal(calls, 2);
});

test('empty catalogs are valid; failed refreshes evict stale bytes and allow immediate recovery', async () => {
  let now = 0, calls = 0, fail = false;
  const read = load(async () => {
    calls++;
    return fail ? Response.json({ error: 'unavailable' }, { status: 503 }) : Response.json([]);
  }, { now: () => now });
  assert.deepEqual(await read(), []);
  assert.deepEqual(await read(), []);
  assert.equal(calls, 1);
  now = 120000;
  fail = true;
  const failures = await Promise.allSettled([read(), read(), read()]);
  assert.ok(failures.every(result => result.status === 'rejected'));
  assert.equal(calls, 2, 'HTTP failures must not be retried at backend aliases');
  fail = false;
  assert.deepEqual(await read(), []);
  assert.equal(calls, 3, 'a failed attempt must not be cached as an empty catalog');
});

test('HTTP errors, non-JSON bodies and malformed catalogs are never cached', async () => {
  for (const response of [
    () => Response.json({}, { status: 504 }),
    () => Response.json({}, { status: 401 }),
    () => new Response('<html>gateway error</html>'),
    ...[{}, [null], [{}], [{ services: 'invalid' }]].map(data => () => Response.json(data))
  ]) {
    let calls = 0;
    const read = load(async () => ++calls === 1 ? response() : Response.json([{ services: [{ id: 'recovered' }] }]));
    await assert.rejects(read());
    assert.equal(calls, 1);
    assert.equal((await read())[0].services[0].id, 'recovered');
    assert.equal(calls, 2);
  }
});

test('discovery and response-body reads share one 8s deadline; cancellation releases the single-flight', async () => {
  const controllers = [], budgets = [], signals = [];
  let calls = 0, bodyStarted;
  const bodyReady = new Promise(resolve => { bodyStarted = resolve; });
  const read = load(async (_url, { signal }) => {
    calls++;
    signals.push(signal);
    if (calls === 1) throw new TypeError('connection refused');
    if (calls > 2) return Response.json([{ services: [{ id: 'recovered' }] }]);
    bodyStarted();
    return new Response(new ReadableStream({
      start(controller) {
        signal.addEventListener('abort', () => controller.error(new Error('body timed out')), { once: true });
      }
    }));
  }, { timeout(ms) {
    budgets.push(ms);
    const controller = new AbortController();
    controllers.push(controller);
    return controller.signal;
  } });
  const first = read();
  const failure = assert.rejects(first);
  await bodyReady;
  assert.equal(calls, 2);
  assert.equal(signals[0], signals[1]);
  controllers[0].abort();
  await failure;
  assert.equal((await read())[0].services[0].id, 'recovered');
  assert.equal(calls, 3);
  assert.deepEqual(budgets, [8000, 8000]);
});

test('page and metadata use the same React-memoized loader, including its failure fallback', async () => {
  for (const fail of [false, true]) {
    let calls = 0, wrappers = 0;
    const catalog = [{ services: [{ id: 'full', name: 'Group service', groupName: 'Group', isActive: true }] }];
    const module = { exports: {} };
    vm.runInNewContext(compile('./src/app/(main)/[lang]/pricing/page.tsx'), {
      module, exports: module.exports, URL,
      require(name) {
        if (name === 'react/jsx-runtime') return require(name);
        if (name === 'react') return { cache(fn) {
          wrappers++;
          let value;
          return () => value || (value = fn());
        } };
        if (name === '@/lib/pricing-catalog.server') return { readPublicPricingCatalog: async () => {
          calls++;
          if (fail) throw new Error('unavailable');
          return catalog;
        } };
        if (name === '@/i18n/get-dictionary') return { getDictionary: async () => ({ pricing: { title: '', subtitle: '' } }) };
        if (name === './PricingClient') return { default: 'PricingClient', __esModule: true };
        throw new Error(`Unexpected import: ${name}`);
      }
    });
    const props = { params: Promise.resolve({ lang: 'en' }), searchParams: Promise.resolve({ section: 'Group' }) };
    const metadata = await module.exports.generateMetadata(props);
    const page = await module.exports.default(props);
    const client = page.props.children.find(child => child?.type === 'PricingClient');
    assert.equal(wrappers, 1);
    assert.equal(calls, 1);
    assert.equal(module.exports.dynamic, 'force-dynamic');
    assert.equal(client.props.initialServices.length, fail ? 0 : 1);
    if (!fail) {
      assert.equal(client.props.initialServices, catalog);
      assert.equal(metadata.title, 'Group (1 Services)');
    }
  }
});
