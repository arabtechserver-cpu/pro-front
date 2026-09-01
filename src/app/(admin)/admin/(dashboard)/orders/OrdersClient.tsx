"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

interface OrderItem {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  targetInput: string;
  quantity: number;
  price: number;
  cost?: number;
  profit?: number;
  status: "completed" | "processing" | "pending" | "rejected" | "cancelled" | string;
  reply?: string;
  apiOrderId?: string | null;
  createdAt: string;
  serviceDhruId?: string | null;
  serviceCategory?: string | null;
  groupName?: string | null;
  provider?: {
    id: string;
    name: string;
    apiUrl?: string;
    type?: string;
  } | null;
  customFields?: Record<string, string> | null;
  events?: {
    time: string;
    action: string;
    title: string;
    desc: string;
  }[];
  rawNotes?: string | null;
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
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selected Order for Details / Timeline Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Modal Actions States
  const [manualCompleteOrder, setManualCompleteOrder] = useState<OrderItem | null>(null);
  const [manualReplyCode, setManualReplyCode] = useState("");
  const [isCompletingManual, setIsCompletingManual] = useState(false);

  const [refundModalOrder, setRefundModalOrder] = useState<{ order: OrderItem; isProviderCancel: boolean } | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [isRefunding, setIsRefunding] = useState(false);

  const [dispatchingOrderId, setDispatchingOrderId] = useState<string | null>(null);
  const [checkingOrderId, setCheckingOrderId] = useState<string | null>(null);

