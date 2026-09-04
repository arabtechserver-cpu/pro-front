"use client";

import React, { useEffect, useState, useRef } from "react";

interface AmrrCountersSectionProps {
  lang: string;
}

export default function AmrrCountersSection({ lang }: AmrrCountersSectionProps) {
  const isAr = lang === "ar";
  const [counts, setCounts] = useState({ devices: 0, services: 0 });
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Animate devices count to 1500
          let start1 = 0;
          const end1 = 1500;
          const step1 = end1 / 50;
          const timer1 = setInterval(() => {
            start1 += step1;
            if (start1 >= end1) {
              setCounts((prev) => ({ ...prev, devices: end1 }));
              clearInterval(timer1);
            } else {
              setCounts((prev) => ({ ...prev, devices: Math.floor(start1) }));
            }
          }, 30);

          // Animate services count to 500
          let start2 = 0;
          const end2 = 500;
          const step2 = end2 / 50;
          const timer2 = setInterval(() => {
            start2 += step2;
            if (start2 >= end2) {
              setCounts((prev) => ({ ...prev, services: end2 }));
              clearInterval(timer2);
            } else {
              setCounts((prev) => ({ ...prev, services: Math.floor(start2) }));
            }
          }, 30);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-8 sm:p-12 lg:p-16 border border-slate-700/60 shadow-2xl my-10 overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side: Headline and Badges */}
        <div data-aos="fade-right" data-aos-duration="800" suppressHydrationWarning>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-4 leading-snug">
            <span>{isAr ? "مرحباً بك في " : "Welcome to "}</span>
            <span className="bg-emerald-400 text-slate-950 px-3 py-0.5 rounded-lg shadow inline-block">
              {isAr ? "عرب تك برو" : "ArabTech Pro"}
            </span>
            <br />
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent block mt-2 text-xl sm:text-3xl font-bold">
              {isAr ? "الطريقة الذكية لفك وتفعيل الأجهزة" : "The Smart Way to Unlock"}
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-slate-300 mb-6 leading-relaxed">
            {isAr
              ? "منصة شاملة وموحدة لخدمات فك الشبكات (IMEI)، وتخطي FRP، وحذف iCloud، وشحن رصيد كافة السيرفرات. سريعة، موثوقة، وعن بعد."
              : "One platform for IMEI unlocks, FRP bypass, iCloud removal, and server credits. Fast. Trusted. Remote."}
          </p>

          <div className="flex flex-wrap gap-2.5 mb-6">
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-slate-200">
              <i className="fas fa-lock-open text-emerald-400"></i>
              <span>{isAr ? "فك وتفعيل فوري" : "Instant Unlock"}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-slate-200">
              <i className="fas fa-shield-alt text-emerald-400"></i>
              <span>{isAr ? "حماية وتشفير SSL" : "SSL Secured"}</span>
            </span>
            <span className="inline-flex items-center gap-2 text-xs sm:text-sm bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 text-slate-200">
              <i className="fas fa-globe text-emerald-400"></i>
              <span>{isAr ? "خدمة لجميع دول العالم" : "Worldwide Service"}</span>
            </span>
          </div>

          <div className="text-xs sm:text-sm flex items-center gap-2 text-slate-300 font-medium tracking-wide">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 online-blink"></span>
              <span>ONLINE</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              {isAr ? "تحديث تلقائي منذ دقيقة" : "Updated 1 min ago"}
            </span>
          </div>
        </div>

        {/* Right Side: 3 Interactive Counter Cards */}
        <div className="space-y-4">
          <div
            className="bg-slate-800/70 hover:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700/70 shadow-lg transition-all duration-300 hover:border-emerald-500/50 flex items-center gap-5"
            data-aos="fade-left"
            data-aos-delay="100"
            suppressHydrationWarning
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-emerald-400">
                {counts.devices}+
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-semibold">
                {isAr ? "موديل وطراز هاتف مدعوم" : "Supported device models"}
              </p>
            </div>
          </div>

          <div
            className="bg-slate-800/70 hover:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700/70 shadow-lg transition-all duration-300 hover:border-cyan-500/50 flex items-center gap-5"
            data-aos="fade-left"
            data-aos-delay="200"
            suppressHydrationWarning
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl shrink-0">
              <i className="fas fa-cog"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-cyan-400">
                {counts.services}+
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-semibold">
                {isAr ? "خدمة وتحديث جديد شهرياً" : "New services monthly"}
              </p>
            </div>
          </div>

          <div
            className="bg-slate-800/70 hover:bg-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700/70 shadow-lg transition-all duration-300 hover:border-purple-500/50 flex items-center gap-5"
            data-aos="fade-left"
            data-aos-delay="300"
            suppressHydrationWarning
          >
            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-2xl shrink-0">
              <i className="fas fa-user-clock"></i>
            </div>
            <div>
              <h3 className="text-3xl font-black text-purple-400">
                24/7
              </h3>
              <p className="text-slate-300 text-sm sm:text-base font-semibold">
                {isAr ? "تسليم آلي ودعم فني مستمر" : "Online delivery & support"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
