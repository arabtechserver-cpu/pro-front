"use client";

import React from "react";
import Link from "next/link";

interface AmrrStatsSectionProps {
  lang: string;
}

export default function AmrrStatsSection({ lang }: AmrrStatsSectionProps) {
  const isAr = lang === "ar";

  return (
    <section className="relative my-10">
      {/* --- Vertical Cyber Light Beams traveling along the height (حاجات بالطول بتتحرك وبتنور) --- */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Vertical Light Track 1 */}
        <div className="absolute left-[8%] sm:left-[12%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/15 to-transparent">
          <div className="w-full h-32 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-vertical-stream-1"></div>
        </div>

        {/* Vertical Light Track 2 */}
        <div className="absolute left-[40%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/15 to-transparent">
          <div className="w-full h-40 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#34d399] animate-vertical-stream-2"></div>
        </div>

        {/* Vertical Light Track 3 */}
        <div className="absolute right-[35%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/15 to-transparent">
          <div className="w-full h-36 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_15px_#c084fc] animate-vertical-stream-3"></div>
        </div>

        {/* Vertical Light Track 4 (Upward traveling) */}
        <div className="absolute right-[8%] sm:right-[10%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-teal-500/15 to-transparent">
          <div className="w-full h-28 bg-gradient-to-b from-transparent via-teal-300 to-transparent shadow-[0_0_12px_#5eead4] animate-vertical-stream-up"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        {/* Left Column: Ready to Unlock CTA Card (Animated, Glowing, Moving) */}
        <div
          className="lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-850/90 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/40 shadow-[0_0_40px_rgba(52,211,153,0.15)] flex flex-col justify-between animate-card-float animate-neon-border"
          data-aos="fade-right"
          data-aos-delay="100"
        >
          {/* Vertical Laser Scanline moving down inside the card */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_14px_#34d399] animate-laser-scan pointer-events-none"></div>

          {/* Vertical Glowing Border Accents */}
          <div className="absolute top-0 bottom-0 start-0 w-[2px] bg-gradient-to-b from-transparent via-emerald-400/50 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 bottom-0 end-0 w-[2px] bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>

          <div>
            <div className="text-center sm:text-start mb-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-300 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 online-blink"></span>
                <span>{isAr ? "جاهز للتنفيذ الفوري ⚡" : "Instant Processing Ready ⚡"}</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 leading-tight">
                {isAr ? "جاهز لفك وتفعيل جهازك؟" : "Ready to Unlock Your Device?"}
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {isAr ? "اختر الخطوة المناسبة وابدأ في ثوانٍ معدودة" : "Choose your preferred action below"}
              </p>
            </div>

            <div className="flex flex-col gap-3.5 mb-6">
              {/* Primary Action Button (Shimmer + Rocket Animation) */}
              <Link
                href={`/${lang}/register`}
                className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white px-6 py-4 rounded-2xl font-bold text-base shadow-[0_0_30px_rgba(52,211,153,0.35)] hover:shadow-[0_0_40px_rgba(34,211,238,0.55)] transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2.5 active:scale-95"
              >
                {/* Shimmer light sweep traveling across button */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-shimmer pointer-events-none"></div>

                <i className="fas fa-rocket text-xl text-yellow-300 animate-rocket-wiggle"></i>
                <span className="tracking-wide">{isAr ? "ابدأ الفك والتفعيل الآن" : "Start Unlocking Now"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:translate-x-1`}></i>
              </Link>

              {/* Secondary Action Button */}
              <Link
                href={`/${lang}/pricing`}
                className="group relative overflow-hidden bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/60 hover:border-cyan-400/80 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2.5 hover:shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:scale-[1.01]"
              >
                <i className="fas fa-list-alt text-cyan-400 text-lg group-hover:scale-110 transition-transform"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات" : "View All Services"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-slate-400 group-hover:text-cyan-400 transition-colors`}></i>
              </Link>
            </div>
          </div>

          {/* Quick Highlights with Glowing Animated Badges */}
          <div className="pt-4 border-t border-slate-700/60">
            <div className="flex flex-wrap items-center justify-between gap-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <i className="fas fa-clock text-xs"></i>
                <span>{isAr ? "تسليم فوري" : "Instant Delivery"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <i className="fas fa-shield-alt text-xs"></i>
                <span>{isAr ? "حماية 100%" : "100% Secure"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                <i className="fas fa-headset text-xs"></i>
                <span>{isAr ? "دعم 24/7" : "24/7 Support"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Performance Metrics Display (Animated, Glowing, Moving) */}
        <div
          className="lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-slate-900/95 via-slate-850/90 to-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl flex flex-col justify-between animate-card-float-delayed"
          data-aos="fade-left"
          data-aos-delay="200"
        >
          {/* Vertical Laser Scanline moving down */}
          <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#22d3ee] animate-laser-scan pointer-events-none"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 mb-2 shadow-sm">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full online-blink"></span>
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                  {isAr ? "مؤشرات الأداء اللحظية" : "LIVE PERFORMANCE METRICS"}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {isAr ? "التميز في الأداء والسرعة" : "Unlocking Excellence"}
              </h3>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1.5 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isAr ? "تحديث مباشر وتلقائي" : "Real-time indicators"}
            </span>
          </div>

          {/* Stats 3-Grid with Glowing Hover & Vibrancy */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-2">
            {/* Stat 1 */}
            <div className="group relative overflow-hidden bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-400/60 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(52,211,153,0.25)] hover:-translate-y-1">
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <i className="fas fa-unlock-alt text-emerald-400 text-2xl"></i>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-400 mb-1 tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                +500K
              </div>
              <div className="text-slate-200 text-sm font-bold mb-1">
                {isAr ? "أجهزة تم فكها" : "Devices Unlocked"}
              </div>
              <div className="text-emerald-300 text-xs font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "+12% هذا الشهر" : "+12% this month"}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="group relative overflow-hidden bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-cyan-400/60 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.25)] hover:-translate-y-1">
              <div className="w-14 h-14 bg-cyan-500/15 border border-cyan-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <i className="fas fa-chart-line text-cyan-400 text-2xl"></i>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-cyan-400 mb-1 tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                99.8%
              </div>
              <div className="text-slate-200 text-sm font-bold mb-1">
                {isAr ? "نسبة النجاح" : "Success Rate"}
              </div>
              <div className="text-cyan-300 text-xs font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "الأعلى في الشرق الأوسط" : "Industry leading"}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="group relative overflow-hidden bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-purple-400/60 rounded-2xl p-5 text-center transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.25)] hover:-translate-y-1">
              <div className="w-14 h-14 bg-purple-500/15 border border-purple-500/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform shadow-inner">
                <i className="fas fa-headset text-purple-400 text-2xl"></i>
              </div>
              <div className="text-3xl sm:text-4xl font-black text-purple-400 mb-1 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                24/7
              </div>
              <div className="text-slate-200 text-sm font-bold mb-1">
                {isAr ? "دعم فني مباشر" : "Expert Support"}
              </div>
              <div className="text-purple-300 text-xs font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "متواجد دائماً" : "Always available"}
              </div>
            </div>
          </div>

          {/* Bottom Status Bar with Moving Pulse & Glow */}
          <div className="mt-6 pt-4 border-t border-slate-700/60">
            <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <i className="fas fa-server text-cyan-400"></i>
                {isAr ? "حالة النظام والسيرفرات" : "System Status"}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 online-blink"></span>
                {isAr ? "مستقر ومثالي ● OPTIMAL" : "● OPTIMAL"}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/80 shadow-inner">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full w-full animate-progress-glow shadow-[0_0_15px_rgba(52,211,153,0.5)]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
