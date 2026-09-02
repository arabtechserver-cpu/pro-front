"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { cleanHtmlToText } from "@/utils/cleanHtml";

export default function OrdersClient({ lang, dict }: { lang: string, dict: any }) {
  const [userSession, setUserSession] = useState<any>(null);
  const [userBalance, setUserBalance] = useState<number>(0.0);

  // Orders History State from DB
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 1. Load User Session & Sync Live Balance
  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setUserBalance(parseFloat(parsed.balance || 0));

        if (parsed.email || parsed.id) {
          const token = localStorage.getItem("user_token");
          const queryParam = parsed.id ? `userId=${encodeURIComponent(parsed.id)}` : `email=${encodeURIComponent(parsed.email)}`;
          const headers: Record<string, string> = {};
          if (token && token !== "null" && token !== "undefined") {
            headers["Authorization"] = `Bearer ${token}`;
          }
          fetch(`/api/users/profile?${queryParam}`, {
            headers,
            credentials: "include"
          })
            .then(res => res.json())
            .then(data => {
              if (data.user) {
                setUserBalance(data.user.balance);
                const updatedSession = { ...parsed, balance: data.user.balance };
                localStorage.setItem("user_session", JSON.stringify(updatedSession));
              }
            })
            .catch(() => {});
        }
      } catch (e) {}
    } else {
      setLoadingOrders(false);
    }
  }, []);

  // 2. Fetch Real Customer Orders from Database
  const fetchCustomerOrders = async () => {
    if (!userSession?.email && !userSession?.id) {
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("user_token");
      const param = userSession?.id ? `userId=${encodeURIComponent(userSession.id)}` : `email=${encodeURIComponent(userSession.email)}`;
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/orders?${param}`, {
        headers,
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json().catch(() => ({ orders: [] }));
        if (data.orders && Array.isArray(data.orders)) {
          setOrdersList(data.orders);
        }
      }
    } catch (e) {
      console.error("Error fetching orders list:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (userSession) {
      fetchCustomerOrders();
    }
  }, [userSession]);

  // Filtered Orders for the table
  const filteredOrders = ordersList.filter(o => {
    if (filterStatus === "processing" && !(o.status === "processing" || o.status === "pending")) return false;
    if (filterStatus === "completed" && o.status !== "completed") return false;
    if (filterStatus === "failed" && !(o.status === "failed" || o.status === "rejected")) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const orderId = (o.id || "").toLowerCase();
      const serviceName = (o.serviceName || "").toLowerCase();
      const targetInput = (o.targetInput || "").toLowerCase();
      const notes = (o.notes || "").toLowerCase();

      return orderId.includes(q) || serviceName.includes(q) || targetInput.includes(q) || notes.includes(q);
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-8 pb-16" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
        <div>
          <h1 className="font-display-lg-mobile text-3xl font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">receipt_long</span>
            <span>{lang === 'ar' ? 'سجل الطلبات والخدمات السابقة' : 'My Orders & Services History'}</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            {lang === 'ar' 
              ? 'تتبع حالة وحصول كافة أكواد ونتائج طلباتك المسجلة لحظة بلحظة.' 
              : 'Track status and details of all your submitted service orders live.'}
          </p>
        </div>

        {/* Action Buttons & Balance */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href={`/${lang}/purchase`}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] transition-all flex items-center gap-2 shadow-md active:scale-95"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>{lang === 'ar' ? 'طلب خدمة جديدة +' : 'Order New Service +'}</span>
          </Link>

          {userSession && (
            <div className="p-2.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/30 flex items-center gap-3 shadow-sm">
              <div className="text-end">
                <p className="text-[10px] font-bold text-on-surface-variant">{lang === 'ar' ? 'رصيد المحفظة' : 'Wallet Balance'}</p>
                <p className="text-sm font-bold text-primary font-mono dir-ltr">${userBalance.toFixed(2)} USD</p>
              </div>
              <Link 
                href={`/${lang}/wallet`}
                className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-on-primary font-bold text-xs transition-all"
              >
                {lang === 'ar' ? 'شحن' : 'Top Up'}
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* NOT LOGGED IN WARNING */}
      {!userSession && (
        <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-3xl text-amber-400">lock</span>
            <div>
              <p className="font-bold text-sm text-on-surface">{lang === 'ar' ? 'يرجى تسجيل الدخول لمشاهدة طلباتك' : 'Please Sign In to View Your Orders'}</p>
              <p className="text-xs text-on-surface-variant mt-0.5">{lang === 'ar' ? 'قم بتسجيل الدخول بحسابك لعرض سجل العمليات وحالة خدماتك.' : 'Sign in to access your order history.'}</p>
            </div>
          </div>
          <Link
            href={`/${lang}/login`}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-all shrink-0 shadow-md"
          >
            {lang === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
          </Link>
        </div>
      )}

      {/* DEDICATED ORDERS HISTORY TABLE CARD */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
        {/* Controls Header */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <span className="material-symbols-outlined absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'ar' ? 'ابحث برقم الطلب، اسم الخدمة، أو رقم IMEI...' : 'Search by order ID, service, or IMEI...'}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 ps-10 pe-4 text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs font-bold">
              <button 
                onClick={() => setFilterStatus("all")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              <button 
                onClick={() => setFilterStatus("processing")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "processing" ? "bg-amber-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {lang === 'ar' ? 'جاري التنفيذ ⏳' : 'Processing'}
              </button>
              <button 
                onClick={() => setFilterStatus("completed")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "completed" ? "bg-emerald-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {lang === 'ar' ? 'مكتمل 🟢' : 'Completed'}
              </button>
              <button 
                onClick={() => setFilterStatus("failed")}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterStatus === "failed" ? "bg-red-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                {lang === 'ar' ? 'مرفوض 🔴' : 'Failed'}
              </button>
            </div>

            {/* Refresh Button */}
            <button 
              onClick={fetchCustomerOrders}
              disabled={loadingOrders}
              className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all active:scale-95"
              title="تحديث البيانات"
            >
              <span className={`material-symbols-outlined text-sm text-primary ${loadingOrders ? 'animate-spin' : ''}`}>refresh</span>
              <span>{lang === 'ar' ? 'تحديث' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/60 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                <th className="p-4 text-start">{lang === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'اسم الخدمة' : 'Service Name'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'رقم الجهاز / البيانات' : 'Target Input / IMEI'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'النتيجة وكود الفك 🔑' : 'Result / Unlock Code 🔑'}</th>
                <th className="p-4 text-start">{lang === 'ar' ? 'الكمية والسعر' : 'Qty & Cost'}</th>
                <th className="p-4 text-center">{lang === 'ar' ? 'حالة الطلب' : 'Status'}</th>
                <th className="p-4 text-end">{lang === 'ar' ? 'تاريخ وساعة الطلب' : 'Date & Time'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-medium">
              {loadingOrders ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-primary">
                    <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
                    <p className="text-xs font-bold mt-2">{lang === 'ar' ? 'جاري جلب سجل الطلبات...' : 'Loading order history...'}</p>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-5xl text-on-surface-variant/40 mb-3">shopping_bag</span>
                    <p className="font-bold text-sm text-on-surface">{lang === 'ar' ? 'لا يوجد طلبات مسجلة' : 'No orders found.'}</p>
                    <p className="text-xs text-on-surface-variant/70 mt-1 max-w-sm mx-auto">
                      {lang === 'ar' 
                        ? 'عند إرسال أو طلب أي خدمة جديدة، ستظهر وتُحدث حالتها هنا تلقائياً.' 
                        : 'Your submitted orders will be listed here automatically.'}
                    </p>
                    <Link
                      href={`/${lang}/purchase`}
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">add_circle</span>
                      <span>{lang === 'ar' ? 'طلب خدمة جديدة الآن' : 'Order a Service Now'}</span>
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const isCompleted = ord.status === "completed";
                  const isProcessing = ord.status === "processing" || ord.status === "pending";
                  const isFailed = ord.status === "failed" || ord.status === "rejected";

                  return (
                    <tr key={ord.id} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="p-4 font-bold text-primary font-mono text-xs dir-ltr text-start">
                        #{ord.id.slice(-6).toUpperCase()}
                      </td>

                      <td className="p-4 font-bold text-on-surface text-start">
                        <div className="flex flex-col">
                          <span>{ord.serviceName}</span>
                          {ord.notes && <span className="text-[10px] text-on-surface-variant/70 font-normal">{ord.notes}</span>}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-on-surface dir-ltr text-start select-all">
                        <span className="bg-surface-container-lowest px-3 py-1 rounded-xl border border-outline-variant/20 font-bold text-[11px] text-primary inline-block max-w-[200px] truncate">
                          {ord.targetInput || 'N/A'}
                        </span>
                      </td>

                      {/* UNLOCK CODE / RESULT REPLY DISPLAY */}
                      <td className="p-4 text-start font-mono text-xs">
                        {ord.reply ? (
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1 rounded-xl text-xs select-all dir-ltr glow-cyan whitespace-pre-wrap block">
                              {cleanHtmlToText(ord.reply)}
                            </span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(cleanHtmlToText(ord.reply));
                                alert(lang === 'ar' ? 'تم نسخ الكود/النتيجة بنجاح 📋' : 'Code copied to clipboard!');
                              }}
                              className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                              title="نسخ النتيجة"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          </div>
                        ) : isCompleted ? (
                          <span className="text-emerald-400 font-bold text-[11px]">{lang === 'ar' ? 'تم التفعيل بنجاح 🟢' : 'Done / Unlocked'}</span>
                        ) : isFailed ? (
                          <span className="text-red-400 font-bold text-[11px]">{lang === 'ar' ? 'تعذر التنفيذ / مرفوض' : 'Rejected'}</span>
                        ) : (
                          <span className="text-amber-400/80 font-bold text-[11px] animate-pulse">{lang === 'ar' ? 'جاري انتظار الكود... ⏳' : 'Waiting provider...'}</span>
                        )}
                      </td>

                      <td className="p-4 text-start">
                        <div className="flex flex-col">
                          <span className="font-bold text-on-surface font-mono dir-ltr">${parseFloat(ord.price || 0).toFixed(2)} USD</span>
                          <span className="text-[10px] text-on-surface-variant">{lang === 'ar' ? `الكمية: ${ord.quantity || 1}` : `Qty: ${ord.quantity || 1}`}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        {isCompleted && (
                          <span className="px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            <span>{lang === 'ar' ? 'مكتمل 🟢' : 'Completed'}</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px] inline-flex items-center gap-1.5 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            <span>{lang === 'ar' ? 'قيد التنفيذ ⏳' : 'Processing'}</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="px-3.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px] inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                            <span>{lang === 'ar' ? 'مرفوض 🔴' : 'Failed'}</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-end text-on-surface-variant font-mono text-[11px]">
                        {new Date(ord.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
