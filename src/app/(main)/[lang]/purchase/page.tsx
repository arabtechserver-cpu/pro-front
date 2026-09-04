import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PurchaseClient from "./PurchaseClient";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: Promise<{ lang: Locale }>;
  searchParams: Promise<{ serviceId?: string }>;
};

// Function to fetch single service for dynamic SEO Metadata
async function getServiceDetails(serviceId: string) {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "https://arabtechproserver.tech";
    const res = await fetch(`${apiUrl}/api/dhru/services/${serviceId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
  }
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
      const title = `${serviceName} - ${priceDisplayForTitle} | ${isAr ? "سيرفر الوفاق" : "Al-Wefaq Server"}`;
      const description = isAr
        ? `اطلب خدمة ${serviceName} بسعر ${priceStr} فقط. وقت التسليم: ${deliveryTime}. قسم: ${groupName}. فك رسمي وسريع عبر منصة سيرفر الوفاق.`
        : `Order ${serviceName} for only ${priceStr}. Delivery time: ${deliveryTime}. Category: ${groupName}. Fast & official remote phone unlocking from Al-Wefaq Server.`;

      const pageUrl = `https://arabtechproserver.tech/${params.lang}/purchase?serviceId=${serviceId}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: pageUrl,
          siteName: "Al-Wefaq Server",
          images: [
            {
              url: "https://arabtechproserver.tech/images/og-image.png",
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
          images: ["https://arabtechproserver.tech/images/og-image.png"],
        },
      };
    }
  }

  // Default Purchase Page Metadata
  const defaultTitle = isAr ? "طلب خدمة جديدة | سيرفر الوفاق" : "Order New Service | Al-Wefaq Server";
  const defaultDesc = isAr
    ? "اختر واطلب خدمات فك الشبكات، تخطي الآيكلود وFRP، وشراء رصيد البوكسات والدونجلات بأفضل الأسعار وأسرع وقت."
    : "Choose and order network unlock services, iCloud & FRP bypass, and server credits at the best rates.";

  return {
    title: defaultTitle,
    description: defaultDesc,
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: `https://arabtechproserver.tech/${params.lang}/purchase`,
      images: [
        {
          url: "https://arabtechproserver.tech/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "Al-Wefaq Server",
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDesc,
      images: ["https://arabtechproserver.tech/images/og-image.png"],
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
