"use client";

import React from "react";
import Link from "next/link";
import { Fingerprint, Server, Radio, ShoppingBag, ArrowLeft, ArrowRight } from "lucide-react";

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
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const lanes = [
    {
      id: "imei",
      title: config?.imeiTitle || (isAr ? "خدمات الـ IMEI" : "IMEI Unlocking Services"),
      desc: config?.imeiDesc || (isAr ? "فك شفرات الشبكات رسمياً، تقارير فحص السيريال، وتخطي حماية الأجهزة." : "Official network unlocking, IMEI check reports, and device security bypass."),
      url: config?.imeiUrl || `/${lang}/pricing?cat=imei`,
      icon: Fingerprint,
      accentColor: "from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400 hover:border-blue-400/60",
      iconBg: "bg-blue-500/15 border-blue-400/30 text-blue-400",
      topGlow: "group-hover:via-blue-400",
      badge: isAr ? "فك شبكات وتخطي" : "Factory Carrier Unlock"
    },
    {
      id: "server",
      title: config?.serverTitle || (isAr ? "خدمات السيرفرات" : "Server Services"),
      desc: config?.serverDesc || (isAr ? "شحن أرصدة الكريدت الفوري، تفعيلات وتراخيص البرامج والبوكسات 24/7." : "Instant server credits top-up, box & dongle activations and license renewals."),
      url: config?.serverUrl || `/${lang}/pricing?cat=server`,
      icon: Server,
      accentColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400 hover:border-emerald-400/60",
      iconBg: "bg-emerald-500/15 border-emerald-400/30 text-emerald-400",
      topGlow: "group-hover:via-emerald-400",
      badge: isAr ? "أرصدة وتراخيص" : "Credits & Activations"
    },
    {
      id: "remote",
      title: config?.remoteTitle || (isAr ? "خدمات التحكم عن بعد" : "Remote Tech Services"),
      desc: config?.remoteDesc || (isAr ? "جلسات صيانة موجهة وتخطي حسابات FRP والسوفت وير عبر برامج التحكم." : "Assisted remote sessions, FRP bypass, and expert technical software support."),
      url: config?.remoteUrl || `/${lang}/pricing?cat=remote`,
      icon: Radio,
      accentColor: "from-sky-500/20 to-cyan-500/10 border-sky-500/30 text-sky-400 hover:border-sky-400/60",
      iconBg: "bg-sky-500/15 border-sky-400/30 text-sky-400",
      topGlow: "group-hover:via-sky-400",
      badge: isAr ? "دعم وتوجيه فني" : "Remote Assistance"
    },
    {
      id: "store",
      title: config?.storeTitle || (isAr ? "الأدوات والمتجر" : "Tools & Digital Store"),
      desc: config?.storeDesc || (isAr ? "تراخيص رقمية، باقات محترفي السوفت وير، وحلول خاصة للوكلاء والمحلات." : "Digital software licenses, professional repair bundles, and exclusive reseller packs."),
      url: config?.storeUrl || `/${lang}/pricing?cat=store`,
      icon: ShoppingBag,
      accentColor: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400 hover:border-amber-400/60",
      iconBg: "bg-amber-500/15 border-amber-400/30 text-amber-400",
      topGlow: "group-hover:via-amber-400",
      badge: isAr ? "باقات المحترفين" : "Pro Bundles"
    }
  ];

  return (
    <section className="w-full mb-8 sm:mb-12">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
            {isAr ? "بوابات الخدمات المعتمدة" : "OFFICIAL SERVICE PORTALS"}
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
            {isAr ? "مسارات الخدمات الرئيسية السريعة" : "Main Operational Lanes"}
          </h2>
        </div>
        <Link 
          href={`/${lang}/pricing`}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-sky-300 transition-colors"
        >
          <span>{isAr ? "جميع الخدمات والأسعار" : "View All Rates"}</span>
          <ArrowIcon className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {lanes.map((lane) => {
          const Icon = lane.icon;
          return (
            <Link
              key={lane.id}
              href={lane.url}
              className="relative p-5 sm:p-6 rounded-2xl bg-[#090f1a]/70 hover:bg-[#0e172a]/90 border border-white/10 hover:border-white/20 backdrop-blur-xl shadow-lg transition-all duration-300 group flex flex-col justify-between min-h-[170px] overflow-hidden"
            >
              <div 
                className={`absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent ${lane.topGlow} transition-all duration-500`} 
              />
              
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${lane.iconBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-slate-300 uppercase tracking-wider">
                  {lane.badge}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-base sm:text-lg text-white group-hover:text-sky-300 transition-colors mb-1.5 leading-snug">
                  {lane.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {lane.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white transition-colors mt-3">
                <span>{isAr ? "تصفح الأسعار والطلب" : "Browse & Order"}</span>
                <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
