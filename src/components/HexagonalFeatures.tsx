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
      gradient: "from-blue-600 to-indigo-600",
      title: isAr ? "خدمات فك الشفرة" : "Carrier Unlock Services",
      desc: isAr
        ? "فك شفرات الهواتف والشبكات المغلقة رسمياً لجميع الموديلات والشركات العالمية بكفاءة وأمان تام."
        : "Official carrier and network unlocking for all major global models and operators.",
    },
    {
      id: "fastboot",
      delay: 200,
      icon: "fas fa-bolt",
      gradient: "from-sky-500 to-blue-600",
      title: isAr ? "سيرفرات الـ Fastboot" : "Fastboot Servers",
      desc: isAr
        ? "تفليش مباشر وسريع لأجهزة شاومي وأندرويد وتخطي الحسابات عبر وضع الفاست بوت الفوري."
        : "High-speed Xiaomi and Android fastboot flashing, bootloader, and account bypass.",
    },
    {
      id: "tools",
      delay: 300,
      icon: "fas fa-tools",
      gradient: "from-indigo-600 to-slate-700",
      title: isAr ? "أدوات برمجية متكاملة" : "Integrated Software Tools",
      desc: isAr
        ? "تفعيل وتجديد فوري لكافة بوكسات ودونجل السوفت وير (شيميرا، باندورا، دي إف تي، بورنيو)."
        : "Instant license activations for top software tools: Chimera, DFT Pro, Pandora, and Borneo.",
    },
    {
      id: "support",
      delay: 400,
      icon: "fas fa-headset",
      gradient: "from-amber-500 to-amber-700",
      title: isAr ? "دعم فني متخصص 24/7" : "24/7 Expert Support",
      desc: isAr
        ? "طاقم فني متخصص متواجد على مدار الساعة لمساعدتك في معالجة الأجهزة وتقديم التوجيه الفني."
        : "Dedicated GSM engineers and technicians available around the clock via live chat and Telegram.",
    },
    {
      id: "imei",
      delay: 500,
      icon: "fas fa-fingerprint",
      gradient: "from-emerald-600 to-teal-700",
      title: isAr ? "خدمات الـ IMEI" : "IMEI Services",
      desc: isAr
        ? "فحص وتصليح السيريال نمبر، تخطي حماية جوجل FRP والآيكلود بأعلى معدلات نجاح معتمدة."
        : "Official IMEI checks, serial repair, Google FRP bypass, and verified iCloud removal.",
    },
    {
      id: "credits",
      delay: 600,
      icon: "fas fa-coins",
      gradient: "from-blue-600 to-cyan-700",
      title: isAr ? "السيرفرات والـ Credits" : "Servers & Credits",
      desc: isAr
        ? "شحن وتغذية فورية لأرصدة الكريدت لكافة السيرفرات والأدوات مع ربط API مباشر للموزعين."
        : "Instant credit top-ups for all major tool servers with reseller-ready automated API integration.",
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 bg-transparent overflow-hidden section-spotlight">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(37,99,235,0.06),transparent)] pointer-events-none"></div>

      <div className="relative z-10 w-full cyber-container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 lamp-header max-w-3xl mx-auto" data-aos="fade-up" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            <span className="text-blue-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              {isAr ? "لماذا تختارنا ؟" : "WHY CHOOSE US"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            <span>{isAr ? "تميز في عالم " : "Unlock "}</span>
            <span className="text-blue-400">
              {isAr ? "خدمات الـ GSM والسيرفر" : "Excellence & Performance"}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "عش تجربة فك الهواتف والخدمات السيرفرية مع تقنيات مؤتمتة متطورة، أمان فائق وسرعة تسليم لا تضاهى."
              : "Experience the future of device unlocking with our cutting-edge technology, unmatched security, and lightning-fast delivery."}
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
          {features.map((f) => (
            <div
              key={f.id}
              className="lamp-card group relative rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:-translate-y-1 shadow-lg flex flex-col justify-between"
              data-aos="fade-up"
              data-aos-delay={f.delay}
              suppressHydrationWarning
            >
              <div>
                {/* Icon Box */}
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white text-xl mb-5 shadow-md`}
                >
                  <i className={f.icon}></i>
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {f.title}
                </h3>

                {/* Description */}
                <p className="text-slate-300 text-sm leading-relaxed">
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
