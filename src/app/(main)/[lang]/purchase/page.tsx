import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import PurchaseClient from "./PurchaseClient";

export default async function Purchase({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <PurchaseClient lang={params.lang} dict={dict} />
  );
}
