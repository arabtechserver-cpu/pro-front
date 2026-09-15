"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface AmrrHeroSectionProps {
  lang: string;
}

const HERO_VIDEO_URL =
  process.env.NEXT_PUBLIC_HERO_VIDEO_URL ||
  "https://pub-3440f02b971d4054906dd63d89e3cdb0.r2.dev/hero-showcase.mp4";

export default function AmrrHeroSection({ lang }: AmrrHeroSectionProps) {
  const isAr = lang === "ar";
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Video Player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const theaterVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTimeStr, setCurrentTimeStr] = useState("0:00");
  const [durationStr, setDurationStr] = useState("0:00");
  const [isTheaterOpen, setIsTheaterOpen] = useState(false);

  useEffect(() => {
    try {
      const token = localStorage.getItem("user_token") || localStorage.getItem("token");
      if (token && token !== "null" && token !== "undefined") {
        setIsLoggedIn(true);
      }
    } catch {}
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const current = video.currentTime;
    const dur = video.duration;
    setProgress((current / dur) * 100);
    setCurrentTimeStr(formatTime(current));
    setDurationStr(formatTime(dur));
  };

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const targetTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = targetTime;
    setProgress(parseFloat(e.target.value));
  };

  const openTheater = () => {
    setIsTheaterOpen(true);
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const closeTheater = () => {
    setIsTheaterOpen(false);
    if (theaterVideoRef.current) {
      theaterVideoRef.current.pause();
    }
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  // Close theater on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isTheaterOpen) {
        closeTheater();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTheaterOpen]);

  return (
    <>
      <section className="relative w-full bg-[#0b1322] rounded-2xl sm:rounded-3xl border border-white/15 shadow-2xl mb-6 sm:mb-8 overflow-hidden">
        {/* Cyber Grid Pattern */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.04)_1px,transparent_1px)] bg-[size:28px_28px] sm:bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_75%_65%_at_50%_50%,#000_65%,transparent_100%)] pointer-events-none"
          aria-hidden="true"
        />

        {/* Ambient Top Laser Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between p-4 sm:p-6 lg:p-10 xl:p-12 gap-6 lg:gap-10">

          {/* Left Column: Text + Actions + Quick Stats */}
          <div className="flex-1 min-w-0 max-w-2xl w-full text-center lg:text-start">

            {/* Live Status Pill */}
            <div
              className="inline-flex items-center gap-2 bg-blue-500/15 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full border border-sky-400/35 mb-3 sm:mb-5 shadow-sm max-w-full"
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <span className="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sky-300 font-bold text-[11px] sm:text-xs lg:text-sm tracking-wide truncate">
                {isAr ? "السيرفر الرسمي المعتمد لخدمات السوفت وير والأجهزة 24/7" : "Premier GSM & Software Unlock Server 24/7"}
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-1 mb-3 sm:mb-5 lg:mb-6" data-aos="fade-right" data-aos-delay="200">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black leading-tight tracking-tight">
                <span className="block text-white">
                  {isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server"}
                </span>
                <span className="block text-slate-200 font-extrabold text-lg sm:text-2xl lg:text-3xl xl:text-4xl mt-1">
                  {isAr ? "إدارة وتفعيل شامل لكافة" : "Complete Control Over"}
                </span>
                <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent mt-1">
                  {isAr ? "الهواتف والأجهزة الذكية" : "All Mobile Devices"}
                </span>
              </h1>
            </div>

            {/* Subtitle */}
            <p
              className="text-xs sm:text-sm lg:text-base text-slate-300 font-medium leading-relaxed max-w-xl mb-4 sm:mb-6 lg:mb-8 mx-auto lg:mx-0"
              data-aos="fade-right"
              data-aos-delay="300"
            >
              {isAr ? (
                <>
                  منصة <strong className="text-white font-bold">عرب تك برو سيرفر</strong> — بوابتك المتكاملة لفك الشفرات، تخطي الحسابات، وتفعيل البوكسات والدونجل مع{" "}
                  <span className="text-sky-400 font-semibold">تسليم تلقائي فوري</span>،{" "}
                  <span className="text-emerald-400 font-semibold">حماية مشفرة 100%</span>، و{" "}
                  <span className="text-cyan-300 font-semibold">دعم فني متخصص على مدار الساعة</span>.
                </>
              ) : (
                <>
                  Arab Tech Pro Server: Professional unlocking, activations, and tool credit top-ups with{" "}
                  <span className="text-sky-400 font-semibold">instant automated delivery</span>,{" "}
                  <span className="text-emerald-400 font-semibold">100% secure checkout</span>, and{" "}
                  <span className="text-cyan-300 font-semibold">24/7 dedicated GSM engineering support</span>.
                </>
              )}
            </p>

            {/* Action Buttons */}
            <div
              className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8 w-full lg:w-auto justify-center lg:justify-start"
              data-aos="fade-right"
              data-aos-delay="400"
            >
              <Link
                href={isLoggedIn ? `/${lang}/pricing` : `/${lang}/register`}
                className="btn-purple-glow w-full sm:w-auto px-5 sm:px-7 py-2.5 sm:py-3 lg:py-3.5 font-bold text-sm lg:text-base flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/40"
              >
                <i className="fas fa-bolt text-yellow-300 text-sm group-hover:scale-110 transition-transform" />
                <span>
                  {isAr
                    ? (isLoggedIn ? "طلب فك وتفعيل فوري" : "ابدأ الفك والتفعيل الآن")
                    : (isLoggedIn ? "Order Unlock & Activation" : "Start Unlocking Now")}
                </span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`} />
              </Link>

              <Link
                href={`/${lang}/pricing`}
                className="btn-dark-pill w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 lg:py-3.5 font-bold text-sm lg:text-base flex items-center justify-center gap-2 group"
              >
                <i className="fas fa-server text-sky-400 text-sm" />
                <span>{isAr ? "عرض قائمة الأسعار والخدمات" : "View All Services"}</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div
              className="rounded-xl sm:rounded-2xl p-3 sm:p-4 grid grid-cols-3 gap-2 sm:gap-3 text-center border border-white/10 bg-[#0f192d]"
              data-aos="fade-right"
              data-aos-delay="500"
            >
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-sky-400 tracking-tight">+100K</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "طلب منجز" : "Orders Completed"}</div>
              </div>
              <div className="flex flex-col items-center border-x border-white/10 px-1 sm:px-2">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-400 tracking-tight">99.9%</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "نسبة النجاح" : "Success Rate"}</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-xl sm:text-2xl lg:text-3xl font-black text-amber-300 tracking-tight">24/7</div>
                <div className="text-[10px] sm:text-xs text-slate-300 font-medium mt-0.5 sm:mt-1">{isAr ? "دعم متواصل" : "Live Support"}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Dedicated High-End Showcase Video Player */}
          <div
            className="w-full lg:w-[460px] xl:w-[500px] shrink-0 flex flex-col items-center justify-center relative"
            data-aos="fade-left"
            data-aos-delay="300"
          >
            {/* Showcase Video Console Card */}
            <div className="relative w-full rounded-2xl sm:rounded-3xl bg-[#0c1527] border border-white/15 shadow-2xl p-3 sm:p-4 flex flex-col gap-3 z-10 overflow-hidden group">

              {/* Console Header Bar */}
              <div className="flex items-center justify-between pb-2.5 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[11px] sm:text-xs font-mono text-slate-300 font-bold ms-1.5">
                    ATP-SERVER // SHOWCASE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-sky-300 border border-blue-400/30">
                    1080P HD
                  </span>
                  <button
                    type="button"
                    onClick={openTheater}
                    className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                    title={isAr ? "مشاهدة الفيديو بالحجم الكامل" : "Watch Full Video"}
                    aria-label="Expand Video"
                  >
                    <i className="fas fa-expand text-xs" />
                  </button>
                </div>
              </div>

              {/* Video Player Display Container (16:9 Aspect Ratio) */}
              <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-[#060a12] border border-white/10 shadow-inner group/video">
                <video
                  ref={videoRef}
                  src={HERO_VIDEO_URL}
                  autoPlay
                  muted={isMuted}
                  loop
                  playsInline
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-cover object-center cursor-pointer"
                  onClick={togglePlay}
                />

                {/* Big Center Play/Pause Overlay Button */}
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-black/70 border border-sky-400/60 text-white flex items-center justify-center text-xl shadow-2xl hover:scale-110 transition-transform"
                    aria-label="Play Video"
                  >
                    <i className="fas fa-play text-sky-400 ms-0.5" />
                  </button>
                )}

                {/* Top Corner Badge */}
                <div className="absolute top-2.5 start-2.5 pointer-events-none">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0a1120]/90 border border-white/15 text-[10px] font-mono font-bold text-emerald-400 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{isAr ? "استعراض المنصة الرسمي" : "OFFICIAL SHOWCASE"}</span>
                  </span>
                </div>

                {/* Bottom Video Quick Action Bar */}
                <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
                  <div className="pointer-events-auto flex items-center gap-1.5 bg-[#090f1d]/90 border border-white/10 px-2 py-1 rounded-lg text-[11px] font-mono text-slate-300">
                    <button
                      type="button"
                      onClick={togglePlay}
                      className="text-white hover:text-sky-400 transition-colors px-1"
                      aria-label={isPlaying ? "Pause" : "Play"}
                    >
                      <i className={`fas ${isPlaying ? "fa-pause" : "fa-play"} text-[10px]`} />
                    </button>
                    <span>{currentTimeStr}</span>
                    <span>/</span>
                    <span className="text-slate-400">{durationStr}</span>
                  </div>

                  <div className="pointer-events-auto flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={toggleMute}
                      className="w-7 h-7 rounded-lg bg-[#090f1d]/90 hover:bg-[#16233f] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                      title={isMuted ? (isAr ? "تشغيل الصوت" : "Unmute") : (isAr ? "كتم الصوت" : "Mute")}
                      aria-label="Toggle Sound"
                    >
                      <i className={`fas ${isMuted ? "fa-volume-mute text-slate-400" : "fa-volume-up text-cyan-400"} text-xs`} />
                    </button>
                    <button
                      type="button"
                      onClick={openTheater}
                      className="px-2.5 py-1 rounded-lg bg-[#090f1d]/90 hover:bg-blue-600 border border-white/10 hover:border-blue-400 text-xs font-semibold text-white transition-all flex items-center gap-1 shadow-md"
                      title={isAr ? "مشاهدة الفيديو بالحجم الكامل" : "View Fullscreen Theater"}
                    >
                      <i className="fas fa-expand text-[10px]" />
                      <span className="text-[11px]">{isAr ? "تكبير الفيديو" : "Full View"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress Timeline Scrubber */}
              <div className="px-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-[#1a253c] rounded-lg appearance-none cursor-pointer accent-sky-400"
                  aria-label="Video Timeline"
                />
              </div>

              {/* Four Trust Badges under video */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-[#0f192d] border border-white/10 flex items-center gap-2">
                  <i className="fas fa-bolt text-sky-400 text-xs shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-white block truncate">
                      {isAr ? "تفعيل تلقائي API" : "Instant API"}
                    </span>
                    <span className="text-[9px] text-slate-400 block truncate">
                      {isAr ? "1 - 5 دقائق" : "1 - 5 mins"}
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-[#0f192d] border border-white/10 flex items-center gap-2">
                  <i className="fas fa-shield-alt text-emerald-400 text-xs shrink-0" />
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-white block truncate">
                      {isAr ? "ضمان الاسترجاع" : "Refund Guarantee"}
                    </span>
                    <span className="text-[9px] text-emerald-400 block truncate">
                      100% {isAr ? "محمي" : "Protected"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Fullscreen Theater Mode Modal to watch the entire video unobstructed */}
      {isTheaterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#050914]/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
        >
          {/* Modal Header */}
          <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-2 text-white">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                {isAr ? "فيديو استعراض خدمات ومنصة عرب تك برو" : "Arab Tech Pro Server - Official Showcase"}
              </h3>
            </div>
            <button
              type="button"
              onClick={closeTheater}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors flex items-center gap-1.5 border border-white/15"
              aria-label="Close Fullscreen View"
            >
              <i className="fas fa-times text-xs" />
              <span>{isAr ? "إغلاق" : "Close"}</span>
            </button>
          </div>

          {/* Fullscreen Video Canvas */}
          <div className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden bg-black border border-white/20 shadow-2xl">
            <video
              ref={theaterVideoRef}
              src={HERO_VIDEO_URL}
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="mt-3 text-center">
            <p className="text-xs text-slate-400">
              {isAr
                ? "يمكنك الضغط على زر Esc في لوحة المفاتيح أو زر الإغلاق للعودة للموقع."
                : "Press Esc or the close button to return to the homepage."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
