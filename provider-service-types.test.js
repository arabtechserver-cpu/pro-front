const assert = require("assert");

let serviceTypes = {};
try {
  serviceTypes = require("./src/lib/provider-service-types.js");
} catch {}

const getProviderServiceType = serviceTypes.getProviderServiceType || (() => "unknown");
const getProviderServiceTypeCounts =
  serviceTypes.getProviderServiceTypeCounts || (() => ({ all: 0, imei: 0, server: 0, remote: 0 }));
const filterProviderServicesByType =
  serviceTypes.filterProviderServicesByType || (() => []);

const services = [
  { id: "1", service_type: "imei" },
  { id: "2", category_name: "Server Service" },
  { id: "3", dhruCategory: { name: "Remote Service" } },
  { id: "4", service_type: "imei" }
];

assert.equal(getProviderServiceType(services[0]), "imei");
assert.equal(getProviderServiceType(services[1]), "server");
assert.equal(getProviderServiceType(services[2]), "remote");
assert.deepEqual(getProviderServiceTypeCounts(services), {
  all: 4,
  imei: 2,
  server: 1,
  remote: 1
});
assert.deepEqual(
  filterProviderServicesByType(services, "imei").map((service) => service.id),
  ["1", "4"]
);
assert.equal(filterProviderServicesByType(services, "all").length, 4);

console.log("provider service type tests passed");
