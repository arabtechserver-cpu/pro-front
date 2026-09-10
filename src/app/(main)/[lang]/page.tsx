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
        titleAr: c.promo2TitleAr || "أداة شيميراChimera",
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
        titleAr: "أداة شيميراChimera",
        descEn: "Activations and credits available instantly.",
        descAr: "تراخيص وأرصدة سريعة ومتاحة فوراً.",
        image: "/images/promo_chimera.webp",
        url: "/pricing"
      }
    ];
  }

  return (
    <div className="flex flex-col gap-10 sm:gap-16 lg:gap-20 pb-12 sm:pb-20 overflow-x-clip">
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
      <div className="w-full bg-surface-container/90 backdrop-blur-md border-b border-outline-variant/20 mb-2 sm:mb-4 relative z-20 overflow-hidden">
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
      <div className="w-full cyber-container">
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
      <section className="w-full cyber-container">
        <h2 className="sr-only">{isAr ? "مسارات الخدمات الرئيسية" : "Main Service Lanes"}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Link href={imeiUrl} data-aos="fade-up" data-aos-delay="100" suppressHydrationWarning className="glass-card p-5 sm:p-6 rounded-2xl border border-cyan-500/30 hover:border-violet-400/80 active:border-violet-400 active:scale-[0.97] active:shadow-[0_0_30px_rgba(139,92,246,0.5)] group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4 shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_imei.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/95 via-[#050814]/50 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute top-3 end-3 w-2 h-2 rounded-full bg-violet-400/40 group-hover:bg-violet-400 group-hover:shadow-[0_0_8px_#a78bfa] transition-all"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 text-lg sm:text-xl group-hover:bg-violet-500 group-hover:text-slate-950 group-hover:scale-110 group-active:scale-95 transition-all shadow-md">
              <i className="fas fa-fingerprint"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover:text-violet-400 transition-colors">{imeiTitle || "IMEI Services"}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{imeiDesc || "Unlocks, checks, and device services"}</p>
            </div>
            <i className="fas fa-arrow-right text-violet-400 absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={serverUrl} data-aos="fade-up" data-aos-delay="200" suppressHydrationWarning className="glass-card p-5 sm:p-6 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/80 active:border-cyan-400 active:scale-[0.97] active:shadow-[0_0_30px_rgba(34,211,238,0.5)] group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4 shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_server.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/95 via-[#050814]/50 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute top-3 end-3 w-2 h-2 rounded-full bg-cyan-400/40 group-hover:bg-cyan-400 group-hover:shadow-[0_0_8px_#22d3ee] transition-all"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 text-lg sm:text-xl group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:scale-110 group-active:scale-95 transition-all shadow-md">
              <i className="fas fa-server"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover:text-cyan-400 transition-colors">{serverTitle || "Server Services"}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{serverDesc || "Credits, activations, and tools"}</p>
            </div>
            <i className="fas fa-arrow-right text-cyan-400 absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={remoteUrl} data-aos="fade-up" data-aos-delay="300" suppressHydrationWarning className="glass-card p-5 sm:p-6 rounded-2xl border border-cyan-500/30 hover:border-purple-400/80 active:border-purple-400 active:scale-[0.97] active:shadow-[0_0_30px_rgba(168,85,247,0.5)] group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4 shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_remote.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/95 via-[#050814]/50 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute top-3 end-3 w-2 h-2 rounded-full bg-purple-400/40 group-hover:bg-purple-400 group-hover:shadow-[0_0_8px_#c084fc] transition-all"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-lg sm:text-xl group-hover:bg-purple-500 group-hover:text-slate-950 group-hover:scale-110 group-active:scale-95 transition-all shadow-md">
              <i className="fas fa-broadcast-tower"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover:text-purple-400 transition-colors">{remoteTitle || "Remote Services"}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{remoteDesc || "Assisted sessions and support"}</p>
            </div>
            <i className="fas fa-arrow-right text-purple-400 absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>

          <Link href={storeUrl} data-aos="fade-up" data-aos-delay="400" suppressHydrationWarning className="glass-card p-5 sm:p-6 rounded-2xl border border-cyan-500/30 hover:border-amber-400/80 active:border-amber-400 active:scale-[0.97] active:shadow-[0_0_30px_rgba(251,191,36,0.5)] group transition-all relative overflow-hidden flex flex-col gap-3 sm:gap-4 shadow-xl">
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-75 transition-opacity duration-500 z-0 pointer-events-none" 
              style={{ backgroundImage: "url('/images/promo_store.webp')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/95 via-[#050814]/50 to-transparent z-0 pointer-events-none"></div>
            <div className="absolute top-3 end-3 w-2 h-2 rounded-full bg-amber-400/40 group-hover:bg-amber-400 group-hover:shadow-[0_0_8px_#fbbf24] transition-all"></div>
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg sm:text-xl group-hover:bg-amber-500 group-hover:text-slate-950 group-hover:scale-110 group-active:scale-95 transition-all shadow-md">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg text-white mb-1 group-hover:text-amber-400 transition-colors">{storeTitle || "Tools & Store"}</h3>
              <p className="text-xs sm:text-sm text-slate-300">{storeDesc || "Licenses, products, and bundles"}</p>
            </div>
            <i className="fas fa-arrow-right text-amber-400 absolute bottom-5 sm:bottom-6 right-5 sm:right-6 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all"></i>
          </Link>
        </div>
      </section>

      {/* --- Tool Marquee --- */}
      <section data-aos="fade-up" suppressHydrationWarning className="border-y border-cyan-500/20 bg-transparent py-6 sm:py-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-16 sm:w-32 h-full bg-gradient-to-r from-background to-transparent z-10 pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-16 sm:w-32 h-full bg-gradient-to-l from-background to-transparent z-10 pointer-events-none"></div>
        
        <div className="cyber-container mb-3 sm:mb-4 flex justify-center">
          <span className="bg-[#050814]/90 border border-cyan-500/30 px-3.5 sm:px-5 py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest text-cyan-300 flex items-center gap-2 shadow-sm">
            <i className="fas fa-certificate text-violet-400"></i> Tool Network
          </span>
        </div>

        <div className="w-full flex whitespace-nowrap overflow-hidden" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none">
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-xl font-bold text-white/90">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={idx} className="flex items-center gap-3 text-cyan-300 hover:text-violet-400 transition-colors shrink-0">
                  <i className="fas fa-tools text-violet-400"></i> {tool}
                </span>
              ))}
            </div>

            {/* Repeat exact clone for continuous seamless loop */}
            <div className="flex shrink-0 items-center gap-8 sm:gap-12 px-6 text-base sm:text-xl font-bold text-white/90" aria-hidden="true">
              {(hp?.toolMarquee || ["Chimera", "UnlockTool", "Borneo", "iRemoval Pro", "DFT Pro", "MobileSea Tool", "AMT", "Phoenix", "Cheetah", "FKey"]).map((tool: string, idx: number) => (
                <span key={`repeat-${idx}`} className="flex items-center gap-3 text-cyan-300 hover:text-violet-400 transition-colors shrink-0">
                  <i className="fas fa-tools text-violet-400"></i> {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature Ribbon --- */}
      <section data-aos="fade-up" suppressHydrationWarning className="w-full cyber-container">
        <h2 className="sr-only">{isAr ? "مميزات وموثوقية المنصة" : "Platform Trust & Features"}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x md:rtl:divide-x-reverse divide-cyan-500/20 curved-cockpit rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-2 border-cyan-500/30 relative overflow-hidden backdrop-blur-xl shadow-2xl">
          {/* Card 1: Specialized Support Team */}
          <div className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-1 active:scale-[0.97] relative">
            <div className="relative mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/30 to-violet-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 via-[#0a0f24] to-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:rotate-6 group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                <i className="fas fa-headset text-2xl"></i>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-purple-500 border border-[#060814]"></span>
                </span>
              </div>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white mb-1.5 group-hover:text-purple-400 transition-colors">
              {feat1Title || (isAr ? "فريق دعم متخصص" : "Specialized Support Team")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs leading-relaxed">
              {feat1Desc || (isAr ? "فريق دعم فني متواجد لمساعدتك والرد على كافة استفساراتك 24/7." : "Dedicated technical support team ready to assist you 24/7.")}
            </p>
          </div>

          {/* Card 2: 100% Safe Commission & Security */}
          <div className="group flex flex-col items-center text-center p-4 sm:p-5 pt-6 md:pt-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-1 active:scale-[0.97] relative">
            <div className="relative mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-[#0a0f24] to-purple-500/10 flex items-center justify-center text-cyan-400 border border-cyan-500/40 shadow-[0_0_20px_rgba(34,211,238,0.25)] group-hover:-rotate-6 group-hover:scale-105 group-active:scale-95 transition-transform duration-300">
                <i className="fas fa-shield-alt text-2xl"></i>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-[#060814] text-[10px] font-bold border border-[#060814] shadow">
                  <i className="fas fa-check text-[9px]"></i>
                </span>
              </div>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white mb-1.5 group-hover:text-cyan-400 transition-colors">
              {feat2Title || (isAr ? "عمولة أمنة 100%" : "100% Safe Commission")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs leading-relaxed">
              {feat2Desc || (isAr ? "معاملات إلكترونية سريعة ومحمية بأعلى معايير الأمان والحماية التامة." : "Fast and secure electronic transactions protected with top safety protocols.")}
            </p>
          </div>

          {/* Card 3: Continuous Support & Development */}
          <div className="group flex flex-col items-center text-center p-4 sm:p-5 pt-6 md:pt-4 rounded-2xl transition-all duration-300 hover:bg-white/[0.03] hover:-translate-y-1 active:scale-[0.97] relative">
            <div className="relative mb-4">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-500/30 to-purple-500/30 rounded-full blur-md opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse"></div>
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 via-[#0a0f24] to-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/40 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:rotate-6 group-hover:scale-105 transition-transform duration-300">
                <i className="fas fa-sync-alt text-2xl"></i>
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-violet-500 border border-[#060814]"></span>
                </span>
              </div>
            </div>
            <h3 className="font-bold text-lg sm:text-xl text-white mb-1.5 group-hover:text-violet-400 transition-colors">
              {feat3Title || (isAr ? "دعم مستمر وتطوير" : "Continuous Updates & Development")}
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xs leading-relaxed">
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
      <section data-aos="fade-up" suppressHydrationWarning className="w-full cyber-container relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
          <div>
            <span className="text-violet-400 text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-2">
              <i className="fas fa-certificate text-cyan-400"></i> Official reseller campaigns
            </span>
            <h2 className="text-xl sm:text-3xl font-black text-white">Fresh activations, unlocks, and tool offers</h2>
          </div>
        </div>

        <div className="w-full">
          {campaigns.length > 0 ? (
            <CampaignSlider campaigns={campaigns} lang={params.lang} />
          ) : (
            <div className="curved-cockpit rounded-2xl sm:rounded-3xl p-8 border-2 border-cyan-500/30 text-center text-slate-300 shadow-xl">
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
