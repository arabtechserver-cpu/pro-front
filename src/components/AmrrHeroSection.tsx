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
    <section className="relative w-full bg-gradient-to-br from-[#0d1525] via-[#09101c] to-[#060a12] rounded-2xl sm:rounded-3xl border border-sky-500/25 shadow-[0_15px_45px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.12)] mb-6 sm:mb-8 overflow-hidden">
      {/* High-Tech Cyber Grid Pattern */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none"
        aria-hidden="true"
      />

      {/* Responsive Cyber Ambient Lighting — Fluid, GPU-accelerated, zero overflow on mobile */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-3xl" aria-hidden="true">
        <div className="absolute -top-12 -left-12 sm:-top-24 sm:-left-24 w-52 h-52 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-blue-500/20 blur-2xl sm:blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-72 sm:h-72 rounded-full bg-sky-400/12 blur-2xl sm:blur-3xl" />
        <div className="absolute -bottom-12 -right-12 sm:-bottom-24 sm:-right-24 w-52 h-52 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full bg-indigo-600/20 blur-2xl sm:blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-8 lg:p-12 xl:p-14 gap-8 lg:gap-12">
        
        {/* Left Column: Typography, Actions & Quick Stats */}
        <div className="flex-1 max-w-2xl w-full text-center lg:text-start">
          {/* Live Status Pill */}
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/15 via-sky-500/15 to-transparent px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-sky-400/35 mb-4 sm:mb-5 shadow-sm max-w-full"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
            </span>
            <span className="text-sky-300 font-bold text-[11px] sm:text-xs md:text-sm tracking-wide truncate">
              {isAr ? "السيرفر الرسمي المعتمد لخدمات السوفت وير والأجهزة 24/7" : "Premier GSM & Software Unlock Server 24/7"}
            </span>
          </div>

          {/* Dynamic Heading */}
          <div className="space-y-1 mb-4 sm:mb-6" data-aos="fade-right" data-aos-delay="200">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight tracking-tight">
              <span className="block text-white drop-shadow-sm">
                {isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server"}
              </span>
              <span className="block text-slate-100 font-extrabold text-xl sm:text-3xl lg:text-4xl xl:text-5xl mt-1 sm:mt-1.5">
                {isAr ? "إدارة وتفعيل شامل لكافة" : "Complete Control Over"}
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent mt-1 sm:mt-1.5">
                {isAr ? "الهواتف والأجهزة الذكية" : "All Mobile Devices"}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-xl mb-6 sm:mb-8 mx-auto lg:mx-0"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            {isAr ? (
              <>
                منصة <strong className="text-white font-bold">عرب تك برو سيرفر</strong> — بوابتك المتكاملة لفك الشفرات، تخطي الحسابات، وتفعيل البوكسات والدونجل مع{" "}
                <span className="text-sky-400 font-semibold">تسليم تلقائي فوري</span>،{" "}
                <span className="text-emerald-400 font-semibold">حماية مشفرة 100%</span>، و{" "}
                <span className="text-cyan-300 font-semibold">دعم فني متخصص على مدار الساعة</span>.
              </>
            ) : (
              <>
                Arab Tech Pro Server: Professional unlocking, activations, and tool credit top-ups with{" "}
                <span className="text-sky-400 font-semibold">instant automated delivery</span>,{" "}
                <span className="text-emerald-400 font-semibold">100% secure checkout</span>, and{" "}
                <span className="text-cyan-300 font-semibold">24/7 dedicated GSM engineering support</span>.
              </>
            )}
          </p>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 w-full sm:w-auto justify-center lg:justify-start"
            data-aos="fade-right"
            data-aos-delay="400"
          >
            <Link
              href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
              className="btn-purple-glow w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 group shadow-lg shadow-blue-900/40"
            >
              <i className="fas fa-bolt text-yellow-300 text-sm sm:text-base group-hover:scale-110 transition-transform" />
              <span>
                {isAr
                  ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن")
                  : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}
              </span>
              <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`} />
            </Link>

            <Link
              href={`/${lang}/pricing`}
              className="btn-dark-pill w-full sm:w-auto px-5 sm:px-7 py-3 sm:py-3.5 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 group"
            >
              <i className="fas fa-server text-sky-400 text-sm" />
              <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View All Services"}</span>
            </Link>
          </div>

          {/* Quick Stats Grid */}
          <div
            className="lamp-card rounded-xl sm:rounded-2xl p-3 sm:p-4 grid grid-cols-3 gap-2 sm:gap-4 text-center shadow-lg border border-white/10"
            data-aos="fade-right"
            data-aos-delay="500"
          >
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-sky-400 tracking-tight">+100K</div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "طلب منجز" : "Orders Completed"}</div>
            </div>

            <div className="flex flex-col items-center border-x border-white/10 px-1 sm:px-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">99.9%</div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "نسبة النجاح" : "Success Rate"}</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 tracking-tight">24/7</div>
              <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "دعم متواصل" : "Live Support"}</div>
            </div>
          </div>
        </div>

        {/* Right Column: Cyber Service Matrix & Live Cockpit Showcase */}
        <div 
          className="flex-1 w-full max-w-xl flex flex-col items-center justify-center relative"
          data-aos="fade-left"
          data-aos-delay="300"
        >
          {/* Ambient Glow behind Cockpit */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
            <div className="w-56 sm:w-80 lg:w-96 h-56 sm:h-80 lg:h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-sky-400/15 to-indigo-500/15 blur-2xl sm:blur-3xl animate-pulse" />
          </div>

          {/* Main Cockpit Glass Widget */}
          <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0b1220]/90 backdrop-blur-xl border border-sky-400/30 shadow-[0_20px_50px_rgba(0,0,0,0.7),0_0_30px_rgba(56,189,248,0.12)] p-4 sm:p-6 flex flex-col gap-3.5 sm:gap-4 z-10">
            
            {/* Terminal Window Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
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

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 py-1 px-2 rounded-xl bg-[#0e172a]/70 border border-white/5 text-center">
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

            {/* 2x2 Service Activation Matrix (Clean, symmetrical, never cramped on mobile) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              
              {/* Card 1: UnlockTool */}
              <div className="p-3 rounded-xl bg-[#111c30]/80 border border-white/10 hover:border-sky-400/40 transition-colors group/item flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-400/30 flex items-center justify-center text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-bolt" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-sky-300 transition-colors">
                      UnlockTool Digital
                    </h2>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {isAr ? "تفعيل سنوي وشبه سنوي" : "3, 6, 12 Month License"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  {isAr ? "تلقائي" : "AUTO"}
                </span>
              </div>

              {/* Card 2: Chimera Tool */}
              <div className="p-3 rounded-xl bg-[#111c30]/80 border border-white/10 hover:border-sky-400/40 transition-colors group/item flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-tools" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-amber-300 transition-colors">
                      Chimera Tool
                    </h2>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {isAr ? "أرصدة وتراخيص رسمية" : "Server Credits & License"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20 shrink-0">
                  {isAr ? "موزع" : "RESELLER"}
                </span>
              </div>

              {/* Card 3: iCloud & FRP */}
              <div className="p-3 rounded-xl bg-[#111c30]/80 border border-white/10 hover:border-sky-400/40 transition-colors group/item flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-mobile-alt" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-indigo-300 transition-colors">
                      iCloud Bypass
                    </h2>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {isAr ? "تشغيل مكالمات كامل" : "Full Cellular Signal"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  {isAr ? "جاهز" : "READY"}
                </span>
              </div>

              {/* Card 4: Borneo Schematics */}
              <div className="p-3 rounded-xl bg-[#111c30]/80 border border-white/10 hover:border-sky-400/40 transition-colors group/item flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center justify-center text-sm shrink-0 group-hover/item:scale-105 transition-transform">
                    <i className="fas fa-microchip" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs sm:text-sm font-bold text-white truncate group-hover/item:text-emerald-300 transition-colors">
                      Borneo Schematics
                    </h2>
                    <span className="text-[11px] text-slate-400 truncate block">
                      {isAr ? "مخططات صيانة يومية" : "Daily Hardware Bitmaps"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 shrink-0">
                  {isAr ? "فوري" : "INSTANT"}
                </span>
              </div>

            </div>

            {/* Live Activity Feed Footer */}
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
    </section>
  );
}
