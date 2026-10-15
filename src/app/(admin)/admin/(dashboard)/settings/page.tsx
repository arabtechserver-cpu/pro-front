"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminProfile,
  updateAdminCredentials,
  getPaymentSettingsAction,
  updatePaymentSettingsAction
} from "./actions";
import { isServerActionMismatchError } from "@/lib/server-action-utils";

interface CustomMethod {
  id: string;
  nameAr: string;
  nameEn?: string;
  type?: string;
  accountOrAddress: string;
  network?: string;
  transferName?: string;
  instructionsAr?: string;
  instructionsEn?: string;
  isActive: boolean;
}

interface PaymentMethodsConfig {
  bankak: {
    accountNumber: string;
    accountName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  fawry: {
    accountNumber: string;
    accountName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  vodafone: {
    walletNumber: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  binance: {
    payId: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  cryptoBnb: {
    address: string;
    network: string;
    transferName?: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  rewarble: {
    address: string;
    transferName: string;
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  paypal: {
    email: string;
    isActive: boolean;
  };
  customMethods: CustomMethod[];
  updatedAt?: string;
}

const DEFAULT_PAYMENTS_CONFIG: PaymentMethodsConfig = {
  bankak: {
    accountNumber: "6302273",
    accountName: "حسن",
    instructionsAr: "حول المبلغ بالجنيه السوداني عبر تطبيق بنكك إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد الفوري.",
    instructionsEn: "Transfer in Sudanese Pounds via Bankak app then upload the transfer receipt image.",
    isActive: true
  },
  fawry: {
    accountNumber: "51589889",
    accountName: "الرقم البنكي الموحد",
    instructionsAr: "حول المبلغ بالجنيه السوداني عبر تطبيق فوري (بنك فيصل الإسلامي) إلى الرقم البنكي الموحد (51589889) ثم ارفع صورة إشعار التحويل للتأكيد الفوري.",
    instructionsEn: "Transfer in Sudanese Pounds via Fawri app to Unified Banking ID # 51589889 then upload the transfer receipt image.",
    isActive: true
  },
  vodafone: {
    walletNumber: "01097160605",
    instructionsAr: "حول المبلغ إلى رقم المحفظة واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التحويل.",
    instructionsEn: "Transfer funds to wallet number then attach receipt screenshot.",
    isActive: true
  },
  binance: {
    payId: "894642115",
    instructionsAr: "افتح تطبيق باينانس واكتب معرف Binance Pay ID ثم ارفق لقطة الشاشة للتأكيد.",
    instructionsEn: "Open Binance App and send funds via Pay ID then attach payment screenshot.",
    isActive: true
  },
  cryptoBnb: {
    address: "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
    network: "BNB Smart Chain (BEP20)",
    transferName: "BNB",
    instructionsAr: "طريقة تحويل عبر BNB معتمدة لكافة الأقسام والخدمات: اسم التحويل BNB، قم بالتحويل إلى رابط المحفظة ثم ارفع صورة إشعار التحويل للتأكيد الفوري.",
    instructionsEn: "Approved BNB transfer method for all sections: Transfer Name BNB, transfer to wallet address then upload transfer receipt.",
    isActive: true
  },
  rewarble: {
    address: "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
    transferName: "BNB",
    instructionsAr: "طريقة تحويل خاصة بقسم Rewarble: اسم التحويل BNB، قم بالتحويل إلى رابط المحفظة ثم ارفع صورة إشعار التحويل للتأكيد الفوري.",
    instructionsEn: "Dedicated transfer method for Rewarble: Transfer Name BNB, transfer to wallet address then upload transfer receipt.",
    isActive: true
  },
  paypal: {
    email: "paypal@gsmteam.com",
    isActive: true
  },
  customMethods: []
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"payments" | "account" | "telegram">("payments");

  // Account State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [accountSuccess, setAccountSuccess] = useState("");

  // Payment Methods State
  const [payments, setPayments] = useState<PaymentMethodsConfig>(DEFAULT_PAYMENTS_CONFIG);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsSuccess, setPaymentsSuccess] = useState("");
  const [paymentsError, setPaymentsError] = useState("");
  const [paymentSecurityPassword, setPaymentSecurityPassword] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Custom Method Modal / Form State
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [newCustomNameAr, setNewCustomNameAr] = useState("");
  const [newCustomNameEn, setNewCustomNameEn] = useState("");
  const [newCustomType, setNewCustomType] = useState("crypto");
  const [newCustomAddress, setNewCustomAddress] = useState("");
  const [newCustomNetwork, setNewCustomNetwork] = useState("");
  const [newCustomTransferName, setNewCustomTransferName] = useState("");
  const [newCustomInstructionsAr, setNewCustomInstructionsAr] = useState("");
  const [newCustomInstructionsEn, setNewCustomInstructionsEn] = useState("");

  // Telegram Admin IDs State
  const [telegramIds, setTelegramIds] = useState<string[]>([]);
  const [newTelegramId, setNewTelegramId] = useState("");
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramSuccess, setTelegramSuccess] = useState("");
  const [telegramError, setTelegramError] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsPageLoading(true);

      // Load Profile
      try {
        const user = await getAdminProfile();
        if (user) {
          setUsername(user.username || "");
          setEmail(user.email || "");
        } else {
          const clientRes = await fetch("/api/users/profile");
          if (clientRes.ok) {
            const data = await clientRes.json();
            if (data.success && data.user) {
              setUsername(data.user.username || "");
              setEmail(data.user.email || "");
            }
          }
        }
      } catch (err) {
        console.error("Error loading admin profile:", err);
      }

      // Load Payment Methods
      try {
        const adminToken = typeof window !== "undefined"
          ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
          : null;
        const res = await fetch("/api/settings/payment-methods", {
          headers: {
            "Cache-Control": "no-cache",
            ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
          },
          credentials: "include"
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.paymentMethods) {
            setPayments(prev => ({
              ...prev,
              ...data.paymentMethods,
              customMethods: Array.isArray(data.paymentMethods.customMethods)
                ? data.paymentMethods.customMethods
                : []
            }));
          }
        } else {
          // Fallback to currencies endpoint if direct settings endpoint returns 404
          const curRes = await fetch("/api/currencies", { cache: "no-store" });
          if (curRes.ok) {
            const curData = await curRes.json();
            if (curData.success && curData.config) {
              setPayments(prev => ({
                ...prev,
                bankak: curData.config.bankak || prev.bankak,
                fawry: curData.config.fawry || prev.fawry,
                vodafone: curData.config.vodafone || prev.vodafone,
                binance: curData.config.binance || prev.binance,
                cryptoBnb: curData.config.cryptoBnb || prev.cryptoBnb,
                rewarble: curData.config.rewarble || prev.rewarble,
                paypal: curData.config.paypal || prev.paypal,
                customMethods: Array.isArray(curData.config.customMethods)
                  ? curData.config.customMethods
                  : []
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading payment methods:", err);
      }

      // Load Telegram IDs
      try {
        const res = await fetch("/api/settings/telegram-admins", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setTelegramIds(data.chatIds || []);
        }
      } catch (err) {
        console.error("Error loading telegram IDs:", err);
      }

      setIsPageLoading(false);
    }

    loadData();
  }, [router]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSavePayments = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPaymentsLoading(true);
    setPaymentsSuccess("");
    setPaymentsError("");

    try {
      const adminToken = typeof window !== "undefined"
        ? (localStorage.getItem("admin_token") || localStorage.getItem("adminToken"))
        : null;

      const payload = {
        currentPassword: paymentSecurityPassword.trim() || undefined,
        paymentMethods: payments
      };

      let saveOk = false;
      let returnedData: any = null;

      const res = await fetch("/api/settings/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { Authorization: `Bearer ${adminToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        returnedData = await res.json();
        saveOk = returnedData.success;
      } else {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          setPaymentsError(errJson.error || "فشل التحقق الأمني لحفظ طرق الدفع");
          setPaymentsLoading(false);
          return;
        }
        // Fallback to server action
        const serverActionData = await updatePaymentSettingsAction(payload);
        if (serverActionData?.success) {
          saveOk = true;
          returnedData = serverActionData;
        } else {
          setPaymentsError(serverActionData?.error || errJson.error || "حدث خطأ أثناء حفظ الإعدادات");
        }
      }

      if (saveOk && returnedData) {
        if (returnedData.paymentMethods) {
          setPayments(prev => ({
            ...prev,
            ...returnedData.paymentMethods,
            customMethods: Array.isArray(returnedData.paymentMethods.customMethods)
              ? returnedData.paymentMethods.customMethods
              : prev.customMethods
          }));
        }
        setPaymentsSuccess("تم حفظ وتثبيت كافة طرق الدفع والعناوين بنجاح!");
        setPaymentSecurityPassword("");
        setTimeout(() => setPaymentsSuccess(""), 4000);
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setPaymentsError("تعذر الاتصال بالسيرفر لحفظ بيانات الدفع");
    } finally {
      setPaymentsLoading(false);
    }
  };

  const handleAddCustomMethod = () => {
    if (!newCustomNameAr.trim() || !newCustomAddress.trim()) {
      setPaymentsError("يرجى إدخال اسم الطريقة وعنوان المحفظة أو رقم الحساب على الأقل");
      return;
    }

    const newMethod: CustomMethod = {
      id: `custom_${Date.now()}`,
      nameAr: newCustomNameAr.trim(),
      nameEn: newCustomNameEn.trim() || undefined,
      type: newCustomType,
      accountOrAddress: newCustomAddress.trim(),
      network: newCustomNetwork.trim() || undefined,
      transferName: newCustomTransferName.trim() || undefined,
      instructionsAr: newCustomInstructionsAr.trim() || undefined,
      instructionsEn: newCustomInstructionsEn.trim() || undefined,
      isActive: true
    };

    setPayments(prev => ({
      ...prev,
      customMethods: [...prev.customMethods, newMethod]
    }));

    // Reset inputs
    setNewCustomNameAr("");
    setNewCustomNameEn("");
    setNewCustomType("crypto");
    setNewCustomAddress("");
    setNewCustomNetwork("");
    setNewCustomTransferName("");
    setNewCustomInstructionsAr("");
    setNewCustomInstructionsEn("");
    setShowAddCustomModal(false);
    setPaymentsError("");
  };

  const handleRemoveCustomMethod = (id: string) => {
    setPayments(prev => ({
      ...prev,
      customMethods: prev.customMethods.filter(m => m.id !== id)
    }));
  };

  const handleToggleCustomMethod = (id: string, active: boolean) => {
    setPayments(prev => ({
      ...prev,
      customMethods: prev.customMethods.map(m => m.id === id ? { ...m, isActive: active } : m)
    }));
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError("");
    setAccountSuccess("");

    if (!currentPassword) {
      setAccountError("الرجاء إدخال كلمة المرور الحالية لتأكيد التعديلات");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setAccountError("كلمة المرور الجديدة وتأكيد كلمة المرور غير متطابقين");
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setAccountError("كلمة المرور الجديدة يجب أن لا تقل عن 4 أحرف");
      return;
    }

    setIsLoading(true);

    try {
      const data = await updateAdminCredentials({
        username: username.trim(),
        email: email.trim(),
        newPassword: newPassword ? newPassword : undefined,
        currentPassword
      });

      if (!data.success) {
        setAccountError(data.error || "حدث خطأ غير متوقع");
      } else {
        setAccountSuccess("تم تحديث بيانات حسابك بنجاح!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setAccountSuccess(""), 4000);
      }
    } catch (err: any) {
      if (isServerActionMismatchError(err)) {
        window.location.reload();
        return;
      }
      setAccountError("تعذر الاتصال بالسيرفر");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTelegramId = () => {
    const id = newTelegramId.trim();
    if (!id || !/^\d+$/.test(id)) {
      setTelegramError("الرجاء إدخال Chat ID رقمي صحيح");
      return;
    }
    if (telegramIds.includes(id)) {
      setTelegramError("هذا الـ Chat ID مضاف بالفعل");
      return;
    }
    setTelegramIds(prev => [...prev, id]);
    setNewTelegramId("");
    setTelegramError("");
  };

  const handleRemoveTelegramId = (id: string) => {
    setTelegramIds(prev => prev.filter(x => x !== id));
  };

  const handleSaveTelegramIds = async () => {
    setTelegramLoading(true);
    setTelegramSuccess("");
    setTelegramError("");
    try {
      const res = await fetch("/api/settings/telegram-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ chatIds: telegramIds })
      });
      const data = await res.json();
      if (data.success) {
        setTelegramIds(data.chatIds);
        setTelegramSuccess("تم حفظ معرفات تليجرام بنجاح!");
        setTimeout(() => setTelegramSuccess(""), 3000);
      } else {
        setTelegramError(data.error || "حدث خطأ");
      }
    } catch {
      setTelegramError("تعذر الاتصال بالسيرفر");
    } finally {
      setTelegramLoading(false);
    }
  };

  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 gap-3 text-on-surface-variant" dir="rtl">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
        <span className="text-xs font-bold">جاري تحميل إعدادات لوحة التحكم...</span>
      </div>
    );
  }

  const activeCount = [
    payments.bankak.isActive,
    payments.fawry.isActive,
    payments.vodafone.isActive,
    payments.binance.isActive,
    payments.cryptoBnb.isActive,
    payments.rewarble.isActive,
    payments.paypal.isActive,
    ...payments.customMethods.map(m => m.isActive)
  ].filter(Boolean).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans pb-16" dir="rtl">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-surface-container border border-outline-variant/30 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
            <span className="material-symbols-outlined text-3xl">settings_suggest</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-black text-on-surface">إعدادات لوحة التحكم</h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
              إدارة طرق الدفع وعناوين الاستقبال، حسابات الإدارة، وإشعارات تيليجرام بأعلى درجات الأمان
            </p>
          </div>
        </div>

        {activeTab === "payments" && (
          <button
            type="button"
            onClick={() => handleSavePayments()}
            disabled={paymentsLoading}
            className="px-6 py-3 bg-primary text-on-primary font-bold text-xs rounded-2xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-lg">
              {paymentsLoading ? "sync" : "save"}
            </span>
            <span>{paymentsLoading ? "جاري الحفظ..." : "حفظ التعديلات"}</span>
          </button>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-2xl border border-outline-variant/30 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex-1 min-w-[170px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "payments"
              ? "bg-primary text-on-primary shadow-md font-black"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
          <span>طرق الدفع وعناوين الاستقبال</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === "payments" ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}>
            {activeCount} مفعل
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("account")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "account"
              ? "bg-primary text-on-primary shadow-md font-black"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">manage_accounts</span>
          <span>إعدادات الحساب والأمان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("telegram")}
          className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
            activeTab === "telegram"
              ? "bg-primary text-on-primary shadow-md font-black"
              : "text-on-surface-variant hover:text-on-surface hover:bg-surface"
          }`}
        >
          <span className="material-symbols-outlined text-lg">send</span>
          <span>مشرفي بوت تليجرام</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            activeTab === "telegram" ? "bg-white/20 text-white" : "bg-blue-500/10 text-blue-500"
          }`}>
            {telegramIds.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PAYMENT METHODS & ADDRESSES */}
      {activeTab === "payments" && (
        <div className="space-y-6">
          {paymentsError && (
            <div className="bg-error/10 text-error p-4 rounded-2xl flex items-center gap-3 border border-error/20 text-xs font-bold">
              <span className="material-symbols-outlined text-xl shrink-0">error</span>
              <span>{paymentsError}</span>
            </div>
          )}

          {paymentsSuccess && (
            <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl flex items-center gap-3 border border-emerald-500/20 text-xs font-bold">
              <span className="material-symbols-outlined text-xl shrink-0">check_circle</span>
              <span>{paymentsSuccess}</span>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">info</span>
              <span>
                كل تغيير يتم حفظه هنا ينعكس فوراً وتلقائياً على صفحة إيداع المحفظة، صفحة الألعاب، وكافة صفحات الموقع.
              </span>
            </div>
            {payments.updatedAt && (
              <span className="text-[11px] font-mono shrink-0">
                آخر تحديث: {new Date(payments.updatedAt).toLocaleString("ar-EG")}
              </span>
            )}
          </div>

          {/* CARD 1: BANK OF KHARTOUM (BANKAK) */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-violet-600/15 text-violet-600 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">بنك الخرطوم (بنكك - Bankak)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-400">SDG</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">التحويل المباشر بالجنيه السوداني عبر تطبيق بنكك</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-bankak"
                  type="checkbox"
                  checked={payments.bankak.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    bankak: { ...payments.bankak, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-bankak" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.bankak.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  رقم حساب بنك الخرطوم (Bankak Account Number) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.bankak.accountNumber}
                    onChange={(e) => setPayments({
                      ...payments,
                      bankak: { ...payments.bankak, accountNumber: e.target.value }
                    })}
                    placeholder="مثال: 6302273"
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.bankak.accountNumber, "bankak-acc")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "bankak-acc" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "bankak-acc" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  اسم صاحب الحساب المستفيد (Account Beneficiary Name) *
                </label>
                <input
                  type="text"
                  value={payments.bankak.accountName}
                  onChange={(e) => setPayments({
                    ...payments,
                    bankak: { ...payments.bankak, accountName: e.target.value }
                  })}
                  placeholder="مثال: حسن"
                  className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs font-bold text-on-surface"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تعليمات وتوجيهات التحويل عبر بنكك (تظهر للعميل في شاشة الشحن)
                </label>
                <textarea
                  rows={2}
                  value={payments.bankak.instructionsAr}
                  onChange={(e) => setPayments({
                    ...payments,
                    bankak: { ...payments.bankak, instructionsAr: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* CARD 2: FAWRI - FAISAL ISLAMIC BANK */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-600/15 text-purple-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">فوري - بنك فيصل الإسلامي (Fawri)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400">الرقم الموحد</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">التحويل عبر تطبيق فوري إلى الرقم البنكي الموحد</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-fawry"
                  type="checkbox"
                  checked={payments.fawry.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    fawry: { ...payments.fawry, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-fawry" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.fawry.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  الرقم البنكي الموحد (Unified Banking ID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.fawry.accountNumber}
                    onChange={(e) => setPayments({
                      ...payments,
                      fawry: { ...payments.fawry, accountNumber: e.target.value }
                    })}
                    placeholder="مثال: 51589889"
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.fawry.accountNumber, "fawry-acc")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "fawry-acc" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "fawry-acc" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  اسم المستفيد أو الوصف (Beneficiary Name)
                </label>
                <input
                  type="text"
                  value={payments.fawry.accountName}
                  onChange={(e) => setPayments({
                    ...payments,
                    fawry: { ...payments.fawry, accountName: e.target.value }
                  })}
                  placeholder="مثال: الرقم البنكي الموحد"
                  className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs font-bold text-on-surface"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تعليمات وتوجيهات تطبيق فوري
                </label>
                <textarea
                  rows={2}
                  value={payments.fawry.instructionsAr}
                  onChange={(e) => setPayments({
                    ...payments,
                    fawry: { ...payments.fawry, instructionsAr: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* CARD 3: VODAFONE CASH */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-red-600/15 text-red-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">phone_iphone</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">فودافون كاش مصر (Vodafone Cash)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400">EGP</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">استقبال التحويلات عبر محفظة فودافون كاش بالجنيه المصري</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-vodafone"
                  type="checkbox"
                  checked={payments.vodafone.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    vodafone: { ...payments.vodafone, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-vodafone" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.vodafone.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  رقم محفظة فودافون كاش (Wallet Number) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.vodafone.walletNumber}
                    onChange={(e) => setPayments({
                      ...payments,
                      vodafone: { ...payments.vodafone, walletNumber: e.target.value }
                    })}
                    placeholder="مثال: 01097160605"
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.vodafone.walletNumber, "vf-wallet")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "vf-wallet" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "vf-wallet" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تعليمات وتوجيهات التحويل
                </label>
                <textarea
                  rows={2}
                  value={payments.vodafone.instructionsAr}
                  onChange={(e) => setPayments({
                    ...payments,
                    vodafone: { ...payments.vodafone, instructionsAr: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* CARD 4: BINANCE PAY */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">currency_exchange</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">باينانس باي (Binance Pay)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">فوري</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">الدفع السريع ومطابقة التحويل عبر Binance Pay ID</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-binance"
                  type="checkbox"
                  checked={payments.binance.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    binance: { ...payments.binance, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-binance" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.binance.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  معرف باينانس باي (Binance Pay ID) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.binance.payId}
                    onChange={(e) => setPayments({
                      ...payments,
                      binance: { ...payments.binance, payId: e.target.value }
                    })}
                    placeholder="مثال: 894642115"
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.binance.payId, "binance-id")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "binance-id" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "binance-id" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  تعليمات باينانس للمستخدم
                </label>
                <textarea
                  rows={2}
                  value={payments.binance.instructionsAr}
                  onChange={(e) => setPayments({
                    ...payments,
                    binance: { ...payments.binance, instructionsAr: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* CARD 5: CRYPTO BNB / BEP20 */}
          <div className="bg-surface-container rounded-3xl border border-amber-500/30 p-6 sm:p-7 space-y-5 shadow-lg bg-gradient-to-br from-amber-500/5 via-surface-container to-surface-container">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">toll</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">عنوان محفظة الكريبتو (BNB / BEP20 Smart Chain)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400">BSC / BEP20</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    العنوان المعتمد لجميع أقسام الألعاب، البطاقات، الاشتراكات، eSIM، و Rewarble
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-cryptoBnb"
                  type="checkbox"
                  checked={payments.cryptoBnb.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    cryptoBnb: { ...payments.cryptoBnb, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-cryptoBnb" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.cryptoBnb.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">
                  عنوان المحفظة (Wallet Address - BSC BEP20) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.cryptoBnb.address}
                    onChange={(e) => setPayments({
                      ...payments,
                      cryptoBnb: { ...payments.cryptoBnb, address: e.target.value }
                    })}
                    placeholder="0x..."
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-amber-500/40 focus:border-amber-500 outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.cryptoBnb.address, "bnb-addr")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-amber-500 hover:bg-amber-500 hover:text-black transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "bnb-addr" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "bnb-addr" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-2">اسم الشبكة (Network Name)</label>
                  <input
                    type="text"
                    value={payments.cryptoBnb.network}
                    onChange={(e) => setPayments({
                      ...payments,
                      cryptoBnb: { ...payments.cryptoBnb, network: e.target.value }
                    })}
                    className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs font-bold text-on-surface text-left dir-ltr"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-2">اسم التحويل (Transfer Name)</label>
                  <input
                    type="text"
                    value={payments.cryptoBnb.transferName || "BNB"}
                    onChange={(e) => setPayments({
                      ...payments,
                      cryptoBnb: { ...payments.cryptoBnb, transferName: e.target.value }
                    })}
                    className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs font-bold text-on-surface text-left dir-ltr"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-on-surface mb-2">
                    تعليمات التحويل للعملاء (تظهر في المحفظة والألعاب)
                  </label>
                  <textarea
                    rows={2}
                    value={payments.cryptoBnb.instructionsAr}
                    onChange={(e) => setPayments({
                      ...payments,
                      cryptoBnb: { ...payments.cryptoBnb, instructionsAr: e.target.value }
                    })}
                    className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 6: REWARBLE */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600/15 text-indigo-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">card_membership</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">ريواربل (Rewarble)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400">قسائم</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">عنوان التحويل المخصص لقسم قسائم وبطاقات Rewarble</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-rewarble"
                  type="checkbox"
                  checked={payments.rewarble.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    rewarble: { ...payments.rewarble, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-rewarble" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.rewarble.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">عنوان محفظة Rewarble *</label>
                <div className="relative">
                  <input
                    type="text"
                    value={payments.rewarble.address}
                    onChange={(e) => setPayments({
                      ...payments,
                      rewarble: { ...payments.rewarble, address: e.target.value }
                    })}
                    placeholder="0x..."
                    className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-sm font-bold text-on-surface text-left dir-ltr"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopy(payments.rewarble.address, "rewarble-addr")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedKey === "rewarble-addr" ? "check" : "content_copy"}
                    </span>
                    <span>{copiedKey === "rewarble-addr" ? "تم" : "نسخ"}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-2">اسم التحويل (Transfer Name)</label>
                <input
                  type="text"
                  value={payments.rewarble.transferName || "BNB"}
                  onChange={(e) => setPayments({
                    ...payments,
                    rewarble: { ...payments.rewarble, transferName: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs font-bold text-on-surface text-left dir-ltr"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-on-surface mb-2">تعليمات التحويل لقسم Rewarble</label>
                <textarea
                  rows={2}
                  value={payments.rewarble.instructionsAr}
                  onChange={(e) => setPayments({
                    ...payments,
                    rewarble: { ...payments.rewarble, instructionsAr: e.target.value }
                  })}
                  className="w-full bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* CARD 7: PAYPAL */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-5 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/15 text-blue-500 flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-2xl">payments</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-on-surface">باي بال (PayPal)</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400">بوابة دفع</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">الدفع الآلي المباشر عبر بطاقات الائتمان ومحفظة PayPal</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 rounded-xl bg-surface border border-outline-variant/30">
                <input
                  id="toggle-paypal"
                  type="checkbox"
                  checked={payments.paypal.isActive}
                  onChange={(e) => setPayments({
                    ...payments,
                    paypal: { ...payments.paypal, isActive: e.target.checked }
                  })}
                  className="w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="toggle-paypal" className="text-xs font-bold text-on-surface cursor-pointer select-none">
                  {payments.paypal.isActive ? "مفعل للشحن" : "معطل"}
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">
                بريد حساب PayPal الإلكتروني (PayPal Email) *
              </label>
              <div className="relative max-w-md">
                <input
                  type="email"
                  value={payments.paypal.email}
                  onChange={(e) => setPayments({
                    ...payments,
                    paypal: { ...payments.paypal, email: e.target.value }
                  })}
                  placeholder="paypal@example.com"
                  className="w-full bg-surface px-4 py-3 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-xs font-bold text-on-surface text-left dir-ltr"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(payments.paypal.email, "paypal-email")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-bold rounded-lg bg-surface-container text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedKey === "paypal-email" ? "check" : "content_copy"}
                  </span>
                  <span>{copiedKey === "paypal-email" ? "تم" : "نسخ"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 8: CUSTOM PAYMENT METHODS & ADDRESSES */}
          <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-6 sm:p-7 space-y-6 shadow-lg">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 flex-wrap gap-3">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">add_card</span>
                  <span>طرق وعناوين الدفع الإضافية المخصصة (Custom Payment Methods)</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  إمكانية إضافة أي عنوان محفظة كريبتو إضافي (مثل USDT TRC20) أو وسيلة دفع ومحفظة إلكترونية محلية
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddCustomModal(true)}
                className="px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">add</span>
                <span>إضافة طريقة أو عنوان جديد</span>
              </button>
            </div>

            {payments.customMethods.length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-2xl border border-dashed border-outline-variant/40">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant block mb-2">account_balance_wallet</span>
                <p className="text-xs text-on-surface-variant">لا توجد طرق دفع إضافية مخصصة حتى الآن.</p>
                <p className="text-[11px] text-on-surface-variant/70 mt-1">
                  يمكنك إضافة عناوين إضافية مثل USDT على شبكات TRON أو Polygon أو حسابات مصرفية أخرى.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {payments.customMethods.map((cm) => (
                  <div
                    key={cm.id}
                    className="p-5 rounded-2xl bg-surface border border-outline-variant/40 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">{cm.nameAr}</span>
                        {cm.network && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                            {cm.network}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          id={`toggle-${cm.id}`}
                          type="checkbox"
                          checked={cm.isActive}
                          onChange={(e) => handleToggleCustomMethod(cm.id, e.target.checked)}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomMethod(cm.id)}
                          className="text-error hover:bg-error/10 p-1.5 rounded-lg transition-colors"
                          title="حذف هذه الطريقة"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-on-surface select-all truncate text-left dir-ltr">
                        {cm.accountOrAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(cm.accountOrAddress, cm.id)}
                        className="px-2 py-1 text-[11px] font-bold rounded-lg bg-surface text-primary hover:bg-primary hover:text-on-primary transition-all flex items-center gap-1 shrink-0"
                      >
                        <span className="material-symbols-outlined text-xs">
                          {copiedKey === cm.id ? "check" : "content_copy"}
                        </span>
                        <span>{copiedKey === cm.id ? "تم" : "نسخ"}</span>
                      </button>
                    </div>

                    {cm.instructionsAr && (
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        {cm.instructionsAr}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ADD CUSTOM METHOD MODAL */}
          {showAddCustomModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-surface-container w-full max-w-lg rounded-3xl border border-outline-variant/40 p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                  <h3 className="font-bold text-base text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">add_circle</span>
                    <span>إضافة طريقة دفع أو عنوان استقبال جديد</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(false)}
                    className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-variant/30"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      اسم الطريقة بالعربية *
                    </label>
                    <input
                      type="text"
                      value={newCustomNameAr}
                      onChange={(e) => setNewCustomNameAr(e.target.value)}
                      placeholder="مثال: تيذر USDT (شبكة TRC20)"
                      className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      الاسم بالإنجليزية (اختياري)
                    </label>
                    <input
                      type="text"
                      value={newCustomNameEn}
                      onChange={(e) => setNewCustomNameEn(e.target.value)}
                      placeholder="e.g. Tether USDT (TRC20 Network)"
                      className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface text-left dir-ltr"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">نوع الطريقة</label>
                      <select
                        value={newCustomType}
                        onChange={(e) => setNewCustomType(e.target.value)}
                        className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface"
                      >
                        <option value="crypto">عملات مشفرة (Crypto)</option>
                        <option value="wallet">محفظة إلكترونية (E-Wallet)</option>
                        <option value="bank">تحويل مصرفي (Bank)</option>
                        <option value="other">أخرى (Other)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-on-surface mb-1">اسم الشبكة / الملاحظة</label>
                      <input
                        type="text"
                        value={newCustomNetwork}
                        onChange={(e) => setNewCustomNetwork(e.target.value)}
                        placeholder="مثال: TRON (TRC20)"
                        className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface text-left dir-ltr"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      عنوان المحفظة أو رقم الحساب *
                    </label>
                    <input
                      type="text"
                      value={newCustomAddress}
                      onChange={(e) => setNewCustomAddress(e.target.value)}
                      placeholder="أدخل العنوان أو رقم الحساب بدقة"
                      className="w-full bg-surface px-3.5 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none font-mono text-xs font-bold text-on-surface text-left dir-ltr"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">تعليمات التحويل للعميل</label>
                    <textarea
                      rows={2}
                      value={newCustomInstructionsAr}
                      onChange={(e) => setNewCustomInstructionsAr(e.target.value)}
                      placeholder="اكتب التوجيهات للعميل..."
                      className="w-full bg-surface px-3.5 py-2 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => setShowAddCustomModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-outline-variant/40 text-xs font-bold text-on-surface-variant hover:bg-surface"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomMethod}
                    className="px-5 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-primary/90 transition-all shadow-md"
                  >
                    إضافة الطريقة
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY CONFIRMATION & BOTTOM SAVE BAR */}
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="w-full md:w-auto flex-1">
              <label className="block text-xs font-bold text-on-surface mb-1.5">
                كلمة المرور الحالية لتأكيد التعديلات (اختياري لزيادة الأمان):
              </label>
              <input
                type="password"
                value={paymentSecurityPassword}
                onChange={(e) => setPaymentSecurityPassword(e.target.value)}
                placeholder="اكتب كلمة مرورك للتأكيد الإضافي"
                className="w-full max-w-md bg-surface px-4 py-2.5 rounded-xl border border-outline-variant/50 focus:border-primary outline-none text-xs text-on-surface dir-ltr text-left"
              />
            </div>

            <button
              type="button"
              onClick={() => handleSavePayments()}
              disabled={paymentsLoading}
              className="w-full md:w-auto px-8 py-3.5 bg-primary text-on-primary font-bold text-sm rounded-2xl hover:bg-primary/90 transition-all shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2.5 disabled:opacity-50 active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">
                {paymentsLoading ? "sync" : "save"}
              </span>
              <span>{paymentsLoading ? "جاري الحفظ..." : "حفظ كافة طرق الدفع والعناوين"}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: ACCOUNT & SECURITY */}
      {activeTab === "account" && (
        <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
            <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">manage_accounts</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">إعدادات الحساب وكلمة المرور</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">تحديث اسم المستخدم والبريد وكلمة المرور للوحة الإدارة</p>
            </div>
          </div>

          {accountError && (
            <div className="bg-error/10 text-error p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold">
              <span className="material-symbols-outlined text-xl">error</span>
              <span>{accountError}</span>
            </div>
          )}

          {accountSuccess && (
            <div className="bg-emerald-500/10 text-emerald-500 p-4 rounded-2xl mb-6 flex items-center gap-3 text-xs font-bold">
              <span className="material-symbols-outlined text-xl">check_circle</span>
              <span>{accountSuccess}</span>
            </div>
          )}

          <form onSubmit={handleAccountSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">اسم المستخدم (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary outline-none transition-all"
                  dir="ltr"
                />
                <p className="text-xs text-on-surface-variant mt-2">يستخدم لتسجيل الدخول في الموقع وبوت تليجرام</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-on-surface mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary outline-none transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <hr className="border-outline-variant/30 my-8" />

            <div>
              <h3 className="text-lg font-bold text-on-surface mb-4">تغيير كلمة المرور</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="اتركها فارغة إذا لم ترد التغيير"
                    className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary outline-none transition-all"
                    dir="ltr"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">تأكيد كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور الجديدة"
                    className="w-full bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-primary outline-none transition-all"
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            <div className="bg-surface-variant/30 p-6 rounded-2xl mt-8">
              <label className="block text-sm font-bold text-error mb-2">تأكيد التعديلات بكلمة المرور الحالية *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="اكتب كلمة مرورك الحالية هنا"
                className="w-full bg-surface px-4 py-3 rounded-2xl border border-error/50 focus:border-error outline-none transition-all"
                dir="ltr"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-primary text-on-primary font-bold rounded-2xl hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? "جاري الحفظ..." : "حفظ بيانات الحساب"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: TELEGRAM ADMINS */}
      {activeTab === "telegram" && (
        <div className="bg-surface-container rounded-3xl border border-outline-variant/30 p-8">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-outline-variant/20">
            <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined text-xl">send</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface">معرفات مشرفي تليجرام</h2>
              <p className="text-sm text-on-surface-variant mt-0.5">الحسابات التي تستقبل إشعارات الإيداعات والطلبات عبر البوت</p>
            </div>
          </div>

          {telegramError && (
            <div className="bg-error/10 text-error p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-base">error</span>
              <span>{telegramError}</span>
            </div>
          )}
          {telegramSuccess && (
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-2xl mb-4 flex items-center gap-2 text-sm font-bold">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>{telegramSuccess}</span>
            </div>
          )}

          {/* Current IDs list */}
          <div className="space-y-2 mb-6">
            {telegramIds.length === 0 ? (
              <p className="text-on-surface-variant text-sm text-center py-4">لا يوجد معرفات محفوظة. أضف Chat ID من تليجرام.</p>
            ) : (
              telegramIds.map(id => (
                <div key={id} className="flex items-center justify-between bg-surface px-4 py-3 rounded-2xl border border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-blue-500 text-xl">person</span>
                    <code className="font-mono text-on-surface font-bold">{id}</code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTelegramId(id)}
                    className="text-error hover:bg-error/10 p-2 rounded-xl transition-colors"
                    title="حذف"
                  >
                    <span className="material-symbols-outlined text-xl">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Add new ID */}
          <div className="flex gap-3">
            <input
              type="text"
              value={newTelegramId}
              onChange={(e) => setNewTelegramId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTelegramId()}
              placeholder="أدخل Telegram Chat ID (مثال: 7053196033)"
              className="flex-1 bg-surface px-4 py-3 rounded-2xl border border-outline-variant/50 focus:border-blue-500 outline-none transition-all font-mono"
              dir="ltr"
            />
            <button
              type="button"
              onClick={handleAddTelegramId}
              className="px-5 py-3 bg-blue-500/10 text-blue-600 font-bold rounded-2xl hover:bg-blue-500/20 transition-colors flex items-center gap-2 shrink-0"
            >
              <span className="material-symbols-outlined">add</span>
              <span>إضافة</span>
            </button>
          </div>

          <div className="bg-surface-variant/30 p-4 rounded-2xl mt-4 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-500 text-base mt-0.5">info</span>
            <p className="text-xs text-on-surface-variant">
              للحصول على Chat ID الخاص بك، أرسل رسالة لـ <a href="https://t.me/userinfobot" target="_blank" rel="noreferrer" className="text-blue-500 underline">@userinfobot</a> على تليجرام وسيعطيك رقمك.
            </p>
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={handleSaveTelegramIds}
              disabled={telegramLoading}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">save</span>
              <span>{telegramLoading ? "جاري الحفظ..." : "حفظ معرفات تليجرام"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
