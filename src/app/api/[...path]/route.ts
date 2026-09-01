import { NextRequest, NextResponse } from 'next/server';

/**
 * Smart catch-all API proxy with working URL caching.
 *
 * The public domain (arabtechproserver.tech) is NOT reachable from inside
 * the Docker container due to hairpin NAT — so we only try internal hostnames.
 *
 * INTERNAL_API_URL takes priority. If not set (or set to localhost), we try
 * known Dokploy service names automatically.
 *
 * Once a working URL is found, it's cached in memory for the container lifetime
 * to avoid repeated failures and log spam.
 */

// Cache the working backend URL after first successful connection
let cachedBackendUrl: string | null = null;

function getCandidateUrls(): string[] {
  // If we already found a working URL, use it immediately — no fallback needed
  if (cachedBackendUrl) return [cachedBackendUrl];

  const candidates: string[] = [];
  const internal = process.env.INTERNAL_API_URL;
  const isLocalhost = (url: string) => /localhost|127\.0\.0\.1|::1/.test(url);

  // 1. INTERNAL_API_URL (only if it's not localhost)
  if (internal && !isLocalhost(internal)) {
    candidates.push(internal);
  }

  // 2. Known Dokploy service names (internal Docker network)
  //    NOTE: Do NOT add the public domain here — it's unreachable from inside Docker (hairpin NAT)
  const dokployNames = [
    'http://pro-b-i0r2xu:5000',  // Confirmed working backend service name
    'http://backend:5000',
    'http://pro-back:5000',
    'http://api:5000',
  ];
  for (const name of dokployNames) {
    if (!candidates.includes(name)) candidates.push(name);
  }

  return candidates;
}

async function proxyRequest(
  request: NextRequest,
  targetUrl: string,
  body: ArrayBuffer | undefined
): Promise<Response> {
  const forwardHeaders = new Headers();
  const headersToCopy = ['content-type', 'authorization', 'accept', 'accept-language'];
  headersToCopy.forEach(h => {
    const val = request.headers.get(h);
    if (val) forwardHeaders.set(h, val);
  });

  return fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body,
    redirect: 'manual',
    signal: AbortSignal.timeout(5000),
  });
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;

  // Skip telemetry/analytics routes — they are external and not our backend
  if (path.startsWith('telemetry') || path.startsWith('_next')) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const candidates = getCandidateUrls();
  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  let lastError: unknown;

  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}/api/${path}${search}`;
    try {
      const res = await proxyRequest(request, targetUrl, body);

      const responseHeaders = new Headers();
      res.headers.forEach((val, key) => {
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders.set(key, val);
        }
      });

      // ✅ Cache this URL for future requests (avoids repeated fallback attempts)
      if (!cachedBackendUrl) {
        cachedBackendUrl = baseUrl;
        console.log(`[API Proxy] ✅ Backend found at: ${baseUrl} — caching for future requests`);
      }

      const responseBody = await res.arrayBuffer();
      return new NextResponse(responseBody, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      lastError = err;
      // Only log failures when we're NOT using the cached URL (i.e., during discovery)
      if (!cachedBackendUrl) {
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('ECONNREFUSED') && !msg.includes('ENOTFOUND')) {
          console.warn(`[API Proxy] ⚠️ ${baseUrl} failed: ${msg}`);
        }
      }
    }
  }

  // If cached URL failed (backend restarted?), clear cache and let next request retry
  if (cachedBackendUrl) {
    console.warn(`[API Proxy] ⚠️ Cached backend ${cachedBackendUrl} is down — resetting cache`);
    cachedBackendUrl = null;
  }

  console.error(`[API Proxy] ❌ All backend URLs failed for /api/${path}`);
  return NextResponse.json(
    {
      error: 'Backend unavailable',
      hint: 'Set INTERNAL_API_URL=http://pro-b-i0r2xu:5000 in Dokploy frontend env vars',
    },
    { status: 502 }
  );
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;

export const dynamic = 'force-dynamic';
