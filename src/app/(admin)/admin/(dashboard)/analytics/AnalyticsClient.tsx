"use client";

import { useState, useEffect } from "react";

export default function AnalyticsClient() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(30);

  // Provider Orders Report State
  const [providerOrders, setProviderOrders] = useState<any[]>([]);
  const [servicesList, setServicesList] = useState<string[]>([]);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedService, setSelectedService] = useState("ALL");
  const [datePeriod, setDatePeriod] = useState("30"); // "today", "yesterday", "7", "30", "90", "all", "custom"
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<any | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  useEffect(() => {
    fetchProviderOrders();
  }, [statusFilter, selectedService, datePeriod, customStartDate, customEndDate]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;
      const res = await fetch(`/api/analytics/summary?days=${days}`, {
        headers: {
          "Cache-Control": "no-cache",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderOrders = async () => {
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (selectedService !== "ALL") params.append("serviceName", selectedService);
      if (orderSearch.trim()) params.append("search", orderSearch.trim());

      const now = new Date();
      if (datePeriod === "today") {
        const todayStr = now.toISOString().slice(0, 10);
        params.append("startDate", todayStr);
        params.append("endDate", todayStr);
      } else if (datePeriod === "yesterday") {
        const y = new Date();
        y.setDate(y.getDate() - 1);
        const yStr = y.toISOString().slice(0, 10);
        params.append("startDate", yStr);
        params.append("endDate", yStr);
      } else if (datePeriod === "7") {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "30") {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "90") {
        const d = new Date();
        d.setDate(d.getDate() - 90);
        params.append("startDate", d.toISOString().slice(0, 10));
      } else if (datePeriod === "custom") {
        if (customStartDate) params.append("startDate", customStartDate);
        if (customEndDate) params.append("endDate", customEndDate);
      }

      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;
      const res = await fetch(`/api/analytics/provider-orders?${params.toString()}`, {
        headers: {
          "Cache-Control": "no-cache",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include"
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setProviderOrders(result.data.orders || []);
        setServicesList(result.data.servicesList || []);
        setOrderSummary(result.data.summary || null);
      }
    } catch (err) {
      console.error("Failed to fetch provider orders report:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProviderOrders();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const extractCleanTarget = (targetInput: string) => {
    if (!targetInput) return "—";
    const imeiMatch = targetInput.match(/(?:custom_)?imei[:\s]+([0-9]{10,18})/i);
    if (imeiMatch) return imeiMatch[1];
    if (targetInput.includes("|")) {
      const parts = targetInput.split("|").map((p) => p.trim());
      const imeiPart = parts.find((p) => /imei/i.test(p));
      if (imeiPart) return imeiPart.replace(/^[^:]+:\s*/, "");
      return parts[0];
    }
    return targetInput;
  };

  if (isLoading && !data) {
    return (
      <div className="p-12 flex justify-center items-center">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-1">
            إحصائيات النظام وتقارير العمليات
          </h1>
          <p className="text-on-surface-variant text-sm">
            متابعة شاملة لأداء الزوار والطلبات وتقارير المزودين التفصيلية
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              fetchAnalytics();
              fetchProviderOrders();
            }}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>تحديث البيانات</span>
          </button>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="p-2.5 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-bold"
          >
            <option value={7}>آخر 7 أيام</option>
            <option value={30}>آخر 30 يوماً</option>
            <option value={90}>آخر 90 يوماً</option>
          </select>
        </div>
      </div>

      {/* KPI Overview Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="إجمالي الزوار الفريدين" value={data.uniqueSessions} icon="group" color="sky" />
          <StatCard title="العملاء المسجلين" value={data.totalUsers} icon="person_add" color="emerald" />
          <StatCard title="الطلبات المكتملة والمحتملة" value={data.totalOrders} icon="shopping_cart" color="amber" />
          <StatCard title="زيارات الخدمات" value={data.counts.service_view || 0} icon="visibility" color="fuchsia" />
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* NEW SECTION: Provider Orders Detailed Report (Matching User Image) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 p-6 space-y-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-2xl">receipt_long</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span>سجل طلبات المزودين المنفذة خلال المدة المحددة</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live Sync
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                تصفح ومتابعة كافة الطلبات المرسلة للمزود مع رقم المرجع (#ID) وحالة الإنجاز والـ IMEI
              </p>
            </div>
          </div>

          {/* Quick Period Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: "today", label: "اليوم" },
              { id: "yesterday", label: "أمس" },
              { id: "7", label: "آخر 7 أيام" },
              { id: "30", label: "آخر 30 يوماً" },
              { id: "all", label: "كل الأوقات" },
              { id: "custom", label: "مخصص 📅" }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setDatePeriod(p.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  datePeriod === p.id
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-high/60 hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Row (Visible if custom selected) */}
        {datePeriod === "custom" && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 text-xs">
            <span className="font-bold text-on-surface flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">calendar_month</span>
              <span>تحديد النطاق الزمني:</span>
            </span>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">من:</label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-on-surface-variant">إلى:</label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 text-on-surface"
              />
            </div>
            <button
              type="button"
              onClick={fetchProviderOrders}
              className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold shadow-sm"
            >
              تطبيق التاريخ
            </button>
          </div>
        )}

        {/* Filter Controls Row (Exact design as shown in user's image) */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* #ID Search Box */}
          <div className="sm:col-span-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="#ID / رقم المرجع / IMEI"
                className="w-full py-2.5 px-3.5 pr-9 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface placeholder:text-on-surface-variant/50 text-xs focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
              >
                <span className="material-symbols-outlined text-base">search</span>
              </button>
            </form>
          </div>

          {/* Status Dropdown Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="ALL">ALL (جميع الحالات)</option>
              <option value="completed">Success (المكتملة بنجاح)</option>
              <option value="processing">In Process (قيد المعالجة)</option>
              <option value="failed">Rejected (المرفوضة)</option>
            </select>
          </div>

          {/* Service Dropdown Filter */}
          <div className="sm:col-span-6">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-on-surface text-xs font-bold truncate focus:outline-none focus:border-primary"
            >
              <option value="ALL">ALL Services (جميع خدمات المزودين)</option>
              {servicesList.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Summary Indicators Strip */}
        {orderSummary && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-surface-container-high/30 border border-outline-variant/20 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 font-bold text-on-surface">
                <span className="material-symbols-outlined text-sm text-primary">data_thresholding</span>
                <span>العدد الإجمالي:</span>
                <span className="font-mono text-primary font-extrabold">{orderSummary.total}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>المكتمل بنجاح:</span>
                <span className="font-mono font-extrabold">{orderSummary.completedCount}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-sky-400">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>قيد المعالجة:</span>
                <span className="font-mono font-extrabold">{orderSummary.processingCount}</span>
              </span>
              <span className="flex items-center gap-1.5 font-bold text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>المرفوض:</span>
                <span className="font-mono font-extrabold">{orderSummary.failedCount}</span>
              </span>
            </div>

            <div className="text-on-surface-variant font-bold">
              <span>إجمالي القيمة: </span>
              <span className="font-mono text-emerald-400 font-extrabold">
                ${orderSummary.totalVolume.toFixed(2)} USD
              </span>
            </div>
          </div>
        )}

        {/* ── The Table Matching Exactly the Screenshot ── */}
        <div className="overflow-x-auto rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-sm">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-surface-container-high/70 text-on-surface-variant text-xs border-b border-outline-variant/30 uppercase tracking-wider font-bold">
                <th className="p-3.5 text-start font-bold w-24">#ID</th>
                <th className="p-3.5 text-start font-bold w-28">الحالة (Status)</th>
                <th className="p-3.5 text-start font-bold">اسم الخدمة (Service Name)</th>
                <th className="p-3.5 text-start font-bold w-48">البيانات / IMEI</th>
                <th className="p-3.5 text-start font-bold w-36">التاريخ والوقت</th>
                <th className="p-3.5 text-start font-bold w-24">السعر</th>
                <th className="p-3.5 text-center font-bold w-24">تفاصيل</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-outline-variant/15 text-xs">
              {loadingOrders ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                      <span>جاري جلب سجل طلبات المزود...</span>
                    </div>
                  </td>
                </tr>
              ) : providerOrders.length > 0 ? (
                providerOrders.map((order) => {
                  const displayId = order.apiOrderId || `#${order.id.slice(-6)}`;
                  const cleanTarget = extractCleanTarget(order.targetInput);
                  const isCompleted = order.status === "completed";
                  const isProcessing = order.status === "processing";
                  const isFailed = order.status === "failed" || order.status === "rejected";

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-surface-container-high/30 transition-colors"
                    >
                      {/* #ID Column */}
                      <td className="p-3.5 font-mono text-on-surface font-bold">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(displayId, order.id)}
                          className="hover:text-primary transition-colors flex items-center gap-1 group"
                          title="اضغط لنسخ الرقم المرجعي"
                        >
                          <span>{displayId}</span>
                          <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedId === order.id ? "check" : "content_copy"}
                          </span>
                        </button>
                      </td>

                      {/* Status Column (Green Success Badge like in image) */}
                      <td className="p-3.5">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#28a745] text-white shadow-sm">
                            <span>Success</span>
                          </span>
                        )}
                        {isProcessing && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-sky-500 text-white shadow-sm">
                            <span>In Process</span>
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-600 text-white shadow-sm">
                            <span>Rejected</span>
                          </span>
                        )}
                        {!isCompleted && !isProcessing && !isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 text-white shadow-sm">
                            <span>{order.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Service Name with Verified Checkmark */}
                      <td className="p-3.5 font-bold text-on-surface max-w-md">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span>{order.serviceName}</span>
                          <span className="text-emerald-400 text-xs" title="خدمة مزود معتمدة">
                            ✅
                          </span>
                        </div>
                      </td>

                      {/* Target / IMEI */}
                      <td className="p-3.5 font-mono text-xs text-on-surface-variant font-bold">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[160px]">{cleanTarget}</span>
                          {cleanTarget !== "—" && (
                            <button
                              type="button"
                              onClick={() => copyToClipboard(cleanTarget, `target-${order.id}`)}
                              className="text-on-surface-variant hover:text-primary transition-colors shrink-0"
                              title="نسخ الـ IMEI"
                            >
                              <span className="material-symbols-outlined text-[13px]">
                                {copiedId === `target-${order.id}` ? "check" : "content_copy"}
                              </span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Date & Time */}
                      <td className="p-3.5 font-mono text-[11px] text-on-surface-variant whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleString("ar-EG", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>

                      {/* Price */}
                      <td className="p-3.5 font-mono text-xs font-bold text-primary whitespace-nowrap">
                        ${order.price.toFixed(2)}
                      </td>

                      {/* View Details Action */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrderDetails(order)}
                          className="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all mx-auto"
                          title="عرض تفاصيل الطلب الكاملة"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-on-surface-variant">
                    لا توجد طلبات مطابقة للفترة أو الفلاتر المحددة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Charts & Trends Grid */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="text-xl font-bold mb-4">الخدمات الأكثر زيارة (Top 5)</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                    <th className="p-4 text-start font-bold">اسم الخدمة</th>
                    <th className="p-4 text-start font-bold">عدد الزيارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {data.topServices &&
                    data.topServices.map((service: any) => (
                      <tr key={service.id} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-bold text-on-surface">{service.name}</td>
                        <td className="p-4 font-mono text-primary font-bold">{service.views}</td>
                      </tr>
                    ))}
                  {(!data.topServices || data.topServices.length === 0) && (
                    <tr>
                      <td colSpan={2} className="p-8 text-center text-on-surface-variant">
                        لا توجد بيانات كافية لعرضها.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-outline-variant/30">
            <h2 className="text-xl font-bold mb-4">التقرير اليومي للزيارات</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-start border-collapse">
                <thead>
                  <tr className="bg-surface-container-high/60 text-on-surface-variant text-sm border-b border-outline-variant/20">
                    <th className="p-4 text-start font-bold">التاريخ</th>
                    <th className="p-4 text-start font-bold">تصفح الصفحات</th>
                    <th className="p-4 text-start font-bold">مشاهدة الخدمات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10 text-sm">
                  {data.daily && data.daily.length > 0 ? (
                    data.daily.map((dayData: any) => (
                      <tr key={dayData.day} className="hover:bg-surface-container-high/30">
                        <td className="p-4 font-mono text-on-surface">
                          {new Date(dayData.day).toLocaleDateString("ar-EG")}
                        </td>
                        <td className="p-4 font-mono text-sky-400 font-bold">
                          {dayData.page_view || 0}
                        </td>
                        <td className="p-4 font-mono text-fuchsia-400 font-bold">
                          {dayData.service_view || 0}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-on-surface-variant">
                        لا توجد نشاطات مسجلة بعد.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-3xl border border-outline-variant/40 p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">info</span>
                <span>تفاصيل طلب المزود #{selectedOrderDetails.apiOrderId || selectedOrderDetails.id.slice(-6)}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 space-y-1.5">
                <p className="text-on-surface-variant font-medium">اسم الخدمة:</p>
                <p className="font-bold text-on-surface">{selectedOrderDetails.serviceName}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 space-y-1.5">
                <p className="text-on-surface-variant font-medium">البيانات والمدخلات المحفوظة:</p>
                <p className="font-mono text-on-surface break-all">{selectedOrderDetails.targetInput}</p>
              </div>

              {selectedOrderDetails.reply && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                  <p className="text-emerald-400 font-bold">الكود / الرد المسلّم من المزود:</p>
                  <p className="font-mono text-emerald-300 font-bold break-all">{selectedOrderDetails.reply}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-[11px] text-on-surface-variant pt-2">
                <div>
                  <span className="font-bold">المستخدم: </span>
                  <span>{selectedOrderDetails.user?.fullName || selectedOrderDetails.user?.email || "—"}</span>
                </div>
                <div>
                  <span className="font-bold">القيمة: </span>
                  <span className="font-mono text-primary font-bold">${selectedOrderDetails.price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-xs"
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

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string;
  value: number;
  icon: string;
  color: "sky" | "emerald" | "amber" | "fuchsia";
}) {
  const colorMap = {
    sky: { bg: "bg-sky-500/10", border: "border-sky-500/30", text1: "text-sky-300", text2: "text-sky-400" },
    emerald: { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text1: "text-emerald-300", text2: "text-emerald-400" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/30", text1: "text-amber-300", text2: "text-amber-400" },
    fuchsia: { bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/30", text1: "text-fuchsia-300", text2: "text-fuchsia-400" }
  };
  const c = colorMap[color];

  return (
    <div className={`p-6 rounded-3xl ${c.bg} border ${c.border} flex items-center justify-between`}>
      <div>
        <p className={`text-sm font-bold ${c.text1}`}>{title}</p>
        <p className={`text-3xl font-bold ${c.text2} font-mono mt-2`}>{value}</p>
      </div>
      <span className={`material-symbols-outlined ${c.text2} text-4xl`}>{icon}</span>
    </div>
  );
}
