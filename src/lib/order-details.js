function getOrderFieldRows(order) {
  const seen = new Set();
  const result = [];

  if (Array.isArray(order?.fieldDetails) && order.fieldDetails.length > 0) {
    for (const field of order.fieldDetails) {
      const norm = String(field?.providerFieldId || field?.id || "")
        .toLowerCase()
        .replace(/^custom_/i, "")
        .trim();
      if (!norm || seen.has(norm)) continue;
      seen.add(norm);
      result.push(field);
    }
    return result;
  }

  return Object.entries(order?.customFields || {}).reduce((acc, [key, value]) => {
    const norm = String(key).toLowerCase().replace(/^custom_/i, "").trim();
    if (!norm || seen.has(norm)) return acc;
    seen.add(norm);
    acc.push({
      id: key,
      providerFieldId: key,
      label: String(key).replace(/^custom_/i, "") || key,
      type: "text",
      required: false,
      value: String(value ?? ""),
      missing: false
    });
    return acc;
  }, []);
}

function getOrderServiceTypeLabel(serviceType) {
  if (serviceType === "imei") return "خدمة IMEI";
  if (serviceType === "server") return "خدمة سيرفر";
  if (serviceType === "remote") return "خدمة تحكم عن بُعد";
  return "نوع غير محدد";
}

module.exports = { getOrderFieldRows, getOrderServiceTypeLabel };
