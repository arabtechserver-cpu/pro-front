"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Zap,
  Wrench,
  Smartphone,
  Layers
} from "lucide-react";

interface PackagesSliderProps {
  lang: string;
}

interface PricingPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  subAr: string;
  subEn: string;
  badgeAr?: string;
  badgeEn?: string;
  isPopular?: boolean;
  startingPrice: string;
  categoryAr: string;
  categoryEn: string;
  deliveryTimeAr: string;
  deliveryTimeEn: string;
  icon: typeof Wrench;
  url: string;
  featuresAr: string[];
  featuresEn: string[];
}

export default function PackagesSlider({ lang }: PackagesSliderProps) {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const packages: PricingPackage[] = [
    {
      id: "xiaomi",
      nameAr: "باقة حذف وتخطي حسابات شاومي الرسمية",
      nameEn: "Xiaomi Mi Account Removal Service",
      subAr: "Xiaomi Remove Account - Direct Source Services",
      subEn: "Xiaomi Remove Account - Direct Source Services",
      badgeAr: "سيرفر رسمي مباشر",
      badgeEn: "Direct Server",
      startingPrice: "$3.41",
      categoryAr: "سيرفرات الـ IMEI الرسمية",
      categoryEn: "Official IMEI Server",
      deliveryTimeAr: "1 - 12 ساعة",
      deliveryTimeEn: "1 - 12 Hours",
      icon: Smartphone,
      url: `/${lang}/pricing?section=Xiaomi%20Remove%20Account`,
      featuresAr: [
        "حذف دائم ونظيف من سيرفر شاومي الرسمي (Clean IMEI)",
        "دعم الأجهزة من جميع دول العالم (Worldwide Support)",
        "إمكانية إعادة ضبط المصنع والتحديث بعد الحذف بأمان",
        "تنفيذ تلقائي عبر الـ API مع استرجاع الرصيد في حال الرفض"
      ],
      featuresEn: [
        "Permanent clean removal from official Xiaomi servers",
        "Worldwide device support across all regions",
        "Safe factory reset and OTA updates after completion",
        "Automated API execution with full refund protection"
      ]
    },
    {
      id: "amt",
      nameAr: "باقة رصيد أداة أندرويد ملتي تول (AMT)",
      nameEn: "Android Multi Tool (AMT) Credits",
      subAr: "Android Multi Tool - Official Server Credits",
      subEn: "Android Multi Tool - Official Server Credits",
      badgeAr: "سعر يبدأ من أقل من $1",
      badgeEn: "Starting under $1",
      startingPrice: "$0.92",
      categoryAr: "أرصدة أدوات السيرفر",
      categoryEn: "Server Tool Credits",
      deliveryTimeAr: "تسليم فوري 24/7",
      deliveryTimeEn: "Instant 24/7",
      icon: Zap,
      url: `/${lang}/pricing?section=Android%20Multi%20Tool`,
      featuresAr: [
        "دعم كامل لهواتف VIVO و XIAOMI و TECNO و INFINIX",
        "عمليات FRP وتخطي حسابات وحذف الديمو (Demo Removal)",
        "شحن فوري بالكريدت مباشرة إلى اسم المستخدم لحسابك",
        "لا يحتاج إلى بوكس أو دونجل خارجي للعمل"
      ],
      featuresEn: [
        "Full support for Vivo, Xiaomi, Tecno & Infinix",
        "One-click FRP bypass, factory reset, and demo removal",
        "Instant credit top-up directly to your username",
        "No hardware box or dongle required to run"
      ]
    },
    {
      id: "chimera",
      nameAr: "باقة تفعيل وسيرفر أداة شيميرا (Chimera)",
      nameEn: "Chimera Tool Pro & Samsung Activations",
      subAr: "Chimera Tool - Direct Source Services",
      subEn: "Chimera Tool - Direct Source Services",
      badgeAr: "الأكثر طلباً للمحترفين",
      badgeEn: "Most In-Demand",
      isPopular: true,
      startingPrice: "$106.59",
      categoryAr: "أدوات السوفت وير الاحترافية",
      categoryEn: "Pro Software Tools",
      deliveryTimeAr: "تفعيل فوري تلقائي 24/7",
      deliveryTimeEn: "Instant 24/7 Activation",
      icon: Wrench,
      url: `/${lang}/pricing?section=Chimera%20Tool`,
      featuresAr: [
        "تراخيص Chimera Basic و Samsung و All Brands Pro",
        "فك شبكات وتصليح السيريال وإصلاح IMEI وتعديل الموديل",
        "تفعيل رسمي مباشر على حساب المستخدم خلال دقيقة",
        "تحديثات متواصلة لدعم أحدث إصدارات الأندرويد"
      ],
      featuresEn: [
        "Chimera Basic, Samsung, and All Brands Pro licenses",
        "Carrier unlock, serial repair, and network patching",
        "Official 1-minute automated account activation",
        "Continuous support for latest Android security patches"
      ]
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? packages.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev === packages.length - 1 ? 0 : prev + 1));
  };

  return (
    <section className="w-full mb-10 sm:mb-14">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "الباقات والتفعيلات الأكثر طلباً" : "TOP FEATURED PACKAGES"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            <span>{isAr ? "تصفح باقات وتراخيص " : "Explore In-Demand "}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
              {isAr ? "السيرفر المعتمدة" : "Verified Server Packages"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl">
            {isAr
              ? "باقات مختارة ومحدثة مباشرة مع تسليم مؤتمت فورياً وأسعار جملة مخفضة لأصحاب المحلات والوكلاء."
              : "Hand-picked pro packages with automated instant API delivery and wholesale pricing for repair shops."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${lang}/pricing`}
            className="text-xs font-bold text-sky-400 hover:text-white px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-sky-400/40 transition-all flex items-center gap-1.5"
          >
            <span>{isAr ? "كافة الباقات (500+)" : "All Packages (500+)"}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => {
          const Icon = pkg.icon;
          return (
            <div
              key={pkg.id}
              className={`relative rounded-2xl sm:rounded-3xl p-6 sm:p-7 bg-[#090f1a]/80 backdrop-blur-xl border transition-all duration-300 flex flex-col justify-between shadow-xl group hover:-translate-y-1 ${
                pkg.isPopular 
                  ? "border-sky-400/40 hover:border-sky-400/70 shadow-sky-950/30" 
                  : "border-white/10 hover:border-white/25"
              }`}
            >
              {pkg.badgeAr && (
                <div className="absolute -top-3 start-6 z-20 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-400/40 text-[11px] font-bold text-amber-300 shadow-sm flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{isAr ? pkg.badgeAr : pkg.badgeEn}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-semibold text-sky-400 bg-sky-500/10 px-3 py-1 rounded-full border border-sky-500/20 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{isAr ? pkg.categoryAr : pkg.categoryEn}</span>
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{isAr ? pkg.deliveryTimeAr : pkg.deliveryTimeEn}</span>
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors leading-tight">
                      {isAr ? pkg.nameAr : pkg.nameEn}
                    </h3>
                    <span className="text-xs text-slate-400 block mt-1 line-clamp-1 font-mono">
                      {isAr ? pkg.subAr : pkg.subEn}
                    </span>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">{isAr ? "يبدأ من" : "From"}</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
                      {pkg.startingPrice}
                    </span>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10 my-4" />

                <ul className="space-y-2.5 mb-6">
                  {(isAr ? pkg.featuresAr : pkg.featuresEn).map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                      <span className="line-clamp-2 leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <Link
                  href={pkg.url}
                  className="btn-royal w-full py-3 px-5 font-bold text-xs sm:text-sm text-center flex items-center justify-center gap-2 group shadow-md shadow-blue-950/40"
                >
                  <span>{isAr ? "اطلب الآن وابدأ التفعيل" : "Order & Activate Now"}</span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                </Link>
                <p className="text-center text-[10px] text-slate-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>{isAr ? "تنفيذ مؤتمت عبر الـ API مع استرجاع الرصيد عند الفشل" : "Automated API with instant refund guarantee"}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
