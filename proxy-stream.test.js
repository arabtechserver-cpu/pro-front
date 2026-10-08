const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(name, extras = {}) {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(`src/lib/${name}.ts`, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, { module, exports: module.exports, require: name => load(name.replace('./', '')), setTimeout, clearTimeout, Request, Response, Headers, ReadableStream, Uint8Array, AbortSignal, TextDecoder, crypto: require('node:crypto').webcrypto, process: { memoryUsage: () => ({ rss: 100 * 1024 * 1024 }) }, ...extras });
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
  const slots = await Promise.all(Array.from({ length: 16 }, () => admitProxyRequest(false)));
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
