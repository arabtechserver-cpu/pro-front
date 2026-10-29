// Fetch at runtime so a Docker build cannot pin checkout to an old merchant ID.
export async function fetchPayPalClientId(signal: AbortSignal): Promise<string> {
  const response = await fetch('/api/wallet/paypal/client-id', { cache: 'no-store', signal });
  if (!response.ok) throw new Error('Unable to load PayPal configuration');
  const data = await response.json();
  if (!data?.success || typeof data.clientId !== 'string') {
    throw new Error('Invalid PayPal configuration response');
  }
  return data.configured === false ? '' : data.clientId.trim();
}
