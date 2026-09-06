function isImeiCategoryOrService(categoryName, serviceType, groupName) {
  const text = [categoryName, serviceType, groupName].filter(Boolean).join(' ').toLowerCase();
  return text.includes('imei');
}

function shouldShowDefaultImeiField(categoryName, providerFields, serviceType, groupName) {
  const isImei = isImeiCategoryOrService(categoryName, serviceType, groupName);
  if (!isImei) return false;
  if (!providerFields || Object.keys(providerFields).length === 0) return true;

  const fieldEntries = Object.entries(providerFields);

  // If the provider explicitly defines a primary IMEI / SN custom field (not a link/photo/screenshot)
  const hasImeiOrSnInCustom = fieldEntries.some(([key, field]) => {
    const identity = [
      key,
      field?.label,
      field?.fieldname,
      field?.reqid,
      field?.name,
      field?.customname
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Secondary fields (links, screenshots, pictures, reports) are NOT the primary IMEI field
    if (/(link|url|http|https|screenshot|screen shot|image|photo|hint|picture|report|proof)/i.test(identity)) {
      return false;
    }

    return /(imei|ecid|serial number|\bsn\b)/i.test(identity);
  });

  if (hasImeiOrSnInCustom) {
    return false; // The provider already has a dedicated custom field for IMEI/SN
  }

  // If the service has a primary non-IMEI target field (e.g. PlayerID, UserID, AccountID)
  // this occurs when gaming/account services were placed under an IMEI category by mistake
  const hasNonImeiPrimaryTarget = fieldEntries.some(([key, field]) => {
    const identity = [
      key,
      field?.label,
      field?.fieldname,
      field?.reqid,
      field?.name,
      field?.customname
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return /(playerid|player_id|user_id|account_id|targetlogin)/i.test(identity);
  });

  if (hasNonImeiPrimaryTarget) {
    return false;
  }

  // In all other cases (e.g. Battery Picture Link, Model, Carrier, Current Country),
  // the default IMEI / Serial field MUST be shown!
  return true;
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
