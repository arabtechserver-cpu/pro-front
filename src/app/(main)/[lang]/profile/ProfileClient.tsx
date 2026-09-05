"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cleanHtmlToText } from "@/utils/cleanHtml";

interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string | null;
  country: string;
  balance: number;
  role: string;
  status: string;
  membershipTierId?: string | null;
  membershipTier?: {
    id: string;
    name: string;
    nameAr?: string | null;
    badgeColor?: string | null;
    discountPercentage?: number;
  } | null;
  customDiscount?: number;
  effectiveDiscount?: number;
  apiEnabled?: boolean;
  apiKey?: string | null;
  apiSiteName?: string | null;
  apiSiteUrl?: string | null;
  createdAt?: string;
}

interface OrderItem {
  id: string;
  serviceName: string;
  serviceType?: string;
  price: number;
  discount?: number;
  couponCode?: string | null;
  status: string;
  reply?: string | null;
  notes?: string | null;
  createdAt: string;
  targetInput?: string;
  imei?: string;
  quantity?: number;
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  method: string;
  status: string;
  refNo: string;
  receiptImage?: string | null;
  createdAt: string;
}

const COUNTRY_FLAGS: Record<string, string> = {
  EG: "🇪🇬 مصر",
  SA: "🇸🇦 السعودية",
  AE: "🇦🇪 الإمارات",
  SD: "🇸🇩 السودان",
  KW: "🇰🇼 الكويت",
  QA: "🇶🇦 قطر",
  JO: "🇯🇴 الأردن",
  IQ: "🇮🇶 العراق",
  DZ: "🇩🇿 الجزائر",
  MA: "🇲🇦 المغرب",
  TN: "🇹🇳 تونس",
  LY: "🇱🇾 ليبيا",
  OM: "🇴🇲 عمان",
  BH: "🇧🇭 البحرين",
  PS: "🇵🇸 فلسطين",
  YE: "🇾🇪 اليمن",
  SY: "🇸🇾 سوريا",
  LB: "🇱🇧 لبنان",
  TR: "🇹🇷 تركيا",
  US: "🇺🇸 الولايات المتحدة",
  GB: "🇬🇧 بريطانيا",
  DE: "🇩🇪 ألمانيا",
  FR: "🇫🇷 فرنسا",
  CA: "🇨🇦 كندا"
};

