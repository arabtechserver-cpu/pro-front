const VALID_SERVICE_TYPES = ["imei", "server", "remote"];

function getProviderServiceType(service) {
  const directType = String(service?.api_service_type || service?.service_type || "").toLowerCase();
  if (VALID_SERVICE_TYPES.includes(directType)) return directType;

  const categoryName = String(
    service?.category_name || service?.dhruCategory?.name || service?.category?.name || ""
  ).toLowerCase();
  if (categoryName.includes("remote")) return "remote";
  if (categoryName.includes("server")) return "server";
  if (categoryName.includes("imei")) return "imei";
  return "unknown";
}

function getProviderServiceTypeCounts(services) {
  const counts = { all: services.length, imei: 0, server: 0, remote: 0 };
  for (const service of services) {
    const type = getProviderServiceType(service);
    if (type in counts && type !== "all") counts[type] += 1;
  }
  return counts;
}

function filterProviderServicesByType(services, selectedType) {
  if (selectedType === "all") return services;
  return services.filter((service) => getProviderServiceType(service) === selectedType);
}

function getProviderServiceTypeLabel(type) {
  if (type === "imei") return "IMEI";
  if (type === "server") return "Server";
  if (type === "remote") return "Remote";
  return "Unknown";
}

module.exports = {
  filterProviderServicesByType,
  getProviderServiceType,
  getProviderServiceTypeCounts,
  getProviderServiceTypeLabel
};
