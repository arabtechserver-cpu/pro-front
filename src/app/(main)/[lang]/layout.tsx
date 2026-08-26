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
  return {
    title: {
      template: "%s | Arab Tech Pro Server",
      default: isAr 
        ? "عرب تك برو سيرفر - أفضل منصة لفك الهواتف وخدمات IMEI"
        : "Arab Tech Pro Server - Best Platform for Phone Unlocking & IMEI Services",
    },
    description: isAr
      ? "اطلب خدمات فك الشبكات الرسمية، تخطي iCloud و FRP، وتقارير IMEI عن بعد من موقع عرب تيك سيرفر برو. خدمات موثوقة وسريعة."
      : "Order official network unlocking, iCloud & FRP bypass, and IMEI reports remotely from Arab Tech Server Pro. Reliable and fast services.",
    keywords: ["Arab Tech Pro Server", "Arab Tech Server", "عرب تيك سيرفر", "عرب تك برو", "IMEI", "فك شبكات", "تخطي iCloud"],
    metadataBase: new URL("https://arabtechproserver.tech"),
    openGraph: {
      title: isAr ? "عرب تك برو سيرفر | Arab Tech Pro Server" : "Arab Tech Pro Server",
      description: isAr ? "أفضل منصة لفك الهواتف وخدمات السوفتوير عن بعد." : "Best platform for phone unlocking and remote software services.",
      url: "https://arabtechproserver.tech",
      siteName: "Arab Tech Pro Server",
      images: [
        {
          url: "/images/og-image.jpg",
          width: 1200,
          height: 630,
          alt: "Arab Tech Pro Server",
        },
      ],
      locale: isAr ? "ar_SA" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Arab Tech Pro Server",
      description: isAr ? "عرب تك برو سيرفر لخدمات فك الهواتف عن بعد" : "Arab Tech Pro Server for Remote Phone Unlocking",
    },
    alternates: {
      canonical: "https://arabtechproserver.tech",
      languages: {
        'ar': 'https://arabtechproserver.tech/ar',
        'en': 'https://arabtechproserver.tech/en',
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/images/logo_en.png', type: 'image/png' },
        { url: '/icon.png', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-icon.png',
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

  return (
    <html lang={lang} dir={dir}>
      <head>
        <meta name="google-site-verification" content="N34n3oI-P5elZmLFHgFqp_BK93EijixhnIHEj_2oGnI" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Arab Tech Pro Server",
              "alternateName": "Arab Tech Server Pro",
              "url": "https://arabtechproserver.tech",
              "logo": "https://arabtechproserver.tech/images/logo.png",
              "sameAs": [
                "https://t.me/gsmteamofficial"
              ]
            })
          }}
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
