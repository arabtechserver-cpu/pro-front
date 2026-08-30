"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

interface OrderItem {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  serviceType: string;
  targetInput: string;
  price: number;
  status: "completed" | "pending" | "rejected" | string;
  reply?: string;
  providerOrderId?: string;
  createdAt: string;
  user?: {
    fullName: string;
    email: string;
    username: string;
    phone?: string;
    balance: number;
  };
}

const BATCH_SIZE = 25;

export default function OrdersClient() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Progressive scroll loading state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      } else if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = orders.length;
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const rejected = orders.filter((o) => o.status === "rejected" || o.status === "failed").length;
    return { total, completed, pending, rejected };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.serviceName && order.serviceName.toLowerCase().includes(q)) ||
        (order.targetInput && order.targetInput.toLowerCase().includes(q)) ||
        (order.user?.fullName && order.user.fullName.toLowerCase().includes(q)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(q)) ||
        (order.user?.username && order.user.username.toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery, statusFilter]);

  const displayedOrders = useMemo(() => {
    return filteredOrders.slice(0, visibleCount);
  }, [filteredOrders, visibleCount]);

  const hasMore = visibleCount < filteredOrders.length;

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
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            <span>طلبات العملاء والخدمات</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm">
            عرض ومتابعة كافة طلبات خدمات السيرفر والـ IMEI والأكواد المسجلة في النظام
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm"
          >
            <span className={`material-symbols-outlined text-sm text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.total}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-300">الطلبات المكتملة</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.completed}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-3xl">task_alt</span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-300">قيد التنفيذ</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{stats.pending}</p>
          </div>
          <span className="material-symbols-outlined text-amber-400 text-3xl">hourglass_empty</span>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-300">مرفوضة / ملغاة</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{stats.rejected}</p>
          </div>
          <span className="material-symbols-outlined text-red-400 text-3xl">cancel</span>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالعميل، اسم الخدمة، أو IMEI..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 pr-10 pl-4 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "completed" ? "bg-emerald-500 text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              المكتملة ({stats.completed})
            </button>
            <button
              onClick={() => setStatusFilter("pending")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "pending" ? "bg-amber-500 text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              قيد الانتظار ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter("rejected")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "rejected" ? "bg-red-500 text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              المرفوضة ({stats.rejected})
            </button>
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant hidden lg:inline">
            عرض {displayedOrders.length} من {filteredOrders.length}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant text-xs flex items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل سجل الطلبات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">shopping_bag</span>
            <span>لا توجد طلبات مطابقة للبحث المحدد</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-4">رقم الطلب</th>
                  <th className="p-4">العميل</th>
                  <th className="p-4">اسم الخدمة</th>
                  <th className="p-4">البيانات / IMEI</th>
                  <th className="p-4">الرد / النتيجة</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">تفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface text-xs">
                      #{order.id ? order.id.slice(-6) : "N/A"}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-on-surface">{order.user?.fullName || "عميل مسجل"}</div>
                      <div className="text-[10px] text-on-surface-variant font-mono">{order.user?.email || order.userId}</div>
                    </td>

                    <td className="p-4 text-on-surface font-semibold max-w-[200px] truncate" title={order.serviceName}>
                      {order.serviceName || order.serviceId || "خدمة سيرفر"}
                    </td>

                    <td className="p-4 font-mono text-primary font-bold dir-ltr text-right max-w-[180px] truncate" title={order.targetInput}>
                      {order.targetInput || "—"}
                    </td>

                    <td className="p-4 font-mono text-emerald-400 font-bold max-w-[160px] truncate" title={order.reply}>
                      {order.reply || "—"}
                    </td>

                    <td className="p-4 font-mono font-bold text-primary text-sm">
                      ${(order.price || 0).toFixed(2)}
                    </td>

                    <td className="p-4">
                      {order.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          مكتمل
                        </span>
                      )}
                      {order.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          قيد التنفيذ
                        </span>
                      )}
                      {order.status !== "completed" && order.status !== "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          مرفوض
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-on-surface-variant text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 transition-all"
                        title="عرض تفاصيل الطلب"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Scroll Sentinel for Progressive Loading */}
        <div ref={sentinelRef} className="py-4 text-center border-t border-outline-variant/10">
          {hasMore ? (
            <div className="flex items-center justify-center gap-2 text-xs text-on-surface-variant py-2">
              <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span>جاري تحميل المزيد مع التمرير ({displayedOrders.length} من {filteredOrders.length})...</span>
            </div>
          ) : filteredOrders.length > 0 ? (
            <div className="text-[11px] text-on-surface-variant/70">
              تم عرض كافة الطلبات ({filteredOrders.length} طلب)
            </div>
          ) : null}
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-outline-variant/30 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">receipt</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">تفاصيل الطلب #{selectedOrder.id.slice(-6)}</h3>
                  <p className="text-xs text-primary font-mono">{selectedOrder.serviceName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant font-bold">صاحب الطلب:</span>
                  <span className="font-bold text-on-surface">{selectedOrder.user?.fullName || "عميل مسجل"} ({selectedOrder.user?.email})</span>
                </div>
                {selectedOrder.user?.phone && (
                  <div className="flex justify-between items-center pt-1 border-t border-outline-variant/10 text-[11px]">
                    <span className="text-on-surface-variant">رقم هاتف العميل:</span>
                    <a
                      href={`https://wa.me/${selectedOrder.user.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-emerald-400 hover:underline flex items-center gap-1 font-bold dir-ltr"
                    >
                      <span className="material-symbols-outlined text-xs">chat</span>
                      <span>{selectedOrder.user.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex justify-between">
                <span className="text-on-surface-variant font-bold">البيانات المدخلة / IMEI:</span>
                <span className="font-mono font-bold text-primary dir-ltr">{selectedOrder.targetInput || "—"}</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex justify-between">
                <span className="text-on-surface-variant font-bold">قيمة الطلب:</span>
                <span className="font-mono font-bold text-emerald-400">${(selectedOrder.price || 0).toFixed(2)} USD</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex justify-between">
                <span className="text-on-surface-variant font-bold">حالة الطلب:</span>
                <span className="font-bold text-on-surface">{selectedOrder.status}</span>
              </div>

              {selectedOrder.reply && (
                <div className="p-3 rounded-xl bg-surface-container-high border border-emerald-500/30">
                  <span className="text-on-surface-variant font-bold block mb-1">الرد / الكود المستلم:</span>
                  <p className="font-mono text-emerald-300 font-bold bg-black/40 p-2.5 rounded-lg whitespace-pre-wrap dir-ltr text-start">
                    {selectedOrder.reply}
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex justify-between">
                <span className="text-on-surface-variant font-bold">تاريخ إنشاء الطلب:</span>
                <span className="font-mono text-on-surface-variant">{new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
