"use client";

import { useState, useEffect, useCallback } from "react";

interface AllowedIp {
  id: string;
  ipAddress: string;
  label: string | null;
  isActive: boolean;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  lastAccessAt: string | null;
}

interface AccessLog {
  id: string;
  userId: string | null;
  username: string | null;
  ipAddress: string;
  userAgent: string | null;
  status: "allowed" | "blocked";
  reason: string | null;
  createdAt: string;
}

interface StatsData {
  allowedCount: number;
  maxLimit: number;
  successfulAccess: number;
  blockedAttempts: number;
  activeAdmins: number;
  isRestrictionEnabled: boolean;
}

export default function IpAccessManagementPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [allowedIps, setAllowedIps] = useState<AllowedIp[]>([]);
  const [isRestrictionEnabled, setIsRestrictionEnabled] = useState(false);
  const [currentClientIp, setCurrentClientIp] = useState<string>("");
  const [isCurrentIpAllowed, setIsCurrentIpAllowed] = useState(false);

  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isToggleLoading, setIsToggleLoading] = useState(false);
  const [isDetectingIp, setIsDetectingIp] = useState(false);
  const [isAddingIp, setIsAddingIp] = useState(false);
  const [isDeletingIp, setIsDeletingIp] = useState<string | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState<string | null>(null);

  // Modals & Form
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<AllowedIp | null>(null);
  const [editingIp, setEditingIp] = useState<AllowedIp | null>(null);
  const [inputIp, setInputIp] = useState("");
  const [inputLabel, setInputLabel] = useState("");

  // Logs state
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [logStatusFilter, setLogStatusFilter] = useState<"all" | "allowed" | "blocked">("all");
  const [logSearch, setLogSearch] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  // Notification banners
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage("");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setSuccessMessage("");
    setTimeout(() => setErrorMessage(""), 6000);
  };

  // Fetch status, stats and allowed list
  const loadData = useCallback(async () => {
    try {
      const [statusRes, allowedRes, statsRes] = await Promise.all([
        fetch("/api/admin/ip-access/status"),
        fetch("/api/admin/ip-access/allowed-ips"),
        fetch("/api/admin/ip-access/stats")
      ]);

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setIsRestrictionEnabled(statusData.isRestrictionEnabled);
        setCurrentClientIp(statusData.currentIp || "");
        setIsCurrentIpAllowed(Boolean(statusData.isCurrentIpAllowed));
      }

      if (allowedRes.ok) {
        const allowedData = await allowedRes.json();
        setAllowedIps(allowedData.allowedIps || []);
      }

      if (statsRes.ok) {
        const statsObj = await statsRes.json();
        setStats(statsObj.stats || null);
      }
    } catch {
      showError("تعذر تحميل بيانات إدارة الـ IP من السيرفر");
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  // Fetch access logs
  const loadLogs = useCallback(async (page: number, status: string, search: string) => {
    setIsLogsLoading(true);
    try {
      const query = new URLSearchParams({
        page: String(page),
        limit: "10",
        ...(status !== "all" && { status }),
        ...(search.trim() && { search: search.trim() })
      });

      const res = await fetch(`/api/admin/ip-access/logs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setLogsTotalPages(data.pages || 1);
        setLogsPage(data.page || 1);
      }
    } catch {
      // Non blocking
    } finally {
      setIsLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadLogs(logsPage, logStatusFilter, logSearch);
  }, [loadLogs, logsPage, logStatusFilter, logSearch]);

  // Master switch toggle
  const handleToggleRestriction = async () => {
    const targetState = !isRestrictionEnabled;

    if (targetState && !isCurrentIpAllowed) {
      showError("يجب إضافة عنوان الـ IP الحالي وتفعيله قبل تشغيل نظام حماية الـ IP لمنع قفل لوحة التحكم.");
      return;
    }

    const confirmMsg = targetState
      ? "هل أنت متأكد من رغبتك في تفعيل حماية الـ IP؟ لن يتمكن أي جهاز من فتح لوحة التحكم إلا إذا كان عنوان الـ IP الخاص به مسموحاً ونشطاً."
      : "هل أنت متأكد من رغبتك في تعطيل حماية الـ IP؟ سيتمكن أي حساب إداري من الدخول من أي شبكة.";

    if (!confirm(confirmMsg)) return;

    setIsToggleLoading(true);
    try {
      const res = await fetch("/api/admin/ip-access/toggle-restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: targetState })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsRestrictionEnabled(data.isRestrictionEnabled);
        showSuccess(data.message || "تم تحديث حالة الحماية بنجاح");
        await loadData();
      } else {
        showError(data.error || "فشل في تحديث حالة الحماية");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لتغيير حالة الحماية");
    } finally {
      setIsToggleLoading(false);
    }
  };

  // Get current client IP from backend
  const handleGetMyIp = async () => {
    setIsDetectingIp(true);
    try {
      const res = await fetch("/api/admin/ip-access/my-ip");
      if (res.ok) {
        const data = await res.json();
        setCurrentClientIp(data.ip || "");
        setIsCurrentIpAllowed(Boolean(data.isAllowed));
        showSuccess(`عنوان الـ IP الحالي الخاص بك هو: ${data.ip}`);
      } else {
        showError("تعذر كشف عنوان الـ IP من السيرفر");
      }
    } catch {
      showError("حدث خطأ أثناء فحص عنوان الـ IP");
    } finally {
      setIsDetectingIp(false);
    }
  };

  // Add current IP directly
  const handleAddCurrentIp = () => {
    if (allowedIps.length >= (stats?.maxLimit || 2)) {
      showError(`تم الوصول للحد الأقصى لعناوين الـ IP المسموحة (${stats?.maxLimit || 2} عناوين)`);
      return;
    }
    setInputIp(currentClientIp || "");
    setInputLabel("الشبكة الحالية");
    setShowAddModal(true);
  };

  // Submit Add IP
  const handleSubmitAddIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputIp.trim()) {
      showError("يرجى إدخال عنوان الـ IP");
      return;
    }

    setIsAddingIp(true);
    try {
      const res = await fetch("/api/admin/ip-access/allowed-ips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: inputIp.trim(),
          label: inputLabel.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("تم إضافة عنوان الـ IP إلى القائمة المسموحة بنجاح");
        setShowAddModal(false);
        setInputIp("");
        setInputLabel("");
        await loadData();
      } else {
        showError(data.error || "فشل في إضافة عنوان الـ IP");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لإضافة الـ IP");
    } finally {
      setIsAddingIp(false);
    }
  };

  // Toggle active status for an IP
  const handleToggleIpStatus = async (item: AllowedIp) => {
    setIsTogglingStatus(item.id);
    try {
      const res = await fetch(`/api/admin/ip-access/allowed-ips/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(`تم ${!item.isActive ? "تفعيل" : "تعطيل"} عنوان الـ IP بنجاح`);
        await loadData();
      } else {
        showError(data.error || "فشل في تعديل حالة عنوان الـ IP");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لتعديل الحالة");
    } finally {
      setIsTogglingStatus(null);
    }
  };

  // Submit Edit IP label
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIp) return;

    try {
      const res = await fetch(`/api/admin/ip-access/allowed-ips/${editingIp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: inputLabel.trim() || null })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("تم تحديث تسمية عنوان الـ IP بنجاح");
        setShowEditModal(false);
        setEditingIp(null);
        setInputLabel("");
        await loadData();
      } else {
        showError(data.error || "فشل في تحديث التسمية");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر للتحديث");
    }
  };

  // Delete IP
  const handleConfirmDelete = async () => {
    if (!showDeleteModal) return;

    setIsDeletingIp(showDeleteModal.id);
    try {
      const res = await fetch(`/api/admin/ip-access/allowed-ips/${showDeleteModal.id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess("تم حذف عنوان الـ IP من القائمة بنجاح");
        setShowDeleteModal(null);
        await loadData();
      } else {
        showError(data.error || "فشل في حذف عنوان الـ IP");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لحذف الـ IP");
    } finally {
      setIsDeletingIp(null);
    }
  };

  const maxLimit = stats?.maxLimit || 2;
  const currentCount = allowedIps.length;
  const isMaxReached = currentCount >= maxLimit;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-on-surface-variant text-sm">
        <span className="material-symbols-outlined animate-spin text-2xl ml-2">progress_activity</span>
        <span>جاري تحميل إعدادات حماية الـ IP...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">shield</span>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-on-surface">
              إدارة عناوين الـ IP والأجهزة
            </h1>
            <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
              حماية لوحة التحكم بالكامل وتقييد الوصول على شبكات وعناوين IP معتمدة فقط
            </p>
          </div>
        </div>

        {/* Master Protection Switch Box */}
        <div className="bg-surface-container border border-outline-variant/40 rounded-2xl p-4 flex items-center justify-between gap-6 shadow-sm">
          <div className="text-right">
            <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
              <span>حماية لوحة التحكم (IP Restriction)</span>
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  isRestrictionEnabled ? "bg-emerald-500 animate-pulse" : "bg-zinc-500"
                }`}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">
              {isRestrictionEnabled ? "مفعلة: الدخول مقتصر على العناوين المسموحة" : "معطلة: الدخول متاح من أي شبكة"}
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleRestriction}
            disabled={isToggleLoading}
            className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
              isRestrictionEnabled ? "bg-emerald-600" : "bg-zinc-700"
            }`}
            title="تفعيل أو تعطيل حماية الـ IP"
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                isRestrictionEnabled ? "-translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage("")} className="text-emerald-400 hover:text-emerald-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-xs md:text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">error</span>
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage("")} className="text-red-400 hover:text-red-300">
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>
      )}

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Allowed IPs */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">عناوين الـ IP المسموحة</span>
            <span className="material-symbols-outlined text-primary text-xl">lan</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-on-surface">
              {currentCount} / {maxLimit}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">عناوين نشطة</span>
          </div>
          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isMaxReached ? "bg-amber-500" : "bg-primary"
              }`}
              style={{ width: `${(currentCount / maxLimit) * 100}%` }}
            />
          </div>
        </div>

        {/* Card 2: Successful Access */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">عمليات الدخول الناجحة</span>
            <span className="material-symbols-outlined text-emerald-500 text-xl">verified_user</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">
              {stats?.successfulAccess ?? 0}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">عملية مصرحة</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">من عناوين IP المعتمدة</p>
        </div>

        {/* Card 3: Blocked Attempts */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">المحاولات المحظورة</span>
            <span className="material-symbols-outlined text-red-400 text-xl">gpp_bad</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-red-400">
              {stats?.blockedAttempts ?? 0}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">محاولة دخول</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">تم رفضها برمز 403</p>
        </div>

        {/* Card 4: Active Admins */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">حسابات الإدارة النشطة</span>
            <span className="material-symbols-outlined text-secondary text-xl">manage_accounts</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-on-surface">
              {stats?.activeAdmins ?? 1}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">مشرفين مؤهلين</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">أدوار Super Admin و Admin</p>
        </div>
      </div>

      {/* Current IP Detection Box */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant">عنوان الـ IP العام لطلبك الحالي:</span>
            <code className="font-mono text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-xl border border-primary/20" dir="ltr">
              {currentClientIp || "لم يتم التحديد"}
            </code>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                isCurrentIpAllowed
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {isCurrentIpAllowed ? "مسموح ومعتمد" : "غير مضاف للقائمة"}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant">
            يتم استخراج عنوان الـ IP من السيرفر مباشرة عبر اتصالات موثوقة مع معالجة حقيقية لأي بروكسي.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleGetMyIp}
            disabled={isDetectingIp}
            className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-base">my_location</span>
            <span>{isDetectingIp ? "جاري الفحص..." : "معرفة الـ IP الحالي"}</span>
          </button>

          {!isCurrentIpAllowed && (
            <button
              type="button"
              onClick={handleAddCurrentIp}
              disabled={isMaxReached}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">add_moderator</span>
              <span>إضافة الـ IP الحالي</span>
            </button>
          )}
        </div>
      </div>

      {/* Allowed IPs Section */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base md:text-lg font-bold text-on-surface">
              العناوين والشبكات المصرح لها (Allowed IPs)
            </h2>
            <span className="text-xs font-mono font-bold bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant/30 text-on-surface-variant">
              {currentCount} / {maxLimit}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setInputIp("");
              setInputLabel("");
              setShowAddModal(true);
            }}
            disabled={isMaxReached}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
          >
            <span className="material-symbols-outlined text-base">add</span>
            <span>إضافة عنوان IP</span>
          </button>
        </div>

        {/* IPs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/40 text-on-surface-variant font-semibold">
                <th className="p-4">عنوان الـ IP (Network)</th>
                <th className="p-4">التسمية / الوصف</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">أضيف بواسطة</th>
                <th className="p-4">تاريخ الإضافة</th>
                <th className="p-4">آخر دخول</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {allowedIps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">desktop_access_disabled</span>
                      <p className="font-semibold">لا يوجد عناوين IP مسجلة حالياً</p>
                      <p className="text-[11px] text-on-surface-variant/70">
                        أضف عنوان الـ IP الحالي الخاص بك لتفعيل نظام حماية لوحة التحكم.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                allowedIps.map((item) => {
                  const isCurrent = currentClientIp && (item.ipAddress === currentClientIp || item.ipAddress.includes(currentClientIp));
                  return (
                    <tr key={item.id} className="hover:bg-surface-container-high/30 transition-colors">
                      {/* IP Address */}
                      <td className="p-4 font-mono font-bold text-on-surface" dir="ltr">
                        <div className="flex items-center gap-2">
                          <span>{item.ipAddress}</span>
                          {isCurrent && (
                            <span className="text-[10px] font-sans font-bold bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-md">
                              أنت الآن
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Label */}
                      <td className="p-4 font-medium text-on-surface">
                        {item.label || <span className="text-on-surface-variant/60 font-normal">بدون تسمية</span>}
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleIpStatus(item)}
                          disabled={isTogglingStatus === item.id}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            item.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isActive ? "bg-emerald-400" : "bg-zinc-500"
                            }`}
                          />
                          <span>{item.isActive ? "نشط" : "معطل"}</span>
                        </button>
                      </td>

                      {/* Created By */}
                      <td className="p-4 text-on-surface-variant font-medium">
                        {item.createdBy || "Super Admin"}
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-on-surface-variant font-mono">
                        {new Date(item.createdAt).toLocaleDateString("ar-EG", {
                          year: "numeric",
                          month: "short",
                          day: "numeric"
                        })}
                      </td>

                      {/* Last Access */}
                      <td className="p-4 text-on-surface-variant font-mono">
                        {item.lastAccessAt ? (
                          new Date(item.lastAccessAt).toLocaleString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        ) : (
                          <span className="text-on-surface-variant/50">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit Label */}
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIp(item);
                              setInputLabel(item.label || "");
                              setShowEditModal(true);
                            }}
                            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
                            title="تعديل التسمية"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => setShowDeleteModal(item)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-colors"
                            title="حذف عنوان الـ IP"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dashboard Access Logs Section */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base md:text-lg font-bold text-on-surface">
              سجل الوصول للوحة التحكم (Dashboard Access Logs)
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              تتبع جميع محاولات الدخول الناجحة والمرفوضة بالتاريخ والوقت والجهاز
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Status Filter Tabs */}
            <div className="bg-surface border border-outline-variant/40 rounded-xl p-1 flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setLogStatusFilter("all");
                  setLogsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  logStatusFilter === "all"
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogStatusFilter("allowed");
                  setLogsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  logStatusFilter === "allowed"
                    ? "bg-emerald-600 text-white font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                مسموح
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogStatusFilter("blocked");
                  setLogsPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  logStatusFilter === "blocked"
                    ? "bg-red-600 text-white font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                محظور
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogsPage(1);
                }}
                placeholder="بحث برقم الـ IP أو المستخدم..."
                className="bg-surface border border-outline-variant/40 rounded-xl pl-3 pr-9 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary outline-none transition-all w-52"
              />
              <span className="material-symbols-outlined text-base text-on-surface-variant absolute right-2.5 top-1/2 -translate-y-1/2">
                search
              </span>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/40 text-on-surface-variant font-semibold">
                <th className="p-4">المستخدم</th>
                <th className="p-4">عنوان الـ IP</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">التاريخ والوقت</th>
                <th className="p-4">الجهاز / المتصفح</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {isLogsLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-xl ml-2">progress_activity</span>
                    <span>جاري تحميل السجلات...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                    لا توجد سجلات تطابق معايير البحث الحالية
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-high/30 transition-colors">
                    {/* User */}
                    <td className="p-4 font-bold text-on-surface">
                      {log.username || log.userId || "زائر / غير مسجل"}
                    </td>

                    {/* IP */}
                    <td className="p-4 font-mono font-bold text-on-surface" dir="ltr">
                      {log.ipAddress}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                          log.status === "allowed"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            log.status === "allowed" ? "bg-emerald-400" : "bg-red-400"
                          }`}
                        />
                        <span>{log.status === "allowed" ? "مسموح" : "محظور"}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="p-4 text-on-surface-variant font-mono">
                      {new Date(log.createdAt).toLocaleString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </td>

                    {/* Device / User Agent */}
                    <td className="p-4 text-on-surface-variant max-w-xs truncate" title={log.userAgent || ""}>
                      {log.userAgent || "غير محدد"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {logsTotalPages > 1 && (
          <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
            <span>
              صفحة {logsPage} من {logsTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLogsPage((p) => Math.max(1, p - 1))}
                disabled={logsPage <= 1 || isLogsLoading}
                className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 hover:bg-surface-container-high transition-all disabled:opacity-40"
              >
                السابق
              </button>
              <button
                type="button"
                onClick={() => setLogsPage((p) => Math.min(logsTotalPages, p + 1))}
                disabled={logsPage >= logsTotalPages || isLogsLoading}
                className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/40 hover:bg-surface-container-high transition-all disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add IP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_moderator</span>
                <span>إضافة عنوان IP مسموح</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitAddIp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  عنوان الـ IP (IPv4 أو IPv6) *
                </label>
                <input
                  type="text"
                  required
                  value={inputIp}
                  onChange={(e) => setInputIp(e.target.value)}
                  placeholder="مثال: 41.233.12.34"
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface font-mono outline-none focus:border-primary transition-all"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تسمية الجهاز أو الشبكة (اختياري)
                </label>
                <input
                  type="text"
                  value={inputLabel}
                  onChange={(e) => setInputLabel(e.target.value)}
                  placeholder="مثال: My Laptop, Office Network"
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="bg-surface-variant/30 border border-outline-variant/30 rounded-xl p-3 text-[11px] text-on-surface-variant leading-relaxed">
                الحد الأقصى المسموح به هو 2 عناوين IP. يتم التحقق من صحة الصيغة والتأكد من عدم التكرار قبل الحفظ.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isAddingIp}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {isAddingIp ? "جاري الحفظ..." : "حفظ العنوان"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit IP Modal */}
      {showEditModal && editingIp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                <span>تعديل تسمية عنوان الـ IP</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingIp(null);
                }}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-1">
                  عنوان الـ IP:
                </label>
                <div className="font-mono text-sm font-bold text-on-surface bg-surface border border-outline-variant/40 rounded-xl px-4 py-2" dir="ltr">
                  {editingIp.ipAddress}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تسمية الجهاز أو الشبكة
                </label>
                <input
                  type="text"
                  value={inputLabel}
                  onChange={(e) => setInputLabel(e.target.value)}
                  placeholder="مثال: My Laptop, Home Network"
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none focus:border-primary transition-all"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingIp(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all shadow-md shadow-primary/20"
                >
                  حفظ التعديل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete IP Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline-variant/40 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">warning</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface">تأكيد حذف عنوان الـ IP</h3>
            </div>

            <div className="space-y-2 text-xs text-on-surface-variant leading-relaxed">
              <p>
                هل أنت متأكد من رغبتك في حذف عنوان الـ IP التالي من القائمة المسموحة؟
              </p>
              <div className="font-mono text-sm font-bold text-red-400 bg-surface border border-outline-variant/40 rounded-xl px-4 py-2 my-2 text-center" dir="ltr">
                {showDeleteModal.ipAddress} {showDeleteModal.label ? `(${showDeleteModal.label})` : ""}
              </div>
              {isRestrictionEnabled && currentClientIp && showDeleteModal.ipAddress === currentClientIp && (
                <p className="font-bold text-red-400 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                  تحذير أمني: هذا هو عنوان الـ IP الذي تستخدمه حالياً. لا يمكنك حذفه أثناء تفعيل حماية الـ IP حتى لا يتم قفل لوحة التحكم عليك.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/40 text-xs font-semibold text-on-surface transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={Boolean(isDeletingIp)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md shadow-red-600/20 disabled:opacity-50"
              >
                {isDeletingIp ? "جاري الحذف..." : "نعم، حذف العنوان"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