  // Progressive scroll loading state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

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
      showToast("فشل جلب سجل الطلبات", "error");
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
    const processing = orders.filter((o) => o.status === "processing").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const rejected = orders.filter((o) => o.status === "rejected" || o.status === "cancelled" || o.status === "failed").length;
    return { total, completed, processing, pending, rejected };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && order.status !== "pending") return false;
        if (statusFilter === "processing" && order.status !== "processing") return false;
        if (statusFilter === "completed" && order.status !== "completed") return false;
        if (statusFilter === "rejected" && order.status !== "rejected" && order.status !== "cancelled" && order.status !== "failed") return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (order.id && order.id.toLowerCase().includes(q)) ||
        (order.serviceName && order.serviceName.toLowerCase().includes(q)) ||
        (order.targetInput && order.targetInput.toLowerCase().includes(q)) ||
        (order.provider?.name && order.provider.name.toLowerCase().includes(q)) ||
        (order.apiOrderId && order.apiOrderId.toLowerCase().includes(q)) ||
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

  // Dispatch to Provider API
  const handleDispatchProvider = async (order: OrderItem) => {
    setDispatchingOrderId(order.id);
    try {
      const res = await fetch("/api/orders/dispatch-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم إرسال الطلب للمزود بنجاح!");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل إرسال الطلب للمزود", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بسيرفر المزود", "error");
    } finally {
      setDispatchingOrderId(null);
    }
  };

  // Submit Manual Completion with Code
  const handleManualCompleteSubmit = async () => {
    if (!manualCompleteOrder) return;
    setIsCompletingManual(true);
    try {
      const res = await fetch("/api/orders/complete-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: manualCompleteOrder.id,
          reply: manualReplyCode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم إكمال الطلب وحفظ الكود بنجاح!");
        setManualCompleteOrder(null);
        setManualReplyCode("");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === manualCompleteOrder.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل إكمال الطلب", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsCompletingManual(false);
    }
  };

  // Submit Refund / Cancel Order
  const handleRefundSubmit = async () => {
    if (!refundModalOrder) return;
    const { order, isProviderCancel } = refundModalOrder;
    setIsRefunding(true);
    const endpoint = isProviderCancel ? "/api/orders/cancel-provider" : "/api/orders/refund";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.id,
          reason: refundReason
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم إلغاء الطلب واسترجاع الرصيد للعميل بنجاح!");
        setRefundModalOrder(null);
        setRefundReason("");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل إلغاء الطلب", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لإتمام الإلغاء", "error");
    } finally {
      setIsRefunding(false);
    }
  };

  // Check live status from Dhru/Provider
  const handleCheckStatus = async (order: OrderItem) => {
    setCheckingOrderId(order.id);
    try {
      const res = await fetch("/api/orders/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم التحقق من حالة الطلب من المزود!");
        await fetchOrders();
        if (selectedOrder && selectedOrder.id === order.id) {
          setSelectedOrder(data.order);
        }
      } else {
        showToast(data.error || "فشل الاستعلام من المزود", "error");
      }
    } catch {
      showToast("تعذر الاتصال بسيرفر المزود", "error");
    } finally {
      setCheckingOrderId(null);
    }
  };

  return (
    <div className="space-y-6 font-sans" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-white font-bold ${
            toastMessage.type === "success" ? "bg-emerald-600 border border-emerald-400/40" : "bg-red-600 border border-red-400/40"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
            <span>طلبات العملاء وتنفيذ الخدمات</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm">
            مراجعة الطلبات، الإرسال اليدوي للمزودين، إرسال أكواد التفعيل، وإلغاء واسترجاع الرصيد للعميل.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <span className={`material-symbols-outlined text-sm text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث الطلبات</span>
          </button>
        </div>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-on-surface-variant">إجمالي الطلبات</p>
            <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.total}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl opacity-80">receipt_long</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-300">في انتظار الموافقة</p>
            <p className="text-2xl font-bold text-amber-400 font-mono mt-1">{stats.pending}</p>
          </div>
          <span className="material-symbols-outlined text-amber-400 text-3xl">hourglass_top</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-300">قيد التنفيذ بالمزود</p>
            <p className="text-2xl font-bold text-blue-400 font-mono mt-1">{stats.processing}</p>
          </div>
          <span className="material-symbols-outlined text-blue-400 text-3xl">rocket_launch</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-300">الطلبات المكتملة</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.completed}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-3xl">task_alt</span>
        </div>

        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-red-300">ملغية ومسترجعة</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{stats.rejected}</p>
          </div>
          <span className="material-symbols-outlined text-red-400 text-3xl">cancel</span>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالعميل، اسم الخدمة، المزود، أو IMEI..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 pr-10 pl-4 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-2 flex-wrap text-xs font-bold">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "all" ? "bg-primary text-on-primary shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            الكل ({stats.total})
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "pending" ? "bg-amber-500 text-black shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            في انتظار الموافقة ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter("processing")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "processing" ? "bg-blue-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            قيد التنفيذ ({stats.processing})
          </button>
          <button
            onClick={() => setStatusFilter("completed")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "completed" ? "bg-emerald-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            المكتملة ({stats.completed})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              statusFilter === "rejected" ? "bg-red-500 text-white shadow" : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
            }`}
          >
            الملغاة ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-16 text-center text-on-surface-variant text-xs flex flex-col items-center justify-center gap-3">
            <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل سجل الطلبات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-on-surface-variant text-sm flex flex-col items-center gap-2">
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
                  <th className="p-4">الخدمة والمزود</th>
                  <th className="p-4">البيانات / IMEI</th>
                  <th className="p-4">السعر / التكلفة</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4">التاريخ</th>
                  <th className="p-4 text-center">إجراءات التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedOrders.map((order) => {
                  const isDispatching = dispatchingOrderId === order.id;
                  const isChecking = checkingOrderId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-surface-container-high/40 transition-colors">
                      {/* Order ID */}
                      <td className="p-4 font-mono font-bold text-on-surface text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-primary font-bold">#{order.id ? order.id.slice(-6) : "N/A"}</span>
                          {order.apiOrderId && (
                            <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-mono" title="رقم الطلب الخارجي لدى المزود">
                              API #{order.apiOrderId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="p-4">
                        <div className="font-bold text-on-surface">{order.user?.fullName || "عميل مسجل"}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono">{order.user?.email || order.userId}</div>
                      </td>

                      {/* Service & Provider */}
                      <td className="p-4 max-w-[240px]">
                        <div className="font-bold text-on-surface text-xs truncate" title={order.serviceName}>
                          {order.serviceName}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {order.provider ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary/10 border border-secondary/20 text-secondary font-bold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[11px]">dns</span>
                              <span>{order.provider.name}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant font-bold">
                              تنفيذ يدوي / محلي
                            </span>
                          )}

                          {order.serviceDhruId && (
                            <span className="text-[10px] font-mono text-on-surface-variant/80">
                              ID #{order.serviceDhruId}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Input / IMEI */}
                      <td className="p-4 font-mono text-primary font-bold dir-ltr text-right max-w-[160px] truncate" title={order.targetInput}>
                        {order.targetInput || "—"}
                      </td>

                      {/* Price & Cost */}
                      <td className="p-4 font-mono">
                        <div className="font-bold text-primary text-sm">${(order.price || 0).toFixed(2)}</div>
                        {order.cost !== undefined && order.cost > 0 && (
                          <div className="text-[10px] text-on-surface-variant">
                            تكلفة: ${order.cost.toFixed(2)}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="p-4">
                        {order.status === "completed" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            مكتمل
                          </span>
                        )}
                        {order.status === "processing" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            قيد التنفيذ بالمزود
                          </span>
                        )}
                        {order.status === "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                            في انتظار الموافقة
                          </span>
                        )}
                        {order.status !== "completed" && order.status !== "processing" && order.status !== "pending" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            ملغي ومسترجع
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="p-4 text-on-surface-variant text-[11px]">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Send to Provider (Dhru) */}
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleDispatchProvider(order)}
                              disabled={isDispatching}
                              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-[11px] font-bold transition-all shadow hover:shadow-primary/30 flex items-center gap-1 disabled:opacity-50"
                              title="إرسال الطلب آلياً إلى سيرفر المزود"
                            >
                              <span className={`material-symbols-outlined text-xs ${isDispatching ? "animate-spin" : ""}`}>
                                {isDispatching ? "refresh" : "send"}
                              </span>
                              <span>إرسال للمزود</span>
                            </button>
                          )}

                          {/* Manual Complete with Code */}
                          {order.status !== "completed" && order.status !== "rejected" && order.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setManualCompleteOrder(order);
                                setManualReplyCode(order.reply || "");
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold transition-all flex items-center gap-1"
                              title="إكمال الطلب يدوياً وإرسال كود التفعيل للعميل"
                            >
                              <span className="material-symbols-outlined text-xs">key</span>
                              <span>إكمال بكود</span>
                            </button>
                          )}

                          {/* Check Status from Provider if apiOrderId exists */}
                          {order.apiOrderId && order.status === "processing" && (
                            <button
                              onClick={() => handleCheckStatus(order)}
                              disabled={isChecking}
                              className="p-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-primary border border-outline-variant/30 transition-all disabled:opacity-50"
                              title="فحص تحديث الحالة من المزود"
                            >
                              <span className={`material-symbols-outlined text-xs ${isChecking ? "animate-spin" : ""}`}>
                                refresh
                              </span>
                            </button>
                          )}

                          {/* Cancel & Refund Order */}
                          {order.status !== "rejected" && order.status !== "cancelled" && (
                            <button
                              onClick={() => {
                                setRefundModalOrder({
                                  order,
                                  isProviderCancel: Boolean(order.apiOrderId && order.status === "processing")
                                });
                                setRefundReason("");
                              }}
                              className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                              title={order.apiOrderId ? "إلغاء من المزود واسترجاع الرصيد" : "إلغاء الطلب واسترجاع الرصيد"}
                            >
                              <span className="material-symbols-outlined text-xs">undo</span>
                            </button>
                          )}

                          {/* View Full Details & Timeline */}
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 transition-all"
                            title="عرض تفاصيل وسجل أحداث الطلب"
                          >
                            <span className="material-symbols-outlined text-xs">visibility</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* MANUAL COMPLETE & SEND CODE MODAL */}
      {manualCompleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-emerald-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 text-emerald-400">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">key</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">إكمال الطلب وإرسال كود التفعيل</h3>
                  <p className="text-xs text-on-surface-variant">طلب #{manualCompleteOrder.id.slice(-6)} • {manualCompleteOrder.serviceName}</p>
                </div>
              </div>

              <button
                onClick={() => setManualCompleteOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-on-surface-variant">العميل:</span>
                  <span className="text-on-surface">{manualCompleteOrder.user?.fullName} ({manualCompleteOrder.user?.email})</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-on-surface-variant">البيانات / IMEI:</span>
                  <span className="text-primary font-bold dir-ltr">{manualCompleteOrder.targetInput}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  كود التفعيل / الرد / بيانات الحساب المُسلّمة للعميل:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="اكتب كود فك القفل، كود الشحن، أو بيانات الحساب وكلمة المرور..."
                  value={manualReplyCode}
                  onChange={(e) => setManualReplyCode(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-emerald-500/40 rounded-xl focus:border-emerald-500 outline-none font-mono text-xs text-on-surface transition-all dir-ltr"
                />
                <p className="text-[11px] text-on-surface-variant/80 mt-1">
                  سيظهر هذا الكود في حساب العميل مباشرة مع زر للنسخ الفوري.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleManualCompleteSubmit}
                disabled={isCompletingManual || !manualReplyCode.trim()}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isCompletingManual ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
                <span>اعتماد وإرسال الكود للعميل</span>
              </button>
              <button
                type="button"
                onClick={() => setManualCompleteOrder(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL & REFUND MODAL */}
      {refundModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container w-full max-w-lg rounded-3xl p-6 sm:p-7 border border-red-500/40 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3 text-red-400">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-xl">undo</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">
                    {refundModalOrder.isProviderCancel ? "إلغاء الطلب من المزود واسترجاع الرصيد" : "إلغاء الطلب واسترجاع الرصيد"}
                  </h3>
                  <p className="text-xs text-red-400">طلب #{refundModalOrder.order.id.slice(-6)} • استرجاع ${(refundModalOrder.order.price || 0).toFixed(2)} USD</p>
                </div>
              </div>

              <button
                onClick={() => setRefundModalOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 leading-relaxed">
                سيتم إلغاء الطلب وإرجاع كامل المبلغ (${(refundModalOrder.order.price || 0).toFixed(2)} USD) إلى محفظة العميل ({refundModalOrder.order.user?.fullName}) وتوثيق حركة استرجاع مالية تلقائياً.
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  سبب الإلغاء (يظهر للعميل في التقرير):
                </label>
                <input
                  type="text"
                  placeholder="مثال: رقم IMEI غير صحيح أو الخدمة غير متوفرة حالياً"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-red-500 outline-none text-xs text-on-surface transition-all"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleRefundSubmit}
                disabled={isRefunding}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isRefunding ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">undo</span>
                )}
                <span>تأكيد الإلغاء واسترجاع الرصيد</span>
              </button>
              <button
                type="button"
                onClick={() => setRefundModalOrder(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL ORDER DETAILS & EVENT TIMELINE MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-surface-container w-full max-w-2xl rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl relative overflow-hidden space-y-5 max-h-[90vh] flex flex-col">
            {/* Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined">receipt_long</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span>تفاصيل الطلب:</span>
                    <span className="text-primary font-mono">#{selectedOrder.id.slice(-6)}</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">{selectedOrder.serviceName}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Modal Body Scroll */}
            <div className="overflow-y-auto flex-1 space-y-4 text-xs pr-1">
              {/* Customer Info Card */}
              <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 space-y-2">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span>بيانات العميل:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface">
                  <div>
                    <span className="text-on-surface-variant">الاسم: </span>
                    <span className="font-bold">{selectedOrder.user?.fullName || "عميل مسجل"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">البريد: </span>
                    <span className="font-mono">{selectedOrder.user?.email}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">اسم المستخدم: </span>
                    <span className="font-mono">@{selectedOrder.user?.username}</span>
                  </div>
                  {selectedOrder.user?.phone && (
                    <div>
                      <span className="text-on-surface-variant">الهاتف / واتساب: </span>
                      <a
                        href={`https://wa.me/${selectedOrder.user.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-400 hover:underline font-bold dir-ltr inline-block"
                      >
                        {selectedOrder.user.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Service & Provider Info Card */}
              <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 space-y-2">
                <div className="font-bold text-secondary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">dns</span>
                  <span>بيانات الخدمة وسيرفر المزود:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-on-surface">
                  <div>
                    <span className="text-on-surface-variant">سيرفر المزود: </span>
                    <span className="font-bold">{selectedOrder.provider?.name || "سيرفر محلي / يدوي"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">نوع النظام: </span>
                    <span className="font-mono text-primary font-bold">{selectedOrder.provider?.type || "Dhru Fusion"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">رقم الخدمة لدى المزود (ID): </span>
                    <span className="font-mono font-bold">{selectedOrder.serviceDhruId || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">رقم الطلب المرجعي (API Order ID): </span>
                    <span className="font-mono font-bold text-primary">{selectedOrder.apiOrderId || "لم يُرسل بعد"}</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">سعر البيع: </span>
                    <span className="font-mono font-bold text-emerald-400">${(selectedOrder.price || 0).toFixed(2)} USD</span>
                  </div>
                  <div>
                    <span className="text-on-surface-variant">التكلفة والربح: </span>
                    <span className="font-mono text-on-surface-variant">
                      تكلفة: ${(selectedOrder.cost || 0).toFixed(2)} | ربح: ${(selectedOrder.profit || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Target Input & Custom Fields */}
              <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 space-y-2">
                <div className="font-bold text-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">input</span>
                  <span>المدخلات والحقول المخصصة للطلب:</span>
                </div>

                <div className="p-2.5 rounded-xl bg-surface-container-lowest border border-outline-variant/20 font-mono text-primary font-bold dir-ltr text-right">
                  {selectedOrder.targetInput}
                </div>

                {selectedOrder.customFields && Object.keys(selectedOrder.customFields).length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-bold text-on-surface-variant">الحقول المخصصة الإضافية:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {Object.entries(selectedOrder.customFields).map(([k, v]) => (
                        <div key={k} className="p-2 rounded-xl bg-surface-container-lowest border border-outline-variant/15">
                          <div className="text-[10px] text-on-surface-variant">{k}:</div>
                          <div className="font-mono text-on-surface font-bold dir-ltr">{String(v)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Code / Received Reply Card */}
              {selectedOrder.reply && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">key</span>
                      <span>الكود أو الرد المُسلّم للعميل:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.reply || "");
                        showToast("تم نسخ الكود بنجاح!");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-black font-bold text-[10px] hover:bg-emerald-400 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                      <span>نسخ</span>
                    </button>
                  </div>
                  <p className="font-mono text-emerald-300 font-bold bg-black/50 p-3 rounded-xl whitespace-pre-wrap dir-ltr text-start">
                    {selectedOrder.reply}
                  </p>
                </div>
              )}

              {/* ORDER EVENT TIMELINE (Audit Log) */}
              <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/20 space-y-3">
                <div className="font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">timeline</span>
                  <span>سجل أحداث وتتبع دورة حياة الطلب:</span>
                </div>

                <div className="relative pl-3 space-y-4 before:absolute before:right-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-outline-variant/30 pr-6">
                  {/* Event 1: Creation */}
                  <div className="relative">
                    <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></span>
                    <div className="font-bold text-on-surface text-xs">إنشاء الطلب من العميل</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      تم إنشاء الطلب وخصم ${(selectedOrder.price || 0).toFixed(2)} USD من رصيد المحفظة.
                    </div>
                    <div className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                      {new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}
                    </div>
                  </div>

                  {/* Custom Logged Events from notes */}
                  {selectedOrder.events &&
                    selectedOrder.events.map((ev, i) => (
                      <div key={i} className="relative">
                        <span className="absolute -right-6 top-0.5 w-3 h-3 rounded-full bg-secondary ring-4 ring-secondary/20"></span>
                        <div className="font-bold text-on-surface text-xs">{ev.title || ev.action}</div>
                        <div className="text-[11px] text-on-surface-variant mt-0.5">{ev.desc}</div>
                        <div className="text-[10px] text-on-surface-variant/70 font-mono mt-0.5">
                          {new Date(ev.time).toLocaleString("ar-EG")}
                        </div>
                      </div>
                    ))}

                  {/* Final Status Indicator */}
                  <div className="relative">
                    <span
                      className={`absolute -right-6 top-0.5 w-3 h-3 rounded-full ring-4 ${
                        selectedOrder.status === "completed"
                          ? "bg-emerald-400 ring-emerald-400/20"
                          : selectedOrder.status === "processing"
                          ? "bg-blue-400 ring-blue-400/20"
                          : selectedOrder.status === "pending"
                          ? "bg-amber-400 ring-amber-400/20"
                          : "bg-red-400 ring-red-400/20"
                      }`}
                    ></span>
                    <div className="font-bold text-on-surface text-xs">
                      الحالة الحالية:{" "}
                      {selectedOrder.status === "completed"
                        ? "مكتمل بنجاح ✅"
                        : selectedOrder.status === "processing"
                        ? "قيد التنفيذ لدى المزود 🚀"
                        : selectedOrder.status === "pending"
                        ? "في انتظار الموافقة ⏳"
                        : "ملغي ومسترجع ❌"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
              <div className="flex items-center gap-2">
                {selectedOrder.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleDispatchProvider(selectedOrder)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs shadow-md"
                  >
                    إرسال للمزود الآن
                  </button>
                )}
                {selectedOrder.status !== "completed" && selectedOrder.status !== "rejected" && selectedOrder.status !== "cancelled" && (
                  <button
                    type="button"
                    onClick={() => {
                      setManualCompleteOrder(selectedOrder);
                      setManualReplyCode(selectedOrder.reply || "");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs"
                  >
                    إكمال يدوياً وإرسال كود
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 rounded-xl bg-surface-variant text-on-surface-variant hover:text-on-surface font-bold text-xs"
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
