"use client";

import { useState, useEffect, useRef, useCallback, useDeferredValue, useMemo } from "react";
import Link from "next/link";
import {
  filterProviderServicesByType,
  getProviderServiceType,
  getProviderServiceTypeCounts,
  getProviderServiceTypeLabel
} from "../../../../../lib/provider-service-types";
import { loadProviderServicesForBrowse } from "../../../../../lib/provider-service-browse";

type ProviderServiceType = "imei" | "server" | "remote";
type ProviderServiceTypeFilter = "all" | ProviderServiceType;

interface Provider {
  id: string;
  name: string;
  apiUrl: string;
  username?: string | null;
  apiKey: string;
  type: string;
  isActive: boolean;
  balance: number;
  currency: string;
  lastSyncAt?: string | null;
  servicesCount: number;
  mappingRules?: string | null;
  createdAt: string;
}

export function getServiceRequiredFields(service: any): { label: string; type?: string; required?: boolean; options?: string[] }[] {
  const fields: { label: string; type?: string; required?: boolean; options?: string[] }[] = [];

  const raw = service.fields ?? service.requiresCustom ?? service.customFields;
  if (raw) {
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (Array.isArray(parsed)) {
        parsed.forEach((f: any) => {
          if (f.adminonly) return;
          const name = f.fieldname || f.reqid || f.name || f.label || "حقل مخصص";
          const rawOpts = f.options || f.fieldoptions || f.FIELDOPTIONS;
          let opts: string[] = [];
          if (Array.isArray(rawOpts)) opts = rawOpts.map((o: any) => String(o?.value || o || "").trim()).filter(Boolean);
          else if (typeof rawOpts === "string" && rawOpts.trim()) opts = rawOpts.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);

          fields.push({
            label: String(name).replace(/^custom_/, "").trim(),
            type: opts.length > 0 ? "select" : (f.fieldtype || f.type || "text"),
            required: f.required === "1" || f.required === true || f.required === "on",
            options: opts
          });
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        Object.entries(parsed).forEach(([key, val]: [string, any]) => {
          if (val.adminonly) return;
          const name = val.fieldname || val.reqid || val.label || key;
          const rawOpts = val.options || val.fieldoptions || val.FIELDOPTIONS;
          let opts: string[] = [];
          if (Array.isArray(rawOpts)) opts = rawOpts.map((o: any) => String(o?.value || o || "").trim()).filter(Boolean);
          else if (typeof rawOpts === "string" && rawOpts.trim()) opts = rawOpts.split(/[\r\n,|]+/).map(s => s.trim()).filter(Boolean);

          fields.push({
            label: String(name).replace(/^custom_/, "").trim(),
            type: opts.length > 0 ? "select" : (val.fieldtype || val.type || "text"),
            required: val.required === "1" || val.required === true || val.required === "on",
            options: opts
          });
        });
      }
    } catch (e) {}
  }

  // If no custom fields were found, infer standard requirements from category and name
  if (fields.length === 0) {
    const cat = service.category?.name || service.category_name || "";
    const name = (service.name || "").toLowerCase();
    const grp = (service.groupName || service.group_name || "").toLowerCase();

    if (cat.includes("IMEI") || name.includes("imei") || name.includes("sn") || grp.includes("imei") || name.includes("check")) {
      fields.push({ label: "IMEI / Serial Number", type: "number", required: true });
    } else if (cat.includes("Remote") || name.includes("remote") || name.includes("teamviewer") || name.includes("anydesk") || grp.includes("remote")) {
      fields.push({ label: "AnyDesk / TeamViewer ID + Pass", type: "text", required: true });
    } else if (name.includes("pubg") || grp.includes("pubg")) {
      fields.push({ label: "Player ID (معرف اللاعب)", type: "text", required: true });
    } else {
      fields.push({ label: "اسم المستخدم / الإيميل المسجل (Username / Email)", type: "text", required: true });
    }
  }

  return fields;
}

