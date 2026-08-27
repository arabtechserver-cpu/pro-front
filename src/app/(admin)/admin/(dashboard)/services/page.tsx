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
  const [editMargin, setEditMargin] = useState<number>(0);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

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
    setEditName(service.name);
    setEditMargin(service.margin || 0);
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
          margin: editMargin
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCategories((prev) =>
          prev.map((cat) => ({
            ...cat,
            services: cat.services.map((s: any) =>
              s.id === editingService.id ? { ...s, name: editName, margin: Number(editMargin) } : s
            )
          }))
        );
        showToast("تم حفظ تعديلات الخدمة بنجاح!");
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

  // Filtered categories & services based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;

    const query = searchQuery.trim().toLowerCase();
    return categories
      .map((cat) => {
        const matchingServices = cat.services.filter(
          (s: any) =>
            s.name.toLowerCase().includes(query) ||
            s.groupName.toLowerCase().includes(query) ||
            (s.originalName && s.originalName.toLowerCase().includes(query))
        );
        return { ...cat, services: matchingServices };
      })
      .filter((cat) => cat.services.length > 0);
  }, [categories, searchQuery]);

  // Group services by groupName
  const getGroupedServices = (services: any[]) => {
    const groups: Record<string, any[]> = {};
    services.forEach((service) => {
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

      {/* Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_square</span>
                تعديل بيانات الخدمة
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

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">هامش الربح الإضافي ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editMargin}
                  onChange={(e) => setEditMargin(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 bg-surface border border-outline-variant/50 rounded-xl focus:border-primary outline-none text-sm transition-all"
                />
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/20 mt-3 space-y-1">
                  <p className="text-xs text-on-surface-variant flex justify-between">
                    <span>التكلفة الأصلية (Dhru API):</span>
                    <span className="font-mono font-bold">${editingService.credit?.toFixed(2) || "0.00"}</span>
                  </p>
                  <p className="text-xs text-primary font-bold flex justify-between pt-1 border-t border-outline-variant/10">
                    <span>السعر الإجمالي للعميل:</span>
                    <span className="font-mono text-base">${((editingService.credit || 0) + Number(editMargin || 0)).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="flex-1 bg-primary text-on-primary py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSavingEdit ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  حفظ التعديلات
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

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-on-surface mb-2">إدارة الخدمات والأسعار</h1>
          <p className="text-on-surface-variant text-sm">
            التحكم المباشر في إظهار وإخفاء الباقات والخدمات للعملاء، وتعديل المسميات وهامش الربح.
          </p>
        </div>

        {/* Live Search Box */}
        <div className="relative min-w-[280px] sm:min-w-[340px]">
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
            لم يتم العثور على خدمات مطابقة للبحث.
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
                            {visibleServices.map((service: any) => (
                              <div
                                key={service.id}
                                className={`bg-surface p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                                  service.isActive
                                    ? "border-outline-variant/30 hover:border-primary/50"
                                    : "border-error/30 bg-error/5 opacity-60"
                                }`}
                              >
                                <div className="space-y-1.5">
                                  <div className="font-bold text-on-surface flex items-center gap-2 text-sm">
                                    {service.name}
                                    {!service.isActive && (
                                      <span className="text-[11px] bg-error/15 text-error px-2 py-0.5 rounded-md font-bold">
                                        مخفي عن العميل
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-on-surface-variant flex flex-wrap items-center gap-4">
                                    <span className="flex items-center gap-1">
                                      <span className="material-symbols-outlined text-xs text-secondary">schedule</span>
                                      {service.time || "1-24 Hours"}
                                    </span>
                                    <span className="text-[11px] text-on-surface-variant font-mono">
                                      سعر المزود: ${service.credit?.toFixed(2) || "0.00"}
                                    </span>
                                    {service.margin > 0 && (
                                      <span className="text-[11px] text-secondary font-bold font-mono">
                                        + ربح: ${service.margin?.toFixed(2)}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 md:min-w-fit justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-outline-variant/10">
                                  <div className="flex flex-col items-start md:items-end mr-2">
                                    <span className="text-[10px] text-on-surface-variant">السعر للعميل</span>
                                    <div
                                      className={`font-bold text-base font-price-display ${
                                        service.margin > 0 ? "text-secondary" : "text-primary"
                                      }`}
                                    >
                                      ${((service.credit || 0) + (service.margin || 0)).toFixed(2)}
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
                            ))}

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
