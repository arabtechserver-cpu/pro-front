"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";

interface AmrrCountersSectionProps {
  lang: string;
}

export default function AmrrCountersSection({ lang }: AmrrCountersSectionProps) {
  const isAr = lang === "ar";
  const [counts, setCounts] = useState({ devices: 0, services: 0 });
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          const end1 = 1500;
          const duration = 1500;
          const startTime = performance.now();

          let lastUpdate = 0;
          const animateCounts = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            if (currentTime - lastUpdate > 33 || progress === 1) {
              lastUpdate = currentTime;
              setCounts({
                devices: Math.floor(easeProgress * end1),
                services: Math.floor(easeProgress * 500),
              });
            }

            if (progress < 1) {
              requestAnimationFrame(animateCounts);
            } else {
              setCounts({ devices: end1, services: 500 });
            }
          };

          requestAnimationFrame(animateCounts);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative w-full my-6 sm:my-10 section-spotlight">
      <div
        ref={sectionRef}
        className="relative w-full rounded-2xl sm:rounded-3xl lamp-card text-white p-5 sm:p-8 lg:p-10 shadow-xl overflow-hidden"
      >
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-6 lg:gap-10 items-center">
          
          {/* Left / Main Headline Side */}
          <div className="col-span-1 md:col-span-6 lg:col-span-7 flex flex-col items-center md:items-start text-center md:text-start" data-aos="fade-right" suppressHydrationWarning>
            
            {/* Status & Sync Badge */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 mb-3.5 sm:mb-5">
              <div className="inline-flex items-center gap-2 bg-[#0B0F17] border border-white/10 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300 font-semibold text-xs tracking-wider">ONLINE</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-white/10">
                <i className="fas fa-sync text-blue-400 text-xs"></i>
                <span>{isAr ? "تحديث سيرفرات لحظي • 24/7" : "Live Real-Time Sync • 24/7"}</span>
              </div>
            </div>

            {/* Title with Overhead Lamp */}
            <div className="relative">
              <div className="absolute -top-6 left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 w-48 h-16 bg-blue-500/15 rounded-full blur-xl pointer-events-none"></div>
              <h2 className="text-xl sm:text-2xl md:text-xl lg:text-3xl xl:text-4xl font-black mb-2.5 sm:mb-3 leading-tight tracking-tight">
                <span className="text-slate-100">
                  {isAr ? "مرحباً بك في " : "Welcome to "}
                </span>
                <span className="text-blue-400 inline-block mx-1">
                  {isAr ? "عرب تك برو" : "Arab Tech Pro"}
                </span>
                <br />
                <span className="text-slate-300 block mt-1.5 sm:mt-2 text-lg sm:text-xl md:text-lg lg:text-2xl xl:text-3xl font-bold">
                  {isAr ? "المنظومة الذكية لفك وتفعيل الأجهزة" : "Next-Gen Phone Unlocking & Services"}
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm lg:text-base text-slate-400 mb-5 sm:mb-6 max-w-xl leading-relaxed">
              {isAr ? (
                <>
                  منصة <strong className="text-slate-200 font-semibold">عرب تك برو سيرفر (عرب تك)</strong>: المنظومة السحابية الموحدة لفك شفرات الشبكات (IMEI)، وتخطي FRP، وحذف حسابات iCloud، وشحن رصيد كافة السيرفرات والبوكسات فورياً وبأفضل أسعار الجملة.
                </>
              ) : (
                <>
                  Arab Tech Pro Server: One unified high-speed platform for IMEI unlocks, FRP bypass, iCloud removal, and server credits with automated instant delivery.
                </>
              )}
            </p>

            {/* Feature Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 sm:gap-2.5 lg:gap-3 mb-5 sm:mb-6 md:mb-5 lg:mb-8">
              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                  <i className="fas fa-lock-open"></i>
                </div>
                <span>{isAr ? "فك وتفعيل فوري" : "Instant Unlock"}</span>
              </div>

              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span>{isAr ? "حماية وتشفير SSL" : "SSL Encrypted"}</span>
              </div>

              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center gap-1.5 sm:gap-2">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                  <i className="fas fa-globe"></i>
                </div>
                <span>{isAr ? "خدمة لجميع دول العالم" : "Worldwide 150+"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2.5 sm:gap-3 w-full md:w-full lg:w-auto">
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-royal px-5 sm:px-8 md:px-5 lg:px-8 py-3 sm:py-3.5 md:py-3 lg:py-4 font-bold text-xs sm:text-sm lg:text-base flex items-center justify-center gap-2.5 group shadow-lg shadow-blue-900/30"
              >
                <i className="fas fa-bolt text-amber-300 group-hover:scale-105 transition-transform"></i>
                <span>{isAr ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن") : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </Link>

              <Link
                href={`/${lang}/pricing`}
                className="btn-dark-pill px-4 sm:px-6 md:px-4 lg:px-6 py-3 sm:py-3.5 md:py-3 lg:py-4 font-bold text-xs sm:text-sm lg:text-base flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-list-alt text-sky-400 text-sm"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات والأسعار" : "View Services & Prices"}</span>
              </Link>
            </div>

          </div>

          {/* Right Side: 3 Clean Metric Cards with Lamp Spotlight */}
          <div className="col-span-1 md:col-span-6 lg:col-span-5 flex flex-col gap-2.5 sm:gap-3 lg:gap-3.5 w-full">
            
            {/* Card 1: Supported Phone Models */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-3.5 lg:p-5 flex items-center gap-3 sm:gap-4 lg:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-11 md:h-11 lg:w-14 lg:h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-lg sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-mobile-alt"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl md:text-xl lg:text-3xl font-black text-white tracking-tight">
                    +{counts.devices}
                  </span>
                  <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Models</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "موديل وطراز هاتف مدعوم" : "Supported device models"}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate block">
                  {isAr ? "Samsung, Apple, Xiaomi, Huawei & More" : "All global brands & chipsets"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-blue-400 transition-colors shrink-0"></i>
            </div>

            {/* Card 2: New Services Monthly */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-3.5 lg:p-5 flex items-center gap-3 sm:gap-4 lg:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-11 md:h-11 lg:w-14 lg:h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-lg sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-cog"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl md:text-xl lg:text-3xl font-black text-white tracking-tight">
                    +{counts.services}
                  </span>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Updates</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "خدمة وتحديث جديد شهرياً" : "New services monthly"}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate block">
                  {isAr ? "أدوات السوفت وير وتحديثات السيرفرات" : "Box activations & server credits"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-emerald-400 transition-colors shrink-0"></i>
            </div>

            {/* Card 3: 24/7 Automated Delivery & Live Support */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-3.5 sm:p-4 md:p-3.5 lg:p-5 flex items-center gap-3 sm:gap-4 lg:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="w-11 h-11 sm:w-13 sm:h-13 md:w-11 md:h-11 lg:w-14 lg:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-lg sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-user-clock"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl sm:text-2xl md:text-xl lg:text-3xl font-black text-white tracking-tight">
                    24/7
                  </span>
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Always ON</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "تسليم آلي ودعم فني مستمر" : "Online delivery & support"}
                </p>
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal truncate block">
                  {isAr ? "تيليجرام • واتساب • ذكاء اصطناعي" : "Telegram • WhatsApp • AI Engine"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-amber-400 transition-colors shrink-0"></i>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
