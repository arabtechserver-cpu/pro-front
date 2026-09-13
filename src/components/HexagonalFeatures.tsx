import React from "react";
import { Unlock, Zap, Wrench, Headset, Fingerprint, Coins } from "lucide-react";

interface HexagonalFeaturesProps {
  lang: string;
}

export default function HexagonalFeatures({ lang }: HexagonalFeaturesProps) {
  const isAr = lang === "ar";

  const features = [
    {
      id: "unlock",
      index: "01",
      delay: 100,
      icon: Unlock,
      tag: isAr ? "فك رسمي دائم" : "OFFICIAL UNLOCK",
      badge: isAr ? "تخطي شبكات وتشفير معتمد" : "Network & Carrier Bypass",
      title: isAr ? "خدمات فك الشفرة" : "Carrier Unlock Services",
      desc: isAr
        ? "فك شفرات الهواتف والشبكات المغلقة رسمياً لجميع الموديلات والشركات العالمية بكفاءة وأمان تام."
        : "Official carrier and network unlocking for all major global models and operators.",
    },
    {
      id: "fastboot",
      index: "02",
      delay: 200,
      icon: Zap,
      tag: isAr ? "سيرفرات فائقة السرعة" : "ULTRA-FAST BOOT",
      badge: isAr ? "تفليش فوري ومباشر" : "Instant Flashing Server",
      title: isAr ? "سيرفرات الـ Fastboot" : "Fastboot Servers",
      desc: isAr
        ? "تفليش مباشر وسريع لأجهزة شاومي وأندرويد وتخطي الحسابات عبر وضع الفاست بوت الفوري."
        : "High-speed Xiaomi and Android fastboot flashing, bootloader, and account bypass.",
    },
    {
      id: "tools",
      index: "03",
      delay: 300,
      icon: Wrench,
      tag: isAr ? "تفعيلات وتراخيص" : "LICENSES & TOOLS",
      badge: isAr ? "شيميرا • باندورا • DFT" : "Chimera • Pandora • DFT",
      title: isAr ? "أدوات برمجية متكاملة" : "Integrated Software Tools",
      desc: isAr
        ? "تفعيل وتجديد فوري لكافة بوكسات ودونجل السوفت وير (شيميرا، باندورا، دي إف تي، بورنيو)."
        : "Instant license activations for top software tools: Chimera, DFT Pro, Pandora, and Borneo.",
    },
    {
      id: "support",
      index: "04",
      delay: 400,
      icon: Headset,
      tag: isAr ? "طاقم فني معتمد" : "24/7 LIVE SUPPORT",
      badge: isAr ? "دعم مباشر تيليجرام وشات" : "Telegram & Live Desk",
      title: isAr ? "دعم فني متخصص 24/7" : "24/7 Expert Support",
      desc: isAr
        ? "طاقم فني متخصص متواجد على مدار الساعة لمساعدتك في معالجة الأجهزة وتقديم التوجيه الفني."
        : "Dedicated GSM engineers and technicians available around the clock via live chat and Telegram.",
    },
    {
      id: "imei",
      index: "05",
      delay: 500,
      icon: Fingerprint,
      tag: isAr ? "فحص وتصليح السيريال" : "IMEI & SECURITY",
      badge: isAr ? "FRP وتخطي آيكلود" : "FRP & iCloud Solutions",
      title: isAr ? "خدمات الـ IMEI" : "IMEI Services",
      desc: isAr
        ? "فحص وتصليح السيريال نمبر، تخطي حماية جوجل FRP والآيكلود بأعلى معدلات نجاح معتمدة."
        : "Official IMEI checks, serial repair, Google FRP bypass, and verified iCloud removal.",
    },
    {
      id: "credits",
      index: "06",
      delay: 600,
      icon: Coins,
      tag: isAr ? "أرصدة وربط API" : "CREDITS & RESELLER API",
      badge: isAr ? "شحن فوري آلي للموزعين" : "Instant Auto Top-Up",
      title: isAr ? "السيرفرات والـ Credits" : "Servers & Credits",
      desc: isAr
        ? "شحن وتغذية فورية لأرصدة الكريدت لكافة السيرفرات والأدوات مع ربط API مباشر للموزعين."
        : "Instant credit top-ups for all major tool servers with reseller-ready automated API integration.",
    },
  ];

  return (
    <section className="relative py-14 sm:py-20 bg-transparent overflow-hidden section-spotlight">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(37,99,235,0.08),transparent)] pointer-events-none"></div>

      <div className="relative z-10 w-full cyber-container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16 lamp-header max-w-3xl mx-auto" data-aos="fade-up" suppressHydrationWarning>
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-cyan-400 font-semibold text-xs sm:text-sm uppercase tracking-wider">
              {isAr ? "لماذا تختارنا ؟" : "WHY CHOOSE US"}
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 tracking-tight">
            <span>{isAr ? "تميز في عالم " : "Unlock "}</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-cyan-400">
              {isAr ? "خدمات الـ GSM والسيرفر" : "Excellence & Performance"}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "عش تجربة فك الهواتف والخدمات السيرفرية مع تقنيات مؤتمتة متطورة، أمان فائق وسرعة تسليم لا تضاهى."
              : "Experience the future of device unlocking with our cutting-edge technology, unmatched security, and lightning-fast delivery."}
          </p>
        </div>

        {/* Feature Cards Grid - 2 side-by-side on mobile and tablet, 3 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 w-full">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.id}
                className="lamp-card group relative rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-4.5 md:p-6 lg:p-7 transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-1.5 shadow-xl flex flex-col justify-between overflow-hidden border border-white/10 hover:border-cyan-400/40"
                data-aos="fade-up"
                data-aos-delay={f.delay}
                suppressHydrationWarning
              >
                {/* Overhead Neon Light Beam */}
                <div className="absolute top-0 inset-x-4 sm:inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/0 to-transparent group-hover:via-cyan-400 group-hover:shadow-[0_0_16px_2px_rgba(34,211,238,0.9)] transition-all duration-500 pointer-events-none"></div>

                {/* Subtle Ambient Glow on Hover */}
                <div className="absolute -inset-px rounded-xl sm:rounded-2xl lg:rounded-3xl bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                <div className="relative z-10">
                  {/* Top Row: Futuristic Glowing Cyber Badge + Monospace Index */}
                  <div className="flex items-center justify-between mb-2.5 sm:mb-4 lg:mb-5">
                    <div className="relative group/icon">
                      {/* Outer Neon Aura / Glow */}
                      <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600 via-sky-500 to-cyan-400 rounded-xl sm:rounded-2xl blur-sm sm:blur-md opacity-60 group-hover:opacity-95 group-hover:blur-lg transition-all duration-300"></div>

                      {/* Glassmorphic Cyber Badge */}
                      <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-13 md:h-13 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-b from-[#182642] to-[#0d1627] border border-cyan-400/50 flex items-center justify-center p-0.5 shadow-[0_0_14px_rgba(56,189,248,0.3)] group-hover:shadow-[0_0_24px_rgba(56,189,248,0.7)] group-hover:border-cyan-300 transition-all duration-300">
                        <div className="w-full h-full rounded-[10px] sm:rounded-[12px] md:rounded-[14px] bg-[#090f1a]/85 flex items-center justify-center backdrop-blur-md relative overflow-hidden">
                          {/* Subtle top reflection */}
                          <div className="absolute top-0 inset-x-1 h-px bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent"></div>
                          {/* Lucide Icon in High-Voltage Neon Cyan */}
                          <Icon className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 md:w-6.5 md:h-6.5 lg:w-7 lg:h-7 text-cyan-400 stroke-[2.2] drop-shadow-[0_0_8px_rgba(34,211,238,0.85)] group-hover:scale-110 group-hover:text-cyan-300 transition-all duration-300" />
                        </div>
                      </div>
                    </div>

                    {/* High-Tech Monospace Index */}
                    <span className="font-mono text-[10px] sm:text-xs font-black tracking-wider text-cyan-400/80 bg-cyan-500/10 border border-cyan-500/25 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full group-hover:bg-cyan-500/20 group-hover:border-cyan-400/50 group-hover:text-cyan-300 transition-all">
                      {f.index}
                    </span>
                  </div>

                  {/* Micro Category Tag */}
                  <span className="text-[9px] sm:text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-cyan-400/80 mb-1 sm:mb-1.5 block truncate">
                    {f.tag}
                  </span>

                  {/* Title */}
                  <h3 className="text-xs sm:text-sm md:text-base lg:text-xl font-black text-white mb-1 sm:mb-2 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-1 sm:line-clamp-none">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-300 text-[10px] sm:text-xs lg:text-sm leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {f.desc}
                  </p>
                </div>

                {/* Bottom Interactive Micro-Bar */}
                <div className="relative z-10 mt-2.5 sm:mt-4 md:mt-6 pt-2 sm:pt-3.5 border-t border-white/[0.08] flex items-center justify-between text-[10px] sm:text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                  <span className="inline-flex items-center gap-1 sm:gap-1.5 font-medium text-[9px] sm:text-[10px] md:text-[11px] text-slate-400 group-hover:text-cyan-300 transition-colors truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
                    <span className="truncate">{f.badge}</span>
                  </span>
                  <i className="fas fa-arrow-left rtl:rotate-0 ltr:rotate-180 text-[10px] sm:text-xs text-slate-500 group-hover:text-cyan-400 group-hover:-translate-x-0.5 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5 transition-all shrink-0 ms-1"></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
