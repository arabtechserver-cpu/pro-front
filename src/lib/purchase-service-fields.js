function shouldShowDefaultImeiField(categoryName, providerFields) {
  const isImeiCategory = String(categoryName || "").toLowerCase().includes("imei");
  if (!isImeiCategory) return false;
  return !providerFields || Object.keys(providerFields).length === 0;
}

module.exports = { shouldShowDefaultImeiField };
