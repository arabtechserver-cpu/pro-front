const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

test('production Next route recovers a legacy backend 404 and follows live backend configuration', { timeout: 25000 }, async () => {
  let mode = 'legacy';
  const calls = [];
  const paymentCalls = [];
  const backend = http.createServer((request, response) => {
    calls.push(request.url);
    response.setHeader('Content-Type', 'application/json');
    if (request.method === 'POST' && ['/api/wallet/paypal/create-order', '/api/wallet/paypal/capture-order'].includes(request.url)) {
      let body = '';
      request.on('data', chunk => { body += chunk; });
      request.on('end', () => {
        paymentCalls.push({ path: request.url, authorization: request.headers.authorization, body: JSON.parse(body) });
        response.end(JSON.stringify({ success: true, orderId: 'fixture-order' }));
      });
      return;
    }
    if (request.url === '/api/wallet/paypal/client-id') {
      if (mode === 'legacy') { response.statusCode = 404; return response.end(JSON.stringify({ error: 'route missing' })); }
      if (mode === 'error') { response.statusCode = 500; return response.end('{}'); }
      return response.end(JSON.stringify({ success: true, configured: mode !== 'disabled', clientId: mode === 'disabled' ? '' : 'backend-client' }));
    }
    if (request.url === '/api/currencies') return response.end(JSON.stringify({ success: true, config: { paypal: { isActive: true } } }));
    response.statusCode = 404;
    response.end('{}');
  });
  await new Promise(resolve => backend.listen(0, '127.0.0.1', resolve));
  const probe = net.createServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const frontend = spawn(process.execPath, [path.join(__dirname, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: __dirname,
    env: {
      ...process.env, NODE_ENV: 'production', NEXT_TELEMETRY_DISABLED: '1',
      INTERNAL_API_URL: `http://127.0.0.1:${backend.address().port}`,
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: 'runtime-only-client',
      JWT_SECRET: 'isolated-next-paypal-route-test-secret'
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let output = '';
  try {
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error(`Frontend startup timed out: ${output}`)), 15000);
      const onData = data => {
        output += data;
        if (output.includes('Ready in')) { clearTimeout(timeout); resolve(); }
      };
      frontend.stdout.on('data', onData);
      frontend.stderr.on('data', onData);
      frontend.once('error', error => { clearTimeout(timeout); reject(error); });
      frontend.once('exit', code => { clearTimeout(timeout); reject(new Error(`Frontend exited (${code}): ${output}`)); });
    });
    const url = `http://127.0.0.1:${port}/api/wallet/paypal/client-id`;
    let response = await fetch(url);
    assert.equal(response.status, 200, output);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { success: true, clientId: 'runtime-only-client' });
    assert.deepEqual(calls, ['/api/wallet/paypal/client-id', '/api/currencies']);
    for (const [action, body] of [['create-order', { amount: 10 }], ['capture-order', { orderId: 'fixture-order' }]]) {
      const payment = await fetch(`http://127.0.0.1:${port}/api/wallet/paypal/${action}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer fixture-token' }, body: JSON.stringify(body)
      });
      assert.equal(payment.status, 200);
      assert.equal((await payment.json()).orderId, 'fixture-order');
    }
    assert.deepEqual(paymentCalls, [
      { path: '/api/wallet/paypal/create-order', authorization: 'Bearer fixture-token', body: { amount: 10 } },
      { path: '/api/wallet/paypal/capture-order', authorization: 'Bearer fixture-token', body: { orderId: 'fixture-order' } }
    ]);

    mode = 'modern';
    response = await fetch(url);
    assert.deepEqual(await response.json(), { success: true, clientId: 'backend-client', configured: true });
    mode = 'disabled';
    response = await fetch(url);
    assert.deepEqual(await response.json(), { success: true, clientId: '', configured: false });
    mode = 'error';
    response = await fetch(url);
    assert.equal(response.status, 503, 'a backend outage must not enable a stale merchant fallback');
    assert.equal((await response.json()).code, 'PAYPAL_CONFIG_UNAVAILABLE');
  } finally {
    if (frontend.exitCode === null) {
      frontend.kill();
      await new Promise(resolve => frontend.once('exit', resolve));
    }
    await new Promise(resolve => backend.close(resolve));
  }
});
