"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import Script from "next/script";
import { Locale } from "@/i18n/config";
import TermsModal from "@/components/TermsModal";
import CloudflareTurnstile from "@/components/CloudflareTurnstile";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "540676912586-vifo9ogu2gjud3d00efv1khd9r7tcajb.apps.googleusercontent.com";

interface Country {
  code: string;
  nameAr: string;
  nameEn: string;
  flag: string;
  dialCode: string;
  walletsAr: string[];
  walletsEn: string[];
}

const ALL_COUNTRIES: Country[] = [
  {
    code: "EG",
    nameAr: "مصر",
    nameEn: "Egypt",
    flag: "🇪🇬",
    dialCode: "+20",
    walletsAr: ["فودافون كاش (Vodafone Cash)", "إنستا باي (InstaPay)", "أورنج كاش (Orange Cash)", "اتصالات كاش (Etisalat Cash)", "وي باي (WE Pay)", "تحويل بنكي مصري"],
    walletsEn: ["Vodafone Cash", "InstaPay", "Orange Cash", "Etisalat Cash", "WE Pay", "Egyptian Bank Transfer"]
  },
  {
    code: "SA",
    nameAr: "السعودية",
    nameEn: "Saudi Arabia",
    flag: "🇸🇦",
    dialCode: "+966",
    walletsAr: ["STC Pay", "Urpay", "بطاقة مدى (Mada)", "Apple Pay", "تحويل بنكي محلي (راجحي/أهلي)"],
    walletsEn: ["STC Pay", "Urpay", "Mada Card", "Apple Pay", "Local Bank Transfer (Rajhi/SNB)"]
  },
  {
    code: "AE",
    nameAr: "الإمارات العربية المتحدة",
    nameEn: "United Arab Emirates",
    flag: "🇦🇪",
    dialCode: "+971",
    walletsAr: ["Binance Pay", "Apple Pay", "بطاقات فيزا / ماستركارد", "تحويل بنكي إماراتي"],
    walletsEn: ["Binance Pay", "Apple Pay", "Visa / Mastercard", "UAE Bank Transfer"]
  },
  {
    code: "SD",
    nameAr: "السودان",
    nameEn: "Sudan",
    flag: "🇸🇩",
    dialCode: "+249",
    walletsAr: ["بنكك (بنك الخرطوم - Bankak)", "فوري (Fawry Sudan)", "USDT كريبتو"],
    walletsEn: ["Bankak (Bank of Khartoum)", "Fawry Sudan", "USDT Crypto"]
  },
  {
    code: "KW",
    nameAr: "الكويت",
    nameEn: "Kuwait",
    flag: "🇰🇼",
    dialCode: "+965",
    walletsAr: ["K-Net (كي نت)", "Apple Pay", "تحويل بنكي كويتي"],
    walletsEn: ["K-Net", "Apple Pay", "Kuwaiti Bank Transfer"]
  },
  {
    code: "QA",
    nameAr: "قطر",
    nameEn: "Qatar",
    flag: "🇶🇦",
    dialCode: "+974",
    walletsAr: ["iPay Qatar", "Apple Pay", "بطاقة فيزا/ماستر", "تحويل بنكي قطري"],
    walletsEn: ["iPay Qatar", "Apple Pay", "Visa / Mastercard", "Qatari Bank Transfer"]
  },
  {
    code: "JO",
    nameAr: "الأردن",
    nameEn: "Jordan",
    flag: "🇯🇴",
    dialCode: "+962",
    walletsAr: ["زين كاش الأردن (Zain Cash JO)", "اي فواتيركم (eFAWATEERcom)", "دينارك (Dinarak)", "محفظة أورانج كاش"],
    walletsEn: ["Zain Cash JO", "eFAWATEERcom", "Dinarak", "Orange Money JO"]
  },
  {
    code: "IQ",
    nameAr: "العراق",
    nameEn: "Iraq",
    flag: "🇮🇶",
    dialCode: "+964",
    walletsAr: ["زين كاش العراق (Zain Cash IQ)", "آسيا حوالة (Asiahawala)", "ماستركارد النخيل / كي كارد", "محفظة FastPay"],
    walletsEn: ["Zain Cash IQ", "Asiahawala", "Qi Card / Qi Master", "FastPay Wallet"]
  },
  {
    code: "DZ",
    nameAr: "الجزائر",
    nameEn: "Algeria",
    flag: "🇩🇿",
    dialCode: "+213",
    walletsAr: ["بريدي موب (BaridiMob)", "CCP الجزائر", "Wise / Paysera"],
    walletsEn: ["BaridiMob", "Algeria CCP", "Wise / Paysera"]
  },
  {
    code: "MA",
    nameAr: "المغرب",
    nameEn: "Morocco",
    flag: "🇲🇦",
    dialCode: "+212",
    walletsAr: ["Wafacash (وفاكاش)", "CIH Bank (بنك CIH)", "التجاري وفا بنك", "BMCE Direct"],
    walletsEn: ["Wafacash", "CIH Bank", "Attijariwafa Bank", "BMCE Direct"]
  },
  {
    code: "TN",
    nameAr: "تونس",
    nameEn: "Tunisia",
    flag: "🇹🇳",
    dialCode: "+216",
    walletsAr: ["D17 البريد التونسي", "Sobflous", "تحويل بنكي تونسي"],
    walletsEn: ["D17 La Poste Tunisienne", "Sobflous", "Tunisian Bank Transfer"]
  },
  {
    code: "LY",
    nameAr: "ليبيا",
    nameEn: "Libya",
    flag: "🇱🇾",
    dialCode: "+218",
    walletsAr: ["سداد (Sadad Libya)", "تداول (Tadawul)", "موبي كاش (MobiCash)", "كروت مدار / ليبيانا"],
    walletsEn: ["Sadad Libya", "Tadawul", "MobiCash", "Madar / Libyana Cards"]
  },
  {
    code: "OM",
    nameAr: "عُمان",
    nameEn: "Oman",
    flag: "🇴🇲",
    dialCode: "+968",
    walletsAr: ["Thawani Pay (محفظة ثواني)", "BenefitPay Oman", "تحويل بنكي عماني"],
    walletsEn: ["Thawani Pay", "BenefitPay Oman", "Omani Bank Transfer"]
  },
  {
    code: "BH",
    nameAr: "البحرين",
    nameEn: "Bahrain",
    flag: "🇧🇭",
    dialCode: "+973",
    walletsAr: ["BenefitPay (بنفت باي)", "STC Pay Bahrain", "Apple Pay"],
    walletsEn: ["BenefitPay", "STC Pay Bahrain", "Apple Pay"]
  },
  {
    code: "PS",
    nameAr: "فلسطين",
    nameEn: "Palestine",
    flag: "🇵🇸",
    dialCode: "+970",
    walletsAr: ["محفظة جوال باي (Jawwal Pay)", "محفظة بال باي (PalPay)", "تحويل بنك فلسطين"],
    walletsEn: ["Jawwal Pay", "PalPay", "Bank of Palestine Transfer"]
  },
  {
    code: "YE",
    nameAr: "اليمن",
    nameEn: "Yemen",
    flag: "🇾🇪",
    dialCode: "+967",
    walletsAr: ["جوال سبأ (Kuraimi / الكريمي)", "محفظة كاش", "جيب (Jeeb)"],
    walletsEn: ["Kuraimi Express", "Cash Wallet Yemen", "Jeeb Wallet"]
  },
  {
    code: "SY",
    nameAr: "سوريا",
    nameEn: "Syria",
    flag: "🇸🇾",
    dialCode: "+963",
    walletsAr: ["سيريتل كاش (Syriatel Cash)", "كاش موبايل (MTN Cash)", "USDT الرقمي"],
    walletsEn: ["Syriatel Cash", "MTN Cash Syria", "USDT Crypto"]
  },
  {
    code: "LB",
    nameAr: "لبنان",
    nameEn: "Lebanon",
    flag: "🇱🇧",
    dialCode: "+961",
    walletsAr: ["Whish Money", "OMT Card / Cash", "USDT الرقمي"],
    walletsEn: ["Whish Money", "OMT Cash", "USDT Crypto"]
  },
  {
    code: "TR",
    nameAr: "تركيا",
    nameEn: "Turkey",
    flag: "🇹🇷",
    dialCode: "+90",
    walletsAr: ["Papara (بابارا)", "Ininal Card", "تحويل زراعات بنك (Ziraat Bank)"],
    walletsEn: ["Papara", "Ininal Card", "Ziraat Bank Transfer"]
  },
  {
    code: "US",
    nameAr: "الولايات المتحدة",
    nameEn: "United States",
    flag: "🇺🇸",
    dialCode: "+1",
    walletsAr: ["Zelle", "Venmo", "CashApp", "Apple Pay", "Credit Card / Stripe"],
    walletsEn: ["Zelle", "Venmo", "CashApp", "Apple Pay", "Credit Card / Stripe"]
  },
  {
    code: "GB",
    nameAr: "المملكة المتحدة",
    nameEn: "United Kingdom",
    flag: "🇬🇧",
    dialCode: "+44",
    walletsAr: ["Revolut", "Monzo", "Faster Payments UK", "Apple Pay"],
    walletsEn: ["Revolut", "Monzo", "Faster Payments UK", "Apple Pay"]
  },
  {
    code: "DE",
    nameAr: "ألمانيا",
    nameEn: "Germany",
    flag: "🇩🇪",
    dialCode: "+49",
    walletsAr: ["SEPA Instant Transfer", "PayPal Europe", "Revolut / N26"],
    walletsEn: ["SEPA Instant Transfer", "PayPal Europe", "Revolut / N26"]
  },
  {
    code: "FR",
    nameAr: "فرنسا",
    nameEn: "France",
    flag: "🇫🇷",
    dialCode: "+33",
    walletsAr: ["Lydia Pay", "SEPA Instant Transfer", "Carte Bancaire"],
    walletsEn: ["Lydia Pay", "SEPA Instant Transfer", "Carte Bancaire"]
  },
  {
    code: "CA",
    nameAr: "كندا",
    nameEn: "Canada",
    flag: "🇨🇦",
    dialCode: "+1",
    walletsAr: ["Interac e-Transfer", "Apple Pay", "Credit Card"],
    walletsEn: ["Interac e-Transfer", "Apple Pay", "Credit Card"]
  },
  {
    code: "OTHER",
    nameAr: "باقي دول العالم",
    nameEn: "Other International Countries",
    flag: "🌐",
    dialCode: "+0",
    walletsAr: ["USDT TRC20 / BEP20 (Cryptocurrency)", "Binance Pay", "Perfect Money", "Payeer", "Credit / Debit Card"],
    walletsEn: ["USDT TRC20 / BEP20 (Cryptocurrency)", "Binance Pay", "Perfect Money", "Payeer", "Credit / Debit Card"]
  }
];

