"use client";

import React, { useState } from "react";

interface FaqSectionProps {
  lang: string;
}

interface FaqItem {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

export default function FaqSection({ lang }: FaqSectionProps) {
  const isAr = lang === "ar";
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      qAr: "ما هي الخدمات المقدمة عبر المنصة؟",
      qEn: "What services are offered?",
      aAr: "نقدم خدمات فك شفرات الشبكات (IMEI)، تخطي حسابات iCloud، تخطي حماية FRP، تفعيل جميع بوكسات ودونجل السوفت وير (UnlockTool, Chimera, Borneo)، وخدمات السيرفر المؤتمتة على مدار الساعة.",
      aEn: "We offer factory IMEI unlocking, FRP bypass, iCloud removal, remote access tools, tool activations, server credits, and 24/7 automated portal delivery.",
    },
    {
      qAr: "كم يستغرق وقت تنفيذ وتفعيل الطلبات؟",
      qEn: "How long does unlocking take?",
      aAr: "تتم معظم عمليات تفعيل السيرفر والبوكسات وخدمات فحص الـ IMEI بشكل فوري وتلقائي خلال 1 إلى 15 دقيقة فقط. بعض عمليات فك الشبكات الرسمية قد تعتمد على وقت استجابة مزود الخدمة.",
      aEn: "Most server activations and IMEI tool orders are delivered automatically within 1 to 15 minutes. Certain official carrier unlocks depend on carrier processing times.",
    },
    {
      qAr: "ما هي طرق ووسائل الدفع المدعومة؟",
      qEn: "What payment methods do you support?",
      aAr: "ندعم وسائل دفع متنوعة تشمل العملات الرقمية (USDT / Binance Pay / Bitcoin)، البطاقات الائتمانية (Visa / MasterCard)، المحافظ الإلكترونية المحلية (فودافون كاش / إنستاباي في مصر)، والعديد من الوسائل الأخرى.",
      aEn: "We support PayPal, Visa, MasterCard, USDT, Binance Pay, local digital wallets, and more with instant automated wallet top-up.",
    },
    {
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
    <section className="relative py-14 sm:py-20 bg-transparent text-white overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full cyber-container relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black text-center mb-10 sm:mb-14" data-aos="fade-down" suppressHydrationWarning>
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
            {isAr ? "الأسئلة الشائعة " : "Frequently Asked "}
          </span>
          <span>{isAr ? "والأكثر تداولاً" : "Questions"}</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="curved-cockpit rounded-2xl sm:rounded-3xl border-2 border-cyan-500/30 hover:border-cyan-400/70 overflow-hidden shadow-xl transition-all duration-300 backdrop-blur-xl"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                suppressHydrationWarning
              >
                {/* Top Arched Line Accent */}
                <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"></div>

                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 sm:px-8 py-5 text-left rtl:text-right focus:outline-none hover:bg-[#0c1328]/50 transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-white">
                    {isAr ? faq.qAr : faq.qEn}
                  </span>
                  <div
                    className={`convex-pill w-10 h-10 flex items-center justify-center bg-[#070c1a] border border-cyan-400/50 text-cyan-300 transition-transform duration-300 shrink-0 ms-4 shadow-md ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    <i className="fas fa-plus text-xs"></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-2 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-cyan-500/20 bg-[#070c1a]/40">
                    {isAr ? faq.aAr : faq.aEn}
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
