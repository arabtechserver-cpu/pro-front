"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight, 
  Zap, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Cpu, 
  Smartphone, 
  LockOpen, 
  Clock 
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
  const [activeNodePing, setActiveNodePing] = useState(9);

  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}

    const interval = setInterval(() => {
      setActiveNodePing(Math.floor(7 + Math.random() * 5));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="relative w-full rounded-2xl sm:rounded-3xl bg-[#090e17]/80 border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden p-5 sm:p-8 lg:p-12 mb-8 sm:mb-12">
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.18),transparent_70%)] pointer-events-none" 
        aria-hidden="true" 
      />
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" 
        aria-hidden="true" 
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 flex flex-col gap-4 sm:gap-6 text-start">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold w-fit shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>
              {config?.liveTag || (isAr ? "السيرفر الرسمي المعتمد لخدمات السوفت وير والأجهزة 24/7" : "Official Authorized GSM & Software Server 24/7")}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.18]">
              <span>{config?.title1 || (isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server")}</span>
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
                {config?.title2 || (isAr ? "إدارة وتفعيل شامل لكافة الهواتف والأجهزة الذكية" : "Comprehensive Mobile Unlocking & Server Ecosystem")}
              </span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
            {config?.lead || (isAr
              ? "منصة عرب تك برو سيرفر هي بوابتك المعتمدة لفك شفرات الشبكات، تخطي حسابات آيكلود وFRP، وتفعيل جميع أدوات ودونجل السوفت وير فورياً وبأفضل أسعار الجملة المعتمدة للموزعين والمحلات."
              : "Arab Tech Pro Server is your certified gateway for official network unlocking, iCloud & FRP bypass, and instant tool activations at exclusive wholesale rates for repair shops and resellers worldwide.")}
          </p>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
            <Link
              href={config?.btnJoinUrl || (isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`)}
              className="btn-royal px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-blue-950/40 hover:shadow-blue-600/30 transition-all flex items-center gap-2.5 group"
            >
              <span>
                {config?.btnJoin || (isAr ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن") : (isLoggedIn ? "Order Unlock Now" : "Start Unlocking Now"))}
              </span>
              <ArrowIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
            </Link>

            <Link
              href={config?.btnBrowseUrl || `/${lang}/pricing`}
              className="px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl font-bold text-sm sm:text-base text-slate-200 bg-white/5 hover:bg-white/10 border border-white/15 hover:border-sky-400/40 transition-all flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-sky-400" />
              <span>{config?.btnBrowse || (isAr ? "عرض قائمة الأسعار والخدمات" : "Browse Price Catalog")}</span>
            </Link>
          </div>

          <div className="rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center border border-white/10 bg-[#0d1424]/60 backdrop-blur-md mt-2">
            <div className="space-y-1">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 font-mono">
                +100K
              </span>
              <p className="text-xs text-slate-300 font-medium">{isAr ? "طلب منجز" : "Orders Completed"}</p>
            </div>
            <div className="space-y-1 border-s sm:border-x border-white/10">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300 font-mono">
                99.9%
              </span>
              <p className="text-xs text-slate-300 font-medium">{isAr ? "نسبة النجاح" : "Success Rate"}</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 font-mono">
                +1500
              </span>
              <p className="text-xs text-slate-300 font-medium">{isAr ? "طراز مدعوم" : "Models Supported"}</p>
            </div>
            <div className="space-y-1 border-t sm:border-t-0 border-s border-white/10 pt-2 sm:pt-0">
              <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 font-mono">
                24/7
              </span>
              <p className="text-xs text-slate-300 font-medium">{isAr ? "تشغيل دائم" : "Live Uptime"}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 w-full">
          <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0c1322]/85 backdrop-blur-xl border border-sky-400/25 shadow-2xl p-4 sm:p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-xs font-mono text-slate-300 font-bold ms-1.5 tracking-wide">
                  ATP-NODE // 01-PRO
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </div>
                <span className="text-xs text-sky-400 font-mono font-semibold">{activeNodePing}ms</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-[#080d17]/80 border border-white/10 text-center">
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">{isAr ? "تسليم فوري" : "Instant"}</span>
                <span className="text-xs font-bold text-sky-400 font-mono">1-5 Mins</span>
              </div>
              <div className="border-x border-white/10">
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">{isAr ? "الضمان" : "Guarantee"}</span>
                <span className="text-xs font-bold text-emerald-400 font-mono">100% REFUND</span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400 uppercase tracking-wider">{isAr ? "الخدمات" : "Services"}</span>
                <span className="text-xs font-bold text-amber-300 font-mono">+500 LIVE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Link 
                href={`/${lang}/pricing`}
                className="p-3 rounded-xl bg-[#10192b]/60 hover:bg-[#15223a] border border-white/10 hover:border-sky-400/40 transition-all group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                    UnlockTool
                  </h2>
                  <span className="text-[10px] text-slate-400 truncate block">{isAr ? "تفعيل سنوي آلي" : "1 Year License"}</span>
                </div>
              </Link>

              <Link 
                href={`/${lang}/pricing`}
                className="p-3 rounded-xl bg-[#10192b]/60 hover:bg-[#15223a] border border-white/10 hover:border-amber-400/40 transition-all group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">
                    Chimera Tool
                  </h2>
                  <span className="text-[10px] text-slate-400 truncate block">{isAr ? "أرصدة رسمية فورية" : "Official Server Credits"}</span>
                </div>
              </Link>

              <Link 
                href={`/${lang}/pricing`}
                className="p-3 rounded-xl bg-[#10192b]/60 hover:bg-[#15223a] border border-white/10 hover:border-indigo-400/40 transition-all group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/15 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
                    iCloud Bypass
                  </h2>
                  <span className="text-[10px] text-slate-400 truncate block">{isAr ? "مكالمات وشبكة كاملة" : "Full Signal Bypass"}</span>
                </div>
              </Link>

              <Link 
                href={`/${lang}/pricing`}
                className="p-3 rounded-xl bg-[#10192b]/60 hover:bg-[#15223a] border border-white/10 hover:border-emerald-400/40 transition-all group flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-400/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <LockOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    Borneo Schematics
                  </h2>
                  <span className="text-[10px] text-slate-400 truncate block">{isAr ? "مخططات وهاردوير" : "Hardware Schematics"}</span>
                </div>
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-slate-300 text-xs truncate">
                  {isAr ? "تحديث وتفعيل تلقائي متواصل عبر Dhru Fusion & API" : "Automated API & Dhru Fusion Sync Active"}
                </span>
              </div>
              <span className="font-mono text-sky-400 font-bold shrink-0 ms-2">LIVE API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
