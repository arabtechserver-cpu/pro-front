"use client";

import { useState, useEffect, useMemo } from "react";

export default function ServicesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // State to manage expanded packages (groupNames)
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  // Edit Service Modal State
  const [editingService, setEditingService] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editCredit, setEditCredit] = useState<number>(0);
  const [editMargin, setEditMargin] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Filter state (all, active, hidden, zeroPrice)
  const [filterType, setFilterType] = useState<"all" | "active" | "hidden" | "zeroPrice">("all");

  // Sync from Provider State
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dhru/services?all=true", {
        headers: { "Cache-Control": "no-cache" }
      });
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncDhruServices = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/dhru/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تمت المزامنة بنجاح! تم استيراد ${data.count || 0} خدمة.`);
        setIsSyncModalOpen(false);
        // Refresh the services list in the dashboard immediately
        await fetchServices();
      } else {
        showToast(data.error || "فشلت عملية المزامنة مع المزود", "error");
      }
    } catch (err: any) {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر للمزامنة", "error");
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Toggle single service visibility
  const toggleVisibility = async (service: any) => {
    const nextState = !service.isActive;
    setActionLoadingKey(service.id);

    try {
      const res = await fetch("/api/dhru/services/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, isActive: nextState })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            services: cat.services.map((s: any) =>
              s.id === service.id ? { ...s, isActive: nextState } : s
            )
          }))
        );
        showToast(nextState ? `تم إظهار الخدمة (${service.name}) للعملاء` : `تم إخفاء الخدمة (${service.name}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تغيير حالة الخدمة", "error");
      }
    } catch (err) {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Toggle entire package (group) visibility
  const togglePackageVisibility = async (groupName: string, categoryId: string, currentAllActive: boolean) => {
    const nextState = !currentAllActive;
    const actionKey = `pkg-${categoryId}-${groupName}`;
    setActionLoadingKey(actionKey);

    try {
      const res = await fetch("/api/dhru/services/toggle-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupName, categoryId, isActive: nextState })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev.map((cat) => {
            if (cat.id !== categoryId) return cat;
            return {
              ...cat,
              services: cat.services.map((s: any) =>
                s.groupName === groupName ? { ...s, isActive: nextState } : s
              )
            };
          })
        );
        showToast(nextState ? `تم إظهار جميع خدمات باقة (${groupName}) للعملاء` : `تم إخفاء جميع خدمات باقة (${groupName}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تغيير حالة الباقة", "error");
      }
    } catch (err) {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    } finally {
      setActionLoadingKey(null);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setEditName(service.name || "");
    setEditCredit(Number(service.credit) || 0);
    setEditMargin(Number(service.margin) || 0);
    setEditIsActive(service.isActive !== false);
  };

  // Save Service Edits
  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    setIsSavingEdit(true);
    try {
      const res = await fetch("/api/dhru/services/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: editingService.id,
          name: editName,
          credit: editCredit,
          margin: editMargin,
          isActive: editIsActive
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const finalCalculated = Number((Number(editCredit) + Number(editMargin)).toFixed(2));
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            services: cat.services.map((s: any) =>
              s.id === editingService.id ? { 
                ...s, 
                name: editName, 
                credit: Number(editCredit), 
                margin: Number(editMargin),
                price: finalCalculated,
                finalPrice: finalCalculated,
                isActive: editIsActive
              } : s
            )
          }))
        );
        showToast("تم حفظ تعديلات الخدمة والأسعار بنجاح!");
        setEditingService(null);
      } else {
        showToast(data.error || "فشل حفظ التعديلات", "error");
      }
    } catch (err) {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر", "error");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const togglePackage = (packageKey: string) => {
    setExpandedPackages((prev) => ({
      ...prev,
      [packageKey]: !prev[packageKey]
    }));
  };

  // Filtered categories & services based on search query and filterType
  const filteredCategories = useMemo(() => {
    let result = categories;

    if (filterType === "active") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => s.isActive)
      }));
    } else if (filterType === "hidden") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => !s.isActive)
      }));
    } else if (filterType === "zeroPrice") {
      result = result.map(c => ({
        ...c,
        services: (c.services || []).filter((s: any) => (Number(s.credit) || 0) + (Number(s.margin) || 0) === 0)
      }));
    }

    if (!searchQuery.trim()) {
      return result.filter((cat) => (cat.services || []).length > 0);
    }

    const query = searchQuery.trim().toLowerCase();
    return result
      .map((cat) => {
        const matchingServices = (cat.services || []).filter(
          (s: any) =>
            s.name.toLowerCase().includes(query) ||
            s.groupName.toLowerCase().includes(query) ||
            (s.originalName && s.originalName.toLowerCase().includes(query))
        );
        return { ...cat, services: matchingServices };
      })
      .filter((cat) => cat.services.length > 0);
  }, [categories, searchQuery, filterType]);

  // Count zero price services overall
  const zeroPriceCount = useMemo(() => {
    return categories.reduce((total, cat) => {
      return total + (cat.services || []).filter((s: any) => (Number(s.credit) || 0) + (Number(s.margin) || 0) === 0).length;
    }, 0);
  }, [categories]);

  // Group services by groupName
  const getGroupedServices = (services: any[]) => {
    const groups: Record<string, any[]> = {};
    (services || []).forEach((service) => {
      if (!groups[service.groupName]) {
        groups[service.groupName] = [];
      }
      groups[service.groupName].push(service);
    });
    return groups;
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-8 left-8 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 text-surface font-bold ${
            toastMessage.type === "success" ? "bg-primary" : "bg-error"
          }`}
        >
          <span className="material-symbols-outlined text-2xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Enhanced Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                تعديل بيانات وسعر الخدمة
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">اسم الخدمة المعروض للعميل</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">
                    سعر التكلفة / الأساسي ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editCredit}
                    onChange={(e) => setEditCredit(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono transition-all"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">سعر المزود أو التكلفة المخصصة</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">
                    هامش الربح الإضافي ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editMargin}
                    onChange={(e) => setEditMargin(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-mono transition-all"
                  />
                  <span className="text-[10px] text-on-surface-variant mt-1 block">الربح المضاف فوق التكلفة</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">حالة الظهور للعملاء</label>
                <select
                  value={editIsActive ? "true" : "false"}
                  onChange={(e) => setEditIsActive(e.target.value === "true")}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm font-semibold transition-all cursor-pointer"
                >
                  <option value="true">ظاهرة ومتاحة للعملاء في المتجر 🟢</option>
                  <option value="false">مخفية عن العملاء 🔴</option>
                </select>
              </div>

              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant/20 space-y-2">
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>سعر التكلفة:</span>
                  <span className="font-mono font-bold">${(Number(editCredit) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-on-surface-variant">
                  <span>هامش الربح:</span>
                  <span className="font-mono font-bold text-secondary">+${(Number(editMargin) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-primary font-bold pt-2 border-t border-outline-variant/20">
                  <span>السعر الإجمالي النهائي للعميل:</span>
                  <span className="font-mono text-lg font-bold">${((Number(editCredit) || 0) + (Number(editMargin) || 0)).toFixed(2)} USD</span>
                </div>
                {((Number(editCredit) || 0) + (Number(editMargin) || 0)) === 0 && (
                  <p className="text-[11px] text-amber-400 font-bold flex items-center gap-1 pt-1">
                    <span className="material-symbols-outlined text-xs">info</span>
                    تنبيه: السعر الإجمالي 0. ستظهر الخدمة كخدمة مجانية أو بسعر خاص.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSavingEdit ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  حفظ وتطبيق التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="flex-1 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sync Confirmation Modal */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-warning">
              <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning">
                <span className="material-symbols-outlined text-2xl">sync_problem</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">مزامنة وتحديث شامل من المزود</h3>
                <p className="text-xs text-on-surface-variant">تحديث شامل لكافة الأقسام والخدمات والأسعار من Dhru API</p>
              </div>
            </div>

            <div className="space-y-3 my-6 text-sm leading-relaxed text-on-surface-variant">
              <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base">warning</span>
                  تنبيه مهم قبل البدء:
                </p>
                <p>
                  سيقوم هذا الإجراء بمسح جميع الخدمات والأقسام الحالية في قاعدة البيانات، وإعادة جلب كافة الأقسام والخدمات والأسعار المحدثة مباشرة من المزود.
                </p>
              </div>

              <div className="p-4 bg-surface-container-low border border-outline-variant/20 rounded-2xl text-xs space-y-2">
                <p className="text-on-surface font-semibold">ما الذي سيتم تحديثه؟</p>
                <ul className="list-disc list-inside space-y-1 text-on-surface-variant">
                  <li>جلب وتحديث كافة أسعار الخدمات (الخدمات المجانية $0.00 والمدفوعة).</li>
                  <li>إضافة أي خدمات أو باقات جديدة أضافها المزود.</li>
                  <li>تحديث شروط وحقول الطلب المخصصة (Requires Custom).</li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSyncDhruServices}
                disabled={isSyncing}
                className="flex-1 bg-primary text-on-primary py-3 px-4 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSyncing ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                    <span>جاري مسح القديم وجلب الخدمات...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">cloud_sync</span>
                    <span>بدء المزامنة والتحديث الآن</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsSyncModalOpen(false)}
                disabled={isSyncing}
                className="bg-surface-variant text-on-surface-variant hover:text-on-surface px-5 py-3 rounded-xl font-bold transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 border-b border-outline-variant/20 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-on-surface mb-2">إدارة الخدمات والأسعار</h1>
            <p className="text-on-surface-variant text-sm">
              التحكم المباشر في أسعار الخدمات، هوامش الربح، وإظهار أو إخفاء الباقات والخدمات للعملاء.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync from Provider Button */}
            <button
              onClick={() => setIsSyncModalOpen(true)}
              disabled={isSyncing || loading}
              className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="مسح وتحديث الخدمات والأسعار من مزود Dhru"
            >
              <span className={`material-symbols-outlined text-lg ${isSyncing ? "animate-spin" : ""}`}>
                {isSyncing ? "refresh" : "cloud_sync"}
              </span>
              <span>{isSyncing ? "جاري المزامنة..." : "مزامنة كاملة مع المزود"}</span>
            </button>

            {/* Live Search Box */}
            <div className="relative min-w-[240px] sm:min-w-[300px]">
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="بحث بالاسم أو الباقة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-surface-container border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-sm transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-on-surface"
                >
                  مسح
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "all"
                ? "bg-primary text-on-primary shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">view_list</span>
            <span>جميع الخدمات</span>
          </button>

          <button
            onClick={() => setFilterType("active")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "active"
                ? "bg-emerald-500 text-black shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">visibility</span>
            <span>النشطة للعملاء فقط</span>
          </button>

          <button
            onClick={() => setFilterType("hidden")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "hidden"
                ? "bg-amber-500 text-black shadow-md"
                : "bg-surface-container border border-outline-variant/30 text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-sm">visibility_off</span>
            <span>المخفية عن العملاء</span>
          </button>

          <button
            onClick={() => setFilterType("zeroPrice")}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              filterType === "zeroPrice"
                ? "bg-error text-surface shadow-md"
                : "bg-surface-container border border-error/30 text-error hover:bg-error/10"
            }`}
          >
            <span className="material-symbols-outlined text-sm">price_change</span>
            <span>خدمات بسعر 0$ (تحتاج ضبط)</span>
            {zeroPriceCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${filterType === "zeroPrice" ? "bg-black/30 text-white" : "bg-error/20 text-error"}`}>
                {zeroPriceCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="w-full">
        {loading && (
          <div className="flex flex-col items-center justify-center p-16 text-primary bg-surface-container rounded-3xl border border-outline-variant/30 gap-3">
            <span className="material-symbols-outlined animate-spin text-4xl">refresh</span>
            <span className="text-sm font-medium text-on-surface-variant">جاري تحميل قائمة الخدمات...</span>
          </div>
        )}

        {error && (
          <div className="p-4 bg-error/10 text-error rounded-xl border border-error/20 flex items-center gap-2 font-medium">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {!loading && !error && filteredCategories.length === 0 && (
          <div className="p-12 text-center bg-surface-container rounded-3xl border border-outline-variant/30 text-on-surface-variant">
            لم يتم العثور على خدمات مطابقة للبحث أو الفلتر المحدد.
          </div>
        )}

        {!loading && !error && filteredCategories.length > 0 && (
          <div className="space-y-8">
            {filteredCategories.map((category: any, idx: number) => {
              const groupedServices = getGroupedServices(category.services);

              return (
                <div key={idx} className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 md:p-8 shadow-sm">
                  {/* Category Header */}
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-outline-variant/30">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-2xl">
                        {category.name.includes("IMEI")
                          ? "phone_iphone"
                          : category.name.includes("Server")
                          ? "dns"
                          : "remote_access"}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-on-surface">{category.name}</h3>
                      <p className="text-on-surface-variant text-sm mt-1">{category.services.length} خدمة في هذا القسم</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {Object.keys(groupedServices).map((groupName, groupIdx) => {
                      const packageServices = groupedServices[groupName];
                      const packageKey = `${category.id}-${groupName}`;
                      const actionKey = `pkg-${category.id}-${groupName}`;
                      const isExpanded = expandedPackages[packageKey] || false;
                      const visibleServices = isExpanded ? packageServices : packageServices.slice(0, 4);
                      const hiddenCount = packageServices.length - visibleServices.length;

                      const activeServicesCount = packageServices.filter((s: any) => s.isActive).length;
                      const isAllHidden = activeServicesCount === 0;

                      return (
                        <div
                          key={groupIdx}
                          className={`border rounded-2xl p-5 transition-all ${
                            isAllHidden
                              ? "bg-surface-container-lowest/50 border-error/20 opacity-70"
                              : "bg-surface/50 border-outline-variant/20"
                          }`}
                        >
                          {/* Package / Group Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-outline-variant/10">
                            <div className="flex items-center gap-3">
                              <span className={`material-symbols-outlined ${isAllHidden ? "text-error" : "text-secondary"}`}>
                                {isAllHidden ? "folder_off" : "folder"}
                              </span>
                              <div>
                                <h4 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
                                  {groupName}
                                  {isAllHidden && (
                                    <span className="text-[10px] bg-error/15 text-error px-2 py-0.5 rounded-md font-bold">
                                      الباقة بالكامل مخفية
                                    </span>
                                  )}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                                  <span>{packageServices.length} خدمات</span>
                                  <span>•</span>
                                  <span className="text-primary font-medium">{activeServicesCount} نشطة</span>
                                  {packageServices.length - activeServicesCount > 0 && (
                                    <>
                                      <span>•</span>
                                      <span className="text-error font-medium">
                                        {packageServices.length - activeServicesCount} مخفية
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Package Action Button (Hide / Show Entire Group) */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => togglePackageVisibility(groupName, category.id, !isAllHidden)}
                                disabled={actionLoadingKey === actionKey}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm ${
                                  !isAllHidden
                                    ? "bg-error/10 text-error hover:bg-error/20 border border-error/30"
                                    : "bg-primary/15 text-primary hover:bg-primary/25 border border-primary/40"
                                }`}
                                title={!isAllHidden ? "إخفاء كل خدمات هذه الباقة عن العملاء" : "إظهار كل خدمات هذه الباقة للعملاء"}
                              >
                                {actionLoadingKey === actionKey ? (
                                  <span className="material-symbols-outlined animate-spin text-xs">refresh</span>
                                ) : (
                                  <span className="material-symbols-outlined text-xs">
                                    {!isAllHidden ? "visibility_off" : "visibility"}
                                  </span>
                                )}
                                {!isAllHidden ? "إخفاء الباقة بالكامل" : "إظهار الباقة بالكامل"}
                              </button>
                            </div>
                          </div>

                          {/* Services List */}
                          <div className="grid grid-cols-1 gap-3">
                            {visibleServices.map((service: any) => {
                              const srvCost = Number(service.credit) || 0;
                              const srvMargin = Number(service.margin) || 0;
                              const srvTotal = Number((srvCost + srvMargin).toFixed(2));
                              const isZeroPrice = srvTotal === 0;

                              return (
                                <div
                                  key={service.id}
                                  className={`bg-surface p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                    !service.isActive
                                      ? "border-error/30 bg-error/5 opacity-60"
                                      : isZeroPrice
                                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500"
                                      : "border-outline-variant/30 hover:border-primary/50"
                                  }`}
                                >
                                  <div className="space-y-1.5">
                                    <div className="font-bold text-on-surface flex items-center gap-2 text-sm flex-wrap">
                                      <span>{service.name}</span>
                                      {!service.isActive && (
                                        <span className="text-[11px] bg-error/15 text-error px-2 py-0.5 rounded-md font-bold">
                                          مخفي عن العميل
                                        </span>
                                      )}
                                      {isZeroPrice && (
                                        <span className="text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                          <span className="material-symbols-outlined text-xs">warning</span>
                                          السعر $0.00 (يحتاج ضبط)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-4">
                                      <span className="flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-secondary">schedule</span>
                                        {service.time || "1-24 Hours"}
                                      </span>
                                      <span className="text-[11px] text-on-surface-variant font-mono">
                                        سعر التكلفة: ${srvCost.toFixed(2)}
                                      </span>
                                      {srvMargin > 0 && (
                                        <span className="text-[11px] text-secondary font-bold font-mono">
                                          + ربح: ${srvMargin.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 md:min-w-fit justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant/10">
                                    <div className="flex flex-col items-start md:items-end mr-2">
                                      <span className="text-[10px] text-on-surface-variant">السعر للعميل</span>
                                      <div
                                        className={`font-bold text-base font-price-display ${
                                          isZeroPrice ? "text-amber-400" : srvMargin > 0 ? "text-secondary" : "text-primary"
                                        }`}
                                      >
                                        ${srvTotal.toFixed(2)} USD
                                      </div>
                                    </div>

                                    {/* Toggle Single Service Button */}
                                    <button
                                      onClick={() => toggleVisibility(service)}
                                      disabled={actionLoadingKey === service.id}
                                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                                        service.isActive
                                          ? "bg-error/10 text-error hover:bg-error/20 border border-error/20"
                                          : "bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30"
                                      }`}
                                      title={service.isActive ? "إخفاء عن العملاء" : "إظهار للعملاء"}
                                    >
                                      {actionLoadingKey === service.id ? (
                                        <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                                      ) : (
                                        <span className="material-symbols-outlined text-sm">
                                          {service.isActive ? "visibility_off" : "visibility"}
                                        </span>
                                      )}
                                    </button>

                                    {/* Edit Single Service Button */}
                                    <button
                                      onClick={() => handleOpenEdit(service)}
                                      className="bg-surface-variant hover:bg-outline-variant/30 text-on-surface px-3 py-2 rounded-xl font-medium text-xs transition-colors flex items-center gap-1 border border-outline-variant/20"
                                    >
                                      <span className="material-symbols-outlined text-xs">edit</span> تعديل
                                    </button>
                                  </div>
                                </div>
                              );
                            })}

                            {hiddenCount > 0 && !isExpanded && (
                              <button
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2.5 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-primary font-bold text-xs transition-colors flex items-center justify-center gap-2"
                              >
                                عرض جميع الخدمات في هذه الباقة ({hiddenCount} إضافية)...
                                <span className="material-symbols-outlined text-sm">expand_more</span>
                              </button>
                            )}

                            {isExpanded && hiddenCount === 0 && packageServices.length > 4 && (
                              <button
                                onClick={() => togglePackage(packageKey)}
                                className="w-full py-2 mt-2 bg-surface hover:bg-surface-variant border border-dashed border-outline-variant/40 rounded-xl text-on-surface-variant font-bold text-xs transition-colors flex items-center justify-center gap-2"
                              >
                                إخفاء الخدمات الإضافية
                                <span className="material-symbols-outlined text-sm">expand_less</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
