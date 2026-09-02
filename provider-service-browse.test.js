const assert = require("assert");

let browseLoader = {};
try {
  browseLoader = require("./src/lib/provider-service-browse.js");
} catch {}

const loadProviderServicesForBrowse =
  browseLoader.loadProviderServicesForBrowse ||
  (async () => { throw new Error("provider browse fallback is not implemented"); });

async function run() {
  const calls = [];
  const liveResult = await loadProviderServicesForBrowse("provider-1", async (url) => {
    calls.push(url);
    if (url.endsWith("/services")) {
      return { ok: true, data: { success: true, services: [] } };
    }
    return {
      ok: true,
      data: { success: true, services: [{ id: "remote-898", name: "Remote service" }] }
    };
  });

  assert.deepEqual(calls, [
    "/api/providers/provider-1/services",
    "/api/providers/provider-1/fetch-services"
  ]);
  assert.equal(liveResult.source, "remote");
  assert.equal(liveResult.services.length, 1);

  const storedCalls = [];
  const storedResult = await loadProviderServicesForBrowse("provider-2", async (url) => {
    storedCalls.push(url);
    return {
      ok: true,
      data: { success: true, services: [{ id: "stored-1", name: "Stored service" }] }
    };
  });

  assert.deepEqual(storedCalls, ["/api/providers/provider-2/services"]);
  assert.equal(storedResult.source, "stored");
  assert.equal(storedResult.services[0].id, "stored-1");

  console.log("provider service browse tests passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
