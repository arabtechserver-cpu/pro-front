const assert = require("assert");
const fs = require("fs");

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
  { id: "4", service_type: "imei" },
  { id: "5", api_service_type: "remote", category_name: "IMEI Service" }
];

assert.equal(getProviderServiceType(services[0]), "imei");
assert.equal(getProviderServiceType(services[1]), "server");
assert.equal(getProviderServiceType(services[2]), "remote");
assert.equal(getProviderServiceType(services[4]), "remote");
assert.deepEqual(getProviderServiceTypeCounts(services), {
  all: 5,
  imei: 2,
  server: 1,
  remote: 2
});
assert.deepEqual(
  filterProviderServicesByType(services, "imei").map((service) => service.id),
  ["1", "4"]
);
assert.equal(filterProviderServicesByType(services, "all").length, 5);

const providersClient = fs.readFileSync(
  "src/app/(admin)/admin/(dashboard)/providers/ProvidersClient.tsx",
  "utf8"
);
assert.doesNotMatch(
  providersClient,
  /service_types|اختر الأقسام التي تريد جلبها/,
  "Provider sync must fetch and classify all API service types automatically"
);

console.log("provider service type tests passed");
