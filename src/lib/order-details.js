function getOrderFieldRows(order) {
  if (Array.isArray(order?.fieldDetails) && order.fieldDetails.length > 0) {
    return order.fieldDetails;
  }

  return Object.entries(order?.customFields || {}).map(([key, value]) => ({
    id: key,
    providerFieldId: key,
    label: String(key).replace(/^custom_/i, "") || key,
    type: "text",
    required: false,
    value: String(value ?? ""),
    missing: false
  }));
}

function getOrderServiceTypeLabel(serviceType) {
  if (serviceType === "imei") return "خدمة IMEI";
  if (serviceType === "server") return "خدمة سيرفر";
  if (serviceType === "remote") return "خدمة تحكم عن بُعد";
  return "نوع غير محدد";
}

module.exports = { getOrderFieldRows, getOrderServiceTypeLabel };
