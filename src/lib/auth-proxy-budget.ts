import { NextRequest, NextResponse } from 'next/server';
import { admitProxyRequest, readBoundedBody } from './proxy-stream';

export async function authProxyBudget(
  request: NextRequest,
  handler: (body: any, signal: AbortSignal) => Promise<NextResponse>
) {
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
