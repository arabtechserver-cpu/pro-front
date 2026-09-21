"use client";

import React from "react";
import Link from "next/link";
import { 
  Database, 
  Settings, 
  Code2, 
  RefreshCw, 
  Tag, 
  Headphones 
} from "lucide-react";

interface CapabilitiesGridProps {
  lang: string;
}

export default function CapabilitiesGrid({ lang }: CapabilitiesGridProps) {
  const isAr = lang === "ar";

  const features = [
    {
      id: "ui",
      titleAr: "واجهة سهلة",
      titleEn: "Easy Interface",
      descAr: "تجربة مستخدم فريدة",
      descEn: "Unique user experience",
      icon: Database,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      href: `/${lang}/pricing`
    },
    {
      id: "repair",
      titleAr: "فحص وتصليح\nFRP و MDM",
      titleEn: "Check & Repair\nFRP & MDM",
      descAr: "حلول معتمدة وآمنة",
      descEn: "Certified & safe solutions",
      icon: Settings,
      iconColor: "text-blue-500 dark:text-blue-400",
      href: `/${lang}/pricing?cat=imei`
    },
    {
      id: "api",
      titleAr: "وربط API",
      titleEn: "API Integration",
      descAr: "تكامل سريع وسهل",
      descEn: "Fast & easy integration",
      icon: Code2,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      href: `/${lang}/pricing?cat=server`
    },
    {
      id: "updates",
      titleAr: "تحديثات مستمرة",
      titleEn: "Continuous Updates",
      descAr: "أحدث الإصدارات أول بأول",
      descEn: "Latest versions constantly",
      icon: RefreshCw,
      iconColor: "text-cyan-500 dark:text-cyan-400",
      href: `/${lang}/pricing?cat=server`
    },
    {
      id: "pricing",
      titleAr: "أسعار تنافسية",
      titleEn: "Competitive Pricing",
      descAr: "أفضل الأسعار دائماً",
      descEn: "Always the best rates",
      icon: Tag,
      iconColor: "text-teal-500 dark:text-teal-400",
      href: `/${lang}/pricing`
    },
    {
      id: "support",
      titleAr: "دعم فني 24/7",
      titleEn: "24/7 Tech Support",
      descAr: "فريق متخصص دائماً معك",
      descEn: "Expert team always here",
      icon: Headphones,
      iconColor: "text-blue-500 dark:text-cyan-400",
      href: `/${lang}/contact`
    }
  ];

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* Centered Header Matching Mockup */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "لماذا تختار منصة عرب تك برو؟" : "Why Choose Arab Tech Pro Server?"}
          </h2>
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
        </div>
        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
          {isAr ? "نحن نوفر لك أفضل تجربة في عالم خدمات الـ GSM" : "We provide you with the best experience in GSM services"}
        </p>
      </div>

      {/* 6 Cards: 2 cols on mobile (3 rows of 2), 3 on tablet, 6 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-4">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className="p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-400 transition-all flex flex-col items-center text-center group shadow-sm min-h-[135px] sm:min-h-[155px] justify-between"
            >
              {/* Icon Container */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-50 dark:bg-[#081930] border border-slate-200/80 dark:border-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.iconColor}`} />
              </div>

              {/* Title */}
              <h3 className="text-xs sm:text-[13px] font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-tight whitespace-pre-line mt-1.5">
                {isAr ? item.titleAr : item.titleEn}
              </h3>

              {/* Description */}
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                {isAr ? item.descAr : item.descEn}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
