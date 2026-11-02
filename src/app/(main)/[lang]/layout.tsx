import { brandAssets, brandOrigin, getBrandShareImage } from "@/lib/brand";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cairo, Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import "../../site-theme.css";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import { ThemeProvider } from "@/context/ThemeContext";
import MainSiteShell from "@/components/MainSiteShell";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }
  const isAr = params.lang === "ar";
  const siteTitle = isAr
    ? "عرب تك برو سيرفر | سوفت وير الهواتف والخدمات عن بُعد"
    : "Arab Tech Pro Server | Phone Software & Remote Services";
  const siteDesc = isAr
    ? "منصة عرب تك برو سيرفر لخدمات سوفت وير الهواتف، التفعيل وفك الشبكات عن بُعد، تراخيص أدوات الصيانة وأرصدة السيرفرات."
    : "Arab Tech Pro Server: phone software, remote activation and network unlocking, repair-tool licenses and server credits.";

  return {
    title: {
      template: "%s | عرب تك برو سيرفر - Arab Tech Pro Server",
      default: siteTitle,
    },
    description: siteDesc,
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
      "تخطي FRP",
      "تقارير IMEI",
      "تفعيل بوكسات ودونجل",
      "شراء كردت سيرفر",
      "UnlockTool",
      "Chimera Tool",
      "iCloud Bypass",
      "FRP Bypass"
    ],
    metadataBase: new URL("https://arabtechproserver.tech"),
    applicationName: "Arab Tech Pro Server",
    authors: [{ name: "Arab Tech Pro Server", url: "https://arabtechproserver.tech" }],
    creator: "Arab Tech Pro Server",
    publisher: "Arab Tech Pro Server",
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: siteTitle,
      description: siteDesc,
      url: `https://arabtechproserver.tech/${params.lang}`,
      siteName: isAr ? "عرب تك برو سيرفر (عرب تك برو سيرفر) - Arab Tech Pro Server" : "Arab Tech Pro Server",
      images: [
        {
          url: getBrandShareImage(params.lang),
          width: 1200,
          height: 630,
          alt: isAr ? "عرب تك برو سيرفر - عرب تك برو سيرفر" : "Arab Tech Pro Server Logo",
        },
      ],
      locale: isAr ? "ar_AR" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDesc,
      site: "@ARABTECHSUPPURT2",
      creator: "@ARABTECHSUPPURT2",
      images: [
        getBrandShareImage(params.lang),
      ],
    },
    alternates: {
      canonical: `https://arabtechproserver.tech/${params.lang}`,
      languages: {
        "ar": "https://arabtechproserver.tech/ar",
        "en": "https://arabtechproserver.tech/en",
        "x-default": "https://arabtechproserver.tech",
      },
    },
    icons: {
      icon: [
        { url: brandAssets.favicon, sizes: "any" },
        { url: brandAssets.icon48, sizes: "48x48", type: "image/png" },
      ],
      shortcut: brandAssets.favicon,
      apple: brandAssets.appleIcon,
    },
    verification: {
      google: "N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI",
    },
  };
}

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
  }>
) {
  const params = await props.params;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }

  const {
    children
  } = props;

  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isAr = lang === "ar";

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": isAr ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server",
    "alternateName": [
      "عرب تك برو سيرفر",
      "Arab Tech Pro Server",
      "عرب تك برو سيرفر",
      "عرب تك سيرفر",
      "سيرفر عرب تك",
      "سيرفر عرب تك",
      "عرب تك برو سيرفر",
      "عرب تك",
      "عرب تك",
      "Arab Tech Pro Server Pro",
      "Arab Tech Pro Server"
    ],
    "url": "https://arabtechproserver.tech",
    "inLanguage": ["ar", "en"],
    "description": isAr
      ? "الموقع الرسمي لمنصة عرب تك برو سيرفر | Arab Tech Pro Server لخدمات فك الهواتف، تخطي iCloud وFRP، وخدمات IMEI والسيرفر عن بعد."
      : "Official Arab Tech Pro Server for remote phone unlocking, iCloud & FRP bypass, and IMEI server services.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://arabtechproserver.tech/ar/pricing?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "عرب تك برو سيرفر | Arab Tech Pro Server",
    "legalName": "Arab Tech Pro Server",
    "alternateName": [
      "Arab Tech Pro Server",
      "عرب تك برو سيرفر",
      "عرب تك برو سيرفر",
      "عرب تك سيرفر",
      "عرب تك برو سيرفر",
      "سيرفر عرب تك",
      "Arab Tech Pro Server"
    ],
    "url": "https://arabtechproserver.tech",
    "logo": { "@type": "ImageObject", "url": `${brandOrigin}${brandAssets.organizationLogo}`, "width": 512, "height": 512 },
    "image": getBrandShareImage(lang),
    "sameAs": [
      "https://t.me/ARABTECHSUPPURT2",
      "https://t.me/arabtechserveronline"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+16728972935",
      "contactType": "customer service",
      "availableLanguage": ["Arabic", "English"]
    }
  };

  const jsonLdSoftware = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Arab Tech Pro Server - عرب تك برو سيرفر",
    "operatingSystem": "All (Web, Windows, Mac, Android, iOS)",
    "applicationCategory": "BusinessApplication, UtilitiesApplication",
    "url": "https://arabtechproserver.tech",
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "USD",
      "lowPrice": "0.10",
      "offerCount": "1000+"
    },
    "description": isAr
      ? "المنصة الرائدة في الشرق الأوسط والعالم لفك شفرات الهواتف، تفعيل أدوات GSM، تخطي iCloud وFRP، وخدمات IMEI والسيرفرات الفورية مع ربط API متقدم."
      : "The leading global platform for remote mobile phone unlocking, GSM tool activations, iCloud & FRP bypass, and automated IMEI API server services."
  };

  const jsonLdFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": isAr ? "ما هو موقع عرب تك برو سيرفر؟" : "What is Arab Tech Pro Server?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "عرب تك برو سيرفر (Arab Tech Pro Server) هو السيرفر الرسمي الأول لخدمات فك شفرات الهواتف المحمولة عن بعد، وتفعيل برامج السوفت وير والبوكسات (مثل UnlockTool, Chimera, Borneo)، وتخطي حسابات Google FRP وiCloud بأسرع وقت وأفضل أسعار الجملة."
            : "Arab Tech Pro Server is the official platform providing remote GSM services, official phone unlocking, tool activations (UnlockTool, Chimera, Borneo), iCloud & FRP bypass, and instant server API credits."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "هل يوفر عرب تك برو سيرفر ربط API للموزعين؟" : "Does Arab Tech Pro Server provide API integration for resellers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "نعم، المنصة تدعم الربط المباشر المتوافق مع Dhru Fusion وWebx عبر واجهة برمجة التطبيقات API على الرابط: https://arabtechproserver.tech/api/v1/provider."
            : "Yes, we provide full REST API compatibility with Dhru Fusion and Webx platforms at https://arabtechproserver.tech/api/v1/provider."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "ما هي طرق الدفع المتاحة في عرب تك برو سيرفر؟" : "What payment methods are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "نوفر شحناً فورياً للمحفظة عبر إنستاباي (Instapay)، فودافون كاش، محفظة العملات الرقمية USDT (TRC20/BEP20)، باي بال، وفيزا/ماستركارد."
            : "We support instant wallet topups via Instapay, Vodafone Cash, USDT Crypto, PayPal, and credit cards."
        }
      }
    ]
  };

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('app_theme');if(t==='dark'){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}})();`
          }}
        />
        <meta name="google-site-verification" content="N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* Preload Local Material Symbols Font for Instant Zero-Render-Blocking Display */}
        <link
          rel="preload"
          href="/fonts/material-symbols-outlined.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftware) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdFaq) }}
        />
      </head>
      <body
        className={`${cairo.variable} ${inter.variable} ${jakarta.variable} ${jetbrains.variable} font-sans bg-[#f8fafc] text-slate-900 dark:bg-[#0b0f17] dark:text-slate-100 subpixel-antialiased min-h-screen flex flex-col relative`}
      >
        <ThemeProvider>
          <MainSiteShell lang={lang} dict={dict}>{children}</MainSiteShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
