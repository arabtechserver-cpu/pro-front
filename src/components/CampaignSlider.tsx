"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  Flame, 
  Tag, 
  ArrowLeft, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Sparkles,
  Layers
} from "lucide-react";
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

interface CampaignSliderProps {
  campaigns: Campaign[];
  lang: Locale;
}

export default function CampaignSlider({ campaigns, lang }: CampaignSliderProps) {
  const isAr = lang === "ar";
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const PrevIcon = isAr ? ChevronRight : ChevronLeft;
  const NextIcon = isAr ? ChevronLeft : ChevronRight;

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = campaigns?.length || 0;

  useEffect(() => {
    if (total <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 6000);
    return () => clearInterval(interval);
  }, [total, isPaused]);

  const activeCampaign = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return null;
    return campaigns[activeIndex % campaigns.length];
  }, [campaigns, activeIndex]);

  if (!campaigns || campaigns.length === 0) return null;

  const formatUrl = (rawUrl?: string) => {
    if (!rawUrl) return `/${lang}/pricing`;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) return `/${lang}${rawUrl}`;
    return `/${lang}/${rawUrl}`;
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  return (
    <div 
      className="w-full space-y-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none w-full sm:w-auto">
          {campaigns.slice(0, 6).map((c, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border ${
                  isActive
                    ? "bg-blue-600/30 text-white border-blue-400/70 shadow-md shadow-blue-950/40"
                    : "bg-[#090f1a]/80 text-slate-300 border-white/10 hover:border-sky-400/30 hover:text-white"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-cyan-400 animate-pulse" : "bg-slate-500"}`} />
                <span className="truncate max-w-[130px] sm:max-w-[160px]">
                  {isAr ? (c.titleAr || c.titleEn) : (c.titleEn || c.titleAr)}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={isAr ? "السابق" : "Previous"}
            className="w-8 h-8 rounded-lg bg-[#0b1322] hover:bg-[#121c32] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <PrevIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={isAr ? "التالي" : "Next"}
            className="w-8 h-8 rounded-lg bg-[#0b1322] hover:bg-[#121c32] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
          >
            <NextIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {activeCampaign && (
        <div className="relative rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 bg-[#090f1a]/85 backdrop-blur-xl border border-white/10 hover:border-sky-400/40 shadow-2xl transition-all duration-300 overflow-hidden group">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 shadow-[0_0_16px_rgba(34,211,238,0.7)]" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-7 space-y-4 text-start">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-blue-500/15 border border-blue-400/35 text-blue-300 font-bold text-xs px-3 py-1 rounded-full shadow-sm">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? (activeCampaign.tagAr || "عرض حصري") : (activeCampaign.tagEn || "Hot Offer")}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isAr ? "تفعيل فوري 24/7" : "Instant Active 24/7"}</span>
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                  <span>{isAr ? (activeCampaign.titleAr || activeCampaign.titleEn) : (activeCampaign.titleEn || activeCampaign.titleAr)}</span>
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-300 leading-relaxed max-w-2xl">
                  {isAr 
                    ? (activeCampaign.descAr || "أفضل أسعار الجملة المعتمدة مع تنفيذ فوري عبر السيرفر الرسمي.") 
                    : (activeCampaign.descEn || "Official wholesale pricing with instant automated server fulfillment.")}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0d1424] border border-white/10 text-center">
                  <Clock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-medium">{isAr ? "زمن الإنجاز" : "Turnaround"}</div>
                  <div className="text-xs font-bold text-white font-mono mt-0.5">1 - 5 Mins</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1424] border border-white/10 text-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-medium">{isAr ? "الضمان المالي" : "Guarantee"}</div>
                  <div className="text-xs font-bold text-emerald-300 font-mono mt-0.5">100% REFUND</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0d1424] border border-white/10 text-center">
                  <Zap className="w-4 h-4 text-sky-400 mx-auto mb-1" />
                  <div className="text-[10px] text-slate-400 font-medium">{isAr ? "نوع الربط" : "Integration"}</div>
                  <div className="text-xs font-bold text-sky-300 font-mono mt-0.5">DIRECT API</div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={formatUrl(activeCampaign.url)}
                  className="btn-royal py-3 px-6 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 group shadow-xl shadow-blue-950/40"
                >
                  <span>{isAr ? "اطلب الآن وابدأ التفعيل" : "Order & Activate Now"}</span>
                  <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
                </Link>

                <Link
                  href={`/${lang}/pricing`}
                  className="py-3 px-5 font-semibold text-xs text-slate-300 hover:text-white bg-[#0d1424] hover:bg-[#142038] border border-white/10 rounded-xl transition-all flex items-center gap-2"
                >
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isAr ? "استعراض كافة الأسعار" : "View All Rates"}</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-2xl sm:rounded-3xl p-3 bg-[#0c1322] border border-white/15 shadow-2xl flex items-center justify-center group/img overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/10 to-transparent pointer-events-none" />
                
                {activeCampaign.image ? (
                  <img
                    src={activeCampaign.image}
                    alt={activeCampaign.titleEn || activeCampaign.titleAr || "Campaign"}
                    className="w-full h-full object-cover rounded-xl group-hover/img:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-900/30 to-slate-900/50 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                    <Sparkles className="w-10 h-10 text-sky-400 mb-2" />
                    <span className="font-bold text-sm text-white">
                      {isAr ? activeCampaign.titleAr : activeCampaign.titleEn}
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-[#090e18]/90 backdrop-blur-md border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white font-bold truncate">
                    {isAr ? activeCampaign.titleAr : activeCampaign.titleEn}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold shrink-0 ms-2">GSM API</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
