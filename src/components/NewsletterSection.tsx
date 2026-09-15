"use client";

import React, { useState } from "react";
import { Mail, ShieldCheck, Zap, Lock, CheckCircle2, Loader2, Send } from "lucide-react";

interface NewsletterSectionProps {
  lang?: string;
  className?: string;
}

export default function NewsletterSection({ lang = "ar", className = "" }: NewsletterSectionProps) {
  const isAr = lang === "ar";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError(isAr ? "يرجى كتابة بريد إلكتروني صحيح" : "Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setMessage(
          data.message ||
            (isAr
              ? "تم اشتراكك بنجاح! ستصلك أحدث العروض والخدمات والتفعيلات فور إضافتها."
              : "Subscribed successfully! You will receive the latest tool offers and updates directly.")
        );
        setEmail("");
      } else {
        setError(data.error || (isAr ? "حدث خطأ أثناء الاشتراك. يرجى المحاولة لاحقاً." : "Failed to subscribe. Please try again."));
      }
    } catch {
      setError(isAr ? "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى." : "Network error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`w-full ${className}`}>
      <div className="p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8 border border-white/10 bg-gradient-to-br from-[#0c1629]/90 via-[#09101c]/80 to-[#070b14]/90 backdrop-blur-xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-20 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex-1 relative z-10 text-center md:text-start space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-semibold mb-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{isAr ? "النشرة الإخبارية والعروض الحصرية" : "Exclusive Newsletter & Offers"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {isAr ? "اشترك في النشرة الإخبارية لـ عرب تك برو" : "Subscribe to Arab Tech Pro Updates"}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {isAr
              ? "احصل على إشعارات فورية عند توفر تفعيلات الأدوات الجديدة (UnlockTool, Chimera, Borneo)، تخفيضات الأسعار الحصرية، وأحدث التحديثات والشروحات مباشرة إلى بريدك الإلكتروني."
              : "Get instant alerts for new tool activations, exclusive reseller discounts, and fresh firmware & unlocking updates directly to your inbox."}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "بدون رسائل مزعجة" : "Zero spam"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "إشعارات فورية بالخدمات الجديدة" : "Instant updates"}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sky-400" />
              <span>{isAr ? "بياناتك محمية 100%" : "100% secure"}</span>
            </span>
          </div>
        </div>

        <div className="w-full md:w-auto relative z-10 min-w-[280px] sm:min-w-[360px]">
          {success ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-start">
                <p className="font-bold text-sm text-emerald-200">
                  {isAr ? "شكراً لاشتراكك معنا!" : "Thank you for subscribing!"}
                </p>
                <p className="text-xs text-emerald-300/90 leading-relaxed">{message}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setMessage(null);
                  }}
                  className="text-[11px] font-bold text-emerald-400 hover:underline pt-1 block"
                >
                  {isAr ? "اشتراك ببريد آخر" : "Subscribe another email"}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    id="newsletter-email"
                    name="newsletter-email"
                    aria-label={isAr ? "البريد الإلكتروني للاشتراك في النشرة الإخبارية" : "Email address for newsletter subscription"}
                    placeholder={isAr ? "أدخل بريدك الإلكتروني..." : "Email address..."}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    type="email"
                    required
                    disabled={loading}
                    className="w-full py-3 sm:py-3.5 ps-10 pe-4 bg-white/[0.06] backdrop-blur-md border border-white/15 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white text-xs sm:text-sm placeholder:text-slate-400 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-royal py-3 sm:py-3.5 px-7 font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer shadow-md shadow-blue-950/40 text-xs sm:text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{isAr ? "جاري الاشتراك..." : "Subscribing..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAr ? "اشترك الآن" : "Subscribe"}</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <p className="text-xs text-rose-400 text-start font-medium ps-1">
                  {error}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
