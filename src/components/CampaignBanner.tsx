"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, Clock, Zap, Download } from "lucide-react";

interface CampaignBannerProps {
  lang?: string;
}

export default function CampaignBanner({ lang = "ar" }: CampaignBannerProps) {
  const isAr = lang === "ar";

  return (
    <section className="w-full mb-8 sm:mb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 sm:gap-5">
        
        {/* Card 1: Official Reseller Campaigns (Matches Mockup Pixel-for-Pixel) */}
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-purple-100/70 via-purple-50/80 to-white dark:from-[#130f28] dark:via-[#191136] dark:to-[#120e26] border border-purple-200/80 dark:border-purple-500/30 backdrop-blur-xl shadow-md shadow-purple-500/5 dark:shadow-2xl dark:shadow-purple-950/40 overflow-hidden flex items-center justify-between gap-3 sm:gap-4 transition-all">
          <div className="space-y-1 text-start min-w-0">
            <h4 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight">
              {isAr ? "عروض وحملات الموزعين الرسمية" : "Official Reseller Campaigns"}
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-600 dark:text-purple-200/80 font-normal">
              {isAr ? "أفضل الأسعار ، إصدارات جديدة ، مع ضمان كامل" : "Best prices, new releases, with full guarantee."}
            </p>
            <div className="pt-1.5">
              <Link
                href={`/${lang}/pricing`}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/30 hover:shadow-purple-600/50 transition-all"
              >
                <Sparkles className="w-3 h-3 text-purple-200" />
                <span>{isAr ? "عرض جميع العروض" : "View All Offers"}</span>
              </Link>
            </div>
          </div>

          {/* 3D Rendered Glossy Purple Gift Box */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 relative shrink-0 drop-shadow-[0_0_15px_rgba(168,85,247,0.35)]">
            <Image
              src="/images/promo_gift_box_clean.png"
              alt="Offers"
              width={100}
              height={100}
              className="w-full h-full object-contain hover:scale-105 transition-transform"
            />
          </div>
        </div>

        {/* Card 2: Samsung FRP Remove (Spacious, High-Resolution Phone Graphic & Service Badges) */}
        <div className="relative rounded-2xl sm:rounded-3xl p-4 sm:p-5 bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/70 dark:from-[#0b1026] dark:via-[#0e1736] dark:to-[#121c42] border border-indigo-200/80 dark:border-cyan-500/30 backdrop-blur-xl shadow-md shadow-indigo-500/5 dark:shadow-2xl dark:shadow-indigo-950/50 overflow-hidden flex items-center gap-3.5 sm:gap-4 transition-all">
          
          {/* High-Resolution Titanium Violet Samsung Galaxy Phone */}
          <div className="w-14 h-16 sm:w-18 sm:h-20 relative shrink-0 drop-shadow-[0_0_18px_rgba(168,85,247,0.35)]">
            <Image
              src="/images/promo_samsung_clean.png"
              alt="Samsung Galaxy S24 Titanium Violet"
              width={120}
              height={140}
              className="w-full h-full object-contain hover:scale-105 transition-transform"
              priority
            />
          </div>

          {/* Title & 3 Glowing Service Badges */}
          <div className="space-y-1 text-start flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-tight truncate">
                Samsung FRP Remove
              </h3>
              <span className="font-black text-xs sm:text-sm text-slate-400 dark:text-slate-300 tracking-widest font-sans select-none shrink-0">
                SAMSUNG
              </span>
            </div>
            
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 pt-1">
              {/* 1 - 5 Minutes */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-300 text-purple-700 dark:bg-purple-900/40 dark:border-purple-500/50 dark:text-purple-300 text-[9px] sm:text-[10px] font-bold shadow-xs">
                <Clock className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                <span>1 - 5 Mins</span>
              </span>

              {/* 100% REFUND */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-500/50 dark:text-emerald-300 text-[9px] sm:text-[10px] font-bold shadow-xs">
                <Zap className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>100% REFUND</span>
              </span>

              {/* DIRECT API */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 border border-sky-300 text-sky-700 dark:bg-cyan-950/40 dark:border-cyan-500/50 dark:text-cyan-300 text-[9px] sm:text-[10px] font-bold shadow-xs">
                <Download className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                <span>DIRECT API</span>
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
