const assert = require("assert");
const { getBackendCandidates } = require("./src/lib/api-proxy-candidates.js");

const candidates = getBackendCandidates("http://pro-b-i0r2xu:5000", "http://api:5000");

assert.deepEqual(candidates, [
  "http://pro-b-i0r2xu:5000",
  "http://api:5000",
  "http://backend:5000",
  "http://pro-back:5000"
]);

console.log("api proxy candidate tests passed");
