import React from "react";

interface HexagonalFeaturesProps {
  lang: string;
}

export default function HexagonalFeatures({ lang }: HexagonalFeaturesProps) {
  const isAr = lang === "ar";

  const features = [
    {
      id: "unlock",
      delay: 100,
      icon: "fas fa-unlock-alt",
      gradient: "from-violet-500 to-purple-700",
      glowColor: "rgba(139, 92, 246, 0.35)",
      title: isAr ? "خدمات فك الشفرة" : "Carrier Unlock Services",
      desc: isAr
        ? "فك شفرات الهواتف والشبكات المغلقة رسمياً لجميع الموديلات والشركات العالمية بكفاءة وأمان تام."
        : "Official carrier and network unlocking for all major global models and operators.",
    },
    {
      id: "fastboot",
      delay: 200,
      icon: "fas fa-bolt",
      gradient: "from-cyan-500 to-blue-600",
      glowColor: "rgba(6, 182, 212, 0.35)",
      title: isAr ? "سيرفرات الـ Fastboot" : "Fastboot Servers",
      desc: isAr
        ? "تفليش مباشر وسريع لأجهزة شاومي وأندرويد وتخطي الحسابات عبر وضع الفاست بوت الفوري."
        : "High-speed Xiaomi and Android fastboot flashing, bootloader, and account bypass.",
    },
    {
      id: "tools",
      delay: 300,
      icon: "fas fa-tools",
      gradient: "from-purple-500 to-indigo-700",
      glowColor: "rgba(168, 85, 247, 0.35)",
      title: isAr ? "أدوات برمجية متكاملة" : "Integrated Software Tools",
      desc: isAr
        ? "تفعيل وتجديد فوري لكافة بوكسات ودونجل السوفت وير (شيميرا، باندورا، دي إف تي، بورنيو)."
        : "Instant license activations for top software tools: Chimera, DFT Pro, Pandora, and Borneo.",
    },
    {
      id: "support",
      delay: 400,
      icon: "fas fa-headset",
      gradient: "from-amber-500 to-orange-600",
      glowColor: "rgba(245, 158, 11, 0.35)",
      title: isAr ? "دعم فني متخصص 24/7" : "24/7 Expert Support",
      desc: isAr
        ? "طاقم فني متخصص متواجد على مدار الساعة لمساعدتك في معالجة الأجهزة وتقديم التوجيه الفني."
        : "Dedicated GSM engineers and technicians available around the clock via live chat and Telegram.",
    },
    {
      id: "imei",
      delay: 500,
      icon: "fas fa-fingerprint",
      gradient: "from-rose-500 to-pink-700",
      glowColor: "rgba(244, 63, 94, 0.35)",
      title: isAr ? "خدمات الـ IMEI" : "IMEI Services",
      desc: isAr
        ? "فحص وتصليح السيريال نمبر، تخطي حماية جوجل FRP والآيكلود بأعلى معدلات نجاح معتمدة."
        : "Official IMEI checks, serial repair, Google FRP bypass, and verified iCloud removal.",
    },
    {
      id: "credits",
      delay: 600,
      icon: "fas fa-coins",
      gradient: "from-yellow-500 to-amber-600",
      glowColor: "rgba(234, 179, 8, 0.35)",
      title: isAr ? "السيرفرات والـ Credits" : "Servers & Credits",
      desc: isAr
        ? "شحن وتغذية فورية لأرصدة الكريدت لكافة السيرفرات والأدوات مع ربط API مباشر للموزعين."
        : "Instant credit top-ups for all major tool servers with reseller-ready automated API integration.",
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 bg-transparent overflow-hidden">
      {/* Dynamic Background Glows - stronger purple */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(109,40,217,0.22),transparent)] pointer-events-none"></div>
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-violet-600/8 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="relative z-10 w-full cyber-container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16" data-aos="fade-up" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 backdrop-blur-md px-5 py-2 rounded-full border border-violet-400/30 mb-5 shadow-sm">
            <i className="fas fa-sparkles text-violet-400 text-sm"></i>
            <span className="text-violet-300 font-bold text-xs sm:text-sm uppercase tracking-wider">
              {isAr ? "لماذا تختارنا ؟" : "WHY CHOOSE US"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tight">
            <span>{isAr ? "تميز في عالم " : "Unlock "}</span>
            <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(34,211,238,0.35)]">
              {isAr ? "خدمات الـ GSM والسيرفر" : "Excellence & Performance"}
            </span>
          </h2>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "عش تجربة فك الهواتف والخدمات السيرفرية مع تقنيات مؤتمتة متطورة، أمان فائق وسرعة تسليم لا تضاهى."
              : "Experience the future of device unlocking with our cutting-edge technology, unmatched security, and lightning-fast delivery."}
          </p>
        </div>

        {/* Feature Cards Grid (Expansive 3-Col Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {features.map((f) => (
            <div
              key={f.id}
              className="curved-cockpit group relative rounded-3xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-2 active:scale-[0.97] border-2 border-cyan-500/30 hover:border-cyan-400/80 active:border-cyan-400 shadow-2xl active:shadow-[0_0_35px_rgba(34,211,238,0.45)] flex flex-col justify-between"
              data-aos="fade-up"
              data-aos-delay={f.delay}
              suppressHydrationWarning
            >
              {/* Top Arched Accent */}
              <div className="absolute -top-[2px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent pointer-events-none"></div>

              {/* Glowing Corner Chip Accent */}
              <div className="absolute top-4 end-4 w-2 h-2 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 group-hover:shadow-[0_0_10px_#8b5cf6] transition-all"></div>

              <div>
                {/* Icon Circle */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white text-2xl mb-5 shadow-lg transform group-hover:scale-110 group-hover:rotate-6 group-active:scale-95 transition-all duration-300`}
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
