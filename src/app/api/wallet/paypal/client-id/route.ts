import { NextResponse } from 'next/server';
import { getBackendCandidates } from '@/lib/api-proxy-candidates';
import { resolvePayPalRuntimeConfig } from '@/lib/paypal-runtime-config';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const signal = AbortSignal.timeout(10000);
  const headers = { 'Cache-Control': 'no-store' };
  try {
    // Read the public ID from the running server, rather than freezing it into
    // the browser bundle. Never return server credentials from this endpoint.
    const environment = process.env;
    const candidates = getBackendCandidates(null, environment.INTERNAL_API_URL, process.platform === 'win32');
    // Reflect.get prevents the Next compiler from substituting NEXT_PUBLIC_*
    // even when it optimizes an alias of process.env during production builds.
    const publicClientId = Reflect.get(environment, 'NEXT_PUBLIC_PAYPAL_CLIENT_ID') || '';
    const config = await resolvePayPalRuntimeConfig(candidates, publicClientId, signal);
    return NextResponse.json({ success: true, ...config }, { headers });
  } catch {
    return NextResponse.json({ success: false, code: 'PAYPAL_CONFIG_UNAVAILABLE', error: 'PayPal configuration is temporarily unavailable' }, {
      status: signal.aborted ? 504 : 503,
      headers
    });
  }
}
