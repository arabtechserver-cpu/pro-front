const assert = require("assert");
const {
  categoryMatchesFilter,
  createInitialCollapsedGroups,
  sortDisplayGroups
} = require("./src/lib/pricing-groups.js");

assert.equal(categoryMatchesFilter("IMEI Service", "imei"), true);
assert.equal(categoryMatchesFilter("Server Service", "server"), true);
assert.equal(categoryMatchesFilter("Remote Service", "remote"), true);
assert.equal(categoryMatchesFilter("Remote Service", "server"), false);

const sorted = sortDisplayGroups([
  { categoryName: "IMEI Service", groupName: "Zebra" },
  { categoryName: "Remote Service", groupName: "Apple" },
  { categoryName: "IMEI Service", groupName: "Alpha" }
]);
assert.deepEqual(sorted.map((group) => group.groupName), ["Alpha", "Apple", "Zebra"]);

assert.deepEqual(
  createInitialCollapsedGroups(sorted),
  { Alpha: false, Apple: true, Zebra: true }
);

console.log("pricing groups tests passed");
