import { NextRequest, NextResponse } from 'next/server';
import { getBackendCandidates } from "../../../lib/api-proxy-candidates";
import { streamRequestBody, forwardBody, admitProxyRequest } from '../../../lib/proxy-stream';

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

async function proxyRequest(
  request: NextRequest,
  targetUrl: string,
  body: ReadableStream<Uint8Array> | undefined,
  signal: AbortSignal
): Promise<Response> {
  const forwardHeaders = new Headers();

  // Forward all authentication & session headers — including cookies and origin for CSRF checks
  const headersToCopy = [
    'content-type',
    'authorization',
    'cookie',
    'origin',
    'referer',
    'accept',
    'accept-language',
    'user-agent',
    'paypal-auth-algo',
    'paypal-cert-url',
    'paypal-transmission-id',
    'paypal-transmission-sig',
    'paypal-transmission-time',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'idempotency-key',
    'x-idempotency-key',
    'x-admin-token',
    'x-user-token',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-host',
    'cf-ipcountry',
    'cf-ray',
    'cf-visitor',
    'cf-turnstile-response',
    'x-device-token',
    'x-admin-device-token',
    'x-client-local-ip',
    'x-local-ip',
    'x-device-fingerprint',
    'x-api-key',
    'x-username',
    'x-action',
    'apiaccesskey',
    'key',
  ];
  headersToCopy.forEach(h => {
    const val = request.headers.get(h);
    if (val) forwardHeaders.set(h, val);
  });

  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers: forwardHeaders,
    body,
    redirect: 'manual',
    signal,
    cache: 'no-store',
  };
  if (body) init.duplex = 'half';
  return fetch(targetUrl, init);
}


async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // One budget covers backend discovery and reading the complete response body.
  const signal = AbortSignal.timeout(29000);
  const resolvedParams = await params;
  let path = resolvedParams.path.join('/');
  const search = request.nextUrl.search;

  // Forward telemetry events to backend analytics/events so they are saved to database
  if (path.startsWith('telemetry/events')) {
    path = 'analytics/events';
  } else if (path.startsWith('telemetry')) {
    return NextResponse.json({ ok: true, success: true });
  }

  if (path.startsWith('_next')) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const candidates = getBackendCandidates(cachedBackendUrl, process.env.INTERNAL_API_URL, process.platform === 'win32');
  if (process.platform === 'win32') {
    if (!cachedBackendUrl && !process.env.INTERNAL_API_URL && !candidates.includes('http://127.0.0.1:5000')) {
      candidates.unshift('http://127.0.0.1:5000');
    } else if (!candidates.includes('http://127.0.0.1:5000')) {
      candidates.push('http://127.0.0.1:5000');
    }
  }
  const isIdempotent = ['GET', 'HEAD', 'OPTIONS'].includes(request.method);
  const targets = isIdempotent ? candidates : candidates.slice(0, 1);

  const heavy = !isIdempotent && (/^(upload|transactions|backup|providers|api-providers)(\/|$)/.test(path) || Number(request.headers.get('content-length')) > 1024 * 1024 || (request.body !== null && !request.headers.has('content-length')));
  let release: () => void;
  try { release = await admitProxyRequest(heavy, signal); }
  catch { return NextResponse.json({ error: 'Request queue timed out or is full. Please retry shortly.' }, { status: signal.aborted ? 504 : 503, headers: { 'Retry-After': '2' } }); }
  let body: ReadableStream<Uint8Array> | undefined;
  const imageBody = /^(upload|transactions)(\/|$)/.test(path);
  try { body = isIdempotent ? undefined : streamRequestBody(request, (imageBody ? 15 : 5) * 1024 * 1024, signal); }
  catch { release(); return NextResponse.json({ error: signal.aborted ? 'Request body timed out' : 'Request body exceeds the allowed size' }, { status: signal.aborted ? 408 : 413 }); }

  let lastError: unknown;

  for (const baseUrl of targets) {
    const targetUrl = `${baseUrl}/api/${path}${search}`;
    try {
      const res = await proxyRequest(request, targetUrl, body, signal);

      const responseHeaders = new Headers();
      res.headers.forEach((val, key) => {
        if (!['content-encoding', 'transfer-encoding', 'connection', 'content-security-policy', 'cross-origin-opener-policy', 'content-length'].includes(key.toLowerCase())) {
          responseHeaders.set(key, val);
        }
      });

      // Cache the recovered URL as well, so the next request skips a stale target.
      if (cachedBackendUrl !== baseUrl) {
        cachedBackendUrl = baseUrl;
        console.log(`[API Proxy] Backend found at: ${baseUrl} - caching for future requests`);
      }


      if (res.status >= 400) {
        console.warn(`[API Proxy] ${request.method} /api/${path} returned status ${res.status}`);
      }

      return new NextResponse(forwardBody(res.body, release), {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      lastError = err;
      if (signal.aborted) break;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('ECONNREFUSED') && !msg.includes('ENOTFOUND')) {
        console.warn(`[API Proxy] ${baseUrl} failed: ${msg}`);
      }
    }
  }

  // If cached URL failed (backend restarted?), clear cache and let next request retry
  if (cachedBackendUrl) {
    console.warn(`[API Proxy] Cached backend ${cachedBackendUrl} is down - resetting cache`);
    cachedBackendUrl = null;
  }

  console.error(`[API Proxy] All backend URLs failed for /api/${path}`);
  release();
  return NextResponse.json(
    {
      error: signal.aborted
        ? (isIdempotent ? 'API request timed out after 29 seconds. Please retry.' : 'API request timed out. Check the request status before submitting it again.')
        : 'Backend unavailable',
      hint: 'Set INTERNAL_API_URL=http://pro-b-i0r2xu:5000 in Dokploy frontend env vars',
    },
    { status: signal.aborted ? 504 : 502 }
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
