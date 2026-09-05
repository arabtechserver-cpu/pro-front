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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const hasAnimated = useRef(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          
          // Smooth count-up devices to 1500
          let start1 = 0;
          const end1 = 1500;
          const duration = 1500;
          const startTime = performance.now();

          let lastUpdate = 0;
          const animateCounts = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            // Throttle React state updates to ~30fps to prevent mobile scroll thread lock
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

  // Interactive 3D tilt tracking for ultra-immersive curvature (Desktop only with mouse)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt angle limited to ±5 degrees
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <section className="relative w-full my-6 sm:my-10 overflow-visible">
      
      {/* ── 3D Pop-out Floating Satellite / Hologram Chip (هتقلع بره الشاشه) ── */}
      <div 
        className="absolute -top-5 end-2 sm:-top-8 sm:end-6 z-30 pointer-events-auto cursor-pointer animate-pop-out flex items-center gap-1.5 sm:gap-2 scale-90 sm:scale-100 active:scale-90 transition-transform"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative group">
          {/* Holographic Glowing Orbit Ring */}
          <div className="absolute -inset-2.5 sm:-inset-3 rounded-full border border-cyan-400/50 animate-holo-rings pointer-events-none"></div>
          
          {/* Floating Pill Badge */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-slate-900/95 via-cyan-950/90 to-slate-900/95 backdrop-blur-xl border-2 border-cyan-400/60 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full shadow-[0_10px_30px_rgba(34,211,238,0.5)]">
            <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-400"></span>
            </span>
            <span className="text-[10px] sm:text-xs font-black text-cyan-300 tracking-wider flex items-center gap-1 whitespace-nowrap">
              <i className="fas fa-microchip text-emerald-400 animate-spin-slow"></i>
              <span>{isAr ? "معالجة سحابية فائقة" : "Cloud Engine"}</span>
              <span className="text-emerald-400 font-mono text-[9px] sm:text-[10px]">v4.2</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── Outer 3D Perspective Card with Zero Mobile Gutters & Deep Curvature ── */}
      <div
        ref={sectionRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : "perspective(1200px) rotateX(0deg) rotateY(0deg)",
          transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          transformStyle: "preserve-3d",
        }}
        className="relative w-full rounded-2xl sm:rounded-[2.75rem] curved-cockpit text-white p-4 sm:p-8 lg:p-12 border-y-2 sm:border-2 border-cyan-500/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] animate-neon-border will-change-transform overflow-visible"
      >
        {/* ── Top Arched Curved Cyber Horizon (خط الأفق المنحني المضيء) ── */}
        <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] pointer-events-none"></div>
        <div className="absolute -top-[1px] left-1/4 right-1/4 h-[2px] bg-white blur-[1px] pointer-events-none"></div>

        {/* Ambient Radial Bulge / Curvature Lighting (يعطي إحساس التقوس ثلاثي الأبعاد) */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90%] sm:w-[600px] h-64 bg-gradient-to-b from-cyan-500/20 via-emerald-500/10 to-transparent rounded-[100%] blur-[70px] pointer-events-none"></div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[90%] sm:w-[500px] h-64 bg-gradient-to-t from-purple-500/15 via-cyan-500/10 to-transparent rounded-[100%] blur-[70px] pointer-events-none"></div>

        {/* Continuous Cyber Laser Scanline (ماسح ليزر متحرك) */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl sm:rounded-[2.75rem] pointer-events-none">
          <div className="hidden sm:block absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] animate-laser-scan"></div>
          {/* Subtle curved grid lines */}
          <div className="absolute inset-0 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        </div>

        {/* ── Main Content Grid ── */}
        <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* ── Left / Main Headline Side (Span 7 on desktop) ── */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-start" data-aos="fade-right">
            
            {/* Status Radar & Live Equalizer Header Badge */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 mb-4 sm:mb-5">
              {/* Online indicator with Live Soundwave Equalizer */}
              <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 px-3.5 py-1.5 rounded-full shadow-[0_4px_15px_rgba(52,211,153,0.25)]">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 online-blink shadow-[0_0_8px_#34d399]"></span>
                <span className="text-emerald-300 font-black text-xs tracking-wider">ONLINE</span>
                {/* Live soundwave animation */}
                <div className="flex items-center gap-0.5 h-4 px-1 border-s border-slate-700 ms-1">
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-soundwave-1"></span>
                  <span className="w-0.5 bg-cyan-400 rounded-full animate-soundwave-2"></span>
                  <span className="w-0.5 bg-emerald-400 rounded-full animate-soundwave-3"></span>
                  <span className="w-0.5 bg-cyan-400 rounded-full animate-soundwave-4"></span>
                </div>
              </div>

              {/* Real-time Update pill */}
              <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/80">
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>{isAr ? "تحديث سيرفرات لحظي • 24/7" : "Live Real-Time Sync • 24/7"}</span>
              </div>
            </div>

            {/* Arched 3D Title */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black mb-3 sm:mb-4 leading-tight tracking-tight">
              <span className="text-slate-100 block sm:inline">
                {isAr ? "مرحباً بك في " : "Welcome to "}
              </span>
              <span className="relative inline-block mt-1 sm:mt-0 mx-1">
                {/* 3D Convex Badge Background */}
                <span className="relative z-10 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-slate-950 font-black px-4 py-1 rounded-xl shadow-[0_8px_20px_rgba(52,211,153,0.4),inset_0_2px_2px_rgba(255,255,255,0.6)] inline-block transform -rotate-1 hover:rotate-0 transition-transform">
                  {isAr ? "عرب تك برو" : "ArabTech Pro"}
                </span>
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-300 to-teal-200 bg-clip-text text-transparent block mt-2 text-xl sm:text-3xl lg:text-4xl font-extrabold drop-shadow-[0_2px_15px_rgba(34,211,238,0.35)]">
                {isAr ? "المنظومة الذكية لفك وتفعيل الأجهزة" : "Next-Gen Phone Unlocking & Services"}
              </span>
            </h2>

            {/* Description */}
            <p className="text-xs sm:text-base lg:text-lg text-slate-300 mb-6 max-w-xl leading-relaxed">
              {isAr ? (
                <>
                  منصة <strong className="text-white font-bold">عرب تك سيرفر (عرب تيك)</strong>: المنظومة السحابية الموحدة لفك شفرات الشبكات (IMEI)، وتخطي FRP، وحذف حسابات iCloud، وشحن رصيد كافة السيرفرات والبوكسات فورياً وبأفضل أسعار الجملة.
                </>
              ) : (
                <>
                  Arab Tech Pro Server: One unified high-speed platform for IMEI unlocks, FRP bypass, iCloud removal, and server credits with automated instant delivery.
                </>
              )}
            </p>

            {/* ── 3D Convex Pill Feature Badges (أزرار كبسولية متقوسة ثلاثية الأبعاد) ── */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-2.5 sm:gap-3 mb-6 sm:mb-8">
              <div className="convex-pill bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/40 text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2 shadow-[0_6px_20px_rgba(52,211,153,0.25)] hover:border-emerald-400 cursor-default">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
                  <i className="fas fa-lock-open"></i>
                </div>
                <span>{isAr ? "فك وتفعيل فوري" : "Instant Unlock"}</span>
              </div>

              <div className="convex-pill bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/40 text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2 shadow-[0_6px_20px_rgba(34,211,238,0.25)] hover:border-cyan-400 cursor-default">
                <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span>{isAr ? "حماية وتشفير SSL" : "SSL Encrypted"}</span>
              </div>

              <div className="convex-pill bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-purple-500/40 text-slate-200 text-xs sm:text-sm font-bold px-4 py-2 flex items-center gap-2 shadow-[0_6px_20px_rgba(168,85,247,0.25)] hover:border-purple-400 cursor-default">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
                  <i className="fas fa-globe"></i>
                </div>
                <span>{isAr ? "خدمة لجميع دول العالم" : "Worldwide 150+"}</span>
              </div>
            </div>

            {/* ── Action Buttons with 3D Convex Curvature & Blast-off Hover (هتقلع بره الشاشه) ── */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Primary Blast-off Pill Button */}
              <Link
                href={`/${lang}/register`}
                className="convex-pill group relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-black text-sm sm:text-base px-7 py-3.5 sm:py-4 flex items-center justify-center gap-3 shadow-[0_12px_30px_rgba(52,211,153,0.5),inset_0_2px_4px_rgba(255,255,255,0.6)]"
              >
                {/* Light shimmer sweep */}
                <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 animate-shimmer pointer-events-none"></div>
                <i className="fas fa-rocket text-base sm:text-lg text-slate-950 group-hover:rotate-12 group-hover:-translate-y-1 transition-transform animate-thruster"></i>
                <span>{isAr ? "ابدأ الفك والتفعيل الآن" : "Start Unlocking Now"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:translate-x-1`}></i>
              </Link>

              {/* Secondary Convex Glass Pill Button */}
              <Link
                href={`/${lang}/pricing`}
                className="convex-pill group bg-slate-900/80 hover:bg-slate-800/90 border-2 border-cyan-400/40 hover:border-cyan-400 text-white font-bold text-sm sm:text-base px-6 py-3.5 sm:py-4 flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.2)]"
              >
                <i className="fas fa-list-alt text-cyan-400 text-base group-hover:scale-110 transition-transform"></i>
                <span>{isAr ? "عرض قائمة كافة الخدمات والأسعار" : "View Services & Prices"}</span>
              </Link>
            </div>

          </div>

          {/* ── Right Side: 3 High-Tech Convex 3D Counter Cards (Span 5 on desktop) ── */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4.5 w-full">
            
            {/* Card 1: Supported Phone Models */}
            <div
              className="convex-card group relative p-4 sm:p-5 flex items-center gap-4 sm:gap-5 cursor-pointer will-change-transform active:scale-[0.97] active:border-emerald-400 active:shadow-[0_0_30px_rgba(52,211,153,0.5)] transition-all duration-200"
              data-aos="fade-left"
              data-aos-delay="100"
            >
              {/* Corner Specular Curvature Light */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              
              {/* 3D Floating Icon Container */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-emerald-400/25 via-slate-800 to-emerald-600/15 border-2 border-emerald-400/40 text-emerald-300 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-[0_8px_20px_rgba(52,211,153,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <i className="fas fa-mobile-alt animate-float"></i>
                {/* Mini Pulse Badge */}
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border border-slate-900 shadow animate-ping"></span>
              </div>

              {/* Number & Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200 tracking-tight drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]">
                    +{counts.devices}
                  </span>
                  <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">Models</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-bold truncate">
                  {isAr ? "موديل وطراز هاتف مدعوم" : "Supported device models"}
                </p>
                <span className="text-[10px] text-emerald-400/90 font-medium">
                  {isAr ? "Samsung, Apple, Xiaomi, Huawei & More" : "All global brands & chipsets"}
                </span>
              </div>

              {/* Floating Arrow */}
              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-[-4px] transition-all"></i>
            </div>

            {/* Card 2: New Services Monthly */}
            <div
              className="convex-card group relative p-4 sm:p-5 flex items-center gap-4 sm:gap-5 cursor-pointer will-change-transform active:scale-[0.97] active:border-cyan-400 active:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all duration-200"
              data-aos="fade-left"
              data-aos-delay="200"
            >
              {/* Corner Specular Curvature Light */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl pointer-events-none"></div>

              {/* 3D Floating Icon Container */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-400/25 via-slate-800 to-cyan-600/15 border-2 border-cyan-400/40 text-cyan-300 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-[0_8px_20px_rgba(34,211,238,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)] group-hover:scale-110 group-hover:-rotate-3 transition-transform">
                <i className="fas fa-cog animate-spin-slow"></i>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full border border-slate-900 shadow"></span>
              </div>

              {/* Number & Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-teal-200 tracking-tight drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                    +{counts.services}
                  </span>
                  <span className="text-cyan-400 text-xs font-bold uppercase tracking-wider">Updates</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-bold truncate">
                  {isAr ? "خدمة وتحديث جديد شهرياً" : "New services monthly"}
                </p>
                <span className="text-[10px] text-cyan-400/90 font-medium">
                  {isAr ? "أدوات السوفت وير وتحديثات السيرفرات" : "Box activations & server credits"}
                </span>
              </div>

              {/* Floating Arrow */}
              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-[-4px] transition-all"></i>
            </div>

            {/* Card 3: 24/7 Automated Delivery & Live Support */}
            <div
              className="convex-card group relative p-4 sm:p-5 flex items-center gap-4 sm:gap-5 cursor-pointer will-change-transform active:scale-[0.97] active:border-purple-400 active:shadow-[0_0_30px_rgba(168,85,247,0.5)] transition-all duration-200"
              data-aos="fade-left"
              data-aos-delay="300"
            >
              {/* Corner Specular Curvature Light */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none"></div>

              {/* 3D Floating Icon Container */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-400/25 via-slate-800 to-purple-600/15 border-2 border-purple-400/40 text-purple-300 flex items-center justify-center text-2xl sm:text-3xl shrink-0 shadow-[0_8px_20px_rgba(168,85,247,0.35),inset_0_2px_3px_rgba(255,255,255,0.4)] group-hover:scale-110 group-hover:rotate-3 transition-transform">
                <i className="fas fa-user-clock animate-float-delayed"></i>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500 border border-slate-900"></span>
                </span>
              </div>

              {/* Number & Label */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-200 tracking-tight drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                    24/7
                  </span>
                  <span className="text-purple-400 text-xs font-bold uppercase tracking-wider">Always ON</span>
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-bold truncate">
                  {isAr ? "تسليم آلي ودعم فني مستمر" : "Online delivery & support"}
                </p>
                <span className="text-[10px] text-purple-400/90 font-medium">
                  {isAr ? "تيليجرام • واتساب • ذكاء اصطناعي" : "Telegram • WhatsApp • AI Engine"}
                </span>
              </div>

              {/* Floating Arrow */}
              <i className="fas fa-chevron-left rtl:rotate-0 ltr:rotate-180 text-xs text-slate-500 group-hover:text-purple-400 group-hover:translate-x-[-4px] transition-all"></i>
            </div>

          </div>

        </div>

        {/* ── Bottom Arched Cyber Glow (خط القوس السفلي المضيء) ── */}
        <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent shadow-[0_0_15px_#34d399] pointer-events-none"></div>

      </div>

    </section>
  );
}