export default function RegisterClient({ lang, dict }: { lang: Locale; dict: any }) {
  const [selectedCountryCode, setSelectedCountryCode] = useState("EG");
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form input states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsModalTab, setTermsModalTab] = useState<"terms" | "refund">("terms");

  // Visibility & Loading states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState("");

  const handleGoogleCallback = useCallback(async (response: any) => {
    if (!response.credential) return;
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم تسجيل الدخول بحساب Google بنجاح! جاري التوجيه..." : "Google login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = `/${lang}`;
        }, 1000);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "فشل تسجيل الدخول بحساب Google" : "Google Sign-In failed"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const initGoogleAuth = useCallback(() => {
    if (typeof window !== "undefined" && (window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
      });
      const btnContainer = document.getElementById("googleSignUpBtnCustom");
      if (btnContainer) {
        (window as any).google.accounts.id.renderButton(btnContainer, {
          theme: "outline",
          size: "large",
          width: 360,
          text: "signup_with",
          shape: "pill",
          locale: lang === "ar" ? "ar" : "en",
        });
      }
    }
  }, [handleGoogleCallback, lang]);

  useEffect(() => {
    initGoogleAuth();
  }, [initGoogleAuth]);

  const selectedCountry = useMemo(() => {
    return ALL_COUNTRIES.find((c) => c.code === selectedCountryCode) || ALL_COUNTRIES[0];
  }, [selectedCountryCode]);

  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return ALL_COUNTRIES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_COUNTRIES.filter(
      (c) =>
        c.nameAr.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.dialCode.includes(q)
    );
  }, [searchQuery]);

  // Generate Strong Password Generator (e.g. 3r43t54#X9!)
  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let generated = "";
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setConfirmPassword(generated);
    setShowPassword(true);
    setShowConfirmPassword(true);
    setErrorMessage("");
  };

  // Password Strength Rating
  const passwordStrength = useMemo(() => {
    if (!password) return { percent: 0, textAr: "", textEn: "", color: "bg-gray-600" };
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    if (score <= 1) return { percent: 25, textAr: "ضعيفة ⚠️", textEn: "Weak ⚠️", color: "bg-red-500" };
    if (score === 2) return { percent: 50, textAr: "متوسطة 🟡", textEn: "Medium 🟡", color: "bg-yellow-500" };
    if (score === 3) return { percent: 75, textAr: "قوية 🟢", textEn: "Strong 🟢", color: "bg-emerald-500" };
    return { percent: 100, textAr: "قوية جداً 🔥", textEn: "Very Strong 🔥", color: "bg-primary glow-cyan" };
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!confirmPassword) return null;
    return password === confirmPassword;
  }, [password, confirmPassword]);

  // Fast Instant Registration Handler
  const handleFastRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!fullName.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال الاسم الكامل!" : "Please enter your full name!");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال بريد إلكتروني صحيح!" : "Please enter a valid email address!");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال رقم الهاتف / الواتساب!" : "Please enter your phone/WhatsApp number!");
      return;
    }
    if (!username.trim()) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال اسم المستخدم!" : "Please enter a username!");
      return;
    }
    if (!password) {
      setErrorMessage(lang === "ar" ? "الرجاء إدخال كلمة المرور!" : "Please enter a password!");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(lang === "ar" ? "كلمات المرور غير متطابقة!" : "Passwords do not match!");
      return;
    }
    if (!termsAgreed) {
      setErrorMessage(lang === "ar" ? "الرجاء الموافقة على شروط الخدمة وسياسة الخصوصية!" : "Please agree to Terms of Service and Privacy Policy!");
      return;
    }

    setIsLoading(true);

    try {
      const rawPhone = phone.trim();
      const formattedPhone = rawPhone.startsWith("+") 
        ? rawPhone 
        : `${selectedCountry.dialCode} ${rawPhone.replace(/^0+/, "")}`;

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email,
          username,
          password,
          phone: formattedPhone,
          country: selectedCountry.code,
          "cf-turnstile-response": turnstileToken
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("user_token", data.token);
        }
        if (data.user) {
          localStorage.setItem("user_session", JSON.stringify(data.user));
          window.dispatchEvent(new Event("user_session_change"));
        }
        setSuccessMessage(lang === "ar" ? "تم إنشاء الحساب وتسجيل الدخول بنجاح! جاري التوجيه..." : "Account created & logged in successfully!");
        setTimeout(() => {
          window.location.href = `/${lang}`;
        }, 1000);
      } else {
        setErrorMessage(data.error || (lang === "ar" ? "حدث خطأ أثناء عملية التسجيل!" : "Registration failed!"));
      }
    } catch {
      setErrorMessage(lang === "ar" ? "تعذر الاتصال بالسيرفر! يرجى المحاولة لاحقاً." : "Network error! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-full max-w-2xl glass-card rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative Gradients */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header with Logo */}
        <div className="relative z-10 flex flex-col items-center mb-8">
          <Link href={`/${lang}`} className="relative group mb-4 flex items-center justify-center" aria-label="Home">
            <div className="absolute -inset-2 bg-gradient-to-r from-white/20 via-primary/30 to-white/20 rounded-full blur-xl opacity-80 group-hover:opacity-100 transition-all pointer-events-none"></div>
            <img 
              src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
              alt="Logo" 
              className="relative z-10 h-12 sm:h-14 w-auto max-w-[260px] object-contain transition-transform group-hover:scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]" 
            />
          </Link>
          <h1 className="font-display-lg-mobile text-3xl font-bold text-on-surface">{dict.register.title}</h1>
          <p className="text-on-surface-variant text-sm mt-2 text-center max-w-sm">{dict.register.subtitle}</p>
        </div>

        {/* Quick Google Sign-Up Button */}
        <div className="relative z-10 mb-6 flex flex-col gap-4 max-w-md mx-auto w-full">
          <Script 
            src="https://accounts.google.com/gsi/client" 
            strategy="afterInteractive" 
            onLoad={initGoogleAuth}
          />
          <div id="googleSignUpBtnCustom" className="w-full flex justify-center min-h-[44px]"></div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-outline-variant/20"></div>
            <span className="absolute px-3 bg-surface-container-high text-xs text-on-surface-variant font-medium rounded-full border border-outline-variant/20">{dict.login.or}</span>
          </div>
        </div>

        {/* Feedback Alert Banners */}
        {errorMessage && (
          <div className="relative z-10 mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="relative z-10 mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
            <span>{successMessage}</span>
          </div>
        )}

        {/* FAST INSTANT REGISTRATION FORM */}
        <form onSubmit={handleFastRegisterSubmit} className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6" autoComplete="off">
          {/* Column 1 */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.register.fullName}</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.register.email}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50 font-mono"
              />
            </div>

            {/* PHONE NUMBER FIELD WITH COUNTRY CODE PREVIEW */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                  {dict.register.phone || (lang === "ar" ? "رقم الهاتف / الواتساب" : "Phone / WhatsApp Number")}
                </label>
                <span className="text-[11px] text-primary font-mono font-bold flex items-center gap-1 dir-ltr bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                  <span>{selectedCountry.flag}</span>
                  <span>{selectedCountry.dialCode}</span>
                </span>
              </div>
              <div className="relative flex items-center">
                <span className={`material-symbols-outlined text-base absolute ${lang === 'ar' ? 'right-3' : 'left-3'} text-on-surface-variant pointer-events-none`}>
                  call
                </span>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={dict.register.phonePlaceholder || (lang === "ar" ? "01012345678" : "01012345678")}
                  autoComplete="tel"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 ${lang === 'ar' ? 'pr-9 pl-4' : 'pl-9 pr-4'} text-on-surface font-mono focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50 placeholder:font-sans`}
                />
              </div>
            </div>

            {/* PASSWORD FIELD WITH EYE TOGGLE & GENERATOR */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.register.password}</label>
                <button
                  type="button"
                  onClick={generateStrongPassword}
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">auto_fix_high</span>
                  {lang === "ar" ? "توليد كلمة مرور قوية" : "Generate Strong Password"}
                </button>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********" 
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 ${lang === 'ar' ? 'pr-4 pl-11' : 'pl-4 pr-11'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors`}
                  title={showPassword ? "إخفاء" : "إظهار"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-on-surface-variant">
                      {lang === "ar" ? "قوة كلمة المرور:" : "Password Strength:"}
                    </span>
                    <span className="text-primary">{lang === "ar" ? passwordStrength.textAr : passwordStrength.textEn}</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${passwordStrength.color}`} 
                      style={{ width: `${passwordStrength.percent}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">{dict.register.username}</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe99" 
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            {/* Searchable Country Selector */}
            <div className="flex flex-col gap-2 relative">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                {lang === "ar" ? "الدولة (جميع دول العالم)" : "Country"}
              </label>

              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 px-4 text-on-surface flex items-center justify-between hover:border-primary/50 focus:outline-none transition-all"
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-xl">{selectedCountry.flag}</span>
                  <span>{lang === "ar" ? selectedCountry.nameAr : selectedCountry.nameEn}</span>
                  <span className="text-xs text-on-surface-variant">({selectedCountry.dialCode})</span>
                </div>
                <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
              </button>

              {/* Searchable Dropdown Popover */}
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 glass-panel border border-outline-variant/30 rounded-xl shadow-2xl p-3 bg-surface-container-lowest/95 backdrop-blur-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="relative mb-3">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant">search</span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={lang === "ar" ? "ابحث باسم الدولة..." : "Search country..."}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      className="w-full bg-surface-container border border-outline-variant/30 rounded-lg py-2 pl-9 pr-3 text-xs text-on-surface focus:outline-none focus:border-primary"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1 custom-scrollbar">
                    {filteredCountries.length > 0 ? (
                      filteredCountries.map((country) => (
                        <button
                          key={country.code}
                          type="button"
                          onClick={() => {
                            setSelectedCountryCode(country.code);
                            setDropdownOpen(false);
                            setSearchQuery("");
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-start transition-all ${
                            selectedCountryCode === country.code
                              ? "bg-primary/20 text-primary font-bold"
                              : "hover:bg-surface-container-high text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{country.flag}</span>
                            <span>{lang === "ar" ? country.nameAr : country.nameEn}</span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant">{country.dialCode}</span>
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-on-surface-variant">
                        {lang === "ar" ? "لم يتم العثور على نتائج" : "No countries found"}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD WITH EYE TOGGLE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-label-sm text-on-surface-variant uppercase tracking-wider">
                {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
              </label>

              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="********" 
                  autoComplete="new-password"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  className={`w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg py-3 ${lang === 'ar' ? 'pr-4 pl-11' : 'pl-4 pr-11'} text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute ${lang === 'ar' ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors`}
                  title={showConfirmPassword ? "إخفاء" : "إظهار"}
                >
                  <span className="material-symbols-outlined text-lg">
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>

              {passwordsMatch !== null && (
                <div className="text-[11px] font-bold mt-0.5">
                  {passwordsMatch ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {lang === "ar" ? "كلمات المرور متطابقة" : "Passwords match"}
                    </span>
                  ) : (
                    <span className="text-red-400 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                      {lang === "ar" ? "كلمات المرور غير متطابقة" : "Passwords do not match"}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="col-span-1 md:col-span-2 pt-2 border-t border-outline-variant/20">
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="terms" 
                checked={termsAgreed}
                onChange={(e) => setTermsAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-outline-variant/50 bg-surface-container-lowest text-primary focus:ring-primary/50 cursor-pointer" 
              />
              <label htmlFor="terms" className="text-sm text-on-surface-variant cursor-pointer select-none">
                {dict.register.agree}{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("terms"); setTermsModalOpen(true); }}
                  className="text-primary font-bold hover:underline"
                >
                  {dict.register.tos}
                </button>{" "}
                {dict.register.and}{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("terms"); setTermsModalOpen(true); }}
                  className="text-primary font-bold hover:underline"
                >
                  {dict.register.privacy}
                </button>{" "}
                و{" "}
                <button
                  type="button"
                  onClick={() => { setTermsModalTab("refund"); setTermsModalOpen(true); }}
                  className="text-amber-400 font-bold hover:underline"
                >
                  {lang === "ar" ? "سياسة الاسترجاع والضمان" : "Refund Policy"}
                </button>.
              </label>
            </div>
          </div>

          {/* Cloudflare Turnstile CAPTCHA Protection */}
          <div className="col-span-1 md:col-span-2">
            <CloudflareTurnstile onVerify={(token) => setTurnstileToken(token)} />
          </div>

          {/* FAST DIRECT SUBMIT BUTTON */}
          <div className="col-span-1 md:col-span-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-primary-container text-on-primary-container py-4 rounded-lg font-bold text-lg hover:bg-primary transition-all glow-primary shadow-[0_0_15px_rgba(45,212,191,0.2)] active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  <span>{lang === "ar" ? "جاري إنشاء الحساب فورا..." : "Creating Account..."}</span>
                </>
              ) : (
                <span>{dict.register.createAccount}</span>
              )}
            </button>
          </div>
        </form>

        <div className="relative z-10 mt-8 text-center text-sm text-on-surface-variant">
          {dict.register.hasAccount} <Link href={`/${lang}/login`} className="text-primary hover:text-primary-container font-semibold transition-colors">{dict.register.signIn}</Link>
        </div>
      </div>

      {/* Terms & Refund Policy Modal */}
      <TermsModal
        isOpen={termsModalOpen}
        onClose={() => setTermsModalOpen(false)}
        lang={lang}
        defaultTab={termsModalTab}
      />
    </div>
  );
}
