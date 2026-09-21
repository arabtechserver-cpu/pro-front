"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Server, Monitor, ShoppingCart } from "lucide-react";

interface ServiceLanesProps {
  lang: string;
  config?: {
    imeiTitle?: string;
    imeiDesc?: string;
    imeiUrl?: string;
    serverTitle?: string;
    serverDesc?: string;
    serverUrl?: string;
    remoteTitle?: string;
    remoteDesc?: string;
    remoteUrl?: string;
    storeTitle?: string;
    storeDesc?: string;
    storeUrl?: string;
  };
}

export default function ServiceLanes({ lang, config }: ServiceLanesProps) {
  const isAr = lang === "ar";

  const lanes = [
    {
      id: "imei",
      title: isAr ? "خدمات IMEI" : "IMEI Services",
      subTitle: "",
      desc: isAr ? "فك الشفرات وإزالة القيود لجميع الموديلات" : "Carrier unlock & restriction removal for all models",
      btnText: isAr ? "عرض الخدمات" : "View Services",
      url: config?.imeiUrl || `/${lang}/pricing?cat=imei`,
      icon: Smartphone,
      iconColor: "text-emerald-500 dark:text-[#00e599]",
      btnClass: "bg-[#e6faf2] hover:bg-[#d1f5e7] text-[#00a86b] border border-[#a3e9cb] dark:bg-[#013529] dark:hover:bg-[#024a3a] dark:text-[#00e599] dark:border-[#00d084]/60"
    },
    {
      id: "server",
      title: isAr ? "خدمات السيرفرات" : "Server Services",
      subTitle: isAr ? "والبرمجة والتراخيص" : "& Software Licenses",
      desc: isAr ? "تفعيل سيرفرات مختلفة بأسرع وقت وأعلى موثوقية" : "Fastest & most reliable server activations",
      btnText: isAr ? "عرض الخدمات" : "View Services",
      url: config?.serverUrl || `/${lang}/pricing?cat=server`,
      icon: Server,
      iconColor: "text-blue-500 dark:text-[#38bdf8]",
      btnClass: "bg-[#ebf5ff] hover:bg-[#dbeafe] text-[#1d4ed8] border border-[#bfdbfe] dark:bg-[#032b53] dark:hover:bg-[#063c73] dark:text-[#38bdf8] dark:border-[#0099ff]/60"
    },
    {
      id: "remote",
      title: isAr ? "خدمات التحكم عن بعد" : "Remote Tech Services",
      subTitle: "",
      desc: isAr ? "حلول ذكية وسريعة وآمنة بواسطة فريق متخصص" : "Fast & secure remote solutions by expert team",
      btnText: isAr ? "طلب خدمة" : "Request Service",
      url: config?.remoteUrl || `/${lang}/pricing?cat=remote`,
      icon: Monitor,
      iconColor: "text-amber-500 dark:text-[#fbbf24]",
      btnClass: "bg-[#fef7ee] hover:bg-[#fdedd8] text-[#c25e00] border border-[#fed7aa] dark:bg-[#381f08] dark:hover:bg-[#4d2c0c] dark:text-[#fbbf24] dark:border-[#f59e0b]/60"
    },
    {
      id: "store",
      title: isAr ? "الأدوات والمتجر" : "Tools & Digital Store",
      subTitle: "",
      desc: isAr ? "أدوات مميزة وباقات للمحترفين" : "Exclusive tools & professional bundles",
      btnText: isAr ? "تصفح المتجر" : "Browse Store",
      url: config?.storeUrl || `/${lang}/pricing?cat=store`,
      icon: ShoppingCart,
      iconColor: "text-purple-500 dark:text-[#c084fc]",
      btnClass: "bg-[#f8f0fe] hover:bg-[#f3e3fd] text-[#7e22ce] border border-[#e9d5ff] dark:bg-[#2d0e52] dark:hover:bg-[#3e1470] dark:text-[#c084fc] dark:border-[#a855f7]/60"
    }
  ];

  return (
    <section className="w-full mb-8 sm:mb-12">
      {/* Centered Header matching Mockup */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
            {isAr ? "مسارات الخدمات الرئيسية" : "Main Service Tracks"}
          </h2>
          <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
        </div>
        <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
          {isAr ? "اختر المسار المناسب لاحتياجاتك في عالم الـ GSM" : "Choose the right track for your needs in the GSM world"}
        </p>
      </div>

      {/* 4 Cards Grid - 2x2 on Mobile, 4 Columns on Desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
        {lanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <div
              key={lane.id}
              className="p-3.5 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#061224] border border-slate-200/90 dark:border-cyan-500/20 hover:border-slate-300 dark:hover:border-cyan-500/40 shadow-xs hover:shadow-md dark:shadow-none transition-all flex flex-col items-center justify-between text-center min-h-[210px] sm:min-h-[260px] group"
            >
              <div className="flex flex-col items-center w-full">
                {/* Center Icon */}
                <div className="mb-2.5 sm:mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${lane.iconColor}`} />
                </div>

                {/* Title */}
                <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                  <div>{lane.title}</div>
                  {lane.subTitle && <div className="mt-0.5">{lane.subTitle}</div>}
                </h3>

                {/* Description */}
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1.5 sm:mt-2.5 max-w-[200px]">
                  {lane.desc}
                </p>
              </div>

              {/* Action Pill Button at bottom */}
              <Link
                href={lane.url}
                className={`w-full max-w-[130px] sm:max-w-[155px] py-1.5 sm:py-2 px-3 sm:px-4 rounded-full text-xs font-bold transition-all text-center mt-3 sm:mt-5 ${lane.btnClass} shadow-xs active:scale-98`}
              >
                {lane.btnText}
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
