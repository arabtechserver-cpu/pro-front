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

// Secondary custom fields (like Battery Picture Link) MUST NOT hide the default IMEI / Serial field!
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_Battery Picture Link": {
      fieldname: "Battery Picture Link",
      type: "text",
      required: true
    }
  }),
  true
);

// Another secondary field (Current Country)
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_Current Country": {
      fieldname: "Current Country",
      type: "text",
      required: true
    }
  }),
  true
);

// When provider ALREADY sends an explicit SN or IMEI custom field, DO NOT duplicate default IMEI input
assert.equal(
  shouldShowDefaultImeiField("IMEI Service", {
    "custom_SN": {
      fieldname: "SN",
      type: "text",
      required: true
    }
  }),
  false
);

console.log("purchase service field tests passed");
