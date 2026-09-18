import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { challengeToken, otp } = body;

    if (!challengeToken || !otp) {
      return NextResponse.json(
        { success: false, message: "رمز التحقق ومعرف الجلسة مطلوبان" },
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
        const res = await fetch(`${apiUrl}/api/auth/admin/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeToken, otp }),
          cache: "no-store"
        });

        if (res.ok) {
          const data = await res.json();

          if (data.success && data.token && data.user && ["admin", "super_admin"].includes(data.user.role)) {
            const cookieStore = await cookies();
            cookieStore.set({
              name: "admin_token",
              value: data.token,
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 60 * 60 * 12,
              path: "/"
            });
            return NextResponse.json({ success: true, token: data.token, user: data.user });
          } else {
            return NextResponse.json(
              { success: false, message: data.error || data.message || "رمز التحقق غير صحيح" },
              { status: 400 }
            );
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (errData?.error || errData?.message) {
            lastErrorMessage = errData.error || errData.message;
          }
        }
      } catch {
        // Try next candidate URL
      }
    }

    return NextResponse.json(
      { success: false, message: lastErrorMessage || "تعذر التحقق من الكود، تأكد من اتصال السيرفر" },
      { status: 502 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: "حدث خطأ أثناء التحقق من الرمز" },
      { status: 500 }
    );
  }
}
