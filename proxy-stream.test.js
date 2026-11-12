const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(name, extras = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { module, exports: module.exports, require: name => name === 'next/server' ? { NextResponse: Response } : load(name.replace('./', ''), extras), setTimeout, clearTimeout, Request, Response, Headers, URL, ReadableStream, Uint8Array, AbortSignal, TextDecoder, crypto: require('node:crypto').webcrypto, ...extras, process: { memoryUsage: () => ({ rss: 100 * 1024 * 1024 }), env: {}, ...extras.process } });
  return module.exports;
}
test('proxy forwards chunks and releases admission exactly once at end or cancellation', async () => {
  const { forwardBody } = load('proxy-stream'); let finished = 0, cancelled = 0;
  const input = new ReadableStream({ start(c) { c.enqueue(new Uint8Array([1, 2])); c.enqueue(new Uint8Array([3])); c.close(); } });
  assert.deepEqual([...new Uint8Array(await new Response(forwardBody(input, () => finished++)).arrayBuffer())], [1, 2, 3]);
  assert.equal(finished, 1);
  const endless = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array([5])); }, cancel() { cancelled++; } });
  const reader = forwardBody(endless, () => finished++).getReader(); await reader.read(); await reader.cancel();
  assert.equal(cancelled, 1); assert.equal(finished, 2);
});
test('proxy rejects oversized bodies even when content length is absent or false', async () => {
  const { readBoundedBody } = load('proxy-stream');
  await assert.rejects(readBoundedBody(new Request('http://test', { method: 'POST', body: '123456', headers: { 'content-length': '1' } }), 5), /PAYLOAD_TOO_LARGE/);
  await assert.rejects(readBoundedBody(new Request('http://test', { method: 'POST', body: '1', headers: { 'content-length': '100' } }), 5), /PAYLOAD_TOO_LARGE/);
  assert.equal(new TextDecoder().decode(await readBoundedBody(new Request('http://test', { method: 'POST', body: '123' }), 5)), '123');
});
test('aborting a stalled upload cancels its source and releases the reader', async () => {
  const { readBoundedBody } = load('proxy-stream'); let cancellations = 0;
  const controller = new AbortController();
  const body = new ReadableStream({ cancel() { cancellations++; } });
  const pending = readBoundedBody({ headers: new Headers(), body }, 5, controller.signal);
  controller.abort(); await assert.rejects(pending, /REQUEST_TIMEOUT/);
  assert.equal(cancellations, 1); assert.equal(body.locked, false);
  await assert.rejects(readBoundedBody({ headers: new Headers(), body: new ReadableStream() }, 5, controller.signal), /REQUEST_TIMEOUT/);
});
test('proxy queues excess work instead of rejecting when RSS rises; releases are idempotent', async () => {
  const { admitProxyRequest } = load('proxy-stream', { process: { memoryUsage: () => ({ rss: 500 * 1024 * 1024 }) } });
  const slots = await Promise.all(Array.from({ length: 64 }, () => admitProxyRequest(false)));
  let started = 0;
  const queued = admitProxyRequest(false).then(release => { started++; return release; });
  await Promise.resolve(); assert.equal(started, 0);
  slots[0](); slots[0](); const release = await queued; assert.equal(started, 1);
  let extraStarted = false;
  const extra = admitProxyRequest(false).then(release => { extraStarted = true; return release; });
  await Promise.resolve(); assert.equal(extraStarted, false);
  release(); (await extra)(); slots.slice(1).forEach(release => release());
});
test('streamed request preserves chunks, applies original size bounds and cancels oversize input', async () => {
  const { streamRequestBody } = load('proxy-stream');
  const controller = new AbortController();
  const body = new ReadableStream({ start(c) { c.enqueue(new Uint8Array([1, 2])); c.enqueue(new Uint8Array([3])); c.close(); } });
  const forwarded = streamRequestBody({ headers: new Headers(), body }, 5, controller.signal);
  assert.deepEqual([...new Uint8Array(await new Response(forwarded).arrayBuffer())], [1, 2, 3]);
  let cancelled = false;
  const tooLarge = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(6)); }, cancel() { cancelled = true; } });
  await assert.rejects(new Response(streamRequestBody({ headers: new Headers(), body: tooLarge }, 5, controller.signal)).arrayBuffer(), /PAYLOAD_TOO_LARGE/);
  assert.equal(cancelled, true); assert.equal(tooLarge.locked, false);
});
test('password generator uses secure browser entropy and rejects biased byte range', () => {
  let calls = 0;
  const { securePassword } = load('secure-password', { crypto: { getRandomValues(bytes) { calls++; bytes.fill(calls === 1 ? 255 : 0); return bytes; } } });
  assert.equal(securePassword(), 'a'.repeat(16)); assert.equal(calls, 2);
});

function authRequest(url, headers = {}) {
  return Object.assign(new Request(url, { method: 'POST', headers, body: '{"username":"admin"}' }), { nextUrl: new URL(url) });
}

test('auth budget accepts public HTTPS site origins behind an internal reverse proxy', async () => {
  const { authProxyBudget } = load('auth-proxy-budget', { process: { env: { NODE_ENV: 'production' } } });
  for (const origin of [
    'https://borai.store', 'https://www.borai.store',
    'https://arabtechproserver.tech', 'https://www.arabtechproserver.tech',
  ]) {
    let calls = 0;
    const response = await authProxyBudget(authRequest('http://127.0.0.1:3000/api/admin/login', {
      origin, 'sec-fetch-site': 'same-origin', 'x-forwarded-proto': 'https', 'x-forwarded-host': new URL(origin).host,
    }), async (body, signal) => {
      calls++;
      assert.equal(body.username, 'admin');
      assert.equal(signal.aborted, false);
      return Response.json({ success: true });
    });
    assert.equal(response.status, 200, origin);
    assert.equal(calls, 1);
  }
});

