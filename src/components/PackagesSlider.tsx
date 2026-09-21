"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  LayoutGrid,
  Star,
  CheckCircle2,
  Zap
} from "lucide-react";

interface FeaturedPackage {
  id: string;
  nameAr: string;
  nameEn: string;
  subAr?: string;
  subEn?: string;
  badgeAr?: string;
  badgeEn?: string;
  isPopular?: boolean;
  startingPrice: string;
  categoryAr?: string;
  categoryEn?: string;
  deliveryTimeAr?: string;
  deliveryTimeEn?: string;
  iconName?: string;
  image?: string;
  url: string;
}

interface PackagesSliderProps {
  lang: string;
  packages?: FeaturedPackage[];
}

const DEFAULT_PACKAGES: FeaturedPackage[] = [
  {
    id: "chimera",
    nameAr: "Chimera Tool",
    nameEn: "Chimera Tool",
    subAr: "Activation / Credits",
    subEn: "Activation / Credits",
    badgeAr: "Best Seller",
    badgeEn: "Best Seller",
    isPopular: true,
    startingPrice: "$106.59",
    categoryAr: "Official",
    categoryEn: "Official",
    url: "/pricing?section=Chimera%20Tool"
  },
  {
    id: "amt",
    nameAr: "Android Multi Tool",
    nameEn: "Android Multi Tool",
    subAr: "AMT Credits",
    subEn: "AMT Credits",
    badgeAr: "Popular",
    badgeEn: "Popular",
    isPopular: false,
    startingPrice: "$0.92",
    categoryAr: "Instant",
    categoryEn: "Instant",
    url: "/pricing?section=Android%20Multi%20Tool"
  },
  {
    id: "xiaomi",
    nameAr: "Xiaomi Remove Account",
    nameEn: "Xiaomi Remove Account",
    subAr: "",
    subEn: "",
    badgeAr: "Official",
    badgeEn: "Official",
    isPopular: false,
    startingPrice: "$3.41",
    categoryAr: "Fast Service",
    categoryEn: "Fast Service",
    url: "/pricing?section=Xiaomi%20Remove%20Account"
  }
];

function renderToolLogo(pkg: FeaturedPackage) {
  if (pkg.image) {
    return (
      <img
        src={pkg.image}
        alt={pkg.nameAr || pkg.nameEn}
        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/10 shrink-0 shadow-sm"
      />
    );
  }

  const key = `${pkg.id} ${pkg.nameAr} ${pkg.nameEn}`.toLowerCase();
  if (key.includes("xiaomi") || key.includes("شاومي")) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#ff6900] flex items-center justify-center text-white font-black text-xl sm:text-2xl shadow-sm shrink-0 select-none">
        mi
      </div>
    );
  }

  if (key.includes("amt") || key.includes("android multi tool")) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-100 dark:bg-[#091524] border border-red-300 dark:border-red-500/30 flex items-center justify-center text-red-500 font-black text-sm sm:text-base shadow-sm shrink-0 select-none tracking-tight">
        AMT
      </div>
    );
  }

  if (key.includes("chimera") || key.includes("شيميرا")) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shrink-0 select-none">
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
    );
  }

  const initials = (pkg.nameEn || pkg.nameAr || "PRO").slice(0, 3).toUpperCase();
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xs sm:text-sm shadow-sm shrink-0 select-none">
      {initials}
    </div>
  );
}

