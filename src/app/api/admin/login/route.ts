import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const username = body.username || body.email;
    const password = body.password;
    const turnstileToken = body["cf-turnstile-response"] || body.turnstileToken;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: "اسم المستخدم وكلمة المرور مطلوبان" },
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
        const res = await fetch(`${apiUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: username,
            password,
            "cf-turnstile-response": turnstileToken || "cf-turnstile-client-fallback"
          }),
          cache: "no-store"
        });

        if (res.ok) {
          const data = await res.json();

          if (data.success && data.user && ["admin", "super_admin"].includes(data.user.role)) {
            const cookieStore = await cookies();
            cookieStore.set({
              name: "admin_token",
              value: data.token,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 24 * 365, // 1 Year Persistent Login
              path: "/"
            });
            return NextResponse.json({ success: true, token: data.token, user: data.user });
          } else {
            return NextResponse.json(
              { success: false, message: data.error || data.message || "ليس لديك صلاحيات الدخول للوحة التحكم" },
              { status: 403 }
            );
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData?.error || errData?.message) {
            lastErrorMessage = errData.error || errData.message;
          }
        }
      } catch {
        // Continue to next candidate URL
      }
    }

    return NextResponse.json(
      { success: false, message: lastErrorMessage || "تعذر الاتصال بخادم الباك إند، تأكد من تشغيل السيرفر" },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء معالجة تسجيل الدخول" },
      { status: 500 }
    );
  }
}
