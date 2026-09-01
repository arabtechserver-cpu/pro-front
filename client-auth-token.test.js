const assert = require("assert");
const { getUserAuthToken } = require("./src/lib/client-auth-token.js");

const storage = {
  getItem(key) {
    return { user_token: "active-user-token", token: "legacy-token" }[key] || null;
  }
};

assert.equal(getUserAuthToken(storage), "active-user-token");
assert.equal(getUserAuthToken({ getItem: () => "null" }), null);

console.log("client auth token tests passed");
