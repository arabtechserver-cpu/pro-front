"use client";

import React from "react";
import Link from "next/link";

interface AmrrStatsSectionProps {
  lang: string;
}

export default function AmrrStatsSection({ lang }: AmrrStatsSectionProps) {
  const isAr = lang === "ar";

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 my-10">
      {/* Left Column: Ready to Unlock CTA Card */}
      <div
        className="lg:col-span-5 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl flex flex-col justify-between"
        data-aos="fade-right"
        data-aos-delay="100"
      >
        <div>
          <div className="text-center sm:text-start mb-6">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">
              {isAr ? "جاهز لفك وتفعيل جهازك؟" : "Ready to Unlock Your Device?"}
            </h3>
            <p className="text-slate-400 text-sm sm:text-base">
              {isAr ? "اختر الخطوة المناسبة وابدأ في ثوانٍ معدودة" : "Choose your preferred action below"}
            </p>
          </div>

          <div className="flex flex-col gap-3.5 mb-6">
            {/* Primary Action */}
            <Link
              href={`/${lang}/register`}
              className="group relative overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-cyan-500 text-white px-6 py-4 rounded-2xl font-bold text-base shadow-xl hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <i className="fas fa-rocket text-lg"></i>
              <span>{isAr ? "ابدأ الفك والتفعيل الآن" : "Start Unlocking Now"}</span>
            </Link>

            {/* Secondary Action */}
            <Link
              href={`/${lang}/pricing`}
              className="group bg-slate-800/80 hover:bg-slate-700/80 border border-slate-600/50 hover:border-emerald-400/50 text-white px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 flex items-center justify-center gap-2"
            >
              <i className="fas fa-list-alt text-emerald-400"></i>
              <span>{isAr ? "عرض قائمة كافة الخدمات" : "View All Services"}</span>
            </Link>
          </div>
        </div>

        {/* Quick Highlights */}
        <div className="pt-4 border-t border-slate-700/50">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <i className="fas fa-clock"></i>
              <span>{isAr ? "تسليم فوري" : "Instant Delivery"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
              <i className="fas fa-shield-alt"></i>
              <span>{isAr ? "حماية 100%" : "100% Secure"}</span>
            </div>
            <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
              <i className="fas fa-headset"></i>
              <span>{isAr ? "دعم 24/7" : "24/7 Support"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Live Performance Metrics Display */}
      <div
        className="lg:col-span-7 bg-gradient-to-br from-slate-900/95 to-slate-800/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/50 shadow-2xl flex flex-col justify-between"
        data-aos="fade-left"
        data-aos-delay="200"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-slate-800/80 px-4 py-1.5 rounded-full border border-slate-700 mb-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></span>
              <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                {isAr ? "مؤشرات الأداء اللحظية" : "LIVE PERFORMANCE METRICS"}
              </span>
            </div>
            <h3 className="text-2xl font-black text-white">
              {isAr ? "التميز في الأداء والسرعة" : "Unlocking Excellence"}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {isAr ? "تحديث مباشر وتلقائي" : "Real-time indicators"}
          </span>
        </div>

        {/* Stats 3-Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-2">
          {/* Stat 1 */}
          <div className="group bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-emerald-500/40 rounded-2xl p-5 text-center transition-all duration-300">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i className="fas fa-unlock-alt text-emerald-400 text-xl"></i>
            </div>
            <div className="text-3xl font-black text-emerald-400 mb-1">500K+</div>
            <div className="text-slate-200 text-sm font-bold mb-1">
              {isAr ? "أجهزة تم فكها" : "Devices Unlocked"}
            </div>
            <div className="text-emerald-300/80 text-xs font-medium">
              {isAr ? "+12% هذا الشهر" : "+12% this month"}
            </div>
          </div>

          {/* Stat 2 */}
          <div className="group bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-cyan-500/40 rounded-2xl p-5 text-center transition-all duration-300">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i className="fas fa-chart-line text-cyan-400 text-xl"></i>
            </div>
            <div className="text-3xl font-black text-cyan-400 mb-1">99.8%</div>
            <div className="text-slate-200 text-sm font-bold mb-1">
              {isAr ? "نسبة النجاح" : "Success Rate"}
            </div>
            <div className="text-cyan-300/80 text-xs font-medium">
              {isAr ? "الأعلى في الشرق الأوسط" : "Industry leading"}
            </div>
          </div>

          {/* Stat 3 */}
          <div className="group bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 hover:border-purple-500/40 rounded-2xl p-5 text-center transition-all duration-300">
            <div className="w-12 h-12 bg-slate-700/50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <i className="fas fa-headset text-purple-400 text-xl"></i>
            </div>
            <div className="text-3xl font-black text-purple-400 mb-1">24/7</div>
            <div className="text-slate-200 text-sm font-bold mb-1">
              {isAr ? "دعم فني مباشر" : "Expert Support"}
            </div>
            <div className="text-purple-300/80 text-xs font-medium">
              {isAr ? "متواجد دائماً" : "Always available"}
            </div>
          </div>
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            <span className="text-slate-300 font-semibold">
              {isAr ? "حالة النظام والسيرفرات" : "System Status"}
            </span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 online-blink"></span>
              {isAr ? "مستقر ومثالي ● OPTIMAL" : "● OPTIMAL"}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-2.5 rounded-full w-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
