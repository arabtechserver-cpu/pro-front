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
    <section className="relative py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <h2 className="text-3xl sm:text-5xl font-black text-center mb-12" data-aos="fade-down">
          <span className="text-primary">{isAr ? "الأسئلة الشائعة " : "Frequently Asked "}</span>
          <span>{isAr ? "والأكثر تداولاً" : "Questions"}</span>
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-lg transition-all duration-200"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 py-5 text-left rtl:text-right focus:outline-none hover:bg-slate-800/40 transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-white">
                    {isAr ? faq.qAr : faq.qEn}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary transition-transform duration-300 ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    <i className="fas fa-plus text-sm"></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-slate-800/60">
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
