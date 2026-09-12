"use client";

import React, { useState } from "react";

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
    } catch (err: any) {
      setError(isAr ? "تعذر الاتصال بالخادم، يرجى المحاولة مرة أخرى." : "Network error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`w-full cyber-container section-spotlight ${className}`}>
      <div className="lamp-card p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-20 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
        
        {/* Content text */}
        <div className="flex-1 relative z-10 text-center md:text-start space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-1">
            <span className="material-symbols-outlined text-sm">mark_email_unread</span>
            <span>{isAr ? "النشرة الإخبارية والعروض الحصرية" : "Exclusive Newsletter & Offers"}</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight">
            {isAr ? "اشترك في النشرة الإخبارية لـ عرب تك برو" : "Subscribe to our newsletter"}
          </h2>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
            {isAr
              ? "احصل على إشعارات فورية عند توفر تفعيلات الأدوات الجديدة (UnlockTool, Chimera, Borneo)، تخفيضات الأسعار الحصرية، وأحدث التحديثات والشروحات مباشرة إلى بريدك الإلكتروني."
              : "Get instant alerts for new tool activations, exclusive reseller discounts, and fresh firmware & unlocking updates directly to your inbox."}
          </p>

          <div className="flex items-center justify-center md:justify-start gap-4 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-blue-400">verified_user</span>
              {isAr ? "بدون رسائل مزعجة" : "Zero spam"}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-blue-400">bolt</span>
              {isAr ? "إشعارات فورية بالخدمات الجديدة" : "Instant updates"}
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-xs text-blue-400">lock</span>
              {isAr ? "بياناتك محمية 100%" : "100% secure"}
            </span>
          </div>
        </div>

        {/* Form or Success State */}
        <div className="w-full md:w-auto relative z-10 min-w-[280px] sm:min-w-[360px]">
          {success ? (
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-3 animate-in fade-in zoom-in-95 duration-300">
              <span className="material-symbols-outlined text-2xl text-emerald-400 shrink-0">check_circle</span>
              <div className="space-y-1">
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
                  <span className="material-symbols-outlined absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg pointer-events-none">
                    mail
                  </span>
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
                    className="w-full px-4 py-3 sm:py-3.5 pl-10 rtl:pl-4 rtl:pr-10 bg-[#0B0F17] border border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all text-white text-sm placeholder:text-slate-400 shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-royal py-3 sm:py-3.5 px-8 font-bold flex items-center justify-center gap-2 shrink-0 disabled:opacity-60 cursor-pointer shadow-md shadow-blue-900/30"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">refresh</span>
                      <span>{isAr ? "جاري الاشتراك..." : "Subscribing..."}</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane text-xs"></i>
                      <span>{isAr ? "اشترك الآن" : "Subscribe"}</span>
                    </>
                  )}
                </button>
              </div>

              {error && (
                <p className="text-xs text-error font-medium px-2 flex items-center gap-1 animate-in fade-in">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{error}</span>
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
