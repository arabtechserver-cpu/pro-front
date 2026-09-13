"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Locale } from "@/i18n/config";

interface NavbarProps {
  lang: Locale;
  dict: any;
}

interface UserSession {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  country?: string;
  balance?: number;
  role?: string;
  membershipTierId?: string | null;
  membershipTier?: {
    id: string;
    name: string;
    nameAr?: string;
    discountPercentage: number;
    badgeColor?: string;
    minDeposit?: number;
  } | null;
  customDiscount?: number;
  effectiveDiscount?: number;
}

interface CurrencyInfo {
  code: string;
  nameAr: string;
  nameEn: string;
  symbolAr: string;
  symbolEn: string;
  rate: number;
  flag: string;
}

const CURRENCIES: CurrencyInfo[] = [
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbolAr: "$", symbolEn: "$", rate: 1.0, flag: "USD" },
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0, flag: "EGP" },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75, flag: "SAR" },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67, flag: "AED" },
  { code: "SDG", nameAr: "جنيه سوداني", nameEn: "Sudanese Pound", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0, flag: "SDG" },
  { code: "EUR", nameAr: "يورو أوروبي", nameEn: "Euro", symbolAr: "€", symbolEn: "€", rate: 0.92, flag: "EUR" },
  { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbolAr: "£", symbolEn: "£", rate: 0.78, flag: "GBP" }
];

const COUNTRY_FLAGS: Record<string, string> = {
  EG: "EG",
  SA: "SA",
  AE: "AE",
  SD: "SD",
  KW: "KW",
  QA: "QA",
  JO: "JO",
  IQ: "IQ",
  DZ: "DZ",
  MA: "MA",
  TN: "TN",
  LY: "LY",
  OM: "OM",
  BH: "BH",
  PS: "PS",
  YE: "YE",
  SY: "SY",
  LB: "LB",
  TR: "TR",
  US: "US",
  GB: "GB",
  DE: "DE",
  FR: "FR",
  CA: "CA"
};

