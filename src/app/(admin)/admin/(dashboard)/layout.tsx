"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "ملخص الإحصائيات", icon: "dashboard" },
  { href: "/admin/homepage", label: "التحكم بالصفحة الرئيسية", icon: "space_dashboard" },
  { href: "/admin/users", label: "إدارة المستخدمين المسجلين", icon: "manage_accounts" },
  { href: "/admin/orders", label: "الطلبات", icon: "shopping_cart" },
  { href: "/admin/services", label: "الخدمات والأقسام", icon: "category" },
  { href: "/admin/providers", label: "ربط سيرفرات الـ API", icon: "dns" },
  { href: "/admin/wallet", label: "إدارة المحفظة وطلبات الشحن", icon: "account_balance_wallet" },
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

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-on-surface" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container border-l border-outline-variant/30 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-display font-bold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">admin_panel_settings</span>
            <span>لوحة الإدارة</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
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
        
        <div className="p-4 border-t border-outline-variant/30">
          <Link
            href="/ar"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-on-surface text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-lg w-5 text-center text-primary">arrow_forward</span>
            <span>العودة للموقع</span>
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
