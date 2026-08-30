"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const BATCH_SIZE = 25;

export default function CustomerLogsClient() {
  const [activeTab, setActiveTab] = useState<"orders" | "wallet">("orders");
  const [orders, setOrders] = useState<any[]>([]);
  const [walletLogs, setWalletLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Progressive scroll loading state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [activeTab]);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, activeTab]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "orders") {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders || []);
        } else if (Array.isArray(data)) {
          setOrders(data);
        }
      } else {
        const res = await fetch("/api/transactions");
        const data = await res.json();
        if (res.ok && data.success) {
          setWalletLogs(data.transactions || []);
        }
      }
    } catch (error) {
      console.error("Failed to fetch logs", error);
    } finally {
      setIsLoading(false);
    }
  };

  const currentList = useMemo(() => {
    const list = activeTab === "orders" ? orders : walletLogs;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();

    return list.filter((item: any) => {
      if (activeTab === "orders") {
        return (
          (item.id && item.id.toLowerCase().includes(q)) ||
          (item.serviceName && item.serviceName.toLowerCase().includes(q)) ||
          (item.user?.fullName && item.user.fullName.toLowerCase().includes(q)) ||
          (item.user?.email && item.user.email.toLowerCase().includes(q))
        );
      } else {
        return (
          (item.refNo && item.refNo.toLowerCase().includes(q)) ||
          (item.method && item.method.toLowerCase().includes(q)) ||
          (item.user?.fullName && item.user.fullName.toLowerCase().includes(q)) ||
          (item.user?.email && item.user.email.toLowerCase().includes(q))
        );
      }
    });
  }, [activeTab, orders, walletLogs, searchQuery]);

  const displayedList = useMemo(() => {
    return currentList.slice(0, visibleCount);
  }, [currentList, visibleCount]);

  const hasMore = visibleCount < currentList.length;

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0];
    if (target.isIntersecting && hasMore) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleCount((prev) => prev + BATCH_SIZE);
        setIsLoadingMore(false);
      }, 150);
    }
  }, [hasMore]);

  useEffect(() => {
    const option = { root: null, rootMargin: "150px", threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">manage_search</span>
            <span>سجل العملاء والمتابعة</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm">
            متابعة شاملة لجميع طلبات العملاء وحركات المحفظة بالتفصيل
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
        <div className="flex gap-2 p-1 bg-surface-container-high rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-2 ${
              activeTab === "orders" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">shopping_cart</span>
            <span>سجل الطلبات ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("wallet")}
            className={`px-5 py-2 rounded-lg font-bold text-xs transition-colors flex items-center gap-2 ${
              activeTab === "wallet" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
            <span>حركات المحفظة ({walletLogs.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث في السجل..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2 pr-10 pl-4 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 flex justify-center items-center gap-2 text-xs text-on-surface-variant">
            <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل السجل...</span>
          </div>
        ) : activeTab === "orders" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px] text-xs">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-bold">رقم الطلب</th>
                  <th className="p-4 font-bold">العميل</th>
                  <th className="p-4 font-bold">الخدمة</th>
                  <th className="p-4 font-bold">التكلفة</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedList.map((order: any) => (
                  <tr key={order.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface">#{order.id ? order.id.slice(-6) : "N/A"}</td>
                    <td className="p-4 font-bold text-on-surface">
                      <div>{order.user?.fullName || order.user?.email || "بدون اسم"}</div>
                      {order.user?.phone && (
                        <div className="text-[10px] text-emerald-400 font-mono font-normal dir-ltr mt-0.5">{order.user.phone}</div>
                      )}
                    </td>
                    <td className="p-4 text-on-surface">{order.serviceName || order.serviceId}</td>
                    <td className="p-4 text-primary font-bold font-mono">${(order.price || 0).toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        order.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                        order.status === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                        "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {order.status === "completed" ? "مكتمل" : order.status === "pending" ? "قيد التنفيذ" : "مرفوض"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">{new Date(order.createdAt).toLocaleString("ar-EG")}</td>
                  </tr>
                ))}
                {currentList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد طلبات مطابقة.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse min-w-[700px] text-xs">
              <thead>
                <tr className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20">
                  <th className="p-4 font-bold">الرقم المرجعي</th>
                  <th className="p-4 font-bold">العميل</th>
                  <th className="p-4 font-bold">المبلغ</th>
                  <th className="p-4 font-bold">الطريقة</th>
                  <th className="p-4 font-bold">الحالة</th>
                  <th className="p-4 font-bold">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedList.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-surface-container-high/30 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary dir-ltr">{tx.refNo}</td>
                    <td className="p-4 font-bold text-on-surface">
                      <div>{tx.user?.fullName || tx.user?.email || "بدون اسم"}</div>
                      {tx.user?.phone && (
                        <div className="text-[10px] text-emerald-400 font-mono font-normal dir-ltr mt-0.5">{tx.user.phone}</div>
                      )}
                    </td>
                    <td className="p-4 text-emerald-400 font-bold font-mono dir-ltr">+${(tx.amount || 0).toFixed(2)}</td>
                    <td className="p-4 text-on-surface-variant">{tx.method}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        tx.status === "completed" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" :
                        tx.status === "pending" ? "bg-amber-500/15 text-amber-400 border border-amber-500/30" :
                        "bg-red-500/15 text-red-400 border border-red-500/30"
                      }`}>
                        {tx.status === "completed" ? "مكتمل" : tx.status === "pending" ? "قيد المراجعة" : "مرفوض"}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant">{new Date(tx.createdAt).toLocaleString("ar-EG")}</td>
                  </tr>
                ))}
                {currentList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-on-surface-variant">لا توجد حركات شحن محفظة مطابقة.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Scroll Sentinel for Progressive Loading */}
        <div ref={sentinelRef} className="py-4 text-center border-t border-outline-variant/10">
          {hasMore ? (
            <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant py-2">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span>جاري تحميل المزيد مع التمرير ({displayedList.length} من {currentList.length})...</span>
            </div>
          ) : currentList.length > 0 ? (
            <div className="text-[11px] text-on-surface-variant/70">
              تم عرض كافة النتائج ({currentList.length} عنصر)
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