export default function ProvidersClient() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal State for Add / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    apiUrl: "",
    username: "",
    apiKey: "",
    type: "dhru",
    isActive: true,
    mappingRules: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Test Connection in Modal
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; balance?: number; currency?: string } | null>(null);

  // Action Loading States
  const [refreshingBalanceId, setRefreshingBalanceId] = useState<string | null>(null);
  const [syncingProviderId, setSyncingProviderId] = useState<string | null>(null);
  const [deleteModalProvider, setDeleteModalProvider] = useState<Provider | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sync Options Modal
  const [syncModalProvider, setSyncModalProvider] = useState<Provider | null>(null);
  const [syncMode, setSyncMode] = useState<"all"|"selected">("all");
  const [syncConfig, setSyncConfig] = useState({
    markup_percent: 0,
    exchange_rate: 1
  });

  // Browse Services Modal State
  const [browseProvider, setBrowseProvider] = useState<Provider | null>(null);
  const [providerServices, setProviderServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceLoadSource, setServiceLoadSource] = useState<"stored" | "remote" | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const deferredServiceSearch = useDeferredValue(serviceSearch);
  const [packageFilter, setPackageFilter] = useState<"all" | "active" | "hidden">("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<ProviderServiceTypeFilter>("all");
  const [selectedGroupNames, setSelectedGroupNames] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [visibleGroupsLimit, setVisibleGroupsLimit] = useState(25);

  const groupsObserverRef = useRef<IntersectionObserver | null>(null);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/providers", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviders(data.providers || []);
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      showToast("فشل جلب قائمة سيرفرات الـ API", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProviders();
  }, []);

  const openAddModal = () => {
    setEditingProvider(null);
    setFormData({
      name: "",
      apiUrl: "",
      username: "",
      apiKey: "",
      type: "dhru",
      isActive: true,
      mappingRules: ""
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      apiUrl: provider.apiUrl,
      username: provider.username || "",
      apiKey: provider.apiKey,
      type: provider.type || "dhru",
      isActive: provider.isActive !== false,
      mappingRules: provider.mappingRules || ""
    });
    setTestResult(null);
    setIsModalOpen(true);
  };

  const handleTestConnection = async () => {
    if (!formData.apiUrl || !formData.apiKey) {
      showToast("يرجى إدخال رابط ومفتاح الـ API لاختبار الاتصال", "error");
      return;
    }

    setIsTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/providers/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiUrl: formData.apiUrl,
          username: formData.username,
          apiKey: formData.apiKey
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || `الاتصال ناجح! الرصيد: ${data.balance} ${data.currency}`,
          balance: data.balance,
          currency: data.currency
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || "فشل الاتصال بالمزود"
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "تعذر الاتصال بالسيرفر لإجراء الاختبار"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.apiUrl || !formData.apiKey) {
      showToast("يرجى ملء جميع الحقول الإلزامية", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingProvider ? `/api/providers/${editingProvider.id}` : "/api/providers";
      const method = editingProvider ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (editingProvider ? "تم حفظ التعديلات بنجاح!" : "تمت إضافة السيرفر بنجاح!"));
        setIsModalOpen(false);
        await fetchProviders();
      } else {
        showToast(data.error || "حدث خطأ أثناء حفظ البيانات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalProvider) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/providers/${deleteModalProvider.id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم حذف السيرفر بنجاح.");
        setDeleteModalProvider(null);
        await fetchProviders();
      } else {
        showToast(data.error || "فشل حذف السيرفر", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لحذف المزود", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefreshBalance = async (provider: Provider) => {
    setRefreshingBalanceId(provider.id);
    try {
      const res = await fetch(`/api/providers/${provider.id}/balance`, {
        method: "POST"
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تم تحديث الرصيد: ${data.balance.toFixed(2)} USD`);
        setProviders((prev) =>
          prev.map((p) => (p.id === provider.id ? { ...p, balance: data.balance, currency: data.currency } : p))
        );
      } else {
        showToast(data.error || "فشل استرداد رصيد المزود", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بواجهة السيرفر المزود", "error");
    } finally {
      setRefreshingBalanceId(null);
    }
  };

  const openSyncModal = (provider: Provider, mode: "all"|"selected" = "all") => {
    setSyncModalProvider(provider);
    setSyncMode(mode);
    setSyncConfig({
      markup_percent: 0,
      exchange_rate: 1
    });
  };

  const executeSync = async () => {
    if (!syncModalProvider) return;
    const p = syncModalProvider;
    setSyncingProviderId(p.id);
    setSyncModalProvider(null);

    try {
            let endpoint = `/api/providers/${p.id}/sync`;
      let bodyData: any = syncConfig;

      if (syncMode === "selected") {
        endpoint = `/api/providers/${p.id}/import-services`;
        bodyData = {
          ...syncConfig,
          services: providerServices.filter(s => selectedGroupNames.includes(s.groupName))
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || `تمت المزامنة بنجاح! تم جلب وتحديث ${data.count} خدمة.`);
        await fetchProviders();
        if (browseProvider && browseProvider.id === p.id) {
          await handleBrowseServices(p);
        }
      } else {
        showToast(data.error || "فشلت المزامنة من المزود", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر لمزامنة الخدمات", "error");
    } finally {
      setSyncingProviderId(null);
    }
  };

  const handleBrowseServices = async (provider: Provider) => {
    setBrowseProvider(provider);
    setLoadingServices(true);
    setServiceLoadSource(null);
    setServiceSearch("");
    setPackageFilter("all");
    setSelectedGroupNames([]);
    setExpandedGroups({});
    setServiceTypeFilter("all");
    setVisibleGroupsLimit(25);
    try {
      const result = await loadProviderServicesForBrowse(provider.id, async (url: string) => {
        const res = await fetch(url, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));
        return { ok: res.ok, data };
      });
      setProviderServices(result.services);
      setServiceLoadSource(result.source);
      setProviders((current) => current.map((item) => (
        item.id === provider.id ? { ...item, servicesCount: result.services.length } : item
      )));
    } catch (error) {
      setProviderServices([]);
      setServiceLoadSource(null);
      showToast(error instanceof Error ? error.message : "فشل جلب خدمات المزود", "error");
    } finally {
      setLoadingServices(false);
    }
  };

  const serviceTypeCounts = useMemo(
    () => getProviderServiceTypeCounts(providerServices),
    [providerServices]
  );

  const typeFilteredProviderServices = useMemo(
    () => filterProviderServicesByType(providerServices, serviceTypeFilter),
    [providerServices, serviceTypeFilter]
  );

  // Group services by groupName (Package)
  const groupedPackages = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const s of typeFilteredProviderServices) {
      const g = s.groupName || "باقة عامة";
      if (!map[g]) map[g] = [];
      map[g].push(s);
    }

    const groupsArray = Object.entries(map).map(([groupName, services]) => {
      const activeCount = services.filter((s) => s.isActive).length;
      const isStoredData = serviceLoadSource === "stored";
      const isAllActive = isStoredData && activeCount === services.length;
      const isAllHidden = isStoredData && activeCount === 0;

      return {
        groupName,
        services,
        serviceTypes: Array.from(new Set(services.map((service) => getProviderServiceType(service)))),
        total: services.length,
        activeCount,
        isAllActive,
        isAllHidden
      };
    });

    groupsArray.sort((a, b) => a.groupName.localeCompare(b.groupName, "ar"));
    return groupsArray;
  }, [serviceLoadSource, typeFilteredProviderServices]);

  // Filter groups according to search and status filter
  const filteredGroups = useMemo(() => {
    let list = groupedPackages;

    if (packageFilter === "active") {
      list = list.filter((g) => g.activeCount > 0);
    } else if (packageFilter === "hidden") {
      list = list.filter((g) => g.isAllHidden);
    }

    if (!deferredServiceSearch.trim()) return list;

    const q = deferredServiceSearch.trim().toLowerCase();
    return list
      .map((g) => {
        const matchesGroupName = g.groupName.toLowerCase().includes(q);
        if (matchesGroupName) return g;

        const matchingServices = g.services.filter((s) => {
          const nameMatch = s.name.toLowerCase().includes(q) || s.originalName?.toLowerCase().includes(q);
          const customFields = getServiceRequiredFields(s);
          const fieldMatch = customFields.some(f => f.label.toLowerCase().includes(q));
          return nameMatch || fieldMatch;
        });

        if (matchingServices.length > 0) {
          return {
            ...g,
            services: matchingServices
          };
        }
        return null;
      })
      .filter((g): g is NonNullable<typeof g> => g !== null);
  }, [deferredServiceSearch, groupedPackages, packageFilter]);

  const totalFilteredServicesCount = useMemo(() => {
    return filteredGroups.reduce((acc, g) => acc + g.services.length, 0);
  }, [filteredGroups]);

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const toggleGroupSelection = (groupName: string) => {
    setSelectedGroupNames((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName]
    );
  };

  const handleSelectAllGroups = () => {
    if (selectedGroupNames.length === filteredGroups.length) {
      setSelectedGroupNames([]);
    } else {
      setSelectedGroupNames(filteredGroups.map((g) => g.groupName));
    }
  };

  // Toggle single package visibility
  const handleToggleSinglePackage = async (groupName: string, nextActive: boolean) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("هذه معاينة مباشرة. قم بالمزامنة أولاً لحفظ الباقة والتحكم في ظهورها.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupNames: [groupName], isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (nextActive ? `تم إظهار باقة (${groupName})` : `تم إخفاء باقة (${groupName})`));
        setProviderServices((prev) =>
          prev.map((s) => (s.groupName === groupName ? { ...s, isActive: nextActive } : s))
        );
      } else {
        showToast(data.error || "فشل تغيير حالة الباقة", "error");
      }
    } catch {
      showToast("حدث خطأ في الاتصال بالسيرفر", "error");
    }
  };

  // Bulk toggle for selected packages
  const handleBulkToggleSelectedPackages = async (nextActive: boolean) => {
    if (!browseProvider || selectedGroupNames.length === 0) return;
    if (serviceLoadSource !== "stored") {
      showToast("قم بالمزامنة أولاً قبل تعديل الباقات.", "error");
      return;
    }
    setIsPerformingBulkAction(true);
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupNames: selectedGroupNames, isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم تحديث حالة الباقات المحددة بنجاح!");
        setProviderServices((prev) =>
          prev.map((s) => (selectedGroupNames.includes(s.groupName) ? { ...s, isActive: nextActive } : s))
        );
        setSelectedGroupNames([]);
      } else {
        showToast(data.error || "فشل تحديث الباقات المحددة", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  // Make ALL services of this provider visible or hidden
  const handleToggleAllServices = async (nextActive: boolean) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("قم بالمزامنة أولاً قبل تفعيل أو إخفاء الخدمات.", "error");
      return;
    }
    setIsPerformingBulkAction(true);
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || (nextActive ? "تم تفعيل وإظهار كافة الخدمات في المتجر!" : "تم إخفاء كافة الخدمات عن المتجر"));
        setProviderServices((prev) => prev.map((s) => ({ ...s, isActive: nextActive })));
      } else {
        showToast(data.error || "فشل تحديث الخدمات", "error");
      }
    } catch {
      showToast("تعذر الاتصال بالسيرفر", "error");
    } finally {
      setIsPerformingBulkAction(false);
    }
  };

  // Toggle single service visibility
  const handleToggleSingleService = async (service: any) => {
    if (!browseProvider) return;
    if (serviceLoadSource !== "stored") {
      showToast("هذه الخدمة معروضة مباشرة من المزود. قم بالمزامنة أولاً للتحكم بها.", "error");
      return;
    }
    const nextActive = !service.isActive;
    try {
      const res = await fetch(`/api/providers/${browseProvider.id}/toggle-service`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId: service.id, isActive: nextActive })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProviderServices((prev) =>
          prev.map((s) => (s.id === service.id ? { ...s, isActive: nextActive } : s))
        );
        showToast(nextActive ? `تم إظهار (${service.name}) للعملاء` : `تم إخفاء (${service.name}) عن العملاء`);
      } else {
        showToast(data.error || "فشل تعديل الخدمة", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء الاتصال بالسيرفر", "error");
    }
  };

  const visibleGroups = filteredGroups.slice(0, visibleGroupsLimit);

  const lastGroupElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loadingServices) return;
    if (groupsObserverRef.current) groupsObserverRef.current.disconnect();

    groupsObserverRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && visibleGroupsLimit < filteredGroups.length) {
        setVisibleGroupsLimit((prev) => prev + 25);
      }
    });

    if (node) groupsObserverRef.current.observe(node);
  }, [loadingServices, visibleGroupsLimit, filteredGroups.length]);

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto" dir="rtl">
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

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant/20 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-3xl">dns</span>
            <span>إدارة ومزودي الـ API (Providers)</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm mt-1">
            إضافة وإدارة سيرفرات المزودين لربط المنتجات وسحب الخدمات وتنفيذ طلبات العملاء تلقائياً.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-primary to-secondary text-on-primary text-sm font-bold shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <span className="material-symbols-outlined text-xl">add_circle</span>
          <span>إضافة مزود جديد</span>
        </button>
      </div>

      {/* Providers List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-on-surface-variant">
          <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-medium">جاري تحميل سيرفرات الـ API المربوطة...</span>
        </div>
      ) : providers.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl border border-outline-variant/30 text-center space-y-4">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/40">dns</span>
          <h3 className="text-lg font-bold text-on-surface">لا يوجد سيرفرات مربوطة حالياً</h3>
          <p className="text-xs text-on-surface-variant max-w-md mx-auto">
            قم بإضافة سيرفر الـ API ومفتاح الوصول لبدء سحب الخدمات وتنفيذ الطلبات تلقائياً.
          </p>
          <button
            onClick={openAddModal}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-md"
          >
            إضافة مزود جديد
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {providers.map((provider) => {
            const isRefreshing = refreshingBalanceId === provider.id;
            const isSyncing = syncingProviderId === provider.id;

            return (
              <div
                key={provider.id}
                className="glass-card p-6 rounded-3xl border border-outline-variant/30 hover:border-primary/40 transition-all shadow-xl bg-surface-container/30 flex flex-col gap-4"
              >
                {/* Top Row: Info & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-2xl shrink-0">
                      <span className="material-symbols-outlined text-3xl">dns</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-lg font-bold text-on-surface font-display">{provider.name}</h3>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                            provider.isActive
                              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                              : "bg-red-500/15 text-red-400 border-red-500/30"
                          }`}
                        >
                          {provider.isActive ? "نشط" : "معطل"}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono">
                          {provider.type === "dhru" ? "Dhru Fusion API" : "Dynamic Mapper"}
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant font-mono mt-1 text-left dir-ltr truncate max-w-sm sm:max-w-md">
                        {provider.apiUrl}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => openEditModal(provider)}
                      className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 border border-outline-variant/20"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                      <span>تعديل</span>
                    </button>

                    <button
                      onClick={() => setDeleteModalProvider(provider)}
                      className="px-3.5 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all flex items-center gap-1.5 border border-red-500/20"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      <span>حذف</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Balance, Services count & Sync Tools */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/20">
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div>
                      <div className="text-[11px] text-on-surface-variant font-bold mb-0.5">رصيد الحساب المتاح في السيرفر</div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-primary font-mono">
                          {(provider.balance || 0).toFixed(2)} {provider.currency || "USD"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRefreshBalance(provider)}
                      disabled={isRefreshing}
                      className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-1 disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${isRefreshing ? "animate-spin" : ""}`}>
                        refresh
                      </span>
                      <span>{isRefreshing ? "جاري التحديث..." : "تحديث الرصيد"}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2.5 flex-wrap">
                    <button
                      onClick={() => handleBrowseServices(provider)}
                      className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold transition-all flex items-center gap-1.5 border border-outline-variant/30"
                    >
                      <span className="material-symbols-outlined text-sm text-primary">search</span>
                      <span>استعراض الخدمات ({provider.servicesCount || 0})</span>
                    </button>

                    <button
                      onClick={() => openSyncModal(provider)}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-sm ${isSyncing ? "animate-spin" : ""}`}>
                        {isSyncing ? "refresh" : "sync"}
                      </span>
                      <span>{isSyncing ? "جاري المزامنة..." : "مزامنة تلقائية"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD / EDIT PROVIDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  {editingProvider ? "edit_square" : "add_box"}
                </span>
                <span>{editingProvider ? "تعديل بيانات المزود" : "إضافة مزود API جديد"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">اسم المزود:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عرب تك برو سيرفر أو GsmServer"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-bold text-on-surface transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                  رابط الـ API (URL):
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://server-domain.com/api/index.php"
                  value={formData.apiUrl}
                  onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    اسم المستخدم (Username):
                  </label>
                  <input
                    type="text"
                    placeholder="Username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-1.5">
                    مفتاح الـ API (API Key / Access Key):
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="API Key"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1.5">نوع النظام والبروتوكول:</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none text-xs font-bold text-on-surface transition-all cursor-pointer"
                >
                  <option value="dhru">قياسي (Dhru Fusion / PerfectPanel / GSM Standard)</option>
                  <option value="dynamic">مخصص (Dynamic Mapper - ربط ديناميكي)</option>
                </select>
              </div>

              {formData.type === "dynamic" && (
                <div>
                  <label className="block text-xs font-bold text-primary mb-1.5">
                    إعدادات الربط الديناميكي (JSON Mapping Rules):
                  </label>
                  <textarea
                    rows={4}
                    placeholder='{"sync_endpoint": "/services", "map_array_path": "data"}'
                    value={formData.mappingRules}
                    onChange={(e) => setFormData({ ...formData, mappingRules: e.target.value })}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-primary/40 rounded-xl focus:border-primary outline-none text-xs font-mono text-on-surface text-left dir-ltr transition-all"
                  />
                </div>
              )}

              {/* TEST CONNECTION BUTTON & STATUS */}
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">network_ping</span>
                    <span>اختبار الاتصال بالسيرفر</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !formData.apiUrl || !formData.apiKey}
                    className="px-3.5 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 border border-primary/30"
                  >
                    <span className={`material-symbols-outlined text-sm ${isTestingConnection ? "animate-spin" : ""}`}>
                      {isTestingConnection ? "refresh" : "sensors"}
                    </span>
                    <span>{isTestingConnection ? "جاري الاختبار..." : "فحص الاتصال والرصيد"}</span>
                  </button>
                </div>

                {testResult && (
                  <div
                    className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                      testResult.success
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/10 border border-red-500/30 text-red-400"
                    }`}
                  >
                    <span className="material-symbols-outlined text-base">
                      {testResult.success ? "check_circle" : "error"}
                    </span>
                    <span>{testResult.message}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <input
                  id="providerActiveToggle"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label htmlFor="providerActiveToggle" className="text-xs font-bold text-emerald-400 cursor-pointer select-none">
                  تفعيل السيرفر واستقبال وتنفيذ الطلبات والتفعيلات آلياً
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3.5 rounded-xl font-bold text-xs hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">save</span>
                  )}
                  <span>حفظ بيانات المزود</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3.5 rounded-xl font-bold text-xs transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SYNC CONFIG MODAL */}
      {syncModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">sync</span>
                <span>مزامنة خدمات: {syncModalProvider.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setSyncModalProvider(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-on-surface-variant leading-relaxed">
                سيتم جلب قوائم IMEI وServer وRemote تلقائياً، ثم اعتماد النوع المرسل داخل بيانات كل خدمة وحفظه للفلترة والتنفيذ الصحيح.
                <br /><br />
                <span className="font-bold text-amber-500">تنبيه هام:</span> يرجى التأكد من إضافة عناوين IP السيرفر الخاص بك في إعدادات API لدى المزود (WhiteList IP) قبل المزامنة لتجنب رفض الاتصال:
                <div className="mt-1 flex flex-col gap-1">
                  <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[11px] text-left dir-ltr w-fit">186.240.155.152</code>
                  <code className="bg-surface-container-highest px-1.5 py-0.5 rounded text-primary text-[11px] text-left dir-ltr w-fit">2c0f:fc89:5e:8063:b178:82be:2580:b934</code>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1.5">
                  نسبة هامش الربح المضافة على التكلفة (%):
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={syncConfig.markup_percent}
                  onChange={(e) => setSyncConfig({ ...syncConfig, markup_percent: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-bold text-on-surface text-left dir-ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface-variant mb-1.5">
                  معامل تحويل العملة (Exchange Rate):
                </label>
                <input
                  type="number"
                  min="0.001"
                  step="0.01"
                  value={syncConfig.exchange_rate}
                  onChange={(e) => setSyncConfig({ ...syncConfig, exchange_rate: parseFloat(e.target.value) || 1 })}
                  className="w-full px-4 py-2.5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-primary outline-none font-bold text-on-surface text-left dir-ltr"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={executeSync}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary py-3 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                <span>بدء المزامنة الآن</span>
              </button>
              <button
                type="button"
                onClick={() => setSyncModalProvider(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteModalProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-surface-container border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">delete_forever</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">حذف المزود</h3>
                <p className="text-xs text-red-400 font-semibold">{deleteModalProvider.name}</p>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              هل أنت متأكد من رغبتك في إزالة هذا المزود من قائمة الربط؟ لن يتم إرسال طلبات جديدة إليه بعد الحذف.
            </p>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                {isDeleting ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">delete</span>
                )}
                <span>تأكيد الحذف</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteModalProvider(null)}
                className="px-5 bg-surface-variant text-on-surface-variant hover:text-on-surface py-3 rounded-xl font-bold text-xs transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPGRADED BROWSE SERVICES & PACKAGES MODAL WITH REQUIRED FIELDS */}
      {browseProvider && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
          <div className="bg-surface-container border border-outline-variant/30 rounded-3xl p-5 sm:p-7 max-w-4xl w-full shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                    <span>خدمات وباقات المزود:</span>
                    <span className="text-primary font-display">{browseProvider.name}</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {filteredGroups.length} باقة مسجلة • {totalFilteredServicesCount} خدمة متاحة مع تفاصيل حقول الطلب
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBrowseProvider(null)}
                className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {/* Quick Bulk Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                {serviceLoadSource === "stored" && (
                  <>
                    {/* Make All Visible Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAllServices(true)}
                      disabled={isPerformingBulkAction || loadingServices}
                      className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      title="تفعيل وإظهار كافة خدمات وباقات هذا المزود للعملاء في المتجر"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>إظهار وتفعيل كل الخدمات للعملاء</span>
                    </button>

                    {/* Hide All Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleAllServices(false)}
                      disabled={isPerformingBulkAction || loadingServices}
                      className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface font-bold transition-all flex items-center gap-1 border border-outline-variant/20 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">visibility_off</span>
                      <span>إخفاء الكل</span>
                    </button>
                  </>
                )}
                {serviceLoadSource !== "stored" && (
                  <div className="flex items-center gap-2 text-primary bg-primary/10 px-3 py-1.5 rounded-xl font-bold">
                    <span className="material-symbols-outlined text-sm">info</span>
                    <span>حدد الباقات التي تريد استيرادها أو انقر على استيراد بجانب كل باقة.</span>
                  </div>
                )}

                {/* Show Selected Packages Button */}
                {selectedGroupNames.length > 0 && (
                  <>
                    {serviceLoadSource === "stored" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleBulkToggleSelectedPackages(true)}
                          disabled={isPerformingBulkAction}
                          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-sm">check_box</span>
                          <span>إظهار الباقات المحددة ({selectedGroupNames.length})</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleBulkToggleSelectedPackages(false)}
                          disabled={isPerformingBulkAction}
                          className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 font-bold transition-all flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">visibility_off</span>
                          <span>إخفاء الباقات المحددة ({selectedGroupNames.length})</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openSyncModal(browseProvider, "selected")}
                        className="px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="material-symbols-outlined text-sm">cloud_download</span>
                        <span>استيراد الباقات المحددة ({selectedGroupNames.length})</span>
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openSyncModal(browseProvider)}
                  disabled={syncingProviderId === browseProvider.id}
                  className="px-3 py-1.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold transition-all flex items-center gap-1 border border-outline-variant/30 disabled:opacity-50 text-[11px]"
                >
                  <span className={`material-symbols-outlined text-xs text-primary ${syncingProviderId === browseProvider.id ? "animate-spin" : ""}`}>
                    sync
                  </span>
                  <span>مزامنة من المزود</span>
                </button>
              </div>
            </div>

            {serviceLoadSource === "remote" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-xs">
                <div className="flex items-start gap-2 text-sky-300">
                  <span className="material-symbols-outlined text-lg shrink-0">cloud_download</span>
                  <div>
                    <p className="font-bold text-sky-300">معاينة مباشرة من المزود</p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      ظهرت الخدمات بدون مزامنة. للموافقة عليها والتحكم في إظهارها بالمتجر اضغط مزامنة من المزود.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openSyncModal(browseProvider)}
                  className="px-3 py-2 rounded-xl bg-sky-500 text-white font-bold whitespace-nowrap hover:bg-sky-600 transition-all"
                >
                  مزامنة وحفظ الخدمات
                </button>
              </div>
            )}

            {/* Real Provider Service Type Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/20">
              {([
                { type: "all", label: "كل الأقسام", count: serviceTypeCounts.all, icon: "apps" },
                { type: "imei", label: "IMEI", count: serviceTypeCounts.imei, icon: "fingerprint" },
                { type: "server", label: "Server", count: serviceTypeCounts.server, icon: "dns" },
                { type: "remote", label: "Remote", count: serviceTypeCounts.remote, icon: "settings_remote" }
              ] as const).map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => {
                    setServiceTypeFilter(option.type);
                    setSelectedGroupNames([]);
                    setExpandedGroups({});
                    setVisibleGroupsLimit(25);
                  }}
                  className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    serviceTypeFilter === option.type
                      ? "bg-primary text-on-primary border-primary shadow"
                      : "bg-surface-container-high border-outline-variant/20 text-on-surface-variant hover:text-on-surface hover:border-primary/30"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">{option.icon}</span>
                  <span>{option.label}</span>
                  <span className={`font-mono px-1.5 py-0.5 rounded-md ${
                    serviceTypeFilter === option.type ? "bg-black/15" : "bg-surface-container-highest"
                  }`}>
                    {option.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search & Filter Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Search Box */}
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  search
                </span>
                <input
                  type="text"
                  placeholder="بحث باسم الباقة أو الخدمة أو الحقل المطلوب..."
                  value={serviceSearch}
                  onChange={(e) => {
                    setServiceSearch(e.target.value);
                    setVisibleGroupsLimit(25);
                  }}
                  className="w-full pr-9 pl-4 py-2.5 bg-surface-container-lowest border border-outline-variant/30 rounded-xl focus:border-primary outline-none text-xs text-on-surface"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPackageFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    packageFilter === "all"
                      ? "bg-primary text-on-primary shadow"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  الكل ({groupedPackages.length})
                </button>
                <button
                  type="button"
                  onClick={() => setPackageFilter("active")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    packageFilter === "active"
                      ? "bg-emerald-500 text-white shadow"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  النشطة في المتجر
                </button>
                <button
                  type="button"
                  onClick={() => setPackageFilter("hidden")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    packageFilter === "hidden"
                      ? "bg-amber-500 text-black shadow"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  المخفية بالكامل
                </button>
              </div>
            </div>

            {/* Select All Checkbox Row */}
            {filteredGroups.length > 0 && (
              <div className="flex items-center justify-between px-2 text-xs text-on-surface-variant">
                <label className="flex items-center gap-2 cursor-pointer font-bold select-none">
                  <input
                      type="checkbox"
                      checked={selectedGroupNames.length > 0 && selectedGroupNames.length === filteredGroups.length}
                    onChange={handleSelectAllGroups}
                    className="w-4 h-4 accent-primary cursor-pointer"
                  />
                  <span>تحديد كل الباقات المعروضة ({filteredGroups.length} باقة)</span>
                </label>
                {selectedGroupNames.length > 0 && (
                  <span className="text-primary font-bold">{selectedGroupNames.length} باقة محددة</span>
                )}
              </div>
            )}

            {/* Grouped Packages & Services List */}
            <div className="overflow-y-auto flex-1 space-y-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3">
              {loadingServices ? (
                <div className="p-16 text-center text-on-surface-variant text-xs flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></span>
                  <span>جاري تنظيم وجلب باقات وخدمات المزود...</span>
                </div>
              ) : filteredGroups.length === 0 ? (
                <div className="p-16 text-center text-on-surface-variant text-xs space-y-3">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">category</span>
                  <p className="font-bold text-on-surface text-sm">لا توجد باقات أو خدمات مطابقة للبحث.</p>
                </div>
              ) : (
                <>
                  {visibleGroups.map((group, gIdx) => {
                    const isSelected = selectedGroupNames.includes(group.groupName);
                    const isExpanded = expandedGroups[group.groupName] ?? false;

                    return (
                      <div
                        key={group.groupName}
                        ref={gIdx === visibleGroups.length - 1 ? lastGroupElementRef : null}
                        className={`rounded-2xl border transition-all overflow-hidden ${
                          group.isAllHidden
                            ? "bg-surface-container-high/30 border-outline-variant/20 opacity-75"
                            : "bg-surface-container/50 border-outline-variant/30 hover:border-primary/40"
                        }`}
                      >
                        {/* Package Header Card */}
                        <div className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-high/40 border-b border-outline-variant/15">
                          <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isSelected}
                              onChange={() => toggleGroupSelection(group.groupName)}
                              className="w-4 h-4 accent-primary cursor-pointer shrink-0"
                            />

                            <div className="cursor-pointer" onClick={() => toggleGroupExpand(group.groupName)}>
                              <div className="font-bold text-on-surface text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                                <span>{group.groupName}</span>
                                {group.serviceTypes.map((serviceType: string) => (
                                  <span
                                    key={serviceType}
                                    className="text-[9px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono"
                                  >
                                    {getProviderServiceTypeLabel(serviceType)}
                                  </span>
                                ))}
                                {group.isAllHidden ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/15 text-red-400 font-bold border border-red-500/20">
                                    مخفية عن المتجر
                                  </span>
                                ) : group.isAllActive ? (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                                    ظاهرة بالكامل للعملاء
                                  </span>
                                ) : (
                                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-bold border border-amber-500/20">
                                    ظهور جزئي ({group.activeCount}/{group.total})
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-on-surface-variant mt-0.5 flex items-center gap-2">
                                <span>{group.total} خدمة في هذه الباقة</span>
                                <span>•</span>
                                <span className="text-primary font-medium">{group.activeCount} نشطة</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center">
                            {/* Package Visibility Toggle Button */}
                            <button
                              type="button"
                              disabled={serviceLoadSource !== "stored"}
                              onClick={() => handleToggleSinglePackage(group.groupName, !group.isAllActive)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 border disabled:opacity-40 disabled:cursor-not-allowed ${
                                group.isAllActive
                                  ? "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20"
                                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/20"
                              }`}
                              title={group.isAllActive ? "إخفاء كل خدمات هذه الباقة عن المتجر" : "إظهار كل خدمات هذه الباقة للعملاء"}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {group.isAllActive ? "visibility_off" : "visibility"}
                              </span>
                              <span>{group.isAllActive ? "إخفاء الباقة" : "إظهار الباقة"}</span>
                            </button>

                            {/* Expand / Collapse Button */}
                            <button
                              type="button"
                              onClick={() => toggleGroupExpand(group.groupName)}
                              className="px-2.5 py-1.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface-variant hover:text-on-surface text-xs font-bold transition-all flex items-center gap-1 border border-outline-variant/20"
                            >
                              <span>{isExpanded ? "طي" : "عرض الخدمات"}</span>
                              <span className="material-symbols-outlined text-sm">
                                {isExpanded ? "expand_less" : "expand_more"}
                              </span>
                            </button>
                          </div>
                        </div>

                        {/* Services Under this Package */}
                        {isExpanded && (
                          <div className="divide-y divide-outline-variant/10 bg-surface/60">
                            {group.services.map((srv) => {
                              const reqFields = getServiceRequiredFields(srv);

                              return (
                                <div
                                  key={srv.id}
                                  className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                                    !srv.isActive ? "bg-red-500/5 opacity-70" : "hover:bg-surface-container-high/30"
                                  }`}
                                >
                                  <div className="space-y-1.5 flex-1">
                                    <div className="font-bold text-on-surface text-xs flex items-center gap-2 flex-wrap">
                                      <span>{srv.name}</span>
                                      <span className="text-[9px] px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-mono">
                                        {getProviderServiceTypeLabel(getProviderServiceType(srv))}
                                      </span>
                                      {!srv.isActive && (
                                        <span className="text-[10px] bg-red-500/15 text-red-400 px-1.5 py-0.2 rounded font-semibold">
                                          مخفية
                                        </span>
                                      )}
                                    </div>

                                    {/* Cost & Delivery Time */}
                                    <div className="text-[10px] text-on-surface-variant flex items-center gap-3">
                                      <span className="font-mono text-primary font-bold">
                                        التكلفة: ${(srv.credit || 0).toFixed(2)}
                                      </span>
                                      <span>•</span>
                                      <span>وقت التسليم: {srv.time || "1-24h"}</span>
                                    </div>

                                    {/* REQUIRED INPUT FIELDS BADGES */}
                                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                      <span className="text-[10px] text-on-surface-variant font-bold flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs text-secondary">input</span>
                                        <span>الحقول المطلوبة من العميل للمزود:</span>
                                      </span>

                                      {reqFields.map((rf, rfIdx) => (
                                        <span
                                          key={rfIdx}
                                          className="text-[10px] px-2 py-0.5 rounded-lg bg-surface-container-high border border-primary/30 text-primary font-bold flex items-center gap-1 shadow-2xs font-mono"
                                          title={rf.options && rf.options.length > 0 ? `خيارات: ${rf.options.join(" | ")}` : rf.label}
                                        >
                                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                                          <span>{rf.label}</span>
                                          {rf.options && rf.options.length > 0 && (
                                            <span className="text-[9px] bg-primary/20 text-primary px-1 rounded">
                                              {rf.options.length} خيارات
                                            </span>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 self-end sm:self-center">
                                    {serviceLoadSource !== "stored" ? (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showToast("يرجى استيراد الباقة أولاً لتتمكن من تفعيل أو إخفاء خدماتها.", "error");
                                        }}
                                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/20"
                                        title="يجب استيراد الباقة أولاً"
                                      >
                                        <span className="material-symbols-outlined text-xs">info</span>
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isPerformingBulkAction}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleSingleService(srv);
                                        }}
                                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                                          srv.isActive
                                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 border border-emerald-500/20"
                                            : "bg-red-500/10 text-red-400 hover:bg-emerald-500/10 hover:text-emerald-400 border border-red-500/20"
                                        }`}
                                        title={srv.isActive ? "إخفاء عن المتجر" : "إظهار في المتجر"}
                                      >
                                        <span className="material-symbols-outlined text-xs">
                                          {srv.isActive ? "visibility" : "visibility_off"}
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {visibleGroupsLimit < filteredGroups.length && (
                    <div className="p-3 text-center text-xs text-on-surface-variant">
                      جاري تحميل المزيد من الباقات مع التمرير ({visibleGroupsLimit} من أصل {filteredGroups.length})...
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Bottom Bar */}
            <div className="flex justify-between items-center pt-2">
              <Link
                href="/admin/services"
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                <span>الانتقال لصفحة تعديل الأسعار وهوامش الربح لكافة الخدمات</span>
              </Link>
              <button
                type="button"
                onClick={() => setBrowseProvider(null)}
                className="px-5 py-2 rounded-xl bg-surface-variant text-on-surface-variant hover:text-on-surface text-xs font-bold"
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
