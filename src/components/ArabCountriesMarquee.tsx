"use client";

import React from "react";
import { HeartHandshake } from "lucide-react";

interface ArabCountriesMarqueeProps {
  lang?: string;
  className?: string;
}

interface SolidarityItem {
  code: string;
  countryAr: string;
  countryEn: string;
  regionsAr: string;
  regionsEn: string;
  messageAr: string;
  messageEn: string;
  accent: string;
}

const SOLIDARITY_LIST: SolidarityItem[] = [
  {
    code: "PS",
    countryAr: "فلسطين الحبيبة",
    countryEn: "Palestine",
    regionsAr: "غزة • القدس الشريف • الضفة الغربية • جنين • رفح • خانيونس",
    regionsEn: "Gaza • Jerusalem • West Bank • Jenin • Rafah • Khan Yunis",
    messageAr: "كل الدعم والتضامن لرمز الصمود والعزة، قلوبنا ودعواتنا معكم دائما وأبدا، حفظكم الله وثبتكم",
    messageEn: "Unwavering solidarity with the enduring spirit of Palestine; our thoughts and prayers are forever with you",
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
  },
  {
    code: "LB",
    countryAr: "لبنان الشقيق",
    countryEn: "Lebanon",
    regionsAr: "الجنوب • بيروت • الضاحية • البقاع • النبطية • صور",
    regionsEn: "South Lebanon • Beirut • Dahieh • Bekaa • Nabatieh • Tyre",
    messageAr: "بردا وسلاما على أهلنا الأحباء، كل التضامن والدعاء بحفظ لبنان وشعبه العزيز من كل مكروه وعدوان",
    messageEn: "Standing in deep solidarity with beloved Lebanon and its resilient people for peace and safety",
    accent: "text-rose-400 border-rose-500/30 bg-rose-500/10"
  },
  {
    code: "SD",
    countryAr: "السودان الحبيب",
    countryEn: "Sudan",
    regionsAr: "الخرطوم • دارفور • الجزيرة • الفاشر • سنار • كردفان",
    regionsEn: "Khartoum • Darfur • Gezira • El Fasher • Sennar • Kordofan",
    messageAr: "نسأل الله حقن الدماء وعودة السلام والاستقرار التام، كل الدعم والمحبة لأهلنا الكرام في سودان العروبة",
    messageEn: "Praying for peace, unity, and lasting security for our cherished brothers and sisters in Sudan",
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/10"
  },
  {
    code: "SY",
    countryAr: "سوريا الصامدة",
    countryEn: "Syria",
    regionsAr: "دمشق • حلب • إدلب • حمص • دير الزور • درعا",
    regionsEn: "Damascus • Aleppo • Idlib • Homs • Deir ez-Zor • Daraa",
    messageAr: "كل التضامن والدعاء بالفرج القريب والأمان الكامل لأهلنا الصابرين، حفظ الله سوريا وشعبها العظيم",
    messageEn: "Full support and prayers for peace, rebuilding, and prosperity for the resilient Syrian people",
    accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
  },
  {
    code: "YE",
    countryAr: "اليمن العزيز",
    countryEn: "Yemen",
    regionsAr: "صنعاء • عدن • تعز • الحديدة • مأرب • حضرموت",
    regionsEn: "Sanaa • Aden • Taiz • Hodeidah • Marib • Hadhramaut",
    messageAr: "يمن الحضارة والأصالة، نسأل الله أن يمن بالأمن والرخاء والاستقرار على أهلنا الأوفياء في كل ربوعه",
    messageEn: "Wishing peace, prosperity, and enduring security across all provinces of authentic Yemen",
    accent: "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
  },
  {
    code: "LY",
    countryAr: "ليبيا الغالية",
    countryEn: "Libya",
    regionsAr: "طرابلس • بنغازي • درنة • مصراتة • سبها • الزاوية",
    regionsEn: "Tripoli • Benghazi • Derna • Misrata • Sabha • Zawiya",
    messageAr: "كل الدعم والأمنيات بوحدة الصف ودوام الاستقرار والازدهار لأهلنا وإخواننا في ليبيا الحبيبة",
    messageEn: "Unconditional support for unity, stability, and peaceful prosperity across beloved Libya",
    accent: "text-teal-400 border-teal-500/30 bg-teal-500/10"
  },
  {
    code: "IQ",
    countryAr: "العراق الأبي",
    countryEn: "Iraq",
    regionsAr: "بغداد • البصرة • نينوى • أربيل • الأنبار • النجف",
    regionsEn: "Baghdad • Basra • Nineveh • Erbil • Anbar • Najaf",
    messageAr: "بلاد الرافدين والتاريخ الشامخ، حفظ الله العراق وأهله الكرام وأدام عليهم نعمة الأمان والسلام",
    messageEn: "Honoring the historic resilience of Iraq; may enduring security and flourishing grace its land",
    accent: "text-sky-400 border-sky-500/30 bg-sky-500/10"
  },
  {
    code: "SO",
    countryAr: "الصومال الشقيق",
    countryEn: "Somalia",
    regionsAr: "مقديشو • بونتلاند • صوماليلاند • كيسمايو • بيدوا",
    regionsEn: "Mogadishu • Puntland • Somaliland • Kismayo • Baidoa",
    messageAr: "كل الدعم والتضامن مع إخواننا في الصومال، نسأل الله لهم دوام الأمان والاستقرار والنماء",
    messageEn: "Heartfelt solidarity and support for the security, recovery, and advancement of Somalia",
    accent: "text-purple-400 border-purple-500/30 bg-purple-500/10"
  }
];

