"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getOrCreateDeviceToken,
  getDeviceFingerprint,
  getLocalIpViaWebRTC,
  getDeviceDescription
} from "@/utils/deviceUtils";

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

interface AllowedDevice {
  id: string;
  deviceToken: string;
  fingerprint: string | null;
  label: string | null;
  localIp: string | null;
  lastIp: string | null;
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
  localIp?: string | null;
  deviceToken?: string | null;
  userAgent: string | null;
  status: "allowed" | "blocked";
  reason: string | null;
  createdAt: string;
}

interface StatsData {
  allowedCount: number;
  devicesCount?: number;
  maxLimit: number;
  successfulAccess: number;
  blockedAttempts: number;
  activeAdmins: number;
  isRestrictionEnabled: boolean;
}

export default function IpAccessManagementPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [allowedIps, setAllowedIps] = useState<AllowedIp[]>([]);
  const [devices, setDevices] = useState<AllowedDevice[]>([]);
  const [isRestrictionEnabled, setIsRestrictionEnabled] = useState(false);
  const [currentClientIp, setCurrentClientIp] = useState<string>("");
  const [isCurrentIpAllowed, setIsCurrentIpAllowed] = useState(false);

  // Device & WebRTC states
  const [currentDeviceToken, setCurrentDeviceToken] = useState<string>("");
  const [currentFingerprint, setCurrentFingerprint] = useState<string>("");
  const [webrtcLocalIp, setWebrtcLocalIp] = useState<string | null>(null);
  const [isMdnsLocal, setIsMdnsLocal] = useState<boolean>(false);
  const [isDetectingWebRtc, setIsDetectingWebRtc] = useState<boolean>(false);
  const [isAuthorizingDevice, setIsAuthorizingDevice] = useState<boolean>(false);
  const [isDeletingDevice, setIsDeletingDevice] = useState<string | null>(null);
  const [isTogglingDevice, setIsTogglingDevice] = useState<string | null>(null);
  const [deviceLabelInput, setDeviceLabelInput] = useState<string>("");

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

  // Extract client device token and WebRTC local IP on mount
  useEffect(() => {
    try {
      const token = getOrCreateDeviceToken();
      setCurrentDeviceToken(token);
      setDeviceLabelInput(getDeviceDescription());
      getDeviceFingerprint().then((fp) => setCurrentFingerprint(fp));

      setIsDetectingWebRtc(true);
      getLocalIpViaWebRTC(2000)
        .then((res) => {
          setWebrtcLocalIp(res.localIp);
          setIsMdnsLocal(res.isMdns);
        })
        .finally(() => {
          setIsDetectingWebRtc(false);
        });
    } catch (_) {}
  }, []);

  // Fetch status, stats, allowed list, and devices
  const loadData = useCallback(async () => {
    try {
      const [statusRes, allowedRes, statsRes, devicesRes] = await Promise.all([
        fetch("/api/admin/ip-access/status"),
        fetch("/api/admin/ip-access/allowed-ips"),
        fetch("/api/admin/ip-access/stats"),
        fetch("/api/admin/ip-access/devices").catch(() => null)
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

      if (devicesRes && devicesRes.ok) {
        const devData = await devicesRes.json().catch(() => ({}));
        setDevices(devData.devices || []);
      }
    } catch {
      showError("تعذر تحميل بيانات إدارة الـ IP والأجهزة من السيرفر");
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

  const currentDeviceRecord = devices.find((d) => d.deviceToken === currentDeviceToken);
  const isCurrentDeviceAuthorized = Boolean(currentDeviceRecord && currentDeviceRecord.isActive);

  // Authorize Current Device (Trusted Device Fingerprint)
  const handleAuthorizeCurrentDevice = async () => {
    const token = currentDeviceToken || getOrCreateDeviceToken();
    if (!token) {
      showError("تعذر استخراج رمز الجهاز السري");
      return;
    }

    setIsAuthorizingDevice(true);
    try {
      const res = await fetch("/api/admin/ip-access/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deviceToken: token,
          fingerprint: currentFingerprint,
          label: deviceLabelInput.trim() || getDeviceDescription(),
          localIp: webrtcLocalIp
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(data.message || "تم اعتماد هذا الجهاز بنجاح. يمكنك الآن الدخول من هذا الجهاز بحرية تامة من أي مكان.");
        await loadData();
      } else {
        showError(data.error || "فشل في اعتماد الجهاز");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لاعتماد الجهاز");
    } finally {
      setIsAuthorizingDevice(false);
    }
  };

  const handleToggleDeviceStatus = async (id: string, currentStatus: boolean) => {
    setIsTogglingDevice(id);
    try {
      const res = await fetch(`/api/admin/ip-access/devices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(data.message || "تم تحديث حالة الجهاز بنجاح");
        await loadData();
      } else {
        showError(data.error || "فشل في تحديث حالة الجهاز");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لتحديث حالة الجهاز");
    } finally {
      setIsTogglingDevice(null);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في إلغاء اعتماد هذا الجهاز؟ لن يتمكن هذا الجهاز من الدخول إلا إذا كان عنوان الـ IP الخاص به مسموحاً.")) return;

    setIsDeletingDevice(id);
    try {
      const res = await fetch(`/api/admin/ip-access/devices/${id}`, {
        method: "DELETE"
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showSuccess(data.message || "تم إلغاء اعتماد الجهاز وحذفه بنجاح");
        await loadData();
      } else {
        showError(data.error || "فشل في حذف الجهاز");
      }
    } catch {
      showError("تعذر الاتصال بالسيرفر لحذف الجهاز");
    } finally {
      setIsDeletingDevice(null);
    }
  };

  // Master switch toggle
  const handleToggleRestriction = async () => {
    const targetState = !isRestrictionEnabled;

    if (targetState && !isCurrentIpAllowed && !isCurrentDeviceAuthorized) {
      showError("يجب إضافة عنوان الـ IP الحالي أو اعتماد هذا الجهاز أولاً قبل تشغيل نظام حماية الـ IP لمنع قفل لوحة التحكم.");
      return;
    }

    const confirmMsg = targetState
      ? "هل أنت متأكد من رغبتك في تفعيل حماية الـ IP؟ لن يتمكن أي جهاز من فتح لوحة التحكم إلا إذا كان مضافاً في عناوين الـ IP المسموحة أو مسجلاً كجهاز معتمد."
      : "هل أنت متأكد من رغبتك في تعطيل حماية الـ IP؟ سيتمكن أي حساب إداري من الدخول من أي شبكة.";

    if (!confirm(confirmMsg)) return;

    setIsToggleLoading(true);
    try {
      const res = await fetch("/api/admin/ip-access/toggle-restriction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: targetState, currentDeviceToken })
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


  // Get current client IP from backend and refresh WebRTC
  const handleGetMyIp = async () => {
    setIsDetectingIp(true);
    try {
      const token = currentDeviceToken || getOrCreateDeviceToken();
      const res = await fetch(`/api/admin/ip-access/my-ip?deviceToken=${encodeURIComponent(token)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentClientIp(data.ip || "");
        setIsCurrentIpAllowed(Boolean(data.isAllowed));
        showSuccess(`عنوان الـ IP الحالي الخاص بك هو: ${data.ip}`);
      } else {
        showError("تعذر كشف عنوان الـ IP من السيرفر");
      }

      // Refresh WebRTC Local IP
      getLocalIpViaWebRTC(2000).then((rtc) => {
        setWebrtcLocalIp(rtc.localIp);
        setIsMdnsLocal(rtc.isMdns);
      });
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

    if (/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|169\.254\.)/.test(inputIp.trim())) {
      showError("عنوان الـ IP المدخل هو عنوان محلي خاص بالجهاز (مثل 192.168). يجب استخدام عنوان الـ IP العام للشبكة (Public IP).");
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <span className="text-xs text-on-surface-variant font-medium">عناوين</span>
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

        {/* Card 2: Authorized Devices */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">الأجهزة المعتمدة</span>
            <span className="material-symbols-outlined text-emerald-400 text-xl">devices</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-emerald-400">
              {devices.length} / 5
            </span>
            <span className="text-xs text-on-surface-variant font-medium">أجهزة</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">دخول غير مقيد بالـ IP</p>
        </div>

        {/* Card 3: Successful Access */}
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
          <p className="text-[11px] text-on-surface-variant mt-2">من عناوين وأجهزة مسموحة</p>
        </div>

        {/* Card 4: Blocked Attempts */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">المحاولات المحظورة</span>
            <span className="material-symbols-outlined text-red-400 text-xl">gpp_bad</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-red-400">
              {stats?.blockedAttempts ?? 0}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">محاولة</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">تم رفضها برمز 403</p>
        </div>

        {/* Card 5: Active Admins */}
        <div className="bg-surface-container border border-outline-variant/30 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-on-surface-variant">حسابات الإدارة النشطة</span>
            <span className="material-symbols-outlined text-secondary text-xl">manage_accounts</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-mono font-bold text-on-surface">
              {stats?.activeAdmins ?? 1}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">مشرفين</span>
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">Super Admin و Admin</p>
        </div>
      </div>

      {/* Trusted Device & WebRTC Local IP Panel */}
      <div className="bg-surface-container border border-outline-variant/40 rounded-3xl p-5 md:p-6 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-5">
          <div className="flex items-start md:items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
              isCurrentDeviceAuthorized
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
            }`}>
              <span className="material-symbols-outlined text-2xl">
                {isCurrentDeviceAuthorized ? "verified_user" : "devices"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-on-surface">
                  نظام «الجهاز المعتمد» (Trusted Device Fingerprint)
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                  isCurrentDeviceAuthorized
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}>
                  {isCurrentDeviceAuthorized ? "هذا الجهاز معتمد ومصرح له" : "هذا الجهاز غير معتمد بعد"}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isCurrentDeviceAuthorized
                  ? "تم تسجيل بصمة هذا المتصفح والهاتف بنجاح في قاعدة البيانات. يمكنك الدخول للوحة التحكم من أي مكان بالعالم (4G أو واي فاي) دون حظر."
                  : "سجل هذا الهاتف كجهاز معتمد بضغطة زر واحدة لتتمكن من الدخول من أي شبكة 4G دون القلق من تغير عنوان الـ IP المتكرر."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isCurrentDeviceAuthorized ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={deviceLabelInput}
                  onChange={(e) => setDeviceLabelInput(e.target.value)}
                  placeholder="اسم هذا الجهاز (مثال: هاتف الآدمن)"
                  className="bg-surface border border-outline-variant/40 rounded-xl px-3 py-2 text-xs text-on-surface outline-none focus:border-primary transition-all w-44"
                />
                <button
                  type="button"
                  onClick={handleAuthorizeCurrentDevice}
                  disabled={isAuthorizingDevice}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">verified</span>
                  <span>{isAuthorizingDevice ? "جاري الاعتماد..." : "اعتماد هذا الجهاز الآن"}</span>
                </button>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>محمي ومصرح له من أي شبكة</span>
              </div>
            )}
          </div>
        </div>

        {/* Network & Local IP WebRTC Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Public IP */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">public</span>
                <span>الـ IP العام لشبكة الإنترنت (Public Network IP):</span>
              </span>
              <div className="flex items-center gap-2">
                <code className="font-mono text-sm font-bold text-primary" dir="ltr">
                  {currentClientIp || "لم يتم الكشف"}
                </code>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  isCurrentIpAllowed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}>
                  {isCurrentIpAllowed ? "مسموح بالـ IP" : "غير مضاف بالـ IP"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleGetMyIp}
                disabled={isDetectingIp}
                className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs transition-all"
                title="تحديث فحص عنوان الشبكة"
              >
                <span className={`material-symbols-outlined text-base ${isDetectingIp ? "animate-spin" : ""}`}>
                  sync
                </span>
              </button>
              {!isCurrentIpAllowed && (
                <button
                  type="button"
                  onClick={handleAddCurrentIp}
                  disabled={allowedIps.length >= (stats?.maxLimit || 2)}
                  className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  <span>إضافة</span>
                </button>
              )}
            </div>
          </div>

          {/* WebRTC Local IP */}
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-amber-400">lan</span>
                <span>الـ IP الداخلي لكرت الشبكة (WebRTC Local IP):</span>
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {isDetectingWebRtc ? (
                  <span className="text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    <span>جاري استخراج العنوان الداخلي عبر RTCPeerConnection...</span>
                  </span>
                ) : webrtcLocalIp ? (
                  <>
                    <code className="font-mono text-sm font-bold text-amber-400" dir="ltr">
                      {webrtcLocalIp}
                    </code>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md border bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {isMdnsLocal ? "حماية خصوصية (mDNS Host)" : "كرت الشبكة الداخلي (LAN)"}
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-on-surface-variant">
                    محمي بواسطة إعدادات خصوصية المتصفح
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsDetectingWebRtc(true);
                getLocalIpViaWebRTC(2000).then((res) => {
                  setWebrtcLocalIp(res.localIp);
                  setIsMdnsLocal(res.isMdns);
                }).finally(() => setIsDetectingWebRtc(false));
              }}
              disabled={isDetectingWebRtc}
              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs transition-all"
              title="إعادة فحص الـ IP الداخلي عبر WebRTC"
            >
              <span className={`material-symbols-outlined text-base ${isDetectingWebRtc ? "animate-spin" : ""}`}>
                refresh
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Authorized Devices Section */}
      <div className="bg-surface-container border border-outline-variant/30 rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-outline-variant/30 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <span className="material-symbols-outlined text-xl">devices</span>
            </div>
            <div>
              <h2 className="text-base md:text-lg font-bold text-on-surface">
                الأجهزة المعتمدة في النظام (Authorized Trusted Devices)
              </h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                أجهزة المشرفين المصرح لها بتخطي قيود الـ IP والدخول من أي مكان
              </p>
            </div>
            <span className="text-xs font-mono font-bold bg-surface-container-high px-2.5 py-1 rounded-lg border border-outline-variant/30 text-on-surface-variant">
              {devices.length} / 5 أجهزة
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-high/40 text-on-surface-variant font-semibold">
                <th className="p-4">الجهاز / المتصفح</th>
                <th className="p-4">الـ IP الداخلي (WebRTC)</th>
                <th className="p-4">آخر IP عام تم الدخول منه</th>
                <th className="p-4">الحالة</th>
                <th className="p-4">تاريخ الاعتماد</th>
                <th className="p-4">آخر دخول</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {devices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-on-surface-variant/40">phonelink_off</span>
                      <p className="font-semibold text-xs">لا يوجد أي جهاز معتمد مسجل حالياً</p>
                      <p className="text-[11px] text-on-surface-variant/70">
                        اضغط على &quot;اعتماد هذا الجهاز الآن&quot; بالأعلى لتسجيل هاتفك أو جهازك الحالي وتفادي قفل الحساب عند تغير الـ IP.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                devices.map((device) => {
                  const isCurrent = device.deviceToken === currentDeviceToken;
                  return (
                    <tr key={device.id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface">
                            {device.label || "جهاز مشرف"}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold bg-primary/15 text-primary border border-primary/20 px-2 py-0.5 rounded-md">
                              هذا الجهاز الحالي
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4 font-mono text-on-surface-variant" dir="ltr">
                        {device.localIp || "-"}
                      </td>

                      <td className="p-4 font-mono font-bold text-on-surface" dir="ltr">
                        {device.lastIp || "-"}
                      </td>

                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => handleToggleDeviceStatus(device.id, device.isActive)}
                          disabled={isTogglingDevice === device.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                            device.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20 hover:bg-zinc-500/20"
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${device.isActive ? "bg-emerald-400" : "bg-zinc-500"}`} />
                          <span>{device.isActive ? "معتمد ونشط" : "معطل"}</span>
                        </button>
                      </td>

                      <td className="p-4 text-on-surface-variant font-mono">
                        {new Date(device.createdAt).toLocaleString("ar-EG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>

                      <td className="p-4 text-on-surface-variant font-mono">
                        {device.lastAccessAt ? (
                          new Date(device.lastAccessAt).toLocaleString("ar-EG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        ) : (
                          <span className="text-on-surface-variant/50">-</span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteDevice(device.id)}
                          disabled={isDeletingDevice === device.id}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-on-surface-variant hover:text-red-400 transition-colors"
                          title="إلغاء اعتماد الجهاز وحذفه"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
                    <td className="p-4 font-mono text-on-surface" dir="ltr">
                      <div className="font-bold">{log.ipAddress}</div>
                      {log.localIp && (
                        <div className="text-[10px] text-amber-400 font-sans flex items-center gap-1 mt-0.5" dir="rtl">
                          <span className="material-symbols-outlined text-xs">lan</span>
                          <span className="font-mono" dir="ltr">{log.localIp}</span>
                          <span>(داخلي)</span>
                        </div>
                      )}
                      {log.deviceToken && (
                        <div className="text-[10px] text-emerald-400 font-sans flex items-center gap-1 mt-0.5" dir="rtl">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          <span>جهاز معتمد</span>
                        </div>
                      )}
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-on-surface">
                    عنوان الـ IP العام للشبكة (أو نطاق مثل 197.252.98.*) *
                  </label>
                  {currentClientIp && (
                    <button
                      type="button"
                      onClick={() => {
                        setInputIp(currentClientIp);
                        if (!inputLabel) setInputLabel("شبكة الاتصال الحالية");
                      }}
                      className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">my_location</span>
                      <span>استخدام عنوان شبكتي الحالية</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={inputIp}
                  onChange={(e) => setInputIp(e.target.value)}
                  placeholder="مثال: 197.252.98.196 أو 197.252.98.*"
                  className="w-full bg-surface border border-outline-variant/40 rounded-xl px-4 py-2.5 text-xs text-on-surface font-mono outline-none focus:border-primary transition-all"
                  dir="ltr"
                />
                {/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.|127\.|169\.254\.)/.test(inputIp.trim()) && (
                  <p className="text-[11px] text-amber-400 mt-1.5 font-medium">
                    تنبيه: هذا عنوان داخلي خاص بالجهاز فقط ولا يعمل عبر الإنترنت. يرجى إدخال عنوان الـ IP العام للشبكة.
                  </p>
                )}
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
