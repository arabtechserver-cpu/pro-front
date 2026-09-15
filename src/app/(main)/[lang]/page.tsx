import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import HeroScrollVideoBackground from "@/components/HeroScrollVideoBackground";
import HeroSection from "@/components/HeroSection";
import ServiceLanes from "@/components/ServiceLanes";
import ToolMarquee from "@/components/ToolMarquee";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import PackagesSlider from "@/components/PackagesSlider";
import CampaignSlider from "@/components/CampaignSlider";
import FaqSection from "@/components/FaqSection";
import SupportCtaSection from "@/components/SupportCtaSection";
import NewsletterSection from "@/components/NewsletterSection";
import { Sparkles, Zap, ShieldCheck, Wrench, Lock, Tag, MessageCircle, Send, Mail } from "lucide-react";

async function getHomepageConfig() {
  const candidates = [...new Set([
    process.env.INTERNAL_API_URL,
    "http://pro-b-i0r2xu:5000",
    "http://backend:5000",
    "http://localhost:5000",
    process.env.NEXT_PUBLIC_API_URL,
    "https://arabtechproserver.tech"
  ].filter(Boolean) as string[])];

  try {
    return await Promise.any(candidates.map(async (baseUrl) => {
      const cleanBase = baseUrl.replace(/\/$/, "");
      const res = await fetch(`${cleanBase}/api/homepage`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(900)
      });
      if (!res.ok) throw new Error(`Homepage API returned ${res.status}`);
      return res.json();
    }));
  } catch {
    return null;
  }
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
      "Arab Tech Pro Server",
      "Arab Tech Pro Server Pro",
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
      siteName: isAr ? "عرب تك برو سيرفر - Arab Tech Pro Server" : "Arab Tech Pro Server",
      images: [
        {
          url: shareImg,
          width: 1200,
          height: 630,
          alt: isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
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

  const notice1 = isAr ? hp?.noticeBar?.text1Ar : hp?.noticeBar?.text1En;
  const notice2 = isAr ? hp?.noticeBar?.text2Ar : hp?.noticeBar?.text2En;
  const whatsappNum = hp?.noticeBar?.whatsapp || "+16728972935";
  const telegramUser = hp?.noticeBar?.telegram && !hp.noticeBar.telegram.includes('@gmail') ? hp.noticeBar.telegram : "@ARABTECHSUPPURT2";
  const telegramUrl = hp?.noticeBar?.telegram
    ? (hp.noticeBar.telegram.startsWith("http") ? hp.noticeBar.telegram : `https://t.me/${hp.noticeBar.telegram.replace(/^@/, '')}`)
    : "https://t.me/ARABTECHSUPPURT2";
  const emailAddr = (hp?.noticeBar?.email && hp.noticeBar.email !== "eslamgsm1774@gmail.com") ? hp.noticeBar.email : "arabtechserver@gmail.com";

  const heroConfig = {
    liveTag: isAr ? hp?.heroSection?.liveTagAr : hp?.heroSection?.liveTagEn,
    title1: isAr ? hp?.heroSection?.title1Ar : hp?.heroSection?.title1En,
    title2: isAr ? hp?.heroSection?.title2Ar : hp?.heroSection?.title2En,
    lead: isAr ? hp?.heroSection?.leadAr : hp?.heroSection?.leadEn,
    btnBrowse: isAr ? hp?.heroSection?.btnBrowseAr : hp?.heroSection?.btnBrowseEn,
    btnBrowseUrl: formatUrl(hp?.heroSection?.btnBrowseUrl, "/pricing"),
    btnJoin: isAr ? hp?.heroSection?.btnJoinAr : hp?.heroSection?.btnJoinEn,
    btnJoinUrl: formatUrl(hp?.heroSection?.btnJoinUrl, "/register"),
  };

  const serviceConfig = {
    imeiTitle: isAr ? hp?.serviceLanes?.imeiTitleAr : hp?.serviceLanes?.imeiTitleEn,
    imeiDesc: isAr ? hp?.serviceLanes?.imeiDescAr : hp?.serviceLanes?.imeiDescEn,
    imeiUrl: formatUrl(hp?.serviceLanes?.imeiUrl, "/pricing?cat=imei"),
    serverTitle: isAr ? hp?.serviceLanes?.serverTitleAr : hp?.serviceLanes?.serverTitleEn,
    serverDesc: isAr ? hp?.serviceLanes?.serverDescAr : hp?.serviceLanes?.serverDescEn,
    serverUrl: formatUrl(hp?.serviceLanes?.serverUrl, "/pricing?cat=server"),
    remoteTitle: isAr ? hp?.serviceLanes?.remoteTitleAr : hp?.serviceLanes?.remoteTitleEn,
    remoteDesc: isAr ? hp?.serviceLanes?.remoteDescAr : hp?.serviceLanes?.remoteDescEn,
    remoteUrl: formatUrl(hp?.serviceLanes?.remoteUrl, "/pricing?cat=remote"),
    storeTitle: isAr ? hp?.serviceLanes?.storeTitleAr : hp?.serviceLanes?.storeTitleEn,
    storeDesc: isAr ? hp?.serviceLanes?.storeDescAr : hp?.serviceLanes?.storeDescEn,
    storeUrl: formatUrl(hp?.serviceLanes?.storeUrl, "/pricing?cat=store"),
  };

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
    <div className="homepage-static-content relative flex flex-col pb-12 sm:pb-20 overflow-x-clip">
      {/* 1. Hardware-Accelerated Video / Motion Layer (Zero-lag scroll decoupling) */}
      <HeroScrollVideoBackground lang={params.lang} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
            "url": "https://arabtechproserver.tech",
            "potentialAction": {
              "@type": "SearchAction",
              "target": `https://arabtechproserver.tech/${params.lang}/pricing?search={search_term_string}`,
              "query-input": "required name=search_term_string"
            }
          })
        }}
      />

      {/* 2. Real-time Live Notice Marquee */}
      <div className="w-full bg-[#0a0f18]/60 backdrop-blur-md border-b border-[#141d2e]/60 mb-4 sm:mb-6 relative z-20 overflow-hidden shadow-sm">
        <div className="w-full flex whitespace-nowrap overflow-hidden py-2 sm:py-2.5" dir="ltr">
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer select-none text-xs sm:text-sm font-medium text-slate-300">
            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4">
              <span className="flex items-center gap-2 bg-sky-500/10 text-sky-300 px-3 py-1 rounded-full border border-sky-400/30 font-bold shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-white shrink-0">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-violet-400 font-semibold shrink-0">
                <Tag className="w-4 h-4" />
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/15 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-all font-bold shrink-0">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/15 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/25 transition-all font-bold shrink-0">
                <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-sky-300 transition-colors shrink-0">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{emailAddr}</span>
              </a>
            </div>

            <div className="flex shrink-0 items-center gap-6 sm:gap-8 px-4" aria-hidden="true">
              <span className="flex items-center gap-2 bg-sky-500/10 text-sky-300 px-3 py-1 rounded-full border border-sky-400/30 font-bold shrink-0">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>{notice1 || (isAr ? "تسليم فوري وتلقائي لمعظم خدمات الـ IMEI والسيرفر على مدار 24/7" : "Instant 24/7 automated delivery for IMEI & server services")}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{notice2 || (isAr ? "دفع آمن 100% + شحن فوري للمحفظة مع ضمان استرجاع الرصيد" : "100% Secure checkout + instant wallet funding & refund protection")}</span>
              </span>

              <span className="flex items-center gap-2 text-white shrink-0">
                <Wrench className="w-4 h-4 text-sky-400" />
                <span>{isAr ? "تفعيل فوري لأقوى أدوات وبوكسات السوفت وير (UnlockTool, Chimera, Borneo, AMT)" : "Instant activation for top tools (UnlockTool, Chimera, Borneo, AMT)"}</span>
              </span>

              <span className="flex items-center gap-2 shrink-0">
                <Lock className="w-4 h-4 text-indigo-400" />
                <span>{isAr ? "فك شفرات رسمي وتخطي iCloud & FRP لجميع الشبكات والموديلات" : "Official factory unlock & iCloud / FRP bypass worldwide"}</span>
              </span>

              <span className="flex items-center gap-2 text-violet-400 font-semibold shrink-0">
                <Tag className="w-4 h-4" />
                <span>{isAr ? "أسعار جملة وتخفيضات خاصة لأصحاب المحلات والوكلاء" : "Exclusive wholesale pricing for resellers & repair shops"}</span>
              </span>

              <a href={`https://wa.me/${whatsappNum.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#25D366]/15 text-[#25D366] px-3 py-1 rounded-full border border-[#25D366]/30 hover:bg-[#25D366]/25 transition-all font-bold shrink-0">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: {whatsappNum}</span>
              </a>
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#0088cc]/15 text-[#0088cc] px-3 py-1 rounded-full border border-[#0088cc]/30 hover:bg-[#0088cc]/25 transition-all font-bold shrink-0">
                <Send className="w-3.5 h-3.5 text-[#0088cc]" />
                <span>Telegram: {telegramUser}</span>
              </a>
              <a href={`mailto:${emailAddr}`} className="flex items-center gap-2 hover:text-sky-300 transition-colors shrink-0">
                <Mail className="w-3.5 h-3.5 text-sky-400" />
                <span>{emailAddr}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Responsive Content Container */}
      <div className="w-full cyber-container space-y-8 sm:space-y-12">
        {/* Unified High-Performance Hero Cockpit */}
        <HeroSection lang={params.lang} config={heroConfig} />

        {/* 4 Primary Operational Service Portals */}
        <ServiceLanes lang={params.lang} config={serviceConfig} />

        {/* Continuous Tool Marquee */}
        <ToolMarquee tools={hp?.toolMarquee} lang={params.lang} />

        {/* 6 Capabilities Architecture Grid */}
        <CapabilitiesGrid lang={params.lang} />

        {/* Top In-Demand Server Packages */}
        <PackagesSlider lang={params.lang} />

        {/* Verified Reseller Campaigns */}
        <section className="w-full relative">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-400 mb-2.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
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

        {/* Accordion FAQ Section */}
        <FaqSection lang={params.lang} />

        {/* 24/7 VIP Support CTA */}
        <SupportCtaSection
          lang={params.lang}
          whatsappNum={whatsappNum}
          telegramUrl={telegramUrl}
          emailAddr={emailAddr}
        />

        {/* Interactive Newsletter Section */}
        <NewsletterSection lang={params.lang} />
      </div>
    </div>
  );
}
