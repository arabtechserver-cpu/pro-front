import { Metadata } from "next";
import Link from "next/link";
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
      // ignore decoding error
    }
    section = section.replace(/^%20/, "").trim();
  }

  const title = section
    ? isAr
      ? `باقات وشحن ${section} فوري ومباشر بالـ ID | عرب تك برو سيرفر`
      : `${section} Instant Player ID Top-Up & Gift Cards | Arab Tech Pro Server`
    : isAr
    ? "شحن ألعاب فوري وبطاقات رقمية واشتراكات بالجملة | عرب تك برو سيرفر"
    : "Instant Gaming Top-Ups, Digital Gift Cards & Vouchers | Arab Tech Pro Server";

  const description = section
    ? isAr
      ? `أسعار وعروض شحن ${section}: تسليم فوري وتلقائي 24/7 عبر رصيد المحفظة بسيرفر عرب تك برو بأفضل أسعار الجملة المعتمدة للوكلاء والموزعين ومحلات الألعاب.`
      : `Live packages and wholesale rates for ${section}: instant 24/7 delivery and automated fulfillment on Arab Tech Pro Server for gamers and retailers.`
    : isAr
    ? "سيرفر عرب تك برو الرسمي لشحن الألعاب والبطاقات الرقمية: شحن فوري بالآيدي لألعاب ببجي وفري فاير وروبلوكس وفالورانت وكول أوف ديوتي، شراء بطاقات جوجل بلاي، آيتونز، بلايستيشن، إكس بوكس، واشتراكات تيليجرام وشاهد وشرائح eSIM الدولية بأفضل أسعار الجملة."
    : "Official digital gaming and voucher store: instant player ID top-ups for PUBG, Free Fire, Roblox, Valorant, COD, gift cards for Google Play, iTunes, PlayStation, Steam, Telegram Premium and travel eSIMs at wholesale rates.";

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
        "شدات ببجي فوري",
        "شحن فري فاير بالـ ID",
        "جواهر فري فاير",
        "شحن كول اوف ديوتي",
        "شحن فالورانت تركي وعالمي",
        "شحن روبلوكس روبوكس",
        "بطاقات جوجل بلاي امريكي وسعودي",
        "بطاقات ايتونز ابل ستور",
        "بطاقات بلايستيشن ستور",
        "بطاقات اكس بوكس",
        "بطاقات ستيم تركي",
        "اشتراك تيليجرام بريميوم رخيص",
        "اشتراك شاهد VIP رياضي",
        "شرائح الكترونية دولية eSIM",
        "باقات نت للسفر eSIM",
        "Rewarble قسائم",
        "شحن العاب جملة للوكلاء",
        "سيرفر شحن العاب فوري",
        "عرب تك برو سيرفر العاب",
        "شحن فوري بالآيدي 24 ساعة",
        "اكواد العاب رقمية فورية",
        section ? `شحن ${section}` : "",
        section ? `اسعار ${section}` : "",
      ].filter(Boolean)
    : [
        "Gaming Top-Up",
        "PUBG Mobile UC Top-Up",
        "Cheap PUBG UC Instant",
        "Free Fire Diamonds ID",
        "Call of Duty CP Points",
        "Valorant Points VP",
        "Roblox Robux Instant",
        "Google Play Gift Cards",
        "Apple iTunes Gift Cards",
        "PlayStation Network PSN Cards",
        "Steam Wallet Codes",
        "Xbox Live Gift Cards",
        "Telegram Premium Subscription",
        "Shahid VIP Subscription",
        "International Travel eSIM Data",
        "Global eSIM Data Packages",
        "Rewarble Vouchers",
        "Wholesale Game Codes",
        "Instant Gaming Reseller Server",
        "Arab Tech Pro Server Gaming",
        section ? `${section} Top-Up` : "",
        section ? `${section} Wholesale Rates` : "",
      ].filter(Boolean);

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title,
    description,
    keywords,
    category: "Games & Digital Services",
    creator: "Arab Tech Pro Server",
    publisher: "Arab Tech Pro Server",
    formatDetection: {
      telephone: false,
      address: false,
      email: false,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        ar: `https://arabtechproserver.tech/ar/gaming${section ? `?section=${encodeURIComponent(section)}` : ""}`,
        en: `https://arabtechproserver.tech/en/gaming${section ? `?section=${encodeURIComponent(section)}` : ""}`,
        "x-default": `https://arabtechproserver.tech/ar/gaming${section ? `?section=${encodeURIComponent(section)}` : ""}`,
      },
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
      locale: isAr ? "ar_AR" : "en_US",
      alternateLocale: isAr ? ["en_US"] : ["ar_AR"],
      images: [
        {
          url: shareImg,
          width: 1200,
          height: 630,
          alt: isAr
            ? "عرب تك برو سيرفر - عالم الألعاب وشحن البطاقات والخدمات الرقمية"
            : "Arab Tech Pro Server - Gaming, Digital Cards & Subscriptions",
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

  const faqs = isAr
    ? [
        {
          q: "كيف يعمل نظام شحن الألعاب الفوري عبر عرب تك برو سيرفر؟",
          a: "يعمل النظام بشكل آلي ومتكامل على مدار الساعة (24/7). بمجرد اختيار اللعبة والباقة المطلوبة وإدخال معرف اللاعب (Player ID) ثم تأكيد الطلب، يتم خصم القيمة من رصيد محفظتك المعتمد وتنفيذ الشحن مباشرة دون أي انتظار، أو استلام كود التفعيل الرقمي فوراً في نفس اللحظة عبر الشاشة وسجل طلباتك.",
        },
        {
          q: "ما هي الألعاب والبطاقات الرقمية المدعومة للشحن المباشر؟",
          a: "نوفر شحناً مباشراً لأشهر الألعاب العالمية مثل ببجي موبايل (PUBG UC)، فري فاير (Free Fire Diamonds)، فالورانت، روبلوكس (Robux)، كول أوف ديوتي، وبطاقات المتاجر الرسمية مثل جوجل بلاي، آبل آيتونز، بلايستيشن ستور، إكس بوكس، ستيم، واشتراكات تيليجرام بريميوم وشاهد VIP، وشرائح eSIM الدولية لأكثر من 150 دولة.",
        },
        {
          q: "هل تتوفر أسعار جملة مخصصة للوكلاء والموزعين وأصحاب المتاجر؟",
          a: "نعم بالتأكيد، يقدم سيرفر عرب تك برو أسعار جملة تنافسية مصممة خصيصاً للموزعين وأصحاب محلات الألعاب والمتاجر الإلكترونية مع إمكانية الربط البرمجي السريع عبر API لتنفيذ الطلبات تلقائياً وبأعلى هوامش ربح مضمونة.",
        },
        {
          q: "ما هي وسائل الدفع المتوفرة لتعبئة رصيد المحفظة؟",
          a: "يمكنك تعبئة رصيدك بسهولة عبر فودافون كاش، المحافظ الإلكترونية، شبكة إنستاباي، التحويلات البنكية، والعملات الرقمية المشفرة مثل USDT، بالإضافة للعديد من وسائل الدفع المحلية والدولية الآمنة مع تأكيد فوري للرصيد.",
        },
        {
          q: "هل استلام أكواد البطاقات الرقمية فوري؟",
          a: "نعم، كافة أكواد البطاقات الرقمية وقسائم الهدايا واشتراكات الترفيه يتم توليدها وتسليمها لحظياً بمجرد إتمام العملية، ويمكنك نسخ الكود واستخدامه فوراً أو الرجوع إليه في أي وقت من خلال سجل طلباتك في حسابك.",
        },
        {
          q: "ماذا أفعل في حال إدخال معرف لاعب (Player ID) غير صحيح أو واجهت استفساراً؟",
          a: "فريق الدعم الفني في عرب تك برو سيرفر متاح على مدار الساعة عبر نظام التذاكر المباشر ومحادثات تيليجرام وواتساب للمساعدة الفورية ومتابعة أي طلب لضمان وصول الرصيد إلى حسابك بأمان وسرعة.",
        },
      ]
    : [
        {
          q: "How does the instant game top-up system work on Arab Tech Pro Server?",
          a: "Our system operates on a 24/7 automated fulfillment engine. Once you select your game and package, enter the player ID, and confirm your order, payment is processed from your preloaded wallet balance. In-game credits or digital voucher keys are delivered instantly to your screen and order history.",
        },
        {
          q: "Which games, digital cards, and subscriptions are supported?",
          a: "We support direct player ID top-ups for PUBG Mobile, Free Fire, Valorant, Roblox, and Call of Duty, alongside official digital gift cards for Google Play, Apple iTunes, PlayStation Network, Xbox, Steam, Telegram Premium, Shahid VIP subscriptions, and travel eSIM data across 150+ countries.",
        },
        {
          q: "Are wholesale prices available for resellers, retailers, and store owners?",
          a: "Yes. Arab Tech Pro Server offers dedicated wholesale tiers for distributors, gaming lounges, and online merchants, complete with fast API integration for automated order processing and competitive profit margins.",
        },
        {
          q: "What payment methods are supported to top up wallet funds?",
          a: "You can fund your account using Vodafone Cash, local electronic wallets, InstaPay, direct bank transfers, cryptocurrency (USDT), and various secure regional gateways with instant balance crediting.",
        },
        {
          q: "Is the digital voucher code delivery instantaneous?",
          a: "Yes. All digital voucher codes, software licenses, and subscription activations are delivered immediately upon order confirmation. Codes are visible on your screen and saved permanently in your Orders history.",
        },
        {
          q: "What should I do if I entered an incorrect Player ID or have questions?",
          a: "Our 24/7 dedicated support team is available via our live ticketing system, Telegram, and WhatsApp to verify transactions and ensure your gaming credits reach your account smoothly.",
        },
      ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://arabtechproserver.tech/#website",
        "name": isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server",
        "url": "https://arabtechproserver.tech",
        "potentialAction": {
          "@type": "SearchAction",
          "target": `https://arabtechproserver.tech/${params.lang}/gaming?search={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "WebPage",
        "@id": `https://arabtechproserver.tech/${params.lang}/gaming#webpage`,
        "url": `https://arabtechproserver.tech/${params.lang}/gaming`,
        "name": isAr ? "شحن الألعاب والبطاقات الرقمية والاشتراكات" : "Gaming Top-Ups, Digital Cards & Subscriptions",
        "description": isAr
          ? "منصة متكاملة لشحن الألعاب المباشر، بطاقات المتاجر والهدايا، والاشتراكات الترفيهية وشرائح الإنترنت eSIM بأفضل أسعار الجملة."
          : "Comprehensive portal for instant in-game top-ups, digital gift vouchers, subscriptions and global eSIMs.",
        "inLanguage": isAr ? "ar" : "en",
        "isPartOf": {
          "@id": "https://arabtechproserver.tech/#website",
        },
        "breadcrumb": {
          "@id": `https://arabtechproserver.tech/${params.lang}/gaming#breadcrumb`,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `https://arabtechproserver.tech/${params.lang}/gaming#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": isAr ? "الرئيسية" : "Home",
            "item": `https://arabtechproserver.tech/${params.lang}`,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": isAr ? "الخدمات الرقمية والألعاب" : "Digital & Gaming Services",
            "item": `https://arabtechproserver.tech/${params.lang}/gaming`,
          },
        ],
      },
      {
        "@type": "Store",
        "@id": "https://arabtechproserver.tech/#store",
        "name": isAr ? "عرب تك برو سيرفر - متجر الخدمات الرقمية والألعاب" : "Arab Tech Pro Server - Digital Gaming Store",
        "url": `https://arabtechproserver.tech/${params.lang}/gaming`,
        "logo": "https://arabtechproserver.tech/images/logo.png",
        "image": isAr
          ? "https://arabtechproserver.tech/images/og_share_ar.png"
          : "https://arabtechproserver.tech/images/og_share_en.png",
        "description": isAr
          ? "متجر إلكتروني معتمد لتسليم أكواد الألعاب والشحن الفوري والاشتراكات بأسعار الجملة المعتمدة 24/7."
          : "Authorized digital store providing automated in-game top-up and voucher delivery at wholesale rates 24/7.",
        "priceRange": "$$",
        "paymentAccepted": "Vodafone Cash, Bank Transfer, Crypto USDT, Electronic Wallets, Credit Cards",
        "currenciesAccepted": "USD, EGP, SAR, AED, SDG, EUR",
        "openingHours": "Mo-Su 00:00-24:00",
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.9",
          "reviewCount": "1480",
          "bestRating": "5",
          "worstRating": "1",
        },
        "hasOfferCatalog": {
          "@type": "OfferCatalog",
          "name": isAr ? "كتالوج الألعاب والبطاقات الرقمية" : "Digital Gaming & Vouchers Catalog",
          "itemListElement": [
            {
              "@type": "OfferCatalog",
              "name": isAr ? "شحن الألعاب المباشر (In-Game Top-Up)" : "In-Game Direct Top-Up",
              "description": isAr
                ? "شحن فوري بالآيدي لألعاب ببجي موبايل، فري فاير، فالورانت، روبلوكس، كول أوف ديوتي"
                : "Direct player ID top-up for PUBG Mobile, Free Fire, Valorant, Roblox, Call of Duty",
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "بطاقات ومتاجر التطبيقات (Gift Cards)" : "App Stores & Gift Cards",
              "description": isAr
                ? "بطاقات جوجل بلاي، أبل آيتونز، بلايستيشن ستور، إكس بوكس، ستيم الأصلية"
                : "Genuine gift cards for Google Play, iTunes, PlayStation, Xbox, Steam",
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "أكواد الألعاب الرقمية (Game CD Keys)" : "Game CD Keys & Codes",
              "description": isAr
                ? "أكواد رقمية أصلية لتفعيل ألعاب الكمبيوتر والمنصات الترفيهية فورياً"
                : "Authentic digital activation keys for PC games and entertainment platforms",
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "الاشتراكات والترفيه (Digital Subscriptions)" : "Entertainment Subscriptions",
              "description": isAr
                ? "تفعيل تيليجرام بريميوم، شاهد VIP، نتفليكس، ديسكورد نايترو"
                : "Activations for Telegram Premium, Shahid VIP, Netflix, Discord Nitro",
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "شرائح الإنترنت الدولية eSIM" : "Global Travel eSIMs",
              "description": isAr
                ? "باقات إنترنت دولية سريعة تغطي أكثر من 150 دولة حول العالم"
                : "High-speed travel internet packages across 150+ countries",
            },
            {
              "@type": "OfferCatalog",
              "name": isAr ? "Rewarble وبطاقات المحافظ الرقمية" : "Rewarble Digital Wallet Vouchers",
              "description": isAr
                ? "قسائم شحن المحافظ والبطاقات مسبقة الدفع المتوافقة مع Rewarble"
                : "Vouchers for prepaid cards and wallets compatible with Rewarble",
            },
          ],
        },
      },
      {
        "@type": "Service",
        "@id": `https://arabtechproserver.tech/${params.lang}/gaming#service`,
        "name": isAr
          ? "خدمة شحن الألعاب والبطاقات الرقمية الفورية"
          : "Instant Gaming Top-Up & Digital Voucher Service",
        "serviceType": "Digital In-Game Top-Up & Gift Cards",
        "provider": {
          "@id": "https://arabtechproserver.tech/#store",
        },
        "areaServed": "Global",
      },
      {
        "@type": "FAQPage",
        "@id": `https://arabtechproserver.tech/${params.lang}/gaming#faq`,
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GamingClient lang={params.lang} initialSectionParam={initialSectionParam} />

      {/* Semantic SEO & FAQ Guide Section (Server-Rendered for Maximum Crawlability) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12 border-t border-outline-variant/30 mt-12">
        {/* Semantic Overview & Value Proposition */}
        <div className="space-y-6">
          <header className="space-y-2">
            <span className="text-primary text-xs font-bold uppercase tracking-wider block">
              {isAr ? "دليل الخدمات الرسمية" : "Official Services Guide"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              {isAr
                ? "خدمات شحن الألعاب والبطاقات الرقمية عبر عرب تك برو سيرفر"
                : "Digital Gaming & Voucher Services on Arab Tech Pro Server"}
            </h2>
            <p className="text-sm text-on-surface-variant max-w-4xl leading-relaxed">
              {isAr
                ? "يقدم سيرفر عرب تك برو منصة رائدة ومتكاملة لتوفير خدمات شحن الألعاب المباشرة وتسليم البطاقات الرقمية الأصلية واشتراكات الترفيه وشرائح الإنترنت الدولية eSIM. نوفر حلولاً مؤتمتة تلبي احتياجات اللاعبين الأفراد وأصحاب المتاجر والموزعين بأسعار الجملة المعتمدة وتسليم فوري 24/7 عبر رصيد المحفظة."
                : "Arab Tech Pro Server delivers an automated, enterprise-grade platform for instant in-game player ID top-ups, genuine digital gift vouchers, streaming subscriptions, and global travel eSIMs. Built to serve individual gamers and wholesale distributors alike with competitive margins and 24/7 automated delivery."}
            </p>
          </header>

          {/* Pillars of Service */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            <article className="p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-2.5">
              <span className="material-symbols-outlined text-primary text-2xl block">bolt</span>
              <h3 className="text-base font-bold text-on-surface">
                {isAr ? "تسليم فوري وتلقائي 24/7" : "Instant 24/7 Delivery"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "معالجة فورية للطلبات عبر نظام ربط آلي مباشر يشحن حسابك في اللعبة أو يولد كود البطاقة لحظياً فور الدفع."
                  : "Automated fulfillment engines process top-ups and generate voucher codes instantly upon order confirmation."}
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-2.5">
              <span className="material-symbols-outlined text-primary text-2xl block">storefront</span>
              <h3 className="text-base font-bold text-on-surface">
                {isAr ? "أسعار جملة للوكلاء والمتاجر" : "Wholesale Rates & API"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "أسعار حصرية وهوامش ربح عالية لأصحاب محلات الألعاب والموزعين، مع دعم كامل للربط البرمجي السريع API."
                  : "Wholesale pricing structures and high profit margins for resellers, supported by robust REST API integration."}
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-2.5">
              <span className="material-symbols-outlined text-primary text-2xl block">verified_user</span>
              <h3 className="text-base font-bold text-on-surface">
                {isAr ? "أمان رسمي وضمان 100%" : "100% Official & Safe"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "شحن رسمي ومعتمد عبر القنوات المعتمدة لحماية حسابات اللاعبين وتأكيد صلاحية كافة الأكواد الرقمية."
                  : "All top-ups and vouchers are sourced directly from authorized channels to safeguard accounts and guarantee validity."}
              </p>
            </article>

            <article className="p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 space-y-2.5">
              <span className="material-symbols-outlined text-primary text-2xl block">support_agent</span>
              <h3 className="text-base font-bold text-on-surface">
                {isAr ? "دعم فني متخصص متواصل" : "24/7 Dedicated Support"}
              </h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "فريق دعم فني متمرس جاهز لمساعدتك وحل أي استفسار عبر التذاكر وقنوات تيليجرام وواتساب على مدار الساعة."
                  : "Expert support engineers ready to assist with order tracking and inquiries via live tickets, Telegram, and WhatsApp."}
              </p>
            </article>
          </div>
        </div>

        {/* Categories Directory with Crawlable Internal Links */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            {isAr ? "الأقسام والخدمات الرقمية المدعومة" : "Supported Digital Categories & Services"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              href={`/${params.lang}/gaming?section=topups`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  sports_esports
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "شحن الألعاب المباشر بالآيدي" : "In-Game Direct Top-Up"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "شحن شدات ببجي موبايل، فري فاير، فالورانت، روبلوكس، كول أوف ديوتي، وتسليم مباشر في حسابك."
                  : "Direct ID fulfillment for PUBG Mobile UC, Free Fire Diamonds, Valorant Points, and Roblox Robux."}
              </p>
            </Link>

            <Link
              href={`/${params.lang}/gaming?section=appStores`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  store
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "بطاقات ومتاجر التطبيقات" : "App Stores & Gift Cards"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "بطاقات جوجل بلاي، أبل آيتونز، بلايستيشن ستور، إكس بوكس وستيم بمختلف العملات والدول."
                  : "Official gift cards for Google Play, Apple iTunes, PlayStation Network, Xbox Live, and Steam."}
              </p>
            </Link>

            <Link
              href={`/${params.lang}/gaming?section=gameCurrency`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  vpn_key
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "أكواد وبطاقات الألعاب الرقمية" : "Game Codes & CD Keys"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "أكواد شحن فورية لألعاب الكمبيوتر، ريزر جولد، باقات الألعاب وقسائم المنصات."
                  : "Instant digital activation codes for PC titles, Razer Gold vouchers, and gaming ecosystem points."}
              </p>
            </Link>

            <Link
              href={`/${params.lang}/gaming?section=subscriptions`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  subscriptions
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "الاشتراكات الرقمية والترفيه" : "Digital Subscriptions"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "تفعيل اشتراك تيليجرام بريميوم، شاهد VIP، وخدمات البث والترفيه بأسعار الجملة."
                  : "Wholesale activations for Telegram Premium, Shahid VIP, streaming passes, and Discord Nitro."}
              </p>
            </Link>

            <Link
              href={`/${params.lang}/gaming?section=esim`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  sim_card
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "شرائح الإنترنت الدولية eSIM" : "Global Travel eSIM Data"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "باقات إنترنت تجوال سريعة تغطي أكثر من 150 دولة لتوفير اتصال سريع أثناء السفر بدون تبديل شريحة."
                  : "High-speed roaming data packages across 150+ countries for seamless connectivity without physical SIM swaps."}
              </p>
            </Link>

            <Link
              href={`/${params.lang}/gaming?section=rewarble`}
              className="p-5 rounded-2xl bg-surface-container/50 hover:bg-surface-container border border-outline-variant/30 transition-all block group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-primary text-2xl group-hover:scale-110 transition-transform">
                  account_balance_wallet
                </span>
                <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">
                  {isAr ? "Rewarble وبطاقات المحافظ" : "Rewarble Digital Vouchers"}
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                {isAr
                  ? "قسائم شحن محافظ إلكترونية وبطاقات مسبقة الدفع متوافقة مع منصات الدفع العالمية."
                  : "Prepaid card vouchers and digital wallet top-up keys compatible with major payment platforms."}
              </p>
            </Link>
          </div>
        </div>

        {/* Structured FAQ Section (Rich Snippet Backed) */}
        <div className="space-y-6">
          <header className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              {isAr
                ? "الأسئلة الشائعة حول خدمات شحن الألعاب والبطاقات"
                : "Frequently Asked Questions (Gaming & Vouchers)"}
            </h2>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              {isAr
                ? "إجابات شاملة لأكثر الأسئلة تداولاً حول الشحن وطرق الدفع والأسعار للوكلاء."
                : "Comprehensive answers to common questions regarding delivery, payment methods, and reseller pricing."}
            </p>
          </header>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <details
                key={`faq-${idx}`}
                className="group p-5 rounded-2xl bg-surface-container/40 border border-outline-variant/30 transition-all open:bg-surface-container/70 open:border-primary/40"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-on-surface group-open:text-primary transition-colors">
                  <span className="leading-snug">{faq.q}</span>
                  <span className="material-symbols-outlined text-lg transition-transform duration-200 group-open:rotate-180 shrink-0 mr-2 ml-2">
                    expand_more
                  </span>
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed border-t border-outline-variant/20 pt-3">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>

        {/* Quick Links & Platform Actions */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-surface-container-high/80 to-surface-container/60 border border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-start">
            <h3 className="text-lg font-extrabold text-on-surface">
              {isAr ? "هل أنت موزع أو صاحب متجر ألعاب؟" : "Are you a retailer or gaming store owner?"}
            </h3>
            <p className="text-xs text-on-surface-variant">
              {isAr
                ? "اشحن محفظتك الآن واستمتع بأسعار الجملة المعتمدة وتنفيذ فوري 24/7 لجميع طلباتك."
                : "Top up your wallet now and benefit from wholesale rates and instant 24/7 order fulfillment."}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              href={`/${params.lang}/wallet`}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold text-xs transition-all shadow-md flex items-center gap-1.5"
            >
              <span>{isAr ? "شحن رصيد المحفظة" : "Top Up Wallet"}</span>
              <span className="material-symbols-outlined text-sm">
                {isAr ? "arrow_back" : "arrow_forward"}
              </span>
            </Link>
            <Link
              href={`/${params.lang}/pricing`}
              className="px-5 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold text-xs transition-all border border-outline-variant/30"
            >
              {isAr ? "قائمة الأسعار الشاملة" : "Full Price List"}
            </Link>
            <Link
              href={`/${params.lang}/orders`}
              className="px-5 py-2.5 rounded-xl bg-surface-container-highest hover:bg-surface-container text-on-surface font-bold text-xs transition-all border border-outline-variant/30"
            >
              {isAr ? "سجل طلباتي" : "My Orders"}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
