"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DashboardData {
  users: {
    total: number;
    active: number;
    suspended: number;
    totalBalances: number;
  };
  orders: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
  };
  transactions: {
    total: number;
    pending: number;
    completed: number;
  };
  services: {
    categories: number;
    total: number;
    active: number;
  };
  dhru: any;
  recent: {
    orders: any[];
    transactions: any[];
    users: any[];
  };
}

export default function AdminDashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeRecentTab, setActiveRecentTab] = useState<"orders" | "transactions" | "users">("orders");

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/dashboard-stats", {
        headers: { "Cache-Control": "no-cache" }
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const dhruCredit =
    data?.dhru?.formattedBalance ||
    data?.dhru?.SUCCESS?.[0]?.credit ||
    (data?.dhru?.balance !== undefined ? `$${Number(data.dhru.balance).toFixed(2)} ${data.dhru.currency || "USD"}` : (data?.dhru?.error ? "غير متوفر" : "متصل"));

  return (
    <div className="space-y-8 font-sans" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-6 md:p-8 rounded-3xl border border-outline-variant/30 shadow-xl bg-surface-container/40">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-3xl text-primary glow-cyan">dashboard</span>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
              ملخص إحصائيات النظام
            </h1>
          </div>
          <p className="text-on-surface-variant text-xs md:text-sm max-w-2xl leading-relaxed">
            نظرة عامة شاملة على أداء المنصة، أرصدة المحافظ، المستخدمين، والطلبات المسجلة في قاعدة البيانات لحظياً.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardStats}
            className="px-5 py-2.5 rounded-2xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm"
          >
            <span className={`material-symbols-outlined text-base text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث الإحصائيات</span>
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && !data ? (
        <div className="p-20 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-medium">جاري تحميل إحصائيات النظام...</span>
        </div>
      ) : data ? (
        <>
          {/* Main Key Figures Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Registered Users */}
            <Link
              href="/admin/users"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">المستخدمين المسجلين</p>
                <h3 className="text-3xl font-bold text-on-surface font-mono">{data.users.total}</h3>
                <p className="text-[11px] text-emerald-400 font-semibold">
                  {data.users.active} حساب نشط
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">groups</span>
              </div>
            </Link>

            {/* Total Wallet Balances */}
            <Link
              href="/admin/wallet"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-emerald-500/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">إجمالي أرصدة محافظ العملاء</p>
                <h3 className="text-3xl font-bold text-emerald-400 font-mono">
                  ${data.users.totalBalances.toFixed(2)}
                </h3>
                <p className="text-[11px] text-on-surface-variant font-semibold">
                  موزعة على {data.users.total} محفظة
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
              </div>
            </Link>

            {/* Orders Summary */}
            <Link
              href="/admin/orders"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">إجمالي الطلبات المسجلة</p>
                <h3 className="text-3xl font-bold text-on-surface font-mono">{data.orders.total}</h3>
                <p className="text-[11px] text-primary font-semibold">
                  {data.orders.completed} طلب مكتمل • {data.orders.pending} قيد التنفيذ
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">shopping_cart</span>
              </div>
            </Link>

            {/* Transactions */}
            <Link
              href="/admin/wallet"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-secondary/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">عمليات الإيداع والشحن</p>
                <h3 className="text-3xl font-bold text-secondary font-mono">{data.transactions.total}</h3>
                <p className="text-[11px] text-on-surface-variant font-semibold">
                  {data.transactions.pending > 0 ? `${data.transactions.pending} طلب يحتاج مراجعة` : "كافة الطلبات معتمدة"}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">receipt_long</span>
              </div>
            </Link>

            {/* Services & Categories */}
            <Link
              href="/admin/services"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-amber-500/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">الخدمات والأقسام</p>
                <h3 className="text-3xl font-bold text-amber-400 font-mono">{data.services.total}</h3>
                <p className="text-[11px] text-on-surface-variant font-semibold">
                  {data.services.active} خدمة نشطة في {data.services.categories} أقسام
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">category</span>
              </div>
            </Link>

            {/* Dhru Fusion Provider Status */}
            <Link
              href="/admin/providers"
              className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-sky-500/50 transition-all shadow-lg flex items-center justify-between group"
            >
              <div className="space-y-1">
                <p className="text-xs font-bold text-on-surface-variant">
                  رصيد مزود الـ API {data.dhru?.providerName ? `(${data.dhru.providerName})` : "(Dhru Fusion)"}
                </p>
                <h3 className="text-2xl font-bold text-sky-400 font-mono">{dhruCredit}</h3>
                <p className="text-[11px] text-on-surface-variant font-semibold group-hover:text-sky-300 transition-colors">
                  {data.dhru?.error ? "تحقق من إعدادات المفتاح والـ IP" : "متصل بالسيرفر المزود • إدارة المزودين"}
                </p>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-3xl">dns</span>
              </div>
            </Link>
          </div>

          {/* Quick Shortcuts Section */}
          <div className="space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              إجراءات سريعة
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
              <Link
                href="/admin/users"
                className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-highest transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-primary text-xl">person_search</span>
                <span>البحث عن مستخدم</span>
              </Link>

              <Link
                href="/admin/wallet"
                className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-highest transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-emerald-400 text-xl">add_card</span>
                <span>مراجعة طلبات الشحن</span>
              </Link>

              <Link
                href="/admin/services"
                className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-highest transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-amber-400 text-xl">tune</span>
                <span>تعديل أسعار الخدمات</span>
              </Link>

              <Link
                href="/admin/backups"
                className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-highest transition-all flex items-center gap-2.5"
              >
                <span className="material-symbols-outlined text-sky-400 text-xl">backup</span>
                <span>النسخ الاحتياطي والاستيراد</span>
              </Link>
            </div>
          </div>

          {/* Recent Live Activity Feed */}
          <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  <span>سجل النشاطات الحية الأخيرة</span>
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  عرض أحدث الطلبات، الإيداعات، والأعضاء المسجلين في النظام
                </p>
              </div>

              <div className="flex gap-2 p-1 bg-surface-container rounded-xl w-fit">
                <button
                  onClick={() => setActiveRecentTab("orders")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRecentTab === "orders" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  أحدث الطلبات
                </button>
                <button
                  onClick={() => setActiveRecentTab("transactions")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRecentTab === "transactions" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  أحدث الإيداعات
                </button>
                <button
                  onClick={() => setActiveRecentTab("users")}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRecentTab === "users" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  أحدث المسجلين
                </button>
              </div>
            </div>

            {/* TAB CONTENT: ORDERS */}
            {activeRecentTab === "orders" && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 font-bold">
                    <tr>
                      <th className="p-4">الطلب</th>
                      <th className="p-4">العميل</th>
                      <th className="p-4">الخدمة</th>
                      <th className="p-4">السعر</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.recent.orders.map((o: any) => (
                      <tr key={o.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-on-surface">#{o.id.slice(-6)}</td>
                        <td className="p-4 font-bold text-on-surface">{o.user?.fullName || o.user?.email || "عميل"}</td>
                        <td className="p-4 text-on-surface truncate max-w-[200px]">{o.serviceName}</td>
                        <td className="p-4 font-mono font-bold text-primary">${(o.price || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                            o.status === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                            "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}>
                            {o.status === "completed" ? "مكتمل" : o.status === "pending" ? "قيد التنفيذ" : "مرفوض"}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant font-mono">{new Date(o.createdAt).toLocaleString("ar-EG")}</td>
                      </tr>
                    ))}
                    {data.recent.orders.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد طلبات مسجلة حالياً.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: TRANSACTIONS */}
            {activeRecentTab === "transactions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 font-bold">
                    <tr>
                      <th className="p-4">المرجع</th>
                      <th className="p-4">العميل</th>
                      <th className="p-4">المبلغ</th>
                      <th className="p-4">الوسيلة</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.recent.transactions.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="p-4 font-mono font-bold text-primary dir-ltr">{tx.refNo}</td>
                        <td className="p-4 font-bold text-on-surface">{tx.user?.fullName || tx.user?.email || "عميل"}</td>
                        <td className="p-4 font-mono font-bold text-emerald-400 dir-ltr">+${(tx.amount || 0).toFixed(2)}</td>
                        <td className="p-4 text-on-surface-variant">{tx.method}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            tx.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                            tx.status === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                            "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}>
                            {tx.status === "completed" ? "مكتمل" : tx.status === "pending" ? "قيد المراجعة" : "مرفوض"}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant font-mono">{new Date(tx.createdAt).toLocaleString("ar-EG")}</td>
                      </tr>
                    ))}
                    {data.recent.transactions.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد معاملات مسجلة حالياً.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* TAB CONTENT: USERS */}
            {activeRecentTab === "users" && (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 font-bold">
                    <tr>
                      <th className="p-4">المستخدم</th>
                      <th className="p-4">البريد الإلكتروني</th>
                      <th className="p-4">الدولة</th>
                      <th className="p-4">الرصيد</th>
                      <th className="p-4">الحالة</th>
                      <th className="p-4">تاريخ الانضمام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {data.recent.users.map((u: any) => (
                      <tr key={u.id} className="hover:bg-surface-container-high/30 transition-colors">
                        <td className="p-4 font-bold text-on-surface">{u.fullName} (@{u.username})</td>
                        <td className="p-4 font-mono text-on-surface-variant">
                          <div>{u.email}</div>
                          {u.phone && <div className="text-[10px] text-emerald-400 font-mono mt-0.5 dir-ltr">{u.phone}</div>}
                        </td>
                        <td className="p-4 text-on-surface">{u.country || "—"}</td>
                        <td className="p-4 font-mono font-bold text-primary">${(u.balance || 0).toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
                          }`}>
                            {u.status === "active" ? "نشط" : "موقوف"}
                          </span>
                        </td>
                        <td className="p-4 text-on-surface-variant font-mono">{new Date(u.createdAt).toLocaleDateString("ar-EG")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
