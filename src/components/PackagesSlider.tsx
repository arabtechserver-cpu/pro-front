"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface PackagesSliderProps {
  lang: string;
}

interface RealPricingPackage {
  id: string;
  groupName: string;
  nameAr: string;
  nameEn: string;
  badgeAr?: string;
  badgeEn?: string;
  isPopular?: boolean;
  startingPrice: string;
  categoryAr: string;
  categoryEn: string;
  deliveryTime: string;
  icon: string;
  servicesAr: string[];
  servicesEn: string[];
}

export default function PackagesSlider({ lang }: PackagesSliderProps) {
  const isAr = lang === "ar";
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Real Top Packages from /pricing catalog
  const packages: RealPricingPackage[] = [
    {
      id: "borneo",
      groupName: "Borneo Schematic 1 Month / 3 Month / 6 Months / - Direct Source Services",
      nameAr: "باقة اشتراكات ومخططات بورنيو (Borneo)",
      nameEn: "Borneo Schematics Official Licenses",
      badgeAr: "الأكثر طلباً للفنيين ⭐",
      badgeEn: "Technician Top Pick ⭐",
      isPopular: true,
      startingPrice: "$12.06",
      categoryAr: "تفعيل بوكسات ودونجل",
      categoryEn: "Server Activations",
      deliveryTime: "تسليم فوري - 24 ساعة",
      icon: "fas fa-microchip",
      servicesAr: [
        "Borneo Schematic 3 Months 1PC New Activation",
        "Borneo Schematic 6 Months 1PC License",
        "Borneo Schematic 1 Year 2PC Multi-Device",
        "تحديث يومي لمخططات هواتف iPhone & Android",
      ],
      servicesEn: [
        "Borneo Schematic 3 Months 1PC New Activation",
        "Borneo Schematic 6 Months 1PC License",
        "Borneo Schematic 1 Year 2PC Multi-Device",
        "Daily updated hardware schematics & PCB bitmaps",
      ],
    },
    {
      id: "chimera",
      groupName: "Chimera Tool - Direct Source Services",
      nameAr: "باقة تفعيل وسيرفر أداة شيميرا (Chimera)",
      nameEn: "Chimera Tool Pro & Samsung Activations",
      badgeAr: "موزع رسمي معتمد 🛡️",
      badgeEn: "Official Reseller 🛡️",
      isPopular: true,
      startingPrice: "$106.59",
      categoryAr: "أدوات السوفت وير الاحترافية",
      categoryEn: "Pro Software Tools",
      deliveryTime: "تفعيل فوري تلقائي 24/7",
      icon: "fas fa-tools",
      servicesAr: [
        "Chimera Tool Basic - 1 Year (100 Devices)",
        "Chimera Tool Samsung - 1 Year Unlimited",
        "Chimera Tool Pro - 1 Year All Brands Support",
        "فك شبكات وتصليح السيريال وإصلاح IMEI",
      ],
      servicesEn: [
        "Chimera Tool Basic - 1 Year (100 Devices)",
        "Chimera Tool Samsung - 1 Year Unlimited",
        "Chimera Tool Pro - 1 Year All Brands Support",
        "Instant unlock, repair IMEI, and patch certificate",
      ],
    },
    {
      id: "dft",
      groupName: "DFT PRO TOOL - Direct Source Services",
      nameAr: "باقة تفعيل أداة دي إف تي برو (DFT PRO)",
      nameEn: "DFT PRO Tool Licenses",
      badgeAr: "أقوى أداة لمعالجات شاومي",
      badgeEn: "Top Xiaomi & MTK Tool",
      startingPrice: "$78.98",
      categoryAr: "تفعيل أدوات السوفت وير",
      categoryEn: "Tool Activations",
      deliveryTime: "تسليم فوري تلقائي",
      icon: "fas fa-bolt",
      servicesAr: [
        "DFT PRO NEW USER 1 YEAR ACTIVATION",
        "DFT PRO RENEWAL 1 YEAR (تجديد سنوي)",
        "دعم كامل لمعالجات Qualcomm و MediaTek",
        "حذف حسابات Mi Account و FRP وتفليش أجهزة شاومي",
      ],
      servicesEn: [
        "DFT PRO NEW USER 1 YEAR ACTIVATION",
        "DFT PRO RENEWAL 1 YEAR Account Extension",
        "Full Qualcomm & MTK processor operations",
        "Remove Mi Account, FRP bypass, and safe flashing",
      ],
    },
    {
      id: "flashcell",
      groupName: "Flashcell Bypass Passcode Full Signal A12/A13 iOS26+",
      nameAr: "باقة تخطي آيكلود فلاش سيل (Flashcell Signal)",
      nameEn: "Flashcell Bypass Passcode Full Signal A12/A13",
      badgeAr: "تخطي بشبكة كاملة 📶",
      badgeEn: "Full Cellular Signal 📶",
      startingPrice: "$10.01",
      categoryAr: "خدمات فك الآيكلود",
      categoryEn: "iCloud Bypass Services",
      deliveryTime: "1 - 24 ساعة",
      icon: "fas fa-mobile-alt",
      servicesAr: [
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone XS / XS MAX",
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone 11",
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone 11 PRO / PRO MAX",
        "تشغيل الشبكة والمكالمات والـ 4G/5G بالكامل",
      ],
      servicesEn: [
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone XS / XS MAX",
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone 11",
        "PASSCODE A12/A13 (SIGNAL) USBLITER8 iPhone 11 PRO / PRO MAX",
        "Full cellular calls, FaceTime, iCloud & data enabled",
      ],
    },
    {
      id: "xiaomi",
      groupName: "Xiaomi Remove Account - Direct Source Services",
      nameAr: "باقة حذف وتخطي حسابات شاومي الرسمية",
      nameEn: "Xiaomi Mi Account Official Removal",
      badgeAr: "سيرفر رسمي مباشر ⚡",
      badgeEn: "Direct Server Source ⚡",
      startingPrice: "$3.41",
      categoryAr: "سيرفرات الـ IMEI الرسمية",
      categoryEn: "Official IMEI Server",
      deliveryTime: "1 - 12 ساعة",
      icon: "fas fa-unlock-alt",
      servicesAr: [
        "Xiaomi Mi Account Unlock Service Clean IMEI",
        "دعم الأجهزة من جميع دول العالم (Worldwide)",
        "حذف دائم من خوادم شركة شاومي الرسمية",
        "إمكانية إعادة ضبط المصنع والتحديث بأمان",
      ],
      servicesEn: [
        "Xiaomi Mi Account Unlock Service Clean IMEI",
        "Worldwide carrier & country lock removal",
        "Permanent clean removal from official Xiaomi cloud",
        "Safe to factory reset, flash, and update MIUI/HyperOS",
      ],
    },
    {
      id: "amt",
      groupName: "Android Multi Tool",
      nameAr: "باقة رصيد أداة أندرويد ملتي تول (AMT)",
      nameEn: "Android Multi Tool (AMT) Credits",
      badgeAr: "سعر يبدأ من أقل من $1 🔥",
      badgeEn: "Starts Under $1 🔥",
      startingPrice: "$0.92",
      categoryAr: "كردت أدوات السيرفر",
      categoryEn: "Tool Server Credits",
      deliveryTime: "تسليم آلي فوري 24/7",
      icon: "fas fa-wrench",
      servicesAr: [
        "Android Multi Tool AMT (VIVO - XIAOMI - TECNO)",
        "دعم هواتف INFINIX - ITEL - REALME - OPPO",
        "عمليات FRP - DEMO REMOVAL - FACTORY RESET",
        "شحن رصيد بالكريدت فوري لحسابك",
      ],
      servicesEn: [
        "Android Multi Tool AMT (VIVO - XIAOMI - TECNO)",
        "Full support for INFINIX, ITEL, REALME, OPPO",
        "Fast FRP, Demo remove, and factory reset actions",
        "Instant automated credit top-up to your AMT account",
      ],
    },
  ];

  const total = packages.length;

  // Continuous auto-sliding interval (moves automatically and continuously)
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % total);
    }, 4000); // Transitions every 4 seconds

    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  // Display EXACTLY 2 packages visible at a time
  const visibleItems = [
    packages[currentIndex % total],
    packages[(currentIndex + 1) % total],
  ];

  return (
    <section
      className="relative py-20 lg:py-28 bg-gradient-to-b from-slate-950 via-[#0a1122] to-slate-950 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      data-aos="fade-up"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-primary/10 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/25 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <i className="fas fa-layer-group text-primary"></i>
              <span>{isAr ? "باقات وخدمات السيرفر المباشرة" : "Live Catalog & Service Packages"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isAr ? "تصفح باقات الخدمات " : "Explore Featured "}
              <span className="bg-gradient-to-r from-primary via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                {isAr ? "والتفعيلات الحصرية" : "Service Packages"}
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl">
              {isAr
                ? "باقات وتفعيلات مستخرجة مباشرة من قائمة الأسعار مع تسليم تلقائي وأسعار جملة مخفضة."
                : "Live packages and tool activations directly from our pricing catalog with automated 24/7 delivery."}
            </p>
          </div>

          {/* Controls: Slider Arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              aria-label={isAr ? "الباقة السابقة" : "Previous Package"}
              className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/30 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all shadow-md active:scale-95"
            >
              <i className={`fas ${isAr ? "fa-arrow-right" : "fa-arrow-left"}`}></i>
            </button>
            <button
              onClick={handleNext}
              aria-label={isAr ? "الباقة التالية" : "Next Package"}
              className="w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/30 text-white flex items-center justify-center hover:bg-primary hover:text-black transition-all shadow-md active:scale-95"
            >
              <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"}`}></i>
            </button>
          </div>
        </div>

        {/* The 2-Card Visible Slider Container */}
        <div className="relative pt-6 pb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 transition-all duration-500">
            {visibleItems.map((pkg, idx) => (
              <div
                key={`${pkg.id}-${currentIndex}-${idx}`}
                className={`relative rounded-3xl p-8 lg:p-10 transition-all duration-500 flex flex-col justify-between ${
                  pkg.isPopular
                    ? "bg-gradient-to-b from-slate-900/90 to-slate-950/95 border-2 border-primary/60 shadow-[0_0_40px_rgba(87,241,219,0.2)]"
                    : "bg-slate-900/60 border border-slate-800 hover:border-slate-700 shadow-xl"
                } backdrop-blur-xl group hover:-translate-y-1.5`}
              >
                {/* Popular / Promo Badge */}
                {(pkg.badgeAr || pkg.badgeEn) && (
                  <div className="absolute -top-3.5 right-6 sm:right-8 rtl:right-auto rtl:left-6 sm:rtl:left-8 z-30 bg-gradient-to-r from-primary via-cyan-300 to-emerald-400 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full shadow-xl flex items-center gap-1.5 uppercase tracking-wide border border-white/20 whitespace-nowrap pointer-events-none">
                    <i className="fas fa-crown text-amber-950"></i>
                    <span>{isAr ? pkg.badgeAr : pkg.badgeEn}</span>
                  </div>
                )}

                <div>
                  {/* Category & Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-bold text-primary flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                      <i className={pkg.icon}></i>
                      <span>{isAr ? pkg.categoryAr : pkg.categoryEn}</span>
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <i className="fas fa-clock text-cyan-400"></i>
                      <span>{pkg.deliveryTime}</span>
                    </span>
                  </div>

                  {/* Title & Starting Price */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors leading-tight">
                        {isAr ? pkg.nameAr : pkg.nameEn}
                      </h3>
                      <span className="block text-xs text-slate-400 mt-1 line-clamp-1">
                        {pkg.groupName}
                      </span>
                    </div>

                    <div className="text-right shrink-0 rtl:text-left">
                      <span className="text-xs text-slate-400 block font-medium">
                        {isAr ? "يبدأ من" : "Starts at"}
                      </span>
                      <span className="text-3xl lg:text-4xl font-black text-emerald-400 tracking-tight">
                        {pkg.startingPrice}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-outline-variant/30 to-transparent my-6"></div>

                  {/* Feature / Included Services Checklist */}
                  <ul className="space-y-3 mb-8">
                    {(isAr ? pkg.servicesAr : pkg.servicesEn).map((srv, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-3 text-sm text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs shrink-0 mt-0.5 border border-emerald-500/30">
                          <i className="fas fa-check"></i>
                        </span>
                        <span className="line-clamp-1">{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Buttons Linking to /pricing */}
                <div className="space-y-3">
                  <Link
                    href={`/${lang}/pricing?section=${encodeURIComponent(pkg.groupName)}`}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-center flex items-center justify-center gap-2 transition-all ${
                      pkg.isPopular
                        ? "bg-primary text-slate-950 hover:bg-primary-container shadow-[0_0_25px_rgba(87,241,219,0.3)] hover:scale-[1.02]"
                        : "bg-surface-container border border-outline-variant/40 text-white hover:bg-surface-container-high hover:border-primary/50"
                    }`}
                  >
                    <span>{isAr ? "عرض خدمات وأسعار هذه الباقة" : "View Services & Live Prices"}</span>
                    <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs`}></i>
                  </Link>

                  <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
                    <i className="fas fa-shield-alt text-[10px] text-emerald-400"></i>
                    <span>{isAr ? "تنفيذ مؤتمت عبر الـ API مع استرجاع الرصيد في حال الفشل" : "Automated API delivery with refund guarantee"}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Indicator Dots */}
        <div className="flex justify-center items-center gap-2 mt-8">
          {packages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                idx === currentIndex % total
                  ? "w-8 bg-primary shadow-[0_0_10px_rgba(87,241,219,0.5)]"
                  : "w-2 bg-slate-700 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>

        {/* View All Pricing Catalog Link */}
        <div className="text-center mt-10">
          <Link
            href={`/${lang}/pricing`}
            className="inline-flex items-center gap-2 text-primary hover:text-cyan-300 font-bold text-sm sm:text-base transition-colors"
          >
            <span>{isAr ? "عرض جدول الأسعار الكامل لجميع الخدمات والبوكسات (Pricing)" : "View Complete Catalog & Price List"}</span>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-sm`}></i>
          </Link>
        </div>

      </div>
    </section>
  );
}
