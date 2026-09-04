import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import ClientWidgets from "@/components/ClientWidgets";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export async function generateMetadata(props: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.lang === "ar";
  const siteTitle = isAr ? "سيرفر الوفاق | Al-Wefaq Server" : "Al-Wefaq Server | GSM & Remote Unlock Services";
  const siteDesc = isAr
    ? "الموقع الرسمي لمنصة سيرفر الوفاق (Al-Wefaq Server) - أفضل وأسرع سيرفر لفك شفرات الهواتف، تخطي آيكلود وFRP، وشراء رصيد البوكسات والدونجل وسيرفرات IMEI عن بعد."
    : "Official Al-Wefaq Server - The leading platform for remote phone unlocking, iCloud & FRP bypass, box and dongle activations, and instant IMEI services.";

  return {
    title: {
      template: "%s | Al-Wefaq Server",
      default: siteTitle,
    },
    description: siteDesc,
    keywords: [
      "سيرفر الوفاق",
      "الوفاق سيرفر",
      "سيرفر الوفاق",
      "الوفاق",
      "Arab Tech Pro Server",
      "Al-Wefaq Server Pro",
      "Al-Wefaq Server",
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
    applicationName: "Al-Wefaq Server",
    authors: [{ name: "Al-Wefaq Server", url: "https://arabtechproserver.tech" }],
    creator: "Al-Wefaq Server",
    publisher: "Al-Wefaq Server",
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
      siteName: "سيرفر الوفاق - Al-Wefaq Server",
      images: [
        {
          url: isAr
            ? "https://arabtechproserver.tech/images/og_share_ar.png"
            : "https://arabtechproserver.tech/images/og_share_en.png",
          width: 1200,
          height: 630,
          alt: "Al-Wefaq Server Logo",
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
      canonical: "https://arabtechproserver.tech",
      languages: {
        "ar": "https://arabtechproserver.tech/ar",
        "en": "https://arabtechproserver.tech/en",
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
    "name": "Al-Wefaq Server",
    "alternateName": [
      "سيرفر الوفاق",
      "الوفاق سيرفر",
      "Al-Wefaq Server Pro",
      "Al-Wefaq Server",
      "سيرفر الوفاق",
      "الوفاق"
    ],
    "url": "https://arabtechproserver.tech",
    "inLanguage": ["ar", "en"],
    "description": isAr
      ? "الموقع الرسمي لمنصة سيرفر الوفاق لخدمات فك الهواتف، تخطي iCloud وFRP، وخدمات IMEI والسيرفر عن بعد."
      : "Official Al-Wefaq Server for remote phone unlocking, iCloud & FRP bypass, and IMEI server services.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://arabtechproserver.tech/ar/pricing?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Al-Wefaq Server",
    "alternateName": "سيرفر الوفاق",
    "url": "https://arabtechproserver.tech",
    "logo": "https://arabtechproserver.tech/images/logo_en.png",
    "sameAs": [
      "https://t.me/ARABTECHSUPPURT2"
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
    "name": "سيرفر الوفاق - Al-Wefaq Server",
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
        "name": isAr ? "ما هو موقع سيرفر الوفاق؟" : "What is Al-Wefaq Server?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "سيرفر الوفاق (Al-Wefaq Server) هو السيرفر الرسمي الأول لخدمات فك شفرات الهواتف المحمولة عن بعد، وتفعيل برامج السوفت وير والبوكسات (مثل UnlockTool, Chimera, Borneo)، وتخطي حسابات Google FRP وiCloud بأسرع وقت وأفضل أسعار الجملة."
            : "Al-Wefaq Server is the official platform providing remote GSM services, official phone unlocking, tool activations (UnlockTool, Chimera, Borneo), iCloud & FRP bypass, and instant server API credits."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "هل يوفر سيرفر الوفاق ربط API للموزعين؟" : "Does Al-Wefaq Server provide API integration for resellers?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": isAr
            ? "نعم، المنصة تدعم الربط المباشر المتوافق مع Dhru Fusion وWebx عبر واجهة برمجة التطبيقات API على الرابط: https://arabtechproserver.tech/api/v1/provider."
            : "Yes, we provide full REST API compatibility with Dhru Fusion and Webx platforms at https://arabtechproserver.tech/api/v1/provider."
        }
      },
      {
        "@type": "Question",
        "name": isAr ? "ما هي طرق الدفع المتاحة في سيرفر الوفاق؟" : "What payment methods are supported?",
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
    <html lang={lang} dir={dir}>
      <head>
        <meta name="google-site-verification" content="N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`https://arabtechproserver.tech/${lang}`} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        {/* Preload High-Priority LCP Hero Image */}
        <link
          rel="preload"
          as="image"
          href={isAr ? "/images/hero_cyber_ar.webp" : "/images/hero_cyber_en.webp"}
          type="image/webp"
        />
        {/* Explicit Meta tags for WhatsApp, Telegram, Facebook & Twitter link previews */}
        <meta property="og:image" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
        <meta property="og:image:secure_url" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Al-Wefaq Server Logo" />
        <meta name="twitter:image" content={isAr ? "https://arabtechproserver.tech/images/og_share_ar.png" : "https://arabtechproserver.tech/images/og_share_en.png"} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA=="
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
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
      <body className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} bg-background text-on-surface antialiased min-h-screen flex flex-col relative`}>
        {/* Client Enhancement Widgets (Lazy loaded, non-blocking) */}
        <ClientWidgets lang={lang} />

        <Navbar lang={lang} dict={dict.nav} />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12">
          {children}
        </main>

        <Footer lang={lang} dict={dict.footer} />
      </body>
    </html>
  );
}
