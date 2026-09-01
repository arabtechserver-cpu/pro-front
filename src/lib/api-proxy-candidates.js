const knownBackendUrls = [
  "http://pro-b-i0r2xu:5000",
  "http://backend:5000",
  "http://pro-back:5000",
  "http://api:5000"
];

function isLocalhost(url) {
  return /localhost|127\.0\.0\.1|::1/.test(url);
}

function getBackendCandidates(cachedBackendUrl, internalApiUrl) {
  const configuredUrl = internalApiUrl && !isLocalhost(internalApiUrl) ? internalApiUrl : null;
  return [cachedBackendUrl, configuredUrl, ...knownBackendUrls].filter(
    (url, index, all) => Boolean(url) && all.indexOf(url) === index
  );
}

module.exports = { getBackendCandidates };
