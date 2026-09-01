const assert = require("assert");

let orderDetails = {};
try {
  orderDetails = require("./src/lib/order-details.js");
} catch {}

const getOrderFieldRows = orderDetails.getOrderFieldRows || (() => []);
const getOrderServiceTypeLabel =
  orderDetails.getOrderServiceTypeLabel || (() => "غير محدد");

assert.deepEqual(
  getOrderFieldRows({
    fieldDetails: [
      {
        id: "custom_PlayerID",
        providerFieldId: "PlayerID",
        label: "PlayerID",
        type: "text",
        required: true,
        value: "51470430069",
        missing: false
      }
    ]
  }),
  [
    {
      id: "custom_PlayerID",
      providerFieldId: "PlayerID",
      label: "PlayerID",
      type: "text",
      required: true,
      value: "51470430069",
      missing: false
    }
  ]
);

assert.equal(getOrderServiceTypeLabel("imei"), "خدمة IMEI");
assert.equal(getOrderServiceTypeLabel("server"), "خدمة سيرفر");
assert.equal(getOrderServiceTypeLabel("remote"), "خدمة تحكم عن بُعد");

console.log("order details tests passed");
