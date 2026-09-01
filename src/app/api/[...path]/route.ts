import { NextRequest, NextResponse } from 'next/server';

/**
 * Dynamic catch-all API proxy route.
 * Forwards all /api/* requests to the backend server.
 * This runs server-side, so it correctly reads INTERNAL_API_URL at runtime.
 *
 * Priority:
 * 1. INTERNAL_API_URL  (e.g. http://backend:5000 for Docker internal network)
 * 2. NEXT_PUBLIC_API_URL (public API URL)
 * 3. https://arabtechproserver.tech (production fallback — always reachable)
 */
const BACKEND_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://arabtechproserver.tech';

async function handler(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const targetUrl = `${BACKEND_URL}/api/${path}${request.nextUrl.search}`;

  try {
    const headers = new Headers();

    // Forward relevant request headers
    const forwardHeaders = ['content-type', 'authorization', 'cookie', 'accept', 'accept-language'];
    forwardHeaders.forEach(h => {
      const val = request.headers.get(h);
      if (val) headers.set(h, val);
    });

    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer();

    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // Don't follow redirects automatically
      redirect: 'manual',
    });

    const responseHeaders = new Headers();
    // Forward response headers
    res.headers.forEach((val, key) => {
      // Skip headers that Next.js manages itself
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
    console.error(`[API Proxy] Failed to reach backend at ${targetUrl}:`, err);
    return NextResponse.json(
      { error: 'Backend unavailable', detail: String(err) },
      { status: 502 }
    );
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
export const OPTIONS = handler;

// Required for Next.js dynamic routes with body streaming
export const dynamic = 'force-dynamic';
