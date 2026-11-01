import 'server-only';
import { getBackendCandidates } from './api-proxy-candidates';

const TTL_MS = 120_000;
const MAX_SNAPSHOT_BYTES = 4 * 1024 * 1024;
let snapshot: { body: Buffer; expiresAt: number } | null = null;
let pending: Promise<any[]> | null = null;

// One public, credential-free snapshot per process, not Next's size-limited Data Cache.
// Retain bytes rather than an unbounded parsed object graph; expiry/restart invalidates it.
export async function readPublicPricingCatalog(): Promise<any[]> {
  if (snapshot && snapshot.expiresAt > Date.now()) {
    return JSON.parse(snapshot.body.toString('utf8'));
  }
  snapshot = null;
  if (pending) return pending;

  pending = (async () => {
    const signal = AbortSignal.timeout(8000);
    const candidates = Array.from(new Set([
      ...getBackendCandidates(null, process.env.INTERNAL_API_URL, true),
      'http://127.0.0.1:5000',
      'http://localhost:5000',
    ]));

    for (const base of candidates) {
      let response: Response;
      try {
        response = await fetch(`${base.replace(/\/+$/, '')}/api/dhru/services?view=pricing`, {
          cache: 'no-store',
          credentials: 'omit',
          redirect: 'error',
          signal,
        });
      } catch {
        if (signal.aborted) break;
        continue;
      }
      // An HTTP failure is not a reason to hit other aliases of the same backend.
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`CATALOG_HTTP_${response.status}`);
      }
      const body = Buffer.from(await response.arrayBuffer());
      const data = JSON.parse(body.toString('utf8'));
      if (!Array.isArray(data) || data.some(category => !category || !Array.isArray(category.services))) {
        throw new Error('CATALOG_INVALID_RESPONSE');
      }
      if (signal.aborted) throw new Error('CATALOG_TIMEOUT');
      // Oversized catalogs are still returned in full and coalesced, just not retained.
      if (body.byteLength <= MAX_SNAPSHOT_BYTES) {
        snapshot = { body, expiresAt: Date.now() + TTL_MS };
      }
      return data;
    }
    throw new Error('CATALOG_UNAVAILABLE');
  })().finally(() => { pending = null; });

  return pending;
}
