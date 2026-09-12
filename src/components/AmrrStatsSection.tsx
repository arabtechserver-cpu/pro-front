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
    <section className="relative my-6 sm:my-10 cyber-container section-spotlight">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative z-10">
        
        {/* Left Column: Ready to Unlock CTA Card */}
        <div
          className="lg:col-span-5 relative overflow-hidden lamp-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col justify-between"
          data-aos="fade-right"
          data-aos-delay="100"
          suppressHydrationWarning
        >
          <div>
            <div className="text-center sm:text-start mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400 mb-3 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
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
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-royal px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/30"
              >
                <i className="fas fa-bolt text-amber-300 group-hover:scale-105 transition-transform"></i>
                <span className="tracking-wide">
                  {isAr
                    ? "اضغط هنا لبدء الطلب الآن"
                    : "Click Here to Order Now"}
                </span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </Link>

              <Link
                href={`/${lang}/pricing`}
                className="btn-dark-pill px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-list-alt text-sky-400 text-base"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات" : "View All Services"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-slate-300 group-hover:text-white transition-colors`}></i>
              </Link>
            </div>
          </div>

          {/* Quick Highlights with Clean Solid Badges */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-center sm:justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <i className="fas fa-clock text-xs text-emerald-400"></i>
                <span>{isAr ? "تسليم فوري" : "Instant Delivery"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400 font-semibold bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <i className="fas fa-shield-alt text-xs text-blue-400"></i>
                <span>{isAr ? "دفع آمن 100%" : "100% Secure"}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 font-semibold bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                <i className="fas fa-headset text-xs text-slate-400"></i>
                <span>{isAr ? "دعم 24/7" : "24/7 Support"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Performance Metrics Display with Lamp Effect */}
        <div
          className="lg:col-span-7 relative overflow-hidden lamp-card rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col justify-between"
          data-aos="fade-left"
          data-aos-delay="200"
          suppressHydrationWarning
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0B0F17] px-3.5 py-1.5 rounded-full border border-white/10 mb-1.5 shadow-sm">
                <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                <span className="text-slate-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider">
                  {isAr ? "سيرفر الأداء الفائق" : "ULTRA PERFORMANCE"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? "مميزاتنا الأكثر حصرية" : "Exclusive Server Features"}
              </h2>
            </div>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 font-semibold flex items-center gap-1.5 w-max">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              {isAr ? "تحديث مباشر وتلقائي" : "Real-time indicators"}
            </span>
          </div>

          {/* Stats 3-Grid with individual lamp cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
            {/* Stat 1 */}
            <div className="lamp-card rounded-xl sm:rounded-2xl p-4 text-center shadow-sm">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-blue-500/10 border border-blue-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 transition-colors">
                <i className="fas fa-unlock-alt text-blue-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-0.5 tracking-tight">
                +500K
              </div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mb-1">
                {isAr ? "أجهزة تم فكها" : "Devices Unlocked"}
              </div>
              <div className="text-blue-300 text-[10px] sm:text-xs font-medium bg-blue-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "+12% هذا الشهر" : "+12% this month"}
              </div>
            </div>

            {/* Stat 2 */}
            <div className="lamp-card rounded-xl sm:rounded-2xl p-4 text-center shadow-sm">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 transition-colors">
                <i className="fas fa-chart-line text-emerald-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-0.5 tracking-tight">
                99.8%
              </div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mb-1">
                {isAr ? "نسبة النجاح" : "Success Rate"}
              </div>
              <div className="text-emerald-300 text-[10px] sm:text-xs font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "الأعلى في الشرق الأوسط" : "Industry leading"}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="lamp-card rounded-xl sm:rounded-2xl p-4 text-center shadow-sm">
              <div className="w-11 h-11 sm:w-13 sm:h-13 bg-amber-500/10 border border-amber-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-2.5 transition-colors">
                <i className="fas fa-headset text-amber-400 text-xl sm:text-2xl"></i>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white mb-0.5 tracking-tight">
                24/7
              </div>
              <div className="text-slate-300 text-xs sm:text-sm font-medium mb-1">
                {isAr ? "دعم فني مباشر" : "Expert Support"}
              </div>
              <div className="text-amber-300 text-[10px] sm:text-xs font-medium bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                {isAr ? "متواجد دائماً" : "Always available"}
              </div>
            </div>
          </div>

          {/* Bottom Status Bar */}
          <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2 text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <i className="fas fa-server text-blue-400"></i>
                {isAr ? "حالة النظام والسيرفرات" : "System Status"}
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                {isAr ? "مستقر ومثالي ● OPTIMAL" : "● OPTIMAL"}
              </span>
            </div>
            <div className="w-full bg-[#0B0F17] rounded-full h-2 overflow-hidden border border-white/10">
              <div className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
