const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX }
}).outputText;
const actionSource = compile('./src/app/(admin)/admin/login/actions.ts');

function loadAction({
  token = 'actual-admin-session', fetch, incoming = new Headers({ origin: 'https://frontend.test' }),
  timeout = ms => AbortSignal.timeout(ms), admit,
} = {}) {
  const deleted = [], calls = [], admissions = [];
  let releases = 0;
  const values = new Map([
    ['admin_token', token], ['user_token', 'unrelated-user-session'], ['admin_device_token', 'trusted-device']
  ]);
  const module = { exports: {} };
  vm.runInNewContext(actionSource, {
    module, exports: module.exports, Headers, AbortSignal: { timeout },
    process: { platform: 'win32', env: { INTERNAL_API_URL: 'http://backend.test/' } },
    fetch(url, options) {
      calls.push({ url, options });
      if (!fetch) throw new Error('Unexpected fetch');
      return fetch(url, options);
    },
    require(name) {
      if (name === 'next/headers') return {
        cookies: async () => ({
          get: key => values.get(key) ? { value: values.get(key) } : undefined,
          delete(key) { deleted.push(key); values.delete(key); }
        }),
        headers: async () => incoming
      };
      if (name === '@/lib/api-proxy-candidates') return require('./src/lib/api-proxy-candidates');
      if (name === '@/lib/proxy-stream') return { admitProxyRequest: async (heavy, signal) => {
        admissions.push({ heavy, signal });
        if (admit) await admit(signal);
        return () => { releases++; };
      } };
      throw new Error(`Unexpected import: ${name}`);
    }
  });
  return { logout: module.exports.logoutAdmin, deleted, calls, admissions, values, releases: () => releases };
}

test('logout revokes the actual admin token with origin, proxy and device context before cookie deletion', async () => {
  let respond, started;
  const waiting = new Promise(resolve => { started = resolve; });
  const incoming = new Headers({
    origin: 'https://frontend.test', referer: 'https://frontend.test/admin',
    'sec-fetch-site': 'same-origin', 'user-agent': 'fixture-browser',
    'x-forwarded-for': '192.0.2.10, 10.0.0.1', 'x-forwarded-proto': 'https', 'x-forwarded-host': 'frontend.test',
    'x-client-local-ip': '192.168.1.10', 'x-device-fingerprint': 'fixture-fingerprint',
    authorization: 'Bearer unrelated-user-session', cookie: 'user_token=unrelated-user-session',
    'x-admin-token': 'caller-supplied-token', 'x-device-token': 'caller-supplied-device',
  });
  const fixture = loadAction({ incoming, fetch: () => {
    started();
    return new Promise(resolve => { respond = resolve; });
  } });
  const pending = fixture.logout();
  await waiting;
  assert.deepEqual(fixture.deleted, []);
  assert.equal(fixture.releases(), 0);
  assert.equal(fixture.calls.length, 1);
  const { url, options } = fixture.calls[0];
  assert.equal(url, 'http://backend.test/api/auth/logout');
  assert.equal(options.method, 'POST');
  assert.equal(options.cache, 'no-store');
  assert.equal(options.redirect, 'error');
  assert.equal(options.body, '{}');
  assert.equal(options.headers.get('authorization'), 'Bearer actual-admin-session');
  assert.equal(options.headers.get('cookie'), 'admin_token=actual-admin-session');
  assert.equal(options.headers.get('x-admin-token'), null);
  assert.equal(options.headers.get('x-device-token'), 'trusted-device');
  for (const name of ['origin', 'referer', 'sec-fetch-site', 'user-agent', 'x-forwarded-for', 'x-forwarded-proto', 'x-forwarded-host', 'x-client-local-ip', 'x-device-fingerprint']) {
    assert.equal(options.headers.get(name), incoming.get(name));
  }
  assert.equal(fixture.admissions[0].heavy, false);
  assert.equal(fixture.admissions[0].signal, options.signal);
  respond(Response.json({ success: true }));
  const result = await pending;
  assert.equal(result.success, true);
  assert.equal(result.revoked, true);
  assert.deepEqual(fixture.deleted, ['admin_token']);
  assert.equal(fixture.values.get('admin_device_token'), 'trusted-device', 'trusted device is not silently revoked or removed');
  assert.equal(fixture.values.get('user_token'), 'unrelated-user-session');
  assert.equal(fixture.releases(), 1);
});

