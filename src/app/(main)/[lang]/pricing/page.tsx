import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { lang: Locale } }): Promise<Metadata> {
  const isAr = params.lang === "ar";
  const title = isAr ? "قائمة الأسعار والخدمات | عرب تك برو سيرفر" : "Services & Price List | Arab Tech Pro Server";
  const description = isAr
    ? "تصفح قائمة أسعار جميع خدمات فك الشفرات، تخطي حسابات جوجل FRP و iCloud، وتنشيط الدونجلات والبوكسات بأفضل الأسعار وأعلى سرعة تسليم."
    : "Browse our complete catalog and price list for phone unlocking, FRP & iCloud bypass, and tool activations.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://arabtechproserver.tech/${params.lang}/pricing`,
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

export default async function Pricing({ params }: { params: { lang: Locale } }) {
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
