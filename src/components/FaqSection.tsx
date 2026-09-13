"use client";

import React, { useState } from "react";

interface FaqSectionProps {
  lang: string;
}

export default function FaqSection({ lang }: FaqSectionProps) {
  const isAr = lang === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      id: "services",
      num: "01",
      categoryAr: "نطاق الخدمات",
      categoryEn: "Coverage Scope",
      qAr: "ما هي الخدمات المقدمة عبر المنصة؟",
      qEn: "What services are offered?",
      aAr: "نقدم خدمات فك شفرات الشبكات (IMEI)، تخطي حسابات iCloud، تخطي حماية FRP، تفعيل جميع بوكسات ودونجل السوفت وير (UnlockTool, Chimera, Borneo)، وخدمات السيرفر المؤتمتة على مدار الساعة.",
      aEn: "We offer factory IMEI unlocking, FRP bypass, iCloud removal, remote access tools, tool activations, server credits, and 24/7 automated portal delivery.",
    },
    {
      id: "speed",
      num: "02",
      categoryAr: "سرعة التنفيذ",
      categoryEn: "Processing Speed",
      qAr: "كم يستغرق وقت تنفيذ وتفعيل الطلبات؟",
      qEn: "How long does unlocking take?",
      aAr: "تتم معظم عمليات تفعيل السيرفر والبوكسات وخدمات فحص الـ IMEI بشكل فوري وتلقائي خلال 1 إلى 15 دقيقة فقط. بعض عمليات فك الشبكات الرسمية قد تعتمد على وقت استجابة مزود الخدمة.",
      aEn: "Most server activations and IMEI tool orders are delivered automatically within 1 to 15 minutes. Certain official carrier unlocks depend on carrier processing times.",
    },
    {
      id: "payment",
      num: "03",
      categoryAr: "وسائل الدفع",
      categoryEn: "Payment Gateways",
      qAr: "ما هي طرق ووسائل الدفع المدعومة؟",
      qEn: "What payment methods do you support?",
      aAr: "ندعم وسائل دفع متنوعة تشمل العملات الرقمية (USDT / Binance Pay / Bitcoin)، البطاقات الائتمانية (Visa / MasterCard)، المحافظ الإلكترونية المحلية (فودافون كاش / إنستاباي في مصر)، والعديد من الوسائل الأخرى.",
      aEn: "We support PayPal, Visa, MasterCard, USDT, Binance Pay, local digital wallets, and more with instant automated wallet top-up.",
    },
    {
      id: "requirements",
      num: "04",
      categoryAr: "المتطلبات والتشغيل",
      categoryEn: "Prerequisites",
      qAr: "هل أحتاج إلى برامج أو أجهزة إضافية؟",
      qEn: "Do I need special software or hardware?",
      aAr: "لا تحتاج لأي أجهزة خاصة لخدمات فك الشبكات وحسابات الـ IMEI؛ كل ما تحتاجه هو إرسال رقم الـ IMEI أو السيريال. بالنسبة لعمليات الدعم عن بعد، نوفر التوجيه المباشر عبر برامج التحكم مثل UltraViewer أو AnyDesk.",
      aEn: "No special hardware is required for IMEI and server services. For remote assisted unlocks, our specialists guide you step-by-step through remote desktop software.",
    },
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="relative py-12 sm:py-16 md:py-20 bg-transparent text-white overflow-hidden section-spotlight">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(37,99,235,0.06),transparent)] pointer-events-none"></div>

      <div className="w-full cyber-container relative z-10">
        {/* Section Header */}
        <div className="lamp-header max-w-2xl mx-auto mb-8 sm:mb-12 text-center" data-aos="fade-down" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1 rounded-full mb-3 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-400 font-bold text-xs uppercase tracking-wider font-mono">
              {isAr ? "مركز الإجابات المعتمد" : "VERIFIED FAQ"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-center tracking-tight">
            <span className="text-blue-400">
              {isAr ? "الأسئلة الشائعة " : "Frequently Asked "}
            </span>
            <span className="text-white">{isAr ? "والأكثر تداولاً" : "Questions"}</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-slate-300 max-w-xl mx-auto">
            {isAr
              ? "إجابات واضحة ومباشرة لأهم التساؤلات الفنية والمالية حول منصتنا وخدماتنا."
              : "Clear, direct answers to common technical and billing questions about our services."}
          </p>
        </div>

        {/* FAQ Grid: 1 col on mobile, 2 cols on tablet & desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 items-start">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.id}
                className={`lamp-card rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-all duration-300 relative border ${
                  isOpen
                    ? "border-cyan-400/50 bg-[#0d1525]/90 shadow-[0_0_25px_rgba(56,189,248,0.15)]"
                    : "border-white/10 hover:border-white/20 bg-[#0b101d]/70"
                }`}
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                suppressHydrationWarning
              >
                {/* Overhead neon accent line when open */}
                {isOpen && (
                  <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] pointer-events-none"></div>
                )}

                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-3.5 sm:p-4.5 md:p-5 text-start focus:outline-none transition-colors group gap-3"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1">
                    {/* Monospace Numeric Badge */}
                    <span
                      className={`font-mono text-[11px] sm:text-xs font-black px-2 py-0.5 rounded-lg border transition-colors shrink-0 ${
                        isOpen
                          ? "bg-cyan-500/20 border-cyan-400/60 text-cyan-300 shadow-sm"
                          : "bg-white/5 border-white/10 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/30"
                      }`}
                    >
                      {faq.num}
                    </span>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400/80 block mb-0.5">
                        {isAr ? faq.categoryAr : faq.categoryEn}
                      </span>
                      <h3
                        className={`text-xs sm:text-sm md:text-base font-bold transition-colors leading-snug ${
                          isOpen
                            ? "text-white"
                            : "text-slate-200 group-hover:text-white"
                        }`}
                      >
                        {isAr ? faq.qAr : faq.qEn}
                      </h3>
                    </div>
                  </div>

                  {/* Toggle Indicator Button */}
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0 ${
                      isOpen
                        ? "bg-cyan-500/20 border-cyan-400/50 text-cyan-300 rotate-45 shadow-[0_0_10px_rgba(34,211,238,0.4)]"
                        : "bg-surface-container-high/80 border-white/10 text-slate-400 group-hover:text-white group-hover:border-white/20 rotate-0"
                    }`}
                  >
                    <i className="fas fa-plus text-xs"></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-3.5 sm:px-4.5 md:px-5 pb-4 sm:pb-5 pt-2 text-slate-300 text-xs sm:text-sm leading-relaxed border-t border-white/[0.08] bg-[#070b14]/70">
                    <p className="border-s-2 border-cyan-400/60 ps-3 sm:ps-3.5 py-0.5">
                      {isAr ? faq.aAr : faq.aEn}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
