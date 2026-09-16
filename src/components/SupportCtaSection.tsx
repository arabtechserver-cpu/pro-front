"use client";

import React from "react";
import { Headset, MessageCircle, ArrowLeft, ArrowRight, ShieldCheck } from "lucide-react";

interface SupportCtaSectionProps {
  lang: string;
  whatsappNum?: string;
  telegramUrl?: string;
  emailAddr?: string;
}

export default function SupportCtaSection({
  lang,
  whatsappNum = "+16728972935",
  telegramUrl = "https://t.me/ARABTECHSUPPURT2",
  emailAddr = "arabtechserver@gmail.com",
}: SupportCtaSectionProps) {
  const isAr = lang === "ar";
  const cleanWa = whatsappNum.replace(/[^0-9]/g, "");
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  return (
    <section className="w-full">
      <div className="relative rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 border border-sky-400/30 bg-gradient-to-br from-[#0c1629]/90 via-[#09101c]/80 to-[#070b14]/90 backdrop-blur-xl shadow-2xl text-center overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-24 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(37,99,235,0.08),transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-xs font-bold text-sky-400 uppercase tracking-wider mb-3">
            <Headset className="w-3.5 h-3.5" />
            <span>{isAr ? "دعم فني بشري فوري 24/7" : "24/7 LIVE SUPPORT DESK"}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight leading-tight">
            <span>{isAr ? "هل تحتاج لمساعدة أو لديك استفسار؟" : "Need Assistance or Have a Special Request?"}</span>
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-slate-300 mb-8 leading-relaxed">
            {isAr
              ? "فريق الدعم الفني المتخصص جاهز لمساعدتك في تفعيل الحسابات، شحن الرصيد، وتقديم المشورة الفنية على مدار الساعة."
              : "Our dedicated technical engineering team is standing by around the clock to assist with activations, wallet deposits, and order troubleshooting."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-royal inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm font-bold group shadow-xl shadow-blue-950/40"
            >
              <Headset className="w-4 h-4 text-amber-300" />
              <span>{isAr ? "محادثة الدعم الفني (تيليجرام)" : "Live Telegram Support"}</span>
              <ArrowIcon className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
            </a>

            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-7 sm:px-9 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 transition-all shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{isAr ? "تواصل عبر واتساب" : "Chat on WhatsApp"}</span>
            </a>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isAr ? "متوسط زمن الرد: أقل من 3 دقائق" : "Average response time: under 3 mins"}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
