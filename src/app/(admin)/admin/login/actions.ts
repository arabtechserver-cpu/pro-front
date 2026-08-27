"use server";

import { cookies } from "next/headers";

export async function loginAdmin(username: string, password: string) {
  try {
    const res = await fetch('https://api.arabtechproserver.tech/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password })
    });
    
    if (res.ok) {
      const data = await res.json();
      
      if (data.success && data.user && ['admin', 'super_admin'].includes(data.user.role)) {
        cookies().set({
          name: 'admin_token',
          value: data.token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 Year Persistent Login
          path: '/',
        });
        return { success: true };
      } else {
        return { success: false, message: data.error || "ليس لديك صلاحيات الدخول للوحة التحكم" };
      }
    }
  } catch (error) {
    console.error("Login failed:", error);
  }
  
  return { success: false, message: "حدث خطأ في الاتصال بالخادم" };
}

export async function logoutAdmin() {
  cookies().delete('admin_token');
}
