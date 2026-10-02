"use client";

import React from "react";
import Link from "next/link";
import { 
  Gamepad2, 
  Store, 
  Tv, 
  Globe2, 
  Zap, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Flame, 
  CheckCircle2, 
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface GamingShowcaseSectionProps {
  lang: string;
}

export default function GamingShowcaseSection({ lang }: GamingShowcaseSectionProps) {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const categories = [
    {
      id: "topups",
      titleAr: "شحن الألعاب المباشر",
      titleEn: "Direct In-Game Top-Up",
      descAr: "شحن فوري عبر الآيدي لأشهر الألعاب العالمية مثل ببجي وفري فاير وكول أوف ديوتي وفالورانت.",
      descEn: "Instant direct ID top-up for PUBG Mobile, Free Fire, Call of Duty, Valorant, and more.",
      icon: Gamepad2,
      accentColor: "from-purple-500/20 via-indigo-500/10 to-transparent",
      badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
      buttonColor: "bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/25",
      badgeTextAr: "شحن فوري بالـ ID",
      badgeTextEn: "Instant Player ID Top-Up",
      highlightPills: ["PUBG Mobile", "Free Fire", "Valorant", "Roblox", "COD"],
      href: `/${lang}/gaming?tab=topups`,
    },
    {
      id: "appStores",
      titleAr: "بطاقات ومتاجر التطبيقات",
      titleEn: "App Stores & Gift Cards",
      descAr: "بطاقات رقمية أصلية 100% لمتاجر جوجل بلاي، أبل آيتونز، بلايستيشن، إكس بوكس، وستيم.",
      descEn: "100% genuine vouchers for Google Play, Apple iTunes, PlayStation, Xbox, and Steam.",
      icon: Store,
      accentColor: "from-amber-500/20 via-orange-500/10 to-transparent",
      badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
      buttonColor: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/25",
      badgeTextAr: "أكواد تسليم لحظي",
      badgeTextEn: "Instant Digital Vouchers",
      highlightPills: ["Google Play", "Apple iTunes", "PlayStation", "Xbox", "Steam"],
      href: `/${lang}/gaming?tab=appStores`,
    },
    {
      id: "subscriptions",
      titleAr: "الاشتراكات والترفيه",
      titleEn: "Digital Subscriptions",
      descAr: "تفعيل اشتراكات منصات البث الرقمي والترفيه مثل شاهد نت، تيليجرام بريميوم، وخدمات VIP.",
      descEn: "Official activations for Telegram Premium, Shahid VIP, Netflix, and entertainment platforms.",
      icon: Tv,
      accentColor: "from-rose-500/20 via-pink-500/10 to-transparent",
      badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
      buttonColor: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25",
      badgeTextAr: "تفعيل رسمي معتمد",
      badgeTextEn: "Official VIP Subscriptions",
      highlightPills: ["Telegram Premium", "Shahid VIP", "Netflix", "Discord Nitro"],
      href: `/${lang}/gaming?tab=subscriptions`,
    },
    {
      id: "esim",
      titleAr: "شرائح الإنترنت الدولية eSIM",
      titleEn: "Global Travel eSIMs",
      descAr: "باقات إنترنت سريعة تعمل في أكثر من 150 دولة بدون تغيير الشريحة الفعلية مع تفعيل فوري.",
      descEn: "High-speed travel internet data packages across 150+ countries with zero physical SIM hassle.",
      icon: Globe2,
      accentColor: "from-cyan-500/20 via-blue-500/10 to-transparent",
      badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
      buttonColor: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-600/25",
      badgeTextAr: "تغطية عالمية فورية",
      badgeTextEn: "Global Coverage 150+ Countries",
      highlightPills: ["تركيا", "أوروبا", "الولايات المتحدة", "الخليج العربي", "آسيا"],
      href: `/${lang}/gaming?tab=esim`,
    },
  ];

  const features = [
    {
      titleAr: "تسليم فوري وتلقائي 24/7",
      titleEn: "Instant 24/7 Automated Delivery",
      descAr: "ربط سيرفر API مباشر مع كبرى المنصات يضمن وصول الأكواد والشحن في ثوانٍ معدودة.",
      descEn: "Direct API connections ensure in-game top-up and codes deliver within seconds.",
    },
    {
      titleAr: "أسعار الجملة المعتمدة للموزعين",
      titleEn: "Authorized Wholesale Reseller Pricing",
      descAr: "هوامش ربح منافسة وخصومات حصرية لحسابات الـ VIP ومحلات السوفت وير والألعاب.",
      descEn: "Highly competitive margins and exclusive VIP discounts for resellers and store owners.",
    },
    {
      titleAr: "خصم مباشر من رصيد المحفظة",
      titleEn: "Direct Wallet Balance Payments",
      descAr: "ادفع بكل سلاسة من رصيد حسابك المسبق بدون أي رسوم معالجة بنكية إضافية.",
      descEn: "Seamless checkout directly from your prepaid wallet balance with zero hidden fees.",
    },
  ];

  return (
    <section className="relative w-full overflow-hidden rounded-3xl border border-slate-200 dark:border-white/10 bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
      {/* Background Ambient Lighting */}
      <div className="absolute top-0 right-1/4 -z-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-80 w-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

      {/* Header & Badges */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/25 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold shadow-xs">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>{isAr ? "قسم جديد متاح الآن عبر السيرفر الرسمي" : "New Dedicated Category Now Live"}</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
          {isAr ? "عالمنا للألعاب وشحن البطاقات والخدمات الرقمية" : "Our World of Gaming, Digital Vouchers & Top-Ups"}
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-medium">
          {isAr
            ? "منصة متكاملة لشحن ألعابك المفضلة، اقتناء بطاقات المتاجر والهدايا العالمية، وتفعيل الاشتراكات الترفيهية وشرائح الإنترنت الدولية بأفضل أسعار الجملة مع تسليم تلقائي فوري 100%."
            : "All-in-one portal for direct in-game recharge, genuine store gift cards, media subscriptions, and global travel eSIMs at wholesale rates with instant delivery."}
        </p>

        {/* Primary CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href={`/${lang}/gaming`}
            className="inline-flex items-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Gamepad2 className="w-5 h-5" />
            <span>{isAr ? "استكشف عالم الألعاب والخدمات الرقمية" : "Explore Gaming & Digital Services"}</span>
            <ArrowIcon className="w-4 h-4" />
          </Link>

          <Link
            href={`/${lang}/pricing`}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl bg-slate-200/80 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-bold text-sm sm:text-base border border-slate-300 dark:border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isAr ? "قائمة الأسعار والخدمات" : "Price List"}</span>
          </Link>
        </div>
      </div>

      {/* 4 Pillars Category Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
        {categories.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div
              key={cat.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] p-6 hover:border-purple-500/50 hover:bg-white dark:hover:bg-white/[0.06] transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5"
            >
              <div className="space-y-4">
                {/* Header Badge & Icon */}
                <div className="flex items-center justify-between gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${cat.badgeColor}`}>
                    {isAr ? cat.badgeTextAr : cat.badgeTextEn}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {isAr ? cat.titleAr : cat.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {isAr ? cat.descAr : cat.descEn}
                  </p>
                </div>

                {/* Highlight Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {cat.highlightPills.map((pill) => (
                    <span
                      key={pill}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/5"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                <Link
                  href={cat.href}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-purple-600 text-slate-800 hover:text-white dark:bg-white/5 dark:hover:bg-purple-600 dark:text-slate-200 dark:hover:text-white font-bold text-xs sm:text-sm transition-all shadow-xs group-hover:shadow-md"
                >
                  <span>{isAr ? "طلب الخدمة الآن" : "Order Now"}</span>
                  <ArrowIcon className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature Value Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200 dark:border-white/10">
        {features.map((feat, index) => (
          <div key={index} className="flex items-start gap-3 p-4 rounded-2xl bg-white/40 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {isAr ? feat.titleAr : feat.titleEn}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-snug">
                {isAr ? feat.descAr : feat.descEn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