test('missing token needs no request; explicit invalid/expired/revoked session clears only the admin cookie', async () => {
  const missing = loadAction({ token: null });
  const missingResult = await missing.logout();
  assert.equal(missingResult.success, true);
  assert.equal(missingResult.revoked, false);
  assert.equal(missing.calls.length, 0);
  assert.equal(missing.admissions.length, 0);
  assert.deepEqual(missing.deleted, ['admin_token']);

  const invalid = loadAction({ fetch: async () => Response.json({ error: 'Session expired', code: 'INVALID_SESSION' }, { status: 401 }) });
  const invalidResult = await invalid.logout();
  assert.equal(invalidResult.success, true);
  assert.equal(invalidResult.revoked, false, 'already-invalid is not reported as newly revoked');
  assert.deepEqual(invalid.deleted, ['admin_token']);
  assert.equal(invalid.calls.length, 1);
  assert.equal(invalid.releases(), 1);
});

test('untyped 401, auth outage, IP/origin denials, redirects and malformed responses never clear the cookie', async () => {
  for (const response of [
    () => Response.json({ error: 'Authentication token required or session expired' }, { status: 401 }),
    () => Response.json({ success: true }, { status: 401 }),
    () => Response.json({ code: 'AUTH_UNAVAILABLE' }, { status: 503 }),
    () => Response.json({ code: 'INVALID_SESSION' }, { status: 503 }),
    () => Response.json({ code: 'IP_NOT_ALLOWED' }, { status: 403 }),
    () => Response.json({ code: 'UNTRUSTED_ORIGIN' }, { status: 403 }),
    () => Response.json({}, { status: 500 }),
    () => Response.json({}, { status: 504 }),
    () => new Response(null, { status: 302, headers: { location: 'https://elsewhere.test' } }),
    () => Response.json({ success: false }),
    () => Response.json({ success: 'true' }),
    () => Response.json({ code: 'INVALID_SESSION' }),
    () => new Response('<html>not the logout endpoint</html>'),
    () => { throw new TypeError('connection reset'); },
  ]) {
    const fixture = loadAction({ fetch: async () => response() });
    const result = await fixture.logout();
    assert.equal(result.success, false);
    assert.ok(result.message);
    assert.deepEqual(fixture.deleted, []);
    assert.equal(fixture.values.get('admin_token'), 'actual-admin-session');
    assert.equal(fixture.calls.length, 1, 'never retry a possibly completed mutation at another backend');
    assert.equal(fixture.releases(), 1);
  }
});

test('a failed revocation stays retryable and clears the cookie only after confirmed recovery', async () => {
  let attempts = 0;
  const fixture = loadAction({ fetch: async () => ++attempts === 1
    ? Response.json({ code: 'AUTH_UNAVAILABLE' }, { status: 503 }) : Response.json({ success: true }) });
  assert.equal((await fixture.logout()).success, false);
  assert.deepEqual(fixture.deleted, []);
  assert.equal((await fixture.logout()).success, true);
  assert.deepEqual(fixture.deleted, ['admin_token']);
  assert.equal(fixture.releases(), 2);
});

test('one 10s budget covers queueing and the response body, with no cookie deletion on timeout', async () => {
  const controller = new AbortController();
  let started;
  const waiting = new Promise(resolve => { started = resolve; });
  const budgets = [];
  const fixture = loadAction({
    timeout(ms) { budgets.push(ms); return controller.signal; },
    fetch: async (_url, { signal }) => {
      started();
      return new Response(new ReadableStream({
        start(stream) { signal.addEventListener('abort', () => stream.error(new Error('body timed out')), { once: true }); }
      }));
    }
  });
  const pending = fixture.logout();
  await waiting;
  controller.abort();
  assert.equal((await pending).success, false);
  assert.deepEqual(budgets, [10000]);
  assert.deepEqual(fixture.deleted, []);
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.releases(), 1);

  const queueFailure = loadAction({ admit: async () => { throw new Error('queue timed out'); } });
  assert.equal((await queueFailure.logout()).success, false);
  assert.equal(queueFailure.calls.length, 0);
  assert.equal(queueFailure.releases(), 0);
  assert.deepEqual(queueFailure.deleted, []);
});

