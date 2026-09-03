"use client";

import Link from "next/link";

interface LiveMetricsSectionProps {
  lang: string;
}

export default function LiveMetricsSection({ lang }: LiveMetricsSectionProps) {
  const isAr = lang === "ar";
  const langPrefix = `/${lang}`;

  return (
    <section className="w-full container mx-auto px-4 py-8 sm:py-12 space-y-10 sm:space-y-16">
      {/* ── 1. READY TO UNLOCK CTA BANNER (MATCHING SCREENSHOT) ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0b1329] via-[#091024] to-[#060a17] border border-outline-variant/30 p-6 sm:p-10 shadow-2xl">
        {/* Glow Highlights */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 right-10 w-72 h-48 bg-secondary/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
          {/* Mini Stats Ribbon above CTA (100K+ | 99.9% | 24/7) */}
          <div className="flex items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-bold tracking-wider">
            <span className="text-primary glow-cyan">100K+</span>
            <span className="text-outline-variant/50">•</span>
            <span className="text-secondary">99.9%</span>
            <span className="text-outline-variant/50">•</span>
            <span className="text-purple-400">24/7</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              {isAr ? "جاهز لفك قفل جهازك أو تفعيل أدواتك؟" : "Ready to Unlock Your Device?"}
            </h2>
            <p className="text-xs sm:text-base text-on-surface-variant max-w-lg mx-auto">
              {isAr 
                ? "اختر الإجراء المفضل لديك أدناه للبدء الفوري عبر بوابتنا المؤتمتة" 
                : "Choose your preferred action below to get started instantly with automated delivery"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <Link
              href={`${langPrefix}/pricing`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm sm:text-base shadow-[0_4px_25px_rgba(16,185,129,0.4)] flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <span className="text-lg">🚀</span>
              <span>{isAr ? "ابدأ بفك القفل الآن" : "Start Unlocking Now"}</span>
            </Link>

            <Link
              href={`${langPrefix}/pricing`}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-surface-container/60 hover:bg-surface-container border border-outline-variant/40 hover:border-primary/50 text-on-surface font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-[1.02] active:scale-95 backdrop-blur-md"
            >
              <span className="material-symbols-outlined text-lg text-primary">view_list</span>
              <span>{isAr ? "تصفح كافة الخدمات والأسعار" : "View All Services"}</span>
            </Link>
          </div>

          {/* Trust Indicators Strip */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4 text-xs font-semibold text-on-surface-variant border-t border-outline-variant/15">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="material-symbols-outlined text-base">bolt</span>
              <span>{isAr ? "تنفيذ فوري تلقائي" : "Instant Delivery"}</span>
            </span>
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="material-symbols-outlined text-base">verified_user</span>
              <span>{isAr ? "آمن ومضمون 100%" : "100% Secure"}</span>
            </span>
            <span className="flex items-center gap-1.5 text-purple-400">
              <span className="material-symbols-outlined text-base">support_agent</span>
              <span>{isAr ? "دعم مباشر 24/7" : "24/7 Support"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. LIVE PERFORMANCE METRICS SECTION (EXACT SCREENSHOT CLONE) ── */}
      <div className="space-y-8 sm:space-y-12">
        {/* Header Block */}
        <div className="flex flex-col items-center text-center space-y-3">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a1224] border border-emerald-500/30 text-emerald-400 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>{isAr ? "مؤشرات الأداء اللحظية" : "LIVE PERFORMANCE METRICS"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-on-surface tracking-tight font-display">
            {isAr ? "ريادة وتميز خدمات السيرفر" : "Unlocking Excellence"}
          </h2>

          <p className="text-xs sm:text-base text-on-surface-variant max-w-xl">
            {isAr 
              ? "إحصائيات مباشرة ومؤشرات أداء موثوقة تعكس كفاءة السيرفر وسرعة تنفيذ الطلبات" 
              : "Real-time statistics and performance indicators"}
          </p>
        </div>

        {/* The 3 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          {/* Card 1: Devices Unlocked */}
          <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e172e]/80 via-[#0a1122]/90 to-[#070b16] border border-emerald-500/20 hover:border-emerald-500/50 p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(16,185,129,0.15)] hover:-translate-y-1">
            {/* Top Glowing Ambient Orb */}
            <div className="absolute top-0 w-32 h-20 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

            {/* Icon Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 shadow-[0_0_25px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">lock_open</span>
            </div>

            {/* Value */}
            <div className="text-3xl sm:text-5xl font-black text-emerald-400 tracking-tight mb-2 font-display">
              500K+
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-2">
              {isAr ? "أجهزة تم فك قفلها" : "Devices Unlocked"}
            </h3>

            {/* Subtext Trend Pill */}
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-xs">trending_up</span>
                <span>{isAr ? "+12% نمو هذا الشهر" : "+12% this month"}</span>
              </span>
            </div>
          </div>

          {/* Card 2: Success Rate */}
          <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e172e]/80 via-[#0a1122]/90 to-[#070b16] border border-cyan-500/20 hover:border-cyan-500/50 p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(6,182,212,0.15)] hover:-translate-y-1">
            {/* Top Glowing Ambient Orb */}
            <div className="absolute top-0 w-32 h-20 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all"></div>

            {/* Icon Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-5 shadow-[0_0_25px_rgba(6,182,212,0.2)] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">show_chart</span>
            </div>

            {/* Value */}
            <div className="text-3xl sm:text-5xl font-black text-cyan-400 tracking-tight mb-2 font-display">
              99.8%
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-2">
              {isAr ? "نسبة النجاح والاعتمادية" : "Success Rate"}
            </h3>

            {/* Subtext Trend Pill */}
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-xs">verified</span>
                <span>{isAr ? "ريادة معتمدة عالمياً" : "Industry leading"}</span>
              </span>
            </div>
          </div>

          {/* Card 3: Expert Support */}
          <div className="relative group overflow-hidden rounded-3xl bg-gradient-to-b from-[#0e172e]/80 via-[#0a1122]/90 to-[#070b16] border border-purple-500/20 hover:border-purple-500/50 p-6 sm:p-8 flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_10px_35px_rgba(168,85,247,0.15)] hover:-translate-y-1">
            {/* Top Glowing Ambient Orb */}
            <div className="absolute top-0 w-32 h-20 bg-purple-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/20 transition-all"></div>

            {/* Icon Box */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 shadow-[0_0_25px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl sm:text-4xl">headset_mic</span>
            </div>

            {/* Value */}
            <div className="text-3xl sm:text-5xl font-black text-purple-400 tracking-tight mb-2 font-display">
              24/7
            </div>

            {/* Title */}
            <h3 className="text-base sm:text-lg font-bold text-on-surface mb-2">
              {isAr ? "دعم فني متخصص" : "Expert Support"}
            </h3>

            {/* Subtext Trend Pill */}
            <div className="mt-auto pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-purple-300 bg-purple-500/10 border border-purple-500/25 px-3 py-1 rounded-full">
                <span className="material-symbols-outlined text-xs">schedule</span>
                <span>{isAr ? "متاح على مدار الساعة" : "Always available"}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
