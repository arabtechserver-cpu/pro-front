import React from "react";

interface HexagonalFeaturesProps {
  lang: string;
}

export default function HexagonalFeatures({ lang }: HexagonalFeaturesProps) {
  const isAr = lang === "ar";

  const features = [
    {
      id: "sec",
      delay: 100,
      icon: "fas fa-shield-alt",
      gradient: "from-emerald-500 to-emerald-700",
      glowColor: "rgba(16, 185, 129, 0.35)",
      title: isAr ? "أمان وحماية عسكرية" : "Military-Grade Security",
      desc: isAr
        ? "بروتوكولات تشفير متقدمة وخوادم آمنة تضمن حماية بياناتك ومعاملاتك بالكامل طوال عملية فك وتفعيل الأجهزة."
        : "Advanced encryption protocols and secure servers ensure your data remains completely protected throughout the unlocking process.",
    },
    {
      id: "speed",
      delay: 200,
      icon: "fas fa-bolt",
      gradient: "from-cyan-500 to-cyan-700",
      glowColor: "rgba(6, 182, 212, 0.35)",
      title: isAr ? "سرعة تسليم فائقة" : "Lightning Fast Delivery",
      desc: isAr
        ? "إتمام معظم طلبات السيرفر وفك الشفرات في دقائق معدودة بفضل أنظمتنا المؤتمتة وبنيتنا التحتية الموزعة."
        : "Most unlocks completed in under 5 minutes with our automated API systems and optimized server infrastructure.",
    },
    {
      id: "global",
      delay: 300,
      icon: "fas fa-globe",
      gradient: "from-purple-500 to-purple-700",
      glowColor: "rgba(139, 92, 246, 0.35)",
      title: isAr ? "تغطية عالمية واسعة" : "Worldwide Coverage",
      desc: isAr
        ? "دعم كامل للأجهزة والشبكات من أكثر من 150 دولة مع توفير بوابات دفع محلية وعالمية متعددة."
        : "Support for devices from all major carriers and regions across 150+ countries with localized payment options.",
    },
    {
      id: "support",
      delay: 400,
      icon: "fas fa-headset",
      gradient: "from-amber-500 to-amber-700",
      glowColor: "rgba(245, 158, 11, 0.35)",
      title: isAr ? "دعم فني متخصص 24/7" : "24/7 Expert Support",
      desc: isAr
        ? "فريق دعم مباشر يعمل على مدار الساعة لحل المشكلات وتقديم التوجيه الفني عبر التيليجرام والواتساب."
        : "Round-the-clock assistance from our team of unlocking specialists via live chat, WhatsApp, and Telegram.",
    },
    {
      id: "success",
      delay: 500,
      icon: "fas fa-trophy",
      gradient: "from-rose-500 to-rose-700",
      glowColor: "rgba(239, 68, 68, 0.35)",
      title: isAr ? "نسبة نجاح 99.9%" : "99.9% Success Rate",
      desc: isAr
        ? "أعلى معدلات نجاح في الشرق الأوسط والعالم من خلال فحص دقيق وخوارزميات تحديث مستمرة."
        : "Industry-leading success rate with advanced algorithms and continuous system optimization for maximum reliability.",
    },
    {
      id: "tech",
      delay: 600,
      icon: "fas fa-rocket",
      gradient: "from-pink-500 to-pink-700",
      glowColor: "rgba(236, 72, 153, 0.35)",
      title: isAr ? "تكنولوجيا وتقنيات حديثة" : "Cutting-Edge Technology",
      desc: isAr
        ? "أحدث طرق فك الحماية وأقوى خوادم الـ API المؤتمتة التي تواكب تحديثات أنظمة الحماية لجميع الموديلات."
        : "Latest unlocking techniques and proprietary algorithms that stay ahead of carrier security updates.",
    },
  ];

  return (
    <section className="relative py-20 lg:py-28 bg-gradient-to-br from-slate-950 via-[#0b1329] to-slate-900 overflow-hidden border-y border-outline-variant/15">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20" data-aos="fade-up">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 backdrop-blur-md px-5 py-2 rounded-full border border-emerald-400/30 mb-5 shadow-sm">
            <i className="fas fa-sparkles text-emerald-400 text-sm"></i>
            <span className="text-emerald-300 font-bold text-xs sm:text-sm uppercase tracking-wider">
              {isAr ? "لماذا تختارنا ؟" : "WHY CHOOSE US"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            <span>{isAr ? "تميز في عالم " : "Unlock "}</span>
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent">
              {isAr ? "خدمات الـ GSM والسيرفر" : "Excellence & Performance"}
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "عش تجربة فك الهواتف والخدمات السيرفرية مع تقنيات مؤتمتة متطورة، أمان فائق وسرعة تسليم لا تضاهى."
              : "Experience the future of device unlocking with our cutting-edge technology, unmatched security, and lightning-fast delivery."}
          </p>
        </div>

        {/* Hexagonal / Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {features.map((f) => (
            <div
              key={f.id}
              className="group relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={f.delay}
              style={{
                background: "linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01))",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Card Hover Glow Border */}
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: `0 15px 35px ${f.glowColor}`,
                  border: "1px solid rgba(87, 241, 219, 0.4)",
                }}
              ></div>

              {/* Icon Circle */}
              <div
                className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white text-2xl mb-5 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}
              >
                <i className={f.icon}></i>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-2.5 group-hover:text-primary transition-colors">
                {f.title}
              </h3>

              {/* Description */}
              <p className="text-slate-300/80 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
