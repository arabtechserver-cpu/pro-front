"use client";

import { useState } from "react";
import { logoutAdmin } from "@/app/(admin)/admin/login/actions";

interface Props {
  currentIp?: string;
  reason?: string;
}

export default function DashboardAccessRestricted({ currentIp, reason }: Props) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      if (typeof window !== "undefined") {
        localStorage.removeItem("admin_token");
        sessionStorage.removeItem("admin_token");
        document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
      }
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-surface text-on-surface"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-surface-container border border-outline-variant/40 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden text-center">
        {/* Ambient background glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <span className="material-symbols-outlined text-4xl">shield_locked</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-2">
          تم تقييد الوصول إلى لوحة التحكم
        </h1>
        <p className="text-sm text-on-surface-variant font-medium mb-6">
          Dashboard Access Restricted
        </p>

        {/* Message description */}
        <div className="bg-surface-variant/40 border border-outline-variant/30 rounded-2xl p-4 mb-6 text-sm text-on-surface-variant leading-relaxed text-right">
          <p className="font-semibold text-on-surface mb-1">
            شبكتك الحالية غير مصرح لها باستخدام لوحة الإدارة.
          </p>
          <p className="text-xs text-on-surface-variant">
            {reason || "نظام الأمان يمنع الاتصال من خارج شبكات الـ IP المعتمدة لحماية البيانات والعمليات الإدارية."}
          </p>
        </div>

        {/* Current IP Box */}
        <div className="bg-surface border border-outline-variant/50 rounded-2xl p-4 mb-8 flex items-center justify-between">
          <span className="text-xs font-bold text-on-surface-variant">عنوان الـ IP الحالي:</span>
          <code className="font-mono text-sm font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/20" dir="ltr">
            {currentIp || "جاري التحديد..."}
          </code>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full py-3.5 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-all shadow-lg shadow-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">logout</span>
            <span>{isLoggingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج من الحساب"}</span>
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="w-full py-3 px-6 rounded-2xl bg-surface hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-semibold text-xs border border-outline-variant/40 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            <span>إعادة فحص الاتصال</span>
          </button>
        </div>

        {/* Emergency contact note */}
        <p className="text-xs text-on-surface-variant/70 mt-6">
          إذا كنت المسؤول عن النظام، يرجى الاتصال من شبكة معتمدة أو مراجعة إعدادات السيرفر عبر وحدة التحكم.
        </p>
      </div>
    </div>
  );
}
