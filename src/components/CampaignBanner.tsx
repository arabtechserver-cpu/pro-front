"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Flame,
  Clock,
  ShieldCheck,
  Zap,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Pause,
  Play
} from "lucide-react";

export interface CampaignItem {
  id?: string;
  tagEn?: string;
  tagAr?: string;
  titleEn?: string;
  titleAr?: string;
  descEn?: string;
  descAr?: string;
  badgeEn?: string;
  badgeAr?: string;
  turnaroundEn?: string;
  turnaroundAr?: string;
  guaranteeEn?: string;
  guaranteeAr?: string;
  connectionEn?: string;
  connectionAr?: string;
  theme?: "cyan" | "purple" | "blue" | "emerald" | "amber";
  image?: string;
  url?: string;
  buttonTextEn?: string;
  buttonTextAr?: string;
}

const DEFAULT_CAMPAIGNS: CampaignItem[] = [
  {
    id: "samsung_frp",
    tagEn: "Limited Time Offer",
    tagAr: "عرض حصري لفترة محدودة",
    titleEn: "Samsung FRP Remove",
    titleAr: "حذف حساب سامسونج FRP الفوري",
    descEn: "Instant removal for all Samsung models via direct official server API.",
    descAr: "فك فوري وتلقائي لجميع طرازات سامسونج عبر السيرفر الرسمي بأعلى سرعة وأمان.",
    badgeEn: "Direct API Link",
    badgeAr: "ربط سيرفر مباشر",
    turnaroundEn: "1 - 5 Mins",
    turnaroundAr: "1 - 5 دقائق",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان مالي 100%",
    connectionEn: "DIRECT API",
    connectionAr: "ربط فوري API",
    theme: "purple",
    image: "/images/promo_samsung_clean.png",
    url: "/pricing?search=Samsung",
    buttonTextEn: "Order & Activate Now",
    buttonTextAr: "اطلب الآن وابدأ التفعيل"
  },
  {
    id: "reseller_bundles",
    tagEn: "Official Reseller",
    tagAr: "موزع رسمي معتمد",
    titleEn: "Official Reseller Campaigns",
    titleAr: "عروض وحملات الموزعين الرسمية",
    descEn: "Best wholesale rates, instant activations, and full warranty on tools.",
    descAr: "أفضل أسعار الجملة المعتمدة، إصدارات جديدة، وتفعيل فوري مع ضمان كامل.",
    badgeEn: "Full Warranty",
    badgeAr: "ضمان معتمد كامل",
    turnaroundEn: "Instant Delivery",
    turnaroundAr: "تسليم فوري 24/7",
    guaranteeEn: "100% Guaranteed",
    guaranteeAr: "ضمان رسمي كامل",
    connectionEn: "AUTO SERVER",
    connectionAr: "سيرفر مؤتمت",
    theme: "cyan",
    image: "/images/promo_gift_box_clean.png",
    url: "/pricing",
    buttonTextEn: "View All Offers",
    buttonTextAr: "عرض جميع العروض"
  },
  {
    id: "chimera_tool",
    tagEn: "Best Seller Tool",
    tagAr: "الأداة الأكثر طلباً",
    titleEn: "Chimera Tool Pro",
    titleAr: "أداة شيميرا (Chimera Tool)",
    descEn: "All Brands and Samsung activations with instant server token generation.",
    descAr: "تراخيص سنوية وتعبئة أرصدة شيميرا بأسعار منافسة وتسليم فوري خلال دقيقة.",
    badgeEn: "Instant License",
    badgeAr: "ترخيص فوري مباشر",
    turnaroundEn: "Under 1 Min",
    turnaroundAr: "أقل من دقيقة",
    guaranteeEn: "100% REFUND",
    guaranteeAr: "ضمان استرجاع 100%",
    connectionEn: "GSM SERVER",
    connectionAr: "سيرفر رسمي",
    theme: "blue",
    image: "/images/promo_chimera.png",
    url: "/pricing?section=Chimera%20Tool",
    buttonTextEn: "Get Chimera License",
    buttonTextAr: "احصل على ترخيص شيميرا"
  },
  {
    id: "borneo_schematics",
    tagEn: "Hardware Diagnostics",
    tagAr: "مخططات الهاردوير",
    titleEn: "Borneo Schematics",
    titleAr: "مخططات بورنيو (Borneo)",
    descEn: "Official activation codes for 1-PC and 2-PC with instant daily updates.",
    descAr: "تفعيل رسمي لمخططات بورنيو مع تحديثات يومية ودعم لجميع اللوحات الإلكترونية.",
    badgeEn: "Daily Updates",
    badgeAr: "تحديثات يومية متواصلة",
    turnaroundEn: "Instant 24/7",
    turnaroundAr: "فوري على مدار الساعة",
    guaranteeEn: "Official Code",
    guaranteeAr: "كود تفعيل أصلي",
    connectionEn: "OFFICIAL DB",
    connectionAr: "قاعدة بيانات رسمية",
    theme: "emerald",
    image: "/images/promo_borneo.png",
    url: "/pricing?search=Borneo",
    buttonTextEn: "Activate Borneo",
    buttonTextAr: "تفعيل باقة بورنيو"
  }
];

