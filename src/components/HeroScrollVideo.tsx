"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface HeroScrollVideoProps {
  lang: string;
}

interface StageInfo {
  id: number;
  labelAr: string;
  labelEn: string;
  tagAr: string;
  tagEn: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  statusBadgeAr: string;
  statusBadgeEn: string;
  metricLabelAr: string;
  metricLabelEn: string;
  metricValue: string;
}

const STAGES: StageInfo[] = [
  {
    id: 0,
    labelAr: "فحص وتحديد القفل",
    labelEn: "Detection & Lock",
    tagAr: "المرحلة الأولى // كشف الجهاز",
    tagEn: "Stage 01 // Device Detection",
    titleAr: "تشخيص فوري وفك حماية شامل للأجهزة الذكية",
    titleEn: "Instant Automated Diagnostics & GSM Security Unlocks",
    descAr: "فحص فوري وتحديد دقيق لنوع القفل السحابي والشبكات بدقة متناهية لكافة أجهزة Apple و Samsung و Xiaomi.",
    descEn: "Instant automated detection for iCloud, FRP, and carrier lock across all major smartphone models.",
    statusBadgeAr: "كشف القفل // فحص سحابي",
    statusBadgeEn: "LOCK DETECTED // CLOUD SCAN",
    metricLabelAr: "زمن الاستجابة",
    metricLabelEn: "API Latency",
    metricValue: "9ms"
  },
  {
    id: 1,
    labelAr: "اتصال مباشر بالنواة",
    labelEn: "Chipset Handshake",
    tagAr: "المرحلة الثانية // اتصال النواة",
    tagEn: "Stage 02 // Chipset Protocol",
    titleAr: "اتصال مباشر بالمعالج والـ BootROM دون فتح الجهاز",
    titleEn: "Direct CPU & BootROM Cloud Protocol Without Opening Device",
    descAr: "خوارزميات برمجة متقدمة عبر قنوات بيانات مؤمنة تخترق طبقات الحماية لمعالجات Qualcomm و MTK و Exynos و Bionic.",
    descEn: "Direct hardware protocol handshake bypassing security layers via Qualcomm EDL, MTK BROM, and Apple DFU.",
    statusBadgeAr: "اتصال النواة نشط // تشفير كامل",
    statusBadgeEn: "CPU ACTIVE // AES-256",
    metricLabelAr: "معدل الأمان",
    metricLabelEn: "Security Protocol",
    metricValue: "100%"
  },
  {
    id: 2,
    labelAr: "تلقيم شبكة الأدوات",
    labelEn: "Authorized Tools",
    tagAr: "المرحلة الثالثة // شبكة التراخيص",
    tagEn: "Stage 03 // Tool Integration",
    titleAr: "أقوى شبكة تراخيص وسيرفرات البوكسات والأدوات دولياً",
    titleEn: "Premier Authorized GSM Tool Network & Direct Credits",
    descAr: "شحن فوري للأرصدة وتراخيص البرامج الرائدة (UnlockTool, Chimera, Borneo, DFT Pro) عبر بوابات الـ API المؤتمتة.",
    descEn: "Instant credit delivery and annual license top-ups for UnlockTool, Chimera, Borneo, DFT Pro via live API.",
    statusBadgeAr: "سيرفر الأدوات // تسليم فوري",
    statusBadgeEn: "TOOL NODES // INSTANT API",
    metricLabelAr: "الخدمات المدعومة",
    metricLabelEn: "Active Services",
    metricValue: "+500"
  },
  {
    id: 3,
    labelAr: "اكتمال الفك ودرع الحماية",
    labelEn: "Shield & Unlocked",
    tagAr: "المرحلة الرابعة // تم الفك بنجاح",
    tagEn: "Stage 04 // Device Ready",
    titleAr: "تم الفك بنجاح مع درع الحماية الهولوغرافي الشامل",
    titleEn: "Successfully Unlocked with Full Holographic Cyber Shield",
    descAr: "استعادة كاملة لإشارة الشبكة وكافة وظائف المصنع مع حماية مشفرة وضمان استرجاع الرصيد 100% ودعم فني 24/7.",
    descEn: "Full network signal and official factory functions restored with 100% refund guarantee and 24/7 GSM support.",
    statusBadgeAr: "مكتمل بنجاح // درع الحماية فعال",
    statusBadgeEn: "UNLOCKED // SHIELD ACTIVE",
    metricLabelAr: "نسبة النجاح",
    metricLabelEn: "Success Rate",
    metricValue: "99.9%"
  }
];

