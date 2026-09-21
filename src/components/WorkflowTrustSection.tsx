"use client";

import React from "react";
import { 
  User, 
  Wallet, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  ShoppingCart, 
  ShieldCheck, 
  Zap, 
  RotateCcw, 
  Users 
} from "lucide-react";

interface WorkflowTrustSectionProps {
  lang: string;
}

export default function WorkflowTrustSection({ lang }: WorkflowTrustSectionProps) {
  const isAr = lang === "ar";
  const FlowChevron = isAr ? ChevronLeft : ChevronRight;

  const steps = [
    {
      step: 1,
      titleAr: "تحديد الخدمة",
      titleEn: "Select Service",
      descAr: "اختر الخدمة التي تحتاجها",
      descEn: "Choose the service you need",
      icon: User,
      iconColor: "text-cyan-400",
      glowBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
    },
    {
      step: 2,
      titleAr: "شحن المحفظة",
      titleEn: "Fund Wallet",
      descAr: "وادفع عبر وسائل الدفع المتاحة",
      descEn: "Pay via available payment methods",
      icon: Wallet,
      iconColor: "text-cyan-400",
      glowBg: "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(0,229,255,0.25)]"
    },
    {
      step: 3,
      titleAr: "تنفيذ فوري",
      titleEn: "Instant Execution",
      descAr: "واستلام التفعيل",
      descEn: "And receive activation",
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
      glowBg: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]"
    }
  ];

  const trustStats = [
    {
      value: "+500K",
      labelAr: "طلب منجز",
      labelEn: "Orders Completed",
      icon: ShoppingCart,
      color: "text-cyan-500 dark:text-cyan-400"
    },
    {
      value: "24/7",
      labelAr: "دعم VIP",
      labelEn: "VIP Support",
      icon: Users,
      color: "text-blue-500 dark:text-blue-400"
    },
    {
      value: "99.8%",
      labelAr: "نسبة نجاح",
      labelEn: "Success Rate",
      icon: ShieldCheck,
      color: "text-emerald-500 dark:text-emerald-400"
    },
    {
      value: "1 - 5 Mins",
      labelAr: "متوسط وقت التنفيذ",
      labelEn: "Avg Execution Time",
      icon: Zap,
      color: "text-cyan-500 dark:text-cyan-400"
    }
  ];

  return (
    <div className="w-full space-y-8 sm:space-y-12 mb-8 sm:mb-12">
      {/* 1. How It Works Section */}
      <section className="w-full">
        {/* Centered Header matching Mockup */}
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
            <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? "كيف تعمل المنصة؟" : "How The Platform Works?"}
            </h2>
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
            {isAr ? "بخطوات بسيطة وسريعة" : "In simple and fast steps"}
          </p>
        </div>

        {/* 3 Steps in Flow Grid with Icon on Right and Number on Left matching Mockup */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isLast = idx === steps.length - 1;
            return (
              <React.Fragment key={item.step}>
                <div className="flex-1 w-full p-3.5 sm:p-5 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/25 hover:border-cyan-400 dark:hover:border-cyan-400 shadow-sm flex items-center justify-between gap-3 transition-all group">
                  {/* Right (in RTL): Circular Soft Icon Container */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${isLast ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500" : "bg-cyan-50 dark:bg-cyan-950/50 text-cyan-500"} flex items-center justify-center shrink-0 border border-slate-100 dark:border-white/5`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div className="text-start">
                      <h3 className="text-xs sm:text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors leading-tight">
                        {isAr ? item.titleAr : item.titleEn}
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {isAr ? item.descAr : item.descEn}
                      </p>
                    </div>
                  </div>

                  {/* Left (in RTL): Bold Step Number */}
                  <span className="text-base sm:text-xl font-black text-slate-800 dark:text-slate-200 font-mono shrink-0">
                    {item.step}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex items-center justify-center text-cyan-400/50 px-1 shrink-0">
                    <FlowChevron className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* 2. Customer Trust Stats - 2x2 Grid on Mobile matching Mockup */}
      <section className="w-full">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
            <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? "أرقام تحدث عنها عملاؤنا" : "Numbers Our Clients Speak Of"}
            </h2>
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
            {isAr ? "ثقة متزايدة كل يوم" : "Growing trust every day"}
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {trustStats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div 
                key={i} 
                className="flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${st.color} shrink-0`} />
                  <span className="text-sm sm:text-lg font-black text-slate-900 dark:text-white font-mono tracking-tight">
                    {st.value}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {isAr ? st.labelAr : st.labelEn}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Supported Brands - 4 Columns Grid matching Mockup */}
      <section className="w-full">
        <div className="text-center mb-4 sm:mb-6">
          <div className="inline-flex items-center gap-2 mb-1">
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
            <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white">
              {isAr ? "الماركات المدعومة" : "Supported Brands"}
            </h2>
            <span className="h-[2px] w-5 sm:w-6 bg-cyan-500 dark:bg-cyan-400" />
          </div>
          <p className="text-[11px] sm:text-sm text-slate-600 dark:text-slate-400">
            {isAr ? "ندعم جميع الماركات الرئيسية" : "Supporting all major brands"}
          </p>
        </div>

        {/* 8 Brands in 4 columns (2 rows of 4) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {/* Row 1 */}
          {/* Samsung */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider font-sans">
              SAMSUNG
            </span>
          </div>

          {/* Xiaomi */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <div className="w-5 h-5 rounded bg-[#ff6900] flex items-center justify-center text-white font-black text-[10px]">
              mi
            </div>
          </div>

          {/* Huawei */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center gap-1 text-center">
            <svg className="w-3.5 h-3.5 fill-red-500 shrink-0" viewBox="0 0 24 24">
              <path d="M12 2c1 2 2 4 2 6s-1 4-2 4-2-2-2-4 1-4 2-6zm5 3c1.5 1.5 2.5 3.5 2.5 5.5s-1.5 3.5-3 3.5-2.5-1.5-2.5-3.5c0-1.5 1-3.5 3-5.5zm-10 0c2 2 3 4 3 5.5 0 2-1 3.5-2.5 3.5s-3-1.5-3-3.5 1-4 2.5-5.5z" />
            </svg>
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-800 dark:text-slate-200">HUAWEI</span>
          </div>

          {/* Qualcomm */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold text-blue-600 dark:text-blue-400 tracking-wider">
              Qualcomm
            </span>
          </div>

          {/* Row 2 */}
          {/* MediaTek */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-400 tracking-wider">
              MEDIATEK
            </span>
          </div>

          {/* Unisoc */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[10px] sm:text-xs font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              UNISOC
            </span>
          </div>

          {/* Oppo */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
              oppo
            </span>
          </div>

          {/* Vivo */}
          <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex items-center justify-center text-center">
            <span className="text-[11px] sm:text-xs font-bold text-sky-600 dark:text-sky-400 tracking-wider">
              vivo
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
