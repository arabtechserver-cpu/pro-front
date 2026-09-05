"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Locale } from "@/i18n/config";

interface Campaign {
  tagEn: string;
  tagAr: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  image: string;
  url: string;
}

export default function CampaignSlider({ campaigns, lang }: { campaigns: Campaign[], lang: Locale }) {
  const isAr = lang === "ar";
  const langPrefix = `/${lang}`;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    if (!campaigns || campaigns.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [campaigns, isPaused]);

  if (!campaigns || campaigns.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % campaigns.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart === null || touchEnd === null) {
      setTimeout(() => setIsPaused(false), 2000);
      return;
    }
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
    setTimeout(() => setIsPaused(false), 3000);
  };

  const current = campaigns[currentIndex];
  const tag = isAr ? current?.tagAr : current?.tagEn;
  const title = isAr ? current?.titleAr : current?.titleEn;
  const desc = isAr ? current?.descAr : current?.descEn;
  const url = current?.url?.startsWith("/") ? `${langPrefix}${current.url}` : (current?.url || "#");

  return (
    <div
      className="relative w-full curved-cockpit rounded-2xl sm:rounded-[2.5rem] overflow-hidden group h-[340px] sm:h-[420px] border-y-2 sm:border-2 border-cyan-500/30 shadow-2xl animate-neon-border touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Curved Arched Cyber Lines */}
      <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none z-20"></div>
      <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#34d399] pointer-events-none z-20"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 0.98, x: isAr ? -40 : 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.98, x: isAr ? 40 : -40 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${current?.image || "/images/promo_samsung.webp"}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#070c1a]/98 via-[#070c1a]/60 to-transparent opacity-90"></div>
          
          <div className="absolute bottom-10 sm:bottom-12 left-5 sm:left-12 right-5 sm:right-12 z-10">
            {tag && (
              <span className="convex-pill bg-gradient-to-r from-emerald-500/25 to-cyan-500/25 text-emerald-300 px-4 py-1.5 text-xs sm:text-sm uppercase font-black tracking-wider mb-3 inline-block backdrop-blur-md border border-emerald-400/40 shadow-sm animate-mobile-badge">
                {tag}
              </span>
            )}
            <h3 className="font-black text-xl sm:text-4xl text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] line-clamp-2">
              {title}
            </h3>
            <p className="text-slate-200 text-xs sm:text-base mb-5 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-3">
              {desc}
            </p>
            <Link
              href={url}
              className="convex-pill w-max bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 px-6 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-base font-black shadow-lg hover:shadow-cyan-400/40 flex items-center gap-2 active:scale-95 active:shadow-[0_0_25px_rgba(45,212,191,0.8)]"
            >
              <span>{isAr ? "عرض تفاصيل الباقة" : "View Details"}</span>
              <i className={`fas fa-arrow-${isAr ? "left" : "right"} text-xs`}></i>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swipeable Indicator Dots (Pill Format) */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2 z-20">
          {campaigns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 active:scale-90 ${
                idx === currentIndex
                  ? "w-8 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_12px_#22d3ee] animate-pulse"
                  : "w-2 bg-white/40 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

