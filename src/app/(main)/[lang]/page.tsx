import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import HeroSection from "@/components/HeroSection";
import ServiceLanes from "@/components/ServiceLanes";
import SupportedToolsBar from "@/components/SupportedToolsBar";
import CapabilitiesGrid from "@/components/CapabilitiesGrid";
import PackagesSlider from "@/components/PackagesSlider";
import CampaignBanner from "@/components/CampaignBanner";
import WorkflowTrustSection from "@/components/WorkflowTrustSection";
import BottomActionCards from "@/components/BottomActionCards";
import { Zap, ShieldCheck, Wrench, Lock, Tag, MessageCircle, Send, Mail } from "lucide-react";

import localHomepageConfig from "@/data/homepage_config.json";

async function getHomepageConfig() {
  const candidates = [...new Set([
    process.env.INTERNAL_API_URL,
    "http://127.0.0.1:5000",
    "http://localhost:5000",
    process.env.NEXT_PUBLIC_API_URL,
  ].filter(Boolean) as string[])];

  try {
    const res = await Promise.any(candidates.map(async (baseUrl) => {
      const cleanBase = baseUrl.replace(/\/$/, "");
      const r = await fetch(`${cleanBase}/api/homepage`, {
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(1500)
      });
      if (!r.ok) throw new Error(`Homepage API returned ${r.status}`);
      return r.json();
    }));
    if (res && res.heroSection) {
      return res;
    }
    return localHomepageConfig;
  } catch {
    return localHomepageConfig;
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

  return (
    <div className="homepage-static-content relative flex flex-col pb-12 sm:pb-20 overflow-x-clip bg-slate-50 text-slate-900 dark:bg-[#070b14] dark:text-white">
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

      {/* 1. Unified High-Performance Hero Cockpit (Matching Mockup) */}
      <HeroSection lang={params.lang} config={heroConfig} />

      {/* 3. Main Responsive Content Container */}
      <div className="w-full cyber-container space-y-8 sm:space-y-12">
        {/* 4 Primary Operational Service Portals */}
        <ServiceLanes lang={params.lang} config={serviceConfig} />

        {/* 10 Supported Tools Bar (Box 2 in User's Drawing) */}
        <SupportedToolsBar lang={params.lang} tools={hp?.supportedTools} />

        {/* 6 Capabilities Architecture Grid (Why Choose Us) */}
        <CapabilitiesGrid lang={params.lang} />

        {/* Top In-Demand Server Packages (Red Outline 1 in User's Drawing) */}
        <PackagesSlider lang={params.lang} packages={hp?.featuredPackages} />

        {/* Verified Reseller Campaigns & Samsung FRP Banner */}
        <CampaignBanner lang={params.lang} />

        {/* 3-Step Instant Fulfillment & Platform Trust + Stats + Brands */}
        <WorkflowTrustSection lang={params.lang} />

        {/* Dual Bottom Action Cards (Newsletter + Support Contacts) */}
        <BottomActionCards
          lang={params.lang}
          whatsappNum={whatsappNum}
          telegramUrl={telegramUrl}
        />
      </div>
    </div>
  );
}
