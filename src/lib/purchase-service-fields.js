function shouldShowDefaultImeiField(categoryName, providerFields) {
  const isImeiCategory = String(categoryName || '').toLowerCase().includes('imei');
  if (!isImeiCategory) return false;
  return !providerFields || Object.keys(providerFields).length === 0;
}

function getProviderCustomFields(service) {
  if (!service) return null;
  const raw = service.fields ?? service.requiresCustom ?? service.customFields;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!parsed || typeof parsed !== 'object') return null;
    const entries = Array.isArray(parsed)
      ? parsed.map(field => [field?.field_id || field?.reqid || field?.REQID || field?.id || field?.name || field?.label, field])
      : Object.entries(parsed);
    /** @type {Record<string, any>} */
    const result = {};
    for (const [key, field] of entries) {
      if (!key || !field || typeof field !== 'object') continue;
      const admin = field.adminonly ?? field.ADMINONLY ?? field.admin_only;
      if ([true, 1, '1', 'true'].includes(admin)) continue;
      if (field.field_id === 'custom_QNT') continue; // Legacy invalid synthetic field.
      result[key] = field;
    }
    return Object.keys(result).length ? result : null;
  } catch {
    return null;
  }
}

function isProviderQuantityField(field, key) {
  return field?.is_quantity === true || field?.type === 'quantity' || field?.fieldtype === 'quantity' ||
    [key, field?.field_id, field?.reqid, field?.name, field?.label, field?.fieldname]
      .some(value => /^(qnt|qty|quantity|الكمية|الكميه)$/i.test(String(value || '').replace(/^custom_/i, '').trim()));
}

function supportsProviderQuantity(service) {
  if (!service?.providerId) return false;
  // The detail API supplies the same decision used to price and validate orders.
  if (typeof service.supportsQty === 'boolean') return service.supportsQty;
  if (typeof service.supports_quantity === 'boolean') return service.supports_quantity;
  const flag = service.QNT ?? service.requires_quantity ?? service.REQUIRES_QUANTITY;
  if ([false, 0, '0'].includes(flag)) return false;
  if ([true, 1, '1'].includes(flag)) return true;
  return Object.entries(getProviderCustomFields(service) || {}).some(([key, field]) => isProviderQuantityField(field, key));
}

module.exports = { shouldShowDefaultImeiField, getProviderCustomFields, isProviderQuantityField, supportsProviderQuantity };
