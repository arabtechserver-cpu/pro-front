"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n/config";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { cleanHtmlToText } from "@/utils/cleanHtml";

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

interface PaymentMethod {
  id: string;
  nameAr: string;
  nameEn: string;
  badge: string;
  icon: string;
  color: string;
  copyValue: string;
  detailLabelAr: string;
  detailLabelEn: string;
  instructionsAr: string;
  instructionsEn: string;
  isAutomaticPayPal?: boolean;
  isBankak?: boolean;
}

interface CurrencyConfig {
  usdToSdg: number;
  usdToEgp: number;
  usdToSar: number;
  usdToAed: number;
  bankak: {
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
    instructionsAr: string;
    instructionsEn: string;
    isActive: boolean;
  };
  paypal: {
    email: string;
    isActive: boolean;
  };
}

interface DBTransaction {
  id: string;
  type: string;
  amount: number;
  method: string;
  status: "completed" | "pending" | "failed" | string;
  createdAt: string;
  refNo: string;
}

export default function WalletClient({ lang, dict }: { lang: Locale; dict: any }) {
  const router = useRouter();
  const [userSession, setUserSession] = useState<any>(null);
  const [depositAmount, setDepositAmount] = useState<string>("10.00");
  const [depositSdgAmount, setDepositSdgAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("bankak");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingTx, setIsFetchingTx] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [currencyConfig, setCurrencyConfig] = useState<CurrencyConfig | null>(null);
  const [isVerifyingPayPal, setIsVerifyingPayPal] = useState<boolean>(false);
  const [transactions, setTransactions] = useState<DBTransaction[]>([]);

  // Fetch Currency & Payment Settings from Backend
  const fetchCurrencies = async () => {
    try {
      const res = await fetch("/api/currencies", {
        headers: { "Cache-Control": "no-cache" }
      });
      const data = await res.json();
      if (res.ok && data.success && data.config) {
        setCurrencyConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch currencies in wallet:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("user_session");
    let currentUser: any = null;

    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        setUserSession(currentUser);
      } catch {
        setUserSession(null);
      }
    }

    if (!currentUser) {
      router.push(`/${lang}/login`);
      return;
    }

    fetchRealTransactions(currentUser?.id, currentUser?.email);

    // AUTO CAPTURE PAYPAL ORDER RETURN IF ANY
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const paypalToken = urlParams.get("token");
      const paypalStatus = urlParams.get("paypal");

      if (paypalToken && (paypalStatus === "success" || paypalToken)) {
        handlePayPalReturnCapture(paypalToken, currentUser);
      } else if (paypalStatus === "cancel") {
        setErrorMessage(lang === "ar" ? "تم إلغاء عملية الدفع عبر PayPal." : "PayPal payment was cancelled.");
      }
    }
  }, [lang, router]);

  // Sync SDG amount when USD deposit amount or currency config changes
  useEffect(() => {
    if (currencyConfig?.usdToSdg) {
      const usd = parseFloat(depositAmount) || 0;
      setDepositSdgAmount((usd * currencyConfig.usdToSdg).toFixed(0));
    }
  }, [depositAmount, currencyConfig]);

  const handleSdgAmountChange = (val: string) => {
    setDepositSdgAmount(val);
    const sdg = parseFloat(val) || 0;
    const rate = currencyConfig?.usdToSdg || 2850;
    if (rate > 0) {
      setDepositAmount((sdg / rate).toFixed(2));
    }
  };

  // Build Dynamic Payment Methods from Live Config
  const paymentMethods: PaymentMethod[] = [
    {
      id: "bankak",
      nameAr: "بنك الخرطوم (بنكك)",
      nameEn: "Bank of Khartoum (Bankak)",
      badge: "🇸🇩",
      icon: "account_balance",
      color: "from-emerald-600 to-teal-700",
      copyValue: currencyConfig?.bankak?.accountNumber || "6302273",
      detailLabelAr: `رقم حساب بنكك (باسم: ${currencyConfig?.bankak?.accountName || "حسن"}):`,
      detailLabelEn: `Bankak Account # (Name: ${currencyConfig?.bankak?.accountName || "Hassan"}):`,
      instructionsAr:
        currencyConfig?.bankak?.instructionsAr ||
        "حول المبلغ بالجنيه السوداني عبر تطبيق بنكك إلى رقم الحساب ثم ارفع صورة إشعار التحويل للتأكيد.",
      instructionsEn:
        currencyConfig?.bankak?.instructionsEn ||
        "Transfer via Bankak app in Sudanese Pounds then upload receipt image for confirmation.",
      isBankak: true
    },
    {
      id: "vodafone",
      nameAr: "فودافون كاش (Vodafone Cash)",
      nameEn: "Vodafone Cash",
      badge: "📱",
      icon: "phone_iphone",
      color: "from-red-600 to-rose-700",
      copyValue: currencyConfig?.vodafone?.walletNumber || "01036673447",
      detailLabelAr: "رقم محفظة فودافون كاش:",
      detailLabelEn: "Vodafone Cash Wallet Number:",
      instructionsAr:
        currencyConfig?.vodafone?.instructionsAr ||
        "حول المبلغ إلى رقم المحفظة واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التحويل.",
      instructionsEn:
        currencyConfig?.vodafone?.instructionsEn ||
        "Transfer funds to wallet number then attach receipt screenshot."
    },
    {
      id: "binance",
      nameAr: "Binance Pay (باينانس)",
      nameEn: "Binance Pay",
      badge: "🔶",
      icon: "currency_exchange",
      color: "from-amber-500 to-yellow-600",
      copyValue: currencyConfig?.binance?.payId || "287584748",
      detailLabelAr: "معرف باينانس باي (Binance Pay ID):",
      detailLabelEn: "Binance Pay ID:",
      instructionsAr:
        currencyConfig?.binance?.instructionsAr ||
        "افتح تطبيق باينانس واكتب معرف Binance Pay ID ثم ارفق لقطة الشاشة للتأكيد.",
      instructionsEn:
        currencyConfig?.binance?.instructionsEn ||
        "Open Binance App and send funds via Pay ID then attach payment screenshot."
    },
    {
      id: "bnb",
      nameAr: "BNB Smart Chain (BEP20)",
      nameEn: "BNB Smart Chain (BEP20)",
      badge: "🟡",
      icon: "currency_bitcoin",
      color: "from-yellow-500 to-amber-600",
      copyValue: currencyConfig?.cryptoBnb?.address || "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
      detailLabelAr: "عنوان المحفظة (BEP20 Address):",
      detailLabelEn: "BEP20 Wallet Address:",
      instructionsAr:
        currencyConfig?.cryptoBnb?.instructionsAr ||
        "تأكد من اختيار شبكة (BNB Smart Chain - BEP20) ثم ارفع صورة إثبات المعاملة للتأكيد.",
      instructionsEn:
        currencyConfig?.cryptoBnb?.instructionsEn ||
        "Ensure network selected is BNB Smart Chain (BEP20) then upload transaction receipt screenshot."
    },
    {
      id: "paypal",
      nameAr: "باي بال PayPal (تلقائي فوري)",
      nameEn: "PayPal (Instant Auto)",
      badge: "🅿️",
      icon: "payments",
      color: "from-blue-600 to-indigo-600",
      copyValue: currencyConfig?.paypal?.email || "paypal@gsmteam.com",
      detailLabelAr: "الدفع التلقائي المباشر عبر PayPal (داخل الموقع):",
      detailLabelEn: "Direct PayPal Instant Payment (In-Page):",
      instructionsAr: "ادخل المبلغ واضغط دفع لفتح نافذة PayPal الآمنة داخل الموقع دون مغادرة الصفحة.",
      instructionsEn: "Enter amount and click Pay to open in-page secure PayPal window without leaving.",
      isAutomaticPayPal: true
    }
  ];

  // Handle Automatic Return Capture from PayPal Checkout
  const handlePayPalReturnCapture = async (orderId: string, userObj?: any) => {
    setIsLoading(true);
    setIsVerifyingPayPal(true);
    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/wallet/paypal/capture-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          orderId
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(
          lang === "ar"
            ? `🎉 تم الدفع واعتتماد الشحن التلقائي بمبلغ $${data.amount} USD بنجاح! رصيدك الجديد: $${data.balance}`
            : `🎉 Payment successful! $${data.amount} USD added. New balance: $${data.balance}`
        );

        if (userObj || userSession) {
          const updated = { ...(userObj || userSession), balance: data.balance };
          localStorage.setItem("user_session", JSON.stringify(updated));
          setUserSession(updated);
          window.dispatchEvent(new Event("user_session_change"));
        }

        fetchRealTransactions(userObj?.id || userSession?.id, userObj?.email || userSession?.email);

        if (window.history.replaceState) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "تعذر تأكيد عملية الدفع من PayPal" : "Failed to capture PayPal payment"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "خطأ في الاتصال أثناء تأكيد الدفع عبر PayPal" : "Connection error capturing PayPal payment");
    } finally {
      setIsLoading(false);
      setIsVerifyingPayPal(false);
    }
  };

  const fetchRealTransactions = async (userId?: string, email?: string) => {
    setIsFetchingTx(true);
    try {
      let url = "/api/transactions";
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      else if (email) params.append("email", email);
      const qs = params.toString();
      if (qs) url += `?${qs}`;

      const token = localStorage.getItem("user_token");
      const headers: Record<string, string> = {};
      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(url, { headers, credentials: "include" });
      if (!res.ok) {
        setTransactions([]);
        return;
      }

      const data = await res.json().catch(() => ({ success: false, transactions: [] }));
      if (data.success && Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
      } else {
        setTransactions([]);
      }
    } catch {
      setTransactions([]);
    } finally {
      setIsFetchingTx(false);
    }
  };

  const activeMethod = paymentMethods.find((m) => m.id === selectedMethodId) || paymentMethods[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptImage((reader.result as string) || "");
      };
      reader.onerror = () => {
        setErrorMessage(lang === "ar" ? "تعذر قراءة ملف الصورة، يُرجى تجربة ملف آخر" : "Could not read image file");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال مبلغ إيداع صحيح! (حد أدنى $1.00 USD)" : "Please enter a valid deposit amount (min $1.00)!");
      return;
    }

    if (activeMethod.isAutomaticPayPal) {
      return;
    }

    if (!transactionRef.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال رقم المعاملة أو رقم الحساب/المحفظة المحول منها!" : "Please enter transaction reference / sender number!");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };

      if (token && token !== "null" && token !== "undefined") {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          userId: userSession?.id,
          email: userSession?.email,
          type: lang === "ar" ? "طلب شحن محفظة" : "Top-up Request",
          amount: parseFloat(depositAmount),
          method: lang === "ar" ? activeMethod.nameAr : activeMethod.nameEn,
          refNo: transactionRef.trim(),
          receiptImage: receiptImage || undefined
        })
      });

      const data = await res.json().catch(() => ({ success: false, error: "تعذر قراءة رد الخادم" }));

      if (res.ok && data.success) {
        setSuccessMessage(
          lang === "ar"
            ? `🎉 تم إرسال طلب الشحن بقيمة $${parseFloat(depositAmount).toFixed(2)} وإرفاق إشعار التحويل بنجاح! جاري المراجعة والتفعيل فوراً.`
            : `🎉 Deposit request of $${parseFloat(depositAmount).toFixed(2)} submitted & receipt attached successfully!`
        );

        setTransactionRef("");
        setReceiptImage("");
        setReceiptFileName("");
        fetchRealTransactions(userSession?.id, userSession?.email);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "فشل إرسال طلب الشحن" : "Failed to submit deposit request"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر لإتمام طلب الشحن. يرجى التحقق من اتصال الإنترنت." : "Connection error submitting deposit");
    } finally {
      setIsLoading(false);
    }
  };

  const sdgRate = currencyConfig?.usdToSdg || 2850;
  const userBalanceUsd = userSession?.balance || 0.0;
  const userBalanceSdg = Math.round(userBalanceUsd * sdgRate);

  return (
    <PayPalScriptProvider
      options={{
        clientId: PAYPAL_CLIENT_ID,
        currency: "USD",
        intent: "capture"
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl relative" dir="rtl">
        {/* PAYPAL VERIFICATION OVERLAY */}
        {isVerifyingPayPal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface-container-lowest border border-primary/40 rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-4 text-center">
              <span className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto block"></span>
              <h3 className="text-xl font-bold text-white">
                {lang === "ar" ? "جاري التحقق من عملية الدفع عبر PayPal..." : "Verifying PayPal payment..."}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === "ar"
                  ? "يتم الآن التواصل مع خوادم PayPal للتحقق من وصول المبلغ وتأكيد الشحن الفوري في محفظتك."
                  : "Contacting PayPal servers to confirm real payment receipt and credit your wallet."}
              </p>
            </div>
          </div>
        )}

        {/* Top Banner Header */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-outline-variant/30 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-on-surface font-display">
                  {lang === "ar" ? "إدارة المحفظة وشحن الرصيد" : "Wallet Management & Top-up"}
                </h1>
              </div>
              <p className="text-on-surface-variant text-xs sm:text-sm">
                {lang === "ar"
                  ? "شحن فوري بالجنيه السوداني عبر بنكك، أو فودافون كاش وباينانس وباي بال"
                  : "Instant top-up via Bankak (Sudan), Vodafone Cash, Binance, or PayPal"}
              </p>
            </div>

            {/* Wallet Balance Hero Card with LIVE SUDANESE POUND EQUIVALENT */}
            <div className="w-full md:w-auto p-5 rounded-2xl bg-surface-container-high/90 border border-primary/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between md:justify-start gap-4 sm:gap-6">
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {lang === "ar" ? "رصيد المحفظة الحالي" : "Current Balance"}
                </p>
                <div className="flex items-baseline gap-2.5 flex-wrap mt-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary font-mono dir-ltr">
                    ${userBalanceUsd.toFixed(2)} USD
                  </span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-lg font-mono flex items-center gap-1">
                    <span>≈ {userBalanceSdg.toLocaleString("en-US")} SDG</span>
                    <span>🇸🇩</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20 w-full sm:w-auto">
                {userSession?.membershipTier ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <span className="material-symbols-outlined text-sm text-amber-400">workspace_premium</span>
                    {userSession.membershipTier.nameAr || userSession.membershipTier.name} (-{userSession.membershipTier.discountPercentage}%)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    {lang === "ar" ? "حساب فعال 🟢" : "Active 🟢"}
                  </span>
                )}
                <span className="text-[11px] text-on-surface-variant font-mono">
                  {userSession?.email || "guest@gsmteam.com"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Deposit Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-xl space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-primary text-2xl">add_card</span>
              <h2 className="text-xl font-extrabold text-white">
                {lang === "ar" ? "طلب شحن محفظة جديد" : "New Deposit Request"}
              </h2>
            </div>

            {/* Alerts */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-red-500/20 border-2 border-red-500/50 text-red-200 text-sm font-bold flex items-center gap-2.5 shadow-lg">
                <span className="material-symbols-outlined text-lg shrink-0 text-red-400">error</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-200 text-sm font-bold flex items-center gap-2.5 shadow-lg">
                <span className="material-symbols-outlined text-lg shrink-0 text-emerald-400">check_circle</span>
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleDepositSubmit} className="space-y-6">
              {/* PAYMENT METHODS SELECTOR */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">
                  {lang === "ar" ? "اختر وسيلة الدفع المتاحة:" : "Select Payment Method:"}
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.map((m) => {
                    const isSelected = selectedMethodId === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethodId(m.id)}
                        className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3.5 text-start transition-all ${
                          isSelected
                            ? "bg-primary/25 border-2 border-primary text-white shadow-xl ring-2 ring-primary/60"
                            : "bg-[#0f172a]/90 border border-slate-700/80 text-slate-200 hover:border-primary/50 hover:bg-[#1e293b]"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center text-lg shrink-0 shadow-md`}>
                          <span className="material-symbols-outlined">{m.icon}</span>
                        </div>

                        <div className="overflow-hidden w-full">
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-extrabold text-sm text-white truncate">
                              {lang === "ar" ? m.nameAr : m.nameEn}
                            </p>
                            <span className="text-base shrink-0">{m.badge}</span>
                          </div>
                          <p className={`text-[11px] mt-0.5 truncate font-medium ${isSelected ? "text-primary font-bold" : "text-slate-300"}`}>
                            {m.isBankak
                              ? `سعر الصرف: 1$ = ${sdgRate} SDG`
                              : m.isAutomaticPayPal
                              ? (lang === "ar" ? "⚡ شحن تلقائي داخل الموقع" : "⚡ In-Page Direct Top-up")
                              : isSelected
                              ? (lang === "ar" ? "محدد الآن 🟢" : "Selected 🟢")
                              : (lang === "ar" ? "انقر لعرض البيانات والنسخ" : "Click to view details")}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIAL SPOTLIGHT FOR BANKAK (SUDANESE POUND) CALCULATION */}
              {activeMethod.isBankak && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-surface-container-high to-teal-500/15 border-2 border-emerald-500/50 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                      <span className="text-xl">🇸🇩</span>
                      <span>{lang === "ar" ? "التحويل بالجنيه السوداني عبر بنكك (سعر الصرف المعتمد)" : "Bankak Sudanese Transfer"}</span>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      1 USD = {sdgRate.toLocaleString()} SDG
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Amount in USD */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200">المبلغ بالدولار ($ USD):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400">$</span>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="w-full bg-[#0f172a] border border-emerald-500/50 rounded-xl py-2.5 pl-8 pr-3 text-white font-mono font-bold text-sm focus:border-emerald-400 outline-none"
                        />
                      </div>
                    </div>

                    {/* Converted Amount in SDG */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-200">المعادل المطلوب بالجنيه السوداني (SDG):</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-emerald-400 text-xs font-mono">SDG</span>
                        <input
                          type="number"
                          value={depositSdgAmount}
                          onChange={(e) => handleSdgAmountChange(e.target.value)}
                          className="w-full bg-[#0f172a] border border-emerald-500/50 rounded-xl py-2.5 pl-12 pr-3 text-emerald-300 font-mono font-bold text-sm focus:border-emerald-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Beneficiary Account Details */}
                  <div className="p-3.5 rounded-xl bg-[#0f172a] border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[11px] text-slate-400">رقم حساب بنك الخرطوم (بنكك):</div>
                      <div className="text-base font-mono font-bold text-emerald-300 select-all">{activeMethod.copyValue}</div>
                      <div className="text-xs text-slate-300 font-semibold mt-0.5">
                        باسم: {currencyConfig?.bankak?.accountName || "حسن"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(activeMethod.copyValue, activeMethod.id)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                        copiedId === activeMethod.id ? "bg-emerald-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId === activeMethod.id ? "check" : "content_copy"}
                      </span>
                      <span>{copiedId === activeMethod.id ? "تم النسخ! ✓" : "نسخ رقم الحساب"}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap block">
                    ℹ️ {cleanHtmlToText(activeMethod.instructionsAr)}
                  </p>
                </div>
              )}

              {/* OTHER MANUAL PAYMENT DETAILS CARD */}
              {!activeMethod.isAutomaticPayPal && !activeMethod.isBankak && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/15 via-surface-container-high to-primary/15 border-2 border-primary/50 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-extrabold text-sm text-primary">
                      <span className="text-xl">{activeMethod.badge}</span>
                      <span>{lang === "ar" ? activeMethod.detailLabelAr : activeMethod.detailLabelEn}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(activeMethod.copyValue, activeMethod.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                        copiedId === activeMethod.id ? "bg-emerald-500 text-white" : "bg-primary text-on-primary hover:bg-primary-container"
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">
                        {copiedId === activeMethod.id ? "check" : "content_copy"}
                      </span>
                      <span>{copiedId === activeMethod.id ? "تم النسخ! 📋✓" : "نسخ رقم/عنوان التحويل"}</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#0f172a] border border-primary/40 flex items-center justify-between gap-3">
                    <code className="text-sm font-mono font-bold text-primary select-all break-all dir-ltr">
                      {activeMethod.copyValue}
                    </code>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium whitespace-pre-wrap block">
                    ℹ️ {cleanHtmlToText(lang === "ar" ? activeMethod.instructionsAr : activeMethod.instructionsEn)}
                  </p>
                </div>
              )}

              {/* Amount & Reference Input for Non-Bankak manual methods */}
              {!activeMethod.isBankak && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">
                      {lang === "ar" ? "المبلغ المطلوب إيداعه ($ USD)" : "Amount ($ USD)"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary text-lg">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="10.00"
                        className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-mono font-bold text-base focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {!activeMethod.isAutomaticPayPal && (
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">
                        {lang === "ar" ? "رقم التحويل / رقم المحفظة المحول منها" : "Transaction Ref / Sender Number"}
                      </label>
                      <input
                        type="text"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder={lang === "ar" ? "مثال: VF-984321 أو رقم الحساب" : "e.g. Ref #984321"}
                        className="w-full bg-[#0f172a] border-2 border-slate-700 rounded-xl py-3 px-4 text-white font-mono text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-slate-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Reference input for Bankak */}
              {activeMethod.isBankak && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">
                    {lang === "ar" ? "رقم المعاملة في إشعار بنكك (Transaction ID / Reference):" : "Bankak Reference #:"}
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="مثال: رقم العملية في إشعار بنكك أو رقم حسابك المحول منه"
                    className="w-full bg-[#0f172a] border-2 border-emerald-500/50 rounded-xl py-3 px-4 text-white font-mono text-sm focus:border-emerald-400 outline-none"
                  />
                </div>
              )}

              {/* RECEIPT FILE UPLOAD FIELD */}
              {!activeMethod.isAutomaticPayPal && (
                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <label className="text-xs font-extrabold text-slate-100 uppercase tracking-wider block">
                    {lang === "ar" ? "إرفاق صورة إشعار أو إيصال التحويل (اختياري) 📸" : "Attach Receipt Screenshot 📸"}
                  </label>

                  <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/50 rounded-2xl bg-[#0f172a]/80 hover:border-primary transition-all text-center group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />

                    {receiptImage ? (
                      <div className="flex flex-col items-center gap-3">
                        <img
                          src={receiptImage}
                          alt="Receipt Preview"
                          className="h-28 w-auto object-contain rounded-xl border-2 border-primary shadow-lg"
                        />
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                          <span className="material-symbols-outlined text-base">check_circle</span>
                          <span>{receiptFileName || "تم إرفاق صورة الإيصال بنجاح!"}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptImage("");
                              setReceiptFileName("");
                            }}
                            className="text-red-400 hover:underline text-[11px] font-bold z-20"
                          >
                            (حذف الصورة)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                          <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                        </div>
                        <p className="font-bold text-sm text-white">
                          {lang === "ar" ? "انقر هنا لاختيار صورة الإيصال من جهازك" : "Click to select receipt screenshot"}
                        </p>
                        <p className="text-xs text-slate-300">
                          {lang === "ar" ? "مفتوح الحجم والأبعاد: جميع صيغ الصور (PNG, JPG, WEBP وغيرها) بدقتها الكاملة" : "Open size & dimensions: all image formats supported in full resolution"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Button / In-Page PayPal Smart Buttons */}
              {activeMethod.isAutomaticPayPal ? (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-400/50 shadow-lg text-amber-200 space-y-1">
                    <div className="flex items-center gap-2 text-amber-300 font-extrabold text-sm">
                      <span className="material-symbols-outlined text-xl text-amber-400 shrink-0">bolt</span>
                      <span>{lang === "ar" ? "الدفع المباشر داخل الموقع عبر PayPal ⚡" : "In-Page Direct PayPal Checkout ⚡"}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-medium leading-relaxed">
                      {lang === "ar"
                        ? `المبلغ المطلوب إيداعه: $${parseFloat(depositAmount || "10.00").toFixed(2)} USD. اضغط على زر PayPal بالأسفل لإتمام الدفع فوراً داخل الموقع.`
                        : `Top-up Amount: $${parseFloat(depositAmount || "10.00").toFixed(2)} USD. Click PayPal button below to pay directly.`}
                    </p>
                  </div>

                  <div className="w-full relative z-10">
                    <PayPalButtons
                      key={`paypal-btn-${depositAmount || "10"}`}
                      disabled={!depositAmount || parseFloat(depositAmount) < 1.0 || isLoading || isVerifyingPayPal}
                      style={{
                        layout: "vertical",
                        color: "gold",
                        shape: "rect",
                        label: "pay",
                        height: 48
                      }}
                      createOrder={async () => {
                        setErrorMessage("");
                        setSuccessMessage("");
                        const num = parseFloat(depositAmount || "0");
                        if (isNaN(num) || num < 1.0) {
                          setErrorMessage(lang === "ar" ? "الحد الأدنى للإيداع هو $1.00 USD" : "Minimum deposit is $1.00 USD");
                          throw new Error("Invalid deposit amount");
                        }

                        const token = localStorage.getItem("user_token");
                        const res = await fetch("/api/wallet/paypal/create-order", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                          },
                          body: JSON.stringify({
                            amount: num
                          })
                        });

                        const data = await res.json();
                        if (!res.ok || !data.success || !data.orderId) {
                          const errMsg = data.error || (lang === "ar" ? "فشل إنشاء طلب الدفع عبر PayPal" : "Failed to create PayPal order");
                          setErrorMessage(errMsg);
                          throw new Error(errMsg);
                        }

                        return data.orderId;
                      }}
                      onApprove={async (data) => {
                        if (data.orderID) {
                          await handlePayPalReturnCapture(data.orderID, userSession);
                        }
                      }}
                      onError={() => {
                        setErrorMessage(lang === "ar" ? "حدث خطأ أثناء الاتصال ببوابة PayPal" : "Error connecting to PayPal");
                      }}
                    />
                  </div>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary py-4 rounded-2xl font-bold text-sm hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
                      <span>
                        {lang === "ar"
                          ? "جاري إرفاق الإشعار وتسجيل طلب الشحن..."
                          : "Submitting deposit & receipt..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">send</span>
                      <span>
                        {lang === "ar"
                          ? `تأكيد وإرسال طلب الشحن ($${parseFloat(depositAmount || "0").toFixed(2)} USD)`
                          : `Submit Top-up Request ($${parseFloat(depositAmount || "0").toFixed(2)} USD)`}
                      </span>
                    </>
                  )}
                </button>
              )}
            </form>
          </div>

          {/* Right Column: Exchange Rates & Quick Deposit Info Widget */}
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-4">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">currency_exchange</span>
                <span>أسعار الصرف المعتمدة بالموقع</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span>🇸🇩</span>
                    <span>الجنيه السوداني (SDG)</span>
                  </span>
                  <span className="font-mono font-bold text-primary">1$ = {sdgRate.toLocaleString()} SDG</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span>🇪🇬</span>
                    <span>الجنيه المصري (EGP)</span>
                  </span>
                  <span className="font-mono font-bold text-on-surface-variant">1$ = {currencyConfig?.usdToEgp || 50} EGP</span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between">
                  <span className="font-bold text-on-surface flex items-center gap-1.5">
                    <span>🇸🇦</span>
                    <span>الريال السعودي (SAR)</span>
                  </span>
                  <span className="font-mono font-bold text-on-surface-variant">1$ = {currencyConfig?.usdToSar || 3.75} SAR</span>
                </div>
              </div>
            </div>

            {/* Quick Support Card */}
            <div className="glass-card rounded-3xl p-6 border border-outline-variant/30 shadow-xl space-y-3">
              <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-lg">support_agent</span>
                <span>{lang === "ar" ? "تحتاج مساعدة في الشحن؟" : "Need help with deposit?"}</span>
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {lang === "ar"
                  ? "إذا واجهتك أي مشكلة أثناء التحويل عبر بنكك أو المحافظ الرقمية، يمكنك التواصل مباشرة مع خدمة العملاء على واتساب."
                  : "If you encounter any issues during transfer via Bankak or digital wallets, you can contact customer service directly on WhatsApp."}
              </p>
              <a
                href="https://wa.me/16728972935"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-base">chat</span>
                <span>{lang === "ar" ? "تواصل معنا عبر واتساب" : "Contact us on WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Transactions History Table */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-primary text-2xl">history</span>
              <h3 className="text-lg font-bold text-on-surface">سجل حركات ومعاملات المحفظة</h3>
            </div>

            <button
              type="button"
              onClick={() => fetchRealTransactions(userSession?.id, userSession?.email)}
              className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
              <span>تحديث السجل</span>
            </button>
          </div>

          {isFetchingTx ? (
            <div className="p-12 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
              <span>جاري تحميل المعاملات...</span>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-on-surface-variant space-y-2">
              <span className="material-symbols-outlined text-3xl opacity-40">receipt</span>
              <p>لا توجد معاملات مسجلة في المحفظة حتى الآن.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-surface-container-high/50 text-on-surface-variant border-b border-outline-variant/20 font-bold">
                  <tr>
                    <th className="p-3.5">رقم المعاملة</th>
                    <th className="p-3.5">النوع والبيان</th>
                    <th className="p-3.5">طريقة الدفع</th>
                    <th className="p-3.5">المبلغ</th>
                    <th className="p-3.5">الحالة</th>
                    <th className="p-3.5">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-container-high/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-primary">{tx.refNo || `#${tx.id.slice(-6)}`}</td>
                      <td className="p-3.5 font-bold text-on-surface">{tx.type}</td>
                      <td className="p-3.5 text-on-surface-variant">{tx.method}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">${(tx.amount || 0).toFixed(2)} USD</td>
                      <td className="p-3.5">
                        {tx.status === "completed" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                            مكتمل ✅
                          </span>
                        ) : tx.status === "pending" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                            قيد المراجعة ⏳
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[10px] font-bold">
                            مرفوض ❌
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-on-surface-variant text-[11px]">
                        {new Date(tx.createdAt).toLocaleString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PayPalScriptProvider>
  );
}
