import { NextRequest, NextResponse } from 'next/server';

/**
 * Smart catch-all API proxy with multi-URL fallback.
 * Tries each backend URL in order until one succeeds.
 * This handles Docker environments where INTERNAL_API_URL may point to
 * localhost:5000 (wrong) while the real backend is at the public domain.
 */

function getCandidateUrls(): string[] {
  const candidates: string[] = [];

  const internal = process.env.INTERNAL_API_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  const prod = 'https://arabtechproserver.tech';

  // Add configured URLs only if they don't resolve to localhost/127.0.0.1
  // (those are guaranteed to fail inside a Docker container)
  const isLocalhost = (url: string) =>
    url.includes('localhost') || url.includes('127.0.0.1') || url.includes('::1');

  if (internal && !isLocalhost(internal)) candidates.push(internal);
  if (pub && !isLocalhost(pub) && !candidates.includes(pub)) candidates.push(pub);

  // Always include production URL as ultimate fallback
  if (!candidates.includes(prod)) candidates.push(prod);

  return candidates;
}

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const search = request.nextUrl.search;
  const candidates = getCandidateUrls();

  // Build shared headers to forward
  const forwardHeaders = new Headers();
  const headersToCopy = ['content-type', 'authorization', 'accept', 'accept-language'];
  headersToCopy.forEach(h => {
    const val = request.headers.get(h);
    if (val) forwardHeaders.set(h, val);
  });

  const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

  // Try each candidate URL in sequence
  let lastError: unknown;
  for (const baseUrl of candidates) {
    const targetUrl = `${baseUrl}/api/${path}${search}`;
    try {
      const res = await fetch(targetUrl, {
        method: request.method,
        headers: forwardHeaders,
        body,
        redirect: 'manual',
        // Short timeout to fail fast on unreachable hosts
        signal: AbortSignal.timeout(8000),
      });

      const responseHeaders = new Headers();
      res.headers.forEach((val, key) => {
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(key.toLowerCase())) {
          responseHeaders.set(key, val);
        }
      });

      const responseBody = await res.arrayBuffer();
      return new NextResponse(responseBody, {
        status: res.status,
        headers: responseHeaders,
      });
    } catch (err) {
      console.warn(`[API Proxy] Could not reach ${targetUrl} — trying next...`);
      lastError = err;
    }
  }

  // All candidates failed
  console.error(`[API Proxy] All backend URLs exhausted. Candidates tried: ${candidates.join(', ')}`);
  return NextResponse.json(
    {
      error: 'Backend unavailable',
      tried: candidates,
      detail: String(lastError),
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
