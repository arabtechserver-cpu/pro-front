const assert = require("assert");

let walletPagination = {};
let apiActivation = {};
try {
  walletPagination = require("./src/lib/admin-wallet-pagination.js");
  apiActivation = require("./src/lib/api-activation.js");
} catch {}

const buildAdminTransactionsUrl =
  walletPagination.buildAdminTransactionsUrl || (() => "");
const mergeTransactionPages =
  walletPagination.mergeTransactionPages || (() => []);
const buildApiActivationPayload =
  apiActivation.buildApiActivationPayload || (() => ({}));

assert.equal(
  buildAdminTransactionsUrl({ limit: 25, status: "pending", search: "  Mina  ", cursor: "tx-25" }),
  "/api/transactions?limit=25&status=pending&search=Mina&cursor=tx-25"
);

assert.deepEqual(
  mergeTransactionPages(
    [{ id: "1", status: "pending" }],
    [{ id: "1", status: "completed" }, { id: "2", status: "pending" }],
    false
  ),
  [{ id: "1", status: "completed" }, { id: "2", status: "pending" }]
);
assert.deepEqual(
  mergeTransactionPages([{ id: "1" }], [{ id: "3" }], true),
  [{ id: "3" }]
);

assert.deepEqual(
  buildApiActivationPayload("  My Store  ", " https://store.test "),
  {
    apiSiteName: "My Store",
    apiSiteUrl: "https://store.test",
    confirmActivation: true
  }
);

console.log("admin wallet and API client tests passed");
