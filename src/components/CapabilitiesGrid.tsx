"use client";

import React from "react";
import { 
  Unlock, 
  Zap, 
  Wrench, 
  Headset, 
  Fingerprint, 
  Coins, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

interface CapabilitiesGridProps {
  lang: string;
}

export default function CapabilitiesGrid({ lang }: CapabilitiesGridProps) {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const capabilities = [
    {
      index: "01",
      icon: Unlock,
      tag: isAr ? "فك رسمي دائم" : "OFFICIAL UNLOCK",
      title: isAr ? "خدمات فك الشفرة والشبكات" : "Carrier Unlock Services",
      desc: isAr
        ? "فك شفرات الهواتف والشبكات المغلقة رسمياً لكافة الموديلات والشركات العالمية بأمان وتوافق تام."
        : "Official permanent network and carrier unlocking for global models and operators.",
      badge: isAr ? "تخطي شبكات وتشفير معتمد" : "Carrier & Network Bypass",
      href: `/${lang}/pricing?cat=imei`
    },
    {
      index: "02",
      icon: Zap,
      tag: isAr ? "سيرفرات فائقة السرعة" : "ULTRA-FAST BOOT",
      title: isAr ? "سيرفرات الـ Fastboot والتفليش" : "Fastboot Flashing Servers",
      desc: isAr
        ? "تفليش مباشر وسريع لأجهزة شاومي وأندرويد وتخطي الحسابات عبر وضع الفاست بوت السحابي."
        : "Fast Xiaomi and Android firmware flashing, bootloader unlocks, and account bypass.",
      badge: isAr ? "تفليش فوري ومباشر" : "Instant Cloud Flashing",
      href: `/${lang}/pricing?cat=server`
    },
    {
      index: "03",
      icon: Wrench,
      tag: isAr ? "تفعيلات وتراخيص" : "LICENSES & TOOLS",
      title: isAr ? "تفعيل أدوات السوفت وير" : "Software Tool Activations",
      desc: isAr
        ? "تفعيل وتجديد فوري لكافة بوكسات ودونجل السوفت وير (شيميرا، دي إف تي، باندورا، بورنيو)."
        : "Instant license activations for top software tools: Chimera, DFT Pro, Pandora, and Borneo.",
      badge: isAr ? "شيميرا • باندورا • DFT" : "Chimera • Pandora • DFT",
      href: `/${lang}/pricing?cat=server`
    },
    {
      index: "04",
      icon: Headset,
      tag: isAr ? "طاقم فني معتمد" : "24/7 LIVE SUPPORT",
      title: isAr ? "دعم فني وهندسي 24/7" : "24/7 Expert Support",
      desc: isAr
        ? "طاقم مهندسين وفنيين متخصصين متواجدين على مدار الساعة لتقديم الدعم الفني وحل مشاكل العمليات."
        : "Dedicated GSM engineers and specialists available around the clock via live chat and Telegram.",
      badge: isAr ? "دعم مباشر تيليجرام وشات" : "Telegram & Live Desk",
      href: `/${lang}/contact`
    },
    {
      index: "05",
      icon: Fingerprint,
      tag: isAr ? "فحص وتصليح السيريال" : "IMEI & SECURITY",
      title: isAr ? "خدمات الـ IMEI وتخطي FRP" : "IMEI & FRP Bypass",
      desc: isAr
        ? "فحص وتصليح السيريال نمبر، تخطي حماية جوجل FRP وحسابات الآيكلود بأعلى معدلات نجاح معتمدة."
        : "Official IMEI checks, serial repair, Google FRP bypass, and verified iCloud removal.",
      badge: isAr ? "FRP وتخطي آيكلود" : "FRP & iCloud Solutions",
      href: `/${lang}/pricing?cat=imei`
    },
    {
      index: "06",
      icon: Coins,
      tag: isAr ? "أرصدة وربط API" : "CREDITS & RESELLER API",
      title: isAr ? "السيرفرات والـ Credits" : "Server Credits & API",
      desc: isAr
        ? "شحن فوري وتلقائي لأرصدة الكريدت لكافة السيرفرات والأدوات مع ربط API متقدم للموزعين والوكلاء."
        : "Instant server credits top-up for all GSM tools with Dhru Fusion compatible API.",
      badge: isAr ? "شحن فوري آلي للموزعين" : "Instant Auto Top-Up",
      href: `/${lang}/pricing?cat=server`
    }
  ];

  return (
    <section className="w-full mb-10 sm:mb-14">
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-sky-400" />
          <span>{isAr ? "لماذا تختار منصة عرب تك برو؟" : "WHY ARAB TECH PRO SERVER?"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          <span>{isAr ? "منظومة متكاملة لخدمات " : "The Leading Architecture for "}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-300">
            {isAr ? "الـ GSM والسيرفرات الفورية" : "GSM & Instant Cloud Services"}
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2.5 max-w-xl mx-auto leading-relaxed">
          {isAr
            ? "تجربة هندسية متطورة تضمن لك أسرع زمن تنفيذ، أدوات فك وتفعيل معتمدة، وأعلى معايير الحماية والأمان المالي."
            : "High-performance GSM tools and instant cloud activations engineered with enterprise-grade speed and reliability."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {capabilities.map((cap) => {
          const Icon = cap.icon;
          return (
            <Link
              key={cap.index}
              href={cap.href}
              className="relative p-6 rounded-2xl bg-[#090f1a]/70 hover:bg-[#0e172a]/90 border border-white/10 hover:border-sky-400/40 backdrop-blur-xl shadow-lg transition-all duration-300 group flex flex-col justify-between overflow-hidden"
            >
              <div className="absolute top-0 inset-x-6 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent group-hover:via-sky-400 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-500" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs font-black text-sky-400/80 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-full">
                    {cap.index}
                  </span>
                </div>

                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-1">
                  {cap.tag}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-sky-300 transition-colors mb-2 leading-snug">
                  {cap.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {cap.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                <span className="text-[11px] font-medium text-slate-400 group-hover:text-sky-300 transition-colors">
                  {cap.badge}
                </span>
                <ArrowIcon className="w-3.5 h-3.5 text-sky-400 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
