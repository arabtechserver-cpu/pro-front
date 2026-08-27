"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Locale } from "@/i18n/config";

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
}

const OFFICIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "paypal",
    nameAr: "باي بال PayPal (تلقائي فوري)",
    nameEn: "PayPal (Instant Auto)",
    badge: "🅿️",
    icon: "payments",
    color: "from-blue-600 to-indigo-600",
    copyValue: "paypal@gsmteam.com",
    detailLabelAr: "الدفع التلقائي المباشر عبر PayPal (داخل الموقع):",
    detailLabelEn: "Direct PayPal Instant Payment (In-Page):",
    instructionsAr: "ادخل المبلغ واضغط دفع لفتح نافذة PayPal الآمنة داخل الموقع دون مغادرة الصفحة.",
    instructionsEn: "Enter amount and click Pay to open in-page secure PayPal window without leaving.",
    isAutomaticPayPal: true
  },
  {
    id: "bnb",
    nameAr: "BNB Smart Chain (BEP20)",
    nameEn: "BNB Smart Chain (BEP20)",
    badge: "🟡",
    icon: "currency_bitcoin",
    color: "from-yellow-500 to-amber-600",
    copyValue: "0xaCc3ab6f0165B39Cf2F1286ED8A778735Ae8314f",
    detailLabelAr: "عنوان المحفظة (BEP20 Address):",
    detailLabelEn: "BEP20 Wallet Address:",
    instructionsAr: "تأكد من اختيار شبكة (BNB Smart Chain - BEP20) ثم ارفع صورة إثبات المعاملة من باينانس أو Trust Wallet.",
    instructionsEn: "Ensure network selected is BNB Smart Chain (BEP20) then upload transaction receipt screenshot."
  },
  {
    id: "bankak",
    nameAr: "بنك الخرطوم بإسم حسن",
    nameEn: "Bank of Khartoum (Name: Hassan)",
    badge: "🏦",
    icon: "account_balance",
    color: "from-emerald-600 to-teal-700",
    copyValue: "6302273",
    detailLabelAr: "رقم حساب بنكك (باسم: حسن):",
    detailLabelEn: "Bankak Account # (Name: Hassan):",
    instructionsAr: "حول المبلغ عبر تطبيق بنكك إلى رقم الحساب (6302273) باسم حسن ثم ارفع صورة إشعار بنكك للتأكيد.",
    instructionsEn: "Transfer via Bankak app to account # 6302273 (Hassan) then upload receipt image for confirmation."
  },
  {
    id: "binance",
    nameAr: "Binance Pay (باينانس)",
    nameEn: "Binance Pay",
    badge: "🔶",
    icon: "currency_exchange",
    color: "from-amber-500 to-yellow-600",
    copyValue: "287584748",
    detailLabelAr: "معرف باينانس باي (Binance Pay ID):",
    detailLabelEn: "Binance Pay ID:",
    instructionsAr: "افتح تطبيق باينانس واكتب معرف Binance Pay ID (287584748) ثم ارفق لقطة الشاشة للتأكيد.",
    instructionsEn: "Open Binance App and send funds via Pay ID (287584748) then attach payment screenshot."
  },
  {
    id: "vodafone",
    nameAr: "فودافون كاش Vodafone Cash",
    nameEn: "Vodafone Cash",
    badge: "📱",
    icon: "phone_iphone",
    color: "from-red-600 to-rose-700",
    copyValue: "01036673447",
    detailLabelAr: "رقم محفظة فودافون كاش:",
    detailLabelEn: "Vodafone Cash Wallet Number:",
    instructionsAr: "حول المبلغ إلى رقم المحفظة (01036673447) واكتب الرقم المحول منه وارفق صورة رسالة أو إيصال التفعيل.",
    instructionsEn: "Transfer funds to wallet number 01036673447 then attach receipt screenshot."
  }
];

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
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("paypal");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [receiptFileName, setReceiptFileName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingTx, setIsFetchingTx] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // In-Page PayPal Embedded Modal State
  const [paypalModalUrl, setPaypalModalUrl] = useState<string | null>(null);
  const [paypalOrderId, setPaypalOrderId] = useState<string | null>(null);
  const [isVerifyingPayPal, setIsVerifyingPayPal] = useState<boolean>(false);

  const [transactions, setTransactions] = useState<DBTransaction[]>([]);

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

  // Handle Automatic Return Capture from PayPal Checkout
  const handlePayPalReturnCapture = async (orderId: string, userObj?: any) => {
    setIsLoading(true);
    setIsVerifyingPayPal(true);
    try {
      const res = await fetch("/api/wallet/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          userId: userObj?.id || userSession?.id,
          email: userObj?.email || userSession?.email
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(
          lang === "ar"
            ? `🎉 تم الدفع واعتتماد الشحن التلقائي بمبلغ $${data.amount} USD بنجاح! رصيدك الجديد: $${data.balance}`
            : `🎉 Payment successful! $${data.amount} USD added. New balance: $${data.balance}`
        );

        // Close In-Page Modal
        setPaypalModalUrl(null);
        setPaypalOrderId(null);

        // Update Local Session Balance
        if (userObj || userSession) {
          const updated = { ...(userObj || userSession), balance: data.balance };
          localStorage.setItem("user_session", JSON.stringify(updated));
          setUserSession(updated);
          window.dispatchEvent(new Event("user_session_change"));
        }

        fetchRealTransactions(userObj?.id || userSession?.id, userObj?.email || userSession?.email);

        // Clean URL query string
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
      if (userId) {
        url += `?userId=${encodeURIComponent(userId)}`;
      } else if (email) {
        url += `?email=${encodeURIComponent(email)}`;
      }

      const token = localStorage.getItem("user_token");
      const res = await fetch(url, {
        headers: token ? { "Authorization": `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTransactions(data.transactions || []);
      }
    } catch {
      console.error("Failed to fetch real transactions from database");
    } finally {
      setIsFetchingTx(false);
    }
  };

  const activeMethod = OFFICIAL_PAYMENT_METHODS.find((m) => m.id === selectedMethodId) || OFFICIAL_PAYMENT_METHODS[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const compressReceiptImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDimension = 1600;
          let { width, height } = img;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL("image/jpeg", 0.85);
            resolve(compressedBase64);
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setErrorMessage(lang === "ar" ? "حجم الصورة كبير جداً! الأقصى 20 ميجابايت." : "File size too large! Max 20MB.");
        return;
      }
      setReceiptFileName(file.name);
      try {
        const compressed = await compressReceiptImage(file);
        setReceiptImage(compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          setReceiptImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Submit Handler for Manual & In-Page Embedded PayPal Checkout
  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال مبلغ إيداع صحيح! (حد أدنى $1.00 USD)" : "Please enter a valid deposit amount (min $1.00)!");
      return;
    }

    setIsLoading(true);

    // IF PAYPAL IS SELECTED -> OPEN EMBEDDED MODAL INSIDE WEBSITE!
    if (activeMethod.isAutomaticPayPal) {
      try {
        const res = await fetch("/api/wallet/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(depositAmount),
            userId: userSession?.id,
            email: userSession?.email
          })
        });

        const data = await res.json();

        if (res.ok && data.success && data.approvalUrl) {
          // OPEN EMBEDDED MODAL INSIDE WEBSITE ONLY (NO EXTERNAL POPUP WINDOW)
          setPaypalModalUrl(data.approvalUrl);
          setPaypalOrderId(data.orderId);
          setIsLoading(false);
          return;
        } else {
          setErrorMessage(data.error || (lang === "ar" ? "تعذر إنشاء طلب الدفع عبر PayPal" : "Failed to create PayPal checkout"));
          setIsLoading(false);
          return;
        }
      } catch {
        setErrorMessage(lang === "ar" ? "خطأ في الاتصال بسيرفر PayPal" : "PayPal server connection error");
        setIsLoading(false);
        return;
      }
    }

    // MANUAL METHODS (Vodafone Cash, Bankak, BNB, Binance)
    if (!transactionRef.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال رقم المعاملة أو رقم المحفظة المحول منها!" : "Please enter transaction reference / sender number!");
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("user_token");
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {})
        },
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

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMessage(
          lang === "ar"
            ? `تم تسجيل طلب الشحن بقيمة $${parseFloat(depositAmount).toFixed(2)} وإرفاق صورة الإيصال بنجاح! جاري المراجعة والتفعيل.`
            : `Deposit request of $${parseFloat(depositAmount).toFixed(2)} saved & receipt attached successfully!`
        );

        setDepositAmount("");
        setTransactionRef("");
        setReceiptImage("");
        setReceiptFileName("");
        fetchRealTransactions(userSession?.id, userSession?.email);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "فشل حفظ العملية في قاعدة البيانات" : "Failed to save transaction"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl relative">
      {/* IN-PAGE EMBEDDED PAYPAL GLASSMorphic MODAL DIALOG */}
      {paypalModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-surface-container-lowest border border-primary/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <span className="text-2xl">🅿️</span>
                <span>{lang === "ar" ? "نافذة الدفع المباشر داخل الموقع - PayPal" : "In-Page PayPal Direct Payment Window"}</span>
              </div>
              <button
                onClick={() => {
                  setPaypalModalUrl(null);
                  if (paypalOrderId) handlePayPalReturnCapture(paypalOrderId, userSession);
                }}
                className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-red-500/20 hover:text-red-400 text-on-surface-variant flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 space-y-2">
              <p className="text-xs font-bold text-on-surface">
                {lang === "ar"
                  ? `جاري شحن محفظتك بمبلغ $${parseFloat(depositAmount || "0").toFixed(2)} USD`
                  : `Top-up Amount: $${parseFloat(depositAmount || "0").toFixed(2)} USD`}
              </p>
              <p className="text-[11px] text-on-surface-variant">
                {lang === "ar"
                  ? "نافذة الدفع المباشرة مفتوحة الآن. بمجرد إتمام الدفع، سيتم إضافة الرصيد للمحفظة فوراً!"
                  : "PayPal window is active. Balance will be updated automatically upon payment completion."}
              </p>
            </div>

            {/* Embedded Iframe Option inside the page layout */}
            <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-outline-variant/30 bg-white relative shadow-inner">
              <iframe
                src={paypalModalUrl}
                className="w-full h-full border-none"
                title="PayPal Embedded Checkout"
                allow="payment"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={() => {
                  if (paypalOrderId) handlePayPalReturnCapture(paypalOrderId, userSession);
                }}
                disabled={isVerifyingPayPal}
                className="w-full py-3 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all flex items-center justify-center gap-2"
              >
                {isVerifyingPayPal ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                    <span>{lang === "ar" ? "جاري التأكيد والتحقق من السحب..." : "Verifying payment..."}</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>{lang === "ar" ? "اضغط هنا فور الدفع لخصم وشحن الرصيد مباشرة" : "Click after payment to capture balance"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 mb-8 border border-outline-variant/30 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary text-3xl">account_balance_wallet</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
                {lang === "ar" ? "إدارة المحفظة وشحن الرصيد الآلي" : "Wallet Management & Automated Top-up"}
              </h1>
            </div>
            <p className="text-on-surface-variant text-xs sm:text-sm">
              {lang === "ar"
                ? "شحن فورى تلقائي عبر PayPal داخل الموقع، أو التحويل اليدوي مع رفع الإيصال"
                : "Instant in-page PayPal top-up or manual transfer with receipt upload"}
            </p>
          </div>

          {/* Wallet Balance Hero Card */}
          <div className="w-full md:w-auto p-5 rounded-2xl bg-surface-container-high/90 border border-primary/40 shadow-xl flex items-center justify-between md:justify-start gap-6">
            <div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === "ar" ? "رصيد المحفظة الحالي" : "Current Balance"}
              </p>
              <p className="text-2xl sm:text-3xl font-bold text-primary font-mono dir-ltr mt-1">
                ${(userSession?.balance || 0.0).toFixed(2)}
              </p>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                {lang === "ar" ? "حساب فعال 🟢" : "Active 🟢"}
              </span>
              <span className="text-[11px] text-on-surface-variant font-mono">
                {userSession?.email || "guest@gsmteam.com"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Deposit Form + Official Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left 2 Columns: Deposit Form */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-xl">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-outline-variant/20">
            <span className="material-symbols-outlined text-primary text-xl">add_card</span>
            <h2 className="text-lg font-bold text-on-surface">
              {lang === "ar" ? "طلب شحن محفظة جديد" : "New Wallet Top-up Request"}
            </h2>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleDepositSubmit} className="space-y-6">
            {/* 5 OFFICIAL PAYMENT METHODS BUTTONS */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                {lang === "ar" ? "اختر طريقة الدفع المتاحة:" : "Select Payment Method:"}
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OFFICIAL_PAYMENT_METHODS.map((m) => {
                  const isSelected = selectedMethodId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethodId(m.id)}
                      className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-3.5 text-start transition-all ${
                        isSelected
                          ? "bg-primary/20 border-primary text-primary shadow-lg ring-2 ring-primary/50"
                          : "bg-surface-container-lowest border-outline-variant/30 text-on-surface hover:border-primary/40 hover:bg-surface-container-high/40"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} text-white flex items-center justify-center text-lg shrink-0 shadow-md`}>
                        <span className="material-symbols-outlined">{m.icon}</span>
                      </div>

                      <div className="overflow-hidden w-full">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-sm text-on-surface truncate">
                            {lang === "ar" ? m.nameAr : m.nameEn}
                          </p>
                          <span className="text-base shrink-0">{m.badge}</span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                          {m.isAutomaticPayPal
                            ? (lang === "ar" ? "⚡ شحن داخل الموقع" : "⚡ In-Page Direct Top-up")
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

            {/* EXPANDED FULL DETAILS & COPY PANEL FOR MANUAL METHODS ONLY */}
            {!activeMethod.isAutomaticPayPal && (
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/10 via-surface-container-high to-primary/10 border border-primary/40 shadow-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-primary">
                    <span className="text-xl">{activeMethod.badge}</span>
                    <span>{lang === "ar" ? activeMethod.detailLabelAr : activeMethod.detailLabelEn}</span>
                  </div>

                  {/* COPY BUTTON */}
                  <button
                    type="button"
                    onClick={() => handleCopy(activeMethod.copyValue, activeMethod.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md active:scale-95 ${
                      copiedId === activeMethod.id
                        ? "bg-emerald-500 text-white"
                        : "bg-primary text-on-primary hover:bg-primary-container"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {copiedId === activeMethod.id ? "check" : "content_copy"}
                    </span>
                    <span>
                      {copiedId === activeMethod.id
                        ? (lang === "ar" ? "تم النسخ! 📋✓" : "Copied! 📋✓")
                        : (lang === "ar" ? "نسخ رقم/عنوان التحويل" : "Copy Address")}
                    </span>
                  </button>
                </div>

                {/* Display Copy Value */}
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/40 flex items-center justify-between gap-3">
                  <code className="text-sm font-mono font-bold text-primary select-all break-all dir-ltr">
                    {activeMethod.copyValue}
                  </code>
                </div>

                <p className="text-xs text-on-surface-variant leading-relaxed">
                  ℹ️ {lang === "ar" ? activeMethod.instructionsAr : activeMethod.instructionsEn}
                </p>
              </div>
            )}

            {/* Amount & Reference Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  {lang === "ar" ? "المبلغ المطلوب إيداعه ($ USD)" : "Amount ($ USD)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-primary">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="10.00"
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 pl-8 pr-4 text-on-surface font-mono font-bold focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {!activeMethod.isAutomaticPayPal && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    {lang === "ar" ? "رقم التحويل / رقم المحفظة / الإيصال" : "Transaction Ref / Sender Number"}
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: VF-984321 أو رقم الحساب" : "e.g. Ref #984321"}
                    className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl py-3 px-4 text-on-surface font-mono text-xs focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* RECEIPT FILE UPLOAD FIELD FOR MANUAL METHODS */}
            {!activeMethod.isAutomaticPayPal && (
              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">
                  {lang === "ar" ? "إرفاق صورة إيصال التحويل للتأكيد (اختياري) 📸" : "Attach Receipt Screenshot 📸"}
                </label>

                <div className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-primary/40 rounded-2xl bg-surface-container-lowest hover:border-primary transition-all text-center group cursor-pointer">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                  />

                  {receiptImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={receiptImage}
                        alt="Receipt Preview"
                        className="h-28 w-auto object-contain rounded-xl border border-primary/40 shadow-lg"
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
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
                      </div>
                      <p className="font-bold text-xs text-on-surface">
                        {lang === "ar" ? "انقر هنا لاختيار صورة الإيصال من جهازك" : "Click to select receipt screenshot"}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {lang === "ar" ? "الصيغ المدعومة: PNG, JPG, JPEG (أقصى حجم 10MB)" : "Supports PNG, JPG, JPEG (Max 10MB)"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(45,212,191,0.25)] active:scale-[0.99] flex items-center justify-center gap-2 ${
                activeMethod.isAutomaticPayPal
                  ? "bg-yellow-500 hover:bg-yellow-400 text-black font-extrabold"
                  : "bg-primary-container text-on-primary-container hover:bg-primary glow-primary"
              }`}
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>{activeMethod.isAutomaticPayPal ? (lang === "ar" ? "جاري فتح نافذة PayPal بالموقع..." : "Opening PayPal in-page...") : (lang === "ar" ? "جاري إرسال طلب الشحن..." : "Submitting request...")}</span>
                </>
              ) : activeMethod.isAutomaticPayPal ? (
                <>
                  <span className="text-xl">🅿️</span>
                  <span>{lang === "ar" ? "فتح نافذة الدفع والتأكيد المباشر عبر PayPal ⚡" : "Open In-Page PayPal Checkout ⚡"}</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">send</span>
                  <span>{lang === "ar" ? "تأكيد وإرسال طلب الشحن" : "Submit Top-up Request"}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right 1 Column: Quick Info & Support */}
        <div className="space-y-6">
          {/* Quick Notice Card */}
          <div className="glass-card rounded-2xl p-6 border border-outline-variant/30 shadow-xl bg-surface-container-low/60">
            <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-outline-variant/20">
              <span className="material-symbols-outlined text-amber-400 text-xl">verified_user</span>
              <h3 className="font-bold text-sm text-on-surface">
                {lang === "ar" ? "تعليمات وتأكيد الإيداع" : "Deposit Verification Guidelines"}
              </h3>
            </div>

            <ul className="space-y-3 text-xs text-on-surface-variant leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm shrink-0 mt-0.5">bolt</span>
                <span>{lang === "ar" ? "تفتح نافذة PayPal الآمنة مباشرة داخل الموقع بدون مغادرة الصفحة." : "PayPal window opens inside site layout."}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5">check_circle</span>
                <span>{lang === "ar" ? "تُحفظ جميع طلباتك في قاعدة البيانات وتظهر فوراً في الجدول بالأسفل." : "All transactions are saved in real DB and shown below."}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5">check_circle</span>
                <span>{lang === "ar" ? "انقر على زر 'نسخ' بجانب العنوان/الرقم لنسخه فوراً في حافظة جهازك." : "Click 'Copy' button to copy address instantly to clipboard."}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-primary text-sm shrink-0 mt-0.5">check_circle</span>
                <span>{lang === "ar" ? "لأي استفسار فورى، تواصل مع فريق الدعم الفني المباشر عبر واتساب." : "For instant help, contact support via WhatsApp."}</span>
              </li>
            </ul>
          </div>

          {/* Support Contact Pill */}
          <div className="glass-card rounded-2xl p-6 border border-primary/30 shadow-xl bg-primary/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-3xl">support_agent</span>
              <div>
                <p className="font-bold text-sm text-on-surface">{lang === "ar" ? "الدعم الفني المباشر" : "Live Technical Support"}</p>
                <p className="text-xs text-primary">{lang === "ar" ? "متواجدون على مدار 24/7" : "Available 24/7"}</p>
              </div>
            </div>
            <Link
              href={`/${lang}/contact`}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all"
            >
              {lang === "ar" ? "مراسلة الدعم" : "Contact"}
            </Link>
          </div>
        </div>
      </div>

      {/* REAL TRANSACTION HISTORY DATA TABLE FROM PRISMA DB */}
      <div className="glass-card rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-xl">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-primary text-xl">history</span>
            <h2 className="text-lg font-bold text-on-surface">
              {lang === "ar" ? "سجل العمليات والإيداعات الحقيقية (من قاعدة البيانات)" : "Real Database Transaction Logs"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchRealTransactions(userSession?.id, userSession?.email)}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high border border-outline-variant/30 hover:border-primary/50 text-xs font-bold text-on-surface flex items-center gap-1.5 transition-all"
            >
              <span className={`material-symbols-outlined text-sm text-primary ${isFetchingTx ? "animate-spin" : ""}`}>
                refresh
              </span>
              <span>{lang === "ar" ? "تحديث" : "Refresh"}</span>
            </button>

            <span className="text-xs font-mono text-on-surface-variant font-bold">
              {transactions.length} {lang === "ar" ? "معاملة مسجلة" : "transactions"}
            </span>
          </div>
        </div>

        {isFetchingTx ? (
          <div className="p-8 text-center text-xs text-on-surface-variant flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
            <span>{lang === "ar" ? "جاري جلب المعاملات من قاعدة البيانات..." : "Fetching transactions..."}</span>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-start border-collapse text-xs">
              <thead>
                <tr className="border-b border-outline-variant/20 text-on-surface-variant uppercase tracking-wider font-bold">
                  <th className="pb-3 text-start">{lang === "ar" ? "نوع المعاملة" : "Type"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "طريقة الدفع" : "Method"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "رقم المرجع / الإيصال" : "Ref No"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "التاريخ" : "Date"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "المبلغ" : "Amount"}</th>
                  <th className="pb-3 text-start">{lang === "ar" ? "الحالة" : "Status"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-high/40 transition-colors">
                    <td className="py-4 font-bold text-on-surface">{tx.type}</td>
                    <td className="py-4 text-on-surface-variant font-medium">{tx.method}</td>
                    <td className="py-4 font-mono text-primary font-bold dir-ltr">{tx.refNo}</td>
                    <td className="py-4 text-on-surface-variant font-mono">
                      {new Date(tx.createdAt).toLocaleString(lang === "ar" ? "ar-EG" : "en-US")}
                    </td>
                    <td className={`py-4 font-mono font-bold dir-ltr ${tx.amount > 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.amount > 0 ? `+$${tx.amount.toFixed(2)}` : `-$${Math.abs(tx.amount).toFixed(2)}`}
                    </td>
                    <td className="py-4">
                      {tx.status === "completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                          {lang === "ar" ? "مكتمل 🟢" : "Completed"}
                        </span>
                      )}
                      {tx.status === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                          {lang === "ar" ? "قيد المراجعة 🟡" : "Pending"}
                        </span>
                      )}
                      {tx.status === "failed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                          {lang === "ar" ? "مرفوض 🔴" : "Failed"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-on-surface-variant flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">receipt_long</span>
            <p className="font-bold text-sm text-on-surface">
              {lang === "ar" ? "لا توجد معاملات حقيقية مسجلة بعد" : "No DB transactions recorded yet"}
            </p>
            <p className="text-xs">
              {lang === "ar" ? "قم بإرسال طلب الشحن الأول بالخلفية وسيتم حفظه مباشرة في قاعدة البيانات." : "Submit a deposit request to record your first real transaction."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