interface ThemeStyle {
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  shadowLight: string;
  shadowDark: string;
  auraLight: string;
  auraDark: string;
  accentTextLight: string;
  accentTextDark: string;
  pillBgLight: string;
  pillBgDark: string;
  progressGradient: string;
  buttonGradient: string;
}

const THEME_STYLES: Record<string, ThemeStyle> = {
  purple: {
    bgLight: "from-purple-50/90 via-white/95 to-indigo-50/80",
    bgDark: "from-[#0f0b24]/95 via-[#150f33]/90 to-[#0c091d]/95",
    borderLight: "border-purple-200/90",
    borderDark: "border-purple-500/35",
    shadowLight: "shadow-purple-500/10",
    shadowDark: "shadow-purple-950/60",
    auraLight: "bg-purple-400/20",
    auraDark: "bg-purple-600/30",
    accentTextLight: "text-purple-700",
    accentTextDark: "text-purple-300",
    pillBgLight: "bg-purple-100/90 border-purple-300 text-purple-800",
    pillBgDark: "bg-purple-950/60 border-purple-500/40 text-purple-300",
    progressGradient: "from-purple-600 via-indigo-500 to-purple-400",
    buttonGradient: "from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-500 hover:to-indigo-500"
  },
  cyan: {
    bgLight: "from-cyan-50/90 via-white/95 to-sky-50/80",
    bgDark: "from-[#051524]/95 via-[#081d33]/90 to-[#040e1a]/95",
    borderLight: "border-cyan-200/90",
    borderDark: "border-cyan-500/35",
    shadowLight: "shadow-cyan-500/10",
    shadowDark: "shadow-cyan-950/60",
    auraLight: "bg-cyan-400/20",
    auraDark: "bg-cyan-500/30",
    accentTextLight: "text-cyan-800",
    accentTextDark: "text-cyan-300",
    pillBgLight: "bg-cyan-100/90 border-cyan-300 text-cyan-800",
    pillBgDark: "bg-cyan-950/60 border-cyan-500/40 text-cyan-300",
    progressGradient: "from-cyan-500 via-sky-400 to-blue-500",
    buttonGradient: "from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-sky-500"
  },
  blue: {
    bgLight: "from-blue-50/90 via-white/95 to-slate-50/80",
    bgDark: "from-[#081226]/95 via-[#0c1a38]/90 to-[#060d1c]/95",
    borderLight: "border-blue-200/90",
    borderDark: "border-blue-500/35",
    shadowLight: "shadow-blue-500/10",
    shadowDark: "shadow-blue-950/60",
    auraLight: "bg-blue-400/20",
    auraDark: "bg-blue-600/30",
    accentTextLight: "text-blue-800",
    accentTextDark: "text-blue-300",
    pillBgLight: "bg-blue-100/90 border-blue-300 text-blue-800",
    pillBgDark: "bg-blue-950/60 border-blue-500/40 text-blue-300",
    progressGradient: "from-blue-600 via-indigo-500 to-sky-400",
    buttonGradient: "from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500"
  },
  emerald: {
    bgLight: "from-emerald-50/90 via-white/95 to-teal-50/80",
    bgDark: "from-[#041913]/95 via-[#06241b]/90 to-[#03130e]/95",
    borderLight: "border-emerald-200/90",
    borderDark: "border-emerald-500/35",
    shadowLight: "shadow-emerald-500/10",
    shadowDark: "shadow-emerald-950/60",
    auraLight: "bg-emerald-400/20",
    auraDark: "bg-emerald-500/30",
    accentTextLight: "text-emerald-800",
    accentTextDark: "text-emerald-300",
    pillBgLight: "bg-emerald-100/90 border-emerald-300 text-emerald-800",
    pillBgDark: "bg-emerald-950/60 border-emerald-500/40 text-emerald-300",
    progressGradient: "from-emerald-500 via-teal-400 to-green-500",
    buttonGradient: "from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500"
  },
  amber: {
    bgLight: "from-amber-50/90 via-white/95 to-orange-50/80",
    bgDark: "from-[#1b1204]/95 via-[#291b07]/90 to-[#140d03]/95",
    borderLight: "border-amber-200/90",
    borderDark: "border-amber-500/35",
    shadowLight: "shadow-amber-500/10",
    shadowDark: "shadow-amber-950/60",
    auraLight: "bg-amber-400/20",
    auraDark: "bg-amber-500/30",
    accentTextLight: "text-amber-800",
    accentTextDark: "text-amber-300",
    pillBgLight: "bg-amber-100/90 border-amber-300 text-amber-800",
    pillBgDark: "bg-amber-950/60 border-amber-500/40 text-amber-300",
    progressGradient: "from-amber-500 via-orange-400 to-amber-600",
    buttonGradient: "from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500"
  }
};

