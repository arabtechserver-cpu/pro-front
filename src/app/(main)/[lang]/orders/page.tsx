import { getDictionary } from "@/i18n/get-dictionary";
import { Locale } from "@/i18n/config";
import OrdersClient from "./OrdersClient";

export default async function OrdersPage({ params }: { params: { lang: Locale } }) {
  const dict = await getDictionary(params.lang);

  return (
    <OrdersClient lang={params.lang} dict={dict} />
  );
}
