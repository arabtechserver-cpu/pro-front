/**
 * Load persisted services first, then fall back to a live provider preview.
 *
 * @param {string} providerId
 * @param {(url: string) => Promise<{ ok: boolean, data: any }>} request
 * @returns {Promise<{ services: any[], source: "stored" | "remote" }>}
 */
async function loadProviderServicesForBrowse(providerId, request) {
  let storedError = "";

  try {
    const storedResponse = await request(`/api/providers/${providerId}/services`);
    const storedServices = Array.isArray(storedResponse.data?.services)
      ? storedResponse.data.services
      : [];

    if (storedResponse.ok && storedResponse.data?.success && storedServices.length > 0) {
      return { services: storedServices, source: "stored" };
    }
    storedError = storedResponse.data?.error || "";
  } catch (error) {
    storedError = error instanceof Error ? error.message : String(error || "");
  }

  const liveResponse = await request(`/api/providers/${providerId}/fetch-services`);
  const liveServices = Array.isArray(liveResponse.data?.services)
    ? liveResponse.data.services
    : [];

  if (liveResponse.ok && liveResponse.data?.success && liveServices.length > 0) {
    return { services: liveServices, source: "remote" };
  }

  throw new Error(liveResponse.data?.error || storedError || "لم يتم العثور على خدمات للمزود");
}

module.exports = { loadProviderServicesForBrowse };
