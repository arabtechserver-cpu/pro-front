import { Metadata } from "next";
import { Locale, i18n } from "@/i18n/config";
import { notFound } from "next/navigation";
import GamingClient from "./GamingClient";

type Props = {
  params: Promise<{ lang: Locale }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const isAr = params.lang === "ar";

  const rawSection = searchParams?.section || searchParams?.bundle || searchParams?.group || searchParams?.search;
  let section = typeof rawSection === "string" ? rawSection : undefined;

  if (section) {
    try {
      section = decodeURIComponent(section);
    } catch {
      // ignore
    }
    section = section.replace(/^%20/, "").trim();
  }

  const title = section
    ? isAr
      ? `باقات وشحن ${section} فوري | عرب تك برو سيرفر`
      : `${section} Instant Top-Up & Vouchers | Arab Tech Pro Server`
    : isAr
    ? "عالم الألعاب وشحن البطاقات والخدمات الرقمية | عرب تك برو سيرفر"
    : "Gaming Top-Ups, Digital Cards & Subscriptions | Arab Tech Pro Server";

  const description = section
    ? isAr
      ? `أسعار وعروض شحن ${section}: تسليم فوري وتلقائي 24/7 عبر رصيد المحفظة بسيرفر عرب تك برو بأفضل أسعار الجملة المعتمدة للوكلاء والموزعين.`
      : `Live packages and wholesale rates for ${section}: instant 24/7 delivery and automated fulfillment on Arab Tech Pro Server.`
    : isAr
    ? "متجر شحن الألعاب الرسمي والبطاقات الرقمية: شحن فوري بالآيدي لببجي وفري فاير وروبلوكس، بطاقات جوجل بلاي وآيتونز وبلايستيشن، واشتراكات تيليجرام بريميوم وشرائح eSIM الدولية بأسعار الجملة."
    : "Official digital gaming and voucher store: instant player ID top-ups for PUBG, Free Fire, Roblox, gift cards for Google Play, iTunes, PlayStation, Telegram Premium and global eSIMs at wholesale rates.";

  const currentUrl = `https://arabtechproserver.tech/${params.lang}/gaming${
    section ? `?section=${encodeURIComponent(section)}` : ""
  }`;

  const shareImg = isAr
    ? "https://arabtechproserver.tech/images/og_share_ar.png"
    : "https://arabtechproserver.tech/images/og_share_en.png";

  const keywords = isAr
    ? [
        "شحن العاب",
        "شحن ببجي موبايل",
        "شدات ببجي رخيص",
        "شحن فري فاير بالـ ID",
        "شحن كول اوف ديوتي",
        "شحن فالورانت",
        "شحن روبلوكس",
        "بطاقات جوجل بلاي",
        "بطاقات ايتونز ابل",
        "بطاقات بلايستيشن",
        "بطاقات اكس بوكس",
        "بطاقات ستيم",
        "اشتراك تيليجرام بريميوم",
        "اشتراك شاهد VIP",
        "شرائح الكترونية eSIM",
        "Rewarble",
        "شحن العاب جملة",
        "سيرفر شحن العاب",
        "عرب تك برو سيرفر العاب",
        "شحن فوري بالآيدي",
        section ? `شحن ${section}` : "",
      ].filter(Boolean)
    : [
        "Gaming Top-Up",
        "PUBG Mobile UC",
        "Free Fire Diamonds",
        "Call of Duty CP",
        "Valorant Points",
        "Roblox Robux",
        "Google Play Gift Cards",
        "Apple iTunes Cards",
        "PlayStation Network Cards",
        "Steam Wallet Codes",
        "Xbox Gift Cards",
        "Telegram Premium Subscriptions",
        "Shahid VIP Subscriptions",
        "International Travel eSIM Data",
        "Wholesale Game Codes",
        "Arab Tech Pro Server Gaming",
        section ? `${section} Top-Up` : "",
      ].filter(Boolean);

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title,
    description,
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
      },
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        ar: `https://arabtechproserver.tech/ar/gaming${section ? `?section=${encodeURIComponent(section)}` : ""}`,
        en: `https://arabtechproserver.tech/en/gaming${section ? `?section=${encodeURIComponent(section)}` : ""}`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
      images: [
        {
          url: shareImg,
          width: 1200,
          height: 630,
          alt: isAr ? "عرب تك برو سيرفر - عالم الألعاب والخدمات الرقمية" : "Arab Tech Pro Server - Gaming & Digital Services",
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

export default async function GamingPage(props: Props) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  if (!i18n.locales.includes(params.lang as Locale)) {
    notFound();
  }

  const isAr = params.lang === "ar";
  const rawSection = searchParams?.section || searchParams?.bundle || searchParams?.group || searchParams?.search;
  const initialSectionParam = typeof rawSection === "string" ? rawSection : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `https://arabtechproserver.tech/${params.lang}/gaming`,
        "url": `https://arabtechproserver.tech/${params.lang}/gaming`,
        "name": isAr ? "عالم الألعاب وشحن البطاقات والخدمات الرقمية" : "Gaming Top-Ups, Digital Cards & Subscriptions",
        "description": isAr
          ? "منصة متكاملة لشحن الألعاب المباشر، بطاقات المتاجر والهدايا، والاشتراكات الترفيهية وشرائح الإنترنت eSIM بأفضل أسعار الجملة."
          : "Comprehensive portal for instant in-game top-ups, digital gift vouchers, subscriptions and global eSIMs.",
        "inLanguage": isAr ? "ar" : "en",
        "isPartOf": {
          "@type": "WebSite",
          "name": isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
          "url": "https://arabtechproserver.tech"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": isAr ? "الرئيسية" : "Home",
            "item": `https://arabtechproserver.tech/${params.lang}`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": isAr ? "الخدمات الرقمية والألعاب" : "Digital & Gaming Services",
            "item": `https://arabtechproserver.tech/${params.lang}/gaming`
          }
        ]
      },
      {
        "@type": "Store",
        "name": isAr ? "عرب تك برو سيرفر - متجر الخدمات الرقمية والألعاب" : "Arab Tech Pro Server - Digital Gaming Store",
        "url": `https://arabtechproserver.tech/${params.lang}/gaming`,
        "description": isAr
          ? "متجر إلكتروني معتمد لتسليم أكواد الألعاب والشحن الفوري والاشتراكات بأسعار الجملة."
          : "Authorized digital store providing automated in-game top-up and voucher delivery at wholesale rates.",
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": isAr ? "كتالوج الألعاب والبطاقات الرقمية" : "Digital Gaming & Vouchers Catalog",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": isAr ? "شحن الألعاب المباشر (In-Game Top-Up)" : "In-Game Direct Top-Up",
              "description": isAr ? "شحن فوري بالآيدي لألعاب ببجي، فري فاير، فالورانت، روبلوكس، كول أوف ديوتي" : "Direct player ID top-up for PUBG, Free Fire, Valorant, Roblox, Call of Duty"
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "بطاقات ومتاجر التطبيقات (Gift Cards)" : "App Stores & Gift Cards",
              "description": isAr ? "بطاقات جوجل بلاي، أبل آيتونز، بلايستيشن ستور، إكس بوكس، ستيم الأصلية" : "Genuine gift cards for Google Play, iTunes, PlayStation, Xbox, Steam"
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "الاشتراكات والترفيه (Digital Subscriptions)" : "Entertainment Subscriptions",
              "description": isAr ? "تفعيل تيليجرام بريميوم، شاهد VIP، نتفليكس، ديسكورد نايترو" : "Activations for Telegram Premium, Shahid VIP, Netflix, Discord Nitro"
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "شرائح الإنترنت الدولية eSIM" : "Global Travel eSIMs",
              "description": isAr ? "باقات إنترنت دولية سريعة تغطي أكثر من 150 دولة حول العالم" : "High-speed travel internet packages across 150+ countries"
            }
          ]
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamingClient lang={params.lang} initialSectionParam={initialSectionParam} />
    </>
  );
}
