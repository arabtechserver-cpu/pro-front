import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "../../globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export async function generateMetadata({ params }: { params: { lang: string } }): Promise<Metadata> {
  const isAr = params.lang === "ar";
  const siteTitle = isAr ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server | GSM & Remote Unlock Services";
  const siteDesc = isAr
    ? "الموقع الرسمي لمنصة عرب تك برو سيرفر (Arab Tech Pro Server) - أفضل وأسرع سيرفر لفك شفرات الهواتف، تخطي آيكلود وFRP، وشراء رصيد البوكسات والدونجل وسيرفرات IMEI عن بعد."
    : "Official Arab Tech Pro Server - The leading platform for remote phone unlocking, iCloud & FRP bypass, box and dongle activations, and instant IMEI services.";

  return {
    title: {
      template: "%s | Arab Tech Pro Server",
      default: siteTitle,
    },
    description: siteDesc,
    keywords: [
      "عرب تك برو سيرفر",
      "عرب تيك برو سيرفر",
      "عرب تك سيرفر",
      "عرب تيك سيرفر",
      "Arab Tech Pro Server",
      "Arab Tech Server Pro",
      "Arab Tech Server",
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
      url: "https://arabtechproserver.tech",
      siteName: "Arab Tech Pro Server - عرب تك برو سيرفر",
      images: [
        {
          url: "https://arabtechproserver.tech/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Arab Tech Pro Server",
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
      images: ["https://arabtechproserver.tech/images/og-image.png"],
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
        { url: "/images/logo_en.png", type: "image/png" },
        { url: "/icon.png", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: "/apple-icon.png",
    },
    verification: {
      google: "N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { lang: string };
}>) {
  const lang = params.lang as Locale;
  const dict = await getDictionary(lang);
  const dir = lang === "ar" ? "rtl" : "ltr";
  const isAr = lang === "ar";

  const jsonLdWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Arab Tech Pro Server",
    "alternateName": [
      "عرب تك برو سيرفر",
      "عرب تيك برو سيرفر",
      "Arab Tech Server Pro",
      "Arab Tech Server",
      "عرب تك سيرفر",
      "عرب تيك سيرفر"
    ],
    "url": "https://arabtechproserver.tech",
    "inLanguage": ["ar", "en"],
    "description": isAr
      ? "الموقع الرسمي لمنصة عرب تك برو سيرفر لخدمات فك الهواتف، تخطي iCloud وFRP، وخدمات IMEI والسيرفر عن بعد."
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
    "name": "Arab Tech Pro Server",
    "alternateName": "عرب تك برو سيرفر",
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

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta name="google-site-verification" content="N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI" />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={`https://arabtechproserver.tech/${lang}`} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
      </head>
      <body className={`${inter.variable} ${jakarta.variable} ${jetbrains.variable} bg-background text-on-surface antialiased min-h-screen flex flex-col relative`}>
        <AnalyticsTracker />
        {/* Background Gradients */}
        <div className="fixed inset-0 z-[-1] pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-primary/5 to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-[50vw] h-[50vh] bg-gradient-to-tl from-secondary/5 to-transparent"></div>
        </div>

        <Navbar lang={lang} dict={dict.nav} />
        
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12">
          {children}
        </main>

        <Footer lang={lang} dict={dict.footer} />
      </body>
    </html>
  );
}
