const assert = require("assert");
const { takeInitialGroups } = require("./src/lib/service-list-window.js");

const groups = Array.from({ length: 294 }, (_, index) => [`Package ${index + 1}`, []]);

assert.equal(takeInitialGroups(groups, 24).length, 24);
assert.equal(takeInitialGroups(groups, 24)[0][0], "Package 1");
assert.equal(takeInitialGroups(groups, 24)[23][0], "Package 24");
assert.equal(takeInitialGroups(groups, 500).length, 294);

console.log("service list window tests passed");
