"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AmrrStatsSectionProps {
  lang: string;
}

export default function AmrrStatsSection({ lang }: AmrrStatsSectionProps) {
  const isAr = lang === "ar";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  return (
    <section className="relative my-6 sm:my-10 cyber-container">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        
        {/* Left Column: Ready to Unlock CTA Card */}
        <div
          className="lg:col-span-5 relative overflow-hidden curved-cockpit rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-violet-500/40 shadow-2xl flex flex-col justify-between animate-card-float animate-neon-border will-change-transform"
          data-aos="fade-right"
          data-aos-delay="100"
          suppressHydrationWarning
        >
          {/* Top Arched Cyber Horizon */}
          <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_15px_#a78bfa] pointer-events-none"></div>

          {/* Vertical Laser Scanline */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_12px_#a78bfa] animate-laser-scan pointer-events-none will-change-transform"></div>

          <div>
            <div className="text-center sm:text-start mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-violet-300 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-violet-400 online-blink"></span>
                <span>{isAr ? "جاهز للتنفيذ الفوري" : "Instant Processing Ready"}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                {isAr ? "جاهز لفك وتفعيل جهازك؟" : "Ready to Unlock Your Device?"}
              </h2>
              <p className="text-slate-300 text-xs sm:text-base leading-relaxed">
                {isAr ? "اختر الخدمة المناسبة وابدأ في ثوانٍ معدودة" : "Choose your preferred action below"}
              </p>
            </div>

            <div className="flex flex-col gap-3 mb-6">
              {/* Primary Action Button Matching Image */}
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-purple-glow px-6 sm:px-8 py-3.5 sm:py-4 font-black text-sm sm:text-base flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-bolt text-yellow-300 group-hover:scale-110 transition-transform"></i>
                <span className="tracking-wide">
                  {isAr
                    ? "اضغط هنا لبدء الطلب الآن"
                    : "Click Here to Order Now"}
                </span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </Link>

              {/* Secondary Action Button */}
              <Link
                href={`/${lang}/pricing`}
                className="btn-dark-pill px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-list-alt text-cyan-400 text-base group-hover:scale-110 transition-transform"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات" : "View All Services"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-slate-400 group-hover:text-cyan-400 transition-colors`}></i>
              </Link>
            </div>
          </div>

          {/* Quick Highlights with Glowing Animated Badges */}
          <div className="pt-4 border-t border-cyan-500/20">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-violet-300 font-bold bg-violet-500/15 px-3 py-1 rounded-full border border-violet-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping"></span>
                <i className="fas fa-clock text-xs text-violet-400"></i>
                <span>{isAr ? "تسليم فوري" : "Instant Delivery"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-300 font-bold bg-cyan-500/15 px-3 py-1 rounded-full border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <i className="fas fa-shield-alt text-xs text-cyan-400"></i>
                <span>{isAr ? "دفع آمن 100%" : "100% Secure"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300 font-bold bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                <i className="fas fa-headset text-xs text-purple-400"></i>
                <span>{isAr ? "دعم 24/7" : "24/7 Support"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Performance Metrics Display */}
        <div
          className="lg:col-span-7 relative overflow-hidden curved-cockpit rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-cyan-500/30 shadow-2xl flex flex-col justify-between animate-card-float-delayed will-change-transform"
          data-aos="fade-left"
          data-aos-delay="200"
          suppressHydrationWarning
        >
          {/* Top Arched Cyber Horizon */}
          <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#8b5cf6] pointer-events-none"></div>

          {/* Vertical Laser Scanline */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#8b5cf6] animate-laser-scan pointer-events-none will-change-transform"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#050814]/80 px-3.5 py-1.5 rounded-full border border-cyan-500/30 mb-1.5 shadow-sm">
                <span className="w-2 h-2 bg-violet-400 rounded-full online-blink"></span>
                <span className="text-slate-300 text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  {isAr ? "سيرفر الأداء الفائق" : "ULTRA PERFORMANCE"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? "مميزاتنا الأكثر حصرية" : "Exclusive Server Features"}
              </h2>
            </div>
            <span className="text-xs text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-full border border-violet-500/20 font-semibold flex items-center gap-1.5 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse"></span>
              {isAr ? "تحديث مباشر وتلقائي" : "Real-time indicators"}
            </span>
          </div>

          {/* Stats 3-Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
            {/* Stat 1 */}
            <div className="group relative overflow-hidden bg-[#050814]/85 hover:bg-[#0c1328] border border-cyan-500/25 hover:border-violet-400/60 rounded-xl sm:rounded-2xl p-4 text-center transition-all duration-300 shadow-md">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-violet-500/15 border border-violet-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <i className="fas fa-unlock-alt text-violet-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-violet-400 mb-0.5 tracking-tight drop-shadow-[0_0_12px_rgba(139,92,246,0.4)]">
                +500K
              </div>
              <div className="text-slate-200 text-xs sm:text-sm font-bold mb-0.5">
                {isAr ? "أجهزة تم فكها" : "Devices Unlocked"}
              </div>
              <div className="text-violet-300 text-[10px] sm:text-xs font-semibold bg-violet-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "+12% هذا الشهر" : "+12% this month"}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative overflow-hidden bg-[#050814]/85 hover:bg-[#0c1328] border border-cyan-500/25 hover:border-cyan-400/60 rounded-xl sm:rounded-2xl p-4 text-center transition-all duration-300 shadow-md">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-cyan-500/15 border border-cyan-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <i className="fas fa-chart-line text-cyan-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 mb-0.5 tracking-tight drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]">
                99.8%
              </div>
              <div className="text-slate-200 text-xs sm:text-sm font-bold mb-0.5">
                {isAr ? "نسبة النجاح" : "Success Rate"}
              </div>
              <div className="text-cyan-300 text-[10px] sm:text-xs font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "الأعلى في الشرق الأوسط" : "Industry leading"}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative overflow-hidden bg-[#050814]/85 hover:bg-[#0c1328] border border-cyan-500/25 hover:border-purple-400/60 rounded-xl sm:rounded-2xl p-4 text-center transition-all duration-300 shadow-md">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-purple-500/15 border border-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                <i className="fas fa-headset text-purple-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-purple-400 mb-0.5 tracking-tight drop-shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                24/7
              </div>
              <div className="text-slate-200 text-xs sm:text-sm font-bold mb-0.5">
                {isAr ? "دعم فني مباشر" : "Expert Support"}
              </div>
              <div className="text-purple-300 text-[10px] sm:text-xs font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "متواجد دائماً" : "Always available"}
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-cyan-500/20">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <i className="fas fa-server text-cyan-400"></i>
                {isAr ? "حالة النظام والسيرفرات" : "System Status"}
              </span>
              <span className="text-violet-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 online-blink"></span>
                {isAr ? "مستقر ومثالي ● OPTIMAL" : "● OPTIMAL"}
              </span>
            </div>
            <div className="w-full bg-[#050814] rounded-full h-2.5 overflow-hidden p-0.5 border border-cyan-500/30 shadow-inner">
              <div className="bg-gradient-to-r from-violet-500 via-purple-400 to-cyan-500 h-full rounded-full w-full animate-progress-glow shadow-[0_0_10px_rgba(139,92,246,0.4)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
