const assert = require('node:assert/strict');
const { test } = require('node:test');
const { getProviderCustomFields, supportsProviderQuantity } = require('./src/lib/purchase-service-fields');
test('preserve provider QNT and omit admin-only fields in both formats', () => {
 for (const raw of [
 [{ id: 'custom_QNT', field_id: 'QNT', type: 'quantity' }, { field_id: 'Email', adminonly: '0' }, { field_id: 'Internal', adminonly: '1' }],
 { QNT: { type: 'quantity' }, Email: { adminonly: '0' }, Internal: { adminonly: '1' } }
 ]) {
  assert.deepEqual(Object.keys(getProviderCustomFields({ requiresCustom: JSON.stringify(raw) })), ['QNT','Email']);
 }
});
test('only linked provider services get quantity and backend false is authoritative', () => {
 assert.equal(supportsProviderQuantity({ providerId: 'p', supportsQty: true }), true);
 assert.equal(supportsProviderQuantity({ providerId: 'p', supportsQty: false, name: 'Any Qty Credits' }), false);
 assert.equal(supportsProviderQuantity({ providerId: null, supportsQty: true }), false);
 assert.equal(supportsProviderQuantity({ providerId: 'p', customFields: [{ field_id: 'QNT' }] }), true);
});
