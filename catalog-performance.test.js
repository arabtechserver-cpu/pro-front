const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const { getCatalogPage } = require('./src/lib/service-list-window');

function nodes(tree, predicate) {
  if (!tree || typeof tree !== 'object') return [];
  if (Array.isArray(tree)) return tree.flatMap(child => nodes(child, predicate));
  return [...(predicate(tree) ? [tree] : []), ...nodes(tree.props?.children, predicate)];
}
function text(tree) {
  if (tree == null || typeof tree === 'boolean') return '';
  if (typeof tree !== 'object') return String(tree);
  return Array.isArray(tree) ? tree.map(text).join(' ') : text(tree.props?.children);
}
function fixture(file, props, fetchImpl = async () => Response.json({})) {
  const instances = new Map(), requests = [], effects = [];
  let current, index;
  const params = new URLSearchParams();
  const window = { history: { pushState() {}, replaceState() {} }, scrollTo() {}, location: { origin: 'http://fixture.test' } };
  const react = {
    memo: fn => fn,
    useState(initial) {
      const slot = index++, state = current;
      if (!(slot in state)) state[slot] = typeof initial === 'function' ? initial() : initial;
      return [state[slot], value => { state[slot] = typeof value === 'function' ? value(state[slot]) : value; }];
    },
    useRef(initial) { const slot = index++; return current[slot] ||= { current: initial }; },
    useMemo(fn, deps) {
      const slot = index++, old = current[slot];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) current[slot] = { value: fn(), deps };
      return current[slot].value;
    },
    useCallback(fn, deps) { return react.useMemo(() => fn, deps); },
    useDeferredValue: value => value,
    useEffect(fn, deps) {
      const slot = index++, state = current, old = state[slot];
      if (!old || deps.some((value, i) => !Object.is(value, old.deps[i]))) effects.push(() => {
        old?.cleanup?.(); state[slot] = { deps, cleanup: fn() };
      });
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    module, exports: module.exports, window, URLSearchParams, AbortController, AbortSignal,
    localStorage: { getItem() { return null; } }, console,
    setTimeout() { return 1; }, clearTimeout() {},
    fetch(url, options) { requests.push({ url, options }); return fetchImpl(url, options); },
    require(name) {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return { jsx: (type, props, key) => ({ type, props, key }), jsxs: (type, props, key) => ({ type, props, key }) };
      if (name === 'next/link') return { default: 'Link', __esModule: true };
      if (name === 'next/navigation') return { useSearchParams: () => params, usePathname: () => '/ar/gaming', useRouter: () => ({ push() {}, replace() { throw new Error('Unexpected server navigation'); } }) };
      if (name === '@/components/CatalogPager') return { default: 'CatalogPager', __esModule: true };
      if (name === '@/lib/service-list-window') return require('./src/lib/service-list-window');
      if (name.endsWith('/pricing-groups')) return require('./src/lib/pricing-groups');
      if (name.endsWith('/pricing-catalog')) return { fetchPricingCatalog: async () => [] };
      if (name === '@/utils/cleanHtml') return { stripEmojis: name => name };
      if (name === '@/lib/user-api-fetch') return { userApiFetch: fetchImpl };
      if (name === '@/lib/purchase-service-fields') return require('./src/lib/purchase-service-fields');
      throw new Error(`Unexpected import: ${name}`);
    },
  });
  return {
    requests,
    render(component = module.exports.default, input = props) {
      current = instances.get(component) || [];
      instances.set(component, current); index = 0;
      const tree = component(input);
      while (effects.length) effects.shift()();
      return tree;
    },
    unmount() { for (const state of instances.values()) for (const hook of state) hook?.cleanup?.(); },
  };
}

test('large pricing catalogs keep 12 groups and 20 services per group mounted; all pages remain reachable', () => {
  const catalog = [{ name: 'Server', services: Array.from({ length: 24000 }, (_, id) => ({ id, name: `Service ${id}`, groupName: `Group ${String(Math.floor(id / 80)).padStart(3, '0')}`, isActive: true, price: 1 })) }];
  const f = fixture('./src/app/(main)/[lang]/pricing/PricingClient.tsx', { lang: 'en', dict: {}, initialServices: catalog });
  let tree = f.render();
  assert.equal(nodes(tree, n => n.type === 'h3').length, 12);
  nodes(tree, n => n.type === 'button' && text(n).includes('Expand All'))[0].props.onClick();
  tree = f.render();
  let lists = nodes(tree, n => typeof n.type === 'function' && n.props.servicesList);
  assert.equal(lists.length, 12);
  const list = lists[0];
  let rows = f.render(list.type, list.props);
  assert.equal(nodes(rows, n => n.type === 'tr').length, 21, '20 rows plus table header');
  const links = nodes(rows, n => n.type === 'Link');
  assert.equal(links.length, 40, 'mobile and desktop variants are both bounded');
  assert.ok(links.every(n => n.props.prefetch === false), 'catalog rows must not prefetch hundreds of purchase routes');
  nodes(rows, n => n.type === 'CatalogPager')[0].props.onPageChange(4);
  rows = f.render(list.type, list.props);
  assert.ok(text(rows).includes('Service 79'));
  const pager = nodes(tree, n => n.type === 'CatalogPager')[0];
  pager.props.onPageChange(25);
  tree = f.render();
  assert.equal(nodes(tree, n => n.type === 'h3').length, 12);
  assert.ok(text(tree).includes('Group 299'), 'last catalog group remains reachable');
  f.unmount();
});