export default function ProfileClient({ lang, dict }: { lang: string; dict: any }) {
  const router = useRouter();
  const isAr = lang === "ar";

  // Session & User Profile
  const [userSession, setUserSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<"orders" | "transactions" | "settings" | "api">("orders");

  // Orders Data
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [orderSearch, setOrderSearch] = useState<string>("");

  // Transactions Data
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [txFilter, setTxFilter] = useState<string>("all");
  const [txSearch, setTxSearch] = useState<string>("");

  // Settings / Update Profile Form
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // API Key Visibility Toggle
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 1. Initial Session Load
  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserSession(parsed);
        setFormData(prev => ({
          ...prev,
          fullName: parsed.fullName || "",
          username: parsed.username || "",
          email: parsed.email || "",
          phone: parsed.phone || ""
        }));
      } catch {
        setUserSession(null);
      }
    } else {
      setLoadingProfile(false);
    }
  }, []);

  // 2. Fetch Fresh Profile Data from Backend
  const fetchProfile = async () => {
    const saved = localStorage.getItem("user_session");
    if (!saved) {
      setLoadingProfile(false);
      return;
    }

    try {
      const parsed = JSON.parse(saved);
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const query = parsed.id ? `userId=${encodeURIComponent(parsed.id)}` : `email=${encodeURIComponent(parsed.email)}`;
      const res = await fetch(`/api/users/profile?${query}`, {
        headers,
        credentials: "omit"
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setProfile(data.user);
          const updatedSession = { ...parsed, ...data.user };
          setUserSession(updatedSession);
          localStorage.setItem("user_session", JSON.stringify(updatedSession));
          setFormData(prev => ({
            ...prev,
            fullName: data.user.fullName || "",
            username: data.user.username || "",
            email: data.user.email || "",
            phone: data.user.phone || ""
          }));
        }
      }
    } catch (e) {
      console.error("Error fetching user profile:", e);
    } finally {
      setLoadingProfile(false);
    }
  };

  // 3. Fetch Orders History
  const fetchOrders = async () => {
    if (!userSession?.id && !userSession?.email) return;
    setLoadingOrders(true);
    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const query = userSession.id ? `userId=${encodeURIComponent(userSession.id)}` : `email=${encodeURIComponent(userSession.email)}`;
      const res = await fetch(`/api/orders?${query}`, {
        headers,
        credentials: "omit"
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({ orders: [] }));
        if (data.orders && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.error("Error fetching customer orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  // 4. Fetch Transactions History
  const fetchTransactions = async () => {
    if (!userSession?.id && !userSession?.email) return;
    setLoadingTransactions(true);
    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const query = userSession.id ? `userId=${encodeURIComponent(userSession.id)}` : `email=${encodeURIComponent(userSession.email)}`;
      const res = await fetch(`/api/transactions?${query}`, {
        headers,
        credentials: "omit"
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({ transactions: [] }));
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions);
        }
      }
    } catch (e) {
      console.error("Error fetching customer transactions:", e);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (userSession) {
      fetchProfile();
      fetchOrders();
      fetchTransactions();
    }
  }, [userSession?.id]);

  // Handle Profile Update Submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    setSettingsSuccess(null);

    if (!formData.currentPassword) {
      setSettingsError(isAr ? "يرجى إدخال كلمة المرور الحالية لتأكيد التغييرات" : "Please enter your current password to confirm changes");
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 4) {
        setSettingsError(isAr ? "كلمة المرور الجديدة يجب أن لا تقل عن 4 أحرف" : "New password must be at least 4 characters");
        return;
      }
      if (formData.newPassword !== formData.confirmPassword) {
        setSettingsError(isAr ? "كلمة المرور الجديدة وتأكيدها غير متطابقين" : "New password and confirmation do not match");
        return;
      }
    }

    setSavingSettings(true);
    try {
      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload: any = {
        currentPassword: formData.currentPassword,
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        phone: formData.phone
      };

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      const res = await fetch("/api/users/update-credentials", {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess(isAr ? "تم تحديث بيانات حسابك بنجاح!" : "Your account details were updated successfully!");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));

        if (data.user) {
          const updated = { ...userSession, ...data.user };
          setUserSession(updated);
          localStorage.setItem("user_session", JSON.stringify(updated));
          setProfile(prev => prev ? { ...prev, ...data.user } : null);
          window.dispatchEvent(new Event("user_session_change"));
        }
      } else {
        setSettingsError(data.error || (isAr ? "فشل تحديث البيانات، تأكد من صحة كلمة المرور" : "Failed to update profile"));
      }
    } catch (e: any) {
      setSettingsError(e.message || (isAr ? "حدث خطأ في الاتصال بالخادم" : "Connection error"));
    } finally {
      setSavingSettings(false);
    }
  };

  // Sign out handler
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    localStorage.removeItem("user_token");
    setUserSession(null);
    window.dispatchEvent(new Event("user_session_change"));
    router.push(`/${lang}/login`);
  };

  // Copy helper
  const copyToClipboard = (text: string, id?: string) => {
    navigator.clipboard.writeText(text);
    if (id) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === "processing" && !(o.status === "processing" || o.status === "pending")) return false;
    if (orderFilter === "completed" && o.status !== "completed") return false;
    if (orderFilter === "failed" && !(o.status === "failed" || o.status === "rejected")) return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase().trim();
      const idMatch = (o.id || "").toLowerCase().includes(q);
      const nameMatch = (o.serviceName || "").toLowerCase().includes(q);
      const imeiMatch = (o.targetInput || o.imei || "").toLowerCase().includes(q);
      const replyMatch = (o.reply || "").toLowerCase().includes(q);
      return idMatch || nameMatch || imeiMatch || replyMatch;
    }
    return true;
  });

  // Filtered Transactions
  const filteredTxs = transactions.filter(t => {
    if (txFilter === "completed" && t.status !== "completed") return false;
    if (txFilter === "pending" && t.status !== "pending") return false;
    if (txFilter === "failed" && t.status !== "failed" && t.status !== "rejected") return false;

    if (txSearch.trim()) {
      const q = txSearch.toLowerCase().trim();
      const refMatch = (t.refNo || "").toLowerCase().includes(q);
      const methodMatch = (t.method || "").toLowerCase().includes(q);
      const amountMatch = (t.amount || "").toString().includes(q);
      return refMatch || methodMatch || amountMatch;
    }
    return true;
  });

  // Stats Calculations
  const currentBalance = profile?.balance ?? userSession?.balance ?? 0.0;
  const completedOrdersCount = orders.filter(o => o.status === "completed").length;
  const pendingOrdersCount = orders.filter(o => o.status === "pending" || o.status === "processing").length;
  const completedDepositsTotal = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  // If user is not logged in
  if (!loadingProfile && !userSession) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-16">
        <div className="glass-card rounded-3xl p-8 sm:p-12 border border-outline-variant/30 shadow-2xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_25px_rgba(45,212,191,0.2)]">
            <span className="material-symbols-outlined text-4xl">account_circle</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-on-surface">
              {isAr ? "يرجى تسجيل الدخول أولاً" : "Please Login First"}
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              {isAr 
                ? "للوصول إلى ملفك الشخصي، رصيد محفظتك، سجل الطلبات، والمعاملات المالية." 
                : "To access your profile, wallet balance, order history, and transactions."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/${lang}/login`}
              className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm shadow-lg hover:shadow-primary/25 transition-all text-center"
            >
              {isAr ? "تسجيل الدخول" : "Login"}
            </Link>
            <Link
              href={`/${lang}/register`}
              className="flex-1 py-3 px-6 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-bold text-sm hover:border-primary/50 transition-all text-center"
            >
              {isAr ? "إنشاء حساب جديد" : "Register"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* 1. HERO HEADER WITH USER PROFILE SUMMARY */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-high border border-outline-variant/30 shadow-2xl p-6 sm:p-10">
        {/* Ambient Glow Orbs */}
        <div className="absolute -top-24 -start-24 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -end-24 w-72 h-72 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* User Info & Avatar */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-primary via-teal-400 to-secondary p-1 shadow-[0_0_30px_rgba(45,212,191,0.3)]">
                <div className="w-full h-full rounded-[14px] bg-surface-container-lowest flex items-center justify-center text-3xl sm:text-4xl font-black text-primary">
                  {(profile?.fullName || userSession?.fullName || "U").charAt(0).toUpperCase()}
                </div>
              </div>
              <span className="absolute -bottom-1 -end-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-surface flex items-center justify-center text-white text-xs shadow-md" title="Active">
                ✓
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-tight">
                  {profile?.fullName || userSession?.fullName || userSession?.username}
                </h1>

                {/* VIP Membership Badge */}
                <span
                  className="text-xs font-black px-3 py-1 rounded-full text-white flex items-center gap-1.5 shadow-sm"
                  style={{
                    backgroundColor: profile?.membershipTier?.badgeColor || userSession?.membershipTier?.badgeColor || "#2dd4bf"
                  }}
                >
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  <span>
                    {isAr 
                      ? (profile?.membershipTier?.nameAr || profile?.membershipTier?.name || userSession?.membershipTier?.nameAr || "عضوية أساسية")
                      : (profile?.membershipTier?.name || "Standard Tier")}
                  </span>
                </span>

                {/* Role Badge */}
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-surface-container-highest/80 text-on-surface-variant border border-outline-variant/30">
                  {userSession?.role === "admin" ? (isAr ? "مدير النظام 🛡️" : "Admin") : (isAr ? "عميل معتمد 👤" : "Client")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-on-surface-variant font-medium">
                <span className="flex items-center gap-1 font-mono text-primary font-bold">
                  @{profile?.username || userSession?.username}
                </span>
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-on-surface-variant/70">mail</span>
                  {profile?.email || userSession?.email}
                </span>
                {(profile?.phone || userSession?.phone) && (
                  <>
                    <span className="text-outline-variant">•</span>
                    <span className="flex items-center gap-1 dir-ltr">
                      <span className="material-symbols-outlined text-sm text-on-surface-variant/70">call</span>
                      {profile?.phone || userSession?.phone}
                    </span>
                  </>
                )}
                <span className="text-outline-variant">•</span>
                <span className="flex items-center gap-1">
                  {COUNTRY_FLAGS[profile?.country || userSession?.country || "EG"] || "🌐"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href={`/${lang}/wallet`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>{isAr ? "شحن المحفظة" : "Top Up Wallet"}</span>
            </Link>

            <Link
              href={`/${lang}/pricing`}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-surface-container-high border border-outline-variant/40 hover:border-primary/50 text-on-surface font-bold text-xs hover:bg-surface-container-highest transition-all"
            >
              <span className="material-symbols-outlined text-base text-primary">shopping_bag</span>
              <span>{isAr ? "طلب خدمة جديدة" : "New Order"}</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs font-bold flex items-center justify-center transition-all"
              title={isAr ? "تسجيل الخروج" : "Logout"}
            >
              <span className="material-symbols-outlined text-base">logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Wallet Balance Card */}
        <div className="glass-card rounded-2xl p-5 border border-primary/30 bg-gradient-to-br from-primary/10 via-surface-container-lowest to-surface-container-low shadow-xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">
              {isAr ? "رصيد المحفظة المتوفر" : "Available Wallet Balance"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-primary font-mono tracking-tight">
              ${Number(currentBalance).toFixed(2)}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/15 text-[11px] text-on-surface-variant font-medium">
              <span>{isAr ? "جاهز للاستخدام الفوري" : "Ready to spend"}</span>
              <button
                onClick={fetchProfile}
                className="text-primary hover:underline flex items-center gap-1 font-bold"
                title={isAr ? "تحديث الرصيد" : "Refresh balance"}
              >
                <span className="material-symbols-outlined text-xs">refresh</span>
                {isAr ? "تحديث" : "Sync"}
              </button>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/30 bg-surface-container-lowest/80 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">
              {isAr ? "إجمالي الطلبات" : "Total Orders"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-xl">receipt_long</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-on-surface font-mono tracking-tight">
              {orders.length}
            </p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/15 text-[11px] font-bold">
              <span className="text-emerald-400 font-mono">✓ {completedOrdersCount} {isAr ? "مكتمل" : "done"}</span>
              <span className="text-amber-400 font-mono">⏳ {pendingOrdersCount} {isAr ? "قيد التنفيذ" : "pending"}</span>
            </div>
          </div>
        </div>

        {/* Total Deposits Card */}
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/30 bg-surface-container-lowest/80 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">
              {isAr ? "إجمالي الشحن المعتمد" : "Total Approved Deposits"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              ${completedDepositsTotal.toFixed(2)}
            </p>
            <div className="mt-2 pt-2 border-t border-outline-variant/15 text-[11px] text-on-surface-variant font-medium">
              <span>{transactions.length} {isAr ? "معاملة شحن مسجلة" : "transactions recorded"}</span>
            </div>
          </div>
        </div>

        {/* VIP Discount Card */}
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/30 bg-surface-container-lowest/80 shadow-xl group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface-variant">
              {isAr ? "نسبة الخصم الدائم" : "Active Permanent Discount"}
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shadow-inner group-hover:rotate-12 transition-transform">
              <span className="material-symbols-outlined text-xl">percent</span>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-black text-purple-400 font-mono tracking-tight">
              {profile?.effectiveDiscount || profile?.membershipTier?.discountPercentage || profile?.customDiscount || 0}%
            </p>
            <div className="mt-2 pt-2 border-t border-outline-variant/15 text-[11px] text-on-surface-variant font-medium truncate">
              <span>{isAr ? "يُطبق تلقائياً على كل الطلبات" : "Applied automatically on all orders"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 backdrop-blur-md">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "orders"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">receipt_long</span>
          <span>{isAr ? "سجل طلباتي" : "My Orders"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === "orders" ? "bg-black/25 text-white" : "bg-surface-container-highest text-on-surface-variant"
          }`}>
            {orders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "transactions"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">account_balance_wallet</span>
          <span>{isAr ? "سجل المعاملات والشحن" : "Transactions & Top-ups"}</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeTab === "transactions" ? "bg-black/25 text-white" : "bg-surface-container-highest text-on-surface-variant"
          }`}>
            {transactions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "settings"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">manage_accounts</span>
          <span>{isAr ? "إعدادات الحساب والأمان" : "Account Settings"}</span>
        </button>

        <button
          onClick={() => setActiveTab("api")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
            activeTab === "api"
              ? "bg-primary text-on-primary shadow-lg shadow-primary/20"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
          }`}
        >
          <span className="material-symbols-outlined text-base">api</span>
          <span>{isAr ? "بيانات الـ API والمطورين" : "API & Developers"}</span>
          {profile?.apiEnabled && (
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          )}
        </button>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB 1: ORDERS HISTORY */}
      {activeTab === "orders" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
          {/* Header with Search & Filter */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <span className="material-symbols-outlined absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                search
              </span>
              <input
                type="text"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder={isAr ? "ابحث برقم الطلب، اسم الخدمة، أو IMEI..." : "Search order ID, service, or IMEI..."}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 ps-10 pe-4 text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Filter Buttons & Refresh */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs font-bold">
                <button
                  onClick={() => setOrderFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${orderFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                <button
                  onClick={() => setOrderFilter("processing")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${orderFilter === "processing" ? "bg-amber-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "جاري التنفيذ ⏳" : "Processing"}
                </button>
                <button
                  onClick={() => setOrderFilter("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${orderFilter === "completed" ? "bg-emerald-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "مكتمل 🟢" : "Completed"}
                </button>
                <button
                  onClick={() => setOrderFilter("failed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${orderFilter === "failed" ? "bg-red-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "مرفوض 🔴" : "Failed"}
                </button>
              </div>

              <button
                onClick={fetchOrders}
                disabled={loadingOrders}
                className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all"
                title={isAr ? "تحديث" : "Refresh"}
              >
                <span className={`material-symbols-outlined text-sm text-primary ${loadingOrders ? "animate-spin" : ""}`}>
                  refresh
                </span>
                <span>{isAr ? "تحديث" : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-high/60 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 text-start">{isAr ? "رقم الطلب" : "Order ID"}</th>
                  <th className="p-3.5 text-start">{isAr ? "الخدمة" : "Service"}</th>
                  <th className="p-3.5 text-start">{isAr ? "البيانات / IMEI" : "Input / IMEI"}</th>
                  <th className="p-3.5 text-start">{isAr ? "النتيجة وكود الفك 🔑" : "Result / Unlock Code"}</th>
                  <th className="p-3.5 text-start">{isAr ? "التكلفة" : "Cost"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-3.5 text-end">{isAr ? "التاريخ" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-medium">
                {loadingOrders ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-primary">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                        <span>{isAr ? "جاري تحميل سجل الطلبات..." : "Loading orders history..."}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">inbox</span>
                        <p className="font-bold text-sm">{isAr ? "لا توجد طلبات مطابقة" : "No orders found"}</p>
                        <Link
                          href={`/${lang}/pricing`}
                          className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
                        >
                          {isAr ? "طلب خدمة الآن" : "Order a service now"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const isSuccess = order.status === "completed";
                    const isPending = order.status === "pending" || order.status === "processing";
                    const isFailed = order.status === "failed" || order.status === "rejected";

                    return (
                      <tr key={order.id} className="hover:bg-surface-container-high/40 transition-colors">
                        {/* Order ID */}
                        <td className="p-3.5 font-mono text-[11px] text-on-surface-variant">
                          <button
                            onClick={() => copyToClipboard(order.id, order.id)}
                            className="flex items-center gap-1 font-bold text-primary hover:underline"
                            title={isAr ? "نسخ رقم الطلب" : "Copy Order ID"}
                          >
                            <span>#{order.id.slice(0, 8)}...</span>
                            <span className="material-symbols-outlined text-xs">
                              {copiedId === order.id ? "done" : "content_copy"}
                            </span>
                          </button>
                        </td>

                        {/* Service Name */}
                        <td className="p-3.5 max-w-[200px]">
                          <span className="font-bold text-on-surface line-clamp-1" title={order.serviceName}>
                            {order.serviceName}
                          </span>
                        </td>

                        {/* Input / IMEI */}
                        <td className="p-3.5 font-mono text-[11px] text-on-surface-variant max-w-[160px] truncate">
                          {order.targetInput || order.imei || "—"}
                        </td>

                        {/* Reply / Result */}
                        <td className="p-3.5 max-w-[220px]">
                          {order.reply ? (
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 font-mono text-[11px]">
                              <span className="material-symbols-outlined text-xs shrink-0 text-emerald-400">key</span>
                              <span className="truncate">{cleanHtmlToText(order.reply)}</span>
                              <button
                                onClick={() => copyToClipboard(cleanHtmlToText(order.reply || ""), `reply-${order.id}`)}
                                className="ms-auto shrink-0 hover:text-white"
                                title="نسخ الكود"
                              >
                                <span className="material-symbols-outlined text-xs">
                                  {copiedId === `reply-${order.id}` ? "done" : "content_copy"}
                                </span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant/50">—</span>
                          )}
                        </td>

                        {/* Cost & Coupon */}
                        <td className="p-3.5 font-mono font-bold text-on-surface">
                          <div>${Number(order.price).toFixed(2)}</div>
                          {order.couponCode && (
                            <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                              <span>🎟️ {order.couponCode}</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {isAr ? "مكتمل" : "Completed"}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              {isAr ? "جاري المعالجة" : "Processing"}
                            </span>
                          )}
                          {isFailed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                              {isAr ? "مرفوض" : "Failed"}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-end font-mono text-[11px] text-on-surface-variant">
                          {new Date(order.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/15">
            <span>{isAr ? `إجمالي النتائج: ${filteredOrders.length}` : `Total results: ${filteredOrders.length}`}</span>
            <Link
              href={`/${lang}/orders`}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <span>{isAr ? "عرض صفحة الطلبات المتقدمة" : "Advanced Orders Page"}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}

      {/* TAB 2: TRANSACTIONS & TOP-UPS */}
      {activeTab === "transactions" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
          {/* Header with Search & Filter */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <span className="material-symbols-outlined absolute start-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg">
                search
              </span>
              <input
                type="text"
                value={txSearch}
                onChange={(e) => setTxSearch(e.target.value)}
                placeholder={isAr ? "ابحث برقم الإيصال أو الطريقة..." : "Search reference number, method..."}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 ps-10 pe-4 text-xs text-on-surface focus:outline-none focus:border-primary transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Filter Buttons & Refresh */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-xs font-bold">
                <button
                  onClick={() => setTxFilter("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${txFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "الكل" : "All"}
                </button>
                <button
                  onClick={() => setTxFilter("completed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${txFilter === "completed" ? "bg-emerald-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "معتمد 🟢" : "Completed"}
                </button>
                <button
                  onClick={() => setTxFilter("pending")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${txFilter === "pending" ? "bg-amber-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "قيد المراجعة ⏳" : "Pending"}
                </button>
                <button
                  onClick={() => setTxFilter("failed")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${txFilter === "failed" ? "bg-red-500 text-white shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {isAr ? "مرفوض 🔴" : "Failed"}
                </button>
              </div>

              <button
                onClick={fetchTransactions}
                disabled={loadingTransactions}
                className="px-3.5 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all"
                title={isAr ? "تحديث" : "Refresh"}
              >
                <span className={`material-symbols-outlined text-sm text-primary ${loadingTransactions ? "animate-spin" : ""}`}>
                  refresh
                </span>
                <span>{isAr ? "تحديث" : "Refresh"}</span>
              </button>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-high/60 text-on-surface-variant font-bold text-[11px] uppercase tracking-wider">
                  <th className="p-3.5 text-start">{isAr ? "نوع المعاملة" : "Type"}</th>
                  <th className="p-3.5 text-start">{isAr ? "طريقة الدفع" : "Payment Method"}</th>
                  <th className="p-3.5 text-start">{isAr ? "المبلغ" : "Amount"}</th>
                  <th className="p-3.5 text-start">{isAr ? "رقم التحويل / الإيصال" : "Ref / Transaction ID"}</th>
                  <th className="p-3.5 text-center">{isAr ? "الحالة" : "Status"}</th>
                  <th className="p-3.5 text-end">{isAr ? "تاريخ الإيداع" : "Date"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 font-medium">
                {loadingTransactions ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-primary">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                        <span>{isAr ? "جاري تحميل المعاملات..." : "Loading transactions..."}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTxs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">savings</span>
                        <p className="font-bold text-sm">{isAr ? "لا توجد معاملات شحن مسجلة" : "No transactions recorded"}</p>
                        <Link
                          href={`/${lang}/wallet`}
                          className="mt-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
                        >
                          {isAr ? "شحن المحفظة الآن" : "Top up wallet now"}
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTxs.map((tx) => {
                    const isSuccess = tx.status === "completed";
                    const isPending = tx.status === "pending";
                    const isFailed = tx.status === "failed" || tx.status === "rejected";

                    return (
                      <tr key={tx.id} className="hover:bg-surface-container-high/40 transition-colors">
                        {/* Type */}
                        <td className="p-3.5">
                          <span className="font-bold text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-sm text-emerald-400">arrow_downward</span>
                            <span>{isAr ? "إيداع رصيد" : "Deposit"}</span>
                          </span>
                        </td>

                        {/* Method */}
                        <td className="p-3.5 font-semibold text-on-surface">
                          <span className="px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/30 text-xs">
                            {tx.method || (isAr ? "تحويل مباشر" : "Direct Transfer")}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="p-3.5 font-mono font-black text-emerald-400 text-sm">
                          +${Number(tx.amount).toFixed(2)}
                        </td>

                        {/* Ref No */}
                        <td className="p-3.5 font-mono text-[11px] text-on-surface-variant">
                          <button
                            onClick={() => copyToClipboard(tx.refNo || tx.id, tx.id)}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                            title={isAr ? "نسخ" : "Copy"}
                          >
                            <span>{tx.refNo || tx.id.slice(0, 10)}</span>
                            <span className="material-symbols-outlined text-xs">
                              {copiedId === tx.id ? "done" : "content_copy"}
                            </span>
                          </button>
                        </td>

                        {/* Status */}
                        <td className="p-3.5 text-center">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                              {isAr ? "معتمد" : "Approved"}
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                              {isAr ? "قيد المراجعة" : "Pending"}
                            </span>
                          )}
                          {isFailed && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                              {isAr ? "مرفوض" : "Rejected"}
                            </span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="p-3.5 text-end font-mono text-[11px] text-on-surface-variant">
                          {new Date(tx.createdAt).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/15">
            <span>{isAr ? `إجمالي المعاملات: ${filteredTxs.length}` : `Total transactions: ${filteredTxs.length}`}</span>
            <Link
              href={`/${lang}/wallet`}
              className="text-primary hover:underline font-bold flex items-center gap-1"
            >
              <span>{isAr ? "صفحة المحفظة وطرق الشحن" : "Go to Wallet & Deposit Page"}</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}

      {/* TAB 3: ACCOUNT & SECURITY SETTINGS */}
      {activeTab === "settings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Account Overview Card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">badge</span>
              <span>{isAr ? "بطاقة الهوية والحساب" : "Account Overview"}</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 space-y-1">
                <span className="text-on-surface-variant">{isAr ? "معرّف الحساب الفريد (User ID)" : "User ID"}</span>
                <p className="font-mono text-primary font-bold text-[11px] break-all">
                  {profile?.id || userSession?.id}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 space-y-1">
                <span className="text-on-surface-variant">{isAr ? "مستوى العضوية الحالية" : "Membership Tier"}</span>
                <p className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: profile?.membershipTier?.badgeColor || "#2dd4bf" }}></span>
                  <span>{isAr ? (profile?.membershipTier?.nameAr || profile?.membershipTier?.name || "عضوية أساسية") : (profile?.membershipTier?.name || "Standard")}</span>
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 space-y-1">
                <span className="text-on-surface-variant">{isAr ? "تاريخ إنشاء الحساب" : "Member Since"}</span>
                <p className="font-mono text-on-surface font-bold">
                  {profile?.createdAt 
                    ? new Date(profile.createdAt).toLocaleDateString(isAr ? "ar-EG" : "en-US", { year: "numeric", month: "long", day: "numeric" })
                    : (isAr ? "عميل نشط" : "Active Member")}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-outline-variant/20 space-y-1">
                <span className="text-on-surface-variant">{isAr ? "حالة الحساب" : "Account Status"}</span>
                <p className="font-bold text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>{isAr ? "نشط ومفعّل بالكامل" : "Active & Verified"}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">tune</span>
              <span>{isAr ? "تعديل البيانات وكلمة المرور" : "Edit Profile & Password"}</span>
            </h2>

            {/* Alerts */}
            {settingsSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{settingsSuccess}</span>
              </div>
            )}

            {settingsError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{settingsError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {isAr ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {isAr ? "اسم المستخدم (Username)" : "Username"}
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {isAr ? "البريد الإلكتروني" : "Email Address"}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-on-surface-variant">
                    {isAr ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp"}
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+966xxxxxxxxx"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono dir-ltr"
                  />
                </div>
              </div>

              <div className="h-px bg-outline-variant/20 my-4"></div>

              {/* Password Fields */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-wider">
                  {isAr ? "تغيير كلمة المرور (اختياري)" : "Change Password (Optional)"}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {isAr ? "كلمة المرور الجديدة" : "New Password"}
                    </label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-on-surface-variant">
                      {isAr ? "تأكيد كلمة المرور الجديدة" : "Confirm New Password"}
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-primary transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-outline-variant/20 my-4"></div>

              {/* Current Password (Required to authorize change) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">lock</span>
                  <span>{isAr ? "كلمة المرور الحالية (مطلوبة لتأكيد أي تعديل)" : "Current Password (Required)"}</span>
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  required
                  placeholder={isAr ? "أدخل كلمة المرور الحالية هنا لحفظ التعديلات" : "Enter current password to confirm"}
                  className="w-full bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface focus:outline-none focus:border-amber-400 transition-all font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-xs shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  {savingSettings ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                      <span>{isAr ? "جاري الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>{isAr ? "حفظ التغييرات" : "Save Changes"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: API & DEVELOPER ACCESS */}
      {activeTab === "api" && (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/20">
            <div>
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-400 text-2xl">api</span>
                <span>{isAr ? "ربط الـ API وسيرفرات Dhru Fusion" : "API Integration & Dhru Fusion"}</span>
              </h2>
              <p className="text-xs text-on-surface-variant mt-1">
                {isAr 
                  ? "يمكنك ربط موقعك أو سيرفرك الشخصي مباشرة بسيرفرنا لتقديم الطلبات آلياً وبأسرع وقت." 
                  : "Connect your website or server directly to our platform to place automated orders."}
              </p>
            </div>

            {profile?.apiEnabled ? (
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>{isAr ? "حساب الـ API مفعل ✅" : "API Access Enabled"}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{isAr ? "الـ API غير مفعل حالياً" : "API Not Enabled"}</span>
              </span>
            )}
          </div>

          {profile?.apiEnabled ? (
            <div className="space-y-6">
              {/* API Key Box */}
              <div className="p-5 rounded-2xl bg-surface-container-high/70 border border-purple-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-purple-400">key</span>
                    <span>{isAr ? "مفتاح الـ API الخاص بك (API Key)" : "Your API Key"}</span>
                  </label>
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-xs text-purple-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    <span className="material-symbols-outlined text-xs">
                      {showApiKey ? "visibility_off" : "visibility"}
                    </span>
                    <span>{showApiKey ? (isAr ? "إخفاء" : "Hide") : (isAr ? "إظهار" : "Show")}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    readOnly
                    value={profile.apiKey || ""}
                    className="flex-1 bg-surface-container-lowest border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-primary font-mono select-all focus:outline-none"
                  />
                  <button
                    onClick={() => copyToClipboard(profile.apiKey || "")}
                    className="px-4 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all border border-purple-500/30"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey ? "done" : "content_copy"}
                    </span>
                    <span>{copiedKey ? (isAr ? "تم النسخ!" : "Copied!") : (isAr ? "نسخ" : "Copy")}</span>
                  </button>
                </div>
              </div>

              {/* Endpoint URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-sans font-bold">
                    {isAr ? "رابط نقطة النهاية (API Endpoint URL)" : "API Endpoint URL"}
                  </span>
                  <p className="text-primary font-bold break-all">
                    https://arabtechproserver.tech/api/v1/provider
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-1">
                  <span className="text-[11px] text-on-surface-variant font-sans font-bold">
                    {isAr ? "اسم المستخدم للـ API (Username)" : "API Username"}
                  </span>
                  <p className="text-secondary font-bold">
                    {profile.username}
                  </p>
                </div>
              </div>

              {/* Dhru Fusion Guide */}
              <div className="p-5 rounded-2xl bg-surface-container-high/50 border border-outline-variant/20 space-y-3 text-xs leading-relaxed text-on-surface-variant">
                <h4 className="font-bold text-on-surface text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">info</span>
                  <span>{isAr ? "طريقة الربط مع سكربت Dhru Fusion:" : "Dhru Fusion Integration Guide:"}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 pe-4">
                  <li>{isAr ? "افتح لوحة تحكم سيرفرك (Dhru Fusion Admin Panel)" : "Open your Dhru Fusion Admin Panel"}</li>
                  <li>{isAr ? "توجه إلى Providers Setup ثم أضف مزود جديد بنوع Dhru Fusion API" : "Go to Providers Setup and add a new Dhru Fusion API provider"}</li>
                  <li>{isAr ? "في حقل Server URL ضع الرابط أعلاه بالضبط" : "In Server URL enter the exact endpoint URL above"}</li>
                  <li>{isAr ? "في حقل Username ضع اسم المستخدم الخاص بك" : "In Username enter your username"}</li>
                  <li>{isAr ? "في حقل API Key ضع المفتاح السري الموضح أعلاه" : "In API Key enter your secret API Key"}</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mx-auto">
                <span className="material-symbols-outlined text-3xl">developer_board</span>
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-on-surface">
                  {isAr ? "هل ترغب في ربط موقعك بالـ API؟" : "Want to connect via API?"}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {isAr 
                    ? "تفعيل الـ API يتيح لك ربط سيرفرك بسيرفرنا آلياً والحصول على أسعار موزعين خاصة. تواصل مع الدعم الفني لتفعيل المفتاح فوراً." 
                    : "Enabling API allows you to connect your server automatically and get wholesale reseller rates. Contact support to enable."}
                </p>
              </div>
              <Link
                href={`/${lang}/contact`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-lg transition-all"
              >
                <span className="material-symbols-outlined text-sm">support_agent</span>
                <span>{isAr ? "طلب تفعيل حساب الـ API" : "Request API Activation"}</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
