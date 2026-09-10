import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Cairo, Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale, i18n } from "@/i18n/config";
import ClientWidgets from "@/components/ClientWidgets";

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
    ? "عرب تك برو سيرفر | منصة فك شفرات وتفعيل الهواتف"
    : "Arab Tech Pro Server | GSM & Remote Unlock Services";
  const siteDesc = isAr
    ? "منصة عرب تك برو سيرفر لفك شفرات الهواتف، تخطي حسابات آيكلود وFRP، وتفعيل البوكسات والدونجل وسيرفرات IMEI بأسعار الجملة المعتمدة."
    : "Arab Tech Pro Server: Professional phone unlocking, iCloud and FRP bypass, box and dongle activations, and high-speed IMEI server services.";

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
          url: isAr
            ? "https://arabtechproserver.tech/images/og_share_ar.png"
            : "https://arabtechproserver.tech/images/og_share_en.png",
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
        isAr
          ? "https://arabtechproserver.tech/images/og_share_ar.png"
          : "https://arabtechproserver.tech/images/og_share_en.png",
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
        { url: "/favicon.ico", sizes: "any" },
        { url: "/images/icon-48.png", sizes: "48x48", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/images/apple-touch-icon.png",
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
    "logo": "https://arabtechproserver.tech/images/logo_en.png",
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
    <html lang={lang} dir={dir} className="dark" style={{ backgroundColor: "#050814", colorScheme: "dark" }}>
      <head>
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
        {/* Explicit Meta tags for WhatsApp, Telegram, Facebook & Twitter link previews */}
        <meta property="og:image" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
        <meta property="og:image:secure_url" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Arab Tech Pro Server Logo" />
        <meta name="twitter:image" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
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
        className={`${cairo.variable} ${inter.variable} ${jakarta.variable} ${jetbrains.variable} bg-[#060814] text-on-surface antialiased min-h-screen flex flex-col relative`}
        style={{ backgroundColor: "#060814", colorScheme: "dark" }}
      >
        {/* Client Enhancement Widgets (Lazy loaded, non-blocking) */}
        <ClientWidgets lang={lang} />

        <Navbar lang={lang} dict={dict.nav} />
        
        <main className="flex-grow w-full pt-16 sm:pt-20 pb-12 overflow-x-clip bg-[#050814]">
          {children}
        </main>

        <Footer lang={lang} dict={dict.footer} />
      </body>
    </html>
  );
}
