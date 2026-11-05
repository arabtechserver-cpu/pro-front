import { getBrandShareImage } from "@/lib/brand";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PurchaseClient from "./PurchaseClient";
import { Metadata, ResolvingMetadata } from "next";
import { getBackendCandidates } from "@/lib/api-proxy-candidates";

type Props = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ serviceId?: string }>;
};

let cachedServiceApiUrl: string | null = null;

// Function to fetch single service for dynamic SEO Metadata via internal backend candidates
async function getServiceDetails(serviceId: string) {
  const candidates = getBackendCandidates(
    cachedServiceApiUrl,
    process.env.INTERNAL_API_URL,
    process.platform === "win32"
  );
  for (const apiUrl of candidates) {
    try {
      const res = await fetch(`${apiUrl}/api/dhru/services/${encodeURIComponent(serviceId)}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });
      if (!res.ok) continue;
      cachedServiceApiUrl = apiUrl;
      return await res.json();
    } catch {
      if (cachedServiceApiUrl === apiUrl) cachedServiceApiUrl = null;
    }
  }
  return null;
}

export async function generateMetadata(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const isAr = params.lang === "ar";
  const serviceId = searchParams.serviceId;

  if (serviceId) {
    const service = await getServiceDetails(serviceId);
    if (service) {
      const serviceName = service.name || (isAr ? "طلب خدمة سيرفر" : "Order Server Service");
      const calcPrice = service.finalPrice ?? service.price ?? ((Number(service.credit) || 0) + (Number(service.margin) || 0));
      const priceNum = typeof calcPrice === 'number' ? calcPrice : parseFloat(calcPrice) || 0;
      const isFree = priceNum === 0 && (serviceName.toLowerCase().includes("free") || serviceName.includes("مجاني"));
      const priceStr = isFree ? (isAr ? "مجاني" : "Free") : priceNum > 0 ? `${priceNum.toFixed(2)}` : (isAr ? "تواصل معنا" : "Contact Us");
      const deliveryTime = service.time || service.deliveryTime || (isAr ? "1-24 ساعة" : "1-24 Hours");
      const groupName = service.groupName || service.category?.name || "";

      const priceDisplayForTitle = isFree ? (isAr ? "مجاناً" : "Free") : priceNum > 0 ? `$${priceNum.toFixed(2)}` : (isAr ? "سعر خاص" : "Special Price");
      const title = `${serviceName} - ${priceDisplayForTitle}`;
      const description = isAr
        ? `اطلب خدمة ${serviceName} بسعر ${priceStr} فقط. وقت التسليم: ${deliveryTime}. قسم: ${groupName}. فك رسمي وسريع عبر منصة عرب تك برو سيرفر.`
        : `Order ${serviceName} for only ${priceStr}. Delivery time: ${deliveryTime}. Category: ${groupName}. Fast & official remote phone unlocking from Arab Tech Pro Server.`;

      const pageUrl = `https://arabtechproserver.tech/${params.lang}/purchase?serviceId=${serviceId}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: pageUrl,
          siteName: "Arab Tech Pro Server",
          images: [
            {
              url: getBrandShareImage(params.lang),
              width: 1200,
              height: 630,
              alt: serviceName,
            },
          ],
          locale: isAr ? "ar_AR" : "en_US",
          type: "website",
        },
        twitter: {
          card: "summary_large_image",
          title,
          description,
          images: [getBrandShareImage(params.lang)],
        },
      };
    }
  }

  // Default Purchase Page Metadata
  const defaultTitle = isAr ? "طلب خدمة وتفعيل فوري" : "Order New Service";
  const defaultDesc = isAr
    ? "اختر واطلب خدمات فك الشبكات، تخطي الآيكلود وFRP، وشراء رصيد البوكسات والدونجلات عبر سيرفر عرب تك برو (عرب تك برو سيرفر) بأفضل الأسعار وأسرع وقت."
    : "Choose and order network unlock services, iCloud & FRP bypass, and server credits at the best rates.";

  return {
    metadataBase: new URL("https://arabtechproserver.tech"),
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `https://arabtechproserver.tech/${params.lang}/purchase`,
      images: [
        {
          url: getBrandShareImage(params.lang),
          width: 1200,
          height: 630,
          alt: "Arab Tech Pro Server",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: [getBrandShareImage(params.lang)],
    },
  };
}

export default async function Purchase(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang);

  return (
    <PurchaseClient lang={params.lang} dict={dict} />
  );
}
