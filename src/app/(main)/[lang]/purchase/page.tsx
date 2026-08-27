import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PurchaseClient from "./PurchaseClient";
import { Metadata, ResolvingMetadata } from "next";

type Props = {
  params: { lang: Locale };
  searchParams: { serviceId?: string };
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

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const isAr = params.lang === "ar";
  const serviceId = searchParams.serviceId;

  if (serviceId) {
    const service = await getServiceDetails(serviceId);
    if (service) {
      const serviceName = service.name || (isAr ? "طلب خدمة سيرفر" : "Order Server Service");
      const price = service.sellingPrice || service.price || "0";
      const deliveryTime = service.deliveryTime || (isAr ? "1-24 ساعة" : "1-24 Hours");
      const groupName = service.groupName || service.category?.name || "";

      const title = `${serviceName} - $${price} | ${isAr ? "عرب تك برو سيرفر" : "Arab Tech Pro Server"}`;
      const description = isAr
        ? `اطلب خدمة ${serviceName} بسعر $${price} فقط. وقت التسليم: ${deliveryTime}. قسم: ${groupName}. فك رسمي وسريع عبر منصة عرب تك برو سيرفر.`
        : `Order ${serviceName} for only $${price}. Delivery time: ${deliveryTime}. Category: ${groupName}. Fast & official remote phone unlocking from Arab Tech Pro Server.`;

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
  const defaultTitle = isAr ? "طلب خدمة جديدة | عرب تك برو سيرفر" : "Order New Service | Arab Tech Pro Server";
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
          alt: "Arab Tech Pro Server",
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

export default async function Purchase({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <PurchaseClient lang={params.lang} dict={dict} />
  );
}
