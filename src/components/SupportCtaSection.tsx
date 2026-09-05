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
          <div className="absolute -top-[2px] left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] pointer-events-none"></div>

          {/* Bottom Arched Cyber Line */}
          <div className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none"></div>

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight"
              data-aos="fade-up"
            >
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-300 to-teal-200 bg-clip-text text-transparent">
                {isAr ? "هل تحتاج لمساعدة أو لديك استفسار؟" : "Need Help or Have a Question?"}
              </span>
            </h2>

            <p
              className="text-slate-300 text-sm sm:text-base lg:text-lg mb-8 leading-relaxed"
              data-aos="fade-up"
              data-aos-delay="100"
            >
              {isAr
                ? "فريق الدعم الفني جاهز لمساعدتك في تفعيل الحسابات، شحن الرصيد، وتقديم المشورة الفنية على مدار الساعة."
                : "Our dedicated GSM technical specialists are ready around the clock to assist you with activations, wallet top-ups, and orders."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {/* Email Support */}
              <a
                href={`mailto:${emailAddr}`}
                className="convex-pill inline-flex items-center gap-2 border-2 border-cyan-400/50 bg-[#070c1a]/95 text-cyan-300 font-bold px-6 sm:px-7 py-3 sm:py-3.5 hover:bg-cyan-500 hover:text-slate-950 transition-all shadow-lg active:scale-95 text-sm sm:text-base"
                data-aos="fade-up"
                data-aos-delay="100"
              >
                <i className="fas fa-envelope"></i>
                <span>{isAr ? "مراسلة الدعم الفني" : "Contact Support"}</span>
              </a>

              {/* Telegram */}
              <a
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="convex-pill inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold px-6 sm:px-7 py-3 sm:py-3.5 transition-all shadow-[0_8px_25px_rgba(0,136,204,0.4)] active:scale-95 text-sm sm:text-base"
                data-aos="fade-up"
                data-aos-delay="200"
              >
                <i className="fab fa-telegram-plane text-lg"></i>
                <span>{isAr ? "قناة ودعم تيليجرام" : "Telegram Channel"}</span>
              </a>

              {/* WhatsApp */}
              <a
                href={`https://wa.me/${cleanWa}`}
                target="_blank"
                rel="noopener noreferrer"
                className="convex-pill inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black px-6 sm:px-7 py-3 sm:py-3.5 transition-all shadow-[0_8px_25px_rgba(37,211,102,0.4)] active:scale-95 text-sm sm:text-base"
                data-aos="fade-up"
                data-aos-delay="300"
              >
                <i className="fab fa-whatsapp text-lg"></i>
                <span>{isAr ? "محادثة واتساب مباشرة" : "WhatsApp Direct"}</span>
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
