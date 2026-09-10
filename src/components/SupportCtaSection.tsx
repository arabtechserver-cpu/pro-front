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
    <section className="relative py-12 sm:py-16 bg-transparent text-white text-center overflow-hidden">
      <div className="w-full cyber-container relative z-10">
        
        {/* Curved Cockpit Card */}
        <div className="curved-cockpit rounded-3xl p-8 sm:p-12 lg:p-16 border-2 border-cyan-500/30 shadow-2xl relative overflow-hidden animate-neon-border">
          {/* Top Arched Cyber Line */}
          <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#8b5cf6] pointer-events-none"></div>

          {/* Bottom Arched Cyber Line */}
          <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none"></div>

          {/* Ambient Glow - stronger purple */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-purple-600/15 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight"
              data-aos="fade-up"
              suppressHydrationWarning
            >
              <span className="bg-gradient-to-r from-violet-400 via-cyan-300 to-purple-200 bg-clip-text text-transparent">
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
                className="btn-purple-glow inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base group"
                data-aos="fade-up"
                data-aos-delay="100"
                suppressHydrationWarning
              >
                <i className="fas fa-headset text-yellow-300 text-base group-hover:scale-110 transition-transform"></i>
                <span>{isAr ? "محادثة الدعم الفني" : "Live Technical Support"}</span>
                <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs transition-transform group-hover:-translate-x-1`}></i>
              </a>

              {/* Secondary WhatsApp Button */}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-cyan-glow inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 text-sm sm:text-base group"
                data-aos="fade-up"
                data-aos-delay="200"
                suppressHydrationWarning
              >
                <i className="fab fa-whatsapp text-lg group-hover:scale-110 transition-transform"></i>
                <span>{isAr ? "تواصل عبر واتساب" : "Contact via WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