test('auth budget supports explicitly configured public origins without trusting forwarded hosts', async () => {
  const { authProxyBudget } = load('auth-proxy-budget', { process: { env: {
    NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://site.test', FRONTEND_URL: 'https://portal.test/', ADDITIONAL_ALLOWED_ORIGINS: 'https://admin.test, https://preview.test:8443',
  } } });
  for (const origin of ['https://site.test', 'https://portal.test', 'https://admin.test', 'https://preview.test:8443']) {
    const response = await authProxyBudget(authRequest('http://localhost:3000/api/admin/login', {
      origin, 'sec-fetch-site': 'same-origin',
    }), async () => Response.json({ success: true }));
    assert.equal(response.status, 200, origin);
  }
});

test('auth budget rejects foreign, opaque and malformed origins before reading or admitting a login', async () => {
  const { authProxyBudget } = load('auth-proxy-budget', { process: { env: { NODE_ENV: 'production' } } });
  for (const origin of [
    'https://attacker.test', 'https://borai.store.attacker.test', 'http://borai.store',
    'https://borai.store:8443', 'https://borai.store/admin', 'https://user@borai.store', 'null',
    'https://borai.store https://attacker.test',
  ]) {
    let calls = 0;
    const request = authRequest('http://127.0.0.1:3000/api/admin/login', {
      origin, 'sec-fetch-site': 'same-origin', 'x-forwarded-host': origin.replace(/^https?:\/\//, ''), 'x-forwarded-proto': 'https',
    });
    const response = await authProxyBudget(request, async () => { calls++; return Response.json({ success: true }); });
    assert.equal(response.status, 403, origin);
    assert.equal((await response.json()).message, 'Untrusted request origin');
    assert.equal(calls, 0);
    assert.equal(request.bodyUsed, false);
  }
  const crossSite = await authProxyBudget(authRequest('https://borai.store/api/admin/login', {
    origin: 'https://borai.store', 'sec-fetch-site': 'cross-site',
  }), async () => { throw new Error('Cross-site requests must not reach authentication'); });
  assert.equal(crossSite.status, 403);
});

test('auth budget preserves direct same-origin and originless non-browser requests', async () => {
  const { authProxyBudget } = load('auth-proxy-budget');
  for (const headers of [{ origin: 'http://localhost:3000', 'sec-fetch-site': 'same-origin' }, {}]) {
    const response = await authProxyBudget(authRequest('http://localhost:3000/api/admin/login', headers), async () => Response.json({ success: true }));
    assert.equal(response.status, 200);
  }
  const response = await authProxyBudget(authRequest('http://localhost:3000/api/admin/login', {
    'sec-fetch-site': 'cross-site',
  }), async () => { throw new Error('Originless cross-site requests must not reach authentication'); });
  assert.equal(response.status, 403);
});

test('auth budget never authorizes insecure or malformed production origin configuration', async () => {
  for (const value of [
    'http://unsafe.test', 'https://user@unsafe.test', 'https://unsafe.test/path',
    'https://unsafe.test?query=1', 'https://unsafe.test#fragment', 'not-a-url',
  ]) {
    const { authProxyBudget } = load('auth-proxy-budget', { process: { env: { NODE_ENV: 'production', FRONTEND_URL: value } } });
    const response = await authProxyBudget(authRequest('http://127.0.0.1:3000/api/admin/login', {
      origin: value.startsWith('http:') ? 'http://unsafe.test' : 'https://unsafe.test',
    }), async () => { throw new Error('Invalid configuration must not authorize login'); });
    assert.equal(response.status, 403, value);
  }
});

test('forwardBody closes cleanly without piping crash on TimeoutError or client abort, while still propagating real stream errors', async () => {
  const { forwardBody } = load('proxy-stream');

  let finishedTimeout = 0;
  const timedOutUpstream = new ReadableStream({
    pull(c) {
      c.enqueue(new Uint8Array([9, 8]));
    },
  });
  let pulledOnce = false;
  const abortingUpstream = new ReadableStream({
    pull(c) {
      if (!pulledOnce) {
        pulledOnce = true;
        c.enqueue(new Uint8Array([1, 2]));
        return;
      }
      throw Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });
    }
  });
  const bytes = await new Response(forwardBody(abortingUpstream, () => finishedTimeout++)).arrayBuffer();
  assert.deepEqual([...new Uint8Array(bytes)], [1, 2]);
  assert.equal(finishedTimeout, 1);

  let finishedAbort = 0;
  let cancelledByAbort = 0;
  const clientController = new AbortController();
  const slowStream = new ReadableStream({
    pull() { return new Promise(() => {}); },
    cancel() { cancelledByAbort++; }
  });
  const forwardedAbort = forwardBody(slowStream, () => finishedAbort++, { signal: clientController.signal });
  const abortReader = forwardedAbort.getReader();
  const pendingRead = abortReader.read();
  clientController.abort();
  const readResult = await pendingRead;
  assert.equal(readResult.done, true);
  assert.equal(cancelledByAbort, 1);
  assert.equal(finishedAbort, 1);
  void timedOutUpstream.cancel().catch(() => {});

  let finishedErr = 0;
  const brokenUpstream = new ReadableStream({
    pull() {
      throw new Error('unexpected socket failure');
    }
  });
  await assert.rejects(
    new Response(forwardBody(brokenUpstream, () => finishedErr++)).arrayBuffer(),
    /unexpected socket failure/
  );
  assert.equal(finishedErr, 1);
});
