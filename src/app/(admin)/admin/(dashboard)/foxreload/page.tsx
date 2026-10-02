"use client";

import { useState, useEffect, useMemo } from "react";

interface BalanceItem {
  currency: string;
  amount: number;
}

interface FoxreloadSettings {
  apiKey: string;
  isEnabled: boolean;
  defaultProfitMarginPercent: number;
  autoFulfill: boolean;
  hiddenItems: string[];
  customPrices: Record<string, number>;
  customMargins: Record<string, number>;
}

interface FoxreloadRegion {
  id: string;
  slug: string;
  name: string;
  inStockCount: number;
  hasProducts: boolean;
  bestOfferPrice?: string | null;
}

interface FoxreloadBundle {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  inStockCount: number;
  imagePath?: string | null;
  thumbnailPath?: string | null;
  bestOfferPrice?: string | null;
  sectionId: string;
  regions: FoxreloadRegion[];
  isHidden?: boolean;
}

interface ProductItem {
  id: string;
  slug: string;
  name: string;
  categorySlug?: string;
  costPrice: number;
  price: number;
  marginAmount: number;
  marginPercent: number;
  stock: number;
  deliveryType: string;
  requiredNoteFields?: string[];
  isHidden: boolean;
}

interface OrderItem {
  id: string;
  userId: string;
  serviceName: string;
  serviceId: string;
  targetInput: string;
  quantity: number;
  price: number;
  status: string;
  apiOrderId?: string | null;
  reply?: string | null;
  notes?: string | null;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    balance: number;
  };
}