function elements(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...elements(tree.props?.children, predicate)];
}

function loadCaller(file, logout, storageBlocked = false) {
  const states = [], removed = [];
  let hookIndex = 0;
  const window = { location: { href: '/admin' } };
  const document = { cookie: 'unchanged' };
  const module = { exports: {} };
  vm.runInNewContext(compile(file), {
    module, exports: module.exports, window, document, confirm: () => true, console: { error() {} },
    localStorage: { removeItem(key) {
      if (storageBlocked) throw new Error('Browser storage blocked');
      removed.push(`local:${key}`);
    } },
    sessionStorage: { removeItem: key => removed.push(`session:${key}`) },
    require(name) {
      if (name === 'react/jsx-runtime') return require(name);
      if (name === 'react') return {
        useEffect() {},
        useState(initial) {
          const index = hookIndex++;
          if (states.length <= index) states.push(initial);
          return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
        }
      };
      if (name.endsWith('/login/actions')) return { logoutAdmin: logout };
      if (name === 'next/navigation') return { usePathname: () => '/admin', useRouter: () => ({}) };
      if (name === 'next/link') return { default: 'a', __esModule: true };
      if (name === '@/components/admin/DashboardAccessRestricted') return { default: 'restricted', __esModule: true };
      throw new Error(`Unexpected import: ${name}`);
    }
  });
  return {
    render() { hookIndex = 0; return module.exports.default({ children: null, currentIp: '192.0.2.10' }); },
    window, document, removed,
  };
}

for (const file of [
  './src/app/(admin)/admin/(dashboard)/layout.tsx',
  './src/components/admin/DashboardAccessRestricted.tsx',
]) {
  test(`${file}: failure or thrown action displays an alert, preserves credentials and enables retry`, async () => {
    for (const logout of [
      async () => ({ success: false, message: 'Revocation not confirmed' }),
      async () => { throw new Error('action transport failed'); },
    ]) {
      const fixture = loadCaller(file, logout);
      await elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
      const tree = fixture.render();
      assert.equal(fixture.window.location.href, '/admin');
      assert.equal(fixture.document.cookie, 'unchanged');
      assert.deepEqual(fixture.removed, []);
      assert.ok(elements(tree, node => node.props?.role === 'alert')[0]?.props.children);
      assert.equal(elements(tree, node => node.type === 'button')[0].props.disabled, false);
    }
  });

  test(`${file}: confirmed logout clears legacy admin storage and only then redirects`, async () => {
    for (const revoked of [true, false]) {
      const fixture = loadCaller(file, async () => ({ success: true, revoked }));
      await elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
      assert.equal(fixture.window.location.href, '/admin/login');
      assert.deepEqual(fixture.removed, ['local:admin_token', 'session:admin_token']);
      assert.match(fixture.document.cookie, /^admin_token=; path=\//);
      assert.equal(elements(fixture.render(), node => node.props?.role === 'alert').length, 0);
    }
  });

  test(`${file}: pending revocation disables logout and a failed attempt can be retried`, async () => {
    let finish, calls = 0;
    const fixture = loadCaller(file, () => {
      calls++;
      return new Promise(resolve => { finish = resolve; });
    });
    const pending = elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
    const disabled = elements(fixture.render(), node => node.type === 'button')[0];
    assert.equal(disabled.props.disabled, true);
    await disabled.props.onClick();
    assert.equal(calls, 1);
    finish({ success: false, message: 'Retry' });
    await pending;
    const retry = elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
    assert.equal(calls, 2);
    finish({ success: true, revoked: true });
    await retry;
    assert.equal(fixture.window.location.href, '/admin/login');
  });

  test(`${file}: blocked browser storage does not prevent an already-confirmed logout`, async () => {
    const fixture = loadCaller(file, async () => ({ success: true, revoked: true }), true);
    await elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
    assert.equal(fixture.window.location.href, '/admin/login');
    assert.equal(elements(fixture.render(), node => node.props?.role === 'alert').length, 0);
  });
}
