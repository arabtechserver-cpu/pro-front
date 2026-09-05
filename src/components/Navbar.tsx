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
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbolAr: "$", symbolEn: "$", rate: 1.0, flag: "🇺🇸" },
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbolAr: "ج.م", symbolEn: "EGP", rate: 50.0, flag: "🇪🇬" },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbolAr: "ر.س", symbolEn: "SAR", rate: 3.75, flag: "🇸🇦" },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbolAr: "د.إ", symbolEn: "AED", rate: 3.67, flag: "🇦🇪" },
  { code: "SDG", nameAr: "جنيه سوداني", nameEn: "Sudanese Pound", symbolAr: "ج.س", symbolEn: "SDG", rate: 600.0, flag: "🇸🇩" },
  { code: "EUR", nameAr: "يورو أوروبي", nameEn: "Euro", symbolAr: "€", symbolEn: "€", rate: 0.92, flag: "🇪🇺" },
  { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbolAr: "£", symbolEn: "£", rate: 0.78, flag: "🇬🇧" }
];

const COUNTRY_FLAGS: Record<string, string> = {
  EG: "🇪🇬",
  SA: "🇸🇦",
  AE: "🇦🇪",
  SD: "🇸🇩",
  KW: "🇰🇼",
  QA: "🇶🇦",
  JO: "🇯🇴",
  IQ: "🇮🇶",
  DZ: "🇩🇿",
  MA: "🇲🇦",
  TN: "🇹🇳",
  LY: "🇱🇾",
  OM: "🇴🇲",
  BH: "🇧🇭",
  PS: "🇵🇸",
  YE: "🇾🇪",
  SY: "🇸🇾",
  LB: "🇱🇧",
  TR: "🇹🇷",
  US: "🇺🇸",
  GB: "🇬🇧",
  DE: "🇩🇪",
  FR: "🇫🇷",
  CA: "🇨🇦"
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20">
            
            {/* Logo with Glowing White Bubble Aura */}
            <Link href={`/${lang}`} className="relative flex items-center group py-1 shrink-0" aria-label="Home">
              <div className="absolute -inset-2 bg-gradient-to-r from-white/25 via-primary/30 to-white/25 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-all duration-500 pointer-events-none"></div>
              <picture>
                <source srcSet={lang === "ar" ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                <img 
                  src={lang === "ar" ? "/images/logo_ar.png" : "/images/logo_en.png"} 
                  alt="Logo" 
                  width={240}
                  height={60}
                  className="relative z-10 h-10 sm:h-13 md:h-16 lg:h-18 w-auto max-w-[200px] sm:max-w-[290px] md:max-w-[380px] lg:max-w-[440px] object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]" 
                />
              </picture>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1.5 bg-surface-container-low/40 p-1.5 rounded-full border border-outline-variant/20 backdrop-blur-md shadow-inner">
              <Link 
                href={`/${lang}`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                }`}
              >
                {dict.home}
              </Link>

              {/* Reseller Pricing Dropdown */}
              <div className="relative group">
                <button 
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    isActive("/pricing") 
                      ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                  }`}
                >
                  <span>{dict.resellerPricing}</span>
                  <span className="material-symbols-outlined text-base transition-transform duration-300 group-hover:rotate-180">expand_more</span>
                </button>

                <div className="absolute top-full start-0 mt-2 w-56 glass-card rounded-2xl border border-outline-variant/30 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 overflow-hidden backdrop-blur-xl bg-surface-container-lowest/90 p-1.5 z-50">
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-primary text-base">phonelink_setup</span>
                    {dict.imeiService}
                  </Link>
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-secondary text-base">dns</span>
                    {dict.serverService}
                  </Link>
                  <Link href={`/${lang}/pricing`} className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-all">
                    <span className="material-symbols-outlined text-tertiary text-base">cast</span>
                    {dict.remoteService}
                  </Link>
                </div>
              </div>

              {/* My Orders History Page */}
              <Link 
                href={`/${lang}/orders`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive("/orders") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                }`}
              >
                <span className="material-symbols-outlined text-base">receipt_long</span>
                <span>{lang === "ar" ? "الطلبات" : "My Orders"}</span>
              </Link>

              {/* Wallet Page */}
              <Link 
                href={`/${lang}/wallet`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  isActive("/wallet") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                }`}
              >
                <span className="material-symbols-outlined text-base">account_balance_wallet</span>
                <span>{lang === "ar" ? "المحفظة والشحن" : "My Wallet"}</span>
              </Link>

              <Link 
                href={`/${lang}/blog`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/blog") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                }`}
              >
                {dict.blog}
              </Link>

              <Link 
                href={`/${lang}/tutorials`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/tutorials") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
                }`}
              >
                {dict.tutorials}
              </Link>

              <Link 
                href={`/${lang}/contact`} 
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive("/contact") 
                    ? "bg-primary text-on-primary font-bold shadow-[0_0_12px_rgba(45,212,191,0.3)]" 
                    : "text-on-surface-variant hover:text-primary hover:bg-surface-container-high/50"
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
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-outline-variant/30 bg-surface-container-low/60 text-on-surface-variant hover:text-primary hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group text-xs font-bold"
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
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-surface-container-high/80 border border-primary/40 hover:border-primary text-on-surface transition-all shadow-[0_0_15px_rgba(45,212,191,0.15)] group"
                >
                  <div className="flex flex-col text-end">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 justify-end">
                      <span>{COUNTRY_FLAGS[userSession.country || "EG"] || "🌐"}</span>
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
                          style={{ backgroundColor: userSession.membershipTier?.badgeColor || "#2dd4bf" }}
                        >
                          <span className="material-symbols-outlined text-xs">workspace_premium</span>
                          <span>{userSession.membershipTier?.nameAr || userSession.membershipTier?.name || (lang === "ar" ? "عضوية أساسية" : "Standard")}</span>
                        </span>
                        
                        {(userSession.effectiveDiscount || (userSession.membershipTier?.discountPercentage || 0) > 0 || (userSession.customDiscount || 0) > 0) ? (
                          <span className="text-[11px] font-extrabold text-emerald-400 font-mono">
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
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-primary text-base">account_balance_wallet</span>
                        <span>{lang === "ar" ? "صفحة المحفظة والشحن" : "My Wallet & Top-up"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/pricing`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-secondary text-base">receipt_long</span>
                        <span>{lang === "ar" ? "طلباتي وسجل الخدمات" : "My Orders & Services"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/orders`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-tertiary text-base">history</span>
                        <span>{lang === "ar" ? "متابعة الطلبات المباشرة" : "Track Live Orders"}</span>
                      </Link>

                      <Link 
                        href={`/${lang}/api-developer`}
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 p-2.5 rounded-xl text-on-surface-variant hover:text-purple-400 hover:bg-surface-container-high transition-all"
                      >
                        <span className="material-symbols-outlined text-purple-400 text-base">api</span>
                        <span>{lang === "ar" ? "ربط الـ API" : "API Developer"}</span>
                      </Link>

                      {userSession.role === "admin" && (
                        <Link 
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl text-amber-400 font-bold bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all"
                        >
                          <span className="material-symbols-outlined text-amber-400 text-base">dashboard</span>
                          <span>لوحة الإدارة (Admin Panel)</span>
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-red-400 hover:bg-red-500/15 transition-all text-start"
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
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-sm hover:shadow-[0_0_20px_rgba(45,212,191,0.4)] hover:scale-[1.03] active:scale-95 transition-all duration-300 group overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform duration-300">lock</span>
                <span>{dict.login}</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Controls */}
          <div className="lg:hidden flex items-center gap-2.5">
            <Link 
              href={switchLanguage()} 
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low text-on-surface-variant hover:text-primary transition-colors text-xs font-bold"
            >
              <span className="material-symbols-outlined text-xs text-primary">language</span>
              <span>{lang === "ar" ? "EN" : "AR"}</span>
            </Link>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-surface-container-high/80 border border-outline-variant/30 text-on-surface-variant hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl block transition-transform duration-300">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown with Smooth Animation */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass-panel border-b border-outline-variant/30 shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 overflow-hidden bg-surface/95 backdrop-blur-2xl">
          <div className="flex flex-col p-5 gap-2 max-h-[80vh] overflow-y-auto">
            {/* Logged in User Pill on Mobile */}
            {userSession && (
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-xs">
                    {userSession.fullName ? userSession.fullName.charAt(0) : "U"}
                  </div>
                  <div>
                    <p className="font-bold text-xs text-on-surface">{userSession.fullName}</p>
                    <p className="text-[10px] text-primary font-mono dir-ltr">{formatBalance(userSession.balance)}</p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 font-bold text-xs"
                >
                  خروج
                </button>
              </div>
            )}

            {userSession && (
              <Link 
                href={`/${lang}/profile`} 
                onClick={() => setMobileMenuOpen(false)} 
                className={`flex items-center gap-3 p-3.5 rounded-xl font-bold text-sm transition-all ${
                  isActive("/profile") ? "bg-primary/20 text-primary border border-primary/30" : "text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20"
                }`}
              >
                <span className="material-symbols-outlined text-lg">account_circle</span>
                <span>{lang === "ar" ? "الملف الشخصي والحساب" : "My Profile & Account"}</span>
              </Link>
            )}

            <Link 
              href={`/${lang}`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">home</span>
              {dict.home}
            </Link>

            <Link 
              href={`/${lang}/pricing`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/pricing") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">sell</span>
              {dict.resellerPricing}
            </Link>

            <Link 
              href={`/${lang}/orders`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/orders") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">receipt_long</span>
              <span>{lang === "ar" ? "الطلبات" : "My Orders"}</span>
            </Link>

            <Link 
              href={`/${lang}/api-developer`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/api-developer") ? "bg-purple-500/15 text-purple-400 font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg text-purple-400">api</span>
              <span>{lang === "ar" ? "ربط الـ API" : "API Developer"}</span>
            </Link>

            <Link 
              href={`/${lang}/wallet`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/wallet") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">account_balance_wallet</span>
              <span>{lang === "ar" ? "المحفظة والشحن" : "My Wallet"}</span>
            </Link>

            <Link 
              href={`/${lang}/blog`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/blog") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">article</span>
              {dict.blog}
            </Link>

            <Link 
              href={`/${lang}/tutorials`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/tutorials") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">play_circle</span>
              {dict.tutorials}
            </Link>

            <Link 
              href={`/${lang}/contact`} 
              onClick={() => setMobileMenuOpen(false)} 
              className={`flex items-center gap-3 p-3.5 rounded-xl font-medium text-sm transition-all ${
                isActive("/contact") ? "bg-primary/15 text-primary font-bold" : "text-on-surface hover:bg-surface-container-high"
              }`}
            >
              <span className="material-symbols-outlined text-lg">mail</span>
              {dict.contactUs}
            </Link>

            <div className="h-px bg-outline-variant/20 my-2"></div>

            {!userSession && (
              <Link 
                href={`/${lang}/login`} 
                onClick={() => setMobileMenuOpen(false)} 
                className="p-3.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-on-primary font-bold text-center flex items-center justify-center gap-2 shadow-lg hover:opacity-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg">lock</span>
                {dict.login}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