export default function HeroScrollVideo({ lang }: HeroScrollVideoProps) {
  const isAr = lang === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafIdRef = useRef<number | null>(null);

  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);

  const updateVideoProgress = useCallback(() => {
    if (!containerRef.current || !videoRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const containerHeight = container.offsetHeight;
    const windowHeight = window.innerHeight;

    const totalScrollable = containerHeight - windowHeight;
    if (totalScrollable <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalScrollable));

    setScrollProgress(progress);

    // Calculate corresponding stage (4 stages evenly mapped)
    let stage = 0;
    if (progress >= 0.75) {
      stage = 3;
    } else if (progress >= 0.5) {
      stage = 2;
    } else if (progress >= 0.22) {
      stage = 1;
    } else {
      stage = 0;
    }
    setCurrentStageIdx(stage);

    // Sync video frame with progress
    const video = videoRef.current;
    const duration = video.duration;

    if (duration && !isNaN(duration) && duration > 0) {
      const targetTime = progress * (duration - 0.05);
      targetTimeRef.current = targetTime;

      if (!isSeekingRef.current && Math.abs(video.currentTime - targetTime) > 0.03) {
        try {
          isSeekingRef.current = true;
          video.currentTime = targetTime;
        } catch {
          isSeekingRef.current = false;
        }
      }
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleSeeked = () => {
      isSeekingRef.current = false;
      const target = targetTimeRef.current;
      if (video && Math.abs(video.currentTime - target) > 0.03) {
        try {
          isSeekingRef.current = true;
          video.currentTime = target;
        } catch {
          isSeekingRef.current = false;
        }
      }
    };

    video.addEventListener("seeked", handleSeeked);
    return () => {
      video.removeEventListener("seeked", handleSeeked);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);

      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = requestAnimationFrame(updateVideoProgress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    // Initial calculation
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [updateVideoProgress]);

  const scrollToStage = (stageIdx: number) => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerTop = container.offsetTop;
    const containerHeight = container.offsetHeight;
    const windowHeight = window.innerHeight;
    const totalScrollable = containerHeight - windowHeight;

    const targets = [0.02, 0.35, 0.62, 0.95];
    const targetScroll = containerTop + totalScrollable * targets[stageIdx];

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth"
    });
  };

  const currentStage = STAGES[currentStageIdx];

  return (
    <section
      ref={containerRef}
      className="relative w-full h-[280vh] sm:h-[320vh] bg-[#0b0f17] select-none"
      id="hero-video-section"
    >
      {/* Sticky Viewport Frame */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between z-10">
        
        {/* Background Video Layer */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <video
            ref={videoRef}
            poster="/videos/hero_poster.jpg"
            muted
            playsInline
            preload="auto"
            onLoadedData={() => setIsVideoReady(true)}
            className={`w-full h-full object-cover object-center transition-opacity duration-700 ${
              isVideoReady ? "opacity-100" : "opacity-80"
            }`}
          >
            <source src="/videos/hero_scrub.mp4" type="video/mp4" />
            <source src={process.env.NEXT_PUBLIC_HERO_VIDEO_URL || "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4"} type="video/mp4" />
          </video>

          {/* Cyber Vignette & Readability Gradient Overlays */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#0b0f17] via-[#0b0f17]/40 to-[#0b0f17]/75"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#0b0f17_92%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:32px_32px]"
            aria-hidden="true"
          />
        </div>

        {/* Top HUD Bar: Telemetry & Stage Navigation */}
        <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Node Status Pill */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0d1626]/85 backdrop-blur-md border border-sky-400/30 shadow-lg shadow-black/40">
            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${
                  isScrolling ? "animate-ping" : ""
                }`}
              />
              <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
            </span>
            <span className="text-[11px] sm:text-xs font-mono font-bold text-sky-300">
              ATP-SERVER // {currentStage.statusBadgeEn}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 border-s border-white/10 ps-2">
              {currentStage.metricValue}
            </span>
          </div>

          {/* Clickable Stage Step Navigation */}
          <nav
            aria-label="Lifecycle stages"
            className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl sm:rounded-full bg-[#09101c]/80 backdrop-blur-md border border-white/10 overflow-x-auto max-w-full"
          >
            {STAGES.map((st, idx) => {
              const isActive = currentStageIdx === idx;
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => scrollToStage(idx)}
                  className={`px-2.5 sm:px-3 py-1 rounded-lg sm:rounded-full text-[10px] sm:text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 border border-sky-300/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  <span>{isAr ? st.labelAr : st.labelEn}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Center Stage Presentation Area */}
        <main className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 my-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 pointer-events-none">
          
          {/* Left / Primary Column: Stage Details Card */}
          <div className="w-full lg:max-w-xl pointer-events-auto">
            <div className="p-5 sm:p-7 lg:p-8 rounded-2xl sm:rounded-3xl bg-[#09111e]/85 backdrop-blur-xl border border-sky-400/30 shadow-[0_25px_60px_rgba(0,0,0,0.75),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-300">
              
              {/* Stage Sub-tag */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 font-bold text-xs mb-3 sm:mb-4">
                <i className="fas fa-microchip text-sky-400 text-xs" />
                <span>{isAr ? currentStage.tagAr : currentStage.tagEn}</span>
              </div>

              {/* Dynamic Heading */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-black text-white leading-tight mb-3 sm:mb-4">
                {isAr ? currentStage.titleAr : currentStage.titleEn}
              </h1>

              {/* Dynamic Description */}
              <p className="text-xs sm:text-sm lg:text-base text-slate-300 font-normal leading-relaxed mb-5 sm:mb-6">
                {isAr ? currentStage.descAr : currentStage.descEn}
              </p>

              {/* Dynamic Stage Feature Modules */}
              {currentStageIdx === 0 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5 sm:mb-6">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
                    <i className="fas fa-lock-open text-sky-400 text-xs" />
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? "فك شفرة الآيكلود" : "iCloud Bypass"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
                    <i className="fas fa-shield-halved text-emerald-400 text-xs" />
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? "تخطي حماية FRP" : "Google FRP Remove"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
                    <i className="fas fa-sim-card text-amber-400 text-xs" />
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? "فك قفل الشبكات الدولية" : "Carrier SimLock"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2">
                    <i className="fas fa-fingerprint text-indigo-400 text-xs" />
                    <span className="text-xs font-bold text-slate-200">
                      {isAr ? "فحص الـ IMEI التلقائي" : "Instant IMEI Check"}
                    </span>
                  </div>
                </div>
              )}

              {currentStageIdx === 1 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5 sm:mb-6">
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">Qualcomm EDL 9008</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded">DIRECT</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">MediaTek BROM V6</span>
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/15 px-1.5 py-0.5 rounded">AUTO</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">Samsung Knox Exynos</span>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">SECURE</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">Apple DFU & Ramdisk</span>
                    <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/15 px-1.5 py-0.5 rounded">ACTIVE</span>
                  </div>
                </div>
              )}

              {currentStageIdx === 2 && (
                <div className="grid grid-cols-2 gap-2 sm:gap-2.5 mb-5 sm:mb-6">
                  <div className="p-2.5 rounded-xl bg-[#111c30]/90 border border-sky-400/20 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs shrink-0">
                      <i className="fas fa-bolt" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">UnlockTool</span>
                      <span className="text-[10px] text-slate-400 block truncate">{isAr ? "تفعيل تلقائي" : "Auto License"}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111c30]/90 border border-amber-400/20 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs shrink-0">
                      <i className="fas fa-tools" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Chimera Tool</span>
                      <span className="text-[10px] text-slate-400 block truncate">{isAr ? "أرصدة فورية" : "Live Credits"}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111c30]/90 border border-emerald-400/20 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0">
                      <i className="fas fa-microchip" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">Borneo Schematics</span>
                      <span className="text-[10px] text-slate-400 block truncate">{isAr ? "مخططات حية" : "Hardware Bitmaps"}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#111c30]/90 border border-indigo-400/20 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs shrink-0">
                      <i className="fas fa-shield-alt" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">DFT Pro & AMT</span>
                      <span className="text-[10px] text-slate-400 block truncate">{isAr ? "سيرفر مباشر" : "Direct Server"}</span>
                    </div>
                  </div>
                </div>
              )}

              {currentStageIdx === 3 && (
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-white/[0.04] border border-white/10 text-center mb-5 sm:mb-6">
                  <div>
                    <span className="block text-[10px] text-slate-400">{isAr ? "إشارة الاتصال" : "Network Signal"}</span>
                    <span className="text-xs font-bold text-emerald-400">100% OK</span>
                  </div>
                  <div className="border-x border-white/10">
                    <span className="block text-[10px] text-slate-400">{isAr ? "ضمان الاسترجاع" : "Protection"}</span>
                    <span className="text-xs font-bold text-sky-400">100% SECURE</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400">{isAr ? "الدعم الفني" : "Support"}</span>
                    <span className="text-xs font-bold text-amber-300">24/7 LIVE</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                  className="btn-purple-glow px-5 sm:px-7 py-2.5 sm:py-3 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-900/40"
                >
                  <i className="fas fa-bolt text-yellow-300 text-xs" />
                  <span>
                    {isAr
                      ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن")
                      : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}
                  </span>
                  <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs`} />
                </Link>

                <Link
                  href={`/${lang}/pricing`}
                  className="btn-dark-pill px-4 sm:px-6 py-2.5 sm:py-3 font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <i className="fas fa-server text-sky-400 text-xs" />
                  <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View Services & Prices"}</span>
                </Link>
              </div>

            </div>
          </div>

          {/* Right Column: Live Telemetry Cockpit */}
          <div className="hidden lg:flex flex-col gap-3 w-80 shrink-0 pointer-events-auto">
            <div className="p-4 rounded-2xl bg-[#09111e]/80 backdrop-blur-xl border border-sky-400/25 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono pb-2 border-b border-white/10 text-slate-300">
                <span>ATP TELEMETRY</span>
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? "المرحلة الحالية" : "Active Stage"}</span>
                  <span className="text-sky-300 font-mono font-bold">0{currentStageIdx + 1} / 04</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? "تقدم السكرول" : "Video Progress"}</span>
                  <span className="text-emerald-400 font-mono font-bold">{Math.round(scrollProgress * 100)}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>{isAr ? "حالة التشغيل" : "Playback State"}</span>
                  <span className="text-amber-300 font-mono font-bold">{isScrolling ? (isAr ? "يعمل بالسكرول" : "SCROLLING") : (isAr ? "متوقف" : "HOLD")}</span>
                </div>
              </div>
            </div>

            {/* Quick Reseller Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 to-sky-900/20 border border-sky-500/20 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 font-bold text-white mb-1">
                <i className="fas fa-certificate text-yellow-400" />
                <span>{isAr ? "سيرفر معتمد للوكلاء والمحلات" : "Certified Reseller Network"}</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                {isAr
                  ? "تسليم فوري عبر واجهة برمجة التطبيقات مع ضمان الرصيد واسترجاع فوري للعمليات غير المكتملة."
                  : "Instant API delivery with balance guarantee and automated refunds."}
              </p>
            </div>
          </div>

        </main>

        {/* Bottom Control Bar: Progress Line & Scroll Prompt */}
        <footer className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col gap-2">
          
          {/* Scroll Prompt (Smoothly disappears as user scrolls down) */}
          <div
            className={`flex items-center justify-center gap-2 text-[11px] sm:text-xs text-sky-300 font-medium transition-opacity duration-300 ${
              scrollProgress > 0.08 ? "opacity-0 pointer-events-none" : "opacity-100 animate-bounce"
            }`}
          >
            <i className="fas fa-chevron-down text-sky-400 text-xs" />
            <span>
              {isAr
                ? "مرر للأسفل لاكتشاف مراحل السيرفر وتفاصيل الخدمات"
                : "Scroll down to interactively scrub through server operations"}
            </span>
            <i className="fas fa-chevron-down text-sky-400 text-xs" />
          </div>

          {/* Holographic Progress Track */}
          <div className="w-full h-1.5 sm:h-2 bg-[#09111e]/90 backdrop-blur-md rounded-full overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.8)]"
              style={{ width: `${Math.max(2, scrollProgress * 100)}%` }}
            />
          </div>
        </footer>

      </div>
    </section>
  );
}
