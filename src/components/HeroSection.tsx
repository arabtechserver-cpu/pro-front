"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Cloud,
  Lock,
  Flame,
  ShoppingCart,
  ShieldCheck,
  Headphones,
  UserPlus,
  Wrench,
  PhoneCall,
  Phone
} from "lucide-react";

interface HeroSectionProps {
  lang: string;
  config?: {
    liveTag?: string;
    title1?: string;
    title2?: string;
    lead?: string;
    btnBrowse?: string;
    btnBrowseUrl?: string;
    btnJoin?: string;
    btnJoinUrl?: string;
  };
}

export default function HeroSection({ lang, config }: HeroSectionProps) {
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
    <section className="relative w-full overflow-hidden pt-2 sm:pt-6 pb-6 sm:pb-10 mb-8 sm:mb-12">
      {/* Background Ambience & Cyber Grid */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_0%,rgba(0,229,255,0.08),transparent_70%)] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 cyber-container">
        {/* User-Uploaded Custom Hero Banner with Interactive Action Hotspots */}
        <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-cyan-500/30 shadow-md dark:shadow-2xl dark:shadow-cyan-950/40 group mb-6 sm:mb-8 bg-slate-100 dark:bg-[#040a14]">
          <div className="relative w-full aspect-[2/1] sm:aspect-[1024/377] select-none">
            <Image
              src="/images/hero_banner_custom.png"
              alt="Arab Tech Pro Server - كل ما تحتاجه لإدارة أعمال الـ GSM في مكان واحد"
              fill
              priority
              className="w-full h-full object-cover object-left sm:object-contain sm:object-center"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 1400px"
            />

            {/* Clickable Action Hotspots mapped precisely to buttons in the banner (Desktop only for mouse precision) */}
            {/* 1. Primary CTA: إبدأ الآن */}
            <Link
              href={config?.btnJoinUrl || (isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`)}
              className="hidden sm:block absolute left-[8.2%] top-[63.6%] w-[12.8%] h-[11.2%] rounded-xl z-20 cursor-pointer hover:ring-2 hover:ring-emerald-400/90 transition-all"
              title={isAr ? "إبدأ الآن" : "Start Now"}
            />

            {/* 2. Secondary CTA: عرض الخدمات */}
            <Link
              href={config?.btnBrowseUrl || `/${lang}/pricing`}
              className="hidden sm:block absolute left-[22.2%] top-[63.6%] w-[13.0%] h-[11.2%] rounded-xl z-20 cursor-pointer hover:ring-2 hover:ring-cyan-400/90 transition-all"
              title={isAr ? "عرض الخدمات" : "View Services"}
            />
          </div>
        </div>

        {/* Mobile-Only: 1. Hero Stats Strip */}
        <div className="sm:hidden w-full rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 p-2.5 mb-3 flex items-center justify-around shadow-sm text-center">
          <div className="flex items-center gap-1.5">
            <ShoppingCart className="w-3.5 h-3.5 text-sky-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">500K+</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{isAr ? "طلب" : "Orders"}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">99.8%</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{isAr ? "نجاح" : "Success"}</span>
          </div>
          <div className="h-4 w-[1px] bg-slate-200 dark:bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-xs font-black text-slate-900 dark:text-white font-mono">24/7</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">{isAr ? "دعم" : "Support"}</span>
          </div>
        </div>

        {/* Mobile-Only: 2. Dual Big Action Buttons */}
        <div className="sm:hidden grid grid-cols-2 gap-2.5 mb-3">
          <Link
            href={config?.btnJoinUrl || (isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`)}
            className="w-full py-2.5 px-3 rounded-xl bg-[#00d084] hover:bg-[#00b975] text-[#052216] font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#052216]" />
            <span>{config?.btnJoin || (isAr ? "أنشئ حساب الآن" : "Create Account Now")}</span>
          </Link>
          <Link
            href={config?.btnBrowseUrl || `/${lang}/pricing`}
            className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-[#061224] border border-sky-400 dark:border-cyan-500/50 text-sky-600 dark:text-cyan-300 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-98 transition-all"
          >
            <Wrench className="w-3.5 h-3.5 text-sky-500 dark:text-cyan-400" />
            <span>{config?.btnBrowse || (isAr ? "استعرض الخدمات" : "Browse Services")}</span>
          </Link>
        </div>

        {/* Mobile-Only: 3. Amber Notice Alert Banner */}
        <Link
          href={`/${lang}/pricing`}
          className="sm:hidden w-full rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/30 p-2.5 mb-5 flex items-center justify-between gap-2.5 shadow-sm hover:border-amber-400 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div className="min-w-0 text-start">
              <div className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                {isAr ? "خدمات جديدة متاحة الآن" : "New Services Available Now"}
              </div>
              <div className="text-[10px] text-amber-700 dark:text-amber-300/80 font-medium truncate">
                {isAr ? "اكتشف أحدث الأدوات والخدمات" : "Discover the latest tools & services"}
              </div>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-amber-100/60 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4" />
          </div>
        </Link>

        {/* Quick Tools & Live API Bar (Desktop / Tablet) */}
        <div className="hidden sm:flex w-full rounded-2xl bg-white/90 dark:bg-[#061122]/90 border border-slate-200 dark:border-cyan-500/20 p-2.5 sm:p-4 backdrop-blur-xl flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 shadow-sm dark:shadow-2xl">
          {/* Quick Tools Buttons with smooth horizontal scroll on mobile */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scrollbar-none py-0.5">
            <Link 
              href={`/${lang}/pricing?search=UnlockTool`} 
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0b1b33] border border-slate-200 dark:border-white/10 hover:border-orange-500/50 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#102445] transition-all shrink-0"
            >
              <span className="w-4.5 h-4.5 rounded-full bg-orange-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                <Lock className="w-2.5 h-2.5" />
              </span>
              <span>UnlockTool</span>
            </Link>

            <Link 
              href={`/${lang}/pricing?search=Chimera`} 
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0b1b33] border border-slate-200 dark:border-white/10 hover:border-amber-500/50 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#102445] transition-all shrink-0"
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
              <span>Chimera Tool</span>
            </Link>

            <Link 
              href={`/${lang}/pricing?search=iCloud`} 
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0b1b33] border border-slate-200 dark:border-white/10 hover:border-sky-500/50 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#102445] transition-all shrink-0"
            >
              <Cloud className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400 shrink-0" />
              <span>iCloud Bypass</span>
            </Link>

            <Link 
              href={`/${lang}/pricing?search=Borneo`} 
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0b1b33] border border-slate-200 dark:border-white/10 hover:border-red-500/50 text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 hover:bg-slate-200 dark:hover:bg-[#102445] transition-all shrink-0"
            >
              <span className="w-4.5 h-4.5 rounded bg-red-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                B
              </span>
              <span>Borneo Schematics</span>
            </Link>
          </div>

          {/* Right Side: LIVE API & Header Description */}
          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              <div className="leading-tight">
                <div className="font-mono text-[10px] sm:text-[11px] text-slate-900 dark:text-white font-bold">LIVE API</div>
                <div className="text-[8px] sm:text-[9px] text-emerald-600 dark:text-emerald-300 font-normal">
                  {isAr ? "جميع السيرفرات تعمل الآن" : "All servers active"}
                </div>
              </div>
            </div>

            <div className="text-end">
              <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {isAr ? "خدمات سريعة ومباشرة" : "Direct Fast Services"}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
