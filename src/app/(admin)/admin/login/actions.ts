"use server";

import { cookies, headers } from "next/headers";
import { getBackendCandidates } from "@/lib/api-proxy-candidates";
import { admitProxyRequest } from "@/lib/proxy-stream";

const candidateUrls = [
  process.env.INTERNAL_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "https://arabtechproserver.tech"
].filter(Boolean) as string[];

export async function loginAdmin(username: string, password: string, turnstileToken?: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastErrorMessage = "";

  const cookieStore = await cookies();
  const deviceToken = cookieStore.get("admin_device_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (deviceToken) headers["x-device-token"] = deviceToken;

  for (const apiUrl of uniqueUrls) {
    try {
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          email: username,
          password,
          "cf-turnstile-response": turnstileToken || "cf-turnstile-client-fallback",
          deviceToken
        }),
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();

        if (data.success && data.requireOtp) {
          return {
            success: true,
            requireOtp: true,
            challengeToken: data.challengeToken,
            message: data.message || "يرجى إدخال رمز التحقق (OTP) المرسل إلى تيليجرام"
          };
        }

        if (data.success && data.user && ["admin", "super_admin"].includes(data.user.role)) {
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
          return { success: true };
        } else {
          return { success: false, message: data.error || data.message || "ليس لديك صلاحيات الدخول للوحة التحكم" };
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

  return { success: false, message: lastErrorMessage || "تعذر الاتصال بخادم الباك إند، تأكد من تشغيل السيرفر" };
}

export async function verifyAdminOtpAction(challengeToken: string, otp: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastErrorMessage = "";

  const cookieStore = await cookies();
  const deviceToken = cookieStore.get("admin_device_token")?.value;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (deviceToken) headers["x-device-token"] = deviceToken;

  for (const apiUrl of uniqueUrls) {
    try {
      const res = await fetch(`${apiUrl}/api/auth/admin/verify-otp`, {
        method: "POST",
        headers,
        body: JSON.stringify({ challengeToken, otp, deviceToken }),
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
          return { success: true, user: data.user };
        } else {
          return { success: false, message: data.error || data.message || "رمز التحقق غير صحيح" };
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

  return { success: false, message: lastErrorMessage || "تعذر التحقق من الكود، تأكد من تشغيل السيرفر" };
}

export async function resendAdminOtpAction(challengeToken: string) {
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastErrorMessage = "";

  for (const apiUrl of uniqueUrls) {
    try {
      const res = await fetch(`${apiUrl}/api/auth/admin/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken }),
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return { success: true, message: data.message || "تم إرسال كود تحقق جديد إلى تيليجرام" };
        } else {
          return { success: false, message: data.error || data.message || "تعذر إعادة إرسال الكود" };
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

  return { success: false, message: lastErrorMessage || "تعذر الاتصال بالسيرفر لإعادة إرسال الكود" };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) {
    cookieStore.delete("admin_token");
    return { success: true as const, revoked: false };
  }

  const failure = {
    success: false as const,
    message: "تعذر تأكيد إبطال الجلسة على الخادم. لم يتم تسجيل الخروج؛ يرجى إعادة المحاولة.",
  };
  const signal = AbortSignal.timeout(10000);
  let release: (() => void) | undefined;
  try {
    const incomingHeaders = await headers();
    // Never forward a user_token or caller-supplied Authorization in place of the admin session.
    const forwardHeaders = new Headers({
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
      cookie: `admin_token=${encodeURIComponent(token)}`,
    });
    for (const name of [
      "origin", "referer", "sec-fetch-site", "user-agent",
      "x-forwarded-for", "x-forwarded-proto", "x-forwarded-host",
      "x-client-local-ip", "x-local-ip", "x-device-fingerprint", "x-admin-device-token",
    ]) {
      const value = incomingHeaders.get(name);
      if (value) forwardHeaders.set(name, value);
    }
    const deviceToken = cookieStore.get("admin_device_token")?.value || incomingHeaders.get("x-device-token");
    if (deviceToken) forwardHeaders.set("x-device-token", deviceToken);

    const [apiUrl] = getBackendCandidates(null, process.env.INTERNAL_API_URL ||
      (process.platform === "win32" ? "http://127.0.0.1:5000" : undefined), true);
    release = await admitProxyRequest(false, signal);
    // A mutation is sent once; a timeout/ambiguous response must not trigger a retry.
    const response = await fetch(`${apiUrl.replace(/\/+$/, "")}/api/auth/logout`, {
      method: "POST",
      headers: forwardHeaders,
      body: "{}",
      cache: "no-store",
      redirect: "error",
      signal,
    });
    if (!response.ok && response.status !== 401) {
      await response.body?.cancel();
      return failure;
    }
    const data = await response.json();
    const revoked = response.ok && data?.success === true;
    // Only the explicit backend contract distinguishes invalid sessions from auth outages.
    const alreadyInvalid = response.status === 401 && data?.code === "INVALID_SESSION";
    if ((!revoked && !alreadyInvalid) || signal.aborted) return failure;

    cookieStore.delete("admin_token");
    return { success: true as const, revoked };
  } catch {
    return failure;
  } finally {
    release?.();
  }
}
