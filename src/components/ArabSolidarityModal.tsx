"use client";

import React, { useState, useEffect, useCallback } from "react";
import { HeartHandshake, X, ShieldAlert, Sparkles, CheckCircle2 } from "lucide-react";

interface ArabSolidarityModalProps {
  lang?: string;
}

interface CountrySolidarityData {
  code: string;
  countryAr: string;
  countryEn: string;
  regionsAr: string;
  regionsEn: string;
  messageAr: string;
  messageEn: string;
  badgeAccent: string;
  borderAccent: string;
}

const STORAGE_KEY = "arab_solidarity_modal_dismissed_until";
const ONE_HOUR_MS = 60 * 60 * 1000;

const COUNTRIES_LIST: CountrySolidarityData[] = [
  {
    code: "PS",
    countryAr: "فلسطين الحبيبة",
    countryEn: "Palestine",
    regionsAr: "غزة • القدس الشريف • الضفة الغربية • جنين • رفح • خانيونس",
    regionsEn: "Gaza • Jerusalem • West Bank • Jenin • Rafah • Khan Yunis",
    messageAr: "كل الدعم والتضامن لرمز الصمود والعزة، قلوبنا ودعواتنا معكم دائما وأبدا، حفظكم الله وثبتكم ورفع البلاء.",
    messageEn: "Unwavering solidarity with the enduring resilience of Palestine; our hearts and prayers remain forever with you.",
    badgeAccent: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    borderAccent: "border-emerald-500/20 hover:border-emerald-500/40"
  },
  {
    code: "LB",
    countryAr: "لبنان الشقيق",
    countryEn: "Lebanon",
    regionsAr: "الجنوب • بيروت • الضاحية • البقاع • النبطية • صور",
    regionsEn: "South Lebanon • Beirut • Dahieh • Bekaa • Nabatieh • Tyre",
    messageAr: "بردا وسلاما على أهلنا الأحباء، كل التضامن والدعاء بحفظ لبنان وشعبه العزيز من كل مكروه وعدوان.",
    messageEn: "Standing in profound solidarity with beloved Lebanon and its people for complete peace and security.",
    badgeAccent: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    borderAccent: "border-rose-500/20 hover:border-rose-500/40"
  },
  {
    code: "SD",
    countryAr: "السودان الحبيب",
    countryEn: "Sudan",
    regionsAr: "الخرطوم • دارفور • الجزيرة • الفاشر • سنار • كردفان",
    regionsEn: "Khartoum • Darfur • Gezira • El Fasher • Sennar • Kordofan",
    messageAr: "نسأل الله حقن الدماء وعودة السلام والاستقرار التام، كل الدعم والمحبة لأهلنا الكرام في سودان العروبة.",
    messageEn: "Praying for peace, unity, and lasting security for our cherished brothers and sisters across Sudan.",
    badgeAccent: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    borderAccent: "border-amber-500/20 hover:border-amber-500/40"
  },
  {
    code: "SY",
    countryAr: "سوريا الصامدة",
    countryEn: "Syria",
    regionsAr: "دمشق • حلب • إدلب • حمص • دير الزور • درعا",
    regionsEn: "Damascus • Aleppo • Idlib • Homs • Deir ez-Zor • Daraa",
    messageAr: "كل التضامن والدعاء بالفرج القريب والأمان الكامل لأهلنا الصابرين، حفظ الله سوريا وشعبها العظيم.",
    messageEn: "Full support and heartfelt prayers for peace, rebuilding, and well-being for the resilient Syrian people.",
    badgeAccent: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    borderAccent: "border-cyan-500/20 hover:border-cyan-500/40"
  },
  {
    code: "YE",
    countryAr: "اليمن العزيز",
    countryEn: "Yemen",
    regionsAr: "صنعاء • عدن • تعز • الحديدة • مأرب • حضرموت",
    regionsEn: "Sanaa • Aden • Taiz • Hodeidah • Marib • Hadhramaut",
    messageAr: "يمن الحضارة والأصالة، نسأل الله أن يمن بالأمن والرخاء والاستقرار على أهلنا الأوفياء في كل ربوعه.",
    messageEn: "Wishing peace, prosperity, and enduring security across all provinces of authentic Yemen.",
    badgeAccent: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    borderAccent: "border-indigo-500/20 hover:border-indigo-500/40"
  },
  {
    code: "LY",
    countryAr: "ليبيا الغالية",
    countryEn: "Libya",
    regionsAr: "طرابلس • بنغازي • درنة • مصراتة • سبها • الزاوية",
    regionsEn: "Tripoli • Benghazi • Derna • Misrata • Sabha • Zawiya",
    messageAr: "كل الدعم والأمنيات بوحدة الصف ودوام الاستقرار والازدهار لأهلنا وإخواننا في ليبيا الحبيبة.",
    messageEn: "Unconditional support for unity, stability, and peaceful prosperity across beloved Libya.",
    badgeAccent: "bg-teal-500/15 text-teal-400 border-teal-500/30",
    borderAccent: "border-teal-500/20 hover:border-teal-500/40"
  },
  {
    code: "IQ",
    countryAr: "العراق الأبي",
    countryEn: "Iraq",
    regionsAr: "بغداد • البصرة • نينوى • أربيل • الأنبار • النجف",
    regionsEn: "Baghdad • Basra • Nineveh • Erbil • Anbar • Najaf",
    messageAr: "بلاد الرافدين والتاريخ الشامخ، حفظ الله العراق وأهله الكرام وأدام عليهم نعمة الأمان والسلام.",
    messageEn: "Honoring the historic resilience of Iraq; may enduring security and flourishing grace its land.",
    badgeAccent: "bg-sky-500/15 text-sky-400 border-sky-500/30",
    borderAccent: "border-sky-500/20 hover:border-sky-500/40"
  },
  {
    code: "SO",
    countryAr: "الصومال الشقيق",
    countryEn: "Somalia",
    regionsAr: "مقديشو • بونتلاند • صوماليلاند • كيسمايو • بيدوا",
    regionsEn: "Mogadishu • Puntland • Somaliland • Kismayo • Baidoa",
    messageAr: "كل الدعم والتضامن مع إخواننا في الصومال، نسأل الله لهم دوام الأمان والاستقرار والنهضة.",
    messageEn: "Heartfelt solidarity and support for the safety, recovery, and advancement of Somalia.",
    badgeAccent: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    borderAccent: "border-purple-500/20 hover:border-purple-500/40"
  }
];

