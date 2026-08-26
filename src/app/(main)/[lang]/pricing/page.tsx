import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PricingClient from "./PricingClient";

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
