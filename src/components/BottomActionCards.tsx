"use client";

import React, { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, Loader2 } from "lucide-react";

interface BottomActionCardsProps {
  lang: string;
  whatsappNum?: string;
  telegramUrl?: string;
}

export default function BottomActionCards({
  lang,
  whatsappNum = "+16728972935",
  telegramUrl = "https://t.me/ARABTECHSUPPURT2"
}: BottomActionCardsProps) {
  const isAr = lang === "ar";
  const cleanWa = whatsappNum.replace(/[^0-9]/g, "");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      if (res.ok) {
        setSuccess(true);
        setEmail("");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full mb-8 sm:mb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* 1. Newsletter Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
          <div className="flex items-start gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 dark:bg-[#091b33] border border-cyan-200 dark:border-cyan-500/30 text-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
              <Mail className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="text-start">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                {isAr ? "اشترك في نشرتنا الإخبارية" : "Subscribe to Our Newsletter"}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {isAr ? "احصل على آخر العروض والأخبار أول بأول" : "Get the latest offers and updates first"}
              </p>
            </div>
          </div>

          {success ? (
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{isAr ? "تم اشتراكك بنجاح في القائمة البريدية!" : "Subscribed successfully to newsletter!"}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative flex items-center">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? "أدخل بريدك الإلكتروني" : "Enter your email"}
                className="w-full py-2.5 pe-24 sm:pe-28 ps-3.5 sm:ps-4 rounded-xl bg-slate-50 dark:bg-[#08172b] border border-slate-300 dark:border-cyan-500/30 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute left-1 rtl:left-1 rtl:right-auto px-4 sm:px-5 py-1.5 rounded-lg bg-[#00d084] hover:bg-[#00b975] text-[#052216] font-black text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>{isAr ? "اشتراك" : "Subscribe"}</span>}
              </button>
            </form>
          )}
        </div>

        {/* 2. Technical Support Card */}
        <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-[#061224] border border-slate-200 dark:border-cyan-500/20 shadow-sm flex flex-col justify-between min-h-[145px] sm:min-h-[160px]">
          <div className="flex items-start gap-3 mb-3 sm:mb-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-cyan-50 dark:bg-[#091b33] border border-cyan-200 dark:border-cyan-500/30 text-cyan-500 flex items-center justify-center shrink-0 shadow-sm">
              <MessageSquare className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </div>
            <div className="text-start">
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                {isAr ? "تواصل معنا للدعم الفني" : "Contact Technical Support"}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {isAr ? "نحن هنا لمساعدتك في أي وقت" : "We are here to help you anytime"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* WhatsApp Button (Right in RTL) */}
            <a
              href={`https://wa.me/${cleanWa}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#00d084] hover:bg-[#00b975] text-[#052216] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984 0 1.762.459 3.48 1.332 5.001L2 22l5.148-1.348c1.472.802 3.13 1.224 4.863 1.225h.005c5.505 0 9.989-4.478 9.99-9.985 0-2.668-1.039-5.176-2.927-7.062A9.923 9.923 0 0 0 12.012 2zm.005 16.521h-.004c-1.493 0-2.957-.401-4.232-1.157l-.304-.18-3.146.825.839-3.067-.198-.315c-.832-1.323-1.272-2.859-1.272-4.436 0-4.492 3.656-8.147 8.152-8.147 2.176 0 4.221.848 5.76 2.387a8.096 8.096 0 0 1 2.384 5.763c0 4.493-3.656 8.147-8.152 8.147zm4.469-6.108c-.245-.123-1.452-.716-1.677-.798-.225-.082-.389-.123-.553.123-.164.246-.635.798-.778.962-.143.164-.286.184-.531.062-.245-.123-1.037-.382-1.976-1.219-.73-.651-1.223-1.455-1.366-1.7-.143-.246-.015-.379.108-.501.111-.11.245-.286.368-.429.123-.143.164-.246.245-.409.082-.164.041-.307-.02-.429-.062-.123-.553-1.332-.757-1.822-.204-.49-.409-.419-.553-.429h-.471c-.164 0-.429.062-.654.307-.225.246-.86.84-.86 2.05 0 1.209.88 2.373 1.002 2.537.123.164 1.733 2.646 4.198 3.712.586.254 1.044.406 1.401.52.59.187 1.127.16 1.551.097.473-.07 1.452-.593 1.656-1.166.204-.573.204-1.064.143-1.166-.061-.102-.225-.164-.47-.287z"/>
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Telegram Button (Left in RTL) */}
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Telegram</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
