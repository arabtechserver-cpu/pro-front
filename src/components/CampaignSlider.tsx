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

  useEffect(() => {
    if (!campaigns || campaigns.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [campaigns]);

  if (!campaigns || campaigns.length === 0) return null;

  const current = campaigns[currentIndex];
  const tag = isAr ? current?.tagAr : current?.tagEn;
  const title = isAr ? current?.titleAr : current?.titleEn;
  const desc = isAr ? current?.descAr : current?.descEn;
  const url = current?.url?.startsWith("/") ? `${langPrefix}${current.url}` : (current?.url || "#");

  return (
    <div className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden relative group h-[300px] sm:h-[400px] border border-outline-variant/30 w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: isAr ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isAr ? 50 : -50 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{ backgroundImage: `url('${current?.image || "/images/promo_samsung.png"}')` }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1324]/90 via-[#0c1324]/40 to-transparent opacity-80"></div>
          
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6 sm:right-10 z-10">
            {tag && (
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs sm:text-sm uppercase font-bold tracking-wider mb-3 inline-block backdrop-blur-sm border border-primary/30">
                {tag}
              </span>
            )}
            <h3 className="font-bold text-2xl sm:text-4xl text-white mb-2">{title}</h3>
            <p className="text-white/80 text-sm sm:text-lg mb-4 max-w-lg">{desc}</p>
            <Link href={url} className="text-primary text-sm sm:text-base font-bold hover:text-white transition-colors flex items-center gap-2">
              {isAr ? "عرض التفاصيل" : "View Details"} <i className={`fas fa-arrow-${isAr ? "left" : "right"} text-xs`}></i>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {campaigns.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {campaigns.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                idx === currentIndex ? "bg-primary scale-125" : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