export default function FoxreloadAdminPage() {
  const [activeTab, setActiveTab] = useState<"services" | "orders" | "testing">("services");
  const [loading, setLoading] = useState(true);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [settings, setSettings] = useState<FoxreloadSettings>({
    apiKey: "",
    isEnabled: true,
    defaultProfitMarginPercent: 10,
    autoFulfill: false,
    hiddenItems: [],
    customPrices: {},
    customMargins: {},
  });

  const [balances, setBalances] = useState<BalanceItem[]>([]);
  const [accountEmail, setAccountEmail] = useState("");
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  const [bundles, setBundles] = useState<FoxreloadBundle[]>([]);
  const [loadingBundles, setLoadingBundles] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [inspectedBundle, setInspectedBundle] = useState<FoxreloadBundle | null>(null);
  const [inspectedRegion, setInspectedRegion] = useState<FoxreloadRegion | null>(null);
  const [inspectedProducts, setInspectedProducts] = useState<ProductItem[]>([]);
  const [loadingInspectedProducts, setLoadingInspectedProducts] = useState(false);

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [editPriceInput, setEditPriceInput] = useState<string>("");
  const [editMarginInput, setEditMarginInput] = useState<string>("");
  const [isSavingPricing, setIsSavingPricing] = useState(false);

  const [bulkMarginInput, setBulkMarginInput] = useState<string>("10");
  const [isApplyingBulkMargin, setIsApplyingBulkMargin] = useState(false);

  const [testResult, setTestResult] = useState<any | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const getAdminAuthHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
    let token = null;
    if (typeof window !== "undefined") {
      token =
        localStorage.getItem("admin_token") ||
        localStorage.getItem("adminToken") ||
        localStorage.getItem("user_token") ||
        sessionStorage.getItem("admin_token");
      if (!token && document.cookie) {
        const match = document.cookie.match(/(?:^|;\s*)admin_token=([^;]+)/);
        if (match) token = decodeURIComponent(match[1]);
      }
    }

    const headers: Record<string, string> = {
      "Cache-Control": "no-cache",
      ...extraHeaders,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }

    return headers;
  };

  const adminFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = getAdminAuthHeaders(
      (options.headers as Record<string, string>) || {}
    );
    return fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });
  };

  const fetchOverview = async () => {
    try {
      const res = await adminFetch("/api/foxreload/admin/overview");
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        const margin =
          typeof data.settings?.defaultProfitMarginPercent === "number"
            ? data.settings.defaultProfitMarginPercent
            : 10;
        setBulkMarginInput(String(margin));
        setBalances(data.liveBalance?.balances || []);
        setAccountEmail(data.liveBalance?.email || "");
        setPendingOrdersCount(data.pendingOrdersCount || 0);
        setTotalOrdersCount(data.totalOrdersCount || 0);
      }
    } catch {
      showToast("فشل الاتصال بجلب ملخص FoxReload", "error");
    } finally {
      setLoading(false);
    }
  };

  const refreshBalance = async () => {
    setRefreshingBalance(true);
    try {
      const res = await adminFetch("/api/foxreload/admin/overview");
      const data = await res.json();
      if (res.ok && data.success) {
        setBalances(data.liveBalance?.balances || []);
        setAccountEmail(data.liveBalance?.email || "");
        showToast("تم تحديث الرصيد اللحظي بنجاح");
      } else {
        showToast("تعذر جلب رصيد FoxReload الحي", "error");
      }
    } catch {
      showToast("خطأ أثناء تحديث الرصيد", "error");
    } finally {
      setRefreshingBalance(false);
    }
  };

  const fetchCatalogData = async (force: boolean = false) => {
    setLoadingBundles(true);
    try {
      const res = await adminFetch(`/api/foxreload/admin/catalog${force ? "?refresh=true" : ""}`);
      const data = await res.json();
      if (res.ok && data.catalog?.sections) {
        const aggregatedBundles: FoxreloadBundle[] = [];
        const seenIds = new Set<string>();

        Object.entries(data.catalog.sections).forEach(([secKey, sec]: [string, any]) => {
          if (secKey !== "popular" && Array.isArray(sec.bundles)) {
            sec.bundles.forEach((b: FoxreloadBundle) => {
              if (!seenIds.has(b.id)) {
                seenIds.add(b.id);
                aggregatedBundles.push(b);
              }
            });
          }
        });

        setBundles(aggregatedBundles);
      }
    } catch {
      showToast("تعذر جلب كتالوج الألعاب والخدمات من المزود", "error");
    } finally {
      setLoadingBundles(false);
    }
  };

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await adminFetch(`/api/foxreload/admin/orders?status=${orderStatusFilter}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setOrders(data.orders || []);
      }
    } catch {
      showToast("فشل جلب سجل طلبات FoxReload", "error");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchCatalogData();
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [orderStatusFilter]);

  const handleToggleAll = async () => {
    const nextState = !settings.isEnabled;
    try {
      const res = await adminFetch("/api/foxreload/admin/toggle-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isEnabled: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings((prev) => ({ ...prev, isEnabled: nextState }));
        showToast(data.message);
      } else {
        showToast(data.error || "فشل تحديث حالة الظهور العامة", "error");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const handleToggleAutoFulfill = async () => {
    const nextState = !settings.autoFulfill;
    try {
      const res = await adminFetch("/api/foxreload/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autoFulfill: nextState }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettings((prev) => ({ ...prev, autoFulfill: nextState }));
        showToast(nextState ? "تم تفعيل التنفيذ الفوري التلقائي للطلبات" : "تم تحويل الطلبات للاعتماد اليدوي");
      } else {
        showToast("فشل تحديث إعدادات التنفيذ التلقائي", "error");
      }
    } catch {
      showToast("خطأ في حفظ الإعدادات", "error");
    }
  };

  const handleApplyBulkMargin = async () => {
    const num = parseFloat(bulkMarginInput);
    if (isNaN(num) || num < 0) {
      showToast("يرجى إدخال نسبة ربح صحيحة أكبر من أو تساوي 0", "error");
      return;
    }

    setIsApplyingBulkMargin(true);
    try {
      const res = await adminFetch("/api/foxreload/admin/update-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultProfitMarginPercent: num }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const nextSettings = data.settings || { ...settings, defaultProfitMarginPercent: num };
        setSettings(nextSettings);
        setBulkMarginInput(String(nextSettings.defaultProfitMarginPercent ?? num));
        showToast(`تم تطبيق وحفظ هامش ربح ${num}% على كافة الباقات بنجاح`);
        fetchCatalogData(true);
        if (inspectedRegion) {
          loadInspectedRegionProducts(inspectedRegion.id);
        }
      } else {
        showToast(data.error || "فشل تطبيق نسبة الربح", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء حفظ هامش الربح", "error");
    } finally {
      setIsApplyingBulkMargin(false);
    }
  };

  const loadInspectedRegionProducts = async (regionId: string) => {
    setLoadingInspectedProducts(true);
    try {
      const res = await adminFetch(`/api/foxreload/admin/category/${encodeURIComponent(regionId)}/products?refresh=true`);
      const data = await res.json();
      if (res.ok && Array.isArray(data.products)) {
        setInspectedProducts(data.products);
      } else {
        setInspectedProducts([]);
      }
    } catch {
      showToast("فشل جلب باقات هذه المنطقة", "error");
      setInspectedProducts([]);
    } finally {
      setLoadingInspectedProducts(false);
    }
  };

  const handleInspectBundle = (bundle: FoxreloadBundle) => {
    setInspectedBundle(bundle);
    const regions = bundle.regions || [];
    if (regions.length > 0) {
      setInspectedRegion(regions[0]);
      loadInspectedRegionProducts(regions[0].id);
    } else {
      const defaultReg: FoxreloadRegion = {
        id: bundle.id,
        slug: bundle.slug,
        name: "Global",
        inStockCount: bundle.inStockCount,
        hasProducts: true,
      };
      setInspectedRegion(defaultReg);
      loadInspectedRegionProducts(bundle.id);
    }
  };

  const handleToggleItemVisibility = async (itemId: string, currentHidden: boolean) => {
    const nextHidden = !currentHidden;
    try {
      const res = await adminFetch("/api/foxreload/admin/toggle-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isHidden: nextHidden }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setInspectedProducts((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, isHidden: nextHidden } : item))
        );
        showToast(data.message);
      } else {
        showToast(data.error || "فشل تغيير حالة الظهور", "error");
      }
    } catch {
      showToast("خطأ في الاتصال بالخادم", "error");
    }
  };

  const handleOpenEditProduct = (prod: ProductItem) => {
    setEditingProduct(prod);
    const customP = settings.customPrices?.[prod.id];
    const customM = settings.customMargins?.[prod.id];
    setEditPriceInput(customP !== undefined ? String(customP) : "");
    setEditMarginInput(customM !== undefined ? String(customM) : "");
  };

  const handleSaveProductPricing = async () => {
    if (!editingProduct) return;
    setIsSavingPricing(true);

    const priceVal = editPriceInput.trim() !== "" ? parseFloat(editPriceInput) : null;
    const marginVal = editMarginInput.trim() !== "" ? parseFloat(editMarginInput) : null;

    try {
      const res = await adminFetch("/api/foxreload/admin/update-pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: editingProduct.id,
          customPrice: priceVal,
          customMargin: marginVal,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettings(data.settings);
        showToast("تم حفظ التسعير المخصص للباقة بنجاح");
        setEditingProduct(null);
        if (inspectedRegion) {
          loadInspectedRegionProducts(inspectedRegion.id);
        }
      } else {
        showToast(data.error || "فشل تحديث التسعير", "error");
      }
    } catch {
      showToast("خطأ أثناء حفظ التسعير", "error");
    } finally {
      setIsSavingPricing(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في اعتماد وتنفيذ هذا الطلب مباشرة عبر FoxReload؟")) return;

    setProcessingOrderId(orderId);
    try {
      const res = await adminFetch(`/api/foxreload/admin/orders/${orderId}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || "تم اعتماد الطلب وتنفيذه بنجاح");
        fetchOrders();
        refreshBalance();
      } else {
        showToast(data.error || "فشل اعتماد الطلب لدى FoxReload", "error");
      }
    } catch {
      showToast("حدث خطأ أثناء اعتماد الطلب", "error");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt("يرجى إدخال سبب الرفض واسترجاع الرصيد للمحفظة:", "تم الرفض بواسطة الإدارة واسترجاع الرصيد");
    if (!reason) return;

    setProcessingOrderId(orderId);
    try {
      const res = await adminFetch(`/api/foxreload/admin/orders/${orderId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("تم رفض الطلب واسترجاع الرصيد لمحفظة العميل");
        fetchOrders();
      } else {
        showToast(data.error || "فشل رفض الطلب", "error");
      }
    } catch {
      showToast("خطأ أثناء رفض الطلب", "error");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleRunDiagnosticTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await adminFetch("/api/foxreload/admin/test-connection", { method: "POST" });
      const data = await res.json();
      setTestResult(data);
      if (res.ok && data.success) {
        showToast("فحص الاتصال ناجح ومفتاح الربط سليم بنسبة 100%");
      } else {
        showToast("فشل فحص الاتصال: " + (data.error || "خطأ غير معروف"), "error");
      }
    } catch (e: any) {
      setTestResult({ error: e.message });
      showToast("خطأ في الاتصال بالخادم", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunTestOrder = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await adminFetch("/api/foxreload/admin/test-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ simulate: true }),
      });
      const data = await res.json();
      setTestResult(data);
      showToast("تم تشغيل محاكاة الطلب بنجاح");
    } catch (e: any) {
      setTestResult({ error: e.message });
      showToast("خطأ في محاكاة الطلب", "error");
    } finally {
      setIsTesting(false);
    }
  };

  const filteredBundles = useMemo(() => {
    return bundles.filter((b) => {
      if (selectedCategoryFilter !== "all" && b.sectionId !== selectedCategoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = b.name.toLowerCase().includes(q);
        const matchSlug = b.slug.toLowerCase().includes(q);
        const matchRegion = b.regions?.some((r) => r.name.toLowerCase().includes(q));
        return matchName || matchSlug || matchRegion;
      }
      return true;
    });
  }, [bundles, selectedCategoryFilter, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 font-sans text-right" dir="rtl">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 left-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold flex items-center gap-3 transition-all ${
            toastMessage.type === "success"
              ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/40 backdrop-blur-md"
              : "bg-rose-950/90 text-rose-300 border-rose-500/40 backdrop-blur-md"
          }`}
        >
          <span className="material-symbols-outlined text-xl">
            {toastMessage.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container/60 p-6 rounded-2xl border border-outline-variant/30 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold font-display text-on-surface flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl">sports_esports</span>
            <span>إدارة باقات وخدمات FoxReload الكاملة</span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">
            استعراض كافة الألعاب والخدمات المجمعة، اختيار الدول والمناطق، التحكم بالأسعار، وهوامش الربح، واعتماد الطلبات.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              refreshBalance();
              fetchCatalogData(true);
            }}
            disabled={refreshingBalance || loadingBundles}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container-highest text-on-surface hover:bg-surface-container-highest/80 border border-outline-variant/40 text-sm font-medium transition-all"
          >
            <span
              className={`material-symbols-outlined text-lg ${
                refreshingBalance || loadingBundles ? "animate-spin" : ""
              }`}
            >
              sync
            </span>
            <span>تحديث شامل من السيرفر</span>
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-surface-container/80 p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              رصيد FoxReload الحي
            </span>
            <span className="material-symbols-outlined text-emerald-400 text-2xl">account_balance_wallet</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-on-surface">
              ${balances.find((b) => b.currency === "USD")?.amount.toFixed(2) || "0.00"}
              <span className="text-xs font-normal text-on-surface-variant mr-1">USD</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
              <span>{accountEmail || "حساب نشط"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            </div>
          </div>
        </div>

        {/* Global Visibility */}
        <div className="bg-surface-container/80 p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              حالة ظهور الخدمات
            </span>
            <span
              className={`material-symbols-outlined text-2xl ${
                settings.isEnabled ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {settings.isEnabled ? "visibility" : "visibility_off"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-on-surface">
                {settings.isEnabled ? "ظاهر بالموقع للجميع" : "مخفي عن الزوار"}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                {settings.isEnabled ? "القسم معروض في شريط الموقع" : "معطل للإيقاف المؤقت"}
              </div>
            </div>
            <button
              onClick={handleToggleAll}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                settings.isEnabled
                  ? "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30"
              }`}
            >
              {settings.isEnabled ? "إخفاء الكل" : "إظهار الكل"}
            </button>
          </div>
        </div>

        {/* Fulfillment Mode */}
        <div className="bg-surface-container/80 p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              نظام تنفيذ الطلبات
            </span>
            <span
              className={`material-symbols-outlined text-2xl ${
                settings.autoFulfill ? "text-blue-400" : "text-purple-400"
              }`}
            >
              {settings.autoFulfill ? "bolt" : "verified_user"}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-on-surface">
                {settings.autoFulfill ? "تنفيذ فوري تلقائي" : "موافقة يدوية من الإدارة"}
              </div>
              <div className="text-xs text-on-surface-variant mt-0.5">
                {settings.autoFulfill ? "يرسل فوراً للـ API ويصدر الكود" : "يتطلب ضغط موافقة باللوحة"}
              </div>
            </div>
            <button
              onClick={handleToggleAutoFulfill}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface border border-outline-variant/30 transition-all"
            >
              {settings.autoFulfill ? "تحويل ليدوي" : "تحويل لتلقائي"}
            </button>
          </div>
        </div>

        {/* Available Bundles & Orders Count */}
        <div className="bg-surface-container/80 p-5 rounded-2xl border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
              الخدمات المسجلة والطلبات
            </span>
            <span className="material-symbols-outlined text-primary text-2xl">category</span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-primary">
              {bundles.length}
              <span className="text-xs font-normal text-on-surface-variant mr-2">لعبة وخدمة معتمدة</span>
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              طلبات معلقة: {pendingOrdersCount} | الإجمالي: {totalOrdersCount}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Margin Bar */}
      <div className="bg-surface-container/60 p-4 sm:p-5 rounded-2xl border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl sm:text-3xl shrink-0">trending_up</span>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm sm:text-base text-on-surface">هامش الربح العام الموحد لجميع الباقات</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                النسبة المحفوظة: {settings.defaultProfitMarginPercent}%
              </span>
            </div>
            <div className="text-xs text-on-surface-variant mt-0.5">
              يتم احتساب سعر بيع الباقة = تكلفة الـ API + نسبة الربح المحددة هنا تلقائياً، ما لم يتم تحديد سعر مخصص للباقة.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
          <div className="relative">
            <input
              type="number"
              min="0"
              max="200"
              step="any"
              value={bulkMarginInput}
              onChange={(e) => setBulkMarginInput(e.target.value)}
              className="w-24 px-3 py-2 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-center font-extrabold text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
            />
            <span className="absolute left-3 top-2 text-xs text-on-surface-variant font-bold">%</span>
          </div>
          <button
            type="button"
            onClick={handleApplyBulkMargin}
            disabled={isApplyingBulkMargin}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            {isApplyingBulkMargin ? (
              <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-sm">check</span>
            )}
            <span>تطبيق على الكل</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-3">
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "services"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-lg">grid_view</span>
          <span>إدارة الألعاب والخدمات ({bundles.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "orders"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-lg">shopping_cart</span>
          <span>إدارة وسجل الطلبات ({orders.length})</span>
          {pendingOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold mr-1">
              {pendingOrdersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("testing")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === "testing"
              ? "bg-primary text-on-primary shadow-md"
              : "bg-surface-container hover:bg-surface-container-highest text-on-surface-variant"
          }`}
        >
          <span className="material-symbols-outlined text-lg">science</span>
          <span>أدوات الفحص والاختبار</span>
        </button>
      </div>

      {/* TAB 1: BUNDLES & SERVICES MANAGEMENT */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Category Filter Pills & Search */}
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {[
                { id: "all", label: "كافة الأقسام" },
                { id: "topups", label: "شحن الألعاب المباشر" },
                { id: "app-stores", label: "متاجر التطبيقات" },
                { id: "game-currency", label: "أكواد وبطاقات الألعاب" },
                { id: "subscriptions", label: "الاشتراكات الرقمية" },
                { id: "esim", label: "شرائح الإنترنت eSIM" },
                { id: "rewarble", label: "Rewarble" },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedCategoryFilter === cat.id
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute right-3 top-2.5 text-on-surface-variant text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="بحث عن لعبة، خدمة أو دولة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-xs text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Bundles Table */}
          <div className="bg-surface-container/60 rounded-2xl border border-outline-variant/30 overflow-hidden">
            {loadingBundles ? (
              <div className="p-16 text-center text-on-surface-variant text-sm font-medium flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>جاري استيراد كافة باقات وألعاب FoxReload...</span>
              </div>
            ) : filteredBundles.length === 0 ? (
              <div className="p-16 text-center text-on-surface-variant text-sm font-medium">
                لا توجد خدمات مطابقة لخيارات البحث
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-highest/60 text-on-surface-variant border-b border-outline-variant/30 uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-3.5">اللعبة / الخدمة المجمعة</th>
                      <th className="p-3.5">القسم</th>
                      <th className="p-3.5">الدول والمناطق المدعومة</th>
                      <th className="p-3.5">إجمالي الباقات</th>
                      <th className="p-3.5 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {filteredBundles.map((b) => (
                      <tr key={b.id} className="hover:bg-surface-container-highest/30 transition-colors">
                        <td className="p-3.5 font-bold text-on-surface">
                          <div className="text-sm">{b.name}</div>
                          <div className="text-[10px] font-normal text-on-surface-variant/70 font-mono">{b.slug}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant text-[11px] font-semibold">
                            {b.sectionId}
                          </span>
                        </td>
                        <td className="p-3.5 text-on-surface-variant">
                          {b.regions && b.regions.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {b.regions.slice(0, 3).map((r) => (
                                <span
                                  key={r.id}
                                  className="px-2 py-0.5 rounded-full bg-surface-container-highest text-[10px]"
                                >
                                  {r.name}
                                </span>
                              ))}
                              {b.regions.length > 3 && (
                                <span className="text-[10px] text-primary font-bold">
                                  +{b.regions.length - 3} أخرى
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[11px]">عالمي (Global)</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-on-surface font-semibold">
                          {b.inStockCount} باقة متاحة
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => handleInspectBundle(b)}
                            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs transition-all shadow-sm flex items-center gap-1.5 mx-auto"
                          >
                            <span className="material-symbols-outlined text-sm">tune</span>
                            <span>استعراض الباقات والأسعار</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="bg-surface-container/60 p-4 rounded-2xl border border-outline-variant/30 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface-variant">تصفية حسب الحالة:</span>
              {[
                { id: "all", label: "كافة الطلبات" },
                { id: "pending", label: "بانتظار الموافقة" },
                { id: "completed", label: "مكتملة" },
                { id: "rejected", label: "مرفوضة / مسترجعة" },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setOrderStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    orderStatusFilter === st.id
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface rounded-lg text-xs font-bold transition-all border border-outline-variant/30"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>تحديث الطلبات</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-surface-container/60 rounded-2xl border border-outline-variant/30 overflow-hidden">
            {loadingOrders ? (
              <div className="p-12 text-center text-on-surface-variant text-sm font-medium">
                جاري تحميل سجل الطلبات...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-on-surface-variant text-sm font-medium">
                لا توجد طلبات مسجلة ضمن هذا التصنيف حالياً
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-surface-container-highest/60 text-on-surface-variant border-b border-outline-variant/30 uppercase text-[11px] font-bold">
                    <tr>
                      <th className="p-3.5">رقم الطلب</th>
                      <th className="p-3.5">العميل</th>
                      <th className="p-3.5">الخدمة المطلوبة</th>
                      <th className="p-3.5">البيانات / الحساب</th>
                      <th className="p-3.5">المبلغ</th>
                      <th className="p-3.5">التاريخ</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">كود الشحن / الرد</th>
                      <th className="p-3.5 text-center">إجراءات الإدارة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-container-highest/30 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-on-surface">
                          #{o.id.slice(0, 8)}
                        </td>
                        <td className="p-3.5">
                          <div className="font-bold text-on-surface">{o.user?.fullName || "مستخدم مسجل"}</div>
                          <div className="text-[10px] text-on-surface-variant">{o.user?.email || "-"}</div>
                        </td>
                        <td className="p-3.5 font-semibold text-on-surface">
                          {o.serviceName}
                          {o.quantity > 1 && (
                            <span className="text-[10px] text-primary mr-1">({o.quantity}x)</span>
                          )}
                        </td>
                        <td className="p-3.5 font-mono text-on-surface-variant max-w-[140px] truncate" title={o.targetInput}>
                          {o.targetInput}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-primary">
                          ${o.price.toFixed(2)}
                        </td>
                        <td className="p-3.5 text-[11px] text-on-surface-variant">
                          {new Date(o.createdAt).toLocaleDateString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                              o.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : o.status === "pending"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : o.status === "processing"
                                ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {o.status === "completed"
                              ? "مكتمل"
                              : o.status === "pending"
                              ? "بانتظار الموافقة"
                              : o.status === "processing"
                              ? "قيد التنفيذ"
                              : "مرفوض / مسترجع"}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {o.reply ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs text-emerald-400 font-bold bg-surface-container-highest px-2 py-0.5 rounded max-w-[120px] truncate">
                                {o.reply}
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(o.reply || "");
                                  showToast("تم نسخ الكود للحافظة");
                                }}
                                className="p-1 text-on-surface-variant hover:text-on-surface rounded"
                                title="نسخ الكود"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-on-surface-variant/60">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {o.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApproveOrder(o.id)}
                                  disabled={processingOrderId === o.id}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-all flex items-center gap-1 shadow-sm"
                                  title="موافقة وتنفيذ الطلب عبر FoxReload"
                                >
                                  {processingOrderId === o.id ? (
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                  ) : (
                                    <span className="material-symbols-outlined text-sm">check</span>
                                  )}
                                  <span>موافقة وتنفيذ</span>
                                </button>
                                <button
                                  onClick={() => handleRejectOrder(o.id)}
                                  disabled={processingOrderId === o.id}
                                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold text-[11px] transition-all"
                                  title="رفض واسترجاع الرصيد للمحفظة"
                                >
                                  رفض
                                </button>
                              </>
                            )}
                            {o.status === "completed" && (
                              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">verified</span>
                                <span>تم التسليم</span>
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: DIAGNOSTICS & TESTING */}
      {activeTab === "testing" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Connection Test Card */}
            <div className="bg-surface-container/60 p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">wifi_tethering</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">فحص الاتصال المباشر بالـ API</h3>
                  <p className="text-xs text-on-surface-variant">اختبار صلاحية مفتاح الربط والوصول لخوادم FoxReload وقراءة الرصيد الحي.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunDiagnosticTest}
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  {isTesting ? (
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-base">play_arrow</span>
                  )}
                  <span>تشغيل فحص الاتصال الآن</span>
                </button>
              </div>
            </div>

            {/* Test Order Card */}
            <div className="bg-surface-container/60 p-6 rounded-2xl border border-outline-variant/30 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-3xl">task_alt</span>
                <div>
                  <h3 className="font-bold text-base text-on-surface">فحص مسار إنشاء وتأكيد الطلبات</h3>
                  <p className="text-xs text-on-surface-variant">محاكاة دورة الشراء والتحقق من التجهيز والردود قبل التعامل الفعلي.</p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRunTestOrder}
                  disabled={isTesting}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface border border-outline-variant/40 text-xs font-bold transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>تشغيل فحص الطلب الآمن (Simulation)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Results Output */}
          {testResult && (
            <div className="bg-surface-container/80 p-5 rounded-2xl border border-outline-variant/30 space-y-2">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider flex items-center justify-between">
                <span>نتيجة الفحص التشخيصي</span>
                <span className="font-mono text-[10px] text-on-surface-variant">{new Date().toLocaleTimeString()}</span>
              </div>
              <pre className="p-4 rounded-xl bg-black/40 text-emerald-300 font-mono text-xs overflow-x-auto border border-outline-variant/20 dir-ltr text-left">
                {JSON.stringify(testResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* INSPECTED BUNDLE MODAL (REGIONS & PACKAGES) */}
      {inspectedBundle && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-3xl p-6 sm:p-8 max-w-3xl w-full space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-outline-variant/30 pb-4">
              <div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                  {inspectedBundle.sectionId}
                </span>
                <h2 className="text-2xl font-extrabold text-on-surface mt-1">
                  {inspectedBundle.name}
                </h2>
              </div>
              <button
                onClick={() => setInspectedBundle(null)}
                className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-full bg-surface-container-highest"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Regions Selector */}
            {inspectedBundle.regions && inspectedBundle.regions.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-on-surface-variant uppercase">
                  اختر الدولة أو المنطقة لعرض باقاتها:
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1 border border-outline-variant/20 rounded-2xl bg-surface-container/40">
                  {inspectedBundle.regions.map((reg) => {
                    const isSelected = inspectedRegion?.id === reg.id;
                    return (
                      <button
                        key={reg.id}
                        type="button"
                        onClick={() => {
                          setInspectedRegion(reg);
                          loadInspectedRegionProducts(reg.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                          isSelected
                            ? "bg-primary text-on-primary shadow-sm scale-105"
                            : "bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                        }`}
                      >
                        <span>{reg.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            isSelected ? "bg-black/20 text-white" : "bg-black/10 text-on-surface-variant"
                          }`}
                        >
                          {reg.inStockCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Products Table */}
            <div className="space-y-2">
              <div className="text-xs font-bold text-on-surface-variant uppercase flex items-center justify-between">
                <span>الباقات والأسعار المتاحة ({inspectedProducts.length}):</span>
                {inspectedRegion && <span className="text-primary font-mono">{inspectedRegion.name}</span>}
              </div>

              {loadingInspectedProducts ? (
                <div className="p-8 text-center text-xs text-on-surface-variant">جاري تحميل الباقات...</div>
              ) : inspectedProducts.length === 0 ? (
                <div className="p-8 text-center text-xs text-on-surface-variant bg-surface-container/30 rounded-2xl border border-outline-variant/30">
                  لا توجد باقات متوفرة لهذه المنطقة حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto border border-outline-variant/30 rounded-2xl">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-surface-container-highest/60 text-on-surface-variant border-b border-outline-variant/30 uppercase text-[11px] font-bold">
                      <tr>
                        <th className="p-3">اسم الباقة</th>
                        <th className="p-3">تكلفة API</th>
                        <th className="p-3">نسبة الربح</th>
                        <th className="p-3">سعر البيع</th>
                        <th className="p-3">المخزون</th>
                        <th className="p-3 text-center">الظهور</th>
                        <th className="p-3 text-center">التسعير</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {inspectedProducts.map((prod) => (
                        <tr key={prod.id} className="hover:bg-surface-container-highest/30 transition-colors">
                          <td className="p-3 font-bold text-on-surface">
                            <div>{prod.name}</div>
                            <div className="text-[10px] font-normal text-on-surface-variant font-mono">{prod.id}</div>
                          </td>
                          <td className="p-3 font-mono text-on-surface-variant">
                            ${prod.costPrice.toFixed(2)}
                          </td>
                          <td className="p-3 font-mono text-emerald-400 font-bold">
                            +{prod.marginPercent.toFixed(1)}%
                          </td>
                          <td className="p-3 font-mono text-primary font-extrabold text-sm">
                            ${prod.price.toFixed(2)}
                          </td>
                          <td className="p-3 font-mono">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                prod.stock > 0
                                  ? "bg-emerald-500/10 text-emerald-400"
                                  : "bg-rose-500/10 text-rose-400"
                              }`}
                            >
                              {prod.stock > 0 ? `${prod.stock}` : "نفد"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleToggleItemVisibility(prod.id, prod.isHidden)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                prod.isHidden
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {prod.isHidden ? "مخفي" : "ظاهر"}
                            </button>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="px-2.5 py-1 rounded-lg bg-surface-container-highest text-on-surface text-[10px] font-bold border border-outline-variant/30"
                            >
                              تعديل
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT PRICING MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-high border border-outline-variant/40 rounded-2xl p-6 max-w-md w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
              <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">edit</span>
                <span>تعديل تسعير الباقة</span>
              </h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-on-surface-variant hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div>
              <div className="font-bold text-sm text-on-surface">{editingProduct.name}</div>
              <div className="text-xs text-on-surface-variant mt-1 font-mono">
                تكلفة الـ API الأصلية: ${editingProduct.costPrice.toFixed(2)} USD
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  سعر البيع النهائي بالموقع ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`تلقائي (${editingProduct.price.toFixed(2)})`}
                  value={editPriceInput}
                  onChange={(e) => setEditPriceInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                />
                <span className="text-[10px] text-on-surface-variant mt-0.5 block">
                  اتركه فارغاً للاعتماد على نسبة الربح المئوية التلقائية.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  أو تحديد نسبة ربح مخصصة لهذه الباقة (%)
                </label>
                <input
                  type="number"
                  step="1"
                  placeholder={`الافتراضي (${settings.defaultProfitMarginPercent}%)`}
                  value={editMarginInput}
                  onChange={(e) => setEditMarginInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface-container-highest border border-outline-variant/40 rounded-xl text-on-surface text-sm focus:outline-none focus:border-primary font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/30">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveProductPricing}
                disabled={isSavingPricing}
                className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                {isSavingPricing ? (
                  <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                <span>حفظ التسعير</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