test('large gaming package lists mount 24 products and 48 regions, preserve search, and cancel on navigation', async () => {
  const regions = Array.from({ length: 400 }, (_, i) => ({ id: `region-${i}`, name: `Country ${i}`, slug: `country-${i}`, inStockCount: 100, hasProducts: true }));
  const bundle = { id: 'bundle', name: 'Fixture Game', slug: 'fixture-game', sectionId: 'topups', inStockCount: 3000, regions };
  const products = Array.from({ length: 3000 }, (_, i) => ({ id: `product-${i}`, name: `Package ${i}`, price: 1, deliveryType: 'code' }));
  const f = fixture('./src/app/(main)/[lang]/gaming/GamingClient.tsx', { lang: 'en' }, async url => Response.json(
    url.includes('/products') ? { products } : url.includes('/catalog') ? { sections: { popular: { bundles: [bundle] } } } : {}
  ));
  f.render();
  await new Promise(resolve => setImmediate(resolve));
  let tree = f.render();
  nodes(tree, n => n.type === 'div' && n.props.onClick && text(n).includes('Fixture Game'))[0].props.onClick();
  await new Promise(resolve => setImmediate(resolve));
  tree = f.render();
  assert.equal(nodes(tree, n => n.type === 'button' && text(n).includes('Buy Now')).length, 24);
  assert.equal(nodes(tree, n => n.type === 'button' && text(n).includes('Country')).length, 48);
  const pager = nodes(tree, n => n.type === 'CatalogPager' && n.props.label === 'Package pages')[0];
  assert.equal(pager.props.pageCount, 125);
  pager.props.onPageChange(125);
  tree = f.render();
  assert.ok(text(tree).includes('Package 2999'));
  const search = nodes(tree, n => n.type === 'input' && /package/i.test(n.props.placeholder || ''))[0];
  assert.ok(search, 'package search exists');
  search.props.onChange({ target: { value: 'Package 2999' } });
  tree = f.render();
  assert.equal(nodes(tree, n => n.type === 'button' && text(n).includes('Buy Now')).length, 1);
  const request = f.requests.find(r => r.url.includes('/products'));
  f.unmount();
  assert.equal(request.options.signal.aborted, true);
  assert.equal(f.requests.find(r => r.url.includes('/catalog')).options.signal.aborted, true);
});

test('bounded pagination loses no records and clamps after filters shrink on a later page', () => {
  const data = Array.from({ length: 10003 }, (_, i) => i);
  const visited = [];
  for (let page = 1; page <= Math.ceil(data.length / 24); page++) {
    const window = getCatalogPage(data, page, 24);
    assert.ok(window.items.length <= 24); visited.push(...window.items);
  }
  assert.deepEqual(visited, data);
  assert.deepEqual(getCatalogPage([1], 400, 24).items, [1]);
  assert.equal(getCatalogPage([], 400, 24).page, 1);
});

test('pricing display payload preserves IDs and pricing semantics while excluding heavy purchase-only details', () => {
  const module = { exports: {} };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('./src/lib/pricing-view.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { module, exports: module.exports });
  const catalog = [{ name: 'Server', services: Array.from({ length: 4000 }, (_, id) => ({ id, name: `Service ${id}`, groupName: 'Tool', dhruId: id + 10, isActive: true, finalPrice: 0, price: 2, credit: 1, margin: 1, time: 'Instant', description: 'Details '.repeat(300), customFields: { provider: 'schema'.repeat(100) } })) }];
  const projected = module.exports.createPricingView(catalog);
  assert.equal(projected[0].services.length, 4000);
  assert.equal(projected[0].services[3999].id, 3999);
  assert.equal(projected[0].services[0].finalPrice, 0);
  assert.equal(projected[0].services[0].dhruId, 10);
  assert.equal(projected[0].services[0].description, undefined);
  assert.equal(catalog[0].services[0].description.length, 2400, 'source data remains intact');
  assert.ok(JSON.stringify(projected).length < JSON.stringify(catalog).length / 10);
});
