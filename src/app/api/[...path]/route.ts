import { NextRequest, NextResponse } from 'next/server';

/**
 * Smart catch-all API proxy with multi-URL fallback.
 *
 * For Dokploy / Docker setups where containers are on the same Docker network,
 * set INTERNAL_API_URL to the backend container's internal address.
 *
 * How to find the backend internal hostname in Dokploy:
 *   Go to backend service → Network tab → copy the "Container Name" or "Internal Hostname"
 *   It usually looks like: http://<appName>.<projectName>:5000
 *   Example: http://backend.pro-b-i0r2xu:5000
 *
 * Set in Dokploy → Frontend service → Environment Variables:
 *   INTERNAL_API_URL=http://<backend-container-name>:5000
 */

function getCandidateUrls(): string[] {
  const candidates: string[] = [];

  const internal = process.env.INTERNAL_API_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  // Dokploy: services in same project communicate via service name (container name)
  // These are the exact service names from this Dokploy project:
  const dockerCandidates = [
    'http://pro-b-i0r2xu:5000',   // backend service name in Dokploy
    'http://backend:5000',
    'http://pro-back:5000',
    'http://api:5000',
  ];

  const isLocalhost = (url: string) =>
    /localhost|127\.0\.0\.1|::1/.test(url);

  // 1. INTERNAL_API_URL (skip if it's localhost)
  if (internal && !isLocalhost(internal)) {
    candidates.push(internal);
  }

  // 2. NEXT_PUBLIC_API_URL (skip if localhost)
  if (pub && !isLocalhost(pub) && !candidates.includes(pub)) {
    candidates.push(pub);
  }

  // 3. Try common Docker internal hostnames (fast fail, containers on same network)
  for (const dc of dockerCandidates) {
    if (!candidates.includes(dc)) candidates.push(dc);
  }

  return candidates;
}

async function proxyRequest(
  request: NextRequest,
  targetUrl: string,
  body: ArrayBuffer | undefined
): Promise<Response> {
  const forwardHeaders = new Headers();
  const headersToCopy = ['content-type', 'authorization', 'accept', 'accept-language', 'x-forwarded-for'];
  headersToCopy.forEach(h => {
    const val = request.headers.get(h);
    if (val) forwardHeaders.set(h, val);
  });

  return fetch(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
    body,
    redirect: 'manual',
    signal: AbortSignal.timeout(5000), // 5s per attempt - fast fail
  });
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const candidates = getCandidateUrls();

  const body = ['GET', 'HEAD'].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  let lastError: unknown;
  let lastDetail = '';

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

      const responseBody = await res.arrayBuffer();
      // Log successful backend URL for debugging
      if (baseUrl !== candidates[0]) {
        console.log(`[API Proxy] ✅ Connected via fallback: ${baseUrl}`);
      }
      return new NextResponse(responseBody, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      // Only log non-ECONNREFUSED errors verbosely to reduce noise
      if (!msg.includes('ECONNREFUSED') && !msg.includes('ENOTFOUND')) {
        console.warn(`[API Proxy] Error reaching ${targetUrl}: ${msg}`);
      }
      lastError = err;
      lastDetail = msg;
    }
  }

  // All candidates failed — log once with full details
  console.error(
    `[API Proxy] ❌ All ${candidates.length} backend URLs failed.\n` +
    `  Tried: ${candidates.join(', ')}\n` +
    `  Last error: ${lastDetail}\n` +
    `  → Set INTERNAL_API_URL in Dokploy frontend env vars to backend internal hostname`
  );

  return NextResponse.json(
    {
      error: 'Backend unavailable',
      hint: 'Set INTERNAL_API_URL=http://<backend-container-name>:5000 in Dokploy frontend environment variables',
      tried: candidates,
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
