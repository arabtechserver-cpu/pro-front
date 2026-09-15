"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Locale } from "@/i18n/config";

interface Campaign {
  tagEn: string;
  tagAr: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  image: string;
  url: string;
}

export default function CampaignSlider({
  campaigns,
  lang,
}: {
  campaigns: Campaign[];
  lang: Locale;
}) {
  const isAr = lang === "ar";
  const langPrefix = `/${lang}`;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<"spotlight" | "grid">("spotlight");
  const tabsContainerRef = useRef<HTMLDivElement | null>(null);

  const total = campaigns?.length || 0;

  // Auto-rotate in spotlight mode every 7 seconds if user is not hovering
  useEffect(() => {
    if (total <= 1 || isPaused || viewMode !== "spotlight") return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 7000);
    return () => clearInterval(timer);
  }, [total, isPaused, viewMode]);

  // Smooth scroll active tab button into center view horizontally
  useEffect(() => {
    if (!tabsContainerRef.current) return;
    const activeBtn = tabsContainerRef.current.querySelector<HTMLButtonElement>(`[data-tab-idx="${activeIndex}"]`);
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [activeIndex]);

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return;
    const scrollAmount = direction === "left" ? -220 : 220;
    tabsContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const sanitizeTitle = (str: string) => {
    if (!str) return "";
    return str.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
  };

  const activeCampaign = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;
    return campaigns[activeIndex % campaigns.length];
  }, [campaigns, activeIndex]);

  if (!campaigns || campaigns.length === 0) return null;

  const getUrl = (rawUrl?: string) => {
    if (!rawUrl) return `/${lang}/pricing`;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) return `${langPrefix}${rawUrl}`;
    return `${langPrefix}/${rawUrl}`;
  };

  return (
    <div
      className="w-full space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Controls: Interactive Switcher Bar + View Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-1">
        {/* Campaign Tabs Slider Container with Mobile Horizontal Swipe */}
        <div className="relative w-full sm:w-auto flex-1 min-w-0 flex items-center gap-1.5">
          {/* Mobile Left Arrow */}
          <button
            type="button"
            onClick={() => scrollTabs(isAr ? "right" : "left")}
            className="sm:hidden w-7 h-7 shrink-0 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Scroll Tabs"
          >
            <i className={`fas ${isAr ? "fa-chevron-right" : "fa-chevron-left"} text-[10px]`} />
          </button>

          {/* Swipeable Tabs Bar */}
          <div
            ref={tabsContainerRef}
            className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full sm:flex-wrap touch-pan-x scroll-smooth snap-x snap-mandatory"
          >
            {campaigns.map((c, idx) => {
              const isActive = activeIndex === idx && viewMode === "spotlight";
              const title = sanitizeTitle(isAr ? c.titleAr : c.titleEn);
              return (
                <button
                  key={idx}
                  data-tab-idx={idx}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setViewMode("spotlight");
                  }}
                  className={`shrink-0 snap-start relative px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? "bg-blue-600/30 text-white border border-blue-400/70 shadow-[0_0_18px_rgba(59,130,246,0.35)]"
                      : "bg-[#0b1322] text-slate-300 border border-white/10 hover:border-blue-400/30 hover:bg-[#121c32] hover:text-white"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isActive ? "bg-cyan-400 animate-pulse" : "bg-slate-500"
                    }`}
                  />
                  <span className="truncate max-w-[150px] sm:max-w-[200px]">{title}</span>
                  {idx === 0 && (
                    <span className="text-[10px] font-mono font-normal px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-400/20">
                      HOT
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Right Arrow */}
          <button
            type="button"
            onClick={() => scrollTabs(isAr ? "left" : "right")}
            className="sm:hidden w-7 h-7 shrink-0 rounded-lg bg-[#0f172a] hover:bg-[#1e293b] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
            aria-label="Scroll Tabs"
          >
            <i className={`fas ${isAr ? "fa-chevron-left" : "fa-chevron-right"} text-[10px]`} />
          </button>
        </div>

        {/* View Switcher Toggle & Prev/Next */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === "spotlight" ? "grid" : "spotlight"))
            }
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0b1322] hover:bg-[#121c32] border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
            title={
              viewMode === "spotlight"
                ? isAr
                  ? "عرض الكروت جنبًا إلى جنب"
                  : "Switch to side-by-side grid"
                : isAr
                ? "العرض السينمائي المميز"
                : "Switch to cinematic spotlight"
            }
          >
            <i
              className={`fas ${
                viewMode === "spotlight" ? "fa-th-large" : "fa-expand"
              } text-[11px] text-blue-400`}
            />
            <span>
              {viewMode === "spotlight"
                ? isAr
                  ? "عرض البطاقات معاً"
                  : "Dual Cards View"
                : isAr
                ? "العرض السينمائي"
                : "Spotlight View"}
            </span>
          </button>

          {viewMode === "spotlight" && total > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  setActiveIndex((prev) => (prev - 1 + total) % total)
                }
                className="w-8 h-8 rounded-lg bg-[#0b1322] hover:bg-[#121c32] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Previous"
              >
                <i className={`fas ${isAr ? "fa-chevron-right" : "fa-chevron-left"} text-xs`} />
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((prev) => (prev + 1) % total)}
                className="w-8 h-8 rounded-lg bg-[#0b1322] hover:bg-[#121c32] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Next"
              >
                <i className={`fas ${isAr ? "fa-chevron-left" : "fa-chevron-right"} text-xs`} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: CINEMATIC SPOTLIGHT STAGE */}
      {viewMode === "spotlight" && activeCampaign && (
        <div className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-7 lg:p-9 bg-[#0b1322] border border-white/15 hover:border-blue-400/50 shadow-2xl shadow-black/80 transition-all duration-300 overflow-hidden group">
          {/* Top Laser Accent Beam */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-[0_0_20px_2px_rgba(34,211,238,0.8)] pointer-events-none" />

          {/* Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 rtl:-right-auto rtl:-left-24 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-600/25 transition-all duration-700" />
          <div className="absolute -bottom-24 -left-24 rtl:-left-auto rtl:-right-24 w-72 h-72 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-600/20 transition-all duration-700" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            {/* Left Content Column (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-center lg:text-start">
              {/* Top Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/35 text-blue-300 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-sm">
                  <i className="fas fa-fire text-amber-400 text-[10px]" />
                  <span>
                    {isAr
                      ? sanitizeTitle(activeCampaign.tagAr || "عرض حصري للموزعين")
                      : sanitizeTitle(activeCampaign.tagEn || "Exclusive VIP Deal")}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {isAr
                      ? "سيرفر نشط • تفعيل فوري 24/7"
                      : "Server Active • Instant 24/7"}
                  </span>
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight tracking-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-200">
                    {sanitizeTitle(isAr ? activeCampaign.titleAr : activeCampaign.titleEn)}
                  </span>
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm lg:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
                  {sanitizeTitle(isAr ? activeCampaign.descAr : activeCampaign.descEn)}
                </p>
              </div>

              {/* High-Tech Telemetry Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-1">
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#0f192d] border border-white/10 text-center">
                  <i className="fas fa-bolt text-amber-400 text-xs sm:text-sm mb-1 block" />
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isAr ? "زمن الإنجاز" : "Turnaround"}
                  </div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">
                    {isAr ? "1 - 5 دقائق" : "1 - 5 Mins"}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-[#0f192d] border border-white/10 text-center">
                  <i className="fas fa-shield-alt text-emerald-400 text-xs sm:text-sm mb-1 block" />
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isAr ? "مستوى الضمان" : "Warranty"}
                  </div>
                  <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">
                    {isAr ? "استرجاع 100%" : "100% Refund"}
                  </div>
                </div>

                <div className="p-2.5 sm:p-3 rounded-xl bg-[#0f192d] border border-white/10 text-center">
                  <i className="fas fa-server text-cyan-400 text-xs sm:text-sm mb-1 block" />
                  <div className="text-[10px] text-slate-400 font-medium">
                    {isAr ? "نوع الربط" : "API Integration"}
                  </div>
                  <div className="text-xs font-bold text-cyan-300 font-mono mt-0.5">
                    {isAr ? "ربط مباشر" : "Direct API"}
                  </div>
                </div>
              </div>

              {/* Action Buttons & Guarantee */}
              <div className="pt-2 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <Link
                    href={getUrl(activeCampaign.url)}
                    className="btn-royal w-full sm:w-auto py-3 px-7 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 group/btn shadow-xl shadow-blue-900/40"
                  >
                    <span>
                      {isAr ? "اطلب الآن وابدأ التفعيل" : "Order & Activate Now"}
                    </span>
                    <i
                      className={`fas ${
                        isAr ? "fa-arrow-left" : "fa-arrow-right"
                      } text-xs transition-transform group-hover/btn:-translate-x-1`}
                    />
                  </Link>

                  <Link
                    href={`/${lang}/pricing`}
                    className="w-full sm:w-auto py-3 px-5 font-semibold text-xs text-slate-300 hover:text-white bg-[#0f192d] hover:bg-[#16233f] border border-white/10 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-list-ul text-blue-400 text-xs" />
                    <span>
                      {isAr ? "استعراض كافة الأسعار" : "Browse All Prices"}
                    </span>
                  </Link>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center justify-center lg:justify-start gap-1.5">
                  <i className="fas fa-check-circle text-emerald-400 text-[10px]" />
                  <span>
                    {isAr
                      ? "استرجاع تلقائي كامل للرصيد إلى محفظتك في حال عدم توافق الخدمة"
                      : "Automatic full wallet refund if device is not supported"}
                  </span>
                </p>
              </div>
            </div>

            {/* Right Visual Artwork Showcase Column (5 cols on lg) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-[300px] sm:max-w-[340px] aspect-square rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-[#090f1e] border border-white/20 shadow-2xl flex items-center justify-center group/img">
                {/* Radial Glow Aura Behind Artwork */}
                <div className="absolute inset-4 rounded-2xl bg-radial from-blue-500/20 via-cyan-500/10 to-transparent blur-2xl pointer-events-none group-hover/img:scale-110 transition-transform duration-700" />

                {/* Floating Top Badge */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-20">
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#0a1120] border border-white/15 text-cyan-300 shadow-md">
                    OFFICIAL PARTNER
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-[#0a1120] border border-white/15 text-emerald-300 shadow-md">
                    2026 READY
                  </span>
                </div>

                {/* Promo Image Container */}
                <div className="relative w-full h-full rounded-xl sm:rounded-2xl overflow-hidden border border-white/10 bg-[#060b14] flex items-center justify-center">
                  <img
                    src={activeCampaign.image}
                    alt={sanitizeTitle(isAr ? activeCampaign.titleAr : activeCampaign.titleEn)}
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#060a14]/85 via-transparent to-transparent pointer-events-none" />

                  {/* Bottom Status Chip */}
                  <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-xl bg-[#090f1d] border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-white font-bold truncate">
                      {sanitizeTitle(isAr ? activeCampaign.titleAr : activeCampaign.titleEn)}
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 font-bold shrink-0">
                      GSM API
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: DUAL / MULTI CARDS GRID (SIDE-BY-SIDE CYBER DECKS) */}
      {viewMode === "grid" && (
        <div
          className={`w-full grid gap-4 sm:gap-6 ${
            campaigns.length === 1
              ? "grid-cols-1 max-w-2xl mx-auto"
              : campaigns.length === 3
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {campaigns.map((c, idx) => {
            const tag = sanitizeTitle(isAr ? c.tagAr : c.tagEn);
            const title = sanitizeTitle(isAr ? c.titleAr : c.titleEn);
            const desc = sanitizeTitle(isAr ? c.descAr : c.descEn);
            const url = getUrl(c.url);

            return (
              <div
                key={idx}
                className="relative rounded-2xl sm:rounded-3xl p-5 sm:p-6 bg-[#0b1322] border border-white/15 hover:border-blue-400/60 shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col justify-between overflow-hidden"
              >
                {/* Top Neon Accent Line */}
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/0 to-transparent group-hover:via-cyan-400 group-hover:shadow-[0_0_16px_2px_rgba(34,211,238,0.85)] transition-all duration-500 pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/30 text-blue-300 font-bold text-xs uppercase px-3 py-1 rounded-full shadow-sm">
                      <i className="fas fa-tag text-[10px] text-blue-400" />
                      <span>{tag || (isAr ? "عرض خاص" : "Special Deal")}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{isAr ? "تسليم آلي فوري" : "Instant Delivery"}</span>
                    </span>
                  </div>

                  {/* Artwork Showcase Pod & Title */}
                  <div className="flex items-center gap-3.5">
                    {c.image && (
                      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden border border-white/20 shadow-xl bg-[#101726] shrink-0 group-hover:scale-105 group-hover:border-blue-400/60 transition-all duration-300">
                        <img
                          src={c.image}
                          alt={title}
                          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#090e1a]/80 via-transparent to-transparent pointer-events-none" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-blue-400 transition-colors leading-tight mb-1.5">
                        {title}
                      </h3>
                      <p className="text-slate-300 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {desc}
                      </p>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="px-3 py-2 rounded-xl bg-[#0f192d] border border-white/10 text-center">
                      <span className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5 font-medium">
                        <i className="fas fa-bolt text-amber-400 text-[10px]" />
                        <span>{isAr ? "تنفيذ لحظي API" : "Instant API"}</span>
                      </span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-[#0f192d] border border-white/10 text-center">
                      <span className="text-[11px] text-slate-300 flex items-center justify-center gap-1.5 font-medium">
                        <i className="fas fa-shield-alt text-emerald-400 text-[10px]" />
                        <span>{isAr ? "ضمان رسمي 100%" : "Official 100%"}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Area */}
                <div className="space-y-2 mt-4 pt-3.5 border-t border-white/10">
                  <Link
                    href={url}
                    className="btn-royal w-full py-3 px-5 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/30"
                  >
                    <span>
                      {isAr ? "اطلب الآن وابدأ التفعيل" : "Order & Activate Now"}
                    </span>
                    <i
                      className={`fas ${
                        isAr ? "fa-arrow-left" : "fa-arrow-right"
                      } text-xs transition-transform group-hover:-translate-x-1`}
                    />
                  </Link>

                  <p className="text-center text-[10px] sm:text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <i className="fas fa-shield-alt text-[10px] text-emerald-400" />
                    <span>
                      {isAr
                        ? "استرجاع تلقائي للرصيد في حال عدم التوافق"
                        : "Auto refund protection if unsupported"}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

