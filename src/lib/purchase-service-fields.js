function isImeiCategoryOrService(categoryName, serviceType, groupName) {
  const text = [categoryName, serviceType, groupName].filter(Boolean).join(' ').toLowerCase();
  return text.includes('imei');
}

function isPrimaryTargetCustomField(key, field) {
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

  if (!identity) return false;

  // Secondary auxiliary fields (links, screenshots, pictures, reports, proofs) are NOT primary target fields
  if (/(link|url|http|https|screenshot|screen shot|image|photo|pic\b|picture|hint|report|proof)/i.test(identity)) {
    return false;
  }

  // Primary identifiers (IMEI, Serial, Lock Code, Unlock Code, ECID, UDID, CPID, Account/User IDs)
  return /(imei|ecid|serial number|\bsn\b|\bserial\b|lock\s*code|code\s*lock|keylock|unlock\s*code|remove\s*code|old\s*code|bootloader\s*key|frp\s*key|udid|cpid|playerid|player_id|user_id|userid|account_id|accountid|targetlogin|apple\s*id|icloud\s*email|\bemail\b|phone\s*number|phonenumber|\bcode\b|\bkey\b|رمز\s*القفل|كود\s*القفل|كود\s*الفك|الرقم\s*التسلسلي|سيريال|ايمي)/i.test(identity);
}

function shouldShowDefaultImeiField(categoryName, providerFields, serviceType, groupName) {
  const isImei = isImeiCategoryOrService(categoryName, serviceType, groupName);
  if (!isImei) return false;
  if (!providerFields || Object.keys(providerFields).length === 0) return true;

  const fieldEntries = Object.entries(providerFields);

  // If the provider or service definition explicitly defines a primary target field
  // (e.g. IMEI, SN, Lock Code, Unlock Code, ECID, UDID, CPID, PlayerID, AccountID, etc.)
  const hasPrimaryTarget = fieldEntries.some(([key, field]) => isPrimaryTargetCustomField(key, field));

  if (hasPrimaryTarget) {
    return false; // The service already has a dedicated input field for its primary target
  }

  // In other cases where custom fields are only secondary attachments (e.g. Battery Picture Link, Country),
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
      ? parsed.map(field => [field?.fieldname || field?.field_id || field?.reqid || field?.REQID || field?.id || field?.name || field?.label, field])
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
  if (!service) return false;
  if (service.providerId === null) return false;
  if (typeof service.supportsQty === 'boolean') return service.supportsQty;
  if (typeof service.supports_quantity === 'boolean') return service.supports_quantity;
  if (!service.providerId) return false;
  const flag = service.QNT ?? service.requires_quantity ?? service.REQUIRES_QUANTITY;
  if ([false, 0, '0'].includes(flag)) return false;
  if ([true, 1, '1'].includes(flag)) return true;
  return Object.entries(getProviderCustomFields(service) || {}).some(([key, field]) => isProviderQuantityField(field, key));
}

function getProviderFieldOptionChoices(field) {
  let raw = field?.option_choices ?? field?.options ?? field?.fieldoptions ?? field?.FIELDOPTIONS ?? field?.Options;
  if (typeof raw === 'string') {
    try { raw = JSON.parse(raw); } catch { raw = raw.split(/\\n|[\r\n,|]+/).map(v => v.trim()).filter(Boolean); }
  }
  if (!raw || typeof raw !== 'object') return [];
  const entries = Array.isArray(raw) ? raw.map((v, i) => [String(i), v]) : Object.entries(raw);
  return entries.flatMap(([key, item]) => {
    const value = item && typeof item === 'object' ? item.value ?? item.id : Array.isArray(raw) ? item : key;
    if (value === undefined || value === null || String(value) === '' || typeof value === 'object') return [];
    return [{ value: String(value), label: String(item && typeof item === 'object' ? item.label ?? item.name ?? value : item) }];
  });
}

function getFoxreloadNoteFields(product) {
  const required = product?.requiredNoteFields || [];
  return Array.from(new Set([...required, ...Object.keys(product?.noteFieldTypes || {}), ...Object.keys(product?.noteFieldOptions || {})]), name => ({
    name, required: required.includes(name), type: product?.noteFieldTypes?.[name] || 'string',
    choices: getProviderFieldOptionChoices({ options: product?.noteFieldOptions?.[name] })
  }));
}

module.exports = { shouldShowDefaultImeiField, getProviderCustomFields, isProviderQuantityField, supportsProviderQuantity, isPrimaryTargetCustomField, getProviderFieldOptionChoices, getFoxreloadNoteFields };
