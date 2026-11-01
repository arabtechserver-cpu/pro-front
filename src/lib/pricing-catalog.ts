export async function fetchPricingCatalog(signal: AbortSignal): Promise<any[]> {
  const response = await fetch('/api/dhru/services?view=pricing', { signal });
  if (!response.ok) throw new Error(`CATALOG_HTTP_${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data) || data.some(category => !category || !Array.isArray(category.services))) {
    throw new Error('CATALOG_INVALID_RESPONSE');
  }
  return data;
}
