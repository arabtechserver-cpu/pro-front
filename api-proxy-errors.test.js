const assert = require('node:assert/strict');
const { isBackendConnectionFailure } = require('./src/lib/api-proxy-errors');

assert.equal(isBackendConnectionFailure({ name: 'TimeoutError', cause: { code: 'ECONNREFUSED' } }), false);
assert.equal(isBackendConnectionFailure({ name: 'AbortError' }), false);
assert.equal(isBackendConnectionFailure({ message: 'fetch failed', cause: { code: 'ECONNREFUSED' } }), true);
assert.equal(isBackendConnectionFailure({ cause: { cause: { code: 'ENOTFOUND' } } }), true);
assert.equal(isBackendConnectionFailure({ cause: { code: 'UND_ERR_HEADERS_TIMEOUT' } }), false);
assert.equal(isBackendConnectionFailure({ cause: { code: 'UND_ERR_SOCKET' } }), false);
console.log('proxy connection failure classification tests passed');
