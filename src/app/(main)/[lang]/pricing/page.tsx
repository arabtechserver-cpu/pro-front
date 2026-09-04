import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";
import { Metadata } from "next";

async function fetchPricingServices(): Promise<any[]> {
  const backendCandidates = [
    process.env.INTERNAL_API_URL,
    "http://pro-b-i0r2xu:5000",
    "http://backend:5000",
    "http://pro-back:5000",
    "http://127.0.0.1:5000",
    "http://localhost:5000"
  ].filter(Boolean);

  for (const base of backendCandidates) {
    try {
      const res = await fetch(`${base}/api/dhru/services?view=pricing`, {
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
    } catch {
      // try next candidate
    }
  }
  return [];
}

export async function generateMetadata(
  props: {
    params: Promise<{ lang: Locale }>;
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const isAr = params.lang === "ar";
  const rawSection = searchParams?.section || searchParams?.group || searchParams?.cat || searchParams?.search;
  let section = typeof rawSection === "string" ? rawSection : undefined;

  if (section) {
    try {
      section = decodeURIComponent(section);
    } catch {
      // ignore
    }
    section = section.replace(/^%20/, '').trim();
  }

  let title = isAr ? "قائمة الأسعار والخدمات | عرب تك برو سيرفر" : "Services & Price List | Arab Tech Pro Server";
  let description = isAr
    ? "تصفح قائمة أسعار جميع خدمات فك الشفرات، تخطي حسابات جوجل FRP و iCloud، وتنشيط الدونجلات والبوكسات بأفضل الأسعار وأعلى سرعة تسليم."
    : "Browse our complete catalog and price list for phone unlocking, FRP & iCloud bypass, and tool activations.";

  if (section) {
    const categories = await fetchPricingServices();
    const targetLower = section.toLowerCase();
    const matchingServices: any[] = [];

    for (const cat of categories) {
      for (const s of (cat.services || [])) {
        if (!s.isActive) continue;
        const gName = (s.groupName || '').trim().toLowerCase();
        const sName = (s.name || '').trim().toLowerCase();
        if (gName === targetLower || gName.includes(targetLower) || targetLower.includes(gName) || sName.includes(targetLower)) {
          matchingServices.push(s);
        }
      }
    }

    if (matchingServices.length > 0) {
      const count = matchingServices.length;
      title = isAr
        ? `${section} (${count} خدمات وأسعار) | عرب تك برو سيرفر`
        : `${section} (${count} Services & Prices) | Arab Tech Pro Server`;

      const serviceListFormatted = matchingServices
        .slice(0, 8)
        .map((s) => {
          const rawPrice = s.credit !== undefined ? Number((s.credit + (s.margin || 0)).toFixed(2)) : 0;
          const priceStr = rawPrice > 0 ? `$${rawPrice.toFixed(2)}` : (isAr ? 'سعر خاص' : 'Special');
          return `${s.name} [${priceStr}]`;
        })
        .join(" • ");

      description = isAr
        ? `أسعار باقة ${section} (${count} خدمات): ${serviceListFormatted}${matchingServices.length > 8 ? ' • والمزيد...' : ''} | تسليم فوري وتفعيل تلقائي 24/7 على منصة عرب تك برو سيرفر.`
        : `Live prices for ${section} (${count} services): ${serviceListFormatted}${matchingServices.length > 8 ? ' • and more...' : ''} | Instant delivery 24/7 on Arab Tech Pro Server.`;
    } else {
      title = isAr ? `${section} - أسعار وخدمات | عرب تك برو سيرفر` : `${section} - Services & Price List | Arab Tech Pro Server`;
      description = isAr
        ? `تصفح أسعار وخدمات قسم "${section}" المتاحة على منصة عرب تك برو سيرفر مع التسليم الفوري وأقوى الخصومات.`
        : `Explore ${section} services and real-time live prices on Arab Tech Pro Server with instant 24/7 delivery.`;
    }
  }

  const currentUrl = `https://arabtechproserver.tech/${params.lang}/pricing${section ? `?section=${encodeURIComponent(section)}` : ''}`;

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title,
    description,
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: isAr ? "عرب تك برو سيرفر - Arab Tech Pro Server" : "Arab Tech Pro Server",
      images: [
        {
          url: "https://arabtechproserver.tech/main-logo.png",
          width: 512,
          height: 512,
          alt: "Arab Tech Pro Server Logo",
        },
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
      card: "summary",
      title,
      description,
      images: ["https://arabtechproserver.tech/main-logo.png"],
    },
  };
}

export default async function Pricing(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-4">
        <div>
          <h1 className="font-display-lg-mobile text-4xl font-bold text-on-surface mb-2">{dict.pricing.title}</h1>
          <p className="text-on-surface-variant max-w-2xl">
            {dict.pricing.subtitle}
          </p>
        </div>
      </div>

      {/* Pricing Client List (Includes Search and Filters) */}
      <PricingClient lang={params.lang} dict={dict} />
    </div>
  );
}
