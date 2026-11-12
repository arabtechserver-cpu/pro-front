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
    Headers, Response, AbortSignal, Event, atob,
    localStorage: {
      getItem: key => stored.get(key) || null,
      setItem: (key, val) => stored.set(key, String(val)),
      removeItem: key => stored.delete(key)
    },
    document: { cookie: '' },
    window: { dispatchEvent() {}, location: { pathname: '/ar/profile', replace: url => redirects.push(url) } },
    fetch: async (input, init) => { requests.push({ input, init }); return fetchResponse(); }
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/user-api-fetch.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, context);
  return { stored, requests, redirects, setResponse: fn => { fetchResponse = fn; }, fetch: module.exports.userApiFetch };
}

function inactivityHarness({ pathname = '/ar/orders', visibilityState = 'visible', initialStore = [] } = {}) {
  const stored = new Map(initialStore);
  const requests = [], redirects = [];
  const winListeners = new Map();
  const docListeners = new Map();
  const timers = new Map();
  let nextTimerId = 1;

  const addListener = (map) => (evt, fn) => {
    if (!map.has(evt)) map.set(evt, new Set());
    map.get(evt).add(fn);
  };
  const removeListener = (map) => (evt, fn) => {
    map.get(evt)?.delete(fn);
  };
  const emit = (map) => (evt, eventObj = {}) => {
    for (const fn of [...(map.get(evt) || [])]) fn(eventObj);
  };

  const fetchModule = { exports: {} };
  const docObj = {
    cookie: '',
    visibilityState,
    addEventListener: addListener(docListeners),
    removeEventListener: removeListener(docListeners)
  };
  const winObj = {
    location: { pathname, replace: url => redirects.push(url) },
    addEventListener: addListener(winListeners),
    removeEventListener: removeListener(winListeners),
    dispatchEvent(evt) {
      emit(winListeners)(evt.type, evt);
    }
  };
  const localStorageObj = {
    getItem: key => (stored.has(key) ? stored.get(key) : null),
    setItem: (key, val) => stored.set(key, String(val)),
    removeItem: key => stored.delete(key)
  };
  const baseContext = {
    Headers, Response, AbortSignal, Event, atob, setTimeout: (fn, delay) => {
      const id = nextTimerId++;
      timers.set(id, { fn, delay });
      return id;
    },
    clearTimeout: (id) => timers.delete(id),
    localStorage: localStorageObj,
    document: docObj,
    window: winObj,
    fetch: async (input, init) => { requests.push({ input, init }); return Response.json({ success: true }); }
  };

  const fetchCtx = {
    ...baseContext,
    module: fetchModule,
    exports: fetchModule.exports,
    require: () => require('./src/lib/client-auth-token')
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/user-api-fetch.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, fetchCtx);

  const activityModule = { exports: {} };
  const activityCtx = {
    ...baseContext,
    module: activityModule,
    exports: activityModule.exports,
    require: (id) => (id.includes('client-auth-token') ? require('./src/lib/client-auth-token') : fetchModule.exports)
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/user-session-activity.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText, activityCtx);

  const stop = activityModule.exports.startUserInactivityMonitor();
  return {
    stored,
    requests,
    redirects,
    timers,
    doc: docObj,
    emitWindow: emit(winListeners),
    emitDoc: emit(docListeners),
    stop
  };
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

test('missing token short-circuits locally with 401 and clears stale user_session without network request', async () => {
  const client = clientHarness();
  client.stored.delete('user_token');
  client.stored.set('user_session', '{"id":"stale"}');
  const res = await client.fetch('/api/users/profile');
  assert.equal(res.status, 401);
  assert.equal(client.requests.length, 0);
  assert.equal(client.redirects.length, 0);
  assert.equal(client.stored.has('user_session'), false);
});

test('expired JWT short-circuits before hitting backend and triggers single session cleanup redirect', async () => {
  const client = clientHarness();
  const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url');
  const expiredPayload = Buffer.from(JSON.stringify({ id: 'u1', exp: Math.floor(Date.now() / 1000) - 120 })).toString('base64url');
  client.stored.set('user_token', `${header}.${expiredPayload}.sig`);

  const [r1, r2] = await Promise.all([
    client.fetch('/api/users/profile'),
    client.fetch('/api/orders'),
  ]);
  assert.equal(r1.status, 401);
  assert.equal(r2.status, 401);
  assert.equal(client.requests.length, 0);
  assert.equal(client.redirects.length, 1);
  assert.equal(client.redirects[0], '/ar/login?reason=session-expired');
  assert.equal(client.stored.has('user_token'), false);
  assert.equal(client.stored.has('user_session'), false);
});

function makeValidJwt(issuedAgoMs = 1000) {
  const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url');
  const nowSec = Math.floor(Date.now() / 1000);
  const iat = Math.floor((Date.now() - issuedAgoMs) / 1000);
  const payload = Buffer.from(JSON.stringify({ id: 'u1', iat, exp: nowSec + 7 * 24 * 3600 })).toString('base64url');
  return `${header}.${payload}.sig`;
}

test('userApiFetch enforces 30m idle timeout locally and skips idle touch on passive polls', async () => {
  const client = clientHarness();
  client.stored.set('user_token', makeValidJwt(10 * 60 * 1000));
  client.stored.set('user_last_activity', String(Date.now() - 31 * 60 * 1000));

  const res = await client.fetch('/api/orders');
  assert.equal(res.status, 401);
  assert.equal(client.requests.length, 0);
  assert.equal(client.redirects[0], '/ar/login?reason=idle-timeout');
  assert.equal(client.stored.has('user_token'), false);

  const client2 = clientHarness();
  client2.stored.set('user_token', makeValidJwt(10 * 60 * 1000));
  const initialActivity = String(Date.now() - 5 * 60 * 1000);
  client2.stored.set('user_last_activity', initialActivity);

  await client2.fetch('/api/wallet/binance/check-order', { headers: { 'x-passive-poll': 'true' } });
  assert.equal(client2.stored.get('user_last_activity'), initialActivity);

  await client2.fetch('/api/users/profile');
  assert.notEqual(client2.stored.get('user_last_activity'), initialActivity);

  client2.setResponse(async () => Response.json({ error: 'idle', code: 'SESSION_IDLE_EXPIRED' }, { status: 401 }));
  await client2.fetch('/api/orders');
  assert.equal(client2.redirects[0], '/ar/login?reason=idle-timeout');
});

test('inactivity monitor logs out stale sessions on reopen, 30m timer expiry, visibility wake-up and cross-tab storage sync', () => {
  const stale = inactivityHarness({
    pathname: '/ar/orders',
    initialStore: [
      ['user_token', makeValidJwt(31 * 60 * 1000)],
      ['user_session', '{"id":"u1"}'],
      ['user_last_activity', String(Date.now() - 31 * 60 * 1000)]
    ]
  });
  assert.equal(stale.stored.has('user_token'), false);
  assert.equal(stale.redirects[0], '/ar/login?reason=idle-timeout');
  assert.equal(stale.requests.some(r => r.input === '/api/auth/logout' && r.init?.keepalive === true), true);
  stale.stop();

  const publicStale = inactivityHarness({
    pathname: '/ar',
    initialStore: [
      ['user_token', makeValidJwt(31 * 60 * 1000)],
      ['user_session', '{"id":"u1"}'],
      ['user_last_activity', String(Date.now() - 31 * 60 * 1000)]
    ]
  });
  assert.equal(publicStale.stored.has('user_token'), false);
  assert.equal(publicStale.redirects.length, 0);
  publicStale.stop();

  const timed = inactivityHarness({
    pathname: '/ar/wallet',
    initialStore: [
      ['user_token', makeValidJwt(1000)],
      ['user_session', '{"id":"u1"}'],
      ['user_last_activity', String(Date.now() - 1000)]
    ]
  });
  assert.equal(timed.timers.size, 1);
  const [timerEntry] = [...timed.timers.values()];
  assert.ok(timerEntry.delay > 29 * 60 * 1000 && timerEntry.delay <= 30 * 60 * 1000);
  timed.stored.set('user_last_activity', String(Date.now() - 30 * 60 * 1000 - 100));
  timerEntry.fn();
  assert.equal(timed.stored.has('user_token'), false);
  assert.equal(timed.redirects[0], '/ar/login?reason=idle-timeout');
  timed.stop();

  const wake = inactivityHarness({
    pathname: '/en/profile',
    initialStore: [
      ['user_token', makeValidJwt(1000)],
      ['user_session', '{"id":"u1"}']
    ]
  });
  wake.stored.set('user_last_activity', String(Date.now() - 31 * 60 * 1000));
  wake.doc.visibilityState = 'visible';
  wake.emitDoc('visibilitychange');
  assert.equal(wake.stored.has('user_token'), false);
  assert.equal(wake.redirects[0], '/en/login?reason=idle-timeout');
  wake.stop();

  const crossTab = inactivityHarness({
    pathname: '/ar/purchase',
    initialStore: [
      ['user_token', makeValidJwt(1000)],
      ['user_session', '{"id":"u1"}']
    ]
  });
  crossTab.stored.delete('user_token');
  crossTab.emitWindow('storage', { key: 'user_token' });
  assert.equal(crossTab.redirects[0], '/ar/login?reason=idle-timeout');
  crossTab.stop();
});
