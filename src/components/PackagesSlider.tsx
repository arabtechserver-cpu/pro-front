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
      id: "chimera",
      groupName: "Chimera Tool - Direct Source Services",
      nameAr: "باقة تفعيل وسيرفر أداة شيميرا (Chimera)",
      nameEn: "Chimera Tool Pro & Samsung Activations",
      badgeAr: "الأكثر طلباً",
      badgeEn: "Most Popular",
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
      badgeAr: "تخطي بشبكة كاملة",
      badgeEn: "Full Cellular Signal",
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
      id: "borneo",
      groupName: "Borneo Schematic 1 Month / 3 Month / 6 Months / - Direct Source Services",
      nameAr: "باقة اشتراكات ومخططات بورنيو (Borneo)",
      nameEn: "Borneo Schematics Official Licenses",
      badgeAr: "الأكثر طلباً للفنيين",
      badgeEn: "Technician Top Pick",
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
      id: "xiaomi",
      groupName: "Xiaomi Remove Account - Direct Source Services",
      nameAr: "باقة حذف وتخطي حسابات شاومي الرسمية",
      nameEn: "Xiaomi Mi Account Official Removal",
      badgeAr: "سيرفر رسمي مباشر",
      badgeEn: "Direct Server Source",
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
      badgeAr: "سعر يبدأ من أقل من $1",
      badgeEn: "Starts Under $1",
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

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        if (isAr) handlePrev();
        else handleNext();
      } else {
        if (isAr) handleNext();
        else handlePrev();
      }
    }
  };

  const visibleItems = [
    packages[currentIndex % total],
    packages[(currentIndex + 1) % total],
    packages[(currentIndex + 2) % total],
  ];

  return (
    <section
      className="relative py-14 sm:py-20 bg-transparent overflow-hidden touch-pan-y section-spotlight"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      data-aos="fade-up"
      suppressHydrationWarning
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full cyber-container relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-14 gap-6 lamp-header">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
              <i className="fas fa-layer-group text-blue-400"></i>
              <span>{isAr ? "باقات وخدمات السيرفر المباشرة" : "Live Catalog & Service Packages"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              {isAr ? "تصفح باقات الخدمات " : "Explore Featured "}
              <span className="text-blue-400">
                {isAr ? "والتفعيلات الحصرية" : "Service Packages"}
              </span>
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
              {isAr
                ? "باقات وتفعيلات مستخرجة مباشرة من قائمة الأسعار مع تسليم تلقائي وأسعار جملة مخفضة."
                : "Live packages and tool activations directly from our pricing catalog with automated 24/7 delivery."}
            </p>
          </div>

          {/* Controls: Slider Arrows */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrev}
              aria-label={isAr ? "الباقة السابقة" : "Previous Package"}
              className="w-10 h-10 rounded-xl bg-[#111622] border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#1a2233] hover:text-white hover:border-blue-500/40 transition-all shadow-sm active:scale-95"
            >
              <i className={`fas ${isAr ? "fa-arrow-right" : "fa-arrow-left"} text-sm`}></i>
            </button>
            <button
              onClick={handleNext}
              aria-label={isAr ? "الباقة التالية" : "Next Package"}
              className="w-10 h-10 rounded-xl bg-[#111622] border border-white/10 text-slate-300 flex items-center justify-center hover:bg-[#1a2233] hover:text-white hover:border-blue-500/40 transition-all shadow-sm active:scale-95"
            >
              <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-sm`}></i>
            </button>
          </div>
        </div>

        {/* The Responsive Slider Container */}
        <div className="relative pt-8 sm:pt-10 pb-4">
          {/* Mobile Swipe Cue */}
          <div className="md:hidden flex items-center justify-center gap-2 mb-3 text-xs text-slate-400 font-medium select-none pointer-events-none">
            <span className="text-sm">‹‹</span>
            <span>{isAr ? "اسحب للتنقل بين الباقات" : "Swipe left or right to explore packages"}</span>
            <span className="text-sm">››</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 transition-all duration-500">
            {visibleItems.map((pkg, idx) => (
              <div
                key={`${pkg.id}-${currentIndex}-${idx}`}
                className={`relative rounded-2xl p-6 sm:p-7 lamp-card !overflow-visible shadow-xl transition-all duration-200 group hover:-translate-y-1 flex flex-col justify-between ${
                  idx === 1 ? "hidden md:flex" : idx === 2 ? "hidden lg:flex" : "flex"
                }`}
              >
                {/* Popular / Promo Badge */}
                {(pkg.badgeAr || pkg.badgeEn) && (
                  <div className="absolute -top-3.5 right-6 sm:right-7 rtl:right-auto rtl:left-6 sm:rtl:left-7 z-30 bg-gradient-to-r from-amber-500/25 to-amber-600/25 text-amber-300 border border-amber-400/40 text-xs font-bold px-3.5 py-1 rounded-full shadow-lg shadow-amber-950/40 flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
                    <i className="fas fa-crown text-[10px] text-amber-400"></i>
                    <span>{isAr ? pkg.badgeAr : pkg.badgeEn}</span>
                  </div>
                )}

                <div>
                  {/* Category & Icon */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      <i className={pkg.icon}></i>
                      <span>{isAr ? pkg.categoryAr : pkg.categoryEn}</span>
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium">
                      <i className="fas fa-clock text-slate-400"></i>
                      <span>{pkg.deliveryTime}</span>
                    </span>
                  </div>

                  {/* Title & Starting Price */}
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors leading-tight">
                        {isAr ? pkg.nameAr : pkg.nameEn}
                      </h3>
                      <span className="block text-xs text-slate-400 mt-1 line-clamp-1">
                        {pkg.groupName}
                      </span>
                    </div>

                    <div className="text-right shrink-0 rtl:text-left">
                      <span className="text-[11px] text-slate-400 block font-medium">
                        {isAr ? "يبدأ من" : "Starts at"}
                      </span>
                      <span className="text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">
                        {pkg.startingPrice}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-white/10 my-5"></div>

                  {/* Feature / Included Services Checklist */}
                  <ul className="space-y-2.5 mb-7">
                    {(isAr ? pkg.servicesAr : pkg.servicesEn).map((srv, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5 border border-emerald-500/20">
                          <i className="fas fa-check"></i>
                        </span>
                        <span className="line-clamp-1">{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Call to Action Button */}
                <div className="space-y-2.5">
                  <Link
                    href={`/${lang}/pricing?section=${encodeURIComponent(pkg.groupName)}`}
                    className="btn-royal w-full py-3 px-5 font-bold text-sm text-center flex items-center justify-center gap-2 group shadow-md shadow-blue-900/30"
                  >
                    <span>{isAr ? "اطلب الآن وابدأ التفعيل" : "Order & Activate Now"}</span>
                    <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
                  </Link>

                  <p className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                    <i className="fas fa-shield-alt text-[10px] text-slate-400"></i>
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
              className={`h-2 rounded-full transition-all duration-300 active:scale-90 ${
                idx === currentIndex % total
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-slate-700 hover:bg-slate-600"
              }`}
            />
          ))}
        </div>

        {/* View All Pricing Catalog Link */}
        <div className="text-center mt-10">
          <Link
            href={`/${lang}/pricing`}
            className="btn-dark-pill px-8 sm:px-10 py-3.5 sm:py-4 font-bold text-sm sm:text-base gap-2.5 group shadow-md"
          >
            <span>{isAr ? "استعراض كافة الباقات والخدمات المتوفرة (أكثر من 500+ خدمة)" : "Explore All Packages & Services (500+)"}</span>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-sm transition-transform group-hover:-translate-x-1`}></i>
          </Link>
        </div>

      </div>
    </section>
  );
}