export default function ArabCountriesMarquee({ lang = "ar", className = "" }: ArabCountriesMarqueeProps) {
  const isAr = lang === "ar";

  const renderContentBlock = (blockKey: string) => (
    <div className="flex shrink-0 items-center gap-4 sm:gap-6 px-4">
      <div className="flex items-center gap-2 bg-gradient-to-r from-red-500/15 via-amber-500/15 to-emerald-500/15 text-amber-300 px-3 py-1 rounded-full border border-amber-400/30 font-bold shrink-0 shadow-sm">
        <HeartHandshake className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="text-xs font-bold tracking-wide">
          {isAr
            ? "كل الدعم والتضامن الكامل مع إخواننا وأهلنا في كافة الدول الشقيقة المتأثرة بالحروب والأزمات"
            : "Full Solidarity & Brotherly Support To All Arab Nations Impacted By Wars & Crises"}
        </span>
      </div>

      {SOLIDARITY_LIST.map((item) => (
        <div
          key={`${blockKey}-${item.code}`}
          className="group flex items-center gap-2.5 bg-[#0d1422]/90 hover:bg-[#131d32] border border-slate-800/90 hover:border-amber-500/40 px-3.5 py-1 rounded-full text-xs transition-all shrink-0 shadow-sm"
        >
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black border ${item.accent}`}>
            {item.code}
          </span>

          <span className="font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
            {isAr ? item.countryAr : item.countryEn}
          </span>

          <span className="text-slate-500 font-mono text-[11px]">•</span>

          <span className="text-slate-400 group-hover:text-slate-300 transition-colors text-[11px] font-medium">
            ({isAr ? item.regionsAr : item.regionsEn})
          </span>

          <span className="text-slate-600 font-mono text-[11px]">|</span>

          <span className="text-slate-200 group-hover:text-white transition-colors font-normal">
            {isAr ? item.messageAr : item.messageEn}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`w-full bg-[#080d16]/90 backdrop-blur-md border-b border-amber-500/20 relative z-20 overflow-hidden shadow-sm ${className}`}>
      {/* Edge gradient masks for smooth text entrance & exit */}
      <div className="absolute top-0 start-0 w-12 sm:w-20 h-full bg-gradient-to-r rtl:bg-gradient-to-l from-[#080d16] to-transparent z-10 pointer-events-none" />
      <div className="absolute top-0 end-0 w-16 sm:w-24 h-full bg-gradient-to-l rtl:bg-gradient-to-r from-[#080d16] to-transparent z-10 pointer-events-none" />

      {/* Continuously Scrolling Content Track */}
      <div className="w-full flex whitespace-nowrap overflow-hidden py-2 sm:py-2.5" dir="ltr">
        <div className="flex w-max animate-marquee-slow hover:[animation-play-state:paused] cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-300">
          {renderContentBlock("solidarity-1")}
          {renderContentBlock("solidarity-2")}
        </div>
      </div>
    </div>
  );
}
