import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row font-sans text-on-surface" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-surface-container border-l border-outline-variant/30 flex-shrink-0 flex flex-col">
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between">
          <Link href="/admin" className="text-xl font-display font-bold text-primary">
            لوحة الإدارة
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">dashboard</span> ملخص الإحصائيات
          </Link>
          <Link href="/admin/homepage" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-primary font-bold bg-primary/10">
            <span className="material-symbols-outlined w-5 text-center">space_dashboard</span> التحكم بالصفحة الرئيسية
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">manage_accounts</span> إدارة المستخدمين المسجلين
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">shopping_cart</span> الطلبات
          </Link>
          <Link href="/admin/services" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">category</span> الخدمات والأقسام
          </Link>
          <Link href="/admin/wallet" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">account_balance_wallet</span> إدارة المحفظة وطلبات الشحن 💳
          </Link>
          <Link href="/admin/blog" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">article</span> المدونة
          </Link>
          <Link href="/admin/videos" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">video_library</span> الأكاديمية والفيديوهات
          </Link>
          <Link href="/admin/analytics" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">bar_chart</span> الإحصائيات 📊
          </Link>
          <Link href="/admin/customer-logs" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">manage_search</span> سجل العملاء 📋
          </Link>
          <Link href="/admin/newsletter" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">forward_to_inbox</span> النشرة البريدية والمشتركون ✉️
          </Link>
          <Link href="/admin/backups" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">backup</span> النسخ الاحتياطي 💾
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">settings</span> إعدادات الحساب
          </Link>
        </nav>
        
        <div className="p-4 border-t border-outline-variant/30">
          <Link href="/ar" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-variant transition-colors text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined w-5 text-center">arrow_forward</span> العودة للموقع
          </Link>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
