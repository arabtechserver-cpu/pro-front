import { NextRequest, NextResponse } from "next/server";
import { authProxyBudget } from '../../../../../lib/auth-proxy-budget';

export async function POST(request: NextRequest) {
  return authProxyBudget(request, async (body, signal) => {
  try {
    const { challengeToken } = body;

    if (!challengeToken) {
      return NextResponse.json(
        { success: false, message: "معرف جلسة التحقق مطلوب" },
        { status: 400 }
      );
    }

    const candidateUrls = [
      process.env.INTERNAL_API_URL,
      process.env.NEXT_PUBLIC_API_URL,
      "http://127.0.0.1:5000",
      "http://localhost:5000",
      "https://arabtechproserver.tech"
    ].filter(Boolean) as string[];

    const uniqueUrls = Array.from(new Set(candidateUrls));
    let lastErrorMessage = "";

    for (const apiUrl of uniqueUrls) {
      try {
        const res = await fetch(`${apiUrl}/api/auth/admin/resend-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeToken }),
          cache: "no-store",
          signal
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            return NextResponse.json({ success: true, message: data.message || "تم إرسال كود جديد إلى تيليجرام" });
          } else {
            return NextResponse.json(
              { success: false, message: data.error || data.message || "تعذر إعادة إرسال الكود" },
              { status: 400 }
            );
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData?.error || errData?.message) {
            lastErrorMessage = errData.error || errData.message;
          }
          return NextResponse.json({ success: false, message: lastErrorMessage || 'تعذر إعادة الإرسال' }, { status: res.status });
        }
      } catch {
        if (signal.aborted) throw new Error('REQUEST_TIMEOUT');
        // Try next candidate URL
      }
    }

    return NextResponse.json(
      { success: false, message: lastErrorMessage || "تعذر الاتصال بالسيرفر لإعادة إرسال الكود" },
      { status: 502 }
    );
  } catch (err: any) {
    if (signal.aborted) throw err;
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء إعادة إرسال الرمز" },
      { status: 500 }
    );
  }
  });
}
