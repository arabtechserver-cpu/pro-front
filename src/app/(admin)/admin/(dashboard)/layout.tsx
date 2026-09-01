"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutAdmin } from "../login/actions";

const NAV_ITEMS = [
  { href: "/admin", label: "ملخص الإحصائيات", icon: "dashboard" },
  { href: "/admin/homepage", label: "التحكم بالصفحة الرئيسية", icon: "space_dashboard" },
  { href: "/admin/memberships", label: "إدارة العضويات والخصومات VIP", icon: "card_membership" },
  { href: "/admin/users", label: "إدارة المستخدمين المسجلين", icon: "manage_accounts" },
  { href: "/admin/orders", label: "الطلبات", icon: "shopping_cart" },
  { href: "/admin/services", label: "الخدمات والأقسام", icon: "category" },
  { href: "/admin/providers", label: "ربط سيرفرات الـ API", icon: "dns" },
  { href: "/admin/wallet", label: "إدارة المحفظة وطلبات الشحن", icon: "account_balance_wallet" },
  { href: "/admin/currencies", label: "أسعار العملات والجنيه السوداني", icon: "currency_exchange" },
  { href: "/admin/blog", label: "المدونة", icon: "article" },
  { href: "/admin/videos", label: "الأكاديمية والفيديوهات", icon: "video_library" },
  { href: "/admin/analytics", label: "الإحصائيات", icon: "bar_chart" },
  { href: "/admin/customer-logs", label: "سجل العملاء", icon: "manage_search" },
  { href: "/admin/newsletter", label: "النشرة البريدية والمشتركون", icon: "forward_to_inbox" },
  { href: "/admin/backups", label: "النسخ الاحتياطي", icon: "backup" },
  { href: "/admin/settings", label: "إعدادات الحساب", icon: "settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (confirm("هل أنت متأكد من تسجيل الخروج من لوحة الإدارة؟")) {
      setIsLoggingOut(true);
      try {
        await logoutAdmin();
        if (typeof window !== "undefined") {
          localStorage.removeItem("admin_token");
          sessionStorage.removeItem("admin_token");
          document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        }
        window.location.href = "/admin/login";
      } catch (err) {
        console.error("Logout error:", err);
        window.location.href = "/admin/login";
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-on-surface" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container border-l border-outline-variant/30 flex-shrink-0 flex flex-col">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between">
          <Link href="/admin" className="text-lg font-display font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <span>لوحة الإدارة</span>
          </Link>
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-md shadow-primary/20"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                <span className={`material-symbols-outlined text-lg w-5 text-center ${isActive ? "text-on-primary" : "text-primary"}`}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-3 border-t border-outline-variant/30 space-y-1.5">
          <Link
            href="/ar"
            className="flex items-center gap-3 px-3.5 py-2 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-base w-5 text-center text-primary">arrow_forward</span>
            <span>العودة للموقع</span>
          </Link>

          {/* Dedicated Logout Button in Sidebar */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all text-xs font-bold border border-red-500/20 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base w-5 text-center">logout</span>
            <span>{isLoggingOut ? "جاري الخروج..." : "تسجيل الخروج"}</span>
          </button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Top Header Bar */}
        <header className="bg-surface-container/60 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3 py-1.5 rounded-lg border border-outline-variant/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>عرب تك برو سيرفر</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 bg-surface-container px-3 py-1.5 rounded-lg border border-outline-variant/30"
              title="التبديل إلى حساب آخر"
            >
              <span className="material-symbols-outlined text-sm">switch_account</span>
              <span>تبديل الحساب</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/30 transition-all flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">power_settings_new</span>
              <span>{isLoggingOut ? "خروج..." : "خروج"}</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
