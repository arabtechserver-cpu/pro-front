import { NextRequest, NextResponse } from 'next/server';
import { admitProxyRequest, readBoundedBody } from './proxy-stream';

export async function authProxyBudget(
  request: NextRequest,
  handler: (body: any, signal: AbortSignal) => Promise<NextResponse>
) {
  const origin = request.headers.get('origin');
  // Standalone Next.js uses an internal URL behind ingress; only configured public origins may override it.
  const trustedOrigins = new Set([
    request.nextUrl.origin,
    'https://arabtechproserver.tech', 'https://www.arabtechproserver.tech',
    'https://borai.store', 'https://www.borai.store',
  ]);
  for (const value of [
    process.env.NEXT_PUBLIC_SITE_URL,
    ...(process.env.FRONTEND_URL || '').split(','),
    ...(process.env.ADDITIONAL_ALLOWED_ORIGINS || '').split(','),
  ]) {
    if (!value?.trim()) continue;
    try {
      const url = new URL(value.trim());
      if ((url.protocol === 'https:' || (process.env.NODE_ENV !== 'production' && url.protocol === 'http:')) &&
          !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) {
        trustedOrigins.add(url.origin);
      }
    } catch { /* Invalid origin configuration never broadens access. */ }
  }
  if ((origin && !trustedOrigins.has(origin)) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ success: false, message: 'Untrusted request origin' }, { status: 403 });
  }
  const signal = AbortSignal.timeout(29000);
  let release: () => void;
  try { release = await admitProxyRequest(false, signal); }
  catch { return NextResponse.json({ success: false, message: 'تعذر انتظار إكمال الطلب، يرجى المحاولة بعد قليل' }, { status: signal.aborted ? 504 : 503, headers: { 'Retry-After': '2' } }); }
  try {
    const bytes = await readBoundedBody(request, 64 * 1024, signal);
    let body: unknown;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); }
    catch { return NextResponse.json({ success: false, message: 'طلب غير صحيح' }, { status: 400 }); }
    if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ success: false }, { status: 400 });
    return await handler(body, signal);
  } catch (error) {
    const status = signal.aborted ? 504 : error instanceof Error && error.message === 'PAYLOAD_TOO_LARGE' ? 413 : 502;
    return NextResponse.json({ success: false, message: 'تعذر إكمال الطلب، يرجى المحاولة لاحقاً' }, { status });
  } finally { release(); }
}
