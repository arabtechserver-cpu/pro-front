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

  const current = campaigns[currentIndex];
  const tag = isAr ? current?.tagAr : current?.tagEn;
  const title = isAr ? current?.titleAr : current?.titleEn;
  const desc = isAr ? current?.descAr : current?.descEn;
  const url = current?.url?.startsWith("/") ? `${langPrefix}${current.url}` : (current?.url || "#");

  return (
    <div
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden group h-[340px] sm:h-[420px] bg-[#111622] border border-white/15 shadow-xl touch-pan-y lamp-card"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-20 bg-blue-500/15 rounded-full blur-2xl pointer-events-none z-30"></div>
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/98 via-[#0B0F17]/60 to-transparent opacity-90"></div>
          
          <div className="absolute bottom-10 sm:bottom-12 left-5 sm:left-12 right-5 sm:right-12 z-10">
            {tag && (
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3.5 py-1 text-xs sm:text-sm uppercase font-semibold tracking-wider mb-3 inline-block rounded-full backdrop-blur-md shadow-sm">
                {tag}
              </span>
            )}
            <h3 className="font-black text-xl sm:text-3xl text-white mb-2 tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] line-clamp-2">
              {title}
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-5 max-w-xl leading-relaxed line-clamp-2 sm:line-clamp-3">
              {desc}
            </p>
            <Link
              href={url}
              className="btn-royal w-max px-7 sm:px-9 py-2.5 sm:py-3.5 text-xs sm:text-base font-bold flex items-center gap-2 group shadow-lg shadow-blue-900/30"
            >
              <span>{isAr ? "عرض تفاصيل الباقة" : "View Details"}</span>
              <i className={`fas fa-arrow-${isAr ? "left" : "right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Swipeable Indicator Dots */}
      {campaigns.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-2 z-20">
          {campaigns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 active:scale-90 ${
                idx === currentIndex
                  ? "w-8 bg-blue-500"
                  : "w-2 bg-slate-600 hover:bg-slate-500"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

