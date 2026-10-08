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

// Business sections are independent of the IMEI/server/remote order protocol.
function getProviderServiceSection(service) {
  const section = String(service?.section_id || service?.sectionId || service?.category_key || "").toLowerCase().replaceAll("_", "-");
  const sections = {
    topups: "topups", "game-topups": "topups", "game-currency": "gift-cards",
    "gift-cards": "gift-cards", rewarble: "gift-cards", "app-stores": "app-stores",
    appstores: "app-stores", subscriptions: "subscriptions", esim: "esim",
    "dhru-imei": "imei", "dhru-server": "server", "dhru-remote": "remote"
  };
  if (sections[section] && section !== 'dhru-server') return sections[section];
  const protocol = getProviderServiceType(service);
  if (protocol === "imei" || protocol === "remote") return protocol;
  const category = [service?.category_key, service?.category_name, service?.section_name, service?.group_name, service?.groupName].filter(Boolean).join(' ').toLowerCase();
  if (/esim|e-sim/.test(category)) return "esim";
  if (/subscriptions|اشتراكات/.test(category)) return "subscriptions";
  if (/app.?stores|متاجر التطبيقات/.test(category)) return "app-stores";
  if (/gift.?cards|game.?currency|rewarble|أكواد وبطاقات/.test(category)) return "gift-cards";
  if (/top.?ups|شحن الألعاب/.test(category)) return "topups";
  return protocol;
}

function getProviderServiceSectionCounts(services) {
  const counts = { all: services.length, imei: 0, server: 0, remote: 0, topups: 0, "gift-cards": 0, "app-stores": 0, subscriptions: 0, esim: 0, unknown: 0 };
  for (const service of services) {
    const section = getProviderServiceSection(service);
    if (section in counts && section !== "all") counts[section]++;
  }
  return counts;
}

function filterProviderServicesBySection(services, selectedSection) {
  if (selectedSection === "all") return services;
  return services.filter(service => getProviderServiceSection(service) === selectedSection);
}

module.exports = {
  getProviderServiceSection,
  getProviderServiceSectionCounts,
  filterProviderServicesBySection,
  filterProviderServicesByType,
  getProviderServiceType,
  getProviderServiceTypeCounts,
  getProviderServiceTypeLabel
};