export default function Navbar({ lang, dict }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string>("USD");
  const pathname = usePathname();

  // Load selected currency and listen for session changes
  useEffect(() => {
    const savedCurrency = localStorage.getItem("app_currency");
    if (savedCurrency && CURRENCIES.some(c => c.code === savedCurrency)) {
      setSelectedCurrencyCode(savedCurrency);
    }

    const loadSession = async () => {
      const saved = localStorage.getItem("user_session");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserSession(parsed);

          // Fetch fresh user profile from DB to sync live balance
          if (parsed?.email || parsed?.id) {
            const token = localStorage.getItem("user_token");
            const queryParam = parsed.id ? `userId=${encodeURIComponent(parsed.id)}` : `email=${encodeURIComponent(parsed.email)}`;
            const headers: Record<string, string> = {};
            if (token && token !== "null" && token !== "undefined") {
              headers["Authorization"] = `Bearer ${token}`;
            }
            const res = await fetch(`/api/users/profile?${queryParam}`, {
              headers,
              credentials: "omit"  // لا نرسل cookies (admin_token) مع طلب البروفايل للمستخدم العادي
            });
            if (res.ok) {
              const data = await res.json().catch(() => null);
              if (data && data.success && data.user) {
                const freshUser = { ...parsed, ...data.user };
                localStorage.setItem("user_session", JSON.stringify(freshUser));
                setUserSession(freshUser);
              }
            }
          }
        } catch {
          setUserSession(null);
        }
      } else {
        setUserSession(null);
      }
    };

    loadSession();
    window.addEventListener("user_session_change", loadSession);
    window.addEventListener("storage", loadSession);
    return () => {
      window.removeEventListener("user_session_change", loadSession);
      window.removeEventListener("storage", loadSession);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Lock body scroll and listen for Escape key when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const switchLanguage = () => {
    const newLang = lang === "ar" ? "en" : "ar";
    const segments = pathname.split("/");
    segments[1] = newLang;
    return segments.join("/");
  };

  const isActive = (path: string) => {
    const fullPath = `/${lang}${path === "/" ? "" : path}`;
    if (path === "/") {
      return pathname === `/${lang}` || pathname === `/${lang}/`;
    }
    return pathname.startsWith(fullPath);
  };

  const currentCurrency = CURRENCIES.find(c => c.code === selectedCurrencyCode) || CURRENCIES[0];

  const formatBalance = (usdAmount: number = 0) => {
    const converted = usdAmount * currentCurrency.rate;
    const formatted = converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return lang === "ar" ? `${formatted} ${currentCurrency.symbolAr}` : `${currentCurrency.symbolEn} ${formatted}`;
  };

  const handleCurrencyChange = (code: string) => {
    setSelectedCurrencyCode(code);
    localStorage.setItem("app_currency", code);
    window.dispatchEvent(new Event("currency_change"));
  };

  // Sign out user session
  const handleLogout = () => {
    localStorage.removeItem("user_session");
    localStorage.removeItem("user_token");
    setUserSession(null);
    setUserDropdownOpen(false);
    window.dispatchEvent(new Event("user_session_change"));
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? "bg-surface/85 backdrop-blur-xl border-b border-outline-variant/30 shadow-[0_4px_30px_rgba(0,0,0,0.3)] py-1" 
            : "bg-transparent py-2"
        }`}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            
            {/* Logo */}
            <Link 
              href={`/${lang}`} 
              className="relative inline-flex items-center group py-1 shrink-0" 
              aria-label={lang === "ar" ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server"}
              title={lang === "ar" ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server"}
            >
              <div className="relative inline-flex items-center">
                {/* Hazy Ambient Glow exactly mapped to 'عرب تيك' in Arabic and 'ARAB TECH' in English */}
                <div 
                  className="absolute pointer-events-none rounded-full transition-all duration-300"
                  style={{
                    left: lang === "ar" ? "-3%" : "47%",
                    width: "58%",
                    top: "6%",
                    height: "68%",
                    background: "radial-gradient(ellipse at center, rgba(56, 189, 248, 0.65) 0%, rgba(37, 99, 235, 0.30) 50%, transparent 80%)",
                    filter: "blur(14px)",
                    transform: "scale(1.4)",
                  }}
                  aria-hidden="true"
                />
                <div 
                  className="absolute pointer-events-none rounded-full transition-all duration-300"
                  style={{
                    left: lang === "ar" ? "1%" : "51%",
                    width: "50%",
                    top: "10%",
                    height: "56%",
                    background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.70) 0%, rgba(186, 230, 253, 0.45) 45%, transparent 75%)",
                    filter: "blur(8px)",
                  }}
                  aria-hidden="true"
                />

                <picture>
                  <source srcSet={lang === "ar" ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                  <img 
                    src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
                    alt={lang === "ar" ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server Logo"} 
                    width={240}
                    height={60}
                    className="relative z-10 h-10 sm:h-13 md:h-16 lg:h-18 w-auto max-w-[200px] sm:max-w-[290px] md:max-w-[380px] lg:max-w-[440px] object-contain transition-transform duration-200 group-hover:scale-105" 
                  />
                </picture>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-surface-container-low/90 p-1.5 rounded-full border border-white/10 backdrop-blur-xl shadow-lg">
              <Link 
                href={`/${lang}`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive("/") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {dict.home}
              </Link>

              {/* Reseller Pricing Dropdown */}
              <div className="relative group">
                <button 
                  aria-label={dict.resellerPricing || (lang === "ar" ? "قائمة الأسعار والخدمات" : "Reseller Pricing")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive("/pricing") 
                      ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{dict.resellerPricing}</span>
                  <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:rotate-180">expand_more</span>
                </button>

                <div className="absolute top-full start-0 mt-2 w-56 glass-card rounded-2xl border border-white/10 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 overflow-hidden backdrop-blur-xl bg-surface-container-lowest/95 p-1.5 z-50">
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 hover:bg-primary/20 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-primary text-base">phonelink_setup</span>
                    {dict.imeiService}
                  </Link>
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 hover:bg-primary/20 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-secondary text-base">dns</span>
                    {dict.serverService}
                  </Link>
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-slate-200 hover:bg-primary/20 hover:text-white transition-all">
                    <span className="material-symbols-outlined text-tertiary text-base">cast</span>
                    {dict.remoteService}
                  </Link>
                </div>
              </div>

              {/* My Orders History Page */}
              <Link 
                href={`/${lang}/orders`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive("/orders") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>{lang === "ar" ? "الطلبات" : "My Orders"}</span>
              </Link>

              {/* Wallet Page */}
              <Link 
                href={`/${lang}/wallet`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isActive("/wallet") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>{lang === "ar" ? "المحفظة والشحن" : "My Wallet"}</span>
              </Link>

              <Link 
                href={`/${lang}/blog`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive("/blog") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {dict.blog}
              </Link>

              <Link 
                href={`/${lang}/tutorials`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive("/tutorials") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {dict.tutorials}
              </Link>

              <Link 
                href={`/${lang}/contact`} 
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  isActive("/contact") 
                    ? "bg-primary text-white font-bold shadow-md shadow-blue-950/40" 
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {dict.contactUs}
              </Link>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center gap-3">

            {/* Language Switcher Pill */}
            <Link 
              href={switchLanguage()} 
              aria-label={lang === "ar" ? "Switch language to English" : "التبديل إلى اللغة العربية"}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-white/10 bg-surface-container-low/80 text-slate-200 hover:text-white hover:border-primary/50 hover:bg-primary/20 transition-all duration-200 group text-xs font-bold"
              title={lang === "ar" ? "Switch to English" : "التبديل للعربية"}
            >
              <span className="material-symbols-outlined text-sm text-primary group-hover:rotate-45 transition-transform duration-300">language</span>
              <span>{lang === "ar" ? "EN" : "AR"}</span>
            </Link>

            {/* LOGGED IN USER PROFILE DROPDOWN OR LOGIN BUTTON */}
            {userSession ? (
              <div className="relative">
                <button
                  type="button"
                  aria-label={userSession.fullName || userSession.username || (lang === "ar" ? "قائمة الحساب الشخصي" : "User Profile Menu")}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-surface-container-high/80 border border-primary/40 hover:border-primary text-on-surface transition-all shadow-[0_0_15px_rgba(139,92,246,0.15)] group"
                >
                  <div className="flex flex-col text-end">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 justify-end">
                      {COUNTRY_FLAGS[userSession.country || "EG"] && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest font-mono text-primary font-bold">
                          {COUNTRY_FLAGS[userSession.country || "EG"]}
                        </span>
                      )}
                      <span>{userSession.fullName || userSession.username}</span>
                    </span>
                    <span className="text-[11px] font-bold text-primary font-mono dir-ltr">
                      {formatBalance(userSession.balance)}
                    </span>
                  </div>

                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-bold flex items-center justify-center text-sm shadow-md group-hover:scale-105 transition-transform">
                    {userSession.fullName ? userSession.fullName.charAt(0) : "U"}
                  </div>
                </button>

                {/* USER DROPDOWN MENU - PERFECT ALIGNMENT WITH end-0 to avoid overflow */}
                {userDropdownOpen && (
                  <div className="absolute top-full end-0 mt-2 w-64 glass-card rounded-2xl border border-outline-variant/30 shadow-2xl overflow-hidden backdrop-blur-2xl bg-surface-container-lowest/95 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Header */}
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 mb-2">
                      <p className="font-bold text-sm text-on-surface">{userSession.fullName}</p>
                      <p className="text-xs text-primary font-mono">@{userSession.username}</p>
                      <p className="text-[11px] text-on-surface-variant truncate">{userSession.email}</p>
                      
                      {/* Membership & Discount Badge */}
                      <div className="mt-2 pt-2 border-t border-primary/20 flex items-center justify-between">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md text-white flex items-center gap-1 shadow-sm"
                          style={{ backgroundColor: userSession.membershipTier?.badgeColor || "#7c3aed" }}
                        >
                          <span className="material-symbols-outlined text-xs">workspace_premium</span>
                          <span>{userSession.membershipTier?.nameAr || userSession.membershipTier?.name || (lang === "ar" ? "عضوية أساسية" : "Standard")}</span>
                        </span>
                        
                        {(userSession.effectiveDiscount || (userSession.membershipTier?.discountPercentage || 0) > 0 || (userSession.customDiscount || 0) > 0) ? (
                          <span className="text-[11px] font-extrabold text-violet-400 font-mono">
                            {lang === "ar" ? `خصم ${userSession.effectiveDiscount || userSession.membershipTier?.discountPercentage || userSession.customDiscount}%` : `${userSession.effectiveDiscount || userSession.membershipTier?.discountPercentage || userSession.customDiscount}% OFF`}
                          </span>
                        ) : (
                          <span className="text-[10px] text-on-surface-variant font-medium">
                            {lang === "ar" ? "سعر موحد" : "Standard"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Wallet Balance Card */}
                    <div className="p-3 rounded-xl bg-surface-container-high border border-outline-variant/20 flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[11px] text-on-surface-variant font-medium">
                          {lang === "ar" ? "رصيد المحفظة" : "Wallet Balance"}
                        </p>
                        <p className="text-base font-bold text-primary font-mono">
                          {formatBalance(userSession.balance)}
                        </p>
                      </div>
                      <Link
                        href={`/${lang}/wallet`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-bold text-xs hover:bg-primary-container transition-all shadow-sm"
                      >
                        {lang === "ar" ? "شحن المحفظة" : "Top Up"}
                      </Link>
                    </div>

            {/* Menu Options */}
                    <div className="space-y-1 text-xs font-semibold">
                      <Link 
                        href={`/${lang}/profile`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-primary font-bold bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20"
                      >
                        <span className="material-symbols-outlined text-primary text-base">account_circle</span>
                        <span>{lang === "ar" ? "الملف الشخصي والحساب" : "My Profile & Account"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/wallet`} 
                        onClick={() => setUserDropdownOpen(false)} 
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
                        <span>{lang === "ar" ? "صفحة المحفظة والشحن" : "My Wallet & Top-up"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/pricing`} 
                        onClick={() => setUserDropdownOpen(false)} 
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-secondary text-base">receipt_long</span>
                        <span>{lang === "ar" ? "طلباتي وسجل الخدمات" : "My Orders & Services"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/orders`} 
                        onClick={() => setUserDropdownOpen(false)} 
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-tertiary text-base">history</span>
                        <span>{lang === "ar" ? "متابعة الطلبات المباشرة" : "Track Live Orders"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/api-developer`} 
                        onClick={() => setUserDropdownOpen(false)} 
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-slate-200 hover:text-purple-300 hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-purple-400 text-base">api</span>
                        <span>{lang === "ar" ? "ربط الـ API" : "API Developer"}</span>
                      </Link>

                      {userSession.role === "admin" && (
                        <Link 
                          href="/admin" 
                          onClick={() => setUserDropdownOpen(false)} 
                          className="flex items-center gap-2.5 p-2.5 rounded-xl text-amber-300 font-bold bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-amber-400 text-base">dashboard</span>
                          <span>لوحة الإدارة (Admin Panel)</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-red-300 hover:bg-red-500/15 transition-all text-start font-semibold"
                      >
                        <span className="material-symbols-outlined text-red-400 text-base">logout</span>
                        <span>{lang === "ar" ? "تسجيل الخروج" : "Sign Out"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href={`/${lang}/login`} 
                className="btn-purple-glow flex items-center gap-2 px-6 py-2 rounded-full text-white font-bold text-sm transition-all duration-200 shadow-md shadow-blue-950/40"
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                <span>{dict.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Link 
              href={switchLanguage()} 
              aria-label={lang === "ar" ? "Switch language to English" : "التبديل إلى اللغة العربية"}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-surface-container-low text-slate-200 hover:text-white transition-colors text-xs font-bold"
            >
              <span className="material-symbols-outlined text-xs text-primary">language</span>
              <span>{lang === "ar" ? "EN" : "AR"}</span>
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container-high/90 border border-white/10 text-white hover:text-primary hover:bg-primary/20 transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-sm"
              aria-label={mobileMenuOpen ? (lang === "ar" ? "إغلاق القائمة" : "Close menu") : (lang === "ar" ? "فتح القائمة" : "Open menu")}
            >
              <span className="material-symbols-outlined text-xl sm:text-2xl block transition-transform duration-300">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

    </header>

    {/* Mobile Side Drawer Backdrop */}
    <div 
      className={`fixed inset-0 bg-black/75 backdrop-blur-sm z-50 transition-opacity duration-300 lg:hidden ${
        mobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      onClick={() => setMobileMenuOpen(false)}
      aria-hidden="true"
    />

    {/* Mobile Side Drawer */}
    <aside
      id="mobile-side-drawer"
      role="dialog"
      aria-modal="true"
      aria-label={lang === "ar" ? "القائمة الجانبية" : "Side Navigation Menu"}
      className={`fixed top-0 bottom-0 z-50 w-[85%] max-w-[340px] sm:max-w-[380px] bg-[#0c121e] border-e sm:border-s border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-out lg:hidden ${
        lang === "ar" ? "right-0" : "left-0"
      } ${
        mobileMenuOpen 
          ? "translate-x-0" 
          : (lang === "ar" ? "translate-x-full" : "-translate-x-full")
      }`}
    >
      {/* 1. Header Bar */}
      <div className="bg-[#101827] px-4 py-3.5 border-b border-white/10 flex items-center justify-between text-white shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-8 h-8 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center shrink-0 border border-white/5"
            aria-label={lang === "ar" ? "إغلاق القائمة" : "Close menu"}
          >
            <i className={`fas ${lang === "ar" ? "fa-arrow-right" : "fa-arrow-left"} text-sm`}></i>
          </button>
          <span className="font-black text-xs sm:text-sm tracking-wide text-white truncate font-mono">
            {lang === "ar" ? "عرب تك برو سيرفر" : "ARAB TECH PRO SERVER"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ONLINE</span>
        </div>
      </div>

      {/* 2. Top Action Buttons (تسجيل / تسجيل الدخول) */}
      {userSession ? (
        <div className="p-3.5 bg-[#0f1624] border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shrink-0 shadow-md">
                {userSession.fullName ? userSession.fullName.charAt(0) : "U"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs text-white truncate">{userSession.fullName}</p>
                <p className="text-[11px] text-blue-400 font-mono dir-ltr font-semibold">{formatBalance(userSession.balance)}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25 font-bold text-xs transition-colors shrink-0"
            >
              {lang === "ar" ? "خروج" : "Logout"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/${lang}/profile`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">account_circle</span>
              <span>{lang === "ar" ? "حسابي" : "Profile"}</span>
            </Link>
            <Link
              href={`/${lang}/wallet`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/20 text-xs font-bold text-blue-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">account_balance_wallet</span>
              <span>{lang === "ar" ? "شحن الرصيد" : "Top Up"}</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="p-3.5 bg-[#0f1624] border-b border-white/10 shrink-0">
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/${lang}/login`}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl bg-[#182235] hover:bg-[#202d45] border border-white/10 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-sm"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Sign In"}
            </Link>
            <Link
              href={`/${lang}/register`}
              onClick={() => setMobileMenuOpen(false)}
              className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm text-center transition-all shadow-md shadow-blue-600/30"
            >
              {lang === "ar" ? "تسجيل" : "Register"}
            </Link>
          </div>
        </div>
      )}

      {/* 3. Navigation List - Exact Partitioning */}
      <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-white/[0.06]">
        {/* أسعار إعادة البيع */}
        <Link
          href={`/${lang}/pricing`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-3 text-slate-100 hover:text-white hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <span className="material-symbols-outlined text-base">payments</span>
            </div>
            <span className="font-bold text-xs sm:text-sm text-white group-hover:text-blue-400 transition-colors truncate">
              {lang === "ar" ? "أسعار إعادة البيع" : "Reseller Pricing"}
            </span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold shrink-0">
            {lang === "ar" ? "VIP" : "PRO"}
          </span>
        </Link>

        {/* خدمة IMEI / iCloud / فتح القفل / التحقق */}
        <Link
          href={`/${lang}/pricing?category=imei`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-3 text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <span className="material-symbols-outlined text-base">phonelink_lock</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
              {lang === "ar" ? "خدمة IMEI / iCloud / فتح القفل" : "IMEI / iCloud / Unlock Services"}
            </span>
          </div>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-xs text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all shrink-0 ms-2`}></i>
        </Link>

        {/* خدمة الخادم / التفعيل / الرصيد / بطاقة الهدايا */}
        <Link
          href={`/${lang}/pricing?category=server`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-3 text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <span className="material-symbols-outlined text-base">dns</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
              {lang === "ar" ? "خدمة الخادم / التفعيل / الرصيد" : "Server / Activation / Credits"}
            </span>
          </div>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-xs text-slate-500 group-hover:text-emerald-400 group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all shrink-0 ms-2`}></i>
        </Link>

        {/* خدمة عن بُعد / FRP / وسائل التواصل الاجتماعي */}
        <Link
          href={`/${lang}/pricing?category=remote`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-3 text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <span className="material-symbols-outlined text-base">cast</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-purple-400 transition-colors truncate">
              {lang === "ar" ? "خدمة عن بُعد / FRP / الصيانة" : "Remote Support & FRP Services"}
            </span>
          </div>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-xs text-slate-500 group-hover:text-purple-400 group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all shrink-0 ms-2`}></i>
        </Link>

        {/* قناة التلجرام */}
        <a
          href="https://t.me/ARABTECHSUPPURT2"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-3 text-slate-200 hover:text-white hover:bg-white/[0.04] transition-colors group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <i className="fab fa-telegram-plane text-xs"></i>
            </div>
            <span className="font-semibold text-xs sm:text-sm text-slate-200 group-hover:text-sky-400 transition-colors truncate">
              {lang === "ar" ? "قناة التلجرام الرسمية" : "Official Telegram Channel"}
            </span>
          </div>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-xs text-slate-500 group-hover:text-sky-400 group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all shrink-0 ms-2`}></i>
        </a>

        {/* Quick Site Links */}
        <div className="pt-3 pb-1.5 px-4 bg-white/[0.02]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {lang === "ar" ? "أقسام الموقع" : "Platform Sections"}
          </span>
        </div>

        <Link
          href={`/${lang}`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-blue-400">home</span>
            <span>{dict.home}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/orders`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-emerald-400">receipt_long</span>
            <span>{lang === "ar" ? "الطلبات والعمليات" : "My Orders"}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/wallet`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-amber-400">account_balance_wallet</span>
            <span>{lang === "ar" ? "المحفظة والشحن" : "My Wallet"}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/api-developer`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-purple-400">api</span>
            <span>{lang === "ar" ? "ربط الـ API" : "API Developer"}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/blog`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-sky-400">article</span>
            <span>{dict.blog}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/tutorials`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-indigo-400">play_circle</span>
            <span>{dict.tutorials}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>

        <Link
          href={`/${lang}/contact`}
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between px-4 py-2.5 text-slate-300 hover:text-white hover:bg-white/[0.03] transition-colors text-xs sm:text-sm group"
        >
          <span className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-cyan-400">mail</span>
            <span>{dict.contactUs}</span>
          </span>
          <i className={`fas ${lang === "ar" ? "fa-chevron-left" : "fa-chevron-right"} text-[10px] text-slate-500`}></i>
        </Link>
      </div>

      {/* 4. Drawer Footer Controls */}
      <div className="p-3 bg-[#090d15] border-t border-white/10 shrink-0 flex items-center justify-between gap-3">
        <Link 
          href={switchLanguage()} 
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-200 hover:text-white hover:bg-white/10 transition-colors text-xs font-bold"
        >
          <span className="material-symbols-outlined text-sm text-blue-400">language</span>
          <span>{lang === "ar" ? "English" : "العربية"}</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-500">{lang === "ar" ? "العملة:" : "Currency:"}</span>
          <select
            value={selectedCurrencyCode}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="bg-surface-container-high border border-white/10 rounded-lg py-1 px-2 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {CURRENCIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-[#121929] text-white">
                {c.code} ({lang === "ar" ? c.symbolAr : c.symbolEn})
              </option>
            ))}
          </select>
        </div>
      </div>
    </aside>
    </>
  );
}
