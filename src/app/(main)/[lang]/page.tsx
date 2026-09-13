import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import AmrrHeroSection from "@/components/AmrrHeroSection";
import AmrrStatsSection from "@/components/AmrrStatsSection";
import AmrrCountersSection from "@/components/AmrrCountersSection";
import HexagonalFeatures from "@/components/HexagonalFeatures";
import PackagesSlider from "@/components/PackagesSlider";
import CampaignSlider from "@/components/CampaignSlider";
import FaqSection from "@/components/FaqSection";
import SupportCtaSection from "@/components/SupportCtaSection";
import NewsletterSection from "@/components/NewsletterSection";

async function getHomepageConfig() {
  const candidates = [
    process.env.INTERNAL_API_URL,
    "http://pro-b-i0r2xu:5000",
    "http://backend:5000",
    "http://localhost:5000",
    process.env.NEXT_PUBLIC_API_URL,
    "https://arabtechproserver.tech"
  ].filter(Boolean) as string[];

  for (const baseUrl of candidates) {
    try {
      const cleanBase = baseUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanBase}/api/homepage`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function generateMetadata(props: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const isAr = params.lang === "ar";
  const title = isAr
    ? "عرب تك برو سيرفر | منصة فك شفرات وتفعيل الهواتف"
    : "Arab Tech Pro Server | GSM & Remote Unlock Services";
  const description = isAr 
    ? "منصة عرب تك برو سيرفر لفك شفرات الهواتف، تخطي حسابات آيكلود وFRP، وتفعيل البوكسات والدونجل وسيرفرات IMEI بأسعار الجملة المعتمدة."
    : "Arab Tech Pro Server: Professional phone unlocking, iCloud and FRP bypass, box activations, and high-speed IMEI server services.";

  const shareImg = isAr 
    ? "https://arabtechproserver.tech/images/og_share_ar.png"
    : "https://arabtechproserver.tech/images/og_share_en.png";

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title,
    description,
    keywords: [
      "عرب تك برو سيرفر",
      "عرب تك سيرفر",
      "سيرفر عرب تك",
      "سيرفر عرب تك",
      "عرب تك برو سيرفر",
      "عرب تك برو سيرفر",
      "عرب تك",
      "عرب تك",
      "Arab Tech Pro Server",
      "Arab Tech Pro Server Pro",
      "Arab Tech Pro Server",
      "arabtechproserver.tech",
      "سيرفر فك الهواتف",
      "فك شبكات",
      "تخطي iCloud",
      "تخطي FRP"
    ],
    openGraph: {
      title,
      description,
      url: `https://arabtechproserver.tech/${params.lang}`,
      siteName: isAr ? "عرب تك برو سيرفر (عرب تك برو سيرفر) - Arab Tech Pro Server" : "Arab Tech Pro Server",
      images: [
        {
          url: shareImg,
          width: 1200,
          height: 630,
          alt: isAr ? "عرب تك برو سيرفر - عرب تك برو سيرفر" : "Arab Tech Pro Server",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [shareImg],
    },
  };
}

export default async function Home(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const dict = await getDictionary(params.lang);
  const hp = await getHomepageConfig();

  const isAr = params.lang === "ar";
  const langPrefix = `/${params.lang}`;

  // Helper to format links (if relative like /pricing, prepend /ar or /en)
  const formatUrl = (url: string | undefined, defaultUrl: string) => {
    const target = url || defaultUrl;
    if (target.startsWith("http://") || target.startsWith("https://")) {
      return target;
    }
    if (target.startsWith("/")) {
      return `${langPrefix}${target}`;
    }
    return `${langPrefix}/${target}`;
  };

  // Dynamic values or fallbacks
  const notice1 = isAr ? hp?.noticeBar?.text1Ar : hp?.noticeBar?.text1En;
  const notice2 = isAr ? hp?.noticeBar?.text2Ar : hp?.noticeBar?.text2En;
  const whatsappNum = hp?.noticeBar?.whatsapp || "+16728972935";
  const telegramUser = hp?.noticeBar?.telegram && !hp.noticeBar.telegram.includes('@gmail') ? hp.noticeBar.telegram : "@ARABTECHSUPPURT2";
  const telegramUrl = hp?.noticeBar?.telegram
    ? (hp.noticeBar.telegram.startsWith("http") ? hp.noticeBar.telegram : `https://t.me/${hp.noticeBar.telegram.replace(/^@/, '')}`)
    : "https://t.me/ARABTECHSUPPURT2";
  const emailAddr = (hp?.noticeBar?.email && hp.noticeBar.email !== "eslamgsm1774@gmail.com") ? hp.noticeBar.email : "arabtechserver@gmail.com";

  const liveTag = isAr ? hp?.heroSection?.liveTagAr : hp?.heroSection?.liveTagEn;
  const eyebrow = isAr ? hp?.heroSection?.eyebrowAr : hp?.heroSection?.eyebrowEn;
  const title1 = isAr ? hp?.heroSection?.title1Ar : hp?.heroSection?.title1En;
  const title2 = isAr ? hp?.heroSection?.title2Ar : hp?.heroSection?.title2En;
  const lead = isAr ? hp?.heroSection?.leadAr : hp?.heroSection?.leadEn;

  const btnBrowse = isAr ? hp?.heroSection?.btnBrowseAr : hp?.heroSection?.btnBrowseEn;
  const btnBrowseUrl = formatUrl(hp?.heroSection?.btnBrowseUrl, "/pricing");

  const btnJoin = isAr ? hp?.heroSection?.btnJoinAr : hp?.heroSection?.btnJoinEn;
  const btnJoinUrl = formatUrl(hp?.heroSection?.btnJoinUrl, "/register");

  const badge1 = isAr ? hp?.heroSection?.badge1Ar : hp?.heroSection?.badge1En;
  const badge2 = isAr ? hp?.heroSection?.badge2Ar : hp?.heroSection?.badge2En;
  const badge3 = isAr ? hp?.heroSection?.badge3Ar : hp?.heroSection?.badge3En;

  const featTitle = isAr ? hp?.sidebarPromos?.featuredTitleAr : hp?.sidebarPromos?.featuredTitleEn;
  const featSub = isAr ? hp?.sidebarPromos?.featuredSubtitleAr : hp?.sidebarPromos?.featuredSubtitleEn;
  const featImg = hp?.sidebarPromos?.featuredImage || "/images/promo_borneo.webp";
  const featUrl = formatUrl(hp?.sidebarPromos?.featuredUrl, "/pricing");

  const supportTitle = isAr ? hp?.sidebarPromos?.supportTitleAr : hp?.sidebarPromos?.supportTitleEn;
  const supportBtn = isAr ? hp?.sidebarPromos?.supportBtnAr : hp?.sidebarPromos?.supportBtnEn;
  const whatsappUrl = hp?.sidebarPromos?.whatsappUrl || "https://api.whatsapp.com/send/?phone=16728972935&text&type=phone_number&app_absent=0";

  const imeiTitle = isAr ? hp?.serviceLanes?.imeiTitleAr : hp?.serviceLanes?.imeiTitleEn;
  const imeiDesc = isAr ? hp?.serviceLanes?.imeiDescAr : hp?.serviceLanes?.imeiDescEn;
  const imeiUrl = formatUrl(hp?.serviceLanes?.imeiUrl, "/pricing?cat=imei");

  const serverTitle = isAr ? hp?.serviceLanes?.serverTitleAr : hp?.serviceLanes?.serverTitleEn;
  const serverDesc = isAr ? hp?.serviceLanes?.serverDescAr : hp?.serviceLanes?.serverDescEn;
  const serverUrl = formatUrl(hp?.serviceLanes?.serverUrl, "/pricing?cat=server");

  const remoteTitle = isAr ? hp?.serviceLanes?.remoteTitleAr : hp?.serviceLanes?.remoteTitleEn;
  const remoteDesc = isAr ? hp?.serviceLanes?.remoteDescAr : hp?.serviceLanes?.remoteDescEn;
  const remoteUrl = formatUrl(hp?.serviceLanes?.remoteUrl, "/pricing?cat=remote");

  const storeTitle = isAr ? hp?.serviceLanes?.storeTitleAr : hp?.serviceLanes?.storeTitleEn;
  const storeDesc = isAr ? hp?.serviceLanes?.storeDescAr : hp?.serviceLanes?.storeDescEn;
  const storeUrl = formatUrl(hp?.serviceLanes?.storeUrl, "/pricing?cat=store");

  const feat1Title = isAr ? hp?.featureRibbon?.feat1TitleAr : hp?.featureRibbon?.feat1TitleEn;
  const feat1Desc = isAr ? hp?.featureRibbon?.feat1DescAr : hp?.featureRibbon?.feat1DescEn;

  const feat2Title = isAr ? hp?.featureRibbon?.feat2TitleAr : hp?.featureRibbon?.feat2TitleEn;
  const feat2Desc = isAr ? hp?.featureRibbon?.feat2DescAr : hp?.featureRibbon?.feat2DescEn;

  const feat3Title = isAr ? hp?.featureRibbon?.feat3TitleAr : hp?.featureRibbon?.feat3TitleEn;
  const feat3Desc = isAr ? hp?.featureRibbon?.feat3DescAr : hp?.featureRibbon?.feat3DescEn;

  let campaigns: any[] = [];
  if (Array.isArray(hp?.campaigns) && hp.campaigns.length > 0) {
    campaigns = hp.campaigns;
  } else if (hp?.campaigns && typeof hp.campaigns === 'object') {
    const c = hp.campaigns;
    if (c.promo1Image || c.promo1TitleAr || c.promo1TitleEn) {
      campaigns.push({
        tagEn: c.promo1TagEn || "Hot Offer",
        tagAr: c.promo1TagAr || "عرض خاص",
        titleEn: c.promo1TitleEn || "Samsung FRP Remove",
        titleAr: c.promo1TitleAr || "حذف حساب جوجل لسامسونج",
        descEn: c.promo1DescEn || "",
        descAr: c.promo1DescAr || "",
        image: c.promo1Image || "/images/promo_samsung.webp",
        url: c.promo1Url || "/pricing"
      });
    }
    if (c.promo2Image || c.promo2TitleAr || c.promo2TitleEn) {
      campaigns.push({
        tagEn: c.promo2TagEn || "Official Reseller",
        tagAr: c.promo2TagAr || "ترخيص رسمي",
        titleEn: c.promo2TitleEn || "Chimera Tool",
        titleAr: c.promo2TitleAr || "أداة شيميرا (Chimera)",
        descEn: c.promo2DescEn || "",
        descAr: c.promo2DescAr || "",
        image: c.promo2Image || "/images/promo_chimera.webp",
        url: c.promo2Url || "/pricing"
      });
    }
  }

  if (campaigns.length === 0) {
    campaigns = [
      {
        tagEn: "Hot Offer",
        tagAr: "عرض خاص",
        titleEn: "Samsung FRP Remove",
        titleAr: "حذف حساب جوجل لسامسونج",
        descEn: "Instant via IMEI. Support all models.",
        descAr: "فك فوري لجميع موديلات سامسونج.",
        image: "/images/promo_samsung.webp",
        url: "/pricing"
      },
      {
        tagEn: "Official Reseller",
        tagAr: "ترخيص رسمي",
        titleEn: "Chimera Tool",
        titleAr: "أداة شيميرا (Chimera)",
        descEn: "Activations and credits available instantly.",
        descAr: "تراخيص وأرصدة سريعة ومتاحة فوراً.",
        image: "/images/promo_chimera.webp",
        url: "/pricing"
      }
    ];
  }

  return (
    <div className="flex flex-col gap-6 sm:gap-10 lg:gap-12 pb-12 sm:pb-20 overflow-x-clip">
      <link
        rel="preload"
        as="image"
        href={isAr ? "/images/hero_cyber_ar.webp" : "/images/hero_cyber_en.webp"}
        type="image/webp"
        // @ts-ignore
        fetchPriority="high"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": isAr ? "عرب تك برو سيرفر (عرب تك برو سيرفر)" : "Arab Tech Pro Server",
            "alternateName": [
              "عرب تك برو سيرفر",
              "عرب تك سيرفر",
              "سيرفر عرب تك",
              "سيرفر عرب تك",
              "عرب تك برو سيرفر",
              "عرب تك برو سيرفر",
              "عرب تك",
              "عرب تك",
              "Arab Tech Pro Server",
              "Arab Tech Pro Server Pro",
              "Arab Tech Pro Server"
            ],
            "url": "https://arabtechproserver.tech",
            "potentialAction": {
              "@type": "SearchAction",
              "target": `https://arabtechproserver.tech/${params.lang}/pricing?search={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* --- Continuous Seamless Notice Bar --- */}
      <div className="w-full bg-[#0a0f18]/80 backdrop-blur-md border-b border-[#141d2e] mb-2 sm:mb-4 relative z-20 overflow-hidden">
        <div className="w-full flex whitespace-nowrap overflow-hidden py-2 sm:py-2.5" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none text-xs sm:text-sm font-medium text-on-surface-variant">
            
            {/* Track 1 */}
            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4">
              <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/25 font-bold shrink-0">
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-shield-alt text-secondary"></i>
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-on-surface shrink-0">
                <i className="fas fa-tools text-primary"></i>
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-unlock text-tertiary"></i>
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-violet-400 font-semibold shrink-0">
                <i className="fas fa-tags"></i>
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all font-bold shrink-0">
                <i className="fab fa-whatsapp text-[#25D366]"></i>
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-all font-bold shrink-0">
                <i className="fab fa-telegram-plane text-[#0088cc]"></i>
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-tertiary transition-colors shrink-0">
                <i className="fas fa-envelope text-tertiary"></i>
                <span>{emailAddr}</span>
              </a>
            </div>

            {/* Track 2 (Exact Seamless Clone) */}
            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4" aria-hidden="true">
              <span className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/25 font-bold shrink-0">
                <i className="fas fa-bolt text-yellow-400"></i>
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-shield-alt text-secondary"></i>
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-on-surface shrink-0">
                <i className="fas fa-tools text-primary"></i>
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <i className="fas fa-unlock text-tertiary"></i>
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-violet-400 font-semibold shrink-0">
                <i className="fas fa-tags"></i>
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all font-bold shrink-0">
                <i className="fab fa-whatsapp text-[#25D366]"></i>
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/10 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/20 transition-all font-bold shrink-0">
                <i className="fab fa-telegram-plane text-[#0088cc]"></i>
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-tertiary transition-colors shrink-0">
                <i className="fas fa-envelope text-tertiary"></i>
                <span>{emailAddr}</span>
              </a>
            </div>

          </div>
        </div>
      </div>

      {/* --- Amrr Split-Screen Asymmetric Hero --- */}
      <div className="w-full cyber-container section-spotlight">
        <AmrrHeroSection lang={params.lang} />
      </div>

      {/* --- Ready to Unlock & Live Performance Metrics (Amrr Match) --- */}
      <div className="w-full">
        <AmrrStatsSection lang={params.lang} />
      </div>

      {/* --- Smart Unlock & Animated Counters (Amrr Match) --- */}
      <div className="w-full cyber-container">
        <AmrrCountersSection lang={params.lang} />
      </div>

      {/* --- Service Lanes --- */}
      <section className="w-full cyber-container section-spotlight">
        <h2 className="sr-only">{isAr ? "مسارات الخدمات الرئيسية" : "Main Service Lanes"}</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          <Link href={imeiUrl} data-aos="fade-up" data-aos-delay="100" suppressHydrationWarning className="lamp-card p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl group transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 sm:gap-4 shadow-lg min-h-[135px] sm:min-h-[150px] md:min-h-[160px] border border-white/10 hover:border-blue-400/40">
            <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-blue-400/0 to-transparent group-hover:via-blue-400 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all duration-300 pointer-events-none"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-45 transition-opacity duration-300 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_imei.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/75 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-base sm:text-xl group-hover:scale-105 transition-transform shadow-sm">
              <i className="fas fa-fingerprint"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xs sm:text-base lg:text-lg text-white mb-0.5 sm:mb-1 group-hover:text-blue-400 transition-colors leading-snug line-clamp-1">{imeiTitle || "IMEI Services"}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed">{imeiDesc || "Unlocks, checks, and device services"}</p>
            </div>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-blue-400 absolute bottom-3 sm:bottom-5 end-3 sm:end-5 opacity-0 group-hover:opacity-100 transition-all`}></i>
          </Link>

          <Link href={serverUrl} data-aos="fade-up" data-aos-delay="200" suppressHydrationWarning className="lamp-card p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl group transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 sm:gap-4 shadow-lg min-h-[135px] sm:min-h-[150px] md:min-h-[160px] border border-white/10 hover:border-emerald-400/40">
            <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/0 to-transparent group-hover:via-emerald-400 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.8)] transition-all duration-300 pointer-events-none"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-45 transition-opacity duration-300 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_server.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/75 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-base sm:text-xl group-hover:scale-105 transition-transform shadow-sm">
              <i className="fas fa-server"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xs sm:text-base lg:text-lg text-white mb-0.5 sm:mb-1 group-hover:text-emerald-400 transition-colors leading-snug line-clamp-1">{serverTitle || "Server Services"}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed">{serverDesc || "Credits, activations, and tools"}</p>
            </div>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-emerald-400 absolute bottom-3 sm:bottom-5 end-3 sm:end-5 opacity-0 group-hover:opacity-100 transition-all`}></i>
          </Link>

          <Link href={remoteUrl} data-aos="fade-up" data-aos-delay="300" suppressHydrationWarning className="lamp-card p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl group transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 sm:gap-4 shadow-lg min-h-[135px] sm:min-h-[150px] md:min-h-[160px] border border-white/10 hover:border-sky-400/40">
            <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-sky-400/0 to-transparent group-hover:via-sky-400 group-hover:shadow-[0_0_12px_rgba(56,189,248,0.8)] transition-all duration-300 pointer-events-none"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-45 transition-opacity duration-300 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_remote.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/75 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 text-base sm:text-xl group-hover:scale-105 transition-transform shadow-sm">
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xs sm:text-base lg:text-lg text-white mb-0.5 sm:mb-1 group-hover:text-sky-400 transition-colors leading-snug line-clamp-1">{remoteTitle || "Remote Services"}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed">{remoteDesc || "Assisted sessions and support"}</p>
            </div>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-sky-400 absolute bottom-3 sm:bottom-5 end-3 sm:end-5 opacity-0 group-hover:opacity-100 transition-all`}></i>
          </Link>

          <Link href={storeUrl} data-aos="fade-up" data-aos-delay="400" suppressHydrationWarning className="lamp-card p-3.5 sm:p-4.5 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl group transition-all relative overflow-hidden flex flex-col justify-between gap-2.5 sm:gap-4 shadow-lg min-h-[135px] sm:min-h-[150px] md:min-h-[160px] border border-white/10 hover:border-amber-400/40">
            <div className="absolute top-0 inset-x-4 h-[2px] bg-gradient-to-r from-transparent via-amber-400/0 to-transparent group-hover:via-amber-400 group-hover:shadow-[0_0_12px_rgba(251,191,36,0.8)] transition-all duration-300 pointer-events-none"></div>
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-25 group-hover:opacity-45 transition-opacity duration-300 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_store.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17]/95 via-[#0B0F17]/75 to-transparent z-0 pointer-events-none"></div>
            <div className="relative z-10 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-base sm:text-xl group-hover:scale-105 transition-transform shadow-sm">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-xs sm:text-base lg:text-lg text-white mb-0.5 sm:mb-1 group-hover:text-amber-400 transition-colors leading-snug line-clamp-1">{storeTitle || "Tools & Store"}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed">{storeDesc || "Licenses, products, and bundles"}</p>
            </div>
            <i className={`fas ${isAr ? "fa-arrow-left" : "fa-arrow-right"} text-xs text-amber-400 absolute bottom-3 sm:bottom-5 end-3 sm:end-5 opacity-0 group-hover:opacity-100 transition-all`}></i>
          </Link>
        </div>
      </section>

      {/* --- Tool Marquee with plain dark border --- */}
      <section data-aos="fade-up" suppressHydrationWarning className="border-y border-[#141d2e] bg-[#0c121d]/50 py-5 sm:py-6 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="cyber-container mb-3 sm:mb-4 flex justify-center">
          <span className="bg-[#141d30] border border-white/15 px-3.5 sm:px-5 py-1 rounded-full text-[11px] sm:text-xs font-semibold uppercase tracking-widest text-slate-300 flex items-center gap-2 shadow-sm">
            <i className="fas fa-certificate text-blue-400"></i> Tool Network
          </span>
        </div>

        <div className="w-full flex whitespace-nowrap overflow-hidden" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none">
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-lg font-semibold text-slate-300">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={idx} className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors shrink-0">
                  <i className="fas fa-tools text-blue-400 text-sm"></i> {tool}
                </span>
              ))}
            </div>

            {/* Repeat exact clone for continuous seamless loop */}
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-lg font-semibold text-slate-300" aria-hidden="true">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={`repeat-${idx}`} className="flex items-center gap-2.5 text-slate-300 hover:text-white transition-colors shrink-0">
                  <i className="fas fa-tools text-blue-400 text-sm"></i> {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Ribbon --- */}
      <section data-aos="fade-up" suppressHydrationWarning className="w-full cyber-container section-spotlight">
        <h2 className="sr-only">{isAr ? "مميزات وموثوقية المنصة" : "Platform Trust & Features"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 md:gap-4 lg:gap-6 bg-[#141d30]/95 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-5 lg:p-8 border border-white/15 relative overflow-hidden backdrop-blur-md shadow-xl lamp-card">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-lg h-[2px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_14px_2px_rgba(96,165,250,0.85)] z-20 pointer-events-none"></div>

          {/* Card 1: Specialized Support Team */}
          <div className="group flex flex-col items-center text-center p-3.5 sm:p-5 md:p-3.5 lg:p-6 rounded-2xl transition-all duration-200 relative lamp-card">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-sm transition-colors">
                <i className="fas fa-headset text-xl md:text-xl lg:text-2xl"></i>
              </div>
            </div>
            <h3 className="font-bold text-base md:text-base lg:text-xl text-white mb-1.5 group-hover:text-blue-400 transition-colors">
              {feat1Title || (isAr ? "فريق دعم متخصص" : "Specialized Support Team")}
            </h3>
            <p className="text-slate-300 text-xs md:text-xs lg:text-sm max-w-xs leading-relaxed">
              {feat1Desc || (isAr ? "فريق دعم فني متواجد لمساعدتك والرد على كافة استفساراتك 24/7." : "Dedicated technical support team ready to assist you 24/7.")}
            </p>
          </div>

          {/* Card 2: 100% Safe Commission & Security */}
          <div className="group flex flex-col items-center text-center p-3.5 sm:p-5 md:p-3.5 lg:p-6 rounded-2xl transition-all duration-200 relative lamp-card">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-sm transition-colors">
                <i className="fas fa-shield-alt text-xl md:text-xl lg:text-2xl"></i>
              </div>
            </div>
            <h3 className="font-bold text-base md:text-base lg:text-xl text-white mb-1.5 group-hover:text-emerald-400 transition-colors">
              {feat2Title || (isAr ? "عمولة أمنة 100%" : "100% Safe Commission")}
            </h3>
            <p className="text-slate-300 text-xs md:text-xs lg:text-sm max-w-xs leading-relaxed">
              {feat2Desc || (isAr ? "معاملات إلكترونية سريعة ومحمية بأعلى معايير الأمان والحماية التامة." : "Fast and secure electronic transactions protected with top safety protocols.")}
            </p>
          </div>

          {/* Card 3: Continuous Support & Development */}
          <div className="group flex flex-col items-center text-center p-3.5 sm:p-5 md:p-3.5 lg:p-6 rounded-2xl transition-all duration-200 relative lamp-card">
            <div className="relative mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-sm transition-colors">
                <i className="fas fa-sync-alt text-xl md:text-xl lg:text-2xl"></i>
              </div>
            </div>
            <h3 className="font-bold text-base md:text-base lg:text-xl text-white mb-1.5 group-hover:text-amber-400 transition-colors">
              {feat3Title || (isAr ? "دعم مستمر وتطوير" : "Continuous Updates & Development")}
            </h3>
            <p className="text-slate-300 text-xs md:text-xs lg:text-sm max-w-xs leading-relaxed">
              {feat3Desc || (isAr ? "تحديثات مستمرة لأحدث برامج السوفت وير ودعم مستمر لكافة الأجهزة." : "Continuous updates for the latest GSM software and full device support.")}
            </p>
          </div>
        </div>
      </section>
 
      {/* --- Hexagonal Features Grid (amrr-unlocker match) --- */}
      <HexagonalFeatures lang={params.lang} />

      {/* --- Continuous 2-Card Automatic Packages Slider (User Requested) --- */}
      <PackagesSlider lang={params.lang} />

      {/* --- Campaign Stage (Promotions) --- */}
      <section data-aos="fade-up" suppressHydrationWarning className="w-full cyber-container relative section-spotlight">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4 lamp-header">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-400 mb-2.5 shadow-sm">
              <i className="fas fa-certificate text-blue-400"></i>
              <span>{isAr ? "عروض وحملات الموزعين الرسمية" : "Official Reseller Campaigns"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {isAr ? "أحدث تفعيلات الأدوات، فك الشفرات، والخصومات" : "Fresh Activations, Unlocks, and Tool Offers"}
            </h2>
          </div>
        </div>

        <div className="w-full">
          {campaigns.length > 0 ? (
            <CampaignSlider campaigns={campaigns} lang={params.lang} />
          ) : (
            <div className="bg-[#141d30] rounded-2xl sm:rounded-3xl p-8 border border-white/15 text-center text-slate-300 shadow-xl">
              {isAr ? "لا توجد عروض حالية." : "No active campaigns at the moment."}
            </div>
          )}
        </div>
      </section>

      {/* --- Frequently Asked Questions (amrr-unlocker match) --- */}
      <FaqSection lang={params.lang} />

      {/* --- Support CTA / Need Help Section (amrr-unlocker match) --- */}
      <SupportCtaSection
        lang={params.lang}
        whatsappNum={whatsappNum}
        telegramUrl={telegramUrl}
        emailAddr={emailAddr}
      />

      {/* --- Real Interactive Newsletter Section --- */}
      <div data-aos="fade-up" suppressHydrationWarning>
        <NewsletterSection lang={params.lang} />
      </div>

    </div>
  );
}