export default function PackagesSlider({ lang, packages }: PackagesSliderProps) {
  const isAr = lang === "ar";
  const displayPackages =
    Array.isArray(packages) && packages.length > 0 ? packages : DEFAULT_PACKAGES;

  const langPrefix = `/${lang}`;

  const resolveUrl = (url: string) => {
    if (!url) return `${langPrefix}/pricing`;
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("/")) return `${langPrefix}${url}`;
    return `${langPrefix}/${url}`;
  };

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* Header Matching Mockup */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "البيانات والتفعيلات الأكثر طلباً" : "Top In-Demand Packages"}
          </h2>
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
        </div>
        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400 mb-3">
          {isAr
            ? "اختر من بين أبرز الخدمات طلباً الآن"
            : "Choose from our top-selling services now"}
        </p>

        {/* View All Packages Pill Button */}
        <div className="flex justify-center">
          <Link
            href={resolveUrl("/pricing")}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-[#08182b] border border-slate-300 dark:border-cyan-500/40 hover:border-cyan-400 text-[11px] sm:text-xs font-bold text-slate-700 dark:text-cyan-300 hover:text-primary dark:hover:text-white transition-all shadow-sm"
          >
            <LayoutGrid className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>{isAr ? "عرض جميع الباقات" : "View All Packages"}</span>
          </Link>
        </div>
      </div>

      {/* Cards: Stacked vertically on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
        {displayPackages.map((pkg) => {
          const isChimera = pkg.id.includes("chimera") || pkg.nameEn.toLowerCase().includes("chimera");
          const isAmt = pkg.id.includes("amt") || pkg.nameEn.toLowerCase().includes("android");
          const isXiaomi = pkg.id.includes("xiaomi") || pkg.nameEn.toLowerCase().includes("xiaomi");

          return (
            <div
              key={pkg.id}
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/25 hover:border-cyan-400 dark:hover:border-cyan-400 shadow-sm dark:shadow-xl transition-all flex flex-col justify-between group min-h-[145px] sm:min-h-[165px]"
            >
              {/* Top Row: Logo on Right + Info */}
              <div className="flex items-start gap-3 sm:gap-4">
                {renderToolLogo(pkg)}

                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate leading-tight">
                    {isAr ? pkg.nameAr : pkg.nameEn}
                  </h3>
                  {pkg.subAr && (
                    <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5 font-medium">
                      {isAr ? pkg.subAr : pkg.subEn}
                    </span>
                  )}

                  {/* Badges strictly matching mockup */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5 mt-1.5">
                    {isChimera ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-[#0a2c1f] border border-emerald-200 dark:border-emerald-500/30 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                          <span>{isAr ? "Best Seller" : "Best Seller"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-[#092238] border border-sky-200 dark:border-cyan-500/30 text-[9px] sm:text-[10px] font-semibold text-sky-700 dark:text-cyan-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                          <span>{isAr ? "Official" : "Official"}</span>
                        </span>
                      </>
                    ) : isAmt ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 dark:bg-[#2c1d0a] border border-amber-200 dark:border-amber-500/30 text-[9px] sm:text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span>{isAr ? "Popular" : "Popular"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-[#092238] border border-sky-200 dark:border-cyan-500/30 text-[9px] sm:text-[10px] font-semibold text-sky-700 dark:text-cyan-300">
                          <Zap className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                          <span>{isAr ? "Instant" : "Instant"}</span>
                        </span>
                      </>
                    ) : isXiaomi ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-[#0a2c1f] border border-emerald-200 dark:border-emerald-500/30 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                          <span>{isAr ? "Official" : "Official"}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-[#092238] border border-sky-200 dark:border-cyan-500/30 text-[9px] sm:text-[10px] font-semibold text-sky-700 dark:text-cyan-300">
                          <Zap className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                          <span>{isAr ? "Fast Service" : "Fast Service"}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-sky-50 dark:bg-[#092238] border border-sky-200 dark:border-cyan-500/30 text-[9px] sm:text-[10px] font-semibold text-sky-700 dark:text-cyan-300">
                          <CheckCircle2 className="w-2.5 h-2.5 text-sky-600 dark:text-cyan-400" />
                          <span>{pkg.categoryAr || (isAr ? "Official" : "Official")}</span>
                        </span>
                        {pkg.badgeAr && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-[#0a2c1f] border border-emerald-200 dark:border-emerald-500/30 text-[9px] sm:text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                            <Star className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                            <span>{pkg.badgeAr}</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Price on Right + Green Button on Left */}
              <div className="pt-2.5 sm:pt-3 mt-2.5 sm:mt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2.5 sm:gap-3">
                <div className="text-start">
                  <span className="text-base sm:text-xl font-black text-sky-600 dark:text-[#00e5ff] font-mono tracking-tight block leading-tight">
                    {pkg.startingPrice}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                    {isAr ? "يبدأ من" : "Starts at"}
                  </span>
                </div>

                <Link
                  href={resolveUrl(pkg.url)}
                  className="px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-[#00d084] hover:bg-[#00b975] text-[#052216] font-black text-xs sm:text-sm shadow-sm transition-all flex items-center gap-1.5 shrink-0"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#052216]" />
                  <span>{isAr ? "اطلب الآن" : "Order Now"}</span>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
