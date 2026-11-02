const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function elements(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => elements(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...elements(tree.props?.children, predicate)];
}

function loadComponent(file, { props = {}, env = {}, imports = {} } = {}) {
  const hooks = [], pending = [], scripts = new Map(), timers = new Map();
  const verified = [], errors = [], widgets = [], resets = [], removed = [], requests = [];
  let hookIndex = 0, hookCount, timerId = 0, now = 0, scriptsCreated = 0;
  const window = Object.assign(new EventTarget(), { location: { search: '', href: '/admin/login' } });
  const document = Object.assign(new EventTarget(), {
    getElementById: id => scripts.get(id) || null,
    createElement() {
      return Object.assign(new EventTarget(), { remove() { if (scripts.get(this.id) === this) scripts.delete(this.id); } });
    },
    head: { appendChild(script) { scriptsCreated++; scripts.set(script.id, script); } },
  });
  const sdk = {
    render(container, params) { const id = `widget-${widgets.length + 1}`; widgets.push({ id, params }); return id; },
    reset: id => resets.push(id), remove: id => removed.push(id),
  };
  props = { onVerify: token => verified.push(token), onError: error => errors.push(error), ...props };
  const module = { exports: {} };
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(output, {
    module, exports: module.exports, window, document, Event, URLSearchParams, process: { env },
    console: { warn() {}, error() {} },
    setTimeout(callback, ms) { const id = ++timerId; timers.set(id, { callback, due: now + ms }); return id; },
    clearTimeout: id => timers.delete(id),
    fetch(url, options) { requests.push({ url, options }); return Promise.resolve(Response.json({ success: false, message: 'Fixture rejection' })); },
    require(name) {
      if (name === 'react/jsx-runtime') return { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }), Fragment: 'fragment' };
      if (name === 'react') return {
        useState(initial) {
          const index = hookIndex++;
          if (!hooks[index]) hooks[index] = { value: initial };
          return [hooks[index].value, value => { hooks[index].value = typeof value === 'function' ? value(hooks[index].value) : value; }];
        },
        useRef(initial) { const index = hookIndex++; if (!hooks[index]) hooks[index] = { current: initial }; return hooks[index]; },
        useEffect(callback, deps) {
          const index = hookIndex++, previous = hooks[index];
          const changed = !previous || !deps || deps.some((value, i) => !Object.is(value, previous.deps?.[i]));
          if (changed) pending.push(() => {
            previous?.cleanup?.();
            hooks[index] = { callback, deps, cleanup: callback() };
          });
        },
        useMemo: callback => callback(), useCallback: callback => callback,
      };
      if (name === '@/components/BrandLogo') return { default: 'brand-logo', __esModule: true };
      if (Object.hasOwn(imports, name)) return imports[name];
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return {
    window, env, sdk, verified, errors, widgets, resets, removed, requests, scripts, timers, exports: module.exports,
    scriptsCreated: () => scriptsCreated,
    render(nextProps = props) {
      props = nextProps;
      hookIndex = 0;
      const tree = module.exports.default(props);
      if (hookCount !== undefined) assert.equal(hookIndex, hookCount, 'Hook order must remain stable');
      hookCount = hookIndex;
      for (const node of elements(tree, node => node.props?.ref)) node.props.ref.current ||= {};
      while (pending.length) pending.shift()();
      return tree;
    },
    advance(ms) {
      now += ms;
      for (const [id, timer] of [...timers]) if (timer.due <= now) { timers.delete(id); timer.callback(); }
    },
    replayEffects() {
      for (const hook of hooks) hook?.cleanup?.();
      for (const hook of hooks) if (hook?.callback) hook.cleanup = hook.callback();
    },
    unmount() { for (const hook of hooks) hook?.cleanup?.(); },
  };
}

const widgetFile = './src/components/CloudflareTurnstile.tsx';

test('a slow challenge never invents a token; only the real success callback verifies it', () => {
  const fixture = loadComponent(widgetFile);
  fixture.window.turnstile = fixture.sdk;
  fixture.render();
  fixture.advance(4000);
  assert.deepEqual(fixture.verified.filter(Boolean), []);
  assert.equal(fixture.widgets[0].params.retry, 'never');
  assert.equal(fixture.widgets[0].params['refresh-timeout'], 'manual');
  fixture.widgets[0].params.callback('real-cloudflare-token');
  assert.deepEqual(fixture.verified.filter(Boolean), ['real-cloudflare-token']);
  assert.equal(elements(fixture.render(), node => node.props?.role === 'alert').length, 0);
  fixture.unmount();
});

test('widget errors, timeouts and unsupported browsers invalidate tokens and allow a fresh manual retry', () => {
  for (const callback of ['error-callback', 'timeout-callback', 'unsupported-callback']) {
    const fixture = loadComponent(widgetFile);
    fixture.window.turnstile = fixture.sdk;
    fixture.render();
    const old = fixture.widgets[0];
    old.params.callback('old-token');
    old.params[callback]('200500');
    assert.equal(fixture.verified.at(-1), '');
    assert.equal(fixture.errors.length, 1);
    const tree = fixture.render();
    assert.equal(elements(tree, node => node.props?.role === 'alert').length, 1);
    elements(tree, node => node.type === 'button')[0].props.onClick();
    fixture.render();
    assert.equal(fixture.widgets.length, 2);
    assert.deepEqual(fixture.removed, [old.id]);
    old.params.callback('stale-token');
    assert.equal(fixture.verified.at(-1), '');
    fixture.widgets[1].params.callback('new-token');
    assert.equal(fixture.verified.at(-1), 'new-token');
    fixture.unmount();
  }
});

test('a shared SDK script handles load errors after Strict Mode replay and reloads on retry', () => {
  const fixture = loadComponent(widgetFile);
  fixture.render();
  fixture.replayEffects();
  assert.equal(fixture.scriptsCreated(), 1);
  const failed = fixture.scripts.get('cf-turnstile-script');
  failed.dispatchEvent(new Event('error'));
  assert.deepEqual(fixture.errors, ['script-load-error']);
  assert.equal(fixture.scripts.size, 0);
  assert.deepEqual(fixture.verified.filter(Boolean), []);
  elements(fixture.render(), node => node.type === 'button')[0].props.onClick();
  fixture.render();
  assert.equal(fixture.scriptsCreated(), 2);
  fixture.window.turnstile = fixture.sdk;
  fixture.scripts.get('cf-turnstile-script').dispatchEvent(new Event('load'));
  assert.equal(fixture.widgets.length, 1);
  assert.equal(fixture.timers.size, 0);
  fixture.widgets[0].params.callback('recovered-token');
  assert.equal(fixture.verified.at(-1), 'recovered-token');
  fixture.unmount();
});

test('a blocked SDK load shows a retryable failure rather than successful verification', () => {
  const fixture = loadComponent(widgetFile);
  fixture.render();
  fixture.advance(4000);
  assert.equal(fixture.errors.length, 0);
  fixture.advance(11000);
  assert.deepEqual(fixture.errors, ['script-load-error']);
  assert.equal(fixture.scripts.size, 0);
  assert.deepEqual(fixture.verified.filter(Boolean), []);
  assert.equal(elements(fixture.render(), node => node.props?.role === 'alert').length, 1);
  fixture.unmount();
});

test('expiration and global resets clear tokens; changing parent callbacks does not recreate the widget', () => {
  const fixture = loadComponent(widgetFile);
  fixture.window.turnstile = fixture.sdk;
  fixture.render();
  const widget = fixture.widgets[0];
  widget.params.callback('original-token');
  widget.params['expired-callback']();
  assert.equal(fixture.verified.at(-1), '');
  assert.deepEqual(fixture.resets, [widget.id]);
  const latest = [];
  fixture.render({ onVerify: token => latest.push(token) });
  assert.equal(fixture.widgets.length, 1);
  fixture.exports.resetTurnstile();
  assert.deepEqual(latest, ['']);
  widget.params.callback('fresh-token');
  assert.deepEqual(latest, ['', 'fresh-token']);
  fixture.unmount();
  widget.params.callback('after-unmount');
  assert.deepEqual(latest, ['', 'fresh-token']);
});

test('explicit development disable mode preserves hook order and notifies the parent only once', () => {
  const fixture = loadComponent(widgetFile, { env: { NODE_ENV: 'development' } });
  fixture.window.turnstile = fixture.sdk;
  fixture.render();
  fixture.env.NEXT_PUBLIC_DISABLE_TURNSTILE = 'true';
  assert.equal(fixture.render(), null);
  assert.equal(fixture.verified.at(-1), 'turnstile-disabled');
  assert.deepEqual(fixture.removed, ['widget-1']);
  fixture.render();
  assert.equal(fixture.verified.filter(token => token === 'turnstile-disabled').length, 1);
  fixture.unmount();
});

for (const file of [
  './src/app/(admin)/admin/login/page.tsx',
  './src/app/(main)/[lang]/login/LoginClient.tsx',
  './src/app/(main)/[lang]/register/RegisterClient.tsx',
]) {
  test(`${file}: forms remain disabled until verification and invalidate tokens on failure`, async () => {
    const fixture = loadComponent(file, {
      props: { lang: 'en', dict: { login: {}, register: {} } },
      imports: {
        'next/link': { __esModule: true, default: 'a' },
        'next/script': { __esModule: true, default: 'script' },
        'next/navigation': { useRouter: () => ({}) },
        './actions': { loginAdmin() { throw new Error('Unexpected action fallback'); } },
        '@/lib/server-action-utils': { isServerActionMismatchError: () => false },
        '@/lib/secure-password': { securePassword: () => 'secure-password' },
        '@/components/TermsModal': { __esModule: true, default: 'terms' },
        '@/components/CloudflareTurnstile': { __esModule: true, default: 'turnstile', resetTurnstile() {} },
        '@/utils/deviceUtils': {
          getOrCreateDeviceToken: () => 'device', getDeviceFingerprint: async () => 'fingerprint', getLocalIpViaWebRTC: async () => ({}),
        },
      },
    });
    let tree = fixture.render();
    assert.equal(elements(tree, node => node.type === 'button' && node.props.type === 'submit')[0].props.disabled, true);
    let widget = elements(tree, node => node.type === 'turnstile')[0];
    widget.props.onVerify('real-token');
    tree = fixture.render();
    assert.equal(elements(tree, node => node.type === 'button' && node.props.type === 'submit')[0].props.disabled, false);
    widget = elements(tree, node => node.type === 'turnstile')[0];
    widget.props.onError('200500');
    tree = fixture.render();
    assert.equal(elements(tree, node => node.type === 'button' && node.props.type === 'submit')[0].props.disabled, true);
    if (file.includes('(admin)')) {
      await elements(tree, node => node.type === 'form')[0].props.onSubmit({ preventDefault() {} });
      assert.equal(fixture.requests.length, 0);
    }
    fixture.unmount();
  });
}
