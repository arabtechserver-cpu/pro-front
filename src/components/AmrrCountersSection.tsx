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
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left / Main Headline Side */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start" data-aos="fade-right" suppressHydrationWarning>
            
            {/* Status & Sync Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-5">
              <div className="inline-flex items-center gap-2 bg-[#0B0F17] border border-white/10 px-3.5 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-slate-300 font-semibold text-xs tracking-wider">ONLINE</span>
              </div>

              <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <i className="fas fa-sync text-blue-400 text-xs"></i>
                <span>{isAr ? "تحديث سيرفرات لحظي • 24/7" : "Live Real-Time Sync • 24/7"}</span>
              </div>
            </div>

            {/* Title with Overhead Lamp */}
            <div className="relative">
              <div className="absolute -top-6 left-1/2 lg:left-0 -translate-x-1/2 lg:translate-x-0 w-48 h-16 bg-blue-500/15 rounded-full blur-xl pointer-events-none"></div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 leading-tight tracking-tight">
                <span className="text-slate-100">
                  {isAr ? "مرحباً بك في " : "Welcome to "}
                </span>
                <span className="text-blue-400 inline-block mx-1">
                  {isAr ? "عرب تك برو" : "Arab Tech Pro"}
                </span>
                <br />
                <span className="text-slate-300 block mt-2 text-xl sm:text-2xl lg:text-3xl font-bold">
                  {isAr ? "المنظومة الذكية لفك وتفعيل الأجهزة" : "Next-Gen Phone Unlocking & Services"}
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-base text-slate-400 mb-6 max-w-xl leading-relaxed">
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
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                  <i className="fas fa-lock-open"></i>
                </div>
                <span>{isAr ? "فك وتفعيل فوري" : "Instant Unlock"}</span>
              </div>

              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xs">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span>{isAr ? "حماية وتشفير SSL" : "SSL Encrypted"}</span>
              </div>

              <div className="bg-[#0B0F17] border border-white/10 text-slate-300 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-xl flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 text-xs">
                  <i className="fas fa-globe"></i>
                </div>
                <span>{isAr ? "خدمة لجميع دول العالم" : "Worldwide 150+"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-royal px-7 sm:px-9 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-3 group shadow-lg shadow-blue-900/30"
              >
                <i className="fas fa-bolt text-amber-300 group-hover:scale-105 transition-transform"></i>
                <span>{isAr ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن") : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </Link>

              <Link
                href={`/${lang}/pricing`}
                className="btn-dark-pill px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 group"
              >
                <i className="fas fa-list-alt text-sky-400"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات والأسعار" : "View Services & Prices"}</span>
              </Link>
            </div>

          </div>

          {/* Right Side: 3 Clean Metric Cards with Lamp Spotlight */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 w-full">
            
            {/* Card 1: Supported Phone Models */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-mobile-alt"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    +{counts.devices}
                  </span>
                  <span className="text-blue-400 text-xs font-semibold uppercase tracking-wider">Models</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "موديل وطراز هاتف مدعوم" : "Supported device models"}
                </p>
                <span className="text-[11px] text-slate-400 font-normal">
                  {isAr ? "Samsung, Apple, Xiaomi, Huawei & More" : "All global brands & chipsets"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-blue-400 transition-colors"></i>
            </div>

            {/* Card 2: New Services Monthly */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-cog"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    +{counts.services}
                  </span>
                  <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Updates</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "خدمة وتحديث جديد شهرياً" : "New services monthly"}
                </p>
                <span className="text-[11px] text-slate-400 font-normal">
                  {isAr ? "أدوات السوفت وير وتحديثات السيرفرات" : "Box activations & server credits"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-emerald-400 transition-colors"></i>
            </div>

            {/* Card 3: 24/7 Automated Delivery & Live Support */}
            <div
              className="lamp-card group rounded-xl sm:rounded-2xl p-4 sm:p-5 flex items-center gap-4 sm:gap-5 transition-all duration-200 shadow-sm"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xl sm:text-2xl shrink-0 transition-colors">
                <i className="fas fa-user-clock"></i>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    24/7
                  </span>
                  <span className="text-amber-400 text-xs font-semibold uppercase tracking-wider">Always ON</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-semibold truncate">
                  {isAr ? "تسليم آلي ودعم فني مستمر" : "Online delivery & support"}
                </p>
                <span className="text-[11px] text-slate-400 font-normal">
                  {isAr ? "تيليجرام • واتساب • ذكاء اصطناعي" : "Telegram • WhatsApp • AI Engine"}
                </span>
              </div>

              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-600 group-hover:text-amber-400 transition-colors"></i>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
