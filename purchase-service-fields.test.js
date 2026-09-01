const assert = require("assert");
const { shouldShowDefaultImeiField } = require("./src/lib/purchase-service-fields.js");

assert.equal(shouldShowDefaultImeiField("IMEI Service", null), true);
assert.equal(shouldShowDefaultImeiField("IMEI Service", {}), true);
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", { custom_PlayerID: { label: "PlayerID", required: true } }),
  false
);
assert.equal(shouldShowDefaultImeiField("Server Service", null), false);
assert.equal(shouldShowDefaultImeiField("Remote Service", null), false);

console.log("purchase service field tests passed");
