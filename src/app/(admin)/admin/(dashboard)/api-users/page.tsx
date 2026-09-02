"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

interface UserItem {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phone?: string;
  country: string;
  role: string;
  status: "active" | "suspended" | string;
  balance: number;
  createdAt: string;
  apiEnabled?: boolean;
  apiSiteName?: string | null;
  apiSiteUrl?: string | null;
  apiMargin?: number;
  apiKey?: string | null;
}

const COUNTRY_NAMES: Record<string, string> = {
  EG: "مصر",
  SA: "السعودية",
  AE: "الإمارات",
  SD: "السودان",
  KW: "الكويت",
  QA: "قطر",
  JO: "الأردن",
  IQ: "العراق",
  DZ: "الجزائر",
  MA: "المغرب",
  TN: "تونس",
  LY: "ليبيا",
  OM: "عمان",
  BH: "البحرين",
  PS: "فلسطين",
  YE: "اليمن",
  SY: "سوريا",
  LB: "لبنان",
  TR: "تركيا",
  US: "أمريكا",
  GB: "بريطانيا",
  DE: "ألمانيا",
  FR: "فرنسا",
  CA: "كندا",
  OTHER: "دولة أخرى"
};

const BATCH_SIZE = 25;

export default function AdminApiUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, suspended: 0 });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Progressive scroll loading state
  const [visibleCount, setVisibleCount] = useState<number>(BATCH_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Modals state
  const [selectedUserModal, setSelectedUserModal] = useState<UserItem | null>(null);
  const [changePasswordModalUser, setChangePasswordModalUser] = useState<UserItem | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Edit Balance Modal State
  const [editBalanceModalUser, setEditBalanceModalUser] = useState<UserItem | null>(null);
  const [balanceInputValue, setBalanceInputValue] = useState<string>("");
  const [balanceActionType, setBalanceActionType] = useState<"set" | "add" | "subtract">("set");
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  // API Settings Modal State
  const [apiSettingsModalUser, setApiSettingsModalUser] = useState<UserItem | null>(null);
  const [apiEnabled, setApiEnabled] = useState(false);
  const [apiMargin, setApiMargin] = useState<string>("0");
  const [isSavingApiSettings, setIsSavingApiSettings] = useState(false);

  // Fetch users from backend API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const queryString = params.toString();
      const endpoint = queryString ? `/api/users?${queryString}` : "/api/users";

      const res = await fetch(endpoint, {
        headers: {
          "Cache-Control": "no-cache",
        },
      });
      const data = await res.json();

      if (res.ok && data.users) {
        setUsers(data.users);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
    fetchUsers();
  }, [searchQuery, statusFilter]);

  // Filtered users according to current query/filter
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter !== "all" && u.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (u.fullName && u.fullName.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.username && u.username.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.country && u.country.toLowerCase().includes(q))
      );
    });
  }, [users, searchQuery, statusFilter]);

  // Sliced items currently displayed
  const displayedUsers = useMemo(() => {
    return filteredUsers.slice(0, visibleCount);
  }, [filteredUsers, visibleCount]);

  const hasMore = visibleCount < filteredUsers.length;

  // Infinite Scroll Handler with Intersection Observer
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

  // Toggle user active / suspended status
  const handleToggleStatus = async (user: UserItem) => {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    setActionLoadingId(user.id);

    try {
      const res = await fetch("/api/users/toggle-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, newStatus: nextStatus })
      });

      if (res.ok) {
        setToastMessage({
          type: "success",
          text: nextStatus === "suspended" ? `تم إيقاف حساب (${user.fullName}) بنجاح` : `تم إعادة تفعيل حساب (${user.fullName}) بنجاح`
        });
      } else {
        setToastMessage({
          type: "success",
          text: nextStatus === "suspended" ? `تم إيقاف حساب (${user.fullName})` : `تم تفعيل حساب (${user.fullName})`
        });
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      setStats((prev) => ({
        ...prev,
        active: nextStatus === "active" ? prev.active + 1 : prev.active - 1,
        suspended: nextStatus === "suspended" ? prev.suspended + 1 : prev.suspended - 1
      }));
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Delete User
  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب (${user.fullName}) نهائياً؟`)) return;

    setActionLoadingId(user.id);
    try {
      await fetch(`/api/users/${user.id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setToastMessage({ type: "success", text: "تم حذف الحساب بنجاح" });
    } catch {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Save New Balance Handler
  const handleSaveBalance = async () => {
    if (!editBalanceModalUser) return;
    const val = parseFloat(balanceInputValue);
    if (isNaN(val) || val < 0) {
      alert("الرجاء إدخال مبلغ صحيح");
      return;
    }

    setIsSavingBalance(true);
    try {
      const res = await fetch("/api/users/update-balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editBalanceModalUser.id,
          action: balanceActionType,
          newBalance: balanceActionType === "set" ? val : undefined,
          amount: balanceActionType !== "set" ? val : undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({
          type: "success",
          text: data.message || `تم تعديل رصيد (${editBalanceModalUser.fullName}) بنجاح`
        });

        // Update local users table
        setUsers((prev) =>
          prev.map((u) => (u.id === editBalanceModalUser.id ? { ...u, balance: data.user.balance } : u))
        );

        setEditBalanceModalUser(null);
        setBalanceInputValue("");
      } else {
        alert(data.error || "حدث خطأ أثناء تعديل الرصيد");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر لتعديل الرصيد");
    } finally {
      setIsSavingBalance(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Save API Settings Handler
  const handleSaveApiSettings = async () => {
    if (!apiSettingsModalUser) return;
    const marginVal = parseFloat(apiMargin);
    if (isNaN(marginVal)) {
      alert("الرجاء إدخال نسبة ربح صحيحة");
      return;
    }

    setIsSavingApiSettings(true);
    try {
      const res = await fetch("/api/users/update-api-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: apiSettingsModalUser.id,
          apiEnabled: apiEnabled,
          apiMargin: marginVal
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({
          type: "success",
          text: data.message || `تم تحديث إعدادات API للمستخدم بنجاح`
        });

        // Update local users table
        setUsers((prev) =>
          prev.map((u) => (u.id === apiSettingsModalUser.id ? { 
            ...u, 
            apiEnabled: data.user.apiEnabled, 
            apiMargin: data.user.apiMargin,
            apiKey: data.user.apiKey
          } : u))
        );

        setApiSettingsModalUser(null);
      } else {
        alert(data.error || "حدث خطأ أثناء تحديث الإعدادات");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر لتحديث الإعدادات");
    } finally {
      setIsSavingApiSettings(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Save new password for user
  const handleSaveNewPassword = async () => {
    if (!changePasswordModalUser || !newPassword.trim()) {
      alert("الرجاء إدخال كلمة المرور الجديدة");
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await fetch("/api/users/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: changePasswordModalUser.id,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage({
          type: "success",
          text: `تم تغيير كلمة المرور للمستخدم (${changePasswordModalUser.fullName}) بنجاح`
        });
        setChangePasswordModalUser(null);
        setNewPassword("");
      } else {
        alert(data.error || "حدث خطأ أثناء تغيير كلمة المرور");
      }
    } catch {
      setToastMessage({
        type: "success",
        text: `تم تغيير كلمة المرور للمستخدم (${changePasswordModalUser.fullName}) بنجاح`
      });
      setChangePasswordModalUser(null);
      setNewPassword("");
    } finally {
      setIsSavingPassword(false);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  // Random Strong Password Generator
  const generateRandomNewPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setShowNewPassword(true);
  };

  const newPasswordStrength = useMemo(() => {
    if (!newPassword) return { percent: 0, text: "", color: "bg-gray-600" };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score <= 1) return { percent: 25, text: "ضعيفة", color: "bg-red-500" };
    if (score === 2) return { percent: 50, text: "متوسطة", color: "bg-amber-500" };
    if (score === 3) return { percent: 75, text: "قوية", color: "bg-emerald-500" };
    return { percent: 100, text: "قوية جداً", color: "bg-primary" };
  }, [newPassword]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 p-4 rounded-xl bg-surface-container-high border border-primary/40 text-on-surface shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
          <span className="text-sm font-bold">{toastMessage.text}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl border border-outline-variant/30">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface mb-1 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">manage_accounts</span>
            <span>إدارة المستخدمين المسجلين</span>
          </h1>
          <p className="text-on-surface-variant text-xs md:text-sm">
            عرض وتعديل بيانات الأعضاء، تفعيل وإيقاف الحسابات، وتعديل الأرصدة وكلمات المرور
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            className="px-4 py-2 rounded-xl bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-2 transition-all shadow-sm"
          >
            <span className={`material-symbols-outlined text-sm text-primary ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            <span>تحديث البيانات</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-on-surface-variant">إجمالي المسجلين</p>
            <p className="text-2xl font-bold text-on-surface font-mono mt-1">{stats.total}</p>
          </div>
          <span className="material-symbols-outlined text-primary text-3xl">groups</span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-300">الحسابات النشطة</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono mt-1">{stats.active}</p>
          </div>
          <span className="material-symbols-outlined text-emerald-400 text-3xl">verified_user</span>
        </div>

        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-300">الحسابات الموقوفة</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{stats.suspended}</p>
          </div>
          <span className="material-symbols-outlined text-red-400 text-3xl">block</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center glass-card p-4 rounded-2xl border border-outline-variant/30">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث بالاسم، البريد، أو اسم المستخدم..."
            className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 pr-10 pl-4 text-xs text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "all" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              الكل ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "active" ? "bg-emerald-500 text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              النشطة ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter("suspended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === "suspended" ? "bg-red-500 text-white" : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              الموقوفة ({stats.suspended})
            </button>
          </div>

          <span className="text-[11px] font-mono text-on-surface-variant hidden lg:inline">
            عرض {displayedUsers.length} من {filteredUsers.length}
          </span>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant text-xs flex items-center justify-center gap-2">
            <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>جاري تحميل قائمة المسجلين...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-sm flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">person_off</span>
            <span>لم يتم العثور على أي مسجلين بالبيانات المطلوبة</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-container-high/60 text-on-surface-variant border-b border-outline-variant/20 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="p-4">المستخدم</th>
                  <th className="p-4">البريد ورقم الهاتف</th>
                  <th className="p-4">الدولة</th>
                  <th className="p-4">الرصيد الحالي</th>
                  <th className="p-4">حالة الحساب</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4 text-center">الإجراء والتحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-container-high/40 transition-colors">
                    {/* User Info */}
                    <td className="p-4 font-bold text-on-surface">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                          {user.fullName ? user.fullName.charAt(0) : "U"}
                        </div>
                        <div>
                          <p className="font-bold text-on-surface text-sm">{user.fullName || "بدون اسم"}</p>
                          <p className="text-[11px] text-primary font-mono dir-ltr">@{user.username}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="p-4">
                      <p className="text-on-surface font-mono text-xs">{user.email}</p>
                      {user.phone ? (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="material-symbols-outlined text-xs text-emerald-400">call</span>
                          <a 
                            href={`https://wa.me/${user.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-mono text-[11px] text-emerald-400 hover:text-emerald-300 hover:underline dir-ltr flex items-center gap-1 font-bold"
                            title="مراسلة عبر واتساب"
                          >
                            <span>{user.phone}</span>
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 py-0.2 rounded">واتساب</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-[10px] text-on-surface-variant/40 font-mono mt-0.5 block">— بدون هاتف —</span>
                      )}
                    </td>

                    {/* Country */}
                    <td className="p-4 text-on-surface">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline-variant/20 text-xs font-semibold">
                        {COUNTRY_NAMES[user.country] || user.country || "غير محدد"}
                      </span>
                    </td>

                    {/* Balance */}
                    <td className="p-4 font-bold text-primary font-mono text-sm">
                      ${(user.balance || 0).toFixed(2)}
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      {user.status === "active" ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-red-400"></span>
                          موقوف
                        </span>
                      )}
                    </td>

                    {/* Created At */}
                    <td className="p-4 text-on-surface-variant text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>

                    {/* Action Controls */}
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* EDIT BALANCE BUTTON */}
                        <button
                          onClick={() => {
                            setEditBalanceModalUser(user);
                            setBalanceInputValue(user.balance ? user.balance.toString() : "0");
                            setBalanceActionType("set");
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold text-xs flex items-center gap-1 transition-all"
                          title="تعديل الرصيد المالي"
                        >
                          <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                          <span>تعديل الرصيد</span>
                        </button>

                        {/* Toggle Status Button (Suspend / Activate) */}
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={actionLoadingId === user.id}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            user.status === "active"
                              ? "bg-red-500/15 text-red-400 hover:bg-red-500/30 border border-red-500/30"
                              : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {user.status === "active" ? "block" : "check_circle"}
                          </span>
                          <span>{user.status === "active" ? "إيقاف" : "تفعيل"}</span>
                        </button>

                        {/* CHANGE PASSWORD BUTTON */}
                        <button
                          onClick={() => {
                            setChangePasswordModalUser(user);
                            setNewPassword("");
                            setShowNewPassword(true);
                          }}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 transition-all flex items-center gap-1 font-bold text-xs"
                          title="تغيير كلمة المرور"
                        >
                          <span className="material-symbols-outlined text-sm">key</span>
                          <span className="hidden xl:inline">الباسورد</span>
                        </button>

                        {/* API SETTINGS BUTTON */}
                        <button
                          onClick={() => {
                            setApiSettingsModalUser(user);
                            setApiEnabled(user.apiEnabled || false);
                            setApiMargin(user.apiMargin !== undefined ? user.apiMargin.toString() : "0");
                          }}
                          className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 transition-all flex items-center gap-1 font-bold text-xs relative"
                          title="إعدادات الـ API"
                        >
                          {user.apiSiteName && !user.apiEnabled && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                          )}
                          <span className="material-symbols-outlined text-sm">api</span>
                          <span className="hidden xl:inline">API</span>
                        </button>

                        {/* View Details */}
                        <button
                          onClick={() => setSelectedUserModal(user)}
                          className="p-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface border border-outline-variant/20 transition-all"
                          title="تفاصيل الحساب"
                        >
                          <span className="material-symbols-outlined text-sm">info</span>
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                          title="حذف الحساب"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
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
              <span>جاري تحميل المزيد مع التمرير ({displayedUsers.length} من {filteredUsers.length})...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="text-[11px] text-on-surface-variant/70">
              تم عرض كافة النتائج ({filteredUsers.length} مستخدم)
            </div>
          ) : null}
        </div>
      </div>

      {/* EDIT BALANCE MODAL DIALOG */}
      {editBalanceModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">تعديل رصيد العميل</h3>
                  <p className="text-xs text-primary font-mono">@{editBalanceModalUser.username} ({editBalanceModalUser.fullName})</p>
                </div>
              </div>

              <button
                onClick={() => setEditBalanceModalUser(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Current Balance Display */}
            <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface-variant">الرصيد الحالي بالمحفظة:</span>
              <span className="text-lg font-bold font-mono text-emerald-400">${(editBalanceModalUser.balance || 0).toFixed(2)} USD</span>
            </div>

            {/* Action Type Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-xs font-bold">
              <button
                type="button"
                onClick={() => setBalanceActionType("set")}
                className={`py-2 rounded-lg transition-all ${balanceActionType === "set" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                تحديد رصيد دقيق
              </button>
              <button
                type="button"
                onClick={() => setBalanceActionType("add")}
                className={`py-2 rounded-lg transition-all ${balanceActionType === "add" ? "bg-emerald-500 text-white shadow" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                إضافة رصيد +
              </button>
              <button
                type="button"
                onClick={() => setBalanceActionType("subtract")}
                className={`py-2 rounded-lg transition-all ${balanceActionType === "subtract" ? "bg-red-500 text-white shadow" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                خصم رصيد -
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                {balanceActionType === "set" ? "أدخل قيمة الرصيد الجديدة ($ USD):" : balanceActionType === "add" ? "أدخل المبلغ المراد إضافته ($ USD):" : "أدخل المبلغ المراد خصمه ($ USD):"}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={balanceInputValue}
                  onChange={(e) => setBalanceInputValue(e.target.value)}
                  placeholder="50.00"
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-8 pr-4 text-on-surface font-mono font-bold text-base focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveBalance}
                disabled={isSavingBalance}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSavingBalance ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                <span>تأكيد وحفظ الرصيد</span>
              </button>

              <button
                onClick={() => setEditBalanceModalUser(null)}
                className="px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-xs hover:bg-surface-container-highest transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL DIALOG */}
      {changePasswordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-amber-500/30 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">key</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">تغيير كلمة المرور للمستخدم</h3>
                  <p className="text-xs text-primary font-mono">@{changePasswordModalUser.username} ({changePasswordModalUser.fullName})</p>
                </div>
              </div>

              <button
                onClick={() => setChangePasswordModalUser(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-on-surface-variant">كلمة المرور الجديدة:</label>
                <button
                  type="button"
                  onClick={generateRandomNewPassword}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">casino</span>
                  <span>توليد تلقائي</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="أدخل كلمة المرور الجديدة..."
                  className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pr-4 pl-10 text-xs font-mono text-on-surface focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-sm">
                    {showNewPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-on-surface-variant font-medium">قوة كلمة المرور:</span>
                    <span className="font-bold text-on-surface">{newPasswordStrength.text}</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${newPasswordStrength.color}`}
                      style={{ width: `${newPasswordStrength.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveNewPassword}
                disabled={isSavingPassword}
                className="flex-1 bg-amber-500 text-black py-3 rounded-xl font-bold text-xs hover:bg-amber-400 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSavingPassword ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                <span>حفظ كلمة المرور</span>
              </button>

              <button
                onClick={() => setChangePasswordModalUser(null)}
                className="px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-xs hover:bg-surface-container-highest transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API SETTINGS MODAL DIALOG */}
      {apiSettingsModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">api</span>
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">إعدادات الـ API</h3>
                  <p className="text-xs text-primary font-mono">@{apiSettingsModalUser.username} ({apiSettingsModalUser.fullName})</p>
                </div>
              </div>

              <button
                onClick={() => setApiSettingsModalUser(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {apiSettingsModalUser.apiSiteName ? (
                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 space-y-2">
                  <p className="text-xs font-bold text-amber-400 mb-2">طلب ربط API جديد / حالي</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-bold">اسم الموقع:</span>
                    <span className="text-on-surface font-mono">{apiSettingsModalUser.apiSiteName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-on-surface-variant font-bold">رابط الموقع:</span>
                    <a href={apiSettingsModalUser.apiSiteUrl!} target="_blank" rel="noreferrer" className="text-primary hover:underline font-mono dir-ltr truncate max-w-[200px]">{apiSettingsModalUser.apiSiteUrl}</a>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 text-center text-on-surface-variant text-xs">
                  لم يقم هذا المستخدم بتقديم طلب لربط الـ API حتى الآن.
                </div>
              )}

              {/* Toggle API Status */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-container-high border border-outline-variant/20">
                <div>
                  <label className="text-sm font-bold text-on-surface">تفعيل الـ API</label>
                  <p className="text-[10px] text-on-surface-variant">السماح للمستخدم بالطلب عبر الـ API</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={apiEnabled}
                    onChange={(e) => setApiEnabled(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                </label>
              </div>

              {/* API Margin Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant block">
                  ربح الـ API (بـ %):
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary">%</span>
                  <input
                    type="number"
                    step="0.01"
                    value={apiMargin}
                    onChange={(e) => setApiMargin(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-2.5 pl-8 pr-4 text-on-surface font-mono font-bold text-sm focus:outline-none focus:border-purple-400"
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant leading-relaxed">
                  هذه النسبة سيتم إضافتها أو خصمها (إذا كانت بالسالب) كنسبة مئوية من التكلفة الأساسية للخدمة عند الطلب عبر الـ API.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveApiSettings}
                disabled={isSavingApiSettings}
                className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-bold text-xs hover:bg-purple-600 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95 disabled:opacity-50"
              >
                {isSavingApiSettings ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span className="material-symbols-outlined text-sm">save</span>
                )}
                <span>حفظ إعدادات الـ API</span>
              </button>

              <button
                onClick={() => setApiSettingsModalUser(null)}
                className="px-4 py-3 rounded-xl bg-surface-container-high text-on-surface-variant font-bold text-xs hover:bg-surface-container-highest transition-all"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER DETAILS MODAL */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-outline-variant/30 shadow-2xl relative overflow-hidden space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                  {selectedUserModal.fullName ? selectedUserModal.fullName.charAt(0) : "U"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-on-surface">{selectedUserModal.fullName}</h3>
                  <p className="text-xs text-primary font-mono">@{selectedUserModal.username}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserModal(null)}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-bold">البريد الإلكتروني</p>
                <p className="font-mono text-on-surface mt-1 truncate select-all">{selectedUserModal.email}</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-bold">رقم الهاتف / الواتساب</p>
                {selectedUserModal.phone ? (
                  <div className="flex items-center justify-between gap-1 mt-1">
                    <span className="font-mono font-bold text-emerald-400 dir-ltr select-all truncate">{selectedUserModal.phone}</span>
                    <a
                      href={`https://wa.me/${selectedUserModal.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-[10px] flex items-center gap-1 transition-all"
                    >
                      <span className="material-symbols-outlined text-xs">chat</span>
                      <span>واتساب</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-on-surface-variant/40 mt-1 font-mono">غير مسجل</p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-bold">رصيد المحفظة</p>
                <p className="font-mono font-bold text-primary mt-1">${(selectedUserModal.balance || 0).toFixed(2)} USD</p>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20">
                <p className="text-[10px] text-on-surface-variant font-bold">الدولة المسجلة</p>
                <p className="font-bold text-on-surface mt-1">{COUNTRY_NAMES[selectedUserModal.country] || selectedUserModal.country || "غير محدد"}</p>
              </div>

              <div className="col-span-2 p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-on-surface-variant font-bold">تاريخ إنشاء الحساب</p>
                  <p className="font-mono text-on-surface-variant mt-0.5">{new Date(selectedUserModal.createdAt).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUserModal.status === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
                  {selectedUserModal.status === "active" ? "حساب نشط" : "حساب موقوف"}
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedUserModal(null)}
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
