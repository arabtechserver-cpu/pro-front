"use client";

import { useState, useEffect, useRef } from "react";

interface ParsedBackupInfo {
  filename: string;
  totalCustomers: number;
  totalOrders: number;
  totalTransactions: number;
  totalServices: number;
  totalBlogPosts: number;
  rawBackupData: any;
}

export default function BackupsClient() {
  const [backups, setBackups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActioning, setIsActioning] = useState(false);
  const [actionStatusText, setActionStatusText] = useState("");
  const [alertMessage, setAlertMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Selective Restore Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [parsedInfo, setParsedInfo] = useState<ParsedBackupInfo | null>(null);
  const [selectedOptions, setSelectedOptions] = useState({
    customers: true,
    updateBalances: true,
    orders: true,
    transactions: true,
    services: false,
    blogPosts: false,
    mode: "merge" as "merge" | "overwrite",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBackups();
  }, []);

  const getAuthHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("user_token") || localStorage.getItem("token");
    const headers: Record<string, string> = {};
    if (token && token !== "null" && token !== "undefined") {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }
    return headers;
  };

  const fetchBackups = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/backup", {
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error("Failed to fetch backups");
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Create a new backup on the server
  const createBackup = async () => {
    setIsActioning(true);
    setActionStatusText("جاري إنشاء النسخة الاحتياطية على الخادم...");
    setAlertMessage(null);
    try {
      const res = await fetch("/api/backup/create", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم إنشاء النسخة الاحتياطية بنجاح على الخادم!" });
        fetchBackups();
      } else {
        setAlertMessage({ type: "error", text: data.error || "تعذر إنشاء النسخة الاحتياطية" });
      }
    } catch (error) {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
    }
  };

  // 2. Download backup file to device
  const downloadBackup = async (filename: string) => {
    setIsActioning(true);
    setActionStatusText(`جاري تحميل الملف ${filename}...`);
    try {
      const res = await fetch(`/api/backup/download/${filename}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("فشل تحميل الملف من الخادم");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setAlertMessage({ type: "success", text: `تم تحميل ملف النسخة (${filename}) إلى جهازك بنجاح!` });
    } catch (error: any) {
      setAlertMessage({ type: "error", text: error.message || "حدث خطأ أثناء تحميل الملف" });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
    }
  };

  // 3. User selects file from PC -> Parse locally and show Selective Restore Modal
  const handleFileSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      setAlertMessage({ type: "error", text: "يرجى اختيار ملف نسخة احتياطية بصيغة JSON (.json) فقط." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setIsActioning(true);
      setActionStatusText("جاري فحص محتويات ملف النسخة...");
      const text = await file.text();
      const rawData = JSON.parse(text);
      const tables = rawData.tables || rawData;

      const customers = rawData.customers || tables.customers || tables.users || tables.User || [];
      const orders = rawData.orders || tables.orders || tables.Order || [];
      const txns = rawData.transactions || tables.transactions || tables.Transaction || [];
      const walletTxns = rawData.walletTransactions || tables.wallet_transactions || tables.WalletTransaction || [];
      const services = rawData.dhruServices || tables.dhru_services || tables.services || tables.DhruService || [];
      const blogPosts = rawData.blogPosts || tables.blog_posts || tables.BlogPost || [];

      setParsedInfo({
        filename: file.name,
        totalCustomers: Array.isArray(customers) ? customers.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalTransactions: (Array.isArray(txns) ? txns.length : 0) + (Array.isArray(walletTxns) ? walletTxns.length : 0),
        totalServices: Array.isArray(services) ? services.length : 0,
        totalBlogPosts: Array.isArray(blogPosts) ? blogPosts.length : 0,
        rawBackupData: rawData,
      });

      setIsModalOpen(true);
    } catch (err: any) {
      setAlertMessage({ type: "error", text: `تعذر قراءة ملف الـ JSON: ${err.message}` });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 4. Open Modal for a server-saved file
  const handleOpenServerFileModal = async (filename: string) => {
    try {
      setIsActioning(true);
      setActionStatusText(`جاري قراءة النسخة ${filename} من الخادم...`);

      const res = await fetch(`/api/backup/download/${filename}`, {
        headers: getAuthHeaders(),
        credentials: "include",
      });

      if (!res.ok) throw new Error("تعذر جلب ملف النسخة من الخادم");
      const rawData = await res.json();
      const tables = rawData.tables || rawData;

      const customers = rawData.customers || tables.customers || tables.users || tables.User || [];
      const orders = rawData.orders || tables.orders || tables.Order || [];
      const txns = rawData.transactions || tables.transactions || tables.Transaction || [];
      const walletTxns = rawData.walletTransactions || tables.wallet_transactions || tables.WalletTransaction || [];
      const services = rawData.dhruServices || tables.dhru_services || tables.services || tables.DhruService || [];
      const blogPosts = rawData.blogPosts || tables.blog_posts || tables.BlogPost || [];

      setParsedInfo({
        filename,
        totalCustomers: Array.isArray(customers) ? customers.length : 0,
        totalOrders: Array.isArray(orders) ? orders.length : 0,
        totalTransactions: (Array.isArray(txns) ? txns.length : 0) + (Array.isArray(walletTxns) ? walletTxns.length : 0),
        totalServices: Array.isArray(services) ? services.length : 0,
        totalBlogPosts: Array.isArray(blogPosts) ? blogPosts.length : 0,
        rawBackupData: rawData,
      });

      setIsModalOpen(true);
    } catch (err: any) {
      setAlertMessage({ type: "error", text: `خطأ: ${err.message}` });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
    }
  };

  // 5. Execute Selective Restore
  const executeSelectiveRestore = async () => {
    if (!parsedInfo) return;

    // Filter payload on client to only send chosen tables (keeps it ultra-lightweight)
    const rawData = parsedInfo.rawBackupData;
    const tables = rawData.tables || rawData;

    const filteredPayload: any = {
      version: rawData.version || "1.0",
      createdAt: rawData.created_at || rawData.createdAt || new Date().toISOString(),
    };

    if (selectedOptions.customers) {
      filteredPayload.customers = rawData.customers || tables.customers || tables.users || tables.User || [];
    }
    if (selectedOptions.orders) {
      filteredPayload.orders = rawData.orders || tables.orders || tables.Order || [];
    }
    if (selectedOptions.transactions) {
      filteredPayload.transactions = rawData.transactions || tables.transactions || tables.Transaction || [];
      filteredPayload.walletTransactions = rawData.walletTransactions || tables.wallet_transactions || tables.WalletTransaction || [];
    }
    if (selectedOptions.services) {
      filteredPayload.dhruServices = rawData.dhruServices || tables.dhru_services || tables.services || tables.DhruService || [];
      filteredPayload.dhruCategories = rawData.dhruCategories || tables.dhru_categories || tables.categories || tables.DhruCategory || [];
    }
    if (selectedOptions.blogPosts) {
      filteredPayload.blogPosts = rawData.blogPosts || tables.blog_posts || tables.BlogPost || [];
    }

    setIsModalOpen(false);
    setIsActioning(true);
    setActionStatusText("جاري استرجاع وتحديث البيانات المحددة في قاعدة البيانات...");
    setAlertMessage(null);

    try {
      const res = await fetch("/api/backup/selective-restore", {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          backupData: filteredPayload,
          options: selectedOptions,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const stats = data.stats || {};
        const summary = `تمت العملية بنجاح! تم تحديث/استرجاع: (${stats.usersProcessed || 0} مستخدم، ${stats.balancesUpdated || 0} رصيد، ${stats.ordersProcessed || 0} طلب، ${stats.transactionsProcessed || 0} معاملة).`;
        setAlertMessage({ type: "success", text: summary });
        fetchBackups();
      } else {
        setAlertMessage({ type: "error", text: data.error || "فشل الاسترجاع المخصص" });
      }
    } catch (err: any) {
      setAlertMessage({ type: "error", text: `فشل الاتصال: ${err.message}` });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
    }
  };

  // 6. Delete backup file from server
  const deleteBackup = async (filename: string) => {
    if (!confirm(`هل أنت متأكد من حذف النسخة الاحتياطية (${filename}) نهائياً؟`)) return;

    setIsActioning(true);
    setActionStatusText("جاري الحذف...");
    setAlertMessage(null);
    try {
      const res = await fetch(`/api/backup/${filename}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAlertMessage({ type: "success", text: "تم حذف النسخة بنجاح" });
        fetchBackups();
      } else {
        setAlertMessage({ type: "error", text: data.error || "تعذر الحذف" });
      }
    } catch (error) {
      setAlertMessage({ type: "error", text: "تعذر الاتصال بالسيرفر" });
    } finally {
      setIsActioning(false);
      setActionStatusText("");
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      {/* Hidden File Input for Device Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelection}
        accept=".json"
        className="hidden"
      />

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 glass-card p-6 sm:p-8 rounded-3xl border border-outline-variant/30 shadow-xl bg-surface-container/40 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-3xl text-primary glow-cyan">cloud_sync</span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-on-surface">
              إدارة النسخ الاحتياطي (Backups)
            </h1>
          </div>
          <p className="text-on-surface-variant text-sm sm:text-base max-w-2xl leading-relaxed">
            يمكنك حفظ نسخ احتياطية كاملة، تحميلها إلى جهازك، أو رفع أي ملف واختيار البيانات التي ترغب في استرجاعها وتحديثها بالتحديد (المستخدمين، الأرصدة، الطلبات، المعاملات).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Upload and Selectively Restore Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isActioning}
            className="px-5 py-3 rounded-2xl bg-secondary/15 hover:bg-secondary/25 text-secondary border border-secondary/30 font-bold flex items-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
            title="رفع ملف JSON من الكمبيوتر واختيار البيانات المراد استرجاعها"
          >
            <span className="material-symbols-outlined text-xl">upload_file</span>
            <span>رفع واستيراد البيانات من الجهاز</span>
          </button>

          {/* Create New Server Backup Button */}
          <button
            onClick={createBackup}
            disabled={isActioning}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
          >
            {isActioning ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <span className="material-symbols-outlined text-xl">save</span>
            )}
            <span>إنشاء نسخة جديدة</span>
          </button>
        </div>
      </div>

      {/* Action Progress Bar / Notification */}
      {isActioning && actionStatusText && (
        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 text-primary text-sm font-bold flex items-center gap-3 animate-pulse">
          <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
          <span>{actionStatusText}</span>
        </div>
      )}

      {/* Alerts */}
      {alertMessage && (
        <div
          className={`p-4 rounded-2xl text-sm font-bold flex items-center justify-between gap-3 shadow-md ${
            alertMessage.type === "success"
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">
              {alertMessage.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{alertMessage.text}</span>
          </div>
          <button onClick={() => setAlertMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Backups List Table */}
      <div className="glass-card rounded-3xl border border-outline-variant/30 overflow-hidden shadow-2xl bg-surface/60">
        <div className="p-5 bg-surface-container-high/40 border-b border-outline-variant/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">folder_zip</span>
            <span className="font-bold text-on-surface text-base">النسخ الاحتياطية المحفوظة على السيرفر ({backups.length})</span>
          </div>
          <button
            onClick={fetchBackups}
            className="p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
            title="تحديث القائمة"
          >
            <span className="material-symbols-outlined text-xl">refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
            <span className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span className="text-sm font-medium">جاري تحميل النسخ الاحتياطية...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-surface-container-high/30 text-on-surface-variant text-xs sm:text-sm border-b border-outline-variant/20">
                  <th className="p-4 text-start font-bold">اسم الملف</th>
                  <th className="p-4 text-start font-bold">الحجم</th>
                  <th className="p-4 text-start font-bold">تاريخ الإنشاء</th>
                  <th className="p-4 text-center font-bold">الإجراءات المتاحة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10 text-xs sm:text-sm">
                {backups.map((backup) => (
                  <tr key={backup.filename} className="hover:bg-surface-container-high/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-on-surface flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-base">description</span>
                      <span className="truncate max-w-[220px] sm:max-w-xs">{backup.filename}</span>
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono">
                      {backup.size > 1024 * 1024
                        ? `${(backup.size / (1024 * 1024)).toFixed(2)} MB`
                        : `${(backup.size / 1024).toFixed(2)} KB`}
                    </td>
                    <td className="p-4 text-on-surface-variant font-mono">
                      {new Date(backup.createdAt).toLocaleString("ar-EG", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        {/* Download button */}
                        <button
                          onClick={() => downloadBackup(backup.filename)}
                          disabled={isActioning}
                          className="px-3 py-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30 text-xs font-bold hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="تحميل الملف إلى جهازك"
                        >
                          <span className="material-symbols-outlined text-sm">download</span>
                          <span>تحميل للجهاز</span>
                        </button>

                        {/* Selective Restore button */}
                        <button
                          onClick={() => handleOpenServerFileModal(backup.filename)}
                          disabled={isActioning}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="تحديد واسترجاع بيانات محددة من هذه النسخة"
                        >
                          <span className="material-symbols-outlined text-sm">checklist</span>
                          <span>استرجاع مخصص</span>
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => deleteBackup(backup.filename)}
                          disabled={isActioning}
                          className="px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          title="حذف النسخة"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                          <span>حذف</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {backups.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-on-surface-variant">
                      <div className="flex flex-col items-center gap-2">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/40">inbox</span>
                        <p className="font-bold text-sm">لا توجد نسخ احتياطية مسجلة حالياً.</p>
                        <p className="text-xs text-on-surface-variant/70">اضغط على زر "إنشاء نسخة جديدة" أو قم برفع ملف نسخة من جهازك.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Interactive Selective Restore Modal */}
      {/* ========================================================================= */}
      {isModalOpen && parsedInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-outline-variant/40 shadow-2xl bg-surface relative overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 shrink-0">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl text-primary glow-cyan">tune</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-on-surface">تحديد البيانات المراد استرجاعها وتحديثها</h2>
                  <p className="text-xs text-on-surface-variant font-mono truncate max-w-xs sm:max-w-md">{parsedInfo.filename}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto py-5 space-y-5 flex-grow pr-1">
              <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary text-xs leading-relaxed">
                <b>ملاحظة:</b> يمكنك اختيار الأقسام التي ترغب في استرجاعها فقط. سيتم دمج الحسابات والطلبات وتحديث أرصدة العملاء بأمان.
              </div>

              {/* Data Checklist */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-on-surface">اختر الأقسام والبيانات:</h3>

                {/* Customers / Users */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedOptions.customers ? "bg-surface-container border-primary/50 shadow-sm" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.customers}
                    onChange={(e) => setSelectedOptions({ ...selectedOptions, customers: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-on-surface">المسجلين والحسابات (Customers & Users)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                        {parsedInfo.totalCustomers} حساب
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      استيراد بيانات العملاء، البريد، كلمة المرور، ورقم الهاتف.
                    </p>
                  </div>
                </label>

                {/* Balances */}
                {selectedOptions.customers && (
                  <label className={`flex items-start gap-3 p-4 pr-8 rounded-2xl border transition-all cursor-pointer mr-4 ${
                    selectedOptions.updateBalances ? "bg-emerald-500/10 border-emerald-500/40" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOptions.updateBalances}
                      onChange={(e) => setSelectedOptions({ ...selectedOptions, updateBalances: e.target.checked })}
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                    />
                    <div>
                      <span className="font-bold text-sm text-emerald-400">تحديث وتعيين أرصدة المحافظ (Balances)</span>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        تعيين رصيد كل عميل بناءً على الرصيد المسجل في ملف النسخة الاحتياطية.
                      </p>
                    </div>
                  </label>
                )}

                {/* Orders */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedOptions.orders ? "bg-surface-container border-primary/50 shadow-sm" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.orders}
                    onChange={(e) => setSelectedOptions({ ...selectedOptions, orders: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-on-surface">سجل الطلبات السابقة (Orders)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                        {parsedInfo.totalOrders} طلب
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      استيراد سجل طلبات فك الشفرات والخدمات مع ربطها بحسابات العملاء.
                    </p>
                  </div>
                </label>

                {/* Transactions */}
                <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedOptions.transactions ? "bg-surface-container border-primary/50 shadow-sm" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedOptions.transactions}
                    onChange={(e) => setSelectedOptions({ ...selectedOptions, transactions: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                  />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-on-surface">سجل المعاملات المالية وعمليات المحفظة (Transactions)</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                        {parsedInfo.totalTransactions} عملية
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">
                      استرجاع سجل الإيداعات والشحن وسجلات الخصم لحسابات العملاء.
                    </p>
                  </div>
                </label>

                {/* Services */}
                {parsedInfo.totalServices > 0 && (
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedOptions.services ? "bg-surface-container border-primary/50 shadow-sm" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOptions.services}
                      onChange={(e) => setSelectedOptions({ ...selectedOptions, services: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface">الخدمات والأقسام (Services & Categories)</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                          {parsedInfo.totalServices} خدمة
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        تحديث أو استرجاع قائمة الخدمات والأسعار من ملف النسخة.
                      </p>
                    </div>
                  </label>
                )}

                {/* Blog Posts */}
                {parsedInfo.totalBlogPosts > 0 && (
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedOptions.blogPosts ? "bg-surface-container border-primary/50 shadow-sm" : "bg-surface-container/20 border-outline-variant/20 opacity-70"
                  }`}>
                    <input
                      type="checkbox"
                      checked={selectedOptions.blogPosts}
                      onChange={(e) => setSelectedOptions({ ...selectedOptions, blogPosts: e.target.checked })}
                      className="mt-1 w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-on-surface">مقالات المدونة (Blog Posts)</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-bold font-mono">
                          {parsedInfo.totalBlogPosts} مقال
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1">
                        استرجاع مقالات المدونة المسجلة في النسخة.
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {/* Mode Selection */}
              <div className="p-4 rounded-2xl bg-surface-container-high/40 border border-outline-variant/30 space-y-2">
                <h4 className="text-xs font-bold text-on-surface">طريقة المعالجة (Mode):</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex items-center gap-2 text-xs font-bold text-on-surface cursor-pointer">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="merge"
                      checked={selectedOptions.mode === "merge"}
                      onChange={() => setSelectedOptions({ ...selectedOptions, mode: "merge" })}
                      className="accent-primary"
                    />
                    <span>دمج وتحديث البيانات دون مسح (Merge - مستحسن)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-red-400 cursor-pointer">
                    <input
                      type="radio"
                      name="restoreMode"
                      value="overwrite"
                      checked={selectedOptions.mode === "overwrite"}
                      onChange={() => setSelectedOptions({ ...selectedOptions, mode: "overwrite" })}
                      className="accent-red-500"
                    />
                    <span>استبدال كامل للجداول المحددة (Overwrite)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-3 shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface font-bold text-sm hover:bg-surface-container"
              >
                إلغاء
              </button>
              <button
                onClick={executeSelectiveRestore}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm shadow-lg shadow-primary/20 hover:opacity-95 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">check</span>
                <span>بدء الاستيراد المخصص</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