interface CampaignBannerProps {
  lang?: string;
  campaigns?: CampaignItem[];
  isPreview?: boolean;
}

export default function CampaignBanner({
  lang = "ar",
  campaigns,
  isPreview = false
}: CampaignBannerProps) {
  const isAr = lang === "ar";
  const items = campaigns && campaigns.length > 0 ? campaigns : DEFAULT_CAMPAIGNS;
  const total = items.length;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const durationMs = 6500;
  const tickIntervalMs = 50;

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
    setProgress(0);
  }, [total]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setProgress(0);
  }, [total]);

  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (tickIntervalMs / durationMs) * 100;
        if (next >= 100) {
          handleNext();
          return 0;
        }
        return next;
      });
    }, tickIntervalMs);

    return () => clearInterval(timer);
  }, [total, isPaused, handleNext]);

  const current = items[activeIndex % total] || items[0];
  const themeKey = current.theme && THEME_STYLES[current.theme] ? current.theme : "purple";
  const theme = THEME_STYLES[themeKey];

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const formatTargetUrl = (rawUrl?: string) => {
    if (!rawUrl) return `/${lang}/pricing`;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) return `/${lang}${rawUrl}`;
    return `/${lang}/${rawUrl}`;
  };

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* 1. Header Bar: Section Identification, Status Beacon, Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3.5 sm:mb-5">
        <div className="space-y-0.5 text-start">
          <div className="inline-flex items-center gap-2">
            <span className="h-[2px] w-5 sm:w-6 bg-purple-500 dark:bg-purple-400 rounded-full" />
            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {isAr ? "عروض وحملات الترويج الساخنة" : "Hot Promotional Campaigns"}
            </h2>
            <span className="h-[2px] w-5 sm:w-6 bg-purple-500 dark:bg-purple-400 rounded-full" />
          </div>
          <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400">
            {isAr
              ? "باقات حصرية وأسعار جملة معتمدة مع تسليم فوري وتلقائي"
              : "Exclusive wholesale deals and certified tools with instant delivery"}
          </p>
        </div>

        {/* Live Indicator & Slider Controls */}
        <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-[11px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>{isAr ? "عروض نشطة ومحدثة" : "Live Deals"}</span>
          </div>

          {total > 1 && (
            <div className="flex items-center gap-1 bg-white/70 dark:bg-[#071120]/80 p-0.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs">
              <button
                type="button"
                onClick={handlePrev}
                aria-label={isAr ? "السابق" : "Previous"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <PrevIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? (isAr ? "تشغيل" : "Play") : (isAr ? "إيقاف مؤقت" : "Pause")}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                {isPaused ? <Play className="w-3 h-3 text-cyan-500" /> : <Pause className="w-3 h-3 text-slate-400" />}
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label={isAr ? "التالي" : "Next"}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
              >
                <NextIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Flagship Modern Cockpit Card */}
      <div
        className={`relative w-full rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 lg:p-9 bg-gradient-to-br ${theme.bgLight} dark:${theme.bgDark} border ${theme.borderLight} dark:${theme.borderDark} backdrop-blur-2xl shadow-xl ${theme.shadowLight} dark:${theme.shadowDark} overflow-hidden transition-all duration-500 group`}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Active Progress Track */}
        {total > 1 && (
          <div className="absolute top-0 inset-x-0 h-[2.5px] bg-slate-200/60 dark:bg-white/10 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.progressGradient} transition-all ease-linear`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Ambient Animated Cyber Sheen Gliding Across Card */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/25 dark:via-cyan-300/10 to-transparent -skew-x-12 animate-banner-sheen" />
        </div>

        {/* Atmospheric Radial Aura Behind Graphic */}
        <div
          className={`absolute -bottom-16 end-4 sm:end-12 w-64 h-64 sm:w-80 sm:h-80 rounded-full ${theme.auraLight} dark:${theme.auraDark} blur-3xl pointer-events-none animate-banner-aura`}
        />

        {/* Card Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-center">
          
          {/* Main Info Column (7 Cols on Desktop) */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4 text-start">
            
            {/* Badges Bar: Flame Tag + Sub Badge */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold border shadow-xs ${theme.pillBgLight} dark:${theme.pillBgDark}`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>
                  {isAr
                    ? current.tagAr || current.tagEn || "عرض حصري"
                    : current.tagEn || current.tagAr || "Exclusive Deal"}
                </span>
              </span>

              {(current.badgeAr || current.badgeEn) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100/90 dark:bg-white/10 border border-slate-300/80 dark:border-white/15 text-slate-700 dark:text-slate-200 text-[10px] sm:text-[11px] font-semibold">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  <span>
                    {isAr
                      ? current.badgeAr || current.badgeEn
                      : current.badgeEn || current.badgeAr}
                  </span>
                </span>
              )}
            </div>

            {/* Headline and Description with Smooth Fade */}
            <div className="space-y-1.5 sm:space-y-2">
              <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                {isAr
                  ? current.titleAr || current.titleEn || "خدمة معتمدة"
                  : current.titleEn || current.titleAr || "Certified Service"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-w-xl">
                {isAr
                  ? current.descAr || current.descEn || "تفعيل فوري وأسعار حصرية مع ضمان استرجاع الرصيد بالكامل."
                  : current.descEn || current.descAr || "Instant automated fulfillment with full refund protection."}
              </p>
            </div>

            {/* 3 Operational Metric Proof Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 mx-auto mb-0.5 sm:mb-1" />
                <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isAr ? "سرعة الإنجاز" : "Speed"}
                </div>
                <div className="text-[11px] sm:text-xs font-black text-slate-900 dark:text-white font-mono mt-0.5 truncate">
                  {isAr
                    ? current.turnaroundAr || current.turnaroundEn || "1 - 5 دقائق"
                    : current.turnaroundEn || current.turnaroundAr || "1 - 5 Mins"}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mx-auto mb-0.5 sm:mb-1" />
                <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isAr ? "الضمان المالي" : "Guarantee"}
                </div>
                <div className="text-[11px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 truncate">
                  {isAr
                    ? current.guaranteeAr || current.guaranteeEn || "ضمان 100%"
                    : current.guaranteeEn || current.guaranteeAr || "100% REFUND"}
                </div>
              </div>

              <div className="p-2 sm:p-2.5 rounded-xl bg-white/80 dark:bg-[#071224]/80 border border-slate-200/90 dark:border-white/10 text-center shadow-xs">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-500 mx-auto mb-0.5 sm:mb-1" />
                <div className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {isAr ? "نوع الربط" : "Gateway"}
                </div>
                <div className="text-[11px] sm:text-xs font-black text-sky-600 dark:text-cyan-400 font-mono mt-0.5 truncate">
                  {isAr
                    ? current.connectionAr || current.connectionEn || "ربط فوري API"
                    : current.connectionEn || current.connectionAr || "DIRECT API"}
                </div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {isPreview ? (
                <button
                  type="button"
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.buttonGradient} text-white shadow-md shadow-purple-600/25 transition-all`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>
                    {isAr
                      ? current.buttonTextAr || current.buttonTextEn || "اطلب الآن وابدأ التفعيل"
                      : current.buttonTextEn || current.buttonTextAr || "Order & Activate Now"}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  href={formatTargetUrl(current.url)}
                  className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${theme.buttonGradient} text-white shadow-md shadow-purple-600/25 hover:shadow-lg transition-all group/btn`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white/90" />
                  <span>
                    {isAr
                      ? current.buttonTextAr || current.buttonTextEn || "اطلب الآن وابدأ التفعيل"
                      : current.buttonTextEn || current.buttonTextAr || "Order & Activate Now"}
                  </span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-1 rtl:group-hover/btn:-translate-x-1 ltr:group-hover/btn:translate-x-1" />
                </Link>
              )}

              {isPreview ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/15 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isAr ? "استعراض كافة الباقات" : "Browse All Rates"}</span>
                </button>
              ) : (
                <Link
                  href={`/${lang}/pricing`}
                  className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold bg-white/70 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 text-slate-800 dark:text-white border border-slate-300/80 dark:border-white/15 transition-all"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-500" />
                  <span>{isAr ? "استعراض كافة الباقات" : "Browse All Rates"}</span>
                </Link>
              )}
            </div>
          </div>

          {/* 3D Visual Product Showcase Column (5 Cols on Desktop) */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[260px] sm:max-w-[300px] aspect-square flex items-center justify-center">
              
              {/* Product Floating 3D Graphic */}
              <div className="relative w-44 h-44 sm:w-56 sm:h-56 animate-banner-float drop-shadow-[0_15px_30px_rgba(0,0,0,0.30)] dark:drop-shadow-[0_20px_40px_rgba(0,0,0,0.70)]">
                {current.image ? (
                  <Image
                    src={current.image}
                    alt={current.titleEn || current.titleAr || "Offer"}
                    fill
                    sizes="(max-width: 640px) 180px, 240px"
                    className="object-contain"
                    priority
                  />
                ) : (
                  <div className="w-full h-full rounded-2xl bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-white/20 flex flex-col items-center justify-center p-4 text-center">
                    <Sparkles className="w-12 h-12 text-purple-400 mb-2" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isAr ? current.titleAr : current.titleEn}
                    </span>
                  </div>
                )}
              </div>

              {/* Floating Verified Badge Pill */}
              <div className="absolute -bottom-1.5 inset-x-2 sm:inset-x-4 p-2 rounded-xl bg-white/90 dark:bg-[#071120]/90 backdrop-blur-md border border-slate-200/90 dark:border-white/15 flex items-center justify-between shadow-lg text-[10px] sm:text-xs">
                <span className="font-bold text-slate-800 dark:text-white truncate">
                  {isAr ? current.titleAr : current.titleEn}
                </span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ms-2">
                  AUTO 24/7
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 3. Interactive Thumb Tabs for Multi-Item Switcher */}
        {total > 1 && (
          <div className="mt-6 pt-3.5 border-t border-slate-200/80 dark:border-white/10 flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-0.5">
            {items.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setProgress(0);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    isActive
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 border-transparent shadow-sm"
                      : "bg-white/60 dark:bg-white/5 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-white/10 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/10"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isActive ? "bg-emerald-400 animate-pulse" : "bg-slate-400 dark:bg-slate-600"
                    }`}
                  />
                  <span className="truncate max-w-[120px] sm:max-w-[160px]">
                    {isAr ? item.titleAr || item.titleEn : item.titleEn || item.titleAr}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
