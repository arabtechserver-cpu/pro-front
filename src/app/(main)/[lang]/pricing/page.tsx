import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";
import { Metadata } from "next";

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
  const section = typeof rawSection === "string" ? rawSection : undefined;

  const title = section 
    ? (isAr ? `${section} - أسعار وخدمات | عرب تك برو سيرفر` : `${section} - Services & Price List | Arab Tech Pro Server`)
    : (isAr ? "قائمة الأسعار والخدمات | عرب تك برو سيرفر" : "Services & Price List | Arab Tech Pro Server");

  const description = section
    ? (isAr 
        ? `تصفح أسعار وخدمات قسم "${section}" المتاحة على منصة عرب تك برو سيرفر مع التسليم الفوري وأقوى الخصومات.` 
        : `Explore ${section} services and real-time live prices on Arab Tech Pro Server with instant 24/7 delivery.`)
    : (isAr
        ? "تصفح قائمة أسعار جميع خدمات فك الشفرات، تخطي حسابات جوجل FRP و iCloud، وتنشيط الدونجلات والبوكسات بأفضل الأسعار وأعلى سرعة تسليم."
        : "Browse our complete catalog and price list for phone unlocking, FRP & iCloud bypass, and tool activations.");

  const currentUrl = `https://arabtechproserver.tech/${params.lang}/pricing${section ? `?section=${encodeURIComponent(section)}` : ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: currentUrl,
      images: [{ url: "https://arabtechproserver.tech/images/og-image.png" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["https://arabtechproserver.tech/images/og-image.png"],
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
