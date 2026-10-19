"use server";

import { cookies } from "next/headers";

const candidateUrls = [
  process.env.INTERNAL_API_URL,
  process.env.NEXT_PUBLIC_API_URL,
  "http://127.0.0.1:5000",
  "http://localhost:5000",
  "https://api.arabtechproserver.tech",
  "https://arabtechproserver.tech"
].filter(Boolean) as string[];

async function fetchFromBackend(path: string, options: RequestInit = {}) {
  const token = (await cookies()).get("admin_token")?.value;
  const uniqueUrls = Array.from(new Set(candidateUrls));
  let lastError: any = null;

  for (const apiUrl of uniqueUrls) {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...((options.headers as Record<string, string>) || {})
      };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}${path}`, {
        ...options,
        headers,
        cache: "no-store"
      });

      if (res.ok) {
        return await res.json();
      }

      const errData = await res.json().catch(() => null);
      if (errData) return errData;
    } catch (err) {
      lastError = err;
    }
  }

  return { success: false, error: lastError?.message || "تعذر الاتصال بالسيرفر" };
}

export async function getAdminProfile() {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return null;

  try {
    const data = await fetchFromBackend("/api/users/profile", {
      method: "GET"
    });
    return data?.success ? data.user : null;
  } catch (error) {
    console.error("Failed to fetch admin profile:", error);
    return null;
  }
}

export async function updateAdminCredentials(data: any) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  try {
    return await fetchFromBackend("/api/users/update-credentials", {
      method: "POST",
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error("Failed to update credentials:", error);
    return { success: false, error: "تعذر الاتصال بالسيرفر" };
  }
}

export async function getPaymentSettingsAction() {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  try {
    const data = await fetchFromBackend("/api/settings/payment-methods", {
      method: "GET"
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch payment settings:", error);
    return { success: false, error: "تعذر تحميل إعدادات طرق الدفع" };
  }
}

export async function updatePaymentSettingsAction(payload: any) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  try {
    return await fetchFromBackend("/api/settings/payment-methods", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to save payment settings:", error);
    return { success: false, error: "تعذر حفظ إعدادات طرق الدفع" };
  }
}

export async function getAutoDispatchSettingsAction() {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  try {
    const data = await fetchFromBackend("/api/settings/auto-dispatch", {
      method: "GET"
    });
    return data;
  } catch (error) {
    console.error("Failed to fetch auto-dispatch settings:", error);
    return { success: false, error: "تعذر تحميل إعدادات الإرسال التلقائي" };
  }
}

export async function updateAutoDispatchSettingsAction(payload: any) {
  const token = (await cookies()).get("admin_token")?.value;
  if (!token) return { success: false, error: "غير مصرح لك" };

  try {
    return await fetchFromBackend("/api/settings/auto-dispatch", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  } catch (error) {
    console.error("Failed to save auto-dispatch settings:", error);
    return { success: false, error: "تعذر حفظ إعدادات الإرسال التلقائي" };
  }
}
