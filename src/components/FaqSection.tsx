"use client";

import React, { useState } from "react";
import { HelpCircle, Plus, Minus } from "lucide-react";

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
      qEn: "What services are provided by the platform?",
      aAr: "نقدم خدمات فك شفرات الشبكات (IMEI)، تخطي حسابات iCloud، تخطي حماية FRP، تفعيل جميع بوكسات ودونجل السوفت وير (UnlockTool, Chimera, Borneo)، وشحن أرصدة السيرفرات بشكل مؤتمت وتلقائي على مدار الساعة.",
      aEn: "We provide official factory IMEI carrier unlock, iCloud bypass, Google FRP bypass, pro tool & dongle activations (UnlockTool, Chimera, Borneo), and automated server credit refills 24/7."
    },
    {
      id: "speed",
      num: "02",
      categoryAr: "سرعة التنفيذ",
      categoryEn: "Processing Speed",
      qAr: "كم يستغرق وقت تنفيذ وتفعيل الطلبات؟",
      qEn: "How long does order processing and activation take?",
      aAr: "تتم معظم عمليات تفعيل السيرفر والبوكسات وخدمات فحص الـ IMEI بشكل فوري وتلقائي خلال 1 إلى 15 دقيقة فقط. بعض عمليات فك الشبكات الرسمية تعتمد على استجابة خوادم شبكة الاتصالات المعنية.",
      aEn: "Most tool activations and server orders process automatically within 1 to 15 minutes. Official network carrier unlocks depend on the respective carrier server response times."
    },
    {
      id: "payment",
      num: "03",
      categoryAr: "وسائل الدفع",
      categoryEn: "Payment Gateways",
      qAr: "ما هي طرق ووسائل الدفع المدعومة؟",
      qEn: "What payment methods are supported?",
      aAr: "نوفر وسائل دفع متعددة تشمل العملات الرقمية USDT (TRC20 / BEP20) وBinance Pay، البطاقات المصرفية (Visa / MasterCard)، المحافظ الإلكترونية المحلية (إنستاباي / فودافون كاش في مصر)، مع شحن فوري وآمن للمحفظة.",
      aEn: "We support cryptocurrencies like USDT (TRC20/BEP20) and Binance Pay, Visa/MasterCard, PayPal, and local e-wallets like Instapay and Vodafone Cash with instant automated wallet balance crediting."
    },
    {
      id: "requirements",
      num: "04",
      categoryAr: "المتطلبات والتشغيل",
      categoryEn: "Requirements",
      qAr: "هل أحتاج إلى برامج أو أجهزة إضافية؟",
      qEn: "Do I need special hardware or additional software?",
      aAr: "لا تحتاج لأي أجهزة خاصة لمعظم خدمات الـ IMEI وتفعيلات السيرفر؛ كل ما تحتاجه هو إرسال رقم الـ IMEI أو اسم المستخدم. لعمليات الصيانة عن بعد، نوفر التوجيه المباشر عبر AnyDesk أو UltraViewer.",
      aEn: "No special hardware is required for IMEI and server services; you simply supply the IMEI or account username. For remote assisted sessions, our engineers connect via AnyDesk or UltraViewer."
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="w-full mb-10 sm:mb-14">
      <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-sky-400 uppercase tracking-wider mb-2.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{isAr ? "مركز الإجابات المعتمد" : "VERIFIED FAQ"}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          <span>{isAr ? "الأسئلة الشائعة " : "Frequently Asked "}</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-400">
            {isAr ? "والأكثر تداولاً" : "Questions"}
          </span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          {isAr
            ? "إجابات واضحة ومباشرة لأهم التساؤلات الفنية والمالية حول منصتنا وخدماتنا."
            : "Direct answers to key technical, operational, and billing questions about our platform."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={faq.id}
              className={`rounded-2xl p-4 sm:p-5 transition-all duration-300 border ${
                isOpen
                  ? "bg-[#0c1424]/90 border-sky-400/40 shadow-xl shadow-sky-950/20"
                  : "bg-[#090f1a]/70 border-white/10 hover:border-white/20"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between text-start gap-3 focus:outline-none"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`font-mono text-xs font-black px-2 py-0.5 rounded-lg border shrink-0 ${
                    isOpen 
                      ? "bg-sky-500/20 border-sky-400/50 text-sky-300" 
                      : "bg-white/5 border-white/10 text-slate-400"
                  }`}>
                    {faq.num}
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400 block mb-0.5">
                      {isAr ? faq.categoryAr : faq.categoryEn}
                    </span>
                    <h3 className={`text-xs sm:text-sm md:text-base font-bold transition-colors leading-snug ${
                      isOpen ? "text-white" : "text-slate-200"
                    }`}>
                      {isAr ? faq.qAr : faq.qEn}
                    </h3>
                  </div>
                </div>

                <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all shrink-0 ${
                  isOpen
                    ? "bg-sky-500/20 border-sky-400/50 text-sky-300"
                    : "bg-white/5 border-white/10 text-slate-400"
                }`}>
                  {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </div>
              </button>

              {isOpen && (
                <div className="pt-3.5 mt-3 border-t border-white/10 text-xs sm:text-sm text-slate-300 leading-relaxed animate-in fade-in duration-200">
                  <p className="border-s-2 border-sky-400/60 ps-3 py-0.5">
                    {isAr ? faq.aAr : faq.aEn}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
