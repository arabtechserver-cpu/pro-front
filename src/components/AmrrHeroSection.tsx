"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface AmrrHeroSectionProps {
  lang: string;
}

export default function AmrrHeroSection({ lang }: AmrrHeroSectionProps) {
  const isAr = lang === "ar";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  return (
    <section className="relative min-h-[580px] lg:min-h-[700px] curved-cockpit overflow-visible rounded-2xl sm:rounded-[2.75rem] border-y-2 sm:border-2 border-violet-500/30 shadow-2xl mb-8 animate-neon-border">
      {/* Curved Arched Cyber Horizon lines */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_20px_#8b5cf6] pointer-events-none"></div>
      <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none"></div>

      {/* Dynamic Background Grid & Glows (Contained in inner boundary) */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-[2.75rem] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-600/15 via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 sm:-top-32 sm:-left-32 w-72 sm:w-96 h-72 sm:h-96 bg-violet-600/15 rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute -bottom-24 -right-24 sm:-bottom-32 sm:-right-32 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/12 rounded-full blur-[80px] sm:blur-[120px]"></div>
        <div className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent shadow-[0_0_15px_#8b5cf6] animate-laser-scan"></div>
      </div>

      {/* Vertical Cyber Light Beams (Desktop only to keep mobile 100% fluid) */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-[2.75rem]">
        <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-violet-500/10 to-transparent">
          <div className="w-full h-36 bg-gradient-to-b from-transparent via-violet-400 to-transparent shadow-[0_0_15px_#8b5cf6] animate-vertical-stream-1 will-change-transform"></div>
        </div>
        <div className="absolute right-[20%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_18px_#22d3ee] animate-vertical-stream-2 will-change-transform"></div>
        </div>
        <div className="absolute right-[45%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-fuchsia-500/10 to-transparent">
          <div className="w-full h-28 bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent shadow-[0_0_12px_#e879f9] animate-vertical-stream-3 will-change-transform"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center h-full p-4 sm:p-8 lg:p-14 gap-8 lg:gap-8">
        
        {/* Left Side - Hero Content */}
        <div className="flex-1 max-w-2xl w-full text-center lg:text-start">
          {/* Status Badge */}
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500/20 via-purple-500/15 to-cyan-500/20 backdrop-blur-md px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border border-violet-400/40 mb-4 sm:mb-6 shadow-[0_4px_20px_rgba(139,92,246,0.3)]"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-violet-400 animate-ping"></span>
            <span className="text-violet-200 font-bold text-xs sm:text-sm tracking-wider">
              {isAr ? "أفضل سيرفر لخدمات السوفت وير والأجهزة" : "Premier GSM & Software Unlock Server"}
            </span>
          </div>

          {/* Main Heading */}
          <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6" data-aos="fade-right" data-aos-delay="200">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
              <span className="block text-white">
                {isAr ? "عرب تك برو سيرفر | تك" : "Arab Tech Pro Server"}
              </span>
              <span className="block text-white font-black text-2xl sm:text-4xl lg:text-5xl mt-1">
                {isAr ? "وتحكم في" : "Complete Control Over"}
              </span>
              <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_2px_25px_rgba(139,92,246,0.6)] mt-1">
                {isAr ? "كافة الهواتف والأجهزة" : "All Mobile Devices"}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-base lg:text-lg text-slate-100 font-medium leading-relaxed max-w-xl mb-6 sm:mb-8 mx-auto lg:mx-0"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            {isAr ? (
              <>
                منصة <strong className="text-white font-bold underline decoration-violet-500/40 underline-offset-4">عرب تك برو سيرفر</strong> — بوابتك المتكاملة لفك الشفرات، تخطي الحسابات، وشحن رصيد كافة البوكسات والدونجل والسيرفرات مع{" "}
                <span className="text-violet-300 font-bold">تسليم فوري مؤتمت</span>،{" "}
                <span className="text-cyan-300 font-bold">حماية مشددة 100%</span>، و{" "}
                <span className="text-fuchsia-300 font-bold">دعم فني متواصل على مدار الساعة</span>.
              </>
            ) : (
              <>
                Arab Tech Pro Server: Professional unlocking and activations with{" "}
                <span className="text-violet-300 font-bold">instant delivery</span>,{" "}
                <span className="text-cyan-300 font-bold">100% security</span>, and{" "}
                <span className="text-fuchsia-300 font-bold">24/7 expert support</span>.
              </>
            )}
          </p>

          {/* Action Buttons Matching Reference */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto justify-center lg:justify-start"
            data-aos="fade-right"
            data-aos-delay="400"
          >
            <Link
              href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
              className="btn-purple-glow px-7 sm:px-9 py-3.5 sm:py-4 font-black text-sm sm:text-base flex items-center justify-center gap-2 group"
            >
              <i className="fas fa-bolt text-yellow-300 text-base group-hover:scale-110 transition-transform"></i>
              <span>
                {isAr
                  ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن")
                  : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}
              </span>
            </Link>

            <Link
              href={`/${lang}/pricing`}
              className="btn-dark-pill px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2 group"
            >
              <i className="fas fa-server text-cyan-400 group-hover:scale-110 transition-transform"></i>
              <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View All Services"}</span>
            </Link>
          </div>

          {/* Quick Stats 3-Grid Directly Below Buttons */}
          <div
            className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-violet-800/40 text-center"
            data-aos="fade-right"
            data-aos-delay="500"
          >
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-violet-400 drop-shadow-[0_0_12px_rgba(139,92,246,0.5)]">+100K</div>
              <div className="text-xs sm:text-sm text-slate-200 font-bold mt-0.5">{isAr ? "طلب منجز" : "Orders Completed"}</div>
            </div>

            <div className="flex flex-col items-center border-x border-violet-800/40 px-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]">99.9%</div>
              <div className="text-xs sm:text-sm text-slate-200 font-bold mt-0.5">{isAr ? "نسبة النجاح" : "Success Rate"}</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-fuchsia-400 drop-shadow-[0_0_12px_rgba(232,121,249,0.5)]">24/7</div>
              <div className="text-xs sm:text-sm text-slate-200 font-bold mt-0.5">{isAr ? "دعم فني متواصل" : "Continuous Support"}</div>
            </div>
          </div>
        </div>

        {/* Right Side - Futuristic Animated Orb & Orbiting Badges (Fluid Mobile Sizing) */}
        <div className="flex-1 w-full flex items-center justify-center relative min-h-[300px] sm:min-h-[380px] lg:min-h-[440px]">
          <div
            className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center"
            data-aos="fade-left"
            data-aos-delay="300"
          >
            {/* Outer Rotating Glowing Dashed Ring */}
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-400/35 animate-spin-slow pointer-events-none will-change-transform"></div>

            {/* Inner Counter-Rotating Gradient Ring */}
            <div className="absolute inset-4 sm:inset-6 rounded-full border border-cyan-400/40 animate-spin-slow-reverse pointer-events-none will-change-transform"></div>

            {/* Ambient Radial Pulsing Glow */}
            <div className="absolute inset-8 sm:inset-10 bg-gradient-to-tr from-violet-600/25 via-fuchsia-500/20 to-cyan-500/20 rounded-full blur-xl sm:blur-2xl animate-pulse-glow pointer-events-none"></div>

            {/* Central 3D Cyber Holographic Orb Visual (Customized per Language) */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-violet-400/55 shadow-[0_0_50px_rgba(139,92,246,0.4)] flex items-center justify-center group bg-[#050814] cursor-pointer active:scale-95 transition-all duration-300">
              <picture className="w-full h-full">
                <source srcSet={isAr ? "/images/hero_cyber_ar.webp" : "/images/hero_cyber_en.webp"} type="image/webp" />
                <img
                  src={isAr ? "/images/hero_cyber_ar.jpg" : "/images/hero_cyber_en.jpg"}
                  alt={isAr ? "عرب تك برو سيرفر - عرب تك برو سيرفر" : "Arab Tech Pro Server"}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover rounded-full transform group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  // @ts-ignore
                  fetchPriority="high"
                />
              </picture>
              {/* Subtle glass reflection & bottom dark vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-white/10 pointer-events-none rounded-full"></div>

              {/* Holographic Official Logo Badge at bottom */}
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 bg-[#080b1c]/90 backdrop-blur-md px-2.5 sm:px-4 py-1 rounded-lg sm:rounded-xl border border-violet-400/40 flex items-center gap-1 shadow-lg max-w-[85%]">
                <picture>
                  <source srcSet={isAr ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                  <img
                    src={isAr ? "/images/logo_ar.png" : "/images/logo_en.png"}
                    alt="Arab Tech Logo"
                    width={110}
                    height={20}
                    className="h-3.5 sm:h-5 w-auto object-contain max-w-[110px]"
                  />
                </picture>
              </div>
            </div>

            {/* Orbiting Floating Badge 1 - Top Left (Positioned safely within screen bounds) */}
            <div className="absolute -top-2 left-0 sm:-left-4 bg-[#050814]/95 backdrop-blur-md border-2 border-violet-500/60 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(139,92,246,0.4)] flex items-center gap-2.5 animate-float will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500/25 text-violet-300 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-bolt animate-pulse"></i>
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                  {isAr ? "تسليم تلقائي" : "Instant Delivery"}
                </span>
                <span className="block text-[11px] sm:text-xs text-violet-200 font-semibold whitespace-nowrap">
                  {isAr ? "خلال 1-5 دقائق" : "1 - 5 mins"}
                </span>
              </div>
            </div>

            {/* Orbiting Floating Badge 2 - Bottom Right */}
            <div className="absolute -bottom-2 right-0 sm:-right-4 bg-[#050814]/95 backdrop-blur-md border-2 border-cyan-500/60 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(34,211,238,0.35)] flex items-center gap-2.5 animate-float-delayed will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/25 text-cyan-300 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-shield-alt animate-pulse"></i>
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                  {isAr ? "حماية مشفرة" : "100% Secure"}
                </span>
                <span className="block text-[11px] sm:text-xs text-cyan-200 font-semibold whitespace-nowrap">
                  {isAr ? "خوادم معتمدة" : "Verified servers"}
                </span>
              </div>
            </div>

            {/* Orbiting Floating Badge 3 - Bottom Left */}
            <div className="absolute bottom-4 -left-1 sm:-left-6 bg-[#050814]/95 backdrop-blur-md border-2 border-fuchsia-500/60 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(232,121,249,0.35)] flex items-center gap-2.5 animate-float will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-fuchsia-500/25 text-fuchsia-300 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-globe animate-spin-slow"></i>
              </div>
              <div>
                <span className="block text-xs sm:text-sm font-bold text-white whitespace-nowrap">
                  {isAr ? "150+ دولة" : "Global Reach"}
                </span>
                <span className="block text-[11px] sm:text-xs text-fuchsia-200 font-semibold whitespace-nowrap">
                  {isAr ? "كل الشبكات" : "All carriers"}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