export default function ArabSolidarityModal({ lang = "ar" }: ArabSolidarityModalProps) {
  const isAr = lang === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const rawUntil = localStorage.getItem(STORAGE_KEY);
      if (rawUntil) {
        const untilTime = parseInt(rawUntil, 10);
        if (!isNaN(untilTime) && Date.now() < untilTime) {
          return;
        }
      }
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 400);
      return () => clearTimeout(timer);
    } catch {
      setIsOpen(true);
    }
  }, []);

  const handleDismiss = useCallback(() => {
    setIsOpen(false);
    try {
      const expiry = Date.now() + ONE_HOUR_MS;
      localStorage.setItem(STORAGE_KEY, expiry.toString());
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleDismiss]);

  if (!mounted || !isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="solidarity-modal-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
    >
      <div
        className="fixed inset-0"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      <div
        className="relative w-full max-w-3xl my-auto rounded-3xl bg-[#0a101d] border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col max-h-[90vh] z-10 animate-in zoom-in-95 duration-300"
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* Modal Top Glow & Header */}
        <div className="relative p-5 sm:p-6 pb-4 border-b border-white/10 bg-gradient-to-b from-[#141f35] to-[#0a101d]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

          {/* Close X Button */}
          <button
            onClick={handleDismiss}
            aria-label={isAr ? "إغلاق الإعلان" : "Close Announcement"}
            className="absolute top-4 end-4 sm:top-5 sm:end-5 p-2 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 transition-all shadow-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3.5 pe-12">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-400 shrink-0 shadow-inner">
              <HeartHandshake className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-300 text-[11px] font-bold mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>{isAr ? "بيان تضامن ومؤازرة رسمية" : "Official Solidarity Statement"}</span>
              </div>
              <h2 id="solidarity-modal-title" className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {isAr
                  ? "كل الدعم والتضامن الكامل مع أهلنا في الدول العربية الشقيقة"
                  : "Full Solidarity & Heartfelt Support to Our Brothers Across Arab Nations"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                {isAr
                  ? "قلوبنا ودعواتنا الدائمة مع شعوبنا وأوطاننا الصامدة في مواجهة الحروب والعدوان والأزمات الداخلية."
                  : "Our unwavering support and continuous prayers for our resilient peoples facing wars, aggression, and crises."}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content: Countries & Messages */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COUNTRIES_LIST.map((item) => (
              <div
                key={item.code}
                className={`p-3.5 sm:p-4 rounded-2xl bg-[#0e1628]/80 border ${item.borderAccent} transition-all hover:bg-[#131e36] flex flex-col justify-between shadow-sm`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-bold text-sm sm:text-base text-white">
                      {isAr ? item.countryAr : item.countryEn}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-mono font-black border ${item.badgeAccent}`}>
                      {item.code}
                    </span>
                  </div>

                  <div className="text-[11px] text-amber-300/80 font-medium mb-2 leading-relaxed">
                    {isAr ? item.regionsAr : item.regionsEn}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {isAr ? item.messageAr : item.messageEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#080d17] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 text-center sm:text-start">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {isAr
                ? "عند إغلاق هذا الإعلان، لن يظهر مجدداً لمدة 60 دقيقة كاملة حتى مع تحديث الصفحة."
                : "Once dismissed, this announcement remains hidden for 60 minutes even on refresh."}
            </span>
          </div>

          <button
            onClick={handleDismiss}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            {isAr ? "إغلاق ومتابعة للموقع" : "Dismiss & Continue to Site"}
          </button>
        </div>
      </div>
    </div>
  );
}
