"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AmrrHeroSectionProps {
  lang: string;
}

export default function AmrrHeroSection({ lang }: AmrrHeroSectionProps) {
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
    <section className="relative w-full bg-gradient-to-br from-[#0d1525]/60 via-[#091120]/50 to-[#060b14]/65 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-sky-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.4),0_0_30px_rgba(56,189,248,0.12),inset_0_1px_2px_rgba(255,255,255,0.15)] mb-6 sm:mb-8 overflow-hidden">
      {/* Cyber Grid */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Ambient Laser / Neon Accents */}
      <div className="absolute top-0 inset-x-8 sm:inset-x-16 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-80 shadow-[0_0_15px_rgba(56,189,248,0.8)] pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 items-center">

          {/* Column 1: Editorial & Action Deck (7 Cols on desktop) */}
          <div className="lg:col-span-7 flex flex-col gap-3.5 sm:gap-5 lg:gap-6 text-start">

            {/* Top Pill / Breadcrumb */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs sm:text-sm font-bold w-fit shadow-[0_0_15px_rgba(56,189,248,0.15)]">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>{isAr ? "السيرفر الرسمي المعتمد لخدمات السوفت وير والأجهزة 24/7" : "Official Server for GSM & Software Services 24/7"}</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-4xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.15] sm:leading-[1.18]">
                <span>{isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server"}</span>
                <span className="block mt-1 sm:mt-1.5 text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-400 to-cyan-300 drop-shadow-[0_2px_12px_rgba(56,189,248,0.3)]">
                  {isAr ? "إدارة وتفعيل شامل لكافة الهواتف والأجهزة الذكية" : "Comprehensive Management & Activation"}
                </span>
              </h1>
            </div>

            {/* Value Proposition Description */}
            <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
              {isAr
                ? "منصة عرب تك برو سيرفر — بوابتك المتكاملة لفك الشفرات، تخطي الحسابات، وتفعيل البوكسات والدونجل مع تسليم تلقائي فوري، حماية مشفرة 100%، و دعم فني متخصص على مدار الساعة."
                : "Arab Tech Pro Server Platform — your all-in-one destination for network unlocking, account bypass, and instant tool & dongle activations with automated delivery and 24/7 priority support."}
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-royal px-5 sm:px-7 py-2.5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:shadow-[0_15px_30px_rgba(56,189,248,0.45)] transition-all flex items-center gap-2 group"
              >
                <span>{isAr ? "ابدأ الفك والتفعيل الآن" : "Start Unlocking Now"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform`} />
              </Link>

              <Link
                href={`/${lang}/pricing`}
                className="px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-sky-400/40 transition-all flex items-center gap-2"
              >
                <i className="fas fa-list-alt text-sky-400 text-xs" />
                <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View Price List"}</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div
              className="rounded-xl sm:rounded-2xl p-2.5 sm:p-3 lg:p-4 grid grid-cols-3 gap-1.5 sm:gap-3 text-center shadow-lg border border-white/10 bg-[#0e172a]/40 backdrop-blur-md"
              data-aos="fade-right"
              data-aos-delay="500"
            >
              <div className="space-y-0.5">
                <span className="text-base sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 font-mono">
                  +100K
                </span>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium">{isAr ? "طلب منجز" : "Orders Done"}</p>
              </div>
              <div className="space-y-0.5 border-x border-white/10">
                <span className="text-base sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                  99.9%
                </span>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium">{isAr ? "نسبة النجاح" : "Success Rate"}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-base sm:text-xl lg:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 font-mono">
                  24/7
                </span>
                <p className="text-[10px] sm:text-xs text-slate-300 font-medium">{isAr ? "دعم متواصل" : "Always Online"}</p>
              </div>
            </div>

          </div>

          {/* Column 2: Cockpit Glass Card (5 Cols on desktop) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0b1426]/50 backdrop-blur-md border border-sky-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_30px_rgba(56,189,248,0.12)] p-3 sm:p-4 lg:p-6 flex flex-col gap-3 lg:gap-4 z-10">

              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                  <span className="text-[11px] sm:text-xs font-mono text-slate-300 font-bold ms-1.5">ATP-SERVER // NODE-01</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] sm:text-[11px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <span>ONLINE</span>
                  </div>
                  <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono">9ms</span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 py-1 px-2 rounded-xl bg-[#0e172a]/50 backdrop-blur-sm border border-white/10 text-center">
                <div>
                  <span className="block text-[10px] text-slate-400">{isAr ? "تسليم فوري" : "Instant API"}</span>
                  <span className="text-xs font-bold text-sky-400">1-5 Mins</span>
                </div>
                <div className="border-x border-white/10">
                  <span className="block text-[10px] text-slate-400">{isAr ? "ضمان الاسترجاع" : "Protection"}</span>
                  <span className="text-xs font-bold text-emerald-400">100%</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">{isAr ? "الخدمات المدعومة" : "GSM Services"}</span>
                  <span className="text-xs font-bold text-amber-300">+500</span>
                </div>
              </div>

              {/* Service Matrix */}
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3">

                {/* Card 1: UnlockTool */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#111c30]/40 backdrop-blur-sm border border-white/10 hover:border-sky-400/40 transition-colors group/item flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center text-xs sm:text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-bolt" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[11px] sm:text-xs font-bold text-white truncate group-hover/item:text-sky-300 transition-colors">
                      UnlockTool
                    </h2>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {isAr ? "تفعيل سنوي" : "Annual License"}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0 hidden sm:block">
                    {isAr ? "تلقائي" : "AUTO"}
                  </span>
                </div>

                {/* Card 2: Chimera */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#111c30]/40 backdrop-blur-sm border border-white/10 hover:border-amber-400/40 transition-colors group/item flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-xs sm:text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-tools" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[11px] sm:text-xs font-bold text-white truncate group-hover/item:text-amber-300 transition-colors">
                      Chimera Tool
                    </h2>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {isAr ? "أرصدة رسمية" : "Official Credits"}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-full border border-sky-500/20 shrink-0 hidden sm:block">
                    {isAr ? "موزع" : "DIST"}
                  </span>
                </div>

                {/* Card 3: iCloud */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#111c30]/40 backdrop-blur-sm border border-white/10 hover:border-indigo-400/40 transition-colors group/item flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center text-xs sm:text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-mobile-alt" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[11px] sm:text-xs font-bold text-white truncate group-hover/item:text-indigo-300 transition-colors">
                      iCloud Bypass
                    </h2>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {isAr ? "مكالمات كاملة" : "Full Signal"}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0 hidden sm:block">
                    {isAr ? "جاهز" : "READY"}
                  </span>
                </div>

                {/* Card 4: Borneo */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-[#111c30]/40 backdrop-blur-sm border border-white/10 hover:border-emerald-400/40 transition-colors group/item flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-xs sm:text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-microchip" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-[11px] sm:text-xs font-bold text-white truncate group-hover/item:text-emerald-300 transition-colors">
                      Borneo Schematics
                    </h2>
                    <span className="text-[10px] text-slate-400 truncate block">
                      {isAr ? "مخططات يومية" : "Daily Bitmaps"}
                    </span>
                  </div>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20 shrink-0 hidden sm:block">
                    {isAr ? "فوري" : "LIVE"}
                  </span>
                </div>

              </div>

              {/* Live Footer */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping shrink-0" />
                  <span className="font-medium text-slate-300 truncate">
                    {isAr ? "تحديث وتفعيل تلقائي متواصل عبر الـ API" : "Live auto activations via API"}
                  </span>
                </div>
                <span className="font-mono text-sky-400 font-bold shrink-0 ms-2">100% LIVE</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
