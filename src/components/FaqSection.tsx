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
    <section className="relative py-14 sm:py-20 bg-transparent text-white overflow-hidden section-spotlight">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(37,99,235,0.05),transparent)] pointer-events-none"></div>

      <div className="w-full cyber-container relative z-10">
        <div className="lamp-header max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-center" data-aos="fade-down" suppressHydrationWarning>
            <span className="text-blue-400">
              {isAr ? "الأسئلة الشائعة " : "Frequently Asked "}
            </span>
            <span>{isAr ? "والأكثر تداولاً" : "Questions"}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="lamp-card rounded-2xl overflow-hidden shadow-md transition-all duration-200"
                data-aos="fade-up"
                data-aos-delay={idx * 100}
                suppressHydrationWarning
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center px-6 sm:px-8 py-5 text-left rtl:text-right focus:outline-none hover:bg-[#1b263e]/70 transition-colors"
                >
                  <span className="text-base sm:text-lg font-bold text-white">
                    {isAr ? faq.qAr : faq.qEn}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[#1d273b] border border-white/15 text-blue-400 transition-transform duration-200 shrink-0 ms-4 ${
                      isOpen ? "rotate-45 text-amber-400" : "rotate-0"
                    }`}
                  >
                    <i className="fas fa-plus text-xs"></i>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 sm:px-8 pb-6 pt-2 text-slate-300 text-sm sm:text-base leading-relaxed border-t border-white/10 bg-[#0B0F17]/50">
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
