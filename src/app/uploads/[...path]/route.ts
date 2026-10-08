import { NextRequest, NextResponse } from 'next/server';
import { getBackendCandidates } from '../../../lib/api-proxy-candidates';
import { forwardBody, admitProxyRequest } from '../../../lib/proxy-stream';

let cachedBackendUrl: string | null = null;

async function proxyUpload(request: NextRequest, targetUrl: string, signal: AbortSignal): Promise<Response> {
  const forwardHeaders = new Headers();
  forwardHeaders.set('accept', request.headers.get('accept') || '*/*');

  return fetch(targetUrl, {
    method: 'GET',
    headers: forwardHeaders,
    redirect: 'follow',
    signal,
    cache: 'no-store',
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const signal = AbortSignal.timeout(29000);
  const filename = resolvedParams.path.join('/');

  if (filename.toLowerCase().includes('receipt')) {
    return NextResponse.json(
      { error: 'Access denied: Payment receipts require authenticated access via transactions API.' },
      { status: 403 }
    );
  }

  const candidates = getBackendCandidates(cachedBackendUrl, process.env.INTERNAL_API_URL, process.platform === 'win32');
  if (process.platform === 'win32' && !candidates.includes('http://127.0.0.1:5000')) {
    candidates.push('http://127.0.0.1:5000');
  }
  let release: () => void;
  try { release = await admitProxyRequest(false, signal); }
  catch { return NextResponse.json({ error: 'File request queue timed out or is full' }, { status: signal.aborted ? 504 : 503, headers: { 'Retry-After': '2' } }); }

  for (const baseUrl of candidates) {
    // Try primary /uploads/:filename endpoint on server disk
    const targetUrl = `${baseUrl}/uploads/${filename}`;
    try {
      const res = await proxyUpload(request, targetUrl, signal);
      if (res.ok) {
        if (cachedBackendUrl !== baseUrl) {
          cachedBackendUrl = baseUrl;
        }
        const headers = new Headers();
        res.headers.forEach((val, key) => {
          if (!['transfer-encoding', 'connection', 'content-encoding', 'content-length'].includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
        return new NextResponse(forwardBody(res.body, release), {
          status: res.status,
          headers,
        });
      }
      await res.body?.cancel();

      // If 404 on /uploads/, fallback to /api/upload/:id or filename on backend
      const fallbackUrl = `${baseUrl}/api/upload/${filename}`;
      const fallbackRes = await proxyUpload(request, fallbackUrl, signal);
      if (fallbackRes.ok) {
        if (cachedBackendUrl !== baseUrl) {
          cachedBackendUrl = baseUrl;
        }
        const headers = new Headers();
        fallbackRes.headers.forEach((val, key) => {
          if (!['transfer-encoding', 'connection', 'content-encoding', 'content-length'].includes(key.toLowerCase())) {
            headers.set(key, val);
          }
        });
        return new NextResponse(forwardBody(fallbackRes.body, release), {
          status: fallbackRes.status,
          headers,
        });
      }
      await fallbackRes.body?.cancel();
    } catch (_) {
      if (signal.aborted) break;
      // Continue to next candidate
    }
  }
  release();
  if (signal.aborted) return NextResponse.json({ error: 'File request timed out' }, { status: 504 });
  return NextResponse.json({ error: 'Image file not found on server' }, { status: 404 });
}
