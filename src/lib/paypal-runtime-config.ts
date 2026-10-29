interface PublicPayPalConfig {
  clientId: string;
  configured?: boolean;
}

function parseConfig(data: unknown): PublicPayPalConfig {
  const config = data as { clientId?: unknown; configured?: unknown } | null;
  if (!config || typeof config.clientId !== 'string') throw new Error('Invalid PayPal configuration');
  const clientId = config.clientId.trim();
  if (config.configured === false) return { clientId: '', configured: false };
  if (config.configured === true && !clientId) throw new Error('Incomplete PayPal configuration');
  return { clientId, configured: Boolean(clientId) };
}

// Older backend releases support create/capture but do not expose /client-id.
// Only a missing route enables compatibility; outages and explicit disablement
// must never be hidden by a frontend client ID.
export async function resolvePayPalRuntimeConfig(
  candidates: string[],
  frontendClientId: string,
  signal: AbortSignal,
  request: typeof fetch = fetch
): Promise<PublicPayPalConfig> {
  let backend = '';
  let response: Response | undefined;
  for (const candidate of candidates) {
    if (signal.aborted) throw new Error('PayPal configuration request timed out');
    try {
      backend = candidate.replace(/\/+$/, '');
      response = await request(`${backend}/api/wallet/paypal/client-id`, { cache: 'no-store', signal, redirect: 'error' });
      break;
    } catch {
      // Discover another backend only when no HTTP response was received.
    }
  }
  if (!response) throw new Error('PayPal backend unavailable');
  if (response.ok) {
    const data = await response.json();
    if (data?.success !== true) throw new Error('Invalid PayPal configuration response');
    return parseConfig(data);
  }
  if (response.status !== 404) {
    await response.body?.cancel();
    throw new Error('Unable to load PayPal configuration');
  }
  await response.body?.cancel();

  const currencies = await request(`${backend}/api/currencies`, { cache: 'no-store', signal, redirect: 'error' });
  if (currencies.ok) {
    const data = await currencies.json();
    if (data?.success !== true) throw new Error('Invalid payment settings response');
    const paypal = data.config?.paypal;
    if (paypal?.isActive === false || paypal?.configured === false) return { clientId: '', configured: false };
    if (typeof paypal?.clientId === 'string' && paypal.clientId.trim()) return parseConfig(paypal);
  } else {
    await currencies.body?.cancel();
    if (currencies.status !== 404) throw new Error('Unable to load payment settings');
  }
  const clientId = frontendClientId.trim();
  if (!clientId) throw new Error('PayPal client ID is unavailable');
  // A public client ID alone does not prove that server credentials are ready.
  return { clientId };
}
