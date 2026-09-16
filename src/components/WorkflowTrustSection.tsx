"use client";

import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  Cpu, 
  Wallet, 
  RefreshCw, 
  Headphones,
  Check
} from "lucide-react";
import { Locale } from "@/i18n/config";

interface WorkflowTrustSectionProps {
  lang: Locale;
}

export default function WorkflowTrustSection({ lang }: WorkflowTrustSectionProps) {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const steps = [
    {
      step: "01",
      icon: Layers,
      accentColor: "sky",
      badgeAr: "الخطوة الأولى",
      badgeEn: "Step One",
      titleAr: "تحديد الخدمة أو نوع الأداة",
      titleEn: "Select Service or Tool",
      descAr: "تصفح أكثر من 1500 خدمة وسيرفر، تشمل فك شفرات IMEI، حذف حسابات FRP/iCloud، وتفعيل البوكسات والأدوات.",
      descEn: "Browse 1500+ services including IMEI unlock, FRP/iCloud bypass, and software tool activations.",
      tagsAr: ["فحص تلقائي للتوافق", "تحديثات يومية للأدوات", "أسعار الجملة المعتمدة"],
      tagsEn: ["Auto Model Check", "Daily Tool Updates", "Wholesale Rates"]
    },
    {
      step: "02",
      icon: Wallet,
      accentColor: "emerald",
      badgeAr: "الخطوة الثانية",
      badgeEn: "Step Two",
      titleAr: "شحن المحفظة والدفع الآمن",
      titleEn: "Secure Funding & Checkout",
      descAr: "شحن فوري وتلقائي للمحفظة عبر وسائل دفع مرنة، مع تشفير مصرفي كامل وضمان مالي 100% لاسترجاع الرصيد.",
      descEn: "Instant automated wallet funding via multi-gateways with 256-bit encryption and full refund protection.",
      tagsAr: ["شحن فوري 24/7", "تشفير بيانات عالي", "ضمان استرجاع تلقائي"],
      tagsEn: ["Instant 24/7 Credit", "256-bit Security", "Auto-Refund Guarantee"]
    },
    {
      step: "03",
      icon: Zap,
      accentColor: "amber",
      badgeAr: "الخطوة الثالثة",
      badgeEn: "Step Three",
      titleAr: "تنفيذ فوري واستلام التفعيل",
      titleEn: "Instant API Fulfillment",
      descAr: "معالجة آلية مباشرة عبر سيرفرات المصانع الرسمية خلال دقائق، مع إشعار بالبريد وتحديث فوري لحالة طلبك.",
      descEn: "Direct automated server processing in minutes, with instant notifications and live order tracking.",
      tagsAr: ["متوسط 1 - 5 دقائق", "ربط Direct API", "إشعار فوري بحالة الطلب"],
      tagsEn: ["Avg 1 - 5 Mins", "Direct API Sync", "Live Status Updates"]
    }
  ];

  const trustMetrics = [
    {
      value: "500K+",
      labelAr: "أجهزة وتفعيلات ناجحة",
      labelEn: "Successful Unlocks",
      subAr: "نسبة إتمام 99.8%",
      subEn: "99.8% Success Rate",
      icon: CheckCircle2,
      color: "text-emerald-400"
    },
    {
      value: "1 - 5 Mins",
      labelAr: "متوسط سرعة الإنجاز",
      labelEn: "Avg Delivery Time",
      subAr: "معالجة آلية بدون تدخل بشري",
      subEn: "Direct Automated Processing",
      icon: Clock,
      color: "text-amber-400"
    },
    {
      value: "100% REFUND",
      labelAr: "الضمان المالي الكامل",
      labelEn: "Financial Protection",
      subAr: "استرجاع فوري للطلبات المرفوضة",
      subEn: "Instant Return on Rejection",
      icon: ShieldCheck,
      color: "text-sky-400"
    },
    {
      value: "24/7 VIP",
      labelAr: "سيرفرات ودعم متواصل",
      labelEn: "Live Uptime & Support",
      subAr: "تيليجرام، واتساب، وتذاكر فنية",
      subEn: "Telegram, WhatsApp & Tickets",
      icon: Headphones,
      color: "text-cyan-400"
    }
  ];

  const supportedPlatforms = [
    "Apple", "Samsung", "Xiaomi", "Huawei", "OnePlus", "Oppo", "Vivo",
    "Qualcomm", "MediaTek MTK", "Unisoc", "UnlockTool", "Chimera", "Borneo", "Pandora"
  ];

  return (
    <section className="w-full relative">
      {/* Background Ambience & Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-[#090f1a]/85 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
        {/* Top Glow Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 sm:pb-10 border-b border-white/10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-400 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "منظومة مؤتمتة وسريعة • مسار التفعيل الفوري" : "Automated Pipeline • Fast-Track Execution"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {isAr ? "كيف تعمل المنصة؟ من الاختيار إلى التفعيل في 3 خطوات" : "How It Works: 3 Quick Steps from Selection to Activation"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {isAr
                ? "ارتباط سحابي مباشر مع خوادم المصانع الرسمية وشبكات الموزعين العالمية لمعالجة طلباتك آلياً دون أي تأخير."
                : "Direct cloud integration with factory unlock servers and official tool networks to execute your requests automatically."}
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              href={`/${lang}/pricing`}
              className="btn-royal py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-950/40 group"
            >
              <span>{isAr ? "ابدأ طلبك الآن" : "Start Your Order"}</span>
              <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 sm:pt-10">
          {steps.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl p-5 sm:p-6 bg-[#0c1322] border border-white/10 hover:border-sky-400/40 transition-all duration-300 flex flex-col justify-between group/step hover:shadow-xl hover:shadow-blue-950/30"
              >
                {/* Step Watermark Number */}
                <div className="absolute top-3 end-4 text-4xl sm:text-5xl font-black font-mono text-white/[0.04] pointer-events-none select-none group-hover/step:text-sky-400/10 transition-colors">
                  {item.step}
                </div>

                <div>
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-sky-400 group-hover/step:scale-110 group-hover/step:border-sky-400/50 transition-all shadow-inner">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/10 text-slate-300">
                      {isAr ? item.badgeAr : item.badgeEn}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <h3 className="text-base sm:text-lg font-bold text-white mb-2 group-hover/step:text-sky-300 transition-colors">
                    {isAr ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {isAr ? item.descAr : item.descEn}
                  </p>
                </div>

                {/* Feature Tags */}
                <div className="pt-3 border-t border-white/10 space-y-1.5">
                  {(isAr ? item.tagsAr : item.tagsEn).map((tag, tagIdx) => (
                    <div key={tagIdx} className="flex items-center gap-2 text-[11px] text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* 4 Micro Trust & Performance Stats Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-white/10">
          {trustMetrics.map((stat, idx) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#0b1220] border border-white/10 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] sm:text-xs text-slate-400 font-medium truncate">
                    {isAr ? stat.labelAr : stat.labelEn}
                  </span>
                  <StatIcon className={`w-4 h-4 ${stat.color} shrink-0`} />
                </div>
                <div>
                  <div className={`text-base sm:text-xl font-black font-mono tracking-tight ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                    {isAr ? stat.subAr : stat.subEn}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Brand & Tool Ecosystem Ticker */}
        <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 text-[11px] font-medium shrink-0">
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>{isAr ? "دعم وتوافق معتمد لأشهر الأنظمة والمعالجات:" : "Certified Ecosystem Compatibility:"}</span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 max-w-2xl">
            {supportedPlatforms.map((name, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-[#0e1628] border border-white/10 text-[10px] font-mono text-slate-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
