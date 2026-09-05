import React from "react";
import Link from "next/link";

interface AmrrHeroSectionProps {
  lang: string;
}

export default function AmrrHeroSection({ lang }: AmrrHeroSectionProps) {
  const isAr = lang === "ar";

  return (
    <section className="relative min-h-[580px] lg:min-h-[700px] curved-cockpit overflow-visible rounded-2xl sm:rounded-[2.75rem] border-y-2 sm:border-2 border-cyan-500/30 shadow-2xl mb-8 animate-neon-border">
      {/* Curved Arched Cyber Horizon lines */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] pointer-events-none"></div>
      <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent shadow-[0_0_15px_#34d399] pointer-events-none"></div>

      {/* Dynamic Background Grid & Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none rounded-2xl sm:rounded-[2.75rem]"></div>
      <div className="absolute -top-24 -left-24 sm:-top-32 sm:-left-32 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 sm:-bottom-32 sm:-right-32 w-72 sm:w-96 h-72 sm:h-96 bg-purple-500/15 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

      {/* Laser Scanline */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-[2.75rem] pointer-events-none">
        <div className="hidden sm:block absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-laser-scan"></div>
      </div>

      {/* Vertical Cyber Light Beams (Desktop only to keep mobile 100% fluid) */}
      <div className="hidden sm:block absolute inset-0 pointer-events-none overflow-hidden rounded-2xl sm:rounded-[2.75rem]">
        <div className="absolute left-[15%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent">
          <div className="w-full h-36 bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-vertical-stream-1 will-change-transform"></div>
        </div>
        <div className="absolute right-[20%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/10 to-transparent">
          <div className="w-full h-44 bg-gradient-to-b from-transparent via-emerald-400 to-transparent shadow-[0_0_18px_#34d399] animate-vertical-stream-2 will-change-transform"></div>
        </div>
        <div className="absolute right-[45%] top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-purple-500/10 to-transparent">
          <div className="w-full h-28 bg-gradient-to-b from-transparent via-purple-400 to-transparent shadow-[0_0_12px_#c084fc] animate-vertical-stream-3 will-change-transform"></div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center h-full p-4 sm:p-8 lg:p-14 gap-8 lg:gap-8">
        
        {/* Left Side - Hero Content */}
        <div className="flex-1 max-w-2xl w-full text-center lg:text-start">
          {/* Status Badge */}
          <div
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full border border-emerald-400/40 mb-4 sm:mb-6 shadow-[0_4px_15px_rgba(52,211,153,0.25)]"
            data-aos="fade-right"
            data-aos-delay="100"
          >
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-emerald-300 font-bold text-xs sm:text-sm tracking-wider uppercase">
              {isAr ? "عرب تك برو سيرفر (عرب تيك) • Arab Tech Pro Server" : "Arab Tech Pro Server • Live 24/7"}
            </span>
          </div>

          {/* Main Heading (Responsive text sizes for small mobile screens) */}
          <div className="space-y-1 sm:space-y-2 mb-4 sm:mb-6" data-aos="fade-right" data-aos-delay="200">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-tight tracking-tight">
              <span className="block text-white">
                {isAr ? "عرب تك برو سيرفر | فك وتحكم في" : "Arab Tech Pro Server | Unlock"}
              </span>
              <span className="block bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(34,211,238,0.4)]">
                {isAr ? "كافة الهواتف والأجهزة" : "All Mobile Devices"}
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p
            className="text-xs sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-xl mb-6 sm:mb-8 mx-auto lg:mx-0"
            data-aos="fade-right"
            data-aos-delay="300"
          >
            {isAr ? (
              <>
                منصة <strong className="text-white font-bold">عرب تك برو سيرفر | Arab Tech Pro Server (عرب تيك سيرفر)</strong> — منظومة فك وتفعيل أجهزة الجيل القادم مع{" "}
                <span className="text-emerald-400 font-bold">تسليم تلقائي فوري</span>،{" "}
                <span className="text-cyan-400 font-bold">تغطية عالمية</span>، و{" "}
                <span className="text-purple-400 font-bold">دعم فني متخصص على مدار الساعة</span>.
              </>
            ) : (
              <>
                Revolutionary unlocking technology with{" "}
                <span className="text-emerald-400 font-semibold">instant delivery</span>,{" "}
                <span className="text-cyan-400 font-semibold">global reach</span>, and{" "}
                <span className="text-purple-400 font-semibold">24/7 expert support</span>.
              </>
            )}
          </p>

          {/* Action Buttons (Full width on mobile for easy tapping) */}
          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto justify-center lg:justify-start"
            data-aos="fade-right"
            data-aos-delay="400"
          >
            <Link
              href={`/${lang}/register`}
              className="convex-pill group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 px-6 sm:px-8 py-3.5 sm:py-4 font-black text-sm sm:text-base shadow-xl flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer pointer-events-none"></div>
              <i className="fas fa-rocket text-base sm:text-lg group-hover:rotate-12 transition-transform animate-thruster"></i>
              <span>{isAr ? "ابدأ الفك والاشتراك الآن" : "Start Unlocking Now"}</span>
            </Link>

            <Link
              href={`/${lang}/pricing`}
              className="convex-pill group bg-slate-900/85 hover:bg-slate-800 border-2 border-white/20 hover:border-cyan-400 text-white px-6 sm:px-8 py-3.5 sm:py-4 font-bold text-sm sm:text-base flex items-center justify-center gap-2"
            >
              <i className="fas fa-eye text-cyan-400 group-hover:scale-110 transition-transform"></i>
              <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View All Services"}</span>
            </Link>
          </div>

          {/* Quick Stats 3-Grid (Neat 3-column layout on all screens without wrapping bugs) */}
          <div
            className="grid grid-cols-3 gap-2 sm:gap-6 pt-4 sm:pt-6 border-t border-slate-800/80 text-center"
            data-aos="fade-right"
            data-aos-delay="500"
          >
            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400">100K+</div>
              <div className="text-[10px] sm:text-xs text-slate-400">{isAr ? "عميل ومحل موثق" : "Happy Users"}</div>
            </div>

            <div className="flex flex-col items-center border-x border-slate-800/80 px-2">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-cyan-400">99.9%</div>
              <div className="text-[10px] sm:text-xs text-slate-400">{isAr ? "نسبة نجاح" : "Success Rate"}</div>
            </div>

            <div className="flex flex-col items-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-black text-purple-400">24/7</div>
              <div className="text-[10px] sm:text-xs text-slate-400">{isAr ? "دعم مباشر" : "Live Support"}</div>
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
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/30 animate-spin-slow pointer-events-none will-change-transform"></div>

            {/* Inner Counter-Rotating Gradient Ring */}
            <div className="absolute inset-4 sm:inset-6 rounded-full border border-emerald-400/40 animate-spin-slow-reverse pointer-events-none will-change-transform"></div>

            {/* Ambient Radial Pulsing Glow */}
            <div className="absolute inset-8 sm:inset-10 bg-gradient-to-tr from-emerald-500/20 via-cyan-500/25 to-purple-500/20 rounded-full blur-xl sm:blur-2xl animate-pulse-glow pointer-events-none"></div>

            {/* Central 3D Cyber Holographic Orb Visual (Customized per Language) */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_50px_rgba(45,212,191,0.35)] flex items-center justify-center group bg-slate-950 cursor-pointer active:scale-95 transition-all duration-300">
              <picture className="w-full h-full">
                <source srcSet={isAr ? "/images/hero_cyber_ar.webp" : "/images/hero_cyber_en.webp"} type="image/webp" />
                <img
                  src={isAr ? "/images/hero_cyber_ar.jpg" : "/images/hero_cyber_en.jpg"}
                  alt={isAr ? "عرب تك برو سيرفر - عرب تيك سيرفر" : "Arab Tech Pro Server"}
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
              <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-2.5 sm:px-4 py-1 rounded-lg sm:rounded-xl border border-cyan-400/40 flex items-center gap-1 shadow-lg max-w-[85%]">
                <picture>
                  <source srcSet={isAr ? "/images/logo_ar.webp" : "/images/logo_en.webp"} type="image/webp" />
                  <img
                    src={isAr ? "/images/logo_ar.png" : "/images/logo_en.png"}
                    alt="Arab Tech Pro Logo"
                    width={110}
                    height={20}
                    className="h-3.5 sm:h-5 w-auto object-contain max-w-[110px]"
                  />
                </picture>
              </div>
            </div>

            {/* Orbiting Floating Badge 1 - Top Left (Positioned safely within screen bounds) */}
            <div className="absolute -top-2 left-0 sm:-left-4 bg-[#070c1a]/95 backdrop-blur-md border-2 border-emerald-500/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(52,211,153,0.35)] flex items-center gap-2 animate-float will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-bolt animate-pulse"></i>
              </div>
              <div>
                <span className="block text-[10px] sm:text-[11px] font-bold text-white whitespace-nowrap">
                  {isAr ? "تسليم تلقائي ⚡" : "Instant Delivery"}
                </span>
                <span className="block text-[8px] sm:text-[9px] text-emerald-300 font-semibold whitespace-nowrap">
                  {isAr ? "خلال 1-5 دقائق" : "1 - 5 mins"}
                </span>
              </div>
            </div>

            {/* Orbiting Floating Badge 2 - Bottom Right */}
            <div className="absolute -bottom-2 right-0 sm:-right-4 bg-[#070c1a]/95 backdrop-blur-md border-2 border-cyan-500/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(34,211,238,0.35)] flex items-center gap-2 animate-float-delayed will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-shield-alt animate-pulse"></i>
              </div>
              <div>
                <span className="block text-[10px] sm:text-[11px] font-bold text-white whitespace-nowrap">
                  {isAr ? "حماية مشفرة 🛡️" : "100% Secure"}
                </span>
                <span className="block text-[8px] sm:text-[9px] text-cyan-300 font-semibold whitespace-nowrap">
                  {isAr ? "خوادم معتمدة" : "Verified servers"}
                </span>
              </div>
            </div>

            {/* Orbiting Floating Badge 3 - Bottom Left */}
            <div className="absolute bottom-4 -left-1 sm:-left-6 bg-[#070c1a]/95 backdrop-blur-md border-2 border-purple-500/50 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl shadow-[0_8px_25px_rgba(168,85,247,0.35)] flex items-center gap-2 animate-float will-change-transform z-20 cursor-pointer active:scale-95 transition-transform">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                <i className="fas fa-globe animate-spin-slow"></i>
              </div>
              <div>
                <span className="block text-[10px] sm:text-[11px] font-bold text-white whitespace-nowrap">
                  {isAr ? "150+ دولة 🌐" : "Global Reach"}
                </span>
                <span className="block text-[8px] sm:text-[9px] text-purple-300 font-semibold whitespace-nowrap">
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
