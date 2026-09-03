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
    <section
      className="py-20 lg:py-24 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white text-center border-t border-outline-variant/15 relative overflow-hidden"
      data-aos="fade-down"
    >
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-5 tracking-tight"
          data-aos="fade-up"
        >
          {isAr ? "هل تحتاج لمساعدة أو لديك استفسار؟" : "Need Help or Have a Question?"}
        </h2>

        <p
          className="text-slate-300 text-sm sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          {isAr
            ? "فريق الدعم الفني جاهز لمساعدتك في تفعيل الحسابات، شحن الرصيد، وتقديم المشورة الفنية على مدار الساعة."
            : "Our dedicated GSM technical specialists are ready around the clock to assist you with activations, wallet top-ups, and orders."}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* Email Support */}
          <a
            href={`mailto:${emailAddr}`}
            className="inline-flex items-center gap-2 border border-emerald-500/40 text-emerald-300 font-bold px-7 py-3.5 rounded-full hover:bg-emerald-600 hover:text-white transition-all shadow-sm active:scale-95 text-sm sm:text-base"
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
            className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-lg active:scale-95 text-sm sm:text-base"
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
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-bold px-7 py-3.5 rounded-full transition-all shadow-lg active:scale-95 text-sm sm:text-base"
            data-aos="fade-up"
            data-aos-delay="300"
          >
            <i className="fab fa-whatsapp text-lg"></i>
            <span>{isAr ? "محادثة واتساب مباشرة" : "WhatsApp Direct"}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
