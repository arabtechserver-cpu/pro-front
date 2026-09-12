import React from "react";

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

  return (
    <section className="relative py-12 sm:py-16 bg-transparent text-white text-center overflow-hidden section-spotlight">
      <div className="w-full cyber-container relative z-10">
        
        {/* Support Card */}
        <div className="lamp-card rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-20 bg-blue-500/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight"
              data-aos="fade-up"
              suppressHydrationWarning
            >
              <span className="text-white">
                {isAr ? "هل تحتاج لمساعدة أو لديك استفسار؟" : "Need Help or Have a Question?"}
              </span>
            </h2>

            <p
              className="text-slate-300 text-sm sm:text-base lg:text-lg mb-8 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
              suppressHydrationWarning
            >
              {isAr
                ? "فريق الدعم الفني جاهز لمساعدتك في تفعيل الحسابات، شحن الرصيد، وتقديم المشورة الفنية على مدار الساعة."
                : "Our dedicated GSM technical specialists are ready around the clock to assist you with activations, wallet top-ups, and orders."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              {/* Primary Support Chat Button */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-royal inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base font-bold group shadow-lg shadow-blue-900/30"
                data-aos="fade-up"
                data-aos-delay="100"
                suppressHydrationWarning
              >
                <i className="fas fa-headset text-amber-300 text-base group-hover:scale-105 transition-transform"></i>
                <span>{isAr ? "محادثة الدعم الفني" : "Live Technical Support"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </a>

              {/* Secondary WhatsApp Button */}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#25D366] border border-[#25D366]/40 inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full text-sm sm:text-base font-bold transition-all group shadow-md"
                data-aos="fade-up"
                data-aos-delay="200"
                suppressHydrationWarning
              >
                <i className="fab fa-whatsapp text-lg group-hover:scale-105 transition-transform"></i>
                <span>{isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
