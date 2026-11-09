import { NextRequest, NextResponse } from "next/server";
import { authProxyBudget } from '../../../../../lib/auth-proxy-budget';
import { getBackendCandidates } from '../../../../../lib/api-proxy-candidates';

export async function POST(request: NextRequest) {
  return authProxyBudget(request, async (body, signal) => {
    try {
      const { challengeToken, otp, newPassword, newUsername } = body;

      if (!challengeToken || !otp || !newPassword) {
        return NextResponse.json(
          { success: false, message: "رمز التحقق وكلمة المرور الجديدة مطلوبان" },
          { status: 400 }
        );
      }

      const candidateUrls = [
        ...getBackendCandidates(null, process.env.INTERNAL_API_URL, process.platform === "win32"),
        "http://127.0.0.1:5000",
        "http://localhost:5000",
      ].filter(Boolean) as string[];

      const uniqueUrls = Array.from(new Set(candidateUrls));
      let lastErrorMessage = "";

      const forwardHeaders: Record<string, string> = { "Content-Type": "application/json" };
      const xff = request.headers.get("x-forwarded-for");
      if (xff) forwardHeaders["x-forwarded-for"] = xff;
      const userAgent = request.headers.get("user-agent");
      if (userAgent) forwardHeaders["user-agent"] = userAgent;

      for (const apiUrl of uniqueUrls) {
        try {
          const res = await fetch(`${apiUrl}/api/auth/admin/forgot-password/confirm`, {
            method: "POST",
            headers: forwardHeaders,
            body: JSON.stringify({
              challengeToken,
              otp,
              newPassword,
              newUsername
            }),
            cache: "no-store",
            signal
          });

          const data = await res.json().catch(() => ({}));
          if (res.ok && data.success) {
            return NextResponse.json({
              success: true,
              updatedUsername: data.updatedUsername,
              message: data.message || "تم تغيير بيانات دخول الإدارة بنجاح!"
            });
          } else {
            const msg = data.error || data.message || "فشل التحقق من الرمز أو تحديث كلمة المرور";
            return NextResponse.json({ success: false, message: msg }, { status: res.status || 400 });
          }
        } catch {
          if (signal.aborted) throw new Error('REQUEST_TIMEOUT');
        }
      }

      return NextResponse.json(
        { success: false, message: lastErrorMessage || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً" },
        { status: 502 }
      );
    } catch (err: any) {
      if (signal.aborted) throw err;
      return NextResponse.json(
        { success: false, message: "حدث خطأ أثناء تحديث كلمة المرور" },
        { status: 500 }
      );
    }
  });
}
