function buildApiActivationPayload(apiSiteName, apiSiteUrl) {
  return {
    apiSiteName: String(apiSiteName || "").trim(),
    apiSiteUrl: String(apiSiteUrl || "").trim(),
    confirmActivation: true
  };
}

module.exports = { buildApiActivationPayload };
